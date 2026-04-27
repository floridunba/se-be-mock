const express = require('express');
const {
  getCreditCards,
  addCreditCard,
  updateCreditCard,
  deleteCreditCard
} = require('../controllers/cards');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getCreditCards)
  .post(protect, addCreditCard);

router.route('/:id')
  .put(protect, updateCreditCard)
  .delete(protect, deleteCreditCard);

module.exports = router;
