const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const cloudinary = require('../config/cloudinary'); // si usas Cloudinary

const ESTADOS_VALIDOS = [
  'Pendiente',
  'En Progreso',
  'Finalizado',
  'Cancelado',
  'Aceptado',
  'Rechazado',
];

exports.createTrabajo = async (req, res) => {
  console.log("Creando trabajo...");
  try {
    const { nombre, descripcion, fechaInicio, fechaFin, encargadoId, estado, area } = req.body;

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    let imagenUrl = null;

    if (req.file) {
      // Si usas Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'trabajos',
      });
      imagenUrl = result.secure_url;

      // Elimina el archivo temporal
      fs.unlinkSync(req.file.path);
    }

    const nuevoTrabajo = await prisma.trabajo.create({
      data: {
        nombre,
        descripcion,
        area,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        encargadoId,
        estado: estado || 'Pendiente',
        imagenes: imagenUrl, // Aquí guardamos la URL de la imagen
      },
    });

    return res.status(201).json({
      message: 'Trabajo creado con éxito',
      data: nuevoTrabajo,
    });
  } catch (error) {
    console.error("Error al crear el trabajo:", error);
    return res.status(500).json({ error: 'Error al crear el trabajo' });
  }
};

/**
 * Obtener todos los trabajos
 */
exports.getAllTrabajos = async (req, res) => {
  try {
    const trabajos = await prisma.trabajo.findMany({
      include: { equipos: true },
    });
    return res.json(trabajos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener los trabajos' });
  }
};

/**
 * Obtener un trabajo por ID
 */
exports.getTrabajoById = async (req, res) => {
  const { trabajoId } = req.params;
  try {
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) },
      include: { equipos: true },
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    return res.json(trabajo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el trabajo' });
  }
};

/**
 * Actualizar un trabajo
 */
exports.updateTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { nombre, descripcion, fechaInicio, fechaFin, encargadoId, estado, area } = req.body; // Agregar area

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: {
        nombre,
        descripcion,
        area, // Agregar area aquí
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        encargadoId,
        estado,
      },
    });

    return res.json({
      message: 'Trabajo actualizado correctamente',
      data: trabajoActualizado,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar el trabajo' });
  }
};


/**
 * Eliminar un trabajo
 */
exports.deleteTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  try {
    await prisma.trabajo.delete({ where: { id: Number(trabajoId) } });
    return res.json({ message: 'Trabajo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar el trabajo' });
  }
};

/**
 * Asignar usuarios a un trabajo
 */
exports.addUsersToTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de usuarios para asignar' });
  }

  try {
    const trabajoExists = await prisma.trabajo.findUnique({ where: { id: Number(trabajoId) } });
    if (!trabajoExists) {
      return res.status(404).json({ error: 'El trabajo no existe' });
    }

    const usuariosAInsertar = users.map((u) => ({
      trabajoId: Number(trabajoId),
      userId: u.userId,
      isAdmin: !!u.isAdmin,
    }));

    await prisma.trabajoEquipo.createMany({
      data: usuariosAInsertar,
      skipDuplicates: true,
    });

    return res.status(200).json({ message: 'Usuarios asignados correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al asignar usuarios al trabajo' });
  }
};

/**
 * Eliminar un usuario de un trabajo
 */
exports.removeUserFromTrabajo = async (req, res) => {
  const { trabajoId, userId } = req.params;
  try {
    await prisma.trabajoEquipo.deleteMany({ where: { trabajoId: Number(trabajoId), userId } });
    return res.json({ message: 'Usuario eliminado del trabajo correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar usuario del trabajo' });
  }
};


exports.updateEstadoTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { estado } = req.body;

  // Validar estado
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado inválido',
      estadosValidos: ESTADOS_VALIDOS
    });
  }

  try {
    // Verificar que el trabajo existe
    const trabajoExistente = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajoExistente) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    // Actualizar solo el estado
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { estado },
    });

    return res.json({
      message: 'Estado actualizado correctamente',
      data: trabajoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return res.status(500).json({ 
      error: 'Error al actualizar el estado del trabajo',
      details: error.message 
    });
  }
};