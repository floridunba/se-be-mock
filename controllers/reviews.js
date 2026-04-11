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