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
    }
});

module.exports=mongoose.model('Booking',BookingSchema);

//2021-10-15T17:00:00.000Z