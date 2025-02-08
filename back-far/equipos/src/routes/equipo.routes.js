const express = require('express');
const multer = require('multer');
const router = express.Router();
const equipoController = require('../controllers/equipo.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('foto'), equipoController.registrarEquipo);
router.get('/', equipoController.obtenerEquipos);
router.delete('/:id', equipoController.eliminarEquipo);

module.exports = router;
