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
    required: true // ideally encrypted or tokenized
  },

  // Store last 4 digits for display
  last4: {
    type: String,
    required: true
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

// update timestamp automatically
creditCardSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("CreditCard", CreditCardSchema);