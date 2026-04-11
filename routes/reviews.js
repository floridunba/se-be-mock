const express = require('express');
const { createReview } = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true});

router.route('/').post(protect, createReview);

module.exports=router