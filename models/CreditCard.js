const mongoose = require('mongoose');

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
    min: [new Date().getFullYear(), 'Card is expired']
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
