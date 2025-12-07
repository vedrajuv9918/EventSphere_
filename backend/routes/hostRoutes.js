const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const hostCtrl = require("../controllers/hostController");

router.post("/create", auth, allowRoles("host"), hostCtrl.createEvent);
router.put("/event/:id", auth, allowRoles("host"), hostCtrl.updateEvent);
router.put("/event/toggle/:id", auth, allowRoles("host"), hostCtrl.toggleEventActive);
router.get("/my-events", auth, allowRoles("host"), hostCtrl.getHostEvents);
router.get("/registrations/:eventId", auth, allowRoles("host"), hostCtrl.getRegistrationsForEvent);
router.get("/event/insights/:eventId", auth, allowRoles("host"), hostCtrl.getEventInsights);
router.get("/event/export/:eventId", auth, allowRoles("host"), hostCtrl.exportRegistrationsCSV);
router.get("/event/:id/settings", auth, allowRoles("host"), hostCtrl.getEventSettings);
router.put("/event/:id/settings", auth, allowRoles("host"), hostCtrl.updateEventSettings);

module.exports = router;
