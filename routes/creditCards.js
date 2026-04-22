const express = require('express');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const { addCreditCard, updateCreditCard } = require('../controllers/creditCards');

router.route('/').post(protect, addCreditCard);

router.route('/:id').put(protect, authorize('user', 'admin'), updateCreditCard)


module.exports = router;