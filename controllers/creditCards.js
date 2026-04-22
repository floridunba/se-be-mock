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