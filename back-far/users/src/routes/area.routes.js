const express = require('express');
const router = express.Router();
const areaController = require('../controllers/area.controller');

router.post('/', areaController.crearArea);
router.get('/', areaController.obtenerAreas);
router.get('/:id', areaController.obtenerAreaPorId);
router.put('/:id', areaController.actualizarArea);
router.delete('/:id', areaController.eliminarArea);
router.post('/bulk', areaController.crearAreasMultiples); 
router.get('/user/:userId', areaController.obtenerAreasPorUsuarioId);

module.exports = router;
 