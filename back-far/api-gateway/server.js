require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:4000', changeOrigin: true }));

app.use('/api/equipos', createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true }));

app.use('/api/trabajos', createProxyMiddleware({ target: 'http://localhost:7000', changeOrigin: true }));

app.use('/api/orders', createProxyMiddleware({ target: 'http://localhost:6000', changeOrigin: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
