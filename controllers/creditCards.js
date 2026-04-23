import CreditCard from "../models/CreditCard.js";

/**
 * @desc  Get all saved cards for the logged-in user
 * @route GET /api/v1/cards
 * @access Private
 */
export const getCreditCards = async (req, res, next) => {
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
 * @desc  Get single card by id
 * @route GET /api/v1/cards/:id
 * @access Private
 */
export const getCreditCard = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    if (card.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this card' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Cannot retrieve card' });
  }
};

export const addCreditCard = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Extract last 4 digits
    req.body.last4 = req.body.cardNumber.slice(-4);

    // Create card
    const newCard = new CreditCard(req.body);

    await newCard.save();

    res.status(201).json({
      success: true,
      data: newCard
    });

  } catch (error) {
    // Handle duplicate card (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Card already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc  Delete a credit card
 * @route DELETE /api/v1/cards/:id
 * @access Private
 */
export const deleteCreditCard = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    // Ownership check — only owner can delete
    if (card.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this card' });
    }

    await card.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Cannot delete card' });
  }
};


/**
 * @desc  Update a credit card
 * @route PUT /api/v1/cards/:id
 * @access Private
 */
export const updateCreditCard = async (req, res, next) => {
  try {
    let card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    // Ownership check
    if (card.user.toString() !== req.user.id && req.uesr.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this card' });
    }

    const { cardholderName, cardNumber, expiryMonth, expiryYear, isDefault } = req.body;

    // Validate update fields
    const validationErrors = validateCardUpdateFields(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: validationErrors.join(', ') });
    }

    // If new card number provided, validate and re-encrypt
    if (cardNumber !== undefined) {
      const digits = cardNumber.replace(/\s+/g, '');

      if (!/^\d{13,19}$/.test(digits)) {
        return res.status(400).json({ success: false, message: 'Invalid card number format' });
      }

      req.body.last4 = digits.slice(-4);
    }

    card = await CreditCard.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:false})

    res.status(200).json({ success: true, data: card });
  } catch (err) {
    console.log(err.stack);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'Cannot update card' });
  }
};