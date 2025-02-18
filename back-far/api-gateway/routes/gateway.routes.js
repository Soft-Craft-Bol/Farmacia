const express = require('express');
const router = express.Router();
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer();

// Definir las rutas de los microservicios
const usersServiceUrl = 'http://localhost:5000';
const equiposServiceUrl = 'http://localhost:4000';
const trabajosServiceUrl = 'http://localhost:7000';

// Redirigir las solicitudes a los microservicios
router.all('/users/*', (req, res) => {
    proxy.web(req, res, { target: usersServiceUrl });
});

router.all('/equipos/*', (req, res) => {
    proxy.web(req, res, { target: equiposServiceUrl });
});

router.all('/trabajos/*', (req, res) => {
    proxy.web(req, res, { target: trabajosServiceUrl });
});

module.exports = router;