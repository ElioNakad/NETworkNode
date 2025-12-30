const express = require("express");
const router = express.Router();
const descriptionController = require("../controllers/description.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/get-default",
  authMiddleware,
  descriptionController.getDefaultDescriptions
);

router.get(
  "/:contactId",
  authMiddleware,
  descriptionController.getDescriptions
);


router.post("/", descriptionController.insertDescriptions);

router.post(
  "/set-default",
  authMiddleware,
  descriptionController.insertDefaultDescriptions
);

module.exports = router;
