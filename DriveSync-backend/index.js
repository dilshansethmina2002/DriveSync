const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Auth Service DB Connected'))
    .catch(err => console.log(err));

app.get('/api/auth/status', (req, res) => {
    res.json({ message: "Auth Service is up and running!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));