const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipo.controller');


router.post(
  '/',
//   equipoController.uploadMiddleware.single('foto'),
  equipoController.uploadMiddleware.fields([
    { name: 'foto', maxCount: 1 },      
    { name: 'documento', maxCount: 1 }   
  ]),
  equipoController.registrarEquipo
);

router.get('/', equipoController.obtenerEquipos);
router.delete('/:id', equipoController.eliminarEquipo);

module.exports = router;
