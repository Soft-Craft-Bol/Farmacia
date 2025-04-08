const express = require('express');
const router = express.Router();

const {
  createTrabajo,
  addUsersToTrabajo,
  getTrabajoById,
  getAllTrabajos,
  removeUserFromTrabajo,
  updateEstadoTrabajo 
} = require('../controllers/trabajos.controller.js');

router.post('/', createTrabajo);

router.post('/:trabajoId/equipos', addUsersToTrabajo);

router.get('/:trabajoId', getTrabajoById);

router.get('/', getAllTrabajos);

router.delete('/:trabajoId/equipos/:userId', removeUserFromTrabajo);

router.patch('/:trabajoId/estado', updateEstadoTrabajo);




module.exports = router;

