import mongoose from "mongoose";

const CreditCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // NEVER store raw full card number in plain text
  cardNumber: {
    type: String,
    required: true
  },

  // Store last 4 digits for display
  last4: {
    type: String,
    required: true,
    length: 4,
  },

  cardHolderName: {
    type: String,
    required: true
  },

  brand: {
    type: String, // Visa, MasterCard, Amex
    required: true
  },

  expiryMonth: {
    type: Number,
    required: true
  },

  expiryYear: {
    type: Number,
    required: true
  },

  //In realworld: DO NOT STORE CVV in database (PCI-DSS violation)

  CVV: {
    type: String,
    require: true
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
// Unique index to prevent duplicate cards (same last4 + expiry per user)
CreditCardSchema.index({ user: 1, last4: 1, expiryMonth: 1, expiryYear: 1 }, { unique: true });


// If new card set to default -> unset isDefault on all other cards of the same user.
CreditCardSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});


export default mongoose.model("CreditCard", CreditCardSchema);