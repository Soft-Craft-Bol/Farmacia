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
    const { nombre, descripcion, fechaInicio, equipoId, area } = req.body;
    const encargadoId = req.body.encargadoId;
    const tipoEquipo = req.body.tipoEquipo || null; 
    console.log("Tipo de equipo:", tipoEquipo);

    const estado = req.body.estado || 'Pendiente';
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    let imagenUrl = null;

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'trabajos',
        });
        imagenUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Error al subir la imagen:", uploadError);
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }
    }

    // Crear el trabajo - versión corregida
    const nuevoTrabajo = await prisma.trabajo.create({
      data: {
        nombre,
        descripcion,
        fechaInicio: new Date(fechaInicio),
        encargadoId: encargadoId ? parseInt(encargadoId) : null,
        estado,
        area: area || null,  // Usamos el campo string area
        equipoId: equipoId ? parseInt(equipoId) : null,
        imagenes: imagenUrl,
        tipoEquipo: tipoEquipo,
      }
      
    });

    console.log("Trabajo creado:", nuevoTrabajo);

    return res.status(201).json({
      message: 'Trabajo creado con éxito',
      data: nuevoTrabajo,
    });
  } catch (error) {
    console.error("Error al crear el trabajo:", error);
    return res.status(500).json({ 
      error: 'Error al crear el trabajo',
      details: error.message 
    });
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

// estados de trabajo 
exports.aceptarTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { tecnicoId, fechaInicio, fechaFin, descripcion } = req.body;

  try {
    // Verificar que el trabajo existe y está pendiente
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    if (trabajo.estado !== 'Pendiente') {
      return res.status(400).json({ error: 'Solo se pueden aceptar trabajos pendientes' });
    }

    // Crear la asignación del técnico
    const asignacion = await prisma.trabajoAsignacion.create({
      data: {
        trabajoId: Number(trabajoId),
        tecnicoId: Number(tecnicoId),
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        observaciones: descripcion || ''
      }
    });

    // Actualizar el estado del trabajo a "Aceptado"
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { 
        estado: 'Aceptado',
        encargadoId: Number(tecnicoId),
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null
      },
      include: {
        asignaciones: true
      }
    });

    // Registrar en el historial
    await prisma.historialTrabajo.create({
      data: {
        trabajoId: Number(trabajoId),
        estado: 'Aceptado',
        usuarioId: req.user.id, // Asume que tienes el usuario en el request
        comentario: `Trabajo aceptado y asignado al técnico ID: ${tecnicoId}`
      }
    });

    return res.status(200).json({
      message: 'Trabajo aceptado y asignado correctamente',
      data: {
        trabajo: trabajoActualizado,
        asignacion
      }
    });

  } catch (error) {
    console.error("Error al aceptar trabajo:", error);
    return res.status(500).json({ 
      error: 'Error al aceptar el trabajo',
      details: error.message 
    });
  }
};

// Controlador para cambiar a "En Progreso"
exports.iniciarTrabajo = async (req, res) => {
  const { trabajoId } = req.params;

  try {
    // Verificar que el trabajo existe y está aceptado
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    if (trabajo.estado !== 'Aceptado') {
      return res.status(400).json({ 
        error: 'Solo se pueden iniciar trabajos en estado "Aceptado"' 
      });
    }

    // Actualizar estado
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { estado: 'En Progreso' }
    });

    // Registrar en el historial
    await prisma.historialTrabajo.create({
      data: {
        trabajoId: Number(trabajoId),
        estado: 'En Progreso',
        usuarioId: req.user.id,
        comentario: 'Trabajo iniciado'
      }
    });

    return res.status(200).json({
      message: 'Trabajo marcado como "En Progreso"',
      data: trabajoActualizado
    });

  } catch (error) {
    console.error("Error al iniciar trabajo:", error);
    return res.status(500).json({ 
      error: 'Error al iniciar el trabajo',
      details: error.message 
    });
  }
};

// Controlador para finalizar un trabajo
exports.finalizarTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { comentario } = req.body;

  try {
    // Verificar que el trabajo existe y está en progreso
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    if (trabajo.estado !== 'En Progreso') {
      return res.status(400).json({ 
        error: 'Solo se pueden finalizar trabajos en estado "En Progreso"' 
      });
    }

    // Actualizar estado
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { estado: 'Finalizado' }
    });

    // Registrar en el historial
    await prisma.historialTrabajo.create({
      data: {
        trabajoId: Number(trabajoId),
        estado: 'Finalizado',
        usuarioId: req.user.id,
        comentario: comentario || 'Trabajo finalizado'
      }
    });

    return res.status(200).json({
      message: 'Trabajo finalizado correctamente',
      data: trabajoActualizado
    });

  } catch (error) {
    console.error("Error al finalizar trabajo:", error);
    return res.status(500).json({ 
      error: 'Error al finalizar el trabajo',
      details: error.message 
    });
  }
};

// Controlador para cancelar un trabajo
exports.cancelarTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({ error: 'Se requiere un motivo para cancelar el trabajo' });
  }

  try {
    // Verificar que el trabajo existe y no está finalizado/cancelado
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    if (['Finalizado', 'Cancelado'].includes(trabajo.estado)) {
      return res.status(400).json({ 
        error: `No se puede cancelar un trabajo en estado "${trabajo.estado}"` 
      });
    }

    // Actualizar estado
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { estado: 'Cancelado' }
    });

    // Registrar en el historial
    await prisma.historialTrabajo.create({
      data: {
        trabajoId: Number(trabajoId),
        estado: 'Cancelado',
        usuarioId: req.user.id,
        comentario: motivo
      }
    });

    return res.status(200).json({
      message: 'Trabajo cancelado correctamente',
      data: trabajoActualizado
    });

  } catch (error) {
    console.error("Error al cancelar trabajo:", error);
    return res.status(500).json({ 
      error: 'Error al cancelar el trabajo',
      details: error.message 
    });
  }
};

// Controlador para rechazar un trabajo
exports.rechazarTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({ error: 'Se requiere un motivo para rechazar el trabajo' });
  }

  try {
    // Verificar que el trabajo existe y está pendiente
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    if (trabajo.estado !== 'Pendiente') {
      return res.status(400).json({ 
        error: 'Solo se pueden rechazar trabajos en estado "Pendiente"' 
      });
    }

    // Actualizar estado
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { estado: 'Rechazado' }
    });

    // Registrar en el historial
    await prisma.historialTrabajo.create({
      data: {
        trabajoId: Number(trabajoId),
        estado: 'Rechazado',
        usuarioId: req.user.id,
        comentario: motivo
      }
    });

    return res.status(200).json({
      message: 'Trabajo rechazado correctamente',
      data: trabajoActualizado
    });

  } catch (error) {
    console.error("Error al rechazar trabajo:", error);
    return res.status(500).json({ 
      error: 'Error al rechazar el trabajo',
      details: error.message 
    });
  }
};