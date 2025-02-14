const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const trabajosRoutes = require('./routes/trabajos.routes')
require('dotenv').config();

const app = express();

// Configurar CORS antes de definir las rutas
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/trabajos', trabajosRoutes);

module.exports = app;
