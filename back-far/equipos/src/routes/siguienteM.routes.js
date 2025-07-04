const express = require('express');
const router = express.Router();

const {
  registrarMantenimiento,
  obtenerHistorialPorEquipo,
  obtenerMantenimientoPorId
} = require('../controllers/seguienteM.controller');

router.post('/', registrarMantenimiento);

router.get('/historial/:equipoId', obtenerHistorialPorEquipo);

router.get('/:mantenimientoId', obtenerMantenimientoPorId);

module.exports = router;
