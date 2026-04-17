const mongoose = require('mongoose');
const CampgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add a name'],
        unique: true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required: [true, 'Please add an address']
    },
    district:{
        type: String,
        required: [true, 'Please add a district']
    },
    province:{
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode:{
        type: String,
        required: [true, 'Please add a postalcode'],
        maxlength:[5, 'Postal Code can not be more than 5 digits']
    },
    tel:{
        type: String
    },
    region:{
        type: String,
        required: [true, 'Please add a region']
    },

    // Add FIELDS

    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description too long']
    },

    imgSrc: [
        {
            type: String // URL of image
        }
    ],

    rooms: [
        {
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
                type: Number, // optional: how many people
                default: 1
            },
            available: {
                type: Number,
                default: 0
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    }

},{
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});

//Reverse populate with virtuals
CampgroundSchema.virtual('bookings',{
    ref: 'Booking',
    localField: '_id',
    foreignField:'campground',
    justOne:false
});

module.exports=mongoose.model('Campground',CampgroundSchema);