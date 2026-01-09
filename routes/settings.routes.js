const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// 🔐 Protected routes
router.get("/get-user", authMiddleware, settingsController.fetchUser);
router.put("/update-user", authMiddleware, settingsController.updateUser);
router.put(
  "/update-cv",
  authMiddleware,
  upload.single("cv"),
  settingsController.updateCV
);
module.exports = router;
