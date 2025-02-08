const express = require('express');
const { register, login, getProfile} = require('../controllers/auth.controller');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
module.exports = router;