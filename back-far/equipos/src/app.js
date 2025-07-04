const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const equipoRoutes = require('./routes/equipo.routes')
const mantenimientoRoutes = require('./routes/mantenimiento.routes');
const siguienteMRoutes = require('./routes/siguienteM.routes');
require('dotenv').config();

const app = express();

// Configurar CORS antes de definir las rutas
app.use(cors({
    origin: "http://localhost:5174",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/equipos', equipoRoutes);
app.use('/mantenimiento', mantenimientoRoutes);
app.use('/seguiente', siguienteMRoutes);

module.exports = app;
