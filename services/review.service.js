const reviewModel = require("../models/review.model");

const insertReview=async(user_id,default_description_id,review)=>{
  return reviewModel.insertReview(user_id,default_description_id,review)
}

const fetchReviews = async (labelId) => {
  return reviewModel.fetchReviews(labelId);
};


module.exports={
    insertReview,
    fetchReviews
}