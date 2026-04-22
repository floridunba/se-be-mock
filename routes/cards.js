const express = require('express');
const {
  getCreditCards,
  getCreditCard,
  addCreditCard,
  updateCreditCard,
  deleteCreditCard,
  setDefaultCard
} = require('../controllers/cards');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getCreditCards)
  .post(protect, addCreditCard);

router.route('/:id')
  .get(protect, getCreditCard)
  .put(protect, updateCreditCard)
  .delete(protect, deleteCreditCard);

router.route('/:id/default')
  .put(protect, setDefaultCard);

module.exports = router;
