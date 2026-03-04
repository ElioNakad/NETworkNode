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

router.get(
  "/get-private/:contactId",
  authMiddleware,
  descriptionController.getPrivateDescriptions
);

router.get(
  "/default/:phone",
  authMiddleware,
  descriptionController.getDefaultDescriptionsForContact
);

router.post("/", descriptionController.insertDescriptions);

router.post("/insert-private", descriptionController.insertPrivateDescriptions);


router.post(
  "/set-default",
  authMiddleware,
  descriptionController.insertDefaultDescriptions
);

// 🔴 DELETE MANUAL DESCRIPTION
router.delete(
  "/manual/:id",
  authMiddleware,
  descriptionController.deleteManualDescription
);

router.delete(
  "/delete-private/:id",
  authMiddleware,
  descriptionController.deletePrivateDescription
);

router.delete(
  "/default/:id",
  authMiddleware,
  descriptionController.deleteDefaultDescription
);

module.exports = router;
