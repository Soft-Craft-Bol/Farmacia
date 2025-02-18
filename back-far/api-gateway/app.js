// api-gateway/app.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy para microservicio de Usuarios
app.use('/users', createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/users': '' }
}));

// Proxy para microservicio de Equipos
app.use('/equipos', createProxyMiddleware({
    target: process.env.EQUIPOS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/equipos': '' }
}));

// Proxy para microservicio de Trabajos
app.use('/trabajos', createProxyMiddleware({
    target: process.env.TRABAJOS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/trabajos': '' }
}));

module.exports = app;
