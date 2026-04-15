const Review = require('../models/Review');
const Campground = require('../models/Campground');

exports.getReviews = async (req, res, next) => {
  let query;
  if (req.params.campgroundId) {
    console.log(req.params.campgroundId)
    if(req.user && req.user.role === "user"){
      query = Review.find({
        user: req.user.id,
        campground: req.params.campgroundId
      }).populate("user", "_id name");
    }
    else {
      query = Review.find({
        campground: req.params.campgroundId
      }).populate("user", "_id name");
    }
  }
  else {
    if(req.user.role !== 'admin'){
        query = Review.find({user:req.user.id});
    } else {
      query = Review.find({}).populate("user", "_id name");
    }
  }
  try {
    const reviews = await query;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch(err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot find Booking"
    })
  }
}