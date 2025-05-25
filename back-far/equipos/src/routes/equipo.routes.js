const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipo.controller');


router.post(
  '/', equipoController.uploadMiddleware, equipoController.registrarEquipo
);
router.get('/', equipoController.obtenerEquipos);
router.delete('/:id', equipoController.eliminarEquipo);
router.get('/:id', equipoController.obtenerEquipoPorId);
router.get('/user/:userId', equipoController.getEquiposByUserId);
router.put(
  '/:id', equipoController.uploadMiddleware, equipoController.actualizarEquipo
);

module.exports = router;
 