const Booking = require('../models/Booking');
const Campground = require('../models/Campground');


//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Private
exports.getBookings=async (req,res,next)=>{
    let query;
    //General users can see only their bookings!
    if(req.user.role !== 'admin'){
        query = Booking.find({user:req.user.id}).populate({
            path:'campground',
            select:'name address tel'
        });
    } else {
        query = Booking.find({}).populate({
            path:'campground',
            select:'name address tel'
        });
    }
    try{
        const bookings = await query;

        res.status(200).json({
            success:true,
            count: bookings.length,
            data: bookings
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success:false,
            message:"Cannot find Booking"
        });
    }
};


//@desc Get ONE booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking=async (req,res,next)=>{
    try{
        const booking = await Booking.findById(req.params.id).populate({
            path: 'campground',
            select:'name description tel'
        });

        if(!booking){
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true, data:booking});

    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success:false, message:'Cannot find Booking'});
    }
};

//@desc Add ONE booking
//@route POST /api/v1/campgrounds/:campgroundId/bookings/
//@access Private
exports.addBooking=async (req,res,next)=>{
    try{
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if(!campground){
            return res.status(404).json({success:false, message:`No campground with the id of ${req.params.campgroundId}`});
        }

        req.body.user=req.user.id;

        //  check duration ไม่เกิน 3 คืน
        if(req.body.duration > 3 || req.body.duration < 1){
            return res.status(400).json({success:false, message:"Booking duration must be between 1-3 nights"});
        }

        const existedBookings=await Booking.find({user:req.user.id});

        if(existedBookings.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 bookings`});
        }

        const booking = await Booking.create(req.body);
        res.status(200).json({success:true, data: booking});
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success:false, message:'Cannot create Booking'});
    }
};

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking=async (req,res,next)=>{
    try{
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false, message: `No booking with id ${req.params.id}`});
        }

        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this booking`});
        }

        //  check duration ตอน update ด้วย
        if(req.body.duration !== undefined && (req.body.duration > 3 || req.body.duration < 1)){
            return res.status(400).json({success:false, message:"Booking duration must be between 1-3 nights"});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body,{new:true, runValidators:true});

        res.status(200).json({success:true, data:booking});
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot update Booking"});
    }
};

//@desc Delete booking
//@route DELETE /api/v1/bookings/:id
//@access Private
exports.deleteBooking=async (req,res,next)=>{
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({success:false, message:`No booking with id ${req.params.id}`});
        }

        //Make sure user is the booking owner
        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();

        res.status(200).json({success:true, data:{}});
    } catch(err){
         console.log(err.stack);
        return res.status(500).json({success:false, message:"Connot delete Booking"});
    }
};