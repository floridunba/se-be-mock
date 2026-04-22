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
  try {
    const { cardholderName, cardNumber, expiryMonth, expiryYear, isDefault } = req.body;

    if (!cardNumber) {
      return res.status(400).json({ success: false, message: 'Card number is required' });
    }

    const digits = cardNumber.replace(/\s+/g, '');

    // Validate card length (13-19 digits)
    if (!/^\d{13,19}$/.test(digits)) {
      return res.status(400).json({ success: false, message: 'Invalid card number format' });
    }

    // Luhn algorithm check
    if (!luhnCheck(digits)) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }

    // Validate expiry
    const now = new Date();
    const expiry = new Date(Number(expiryYear), Number(expiryMonth) - 1, 1);
    expiry.setMonth(expiry.getMonth() + 1);
    if (expiry <= now) {
      return res.status(400).json({ success: false, message: 'Card is expired' });
    }

    const last4 = digits.slice(-4);
    const brand = CreditCard.detectBrand(digits);
    const encryptedNumber = encrypt(digits);

    const card = await CreditCard.create({
      user: req.user.id,
      cardholderName,
      last4,
      encryptedNumber,
      brand,
      expiryMonth,
      expiryYear,
      isDefault: isDefault || false
    });

    // Remove encryptedNumber from response (extra safety)
    const response = card.toObject();
    delete response.encryptedNumber;

    res.status(201).json({ success: true, data: response });
  } catch (err) {
    console.log(err.stack);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'Cannot add card' });
  }
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
 * @desc  Get single card by id
 * @route GET /api/v1/cards/:id
 * @access Private
 */
exports.getCreditCard = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this card' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Cannot retrieve card' });
  }
};

/**
 * @desc  Set a card as default
 * @route PUT /api/v1/cards/:id/default
 * @access Private
 */
exports.setDefaultCard = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Unset all other defaults then set this one
    await CreditCard.updateMany({ user: req.user.id }, { $set: { isDefault: false } });
    card.isDefault = true;
    await card.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: card });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Cannot set default card' });
  }
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
