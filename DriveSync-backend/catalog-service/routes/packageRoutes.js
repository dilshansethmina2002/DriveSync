import express from 'express';
import Package from '../models/Package.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const packageRouter = express.Router();

// PUBLIC: Get rental packages (active only by default, or all=true for admin)
packageRouter.get('/', async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.category) query.category = req.query.category;

    const packages = await Package.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PROTECTED: Create a rental package (Admin)
packageRouter.post('/', verifyToken, async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    const saved = await newPackage.save();
    res.status(201).json({ success: true, message: 'Rental package created successfully', data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PROTECTED: Update a rental package
packageRouter.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, message: 'Package updated successfully', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PROTECTED: Toggle active/inactive offer status
packageRouter.patch('/:id/toggle', verifyToken, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    pkg.isActive = !pkg.isActive;
    await pkg.save();
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PROTECTED: Delete a rental package
packageRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default packageRouter;
