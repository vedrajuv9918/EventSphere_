const crypto = require("crypto");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Ticket = require("../models/Ticket");
const { generateQRBase64 } = require("../utils/generateQR");

const TEAM_DEFAULTS = {
  minSize: 1,
  maxSize: 1,
  allowIndividual: true,
};

function buildTeamConfig(event) {
  const legacyMax = event.teamLimit || 1;
  return {
    ...TEAM_DEFAULTS,
    ...(event.teamConfig?.toObject ? event.teamConfig.toObject() : event.teamConfig),
    maxSize: Math.max(
      TEAM_DEFAULTS.maxSize,
      event.teamConfig?.maxSize || legacyMax || TEAM_DEFAULTS.maxSize
    ),
  };
}

function seatsAvailable(event) {
  if (!event.maxAttendees) return Infinity;
  return Math.max(event.maxAttendees - (event.currentAttendees || 0), 0);
}

async function syncEventStatus(event) {
  if (!event) return event;
  const now = new Date();
  let updated = false;

  if (event.date && event.date < now && event.status !== "completed") {
    event.status = "completed";
    event.isActive = false;
    updated = true;
  } else if (event.adminRejected && event.status !== "rejected") {
    event.status = "rejected";
    updated = true;
  } else if (event.approved && !event.adminRejected && event.status !== "approved") {
    event.status = "approved";
    updated = true;
  } else if (!event.approved && !event.adminRejected && event.status !== "pending") {
    event.status = "pending";
    updated = true;
  }

  if (updated) {
    event.autoStatusUpdatedAt = new Date();
    await event.save();
  }

  return event;
}

function normalizeTeamMembers(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  // handle serialized JSON
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }
  return [];
}

exports.getAllEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({
      adminRejected: { $ne: true },
      $or: [{ approved: true }, { date: { $gte: now } }],
    }).sort({ date: 1 });
    const synced = await Promise.all(events.map((evt) => syncEventStatus(evt)));
    res.json(synced);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch events" });
  }
};

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ approved: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(6);
    const synced = await Promise.all(events.map((evt) => syncEventStatus(evt)));
    res.json(synced);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch featured events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    await syncEventStatus(event);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch event" });
  }
};

exports.getTeamSizeInfo = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const config = buildTeamConfig(event);
    res.json({
      type: event.type,
      minSize: config.minSize,
      maxSize: config.maxSize,
      allowIndividual: config.allowIndividual,
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch team limits" });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate("event")
      .sort({ createdAt: -1 });

    const ticketIds = registrations.map((reg) => reg.ticketId).filter(Boolean);
    const tickets = await Ticket.find({ ticketId: { $in: ticketIds } }).lean();
    const ticketMap = tickets.reduce((acc, ticket) => {
      acc[ticket.ticketId] = ticket;
      return acc;
    }, {});

    const payload = registrations.map((reg) => ({
      id: reg._id,
      event: reg.event,
      ticketId: reg.ticketId,
      seats: reg.seats,
      registrationStatus: reg.registrationStatus,
      paymentStatus: reg.paymentStatus,
      ticket: ticketMap[reg.ticketId] || null,
      createdAt: reg.createdAt,
    }));

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch registrations" });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const {
      contact,
      phone,
      seats = 1,
      special,
      paymentStatus = "success",
      paymentReference,
      teamName,
      teamMembers,
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    await syncEventStatus(event);

    if (!event.isActive || !event.approved || event.status !== "approved") {
      return res.status(400).json({ message: "Event is not open for registration" });
    }

    const now = new Date();
    if (event.registrationDeadline && event.registrationDeadline < now) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }
    if (event.date && event.date < now) {
      return res.status(400).json({ message: "Event already completed" });
    }

    if (event.oneSeatPerUser) {
      const existing = await Registration.findOne({
        event: event._id,
        user: req.user._id,
        registrationStatus: { $ne: "cancelled" },
      });
      if (existing) {
        return res.status(400).json({ message: "You have already registered for this event" });
      }
    }

    if (paymentStatus !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const config = buildTeamConfig(event);
    const normalizedMembers = normalizeTeamMembers(teamMembers);
    let requestedSeats = Number(seats) || 1;

    if (event.type === "team") {
      requestedSeats = normalizedMembers.length || requestedSeats;
      if (requestedSeats < config.minSize || requestedSeats > config.maxSize) {
        return res.status(400).json({
          message: `Team size must be between ${config.minSize} and ${config.maxSize}`,
        });
      }
    } else if (event.oneSeatPerUser) {
      requestedSeats = 1;
    }

    if (requestedSeats <= 0) requestedSeats = 1;

    if (event.maxAttendees && requestedSeats > seatsAvailable(event)) {
      return res.status(400).json({ message: "Not enough seats left" });
    }

    const ticketId = `EVT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const qrPayload = JSON.stringify({
      ticketId,
      eventId: event._id,
      userId: req.user._id,
    });
    const qrCode = await generateQRBase64(qrPayload);

    const registration = await Registration.create({
      user: req.user._id,
      event: event._id,
      seats: requestedSeats,
      contact,
      phone,
      email: req.user.email,
      special,
      paymentStatus,
      paymentReference,
      amountPaid: requestedSeats * (event.ticketPrice || 0),
      registrationStatus: "confirmed",
      teamName,
      teamMembers: normalizedMembers,
      ticketId,
    });

    await Ticket.create({
      ticketId,
      user: req.user._id,
      event: event._id,
      seats: requestedSeats,
      qrCode,
      qrPayload,
    });

    event.currentAttendees = (event.currentAttendees || 0) + requestedSeats;
    event.analytics = {
      ...(event.analytics?.toObject ? event.analytics.toObject() : event.analytics),
      totalRegistrations: ((event.analytics && event.analytics.totalRegistrations) || 0) + 1,
      totalTickets: ((event.analytics && event.analytics.totalTickets) || 0) + requestedSeats,
      totalRevenue:
        ((event.analytics && event.analytics.totalRevenue) || 0) +
        requestedSeats * (event.ticketPrice || 0),
      lastRegistrationAt: new Date(),
    };
    await event.save();

    res.json({
      success: true,
      message: "Registered successfully",
      ticketId,
      qrCode,
      registrationId: registration._id,
    });
  } catch (err) {
    console.error("Registration error", err);
    res.status(500).json({ error: "Registration failed" });
  }
};
