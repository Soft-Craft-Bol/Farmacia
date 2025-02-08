const express = require('express');
const { body } = require('express-validator');
const {
  createTeam,
  addUsersToTeam,
  getTeamsWithUsers,
  removeUserFromTeam,
} = require('../controllers/team.controller');

const router = express.Router();

router.post(
  '/create',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('descripcion').optional(),
  ],
  createTeam
);

router.post('/add-users', addUsersToTeam);

router.get('/teams-with-users', getTeamsWithUsers);

router.delete('/remove-user/:teamId/:userId', removeUserFromTeam);

module.exports = router;
