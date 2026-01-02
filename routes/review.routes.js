const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/insert-review",
  authMiddleware,
  reviewController.insertReview
);

router.get(
  "/my-reviews",
  authMiddleware,
  reviewController.getMyReviews
);

module.exports = router;
