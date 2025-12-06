const router = require("express").Router();
const ticketCtrl = require("../controllers/ticketController");

router.get("/:ticketId", ticketCtrl.getTicket);
router.get("/validate/:ticketId", ticketCtrl.validateTicket);
router.post("/mark-used/:ticketId", ticketCtrl.markUsed);

module.exports = router;
