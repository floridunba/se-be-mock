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

        // const existedBookings=await Booking.find({user:req.user.id});

        // if(existedBookings.length >= 3 && req.user.role !== 'admin'){
        //     return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 bookings`});
        // }

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


//@desc Resume payment session for a booking
//@route PUT /api/v1/bookings/:id/resume
//@access Private
exports.resumePayment = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({ path: 'campground', select: 'name address tel' })
            .populate({ path: 'paymentCard', select: 'last4 brand expiryMonth expiryYear cardholderName' });

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with id ${req.params.id}` });
        }

        // Only the booking owner can resume
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to resume this booking' });
        }

        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot resume booking with status: ${booking.paymentStatus}` });
        }

        if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
            booking.paymentStatus = 'expired';
            await booking.save({ validateBeforeSave: false });
            return res.status(400).json({ success: false, message: 'Payment session has expired' });
        }

        const timeRemainingMs = booking.paymentExpiresAt - new Date();
        res.status(200).json({
            success: true,
            data: booking,
            paymentDeadline: booking.paymentExpiresAt,
            timeRemainingMs
        });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot resume payment session' });
    }
};

//@desc Get the user's ongoing (pending, not expired) booking
//@route GET /api/v1/bookings/pending
//@access Private
exports.getOngoingBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({
            user: req.user.id,
            paymentStatus: 'pending',
            paymentExpiresAt: { $gt: new Date() }
        })
        .populate({ path: 'campground', select: 'name address tel' })
        .populate({ path: 'paymentCard', select: 'last4 brand expiryMonth expiryYear cardholderName' });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'No pending booking found' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot retrieve ongoing booking' });
    }
};

//@desc Pay booking with a saved card
//@route POST /api/v1/bookings/:id/pay
//@access Private
exports.payBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with id ${req.params.id}` });
        }

        // Only the booking owner can pay
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to pay this booking' });
        }

        const { cardId } = req.body;
        if (!cardId) {
            return res.status(400).json({ success: false, message: 'cardId is required' });
        }

        // Find card and verify ownership
        const card = await CreditCard.findById(cardId);
        if (!card) {
            return res.status(404).json({ success: false, message: `No card with id ${cardId}` });
        }
        if (card.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to use this card' });
        }

        // Check booking is still pending and not expired
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Booking is already paid' });
        }
        if (booking.paymentStatus === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is cancelled' });
        }
        if (booking.paymentStatus === 'expired' || (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date())) {
            return res.status(400).json({ success: false, message: 'Payment session has expired' });
        }
        let roomPrice = booking.room.price;
        let cardBalance = card.balance;
        if(card.balance < booking.room.price) {
            return res.status(400).json({ success: false, message: 'Payment session has expired' });
        }
        
        booking.paymentStatus = 'paid';
        booking.paymentCard = cardId;
        await booking.save({ validateBeforeSave: false });
        card.balance = cardBalance - roomPrice;
        await card.save({ validateBeforeSave: false })
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot process payment' });
    }
};

//@desc Cancel payment for a booking (owner, admin only)
//@route PUT /api/v1/bookings/:id/cancel-payment
//@access Private (admin)
exports.cancelPayment = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with id ${req.params.id}` });
        }

        // Prevent cancel of completed (paid) payments
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Cannot cancel a completed payment' });
        }

        // Validate payment state before cancel
        if (booking.paymentStatus === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking payment is already cancelled' });
        }

        booking.paymentStatus = 'cancelled';
        booking.cancelledBy = req.user.id;
        booking.cancelledAt = new Date();
        await booking.save({ validateBeforeSave: false });

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot cancel payment' });
    }
};