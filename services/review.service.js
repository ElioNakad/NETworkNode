const reviewModel = require("../models/review.model");

const insertReview=async(user_id,default_description_id,review)=>{
  return reviewModel.insertReview(user_id,default_description_id,review)
}

const fetchReviews = async (labelId) => {
  return reviewModel.fetchReviews(labelId);
};

const deleteReview = async (review_id, user_id) => {
  return reviewModel.deleteReview(review_id, user_id);
};

module.exports={
    insertReview,
    fetchReviews,
    deleteReview
}