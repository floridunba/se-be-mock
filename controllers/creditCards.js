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