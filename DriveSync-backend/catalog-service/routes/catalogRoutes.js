import express from 'express';
import Vehicle from '../models/Vehicle.js';

const catalogRouter = express.Router();

// Get vehicles with search & filters
catalogRouter.get('/', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, isAvailable } = req.query;
    let query = {};

    if (category) query.category = category;
    if (location) query.location = location;
    if (isAvailable) query.isAvailable = isAvailable === 'true';
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query);
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new vehicle (for inventory management / admin)
catalogRouter.post('/', async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    const savedVehicle = await newVehicle.save();
    res.status(201).json({ success: true, data: savedVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default catalogRouter;