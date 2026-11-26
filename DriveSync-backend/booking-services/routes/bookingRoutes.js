import express from 'express';
import Booking from '../models/Booking.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { producer } from '../config/kafka.js';

const bookingRouter = express.Router();
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5003/api/catalog';

// Create a reservation with availability & date collision checks
bookingRouter.post('/', verifyToken, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, totalPrice } = req.body;
    // Use authenticated user's ID from JWT payload, fallback to body if provided
    const userId = req.user?.id || req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart) || isNaN(requestedEnd) || requestedStart >= requestedEnd) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date.' });
    }

    // Step 1: Verify vehicle is available in Catalog Service
    const catalogRes = await fetch(`${CATALOG_SERVICE_URL}/${vehicleId}/availability`);
    const catalogData = await catalogRes.json();

    if (!catalogRes.ok || !catalogData.available) {
      return res.status(400).json({
        success: false,
        message: catalogData.message || 'Vehicle is currently unavailable for booking.'
      });
    }

    // Step 2: Check for date collisions (Double booking prevention)
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

    // Step 3: Save Reservation
    const newBooking = new Booking({
      userId,
      vehicleId,
      startDate: requestedStart,
      endDate: requestedEnd,
      totalPrice,
      status: 'Pending'
    });

    const savedBooking = await newBooking.save();

    // Step 4: Publish 'booking-created' event to Kafka for Payment Service
    try {
      await producer.send({
        topic: 'booking-created',
        messages: [
          {
            key: savedBooking._id.toString(),
            value: JSON.stringify({
              bookingId: savedBooking._id,
              userId: savedBooking.userId,
              vehicleId: savedBooking.vehicleId,
              totalPrice: savedBooking.totalPrice,
              startDate: savedBooking.startDate,
              endDate: savedBooking.endDate
            })
          }
        ]
      });
      console.log(`[Kafka] Published booking-created for ${savedBooking._id}`);
    } catch (kafkaErr) {
      console.error('[Kafka] Failed to publish booking-created:', kafkaErr.message);
    }

    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get bookings for a user or vehicle
bookingRouter.get('/', verifyToken, async (req, res) => {
  try {
    const { userId, vehicleId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (vehicleId) query.vehicleId = vehicleId;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update booking status (Pending, Confirmed, Cancelled, Completed)
bookingRouter.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Publish 'booking-completed' event to Kafka so Fleet Service can schedule maintenance
    if (status === 'Completed') {
      try {
        await producer.send({
          topic: 'booking-completed',
          messages: [
            {
              key: updatedBooking._id.toString(),
              value: JSON.stringify({
                bookingId: updatedBooking._id,
                vehicleId: updatedBooking.vehicleId,
                userId: updatedBooking.userId
              })
            }
          ]
        });
        console.log(`[Kafka] Published booking-completed for vehicle ${updatedBooking.vehicleId}`);
      } catch (kafkaErr) {
        console.error('[Kafka] Failed to publish booking-completed:', kafkaErr.message);
      }
    }

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default bookingRouter;