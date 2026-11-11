const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

// Auth Service එකට යන requests Port 5001 ට යැවීම
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:5001', 
    changeOrigin: true 
}));

// අනෙකුත් members ලාගේ services හැදුවම මෙතනට පසුව add කරන්න පුළුවන්

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});