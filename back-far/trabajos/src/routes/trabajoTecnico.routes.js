const express = require('express');
const router = express.Router();
const { upload } = require('../config/multerConfig');

const {
  asignarTrabajosMasivos, 
  finalizarTrabajoTecnico, 
  getCargaTecnico,
  getTrabajosEnProgresoYRechazados,
  getTrabajosFinalizadosConHistorial
} = require('../controllers/tecnicoTrabajo.controller');

const handleFileUploads = (req, res, next) => {
  const uploadMiddleware = upload.fields([
    { name: 'documentos', maxCount: 5 },
    { name: 'imagenes', maxCount: 10 }
  ]);
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.post('/asignar-masivos', asignarTrabajosMasivos);
router.put(
  '/:trabajoId/finalizar-tecnico/:tecnicoId', 
  handleFileUploads,
  finalizarTrabajoTecnico
);
router.get('/carga/:tecnicoId', getCargaTecnico);
router.get('/pendientes', getTrabajosEnProgresoYRechazados);
router.get('/historial', getTrabajosFinalizadosConHistorial);

module.exports = router;