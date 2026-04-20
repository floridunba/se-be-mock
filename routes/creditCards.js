const express = require('express');

const router = express.Router();
const { protect } = require('../middleware/auth');

const { addCreditCard } = require('../controllers/creditCards');

router.route('/').put(protect, addCreditCard);


module.exports = router;