const express = require('express');
const router = express.Router();
const {actualizarMantenimiento, obtenerEquiposConMantenimiento, registrarMantenimiento} = require('../controllers/mantenimiento.controller');

router.get('/', obtenerEquiposConMantenimiento);
router.put('/:id', actualizarMantenimiento);
router.get('/proximo-mantenimiento', registrarMantenimiento);


module.exports = router;