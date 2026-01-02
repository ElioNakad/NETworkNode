const reviewService = require("../services/review.service");

exports.insertReview = async (req, res) => {
  console.log("INSERT userId:", req.user.userId);

  try {
    const { default_description_id, review } = req.body;
    const users_id = req.user.userId;

    if (!default_description_id || !review) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const id = await reviewService.insertReview(
      users_id,
      default_description_id,
      review
    );

    res.json({ id, message: "Review saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMyReviews = async (req, res) => {
  try {
    const { labelId } = req.query;

    if (!labelId) {
      return res.status(400).json({ message: "labelId is required" });
    }

    const reviews = await reviewService.fetchReviews(labelId);

    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
