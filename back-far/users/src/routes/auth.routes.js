const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  getRoles, 
  requestPasswordReset, 
  resetPassword 
} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// Ruta para registro de usuarios
router.post('/register', register);

// Ruta para inicio de sesión
router.post('/login', login);

// Ruta para obtener perfil (protegida)
router.get('/profile', authMiddleware, getProfile);

// Ruta para obtener roles disponibles
router.get('/roles', getRoles);

// Ruta para solicitar recuperación de contraseña
router.post('/password/forgot', requestPasswordReset);

// Ruta para restablecer contraseña con token
router.post('/password/reset/:token', resetPassword);

module.exports = router;