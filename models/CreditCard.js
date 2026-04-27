const mongoose = require('mongoose');

// Validate card expiry: card must not be expired
function validateExpiry() {
  const now = new Date();
  const expiry = new Date(this.expiryYear, this.expiryMonth - 1, 1);
  // Card is valid through the end of the expiry month
  expiry.setMonth(expiry.getMonth() + 1);
  return expiry > now;
}

/**
 * CreditCard schema — stores card info with card number encrypted at rest.
 * NEVER expose encryptedNumber via API; only last4 is returned.
 */
const CreditCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cardholderName: {
    type: String,
    required: [true, 'Please add cardholder name'],
    trim: true,
    maxlength: [100, 'Cardholder name cannot exceed 100 characters']
  },
  /** Only last 4 digits — safe to store and return */
  last4: {
    type: String,
    required: true,
    length: 4,
    match: [/^\d{4}$/, 'last4 must be exactly 4 digits']
  },
  /**
   * Full card number encrypted with AES-256-CBC.
   * select: false ensures it is NEVER included in query results by default.
   */
  encryptedNumber: {
    type: String,
    required: true,
    select: false
  },
  brand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'other'],
    default: 'other'
  },
  expiryMonth: {
    type: Number,
    required: [true, 'Please add expiry month'],
    min: [1, 'Invalid expiry month'],
    max: [12, 'Invalid expiry month']
  },
  expiryYear: {
    type: Number,
    required: [true, 'Please add expiry year'],
    validate: {
      validator: validateExpiry,
      message: 'Card expiry date is invalid or card is expired'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient multi-card lookup per user
CreditCardSchema.index({ user: 1, createdAt: -1 });
// Ensure at most one default card per user
CreditCardSchema.index({ user: 1, isDefault: 1 });

/**
 * Before saving, if this card is set as default,
 * unset isDefault on all other cards of the same user.
 */
CreditCardSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

/**
 * Detect card brand from card number prefix.
 * @param {string} cardNumber
 * @returns {'visa'|'mastercard'|'amex'|'discover'|'other'}
 */
CreditCardSchema.statics.detectBrand = function (cardNumber) {
  const num = cardNumber.replace(/\s+/g, '');
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  return 'other';
};

module.exports = mongoose.model('CreditCard', CreditCardSchema);
