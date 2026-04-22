const express = require('express');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const { addCreditCard, getCreditCards, getCreditCard } = require('../controllers/creditCards');

router.route('/').get(protect, getCreditCards).post(protect, addCreditCard);

router.route('/:id').get(protect, authorize('admin', 'user'), getCreditCard);
module.exports = router;