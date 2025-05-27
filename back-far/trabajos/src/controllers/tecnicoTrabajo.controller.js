const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const asignarTrabajosMasivos = async (req, res) => {
  const { tecnicoId, trabajosIds } = req.body;
  
  try {

    const trabajos = await prisma.trabajo.findMany({
      where: { id: { in: trabajosIds.map(id => Number(id)) } },
      include: { asignaciones: true }
    });
    
    // 3. Verificar que todos los trabajos existen y están pendientes
    if (trabajos.length !== trabajosIds.length) {
      return res.status(404).json({ error: 'Algunos trabajos no existen' });
    }
    
    const trabajosNoPendientes = trabajos.filter(t => t.estado !== 'Pendiente');
    if (trabajosNoPendientes.length > 0) {
      return res.status(400).json({ 
        error: 'Algunos trabajos no están pendientes',
        trabajosInvalidos: trabajosNoPendientes.map(t => t.id)
      });
    }
    
    // 4. Verificar solapamiento de horarios
    const asignacionesTecnico = await prisma.trabajoAsignacion.findMany({
      where: { tecnicoId: Number(tecnicoId) }
    });
    
    const conflictos = [];
    
    await Promise.all(trabajos.map(async (trabajo) => {
      const solapado = asignacionesTecnico.some(asignacion => {
        return (
          (new Date(trabajo.fechaInicio) < new Date(asignacion.fechaFin)) &&
          (new Date(trabajo.fechaFin) > new Date(asignacion.fechaInicio))
        );
      });
      
      if (solapado) {
        conflictos.push({
          trabajoId: trabajo.id,
          nombre: trabajo.nombre,
          fechaInicio: trabajo.fechaInicio,
          fechaFin: trabajo.fechaFin
        });
      }
    }));
    
    if (conflictos.length > 0) {
      return res.status(400).json({
        error: 'Conflicto de horarios detectado',
        conflictos,
        message: 'El técnico ya tiene trabajos asignados en esos horarios'
      });
    }
    
    // 5. Asignar trabajos en una transacción
    const resultados = await prisma.$transaction(
      trabajos.map(trabajo => 
        prisma.trabajoAsignacion.create({
          data: {
            trabajoId: trabajo.id,
            tecnicoId: Number(tecnicoId),
            fechaInicio: trabajo.fechaInicio,
            fechaFin: trabajo.fechaFin,
            observaciones: `Asignación masiva - ${new Date().toISOString()}`
          }
        })
      )
    );
    
    // 6. Actualizar estados de los trabajos
    await prisma.trabajo.updateMany({
      where: { id: { in: trabajosIds.map(id => Number(id)) } },
      data: { estado: 'Aceptado' }
    });
    
    // 7. Registrar en historial
    await prisma.historialTrabajo.createMany({
      data: trabajos.map(trabajo => ({
        trabajoId: trabajo.id,
        estado: 'Aceptado',
        usuarioId: Number(tecnicoId), // o el ID del usuario que hace la asignación
        usuarioNombre: 'Sistema',
        comentario: `Asignado al técnico ${tecnicoId} en asignación masiva`
      }))
    });
    
    return res.status(200).json({
      message: 'Trabajos asignados correctamente',
      totalAsignados: resultados.length,
      detalles: resultados
    });
    
  } catch (error) {
    console.error("Error en asignación masiva:", error);
    return res.status(500).json({
      error: 'Error al asignar trabajos',
      details: error.message
    });
  }
};


