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
  try {
    const { nombre, descripcion, fechaInicio, equipoId, area } = req.body;
    const encargadoId = req.body.encargadoId;
    const tipoEquipo = req.body.tipoEquipo || null; 

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

exports.aceptarTrabajo = async (req, res) => {
  console.log("Aceptando trabajo...");
  console.log("Datos recibidos:", req.body);
  const { trabajoId } = req.params;
  const { tecnicoId, encargadoId, fechaInicio, fechaFin, descripcion } = req.body;

  try {
    // 1. Verificar que el trabajo existe y está pendiente
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) },
      include: { 
        asignaciones: true,
        historial: {
          orderBy: { fechaCambio: 'desc' },
          take: 1
        }
      }
    });

    if (!trabajo) {
      return res.status(404).json({ 
        error: 'Trabajo no encontrado',
        details: `No existe un trabajo con ID ${trabajoId}`
      });
    }

    if (trabajo.estado !== 'Pendiente') {
      return res.status(400).json({ 
        error: 'Estado inválido para aceptación',
        details: `Solo se pueden aceptar trabajos en estado "Pendiente". Estado actual: ${trabajo.estado}`,
        estadoActual: trabajo.estado
      });
    }

    // 2. Verificar si ya existe una asignación para este trabajo y técnico
    const asignacionExistente = trabajo.asignaciones.find(a => a.tecnicoId === Number(tecnicoId));
    
    if (asignacionExistente) {
      return res.status(400).json({ 
        error: 'Asignación duplicada',
        details: 'Este técnico ya está asignado a este trabajo',
        asignacionExistente
      });
    }

    // 3. Verificar conflictos de horario para el técnico
    const asignacionesTecnico = await prisma.trabajoAsignacion.findMany({
      where: { 
        tecnicoId: Number(tecnicoId),
        NOT: { trabajoId: Number(trabajoId) } // Excluir el trabajo actual
      }
    });

    const fechaInicioTrabajo = new Date(fechaInicio);
    const fechaFinTrabajo = fechaFin ? new Date(fechaFin) : null;

    const conflicto = asignacionesTecnico.some(asignacion => {
      const inicioExistente = new Date(asignacion.fechaInicio);
      const finExistente = asignacion.fechaFin ? new Date(asignacion.fechaFin) : null;
      
      return (
        (fechaInicioTrabajo < (finExistente || new Date('9999-12-31'))) && 
        ((fechaFinTrabajo || new Date('9999-12-31'))) > inicioExistente
      );
    });

    if (conflicto) {
      return res.status(400).json({
        error: 'Conflicto de horario',
        details: 'El técnico ya tiene trabajos asignados en ese horario',
        periodosOcupados: asignacionesTecnico.map(a => ({
          trabajoId: a.trabajoId,
          fechaInicio: a.fechaInicio,
          fechaFin: a.fechaFin
        }))
      });
    }

    // 4. Usar transacción para asegurar consistencia
    const [trabajoActualizado, asignacion] = await prisma.$transaction([
      // Actualizar el estado del trabajo directamente a "En Progreso"
      prisma.trabajo.update({
        where: { id: Number(trabajoId) },
        data: { 
          estado: 'En Progreso',
          encargadoId: Number(encargadoId),
          fechaInicio: fechaInicioTrabajo,
          fechaFin: fechaFinTrabajo
        }
      }),
      
      // Crear la asignación del técnico
      prisma.trabajoAsignacion.create({
        data: {
          trabajoId: Number(trabajoId),
          tecnicoId: Number(tecnicoId),
          fechaInicio: fechaInicioTrabajo,
          fechaFin: fechaFinTrabajo,
          observaciones: descripcion || 'Trabajo aceptado y puesto en progreso',
          tecnicoNombre: '', // Deberías obtener este dato de tu DB o del request
          fechaAsignacion: new Date()
        }
      })
    ]);

    // 5. Registrar en el historial (dos registros: Aceptado y En Progreso)
    await prisma.$transaction([
      // Registro de aceptación (usando el valor exacto del enum)
      prisma.historialTrabajo.create({
        data: {
          trabajoId: Number(trabajoId),
          estado: 'Aceptado', // Asegúrate que coincida exactamente con el enum
          usuarioId: Number(encargadoId),
          usuarioNombre: 'Sistema',
          comentario: `Trabajo aceptado y asignado al técnico ID: ${tecnicoId}`
        }
      }),
      // Registro de cambio a En Progreso (usando el valor exacto del enum)
      prisma.historialTrabajo.create({
        data: {
          trabajoId: Number(trabajoId),
          estado: 'EnProgreso', // Asegúrate que coincida exactamente con el enum
          usuarioId: Number(encargadoId),
          usuarioNombre: 'Sistema',
          comentario: 'Trabajo puesto en progreso automáticamente al ser aceptado'
        }
      })
    ]);

    return res.status(200).json({
      message: 'Trabajo aceptado y puesto en progreso correctamente',
      data: {
        trabajo: trabajoActualizado,
        asignacion,
        historial: {
          aceptado: true,
          enProgreso: true
        }
      }
    });

  } catch (error) {
    console.error("Error al aceptar trabajo:", error);
    
    let errorMessage = 'Error al aceptar el trabajo';
    if (error.code === 'P2002') {
      errorMessage = 'Error de duplicado en la asignación';
    } else if (error.code === 'P2025') {
      errorMessage = 'El trabajo no existe o fue eliminado';
    }

    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// Controlador para rechazar un trabajo - Versión corregida
exports.rechazarTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({ 
      error: 'Se requiere un motivo para rechazar el trabajo',
      details: 'El campo "motivo" es obligatorio'
    });
  }

  try {
    // 1. Verificar que el trabajo existe y está pendiente
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) }
    });

    if (!trabajo) {
      return res.status(404).json({ 
        error: 'Trabajo no encontrado',
        details: `No existe un trabajo con ID ${trabajoId}`
      });
    }

    if (trabajo.estado !== 'Pendiente') {
      return res.status(400).json({ 
        error: 'Estado inválido para rechazo',
        details: `Solo se pueden rechazar trabajos en estado "Pendiente". Estado actual: ${trabajo.estado}`,
        estadosValidos: ['Pendiente']
      });
    }

    // 2. Actualizar el estado del trabajo a "Rechazado"
    const trabajoActualizado = await prisma.trabajo.update({
      where: { id: Number(trabajoId) },
      data: { 
        estado: 'Rechazado',
        // Agregar motivo al trabajo si es necesario
        descripcion: motivo
      }
    });

    // 3. Registrar en el historial (con verificación de usuario)
    if (req.user && req.user.id) {
      await prisma.historialTrabajo.create({
        data: {
          trabajoId: Number(trabajoId),
          estado: 'Rechazado',
          usuarioId: req.user.id,
          usuarioNombre: req.user.nombre || 'Sistema',
          comentario: motivo
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trabajo rechazado correctamente',
      data: {
        trabajo: trabajoActualizado,
        motivo: motivo
      }
    });

  } catch (error) {
    console.error("Error detallado al rechazar trabajo:", error);
    
    // Mensaje más descriptivo para el cliente
    let errorMessage = 'Error al rechazar el trabajo';
    if (error.code === 'P2002') {
      errorMessage = 'Error de duplicado en el historial';
    } else if (error.code === 'P2025') {
      errorMessage = 'El trabajo no existe o fue eliminado';
    }

    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};