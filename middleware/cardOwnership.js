const CreditCard = require('../models/CreditCard');

/**
 * Middleware to check that the current user owns the card identified by req.params.id.
 * Must be used after `protect` middleware so req.user is available.
 */
exports.requireCardOwnership = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: `No card with id ${req.params.id}` });
    }

    if (card.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this card' });
    }

    // Attach card to request for downstream handlers
    req.card = card;
    next();
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Error checking card ownership' });
  }
};
