import CreditCard from "../models/CreditCard.js";

export const addCreditCard = async (req, res) => {
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
