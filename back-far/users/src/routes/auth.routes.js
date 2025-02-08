const express = require('express');
const { register, login, getRoles } = require('../controllers/auth.controller');
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/roles', getRoles);
module.exports = router;