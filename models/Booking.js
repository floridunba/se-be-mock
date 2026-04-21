const mongoose=require('mongoose');

const BookingSchema = new mongoose.Schema({
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
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
    room: {
        roomType: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        capacity: {
            type: Number,
            default: 1
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
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

module.exports=mongoose.model('Booking',BookingSchema);
