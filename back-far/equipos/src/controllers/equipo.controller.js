const prisma = require('../config/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageUploadPath = path.join(__dirname, '../../uploads/images');
const documentUploadPath = path.join(__dirname, '../../uploads/documents');

if (!fs.existsSync(imageUploadPath)) fs.mkdirSync(imageUploadPath, { recursive: true });
if (!fs.existsSync(documentUploadPath)) fs.mkdirSync(documentUploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.mimetype.startsWith('image')) {
          cb(null, imageUploadPath);  
      } else {
          cb(null, documentUploadPath); 
      }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const uploadMiddleware = multer({ storage })


const registrarEquipo = async (req, res) => {
  console.log("📸 Archivos recibidos:", req.files);
    try {
        const { etiquetaActivo, numeroSerie, modelo, estado, ubicacion, tipoMantenimiento, fechaCompra, proveedor, numeroOrden, componentes } = req.body;

        let fotoUrl = req.files['foto'] ? `/uploads/images/${req.files['foto'][0].filename}` : null;
        let documentoUrl = req.files['documento'] ? `/uploads/documents/${req.files['documento'][0].filename}` : null;
        console.log("✅ Ruta de imagen guardada:", fotoUrl);
        if (!etiquetaActivo || !numeroSerie || !modelo) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const componentesArray = Array.isArray(componentes) ? componentes : JSON.parse(componentes || "[]");

        console.log("🛠 Componentes a agregar:", componentesArray);

        const equipo = await prisma.equipo.create({
            data: {
                etiquetaActivo,
                numeroSerie,
                modelo,
                estado,
                ubicacion,
                tipoMantenimiento,
                fechaCompra: new Date(fechaCompra),
                proveedor,
                numeroOrden,
                fotoUrl,
                documentoUrl,
                componentes: {
                    create: componentesArray.map(componente => ({
                        nombre: componente
                    }))
                }
            },
            include: { componentes: true }
        });

        res.status(201).json(equipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const obtenerEquipos = async (req, res) => {
  try {
      const equipos = await prisma.equipo.findMany({
          include: {
              componentes: true
          }
      });
      res.status(200).json(equipos);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await prisma.equipo.findUnique({ where: { id: parseInt(id) } });

    if (!equipo) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    if (equipo.fotoUrl) {
      const publicId = equipo.fotoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    if (equipo.documentoUrl) {
      const publicId = equipo.documentoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    }

    await prisma.equipo.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Equipo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  uploadMiddleware, 
  registrarEquipo,
  obtenerEquipos,
  eliminarEquipo
};

