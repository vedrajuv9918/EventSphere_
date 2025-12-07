const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const eventCtrl = require("../controllers/eventController");

router.get("/", eventCtrl.getAllEvents);
router.get("/featured", eventCtrl.getFeaturedEvents);
router.get("/team-size/:id", eventCtrl.getTeamSizeInfo);
router.get("/my-registrations", auth, eventCtrl.getMyRegistrations);
router.get("/:id", eventCtrl.getEventById);
router.post("/:id/register", auth, eventCtrl.registerForEvent);

module.exports = router;