const finalizarTrabajoTecnico = async (req, res) => {
  console.log("finalizarTrabajoTecnico called with params:", req.params);
  const { trabajoId, tecnicoId } = req.params;
  const { 
    observaciones, 
    solucionAplicada,
    materialesUtilizados,
    horasTrabajadas,
    recomendaciones 
  } = req.body;
  
  try {
    // 1. Verificar que la asignación existe
    const asignacion = await prisma.trabajoAsignacion.findFirst({
      where: {
        trabajoId: Number(trabajoId),
        tecnicoId: Number(tecnicoId)
      },
      include: { trabajo: true }
    });
    
    if (!asignacion) {
      return res.status(404).json({ 
        error: 'Asignación no encontrada',
        message: 'Este técnico no tiene asignado este trabajo'
      });
    }
    
    // 2. Verificar que el trabajo está en progreso
    if (asignacion.trabajo.estado !== 'En Progreso') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'Solo se pueden finalizar trabajos en estado "En Progreso"',
        estadoActual: asignacion.trabajo.estado
      });
    }
    
    // 3. Procesar archivos adjuntos
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
    let documentos = [];
    let imagenes = [];
    
    if (req.files) {
      // Procesar documentos
      if (req.files.documentos) {
        documentos = req.files.documentos.map(file => ({
          nombre: file.originalname,
          url: `${baseUrl}/documents/${file.filename}`,
          path: file.path,
          tipo: file.mimetype,
          tamaño: file.size
        }));
      }
      
      // Procesar imágenes
      if (req.files.imagenes) {
        imagenes = req.files.imagenes.map(file => ({
          nombre: file.originalname,
          url: `${baseUrl}/images/${file.filename}`,
          path: file.path,
          tipo: file.mimetype,
          tamaño: file.size
        }));
      }
    }
    
    // 4. Crear objeto con datos de finalización
    const datosFinalizacion = {
      fechaFinalizacion: new Date(),
      observaciones: observaciones || 'Trabajo finalizado por el técnico',
      solucionAplicada,
      materialesUtilizados,
      horasTrabajadas: horasTrabajadas ? parseFloat(horasTrabajadas) : null,
      recomendaciones,
      documentos: documentos.length > 0 ? JSON.stringify(documentos) : null,
      imagenes: imagenes.length > 0 ? JSON.stringify(imagenes) : null
    };
    
    // 5. Actualizar en transacción (sin el reporte de finalización)
    const [trabajoActualizado, asignacionActualizada] = await prisma.$transaction([
      // Actualizar estado del trabajo
      prisma.trabajo.update({
        where: { id: Number(trabajoId) },
        data: { 
          estado: 'Finalizado',
          fechaFin: new Date()
        }
      }),
      
      // Actualizar asignación con más detalles
      prisma.trabajoAsignacion.update({
        where: { id: asignacion.id },
        data: { 
          fechaFin: new Date(),
          observaciones: datosFinalizacion.observaciones,
          // Puedes agregar más campos aquí si necesitas
        }
      })
    ]);
    
    // 6. Registrar en historial con toda la información
    await prisma.historialTrabajo.create({
      data: {
        trabajoId: Number(trabajoId),
        estado: 'Finalizado',
        usuarioId: Number(tecnicoId),
        usuarioNombre: 'Técnico',
        comentario: observaciones || 'Trabajo finalizado por el técnico',
        metadata: JSON.stringify({
          solucionAplicada,
          materialesUtilizados,
          horasTrabajadas,
          recomendaciones,
          documentos: documentos.map(d => d.url),
          imagenes: imagenes.map(i => i.url)
        })
      }
    });
    
    return res.status(200).json({
      message: 'Trabajo finalizado correctamente',
      data: {
        trabajo: trabajoActualizado,
        asignacion: asignacionActualizada,
        documentos: documentos,
        imagenes: imagenes
      }
    });
    
  } catch (error) {
    console.error("Error al finalizar trabajo:", error);
    
    // Limpiar archivos subidos si hubo error
    if (req.files) {
      const allFiles = [...(req.files.documentos || []), ...(req.files.imagenes || [])];
      allFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    return res.status(500).json({
      error: 'Error al finalizar el trabajo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCargaTecnico = async (req, res) => {
  const { tecnicoId } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  
  try {
    const whereClause = {
      tecnicoId: Number(tecnicoId),
      ...(fechaInicio && fechaFin && {
        fechaInicio: { gte: new Date(fechaInicio) },
        fechaFin: { lte: new Date(fechaFin) }
      })
    };
    
    const asignaciones = await prisma.trabajoAsignacion.findMany({
      where: whereClause,
      include: {
        trabajo: {
          select: {
            id: true,
            nombre: true,
            estado: true,
            prioridad: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
    
    // Calcular carga horaria
    const cargaHoraria = asignaciones.reduce((total, asignacion) => {
      const horas = (asignacion.fechaFin - asignacion.fechaInicio) / (1000 * 60 * 60);
      return total + horas;
    }, 0);
    
    return res.status(200).json({
      totalTrabajos: asignaciones.length,
      cargaHoraria: `${cargaHoraria.toFixed(2)} horas`,
      asignaciones
    });
    
  } catch (error) {
    console.error("Error al obtener carga:", error);
    return res.status(500).json({
      error: 'Error al obtener carga del técnico',
      details: error.message
    });
  }
};

const getTrabajosEnProgresoYRechazados = async (req, res) => {
  try {
    const trabajos = await prisma.trabajo.findMany({
      where: {
        estado: {
          in: ['Pendiente', 'En Progreso', 'Finalizado']
        }
      },
      include: {
        asignaciones: {
          include: {
            trabajo: true // Incluir datos básicos del trabajo en cada asignación
          }
        },
        historial: {
          take: 1, // Solo el último registro de historial
          orderBy: {
            fechaCambio: 'desc'
          }
        },
        
      },
      orderBy: {
        prioridad: 'desc' // Ordenar por prioridad (Urgente primero)
      }
    });

    const trabajosFormateados = trabajos.map(trabajo => ({
      id: trabajo.id,
      nombre: trabajo.nombre,
      descripcion: trabajo.descripcion,
      estado: trabajo.estado,
      prioridad: trabajo.prioridad,
      fechaInicio: trabajo.fechaInicio,
      fechaFin: trabajo.fechaFin,
      encargado: {
        id: trabajo.encargadoId,
        nombre: trabajo.encargadoNombre
      },
      asignaciones: trabajo.asignaciones,
      ultimoHistorial: trabajo.historial[0] || null,
    }));

    res.status(200).json({
      success: true,
      count: trabajos.length,
      data: trabajosFormateados
    });

  } catch (error) {
    console.error('Error al obtener trabajos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener trabajos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
};


const getTrabajosFinalizadosConHistorial = async (req, res) => {
  try {
    // 1. Buscar los historiales con estado 'Finalizado'
    const historialesFinalizados = await prisma.historialTrabajo.findMany({
      where: {
        estado: 'Finalizado'
      },
      select: {
        trabajoId: true
      },
      distinct: ['trabajoId']
    });

    const trabajoIdsFinalizados = historialesFinalizados.map(h => h.trabajoId);

    // 2. Traer los trabajos finalizados con sus historiales
    const trabajos = await prisma.trabajo.findMany({
      where: {
        id: { in: trabajoIdsFinalizados }
      },
      include: {
        historial: {
          orderBy: {
            fechaCambio: 'asc'
          }
        },
        asignaciones: true
      }
    });

    return res.status(200).json({
      total: trabajos.length,
      trabajos
    });

  } catch (error) {
    console.error("Error al obtener trabajos finalizados:", error);
    return res.status(500).json({
      error: 'Error al obtener trabajos finalizados',
      details: error.message
    });
  }
};


module.exports = {
    asignarTrabajosMasivos,
    finalizarTrabajoTecnico,
    getCargaTecnico,
    getTrabajosEnProgresoYRechazados,
getTrabajosFinalizadosConHistorial    
};