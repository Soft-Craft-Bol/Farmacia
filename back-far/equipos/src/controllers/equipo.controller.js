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
      fechaCompra, proveedor, numeroOrden, usuarioId, componentes,
      fechaInicioUso, periodoMantenimiento // Campos añadidos para el cálculo
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

    // Verificar si el equipo ya existe por etiqueta de activo O número de serie
    const [equipoPorEtiqueta, equipoPorSerie] = await Promise.all([
      prisma.equipo.findUnique({ where: { etiquetaActivo } }),
      prisma.equipo.findUnique({ where: { numeroSerie } })
    ]);

    if (equipoPorEtiqueta && equipoPorSerie) {
      return res.status(400).json({ 
        error: "Ya existe un equipo con esta etiqueta de activo y número de serie",
        camposDuplicados: ['etiquetaActivo', 'numeroSerie']
      });
    }

    if (equipoPorEtiqueta) {
      return res.status(400).json({ 
        error: "Ya existe un equipo con esta etiqueta de activo",
        campoDuplicado: 'etiquetaActivo'
      });
    }

    if (equipoPorSerie) {
      return res.status(400).json({ 
        error: "Ya existe un equipo con este número de serie",
        campoDuplicado: 'numeroSerie'
      });
    }

    // Función para calcular la próxima fecha de mantenimiento
    const calcularProximoMantenimiento = (fechaInicio, periodo) => {
      const periodoNum = parseInt(periodo);
      if (isNaN(periodoNum) || periodoNum <= 0) return null;
      
      // Si no hay fecha de inicio, usamos la fecha actual
      const fechaBase = fechaInicio ? new Date(fechaInicio) : new Date();
      
      const fechaMantenimiento = new Date(fechaBase);
      fechaMantenimiento.setDate(fechaBase.getDate() + periodoNum);
      
      return fechaMantenimiento;
    };

    // Calcular la próxima fecha de mantenimiento
    const proximoMantenimiento = calcularProximoMantenimiento(
      fechaInicioUso, 
      periodoMantenimiento
    );

     const fechaInicioUsoFinal = fechaInicioUso ? new Date(fechaInicioUso) : new Date();

    // Resto del código para manejar archivos y crear el equipo...
    const imagenes = req.files['imagenes'] || [];
    const documentos = req.files['documentos'] || [];
    
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

    let componentesArray = [];
    try {
      componentesArray = componentes ? JSON.parse(componentes) : [];
    } catch (e) {
      console.error("Error al parsear componentes:", e);
      componentesArray = [];
    }

    console.log("Componentes parseados:", componentesArray);

    const equipo = await prisma.equipo.create({
      data: {
        etiquetaActivo,
        numeroSerie,
        modelo,
        estado,
        ubicacion,
        tipoMantenimiento,
        fechaInicioUso: fechaInicioUsoFinal, 
        periodoMantenimiento: periodoMantenimiento ? parseInt(periodoMantenimiento) : null,
        proximoMantenimiento,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        proveedor,
        numeroOrden,
        ...archivosData,
        tipoEquipo: req.body.tipoEquipo || 'Otro',
        userId: parseInt(usuarioId),
        nombreUsuario: req.body.nombreUsuario || null,
        componentes: {
          create: componentesArray.map(componente => ({
            nombre: typeof componente === 'object' ? componente.nombre || '' : componente
          }))
        },
        imagenes: {
          create: imagenes.map(img => ({
            url: `/uploads/images/${img.filename}`,
            file: img.originalname,
            isExisting: false
          }))
        },
        documentos: {
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

    res.status(201).json(equipo);
  } catch (error) {
    console.error("Error al registrar equipo:", error);
    
    // Manejo específico para errores de Prisma
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      let errorMessage = 'Error de duplicación de datos';
      
      if (field === 'etiquetaActivo') {
        errorMessage = 'Ya existe un equipo con esta etiqueta de activo';
      } else if (field === 'numeroSerie') {
        errorMessage = 'Ya existe un equipo con este número de serie';
      }
      
      return res.status(400).json({ 
        error: errorMessage,
        campoDuplicado: field
      });
    }
    
    // Error genérico para otros casos
    res.status(500).json({ 
      error: "Ocurrió un error al registrar el equipo",
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
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

const getEquiposByUserId = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    try {
        const equipos = await prisma.equipo.findMany({
            where: { userId },
            include: {
                componentes: true,
                imagenes: true,
                documentos: true,
            }
        });
        
        res.json(equipos);
    } catch (error) {
        console.error("Error al obtener equipos por usuario:", error);
        res.status(500).json({ 
            error: "Error al obtener equipos por usuario",
            details: error.message 
        });
    }
};

const contarEquipos = async (req, res) => {
  try {
    const TotalEquipos = await prisma.equipo.count();
    res.json({ total: TotalEquipos });
  } catch (error) {
    console.error("Error al contar equipos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



module.exports = {
  uploadMiddleware, 
  registrarEquipo,
  obtenerEquipos,
  eliminarEquipo,
  obtenerEquipoPorId,
  actualizarEquipo,
  getEquiposByUserId,
  contarEquipos
};

