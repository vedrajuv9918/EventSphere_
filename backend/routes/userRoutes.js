const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const userCtrl = require("../controllers/userController");

router.get("/me", auth, userCtrl.getMe);
router.put("/profile", auth, userCtrl.updateProfile);
router.post(
  "/profile/photo",
  auth,
  upload.single("image"),
  userCtrl.uploadProfilePhoto
);

module.exports = router;
