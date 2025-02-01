const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('./config/cors');
const routes = require('./api/endPoints');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors);

// Rutas
app.use(routes);

// Conectar a la base de datos
connectDB();

module.exports = app;
