const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const trabajosRoutes = require('./routes/trabajos.routes')
const trabajosTecnicoRoutes = require('./routes/trabajoTecnico.routes');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: "http://localhost:5174",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/trabajos', trabajosRoutes);
app.use('/trabajos-tecnico', trabajosTecnicoRoutes);

module.exports = app;
