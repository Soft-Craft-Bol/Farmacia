const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser, getUsersByRole } = require('../controllers/user.controller');
const router = express.Router();
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/role/:roleId', getUsersByRole);
module.exports = router;
