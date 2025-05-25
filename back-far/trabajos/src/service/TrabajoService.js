const prisma = require('../config/prisma')

class TrabajoService {
  constructor() {
    this.estados = {
      PENDIENTE: 'Pendiente',
      EN_PROGRESO: 'EnProgreso',
      COMPLETADO: 'Finalizado'
    };
  }

  async crearTrabajoMantenimiento(equipoId, tipo, fechaProgramada, prioridad = 'Media') {
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId }
    });

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    const trabajo = await prisma.trabajo.create({
      data: {
        nombre: `Mantenimiento ${tipo} - ${equipo.etiquetaActivo}`,
        descripcion: `Mantenimiento programado para equipo ${equipo.modelo}`,
        fechaInicio: fechaProgramada,
        tipoEquipo: equipo.tipoMantenimiento,
        estado: this.estados.PENDIENTE,
        prioridad,
        areaId: equipo.ubicacion,
        equipoId: equipo.id,
        nombreEquipo: equipo.modelo
      }
    });

    // Aquí podrías integrar con tu sistema de notificaciones
    // para avisar a los técnicos responsables

    return trabajo;
  }

  async programarMantenimientosDesdePredicciones() {
    const equipoService = new (require('./EquipoService'))();
    const reporte = await equipoService.generarReporteMantenimientos();

    const trabajosCreados = [];

    // Crear trabajos urgentes (atrasados)
    for (const urgente of reporte.mantenimientosUrgentes) {
      const trabajo = await this.crearTrabajoMantenimiento(
        urgente.equipoId,
        'Correctivo',
        new Date(), // Inmediato
        'Urgente'
      );
      trabajosCreados.push(trabajo);
    }

    // Crear trabajos próximos (preventivos)
    for (const proximo of reporte.mantenimientosProximos) {
      const trabajo = await this.crearTrabajoMantenimiento(
        proximo.equipoId,
        'Preventivo',
        new Date(proximo.proximoMantenimiento),
        proximo.diasRestantes < 15 ? 'Alta' : 'Media'
      );
      trabajosCreados.push(trabajo);
    }

    return {
      totalTrabajosCreados: trabajosCreados.length,
      trabajosCreados,
      reporteOriginal: reporte
    };
  }
}

module.exports = TrabajoService;