const express = require('express');

const router = express.Router();
const { protect } = require('../middleware/auth');

const { addCreditCard, getCreditCards } = require('../controllers/creditCards');

router.route('/').get(protect, getCreditCards).put(protect, addCreditCard);


module.exports = router;