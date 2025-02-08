const express = require('express');
const { register, login, getProfile, getRoles } = require('../controllers/auth.controller');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload'); // Asegúrate de incluir el middleware de multer

router.post('/register', upload.single('foto'), register); // Añadir middleware para la subida de la foto
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.get('/roles', getRoles);

module.exports = router;
