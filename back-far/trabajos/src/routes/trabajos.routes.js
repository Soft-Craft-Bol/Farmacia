const express = require('express');
const router = express.Router();

const {
  createTrabajo,
  addUsersToTrabajo,
  getTrabajoById,
  getAllTrabajos,
  removeUserFromTrabajo,
} = require('../controllers/trabajos.controller.js');

router.post('/', createTrabajo);

router.post('/:trabajoId/equipos', addUsersToTrabajo);

router.get('/:trabajoId', getTrabajoById);

router.get('/', getAllTrabajos);

router.delete('/:trabajoId/equipos/:userId', removeUserFromTrabajo);

module.exports = router;

