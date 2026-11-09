const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

// Routes redirecting to respective microservices
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:5001', changeOrigin: true }));
app.use('/api/catalog', createProxyMiddleware({ target: 'http://localhost:5002', changeOrigin: true }));

app.listen(5000, () => {
    console.log('API Gateway is running on port 5000');
});