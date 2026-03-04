const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  reviewer_id: Number,
  default_description_id: Number,
  review: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Review", ReviewSchema);