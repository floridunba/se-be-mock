const express = require('express');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviews');

const router = express.Router({ mergeParams: true} )
const {protect, authorize}=require('../middleware/auth');

router.route('/').get(getReviews).post(protect, createReview);
router.route('/user').get(protect, authorize('admin', 'user'), getReviews);
router.route('/:campgroundId').get(protect, authorize('admin', 'user'), getReviews);

router.route('/:id').put(protect, authorize('admin', 'user'), updateReview).delete(protect, authorize('admin', 'user'), deleteReview);

module.exports=router