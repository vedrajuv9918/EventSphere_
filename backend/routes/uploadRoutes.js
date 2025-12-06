const router = require("express").Router();
const upload = require("../middleware/uploadMiddleware");
const uploadCtrl = require("../controllers/uploadController");

router.post("/image", upload.single("image"), uploadCtrl.uploadImage);

module.exports = router;
