const Review = require('../models/Review');
const Campground = require('../models/Campground');

exports.createReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        review = await Review.create({
            rating,
            comment,
            campground: req.params.campgroundId,
            user: req.user.id
        });


        if (review) {
            review.rating = rating;
            review.comment = comment;
            await review.save();
        } else {
            review = await Review.create({
                rating,
                comment,
                campground: req.params.campgroundId,
                user: req.user.id
            });
        }

        const campground = await Campground.findById(req.params.campgroundId);

        const reviews = await Review.find({
            campground: req.params.campgroundId
        });

        campground.totalReviews = reviews.length;

        campground.averageRating =
            reviews.reduce((acc, item) => acc + item.rating, 0) /
            reviews.length;

        await campground.save();

        res.status(200).json({
            success: true,
            data: review
        });

    } catch (err) {
        next(err);
    }
};

exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    if(req.user.role !== "admin" && review.user.toString() !== req.user.id){
      return res.status(400).json({success: false});
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      reunValidators: true
    })

    return res.status(200).json({
      success: true,
      data: review
    })
  } catch(err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Can not update review"
    })
  }
}

exports.deleteReview = async (req, res, next) => {
try {
    const review = await Review.findById(req.params.id);
    if(req.user.role !== "admin" && review.user.toString() !== req.user.id){
      return res.status(400).json({success: false});
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      data: {}
    })
  } catch(err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Can not delete review"
    })
  }
}