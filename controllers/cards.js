const CreditCard = require('../models/CreditCard');
const { encrypt, luhnCheck } = require('../utils/crypto');

/**
 * @desc  Get all saved cards for the logged-in user
 * @route GET /api/v1/cards
 * @access Private
 */
exports.getCreditCards = async (req, res, next) => {
  try {
    const cards = await CreditCard.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Cannot retrieve cards' });
  }
};

/**
 * @desc  Add a new credit card
 * @route POST /api/v1/cards
 * @access Private
 * Body: { cardholderName, cardNumber, expiryMonth, expiryYear, isDefault? }
 */
exports.addCreditCard = async (req, res, next) => {
  // Stub — full implementation in US1-1-add-card-api
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

/**
 * @desc  Update a credit card
 * @route PUT /api/v1/cards/:id
 * @access Private
 */
exports.updateCreditCard = async (req, res, next) => {
  // Stub — implemented in US1-4
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

/**
 * @desc  Delete a credit card
 * @route DELETE /api/v1/cards/:id
 * @access Private
 */
exports.deleteCreditCard = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    // Ownership check — only owner can delete
    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this card' });
    }

    await card.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Cannot delete card' });
  }
};
