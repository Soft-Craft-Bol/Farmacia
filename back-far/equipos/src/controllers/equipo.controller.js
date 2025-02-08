const cloudinary = require('../config/cloudinary');
const prisma = require('../config/prisma');

// Registrar un equipo con foto
exports.registrarEquipo = async (req, res) => {
  try {
    const { etiquetaActivo, numeroSerie, modelo, estado, ubicacion, tipoMantenimiento, fechaCompra, proveedor, numeroOrden } = req.body;
    
    let fotoUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      fotoUrl = result.secure_url;
    }

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
      },
    });

    res.status(201).json(equipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los equipos
exports.obtenerEquipos = async (req, res) => {
  try {
    const equipos = await prisma.equipo.findMany();
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un equipo y su imagen de Cloudinary
exports.eliminarEquipo = async (req, res) => {
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

    await prisma.equipo.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Equipo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
