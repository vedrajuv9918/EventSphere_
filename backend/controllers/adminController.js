const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

async function syncStatus(event) {
  if (!event) return;
  const now = new Date();
  let changed = false;

  if (event.date && event.date < now && event.status !== "completed") {
    event.status = "completed";
    event.isActive = false;
    changed = true;
  } else if (event.adminRejected && event.status !== "rejected") {
    event.status = "rejected";
    changed = true;
  } else if (event.approved && !event.adminRejected && event.status !== "approved") {
    event.status = "approved";
    changed = true;
  } else if (!event.approved && !event.adminRejected && event.status !== "pending") {
    event.status = "pending";
    changed = true;
  }

  if (changed) {
    event.autoStatusUpdatedAt = new Date();
    await event.save();
  }
}

exports.getAdminEvents = async (req, res) => {
  try {
    const statusFilter = req.query.status;
    const query = {};

    if (statusFilter) {
      query.status = statusFilter;
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .populate("hostId", "name email phone role profilePic");
    await Promise.all(events.map(syncStatus));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch admin events" });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    event.approved = true;
    event.adminRejected = false;
    event.rejectReason = null;
    event.status = "approved";
    event.reviewHistory.push({
      reviewer: req.user._id,
      status: "approved",
      note: req.body?.note,
      reviewedAt: new Date(),
    });
    await event.save();

    res.json({ message: "Event approved", event });
  } catch (err) {
    res.status(500).json({ error: "Unable to approve event" });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    event.approved = false;
    event.adminRejected = true;
    event.rejectReason = reason || "Not specified";
    event.status = "rejected";
    event.reviewHistory.push({
      reviewer: req.user._id,
      status: "rejected",
      note: event.rejectReason,
      reviewedAt: new Date(),
    });
    await event.save();

    res.json({ message: "Event rejected", event });
  } catch (err) {
    res.status(500).json({ error: "Unable to reject event" });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    event.status = status;
    if (status === "approved") {
      event.approved = true;
      event.adminRejected = false;
      event.rejectReason = null;
    } else if (status === "rejected") {
      event.approved = false;
      event.adminRejected = true;
      event.rejectReason = req.body.reason || event.rejectReason;
    }
    await event.save();
    res.json({ message: "Status updated", event });
  } catch (err) {
    res.status(500).json({ error: "Unable to update status" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalRegistrations, pendingEvents, approvedEvents, rejectedEvents] =
      await Promise.all([
        User.countDocuments(),
        Event.countDocuments(),
        Registration.countDocuments(),
        Event.countDocuments({ status: "pending" }),
        Event.countDocuments({ status: "approved" }),
        Event.countDocuments({ status: "rejected" }),
      ]);

    const registrationTrend = await Registration.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totals: {
        users: totalUsers,
        events: totalEvents,
        registrations: totalRegistrations,
      },
      eventsByStatus: {
        pending: pendingEvents,
        approved: approvedEvents,
        rejected: rejectedEvents,
      },
      registrationTrend,
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to load stats" });
  }
};
