const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
} = require('../controllers/bookingController');

// TODO: wire up routes

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/my', getMyBookings);

// Admin only
router.get('/', requireAdmin, getAllBookings);
router.put('/:id/status', requireAdmin, updateBookingStatus);

module.exports = router;
