const express = require("express");
const router = express.Router();
const descriptionController = require("../controllers/description.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/:contactId",
  authMiddleware,
  descriptionController.getDescriptions
);

router.post("/", descriptionController.insertDescriptions);

module.exports = router;
