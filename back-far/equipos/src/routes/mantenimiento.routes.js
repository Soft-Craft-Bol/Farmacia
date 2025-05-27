const express = require('express');
const router = express.Router();
const {actualizarMantenimiento, obtenerEquiposConMantenimiento, registrarMantenimiento} = require('../controllers/mantenimiento.controller');
const {obtenerEquiposConMantenimiento2} = require('../service/mantenimiento')


router.get('/', obtenerEquiposConMantenimiento);
router.get('/predicto', obtenerEquiposConMantenimiento2);
router.put('/:id', actualizarMantenimiento);
router.post('/registrar', registrarMantenimiento);



module.exports = router;