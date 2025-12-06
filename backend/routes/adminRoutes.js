const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const adminCtrl = require("../controllers/adminController");

router.get("/events", auth, allowRoles("admin"), adminCtrl.getAdminEvents);
router.put("/event/approve/:id", auth, allowRoles("admin"), adminCtrl.approveEvent);
router.put("/event/reject/:id", auth, allowRoles("admin"), adminCtrl.rejectEvent);
router.put("/event/status/:id", auth, allowRoles("admin"), adminCtrl.updateEventStatus);
router.get("/stats", auth, allowRoles("admin"), adminCtrl.getStats);

module.exports = router;
