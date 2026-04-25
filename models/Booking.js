const mongoose=require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: [1, "Booking must be at least 1 night"],
        max: [3, "Booking cannot exceed 3 nights"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    campground:{
        type:mongoose.Schema.ObjectId,
        ref: 'Campground',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'expired'],
        default: 'pending'
    },
    paymentExpiresAt: {
        type: Date
    },
    paymentCard: {
        type: mongoose.Schema.ObjectId,
        ref: 'CreditCard'
    },
    cancelledBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    cancelledAt: {
        type: Date
    }
});

// Index for efficient lookup of pending bookings per user
BookingSchema.index({ user: 1, paymentStatus: 1, paymentExpiresAt: 1 });

// Pre-save hook: auto-set paymentExpiresAt = createdAt + 12 hours when new
BookingSchema.pre('save', function(next) {
    if (this.isNew && !this.paymentExpiresAt) {
        const base = this.createdAt || new Date();
        this.paymentExpiresAt = new Date(base.getTime() + 12 * 60 * 60 * 1000);
    }
    next();
});

module.exports=mongoose.model('Booking',BookingSchema);
