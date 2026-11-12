import express from 'express';
import Booking from '../models/Booking.js';

const bookingRouter = express.Router();

// Create a reservation with date collision check
bookingRouter.post('/', async (req, res) => {
  try {
    const { userId, vehicleId, startDate, endDate, totalPrice } = req.body;

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (requestedStart >= requestedEnd) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date.' });
    }

    // Check for date collisions (Double booking prevention)
    // Overlap logic: Existing booking starts before requested end AND ends after requested start
    const conflictingBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ['Pending', 'Confirmed'] },
      startDate: { $lt: requestedEnd },
      endDate: { $gt: requestedStart }
    });

    if (conflictingBooking) {
      return res.status(409).json({ 
        success: false, 
        message: 'Vehicle is already booked for the selected dates.' 
      });
    }

    const newBooking = new Booking({
      userId,
      vehicleId,
      startDate: requestedStart,
      endDate: requestedEnd,
      totalPrice,
      status: 'Pending'
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get bookings for a user or vehicle
bookingRouter.get('/', async (req, res) => {
  try {
    const { userId, vehicleId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (vehicleId) query.vehicleId = vehicleId;

    const bookings = await Booking.find(query);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update booking status
bookingRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default bookingRouter;