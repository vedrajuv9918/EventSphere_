function coerceBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value === "true" || value === "1" || value.toLowerCase() === "on";
  }
  if (typeof value === "number") return value === 1;
  return fallback;
}

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

exports.getEventSettings = async (req, res) => {
  try {
    const event = await loadHostEvent(req.params.id, req.user._id);
    res.json({
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        status: event.status,
        adminRejected: event.adminRejected,
        rejectReason: event.rejectReason,
      },
      settings: {
        isActive: event.isActive,
        registrationDeadline: toDateInputValue(event.registrationDeadline),
        oneSeatPerUser: event.oneSeatPerUser,
        allowCancellation: event.allowCancellation,
        enableReminders: event.enableReminders,
        maxTicketsPerUser: event.teamLimit || 1,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Unable to load settings" });
  }
};

exports.updateEventSettings = async (req, res) => {
  try {
    const event = await loadHostEvent(req.params.id, req.user._id);
    const body = req.body || {};

    const boolFields = [
      { key: "isActive", target: "isActive" },
      { key: "oneSeatPerUser", target: "oneSeatPerUser" },
      { key: "allowCancellation", target: "allowCancellation" },
      { key: "enableReminders", target: "enableReminders" },
    ];

    boolFields.forEach(({ key, target }) => {
      if (body[key] !== undefined) {
        event[target] = coerceBoolean(body[key], event[target]);
      }
    });

    if (body.registrationDeadline !== undefined) {
      event.registrationDeadline = body.registrationDeadline
        ? new Date(body.registrationDeadline)
        : null;
    }

    if (body.maxTicketsPerUser !== undefined) {
      const limit = Number(body.maxTicketsPerUser);
      event.teamLimit = Number.isNaN(limit) || limit <= 0 ? 1 : limit;
      event.oneSeatPerUser = event.teamLimit === 1 ? event.oneSeatPerUser : false;
    }

    await event.save();

    res.json({
      success: true,
      message: "Settings updated",
      settings: {
        isActive: event.isActive,
        registrationDeadline: toDateInputValue(event.registrationDeadline),
        oneSeatPerUser: event.oneSeatPerUser,
        allowCancellation: event.allowCancellation,
        enableReminders: event.enableReminders,
        maxTicketsPerUser: event.teamLimit || 1,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Unable to update settings" });
  }
};
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Ticket = require("../models/Ticket");

async function loadHostEvent(eventId, hostId) {
  const event = await Event.findOne({ _id: eventId, hostId });
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  return event;
}

exports.createEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    const teamConfig = payload.teamConfig || {
      minSize: payload.teamMinSize,
      maxSize: payload.teamMaxSize,
      allowIndividual: payload.allowIndividual ?? true,
    };

    const event = await Event.create({
      title: payload.title,
      description: payload.description,
      date: payload.date,
      endDate: payload.endDate,
      venue: payload.venue,
      locationType: payload.locationType,
      type: payload.type,
      teamLimit: payload.teamLimit,
      teamConfig,
      category: payload.category,
      tags: payload.tags,
      agenda: payload.agenda,
      ticketPrice: payload.ticketPrice,
      currency: payload.currency,
      maxAttendees: payload.maxAttendees,
      registrationDeadline: payload.registrationDeadline,
      imageUrl: payload.imageUrl,
      posterUrl: payload.posterUrl,
      galleryImages: payload.galleryImages || [],
      oneSeatPerUser: payload.oneSeatPerUser,
      allowCancellation: payload.allowCancellation,
      enableReminders: payload.enableReminders,
      hostId: req.user._id,
      hostName: req.user.name,
      approved: false,
      adminRejected: false,
      rejectReason: null,
      status: "pending",
    });

    res.json({ success: true, message: "Event submitted for approval", event });
  } catch (err) {
    console.error("Create event error", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await loadHostEvent(req.params.id, req.user._id);
    const updates = req.body || {};

    if (event.approved) {
      // allow limited fields after approval
      const allowed = ["imageUrl", "posterUrl", "galleryImages", "agenda"];
      allowed.forEach((field) => {
        if (updates[field] !== undefined) {
          event[field] = updates[field];
        }
      });
    } else {
      Object.assign(event, updates);
    }

    event.adminRejected = false;
    event.rejectReason = null;
    event.status = "pending";
    event.approved = false;

    await event.save();
    res.json({ success: true, message: "Event updated and awaiting review", event });
  } catch (err) {
    console.error("Update event error", err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to update event" });
  }
};

exports.getHostEvents = async (req, res) => {
  try {
    const events = await Event.find({ hostId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch events" });
  }
};

exports.getRegistrationsForEvent = async (req, res) => {
  try {
    await loadHostEvent(req.params.eventId, req.user._id);
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Unable to fetch registrations" });
  }
};

exports.toggleEventActive = async (req, res) => {
  try {
    const event = await loadHostEvent(req.params.id, req.user._id);
    event.isActive = !event.isActive;
    await event.save();
    res.json({ success: true, isActive: event.isActive });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Unable to toggle event" });
  }
};

exports.getEventInsights = async (req, res) => {
  try {
    const event = await loadHostEvent(req.params.eventId, req.user._id);
    const registrations = await Registration.find({ event: event._id, registrationStatus: "confirmed" });
    const tickets = await Ticket.find({ event: event._id });

    const data = {
      eventId: event._id,
      title: event.title,
      status: event.status,
      totalRegistrations: registrations.length,
      seatsFilled: registrations.reduce((sum, reg) => sum + (reg.seats || 0), 0),
      maxAttendees: event.maxAttendees,
      revenue: registrations.reduce((sum, reg) => sum + (reg.amountPaid || 0), 0),
      ticketsGenerated: tickets.length,
      attendees: registrations.map((reg) => ({
        id: reg._id,
        name: reg.user?.name,
        email: reg.user?.email,
        seats: reg.seats,
        ticketId: reg.ticketId,
        paymentStatus: reg.paymentStatus,
        registrationStatus: reg.registrationStatus,
      })),
    };

    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Unable to load insights" });
  }
};

exports.exportRegistrationsCSV = async (req, res) => {
  try {
    await loadHostEvent(req.params.eventId, req.user._id);
    const registrations = await Registration.find({ event: req.params.eventId }).populate(
      "user",
      "name email phone"
    );

    const rows = [
      ["Name", "Email", "Phone", "Seats", "Team Name", "Payment Status", "Ticket ID"].join(","),
      ...registrations.map((reg) =>
        [
          reg.user?.name || "",
          reg.user?.email || "",
          reg.user?.phone || "",
          reg.seats,
          reg.teamName || "",
          reg.paymentStatus,
          reg.ticketId || "",
        ]
          .map((val) => `"${(val ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const csv = "\ufeff" + rows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
    res.send(csv);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Unable to export CSV" });
  }
};
