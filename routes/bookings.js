const express = require('express');
const {getBookings, getBooking, addBooking, updateBooking, deleteBooking, payBooking, resumePayment, cancelPayment}=require('../controllers/bookings');

const router = express.Router({mergeParams:true});
const {protect, authorize}=require('../middleware/auth');
const validateCancelPayment = require('../middleware/validateCanclePayment');


router.route('/').get(protect,getBookings).post(protect, authorize('admin', 'user'), addBooking);
router.route('/:id').get(protect, getBooking).put(protect, authorize('admin', 'user'), updateBooking).delete(protect, authorize('admin', 'user'), deleteBooking);
router.route('/:id/pay').post(protect, payBooking);
router.route('/:id/resume').put(protect, resumePayment);
router.route('/:id/cancel-payment').put(protect, authorize('admin'), validateCancelPayment, cancelPayment);

module.exports=router;