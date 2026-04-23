const mongoose=require('mongoose');

const CreditCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // NEVER store raw full card number in plain text
  cardNumber: {
    type: String,
    unique: true,
    required: true
  },

  // Store last 4 digits for display
  last4: {
    type: String,
    required: true,
    length: 4,
    match: [/^\d{4}$/, 'last4 must be exactly 4 digits']
  },

  cardHolderName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Cardholder name cannot exceed 100 characters']
  },

  brand: {
    type: String, // Visa, MasterCard, Amex
    required: true,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'other'],
    default: 'other'
  },

  expiryMonth: {
    type: Number,
    required: true,
    min: [1, 'Invalid expiry month'],
    max: [12, 'Invalid expiry month']
  },

  expiryYear: {
    type: Number,
    required: true,
    validate: {
      validator: validateExpiry,
      message: 'Card expiry date is invalid or card is expired'
    }
  },

  //In realworld: DO NOT STORE CVV in database (PCI-DSS violation)

  CVV: {
    type: String,
    required: true
  },

  isDefault: {
    type: Boolean,
    default: false
  },

//   token: {
//     type: String // from payment gateway (Stripe, etc.)
//   },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  balance: {
    type: Number,
    default: 0
  }
});

function validateExpiry() {
  const now = new Date();
  const expiry = new Date(this.expiryYear, this.expiryMonth - 1, 1);
  // Card is valid through the end of the expiry month
  expiry.setMonth(expiry.getMonth() + 1);
  return expiry > now;
}

CreditCardSchema.pre('save', async function () {
    // Prevent duplicate card
    const existing = await this.constructor.findOne({
      user: this.user,
      last4: this.last4,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      _id: { $ne: this._id } // allow update of same doc
    });

    if (existing) {
      throw new Error('Card already exists for this user');
    }

    // ⭐ Handle default logic
    if (this.isDefault && this.isModified('isDefault')) {
      await this.constructor.updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
    }
});

module.exports=mongoose.model('CreditCard', CreditCardSchema);