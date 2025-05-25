const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Config CORS (ajusta los orígenes según necesidades)
app.use(cors({
  origin: ['http://localhost:5174', 'http://tu-frontend.com'],
  credentials: true
}));

// Routes
app.use('/users', 
  createProxyMiddleware({ 
    target: 'http://localhost:5000', 
    changeOrigin: true,
    pathRewrite: { '^/users': '/' } 
  })
);

app.use('/equipos', 
  createProxyMiddleware({ 
    target: 'http://localhost:4000',
    changeOrigin: true 
  })
);

app.use('/trabajos', 
  createProxyMiddleware({ 
    target: 'http://localhost:6000',
    changeOrigin: true,
    onError: (err, req, res) => {
      res.status(503).json({ error: 'Servicio de trabajos no disponible' });
    }
  })
);

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

module.exports = app;