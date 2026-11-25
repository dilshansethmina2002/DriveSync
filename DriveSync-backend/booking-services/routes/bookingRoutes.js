import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002/api/catalog';

// 1. Create a reservation with availability & date collision checks
bookingRouter.post('/', verifyToken, async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      pickupTime,
      returnTime,
      pickupLocation,
      packageId,
      packageName,
      driverRequired,
      notes,
      totalPrice
    } = req.body;
    // Use authenticated user's ID from JWT payload, fallback to body if provided
    const userId = req.user?.id || req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    if (!vehicleId) {
      return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format.' });
    }

    if (!mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json({ success: false, message: 'Invalid Vehicle ID format.' });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime()) || requestedStart >= requestedEnd) {
      return res.status(400).json({ success: false, message: 'Invalid dates: Start date must be before end date.' });
    }

    // Step 1: Verify vehicle availability in Catalog Service (Port 5002)
    try {
      const catalogRes = await fetch(`${CATALOG_SERVICE_URL}/${vehicleId}/availability`);
      if (!catalogRes.ok) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found in catalog or catalog service error.'
        });
      }
      const catalogData = await catalogRes.json();
      if (!catalogData.available) {
        return res.status(400).json({
          success: false,
          message: catalogData.message || 'Vehicle is currently unavailable for booking.'
        });
      }
    } catch (catalogErr) {
      console.warn(`[Booking Service] Warning: Unable to reach Catalog Service at ${CATALOG_SERVICE_URL}:`, catalogErr.message);
      // If catalog service is unreachable during local testing, proceed with date collision checks
    }

    // Step 2: Check for date collisions (Double booking prevention algorithm)
    // Overlap condition: Existing active booking starts before requested end AND ends after requested start
    const conflictingBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ['Pending', 'Confirmed', 'Ongoing'] },
      startDate: { $lt: requestedEnd },
      endDate: { $gt: requestedStart }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle is already booked for the selected dates.'
      });
    }

    // Step 3: Save Reservation
    const newBooking = new Booking({
      userId,
      vehicleId,
      startDate: requestedStart,
      endDate: requestedEnd,
      pickupTime: pickupTime || '09:00',
      returnTime: returnTime || '18:00',
      pickupLocation: pickupLocation || '',
      packageId: mongoose.isValidObjectId(packageId) ? packageId : null,
      packageName: packageName || '',
      driverRequired: Boolean(driverRequired),
      notes: notes || '',
      totalPrice: Number(totalPrice) || 0,
      status: 'Pending'
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ 
      success: true, 
      message: 'Reservation created successfully. Pending payment.',
      data: savedBooking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get bookings list (filtered by user or vehicle)
bookingRouter.get('/', verifyToken, async (req, res) => {
  try {
    const { userId, vehicleId, status } = req.query;
    let query = {};
    
    // Non-admin users can only view their own bookings
    if (req.user && req.user.role === 'Customer') {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (vehicleId) query.vehicleId = vehicleId;
    if (status) query.status = status;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get single booking by ID (used by Payment Service & Checkout)
bookingRouter.get('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID format.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Customer can only view their own booking
    if (req.user && req.user.role === 'Customer' && String(booking.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied: not your booking.' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update booking status (Pending, Confirmed, Ongoing, Completed, Cancelled)
bookingRouter.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID format.' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Booking status updated to ${status}.`,
      data: updatedBooking 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. Cancel booking (Customer or Admin)
bookingRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID format.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (req.user && req.user.role === 'Customer' && String(booking.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied: not your booking.' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking has been cancelled.', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default bookingRouter;
