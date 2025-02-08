const express = require('express');
<<<<<<< HEAD
const { register, login, getProfile} = require('../controllers/auth.controller');
=======
const { register, login, getRoles } = require('../controllers/auth.controller');
>>>>>>> c7ba027134ab5f95585a9ad480c3a4d963faee8b
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
router.post('/register', register);
router.post('/login', login);
<<<<<<< HEAD
router.get('/profile', authMiddleware, getProfile);
=======
router.get('/roles', getRoles);
>>>>>>> c7ba027134ab5f95585a9ad480c3a4d963faee8b
module.exports = router;