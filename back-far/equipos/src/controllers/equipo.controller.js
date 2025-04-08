const prisma = require('../config/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageUploadPath = path.join(__dirname, '../../uploads/images');
const documentUploadPath = path.join(__dirname, '../../uploads/documents');

// Crear los directorios si no existen
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
const uploadMiddleware = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).fields([
  { name: 'imagenes', maxCount: 4 },  // Cambiado de 'foto'
  { name: 'documentos', maxCount: 4 } // Cambiado de 'documento'
]);

const registrarEquipo = async (req, res) => {
  try {
    console.log("Archivos recibidos:", req.files);
    console.log("Datos del cuerpo:", req.body); 
    
    // Ajuste en los nombres de campos para coincidir con el frontend
    const { 
      etiquetaActivo, numeroSerie, modelo, estado, ubicacion, tipoMantenimiento, 
      fechaCompra, proveedor, numeroOrden, usuarioId, componentes
    } = req.body;

    // Validación completa de campos obligatorios
    const camposObligatorios = [
      'etiquetaActivo', 'numeroSerie', 'modelo', 'estado', 
      'ubicacion', 'tipoMantenimiento', 'usuarioId'
    ];
    
    const faltantes = camposObligatorios.filter(campo => !req.body[campo]);
    
    if (faltantes.length > 0) {
      return res.status(400).json({ 
        error: "Faltan campos obligatorios", 
        camposFaltantes: faltantes 
      });
    }

    // Verificar si el equipo ya existe
    const equipoExistente = await prisma.equipo.findUnique({
      where: { etiquetaActivo }
    });

    if (equipoExistente) {
      return res.status(400).json({ error: "La etiqueta de activo ya existe. Usa una diferente." });
    }

    // Manejo de archivos subidos
    const imagenes = req.files['imagenes'] || [];
    const documentos = req.files['documentos'] || [];
    
    // Tomar la primera imagen y documento como principales
    //const fotoUrl = imagenes.length > 0 ? `/uploads/images/${imagenes[0].filename}` : null;
    //const documentoUrl = documentos.length > 0 ? `/uploads/documents/${documentos[0].filename}` : null;

    const archivosData = {
      fotoUrl1: imagenes[0] ? `/uploads/images/${imagenes[0].filename}` : null,
      fotoUrl2: imagenes[1] ? `/uploads/images/${imagenes[1].filename}` : null,
      fotoUrl3: imagenes[2] ? `/uploads/images/${imagenes[2].filename}` : null,
      fotoUrl4: imagenes[3] ? `/uploads/images/${imagenes[3].filename}` : null,
      documentoUrl1: documentos[0] ? `/uploads/documents/${documentos[0].filename}` : null,
      documentoUrl2: documentos[1] ? `/uploads/documents/${documentos[1].filename}` : null,
      documentoUrl3: documentos[2] ? `/uploads/documents/${documentos[2].filename}` : null,
      documentoUrl4: documentos[3] ? `/uploads/documents/${documentos[3].filename}` : null,
    };

    // Parsear los componentes
    let componentesArray = [];
    try {
      componentesArray = componentes ? JSON.parse(componentes) : [];
    } catch (e) {
      console.error("Error al parsear componentes:", e);
      componentesArray = [];
    }

    // Guardar el equipo en la base de datos
    const equipo = await prisma.equipo.create({
      data: {
        etiquetaActivo,
        numeroSerie,
        modelo,
        estado,
        ubicacion,
        tipoMantenimiento,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        proveedor,
        numeroOrden,
        ...archivosData,
        userId: parseInt(usuarioId),
        componentes: {
          create: componentesArray.map(componente => ({
            nombre: typeof componente === 'object' ? componente.nombre || '' : componente
          }))
        },
        imagenes: {
          create: imagenes.map(img => ({
            url: `/uploads/images/${img.filename}`,
            file: img.originalname,
            isExisting: false // Todos los archivos subidos son nuevos
          }))
        },
        documentos: {
          create: documentos.map(doc => ({
            name: doc.originalname,
            file: doc.filename,
            type: doc.mimetype,
            isExisting: false // Todos los documentos subidos son nuevos
          }))
        }
      },
      include: { 
        componentes: true,
        imagenes: true,
        documentos: true
      }
    });

    res.status(201).json(equipo);
  } catch (error) {
    console.error("Error al registrar equipo:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      console.error("Error al obtener equipos:", error);
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

const obtenerEquipoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipo = await prisma.equipo.findUnique({
      where: { id: parseInt(id) },
      include: {
        componentes: true,
        imagenes: true,
        documentos: true,
      }
    });

    if (!equipo) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json(equipo);
  } catch (error) {
    console.error("Error al obtener equipo por ID:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const actualizarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      etiquetaActivo, numeroSerie, modelo, estado, ubicacion, tipoMantenimiento, 
      fechaCompra, proveedor, numeroOrden, usuarioId, componentes
    } = req.body;

    // Verificar si el equipo existe
    const equipoExistente = await prisma.equipo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!equipoExistente) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    // Manejo de archivos subidos
    const imagenes = req.files['imagenes'] || [];
    const documentos = req.files['documentos'] || [];

    // Preparar datos para actualización
    const updateData = {
      etiquetaActivo,
      numeroSerie,
      modelo,
      estado,
      ubicacion,
      tipoMantenimiento,
      fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
      proveedor,
      numeroOrden,
      userId: parseInt(usuarioId),
    };

    // Añadir URLs de archivos solo si se subieron nuevos
    if (imagenes[0]) updateData.fotoUrl1 = `/uploads/images/${imagenes[0].filename}`;
    if (imagenes[1]) updateData.fotoUrl2 = `/uploads/images/${imagenes[1].filename}`;
    if (imagenes[2]) updateData.fotoUrl3 = `/uploads/images/${imagenes[2].filename}`;
    if (imagenes[3]) updateData.fotoUrl4 = `/uploads/images/${imagenes[3].filename}`;
    
    if (documentos[0]) updateData.documentoUrl1 = `/uploads/documents/${documentos[0].filename}`;
    if (documentos[1]) updateData.documentoUrl2 = `/uploads/documents/${documentos[1].filename}`;
    if (documentos[2]) updateData.documentoUrl3 = `/uploads/documents/${documentos[2].filename}`;
    if (documentos[3]) updateData.documentoUrl4 = `/uploads/documents/${documentos[3].filename}`;

    // Parsear los componentes
    let componentesArray = [];
    try {
      componentesArray = componentes ? JSON.parse(componentes) : [];
    } catch (e) {
      console.error("Error al parsear componentes:", e);
      componentesArray = [];
    }

    // Actualizar el equipo en la base de datos
    const equipoActualizado = await prisma.equipo.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        componentes: {
          deleteMany: {}, // Eliminar todos los componentes existentes
          create: componentesArray.map(componente => ({
            nombre: typeof componente === 'object' ? componente.nombre || '' : componente
          }))
        },
        imagenes: {
          deleteMany: {}, // Eliminar todas las imágenes existentes
          create: imagenes.map(img => ({
            url: `/uploads/images/${img.filename}`,
            file: img.originalname,
            isExisting: false
          }))
        },
        documentos: {
          deleteMany: {}, // Eliminar todos los documentos existentes
          create: documentos.map(doc => ({
            name: doc.originalname,
            file: doc.filename,
            type: doc.mimetype,
            isExisting: false
          }))
        }
      },
      include: { 
        componentes: true,
        imagenes: true,
        documentos: true
      }
    });

    res.status(200).json(equipoActualizado);
  } catch (error) {
    console.error("Error al actualizar equipo:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


module.exports = {
  uploadMiddleware, 
  registrarEquipo,
  obtenerEquipos,
  eliminarEquipo,
  obtenerEquipoPorId,
  actualizarEquipo
};

