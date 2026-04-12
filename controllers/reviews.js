const Review = require('../models/Review');
const Campground = require('../models/Campground');

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
        campground: req.params.campgroundId
      }); // get campground reviews

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