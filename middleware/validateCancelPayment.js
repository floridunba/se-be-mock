const Booking = require('../models/Booking');

/**
 * Middleware: validate booking payment state before allowing admin cancel.
 * Must run after protect + authorize('admin').
 */
const validateCancelPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with id ${req.params.id}`
      });
    }

    // Explicit guard: completed (paid) payments can never be cancelled
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed payment. Contact support if needed.'
      });
    }

    const CANCELLABLE_STATUSES = ['pending', 'expired'];

    if (!CANCELLABLE_STATUSES.includes(booking.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with payment status: ${booking.paymentStatus}`
      });
    }

    // Attach booking to request so controller can reuse it
    req.booking = booking;
    next();
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: 'Payment validation error' });
  }
};

module.exports = validateCancelPayment;
