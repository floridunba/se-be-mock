const express = require('express');
const { getReviews } = require('../controllers/reviews');
const { createReview, updateReview, deleteReview } = require('../controllers/reviews');

router.route('/').get(getReviews).post(protect, createReview);
router.route('/user').get(protect, authorize('admin', 'user'), getReviews);
router.route('/:campgroundId').get(protect, authorize('admin', 'user'), getReviews);

router.route('/:id').put(protect, authorize('admin', 'user'), updateReview).delete(protect, authorize('admin', 'user'), deleteReview);

module.exports=router