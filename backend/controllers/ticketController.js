const Ticket = require("../models/Ticket");
const Registration = require("../models/Registration");

exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
      .populate("user")
      .populate("event");

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    res.json({
      ticketId: ticket.ticketId,
      user: ticket.user,
      event: ticket.event,
      seats: ticket.seats,
      qrCode: ticket.qrCode,
      status: ticket.status,
      createdAt: ticket.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch ticket" });
  }
};

exports.validateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.status !== "active") {
      return res.status(400).json({ error: "Ticket is no longer active" });
    }

    const registration = await Registration.findOne({ ticketId: ticket.ticketId })
      .populate("user", "name email")
      .populate("event", "title date venue");

    res.json({
      valid: true,
      registration,
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to validate ticket" });
  }
};

exports.markUsed = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    ticket.status = "used";
    await ticket.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Unable to update ticket" });
  }
};
