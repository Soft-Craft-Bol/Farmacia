const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.js');

const {
  createTrabajo,
  addUsersToTrabajo,
  getTrabajoById,
  getAllTrabajos,
  removeUserFromTrabajo,
  updateEstadoTrabajo,
  aceptarTrabajo,
  rechazarTrabajo,
  contarTrabajos,
  contarTrabajosPendientes,
  contarTrabajosPorEstado
} = require('../controllers/trabajos.controller.js');

router.post('/', upload.single('imagen'), createTrabajo);
router.get('/contar', contarTrabajos);
router.get('/contar/pendientes', contarTrabajosPendientes);
router.get('/contar/estado', contarTrabajosPorEstado);

router.post('/:trabajoId/equipos', addUsersToTrabajo);

router.get('/:trabajoId', getTrabajoById);

router.get('/', getAllTrabajos);

router.delete('/:trabajoId/equipos/:userId', removeUserFromTrabajo);

router.patch('/:trabajoId/estado', updateEstadoTrabajo);

router.put('/:trabajoId/aceptar', aceptarTrabajo);
router.put('/:trabajoId/rechazar', rechazarTrabajo);


module.exports = router;

