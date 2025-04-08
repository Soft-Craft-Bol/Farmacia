const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/team.routes');
const roleRoutes = require('./routes/roles.routes');
const areaRoutes = require('./routes/area.routes');
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use("/auth/roles", roleRoutes);
app.use("/area", areaRoutes);
module.exports = app;
