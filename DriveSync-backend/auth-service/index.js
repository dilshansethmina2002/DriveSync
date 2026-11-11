const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Auth Service DB Connected'))
    .catch(err => console.log('DB Connection Error: ', err));

// Test Route
app.get('/api/auth/status', (req, res) => {
    res.status(200).json({ message: "Auth Service is up and running!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
});