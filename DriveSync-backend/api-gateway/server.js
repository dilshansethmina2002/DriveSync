import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors());

app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:5001', 
    changeOrigin: true 
}));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT} (ES6 Modules)`);
});