const express = require('express');
const { getReviews } = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true});

router.route('/').get(getReviews);
router.route('/user').get(protect, authorize('admin', 'user'), getReviews);
router.route('/:campgroundId').get(protect, authorize('admin', 'user'), getReviews);

module.exports=router