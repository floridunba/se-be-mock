const express = require('express');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const { addCreditCard, deleteCreditCard } = require('../controllers/creditCards');

router.route('/').put(protect, addCreditCard);

router.route('/:id').delete(protect, authorize('admin', 'user'), deleteCreditCard)

module.exports = router;