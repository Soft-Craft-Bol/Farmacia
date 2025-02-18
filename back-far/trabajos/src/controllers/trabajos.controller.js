const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ESTADOS_VALIDOS = ['Pendiente', 'En Progreso', 'Finalizado'];


exports.createTrabajo = async (req, res) => {
  try {
    const { nombre, descripcion, fechaInicio, fechaFin, encargadoId, estado } = req.body;
    
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
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
      },
    });

    return res.status(201).json({
      message: 'Trabajo creado con éxito',
      data: nuevoTrabajo,
    });
  } catch (error) {
    console.error(error);
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
  const { nombre, descripcion, fechaInicio, fechaFin, encargadoId, estado } = req.body;

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: {
        nombre,
        descripcion,
        area,
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

/**
 * Actualizar solo el estado de un trabajo
 */
exports.updateEstadoTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { estado } = req.body;

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { estado },
    });

    return res.json({
      message: 'Estado actualizado correctamente',
      data: trabajoActualizado,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar el estado del trabajo' });
  }
};

