import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const catalogRouter = express.Router();

// PUBLIC: Get vehicles with keyword search & filters
catalogRouter.get('/', async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, isAvailable, transmission, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = { $regex: `^${category}$`, $options: 'i' };
    if (transmission) query.transmission = { $regex: `^${transmission}$`, $options: 'i' };
    if (location) query.location = { $regex: `^${location}$`, $options: 'i' };
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC: Check single vehicle availability (used by Booking Service & Frontend)
catalogRouter.get('/:id/availability', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, available: false, message: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      vehicleId: vehicle._id,
      available: vehicle.isAvailable,
      dailyRate: vehicle.dailyRate,
      message: vehicle.isAvailable ? 'Vehicle is available' : 'Vehicle is currently unavailable'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
  }
});

// PUBLIC: Get single vehicle by ID
catalogRouter.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
  }
});

// PROTECTED: Add a new vehicle (requires valid Bearer token)
catalogRouter.post('/', verifyToken, async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    const savedVehicle = await newVehicle.save();
    res.status(201).json({ success: true, message: 'Vehicle added to catalog successfully', data: savedVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PROTECTED: Update vehicle details
catalogRouter.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, message: 'Vehicle updated successfully', data: updatedVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PROTECTED: Update vehicle availability status
catalogRouter.patch('/:id/availability', verifyToken, async (req, res) => {
  try {
    const { isAvailable, status } = req.body;
    const updateData = {};
    if (typeof isAvailable === 'boolean') {
      updateData.isAvailable = isAvailable;
      updateData.status = isAvailable ? 'Available' : (status || 'Rented');
    }
    if (status) {
      updateData.status = status;
      updateData.isAvailable = status === 'Available';
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, data: updatedVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PROTECTED: Delete vehicle
catalogRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, message: 'Vehicle deleted from catalog' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default catalogRouter;
