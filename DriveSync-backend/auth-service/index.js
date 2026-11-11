import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Auth Service DB Connected'))
    .catch(err => console.log('DB Connection Error: ', err));


// Routes
app.use('/', authRoutes); 
app.get('/status', (req, res) => { 
    res.status(200).json({ message: "Auth Service is up and running (ES6 Modules)!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
});