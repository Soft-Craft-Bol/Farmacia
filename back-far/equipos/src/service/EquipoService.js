const prisma = require('../config/prisma');

class EquipoService {
  constructor() {
    // Inicialización de factores de ajuste
    this.factores = {
      ambientales: {
        normales: 1.0,
        adversas: 0.7,
        controladas: 1.2
      },
      uso: {
        referencia: 8, // horas diarias de referencia
        max: 1.5,
        min: 0.7
      },
      fallos: {
        reduccionPorFallo: 0.1,
        min: 0.5
      }
    };
  }

  async predecirMantenimiento(equipoId) {
    // Obtener equipo con su historial
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
      include: {
        historialMantenimientos: {
          orderBy: { fechaInicio: 'asc' }
        }
      }
    });

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    // Calcular predicción base
    const prediccionBase = this.calcularPrediccionBase(equipo);

    // Aplicar factores de ajuste
    const prediccionAjustada = this.aplicarFactoresAjuste(equipo, prediccionBase);

    // Actualizar el equipo con la nueva predicción
    await prisma.equipo.update({
      where: { id: equipoId },
      data: { proximoMantenimiento: prediccionAjustada.fecha }
    });

    return prediccionAjustada;
  }

  calcularPrediccionBase(equipo) {
    const mantenimientos = equipo.historialMantenimientos;
    const intervaloTeorico = equipo.periodoMantenimiento || 180; // En días

    if (mantenimientos.length === 0) {
      // Sin historial, usar intervalo teórico desde fecha de compra
      const fechaPredicha = new Date(equipo.fechaCompra);
      fechaPredicha.setDate(fechaPredicha.getDate() + intervaloTeorico);
      
      return {
        fecha: fechaPredicha,
        confianza: 0.7,
        metodo: 'intervalo teórico (sin historial)',
        intervaloPredicho: intervaloTeorico
      };
    }

    // Calcular intervalos reales entre mantenimientos (en días)
    const intervalosReales = [];
    for (let i = 1; i < mantenimientos.length; i++) {
      const diff = (mantenimientos[i].fechaInicio - mantenimientos[i-1].fechaInicio) / (1000 * 60 * 60 * 24);
      intervalosReales.push(diff);
    }

    // Si solo hay un mantenimiento
    if (intervalosReales.length === 0) {
      const ultimoMantenimiento = mantenimientos[0].fechaInicio;
      const intervaloReal = (ultimoMantenimiento - equipo.fechaCompra) / (1000 * 60 * 60 * 24);
      
      const intervaloPromedio = (intervaloReal + intervaloTeorico) / 2;
      
      const fechaPredicha = new Date(ultimoMantenimiento);
      fechaPredicha.setDate(fechaPredicha.getDate() + intervaloPromedio);
      
      return {
        fecha: fechaPredicha,
        confianza: 0.75,
        metodo: 'promedio entre primer intervalo real y teórico',
        intervaloPredicho: intervaloPromedio
      };
    }

    // Calcular estadísticas de intervalos reales
    const media = intervalosReales.reduce((a, b) => a + b, 0) / intervalosReales.length;
    const desviacion = Math.sqrt(
      intervalosReales.map(x => Math.pow(x - media, 2)).reduce((a, b) => a + b, 0) / intervalosReales.length
    );

    const factorConsistencia = Math.max(0.5, 1 - (desviacion / media));
    const intervaloPredicho = (media * factorConsistencia) + (intervaloTeorico * (1 - factorConsistencia));

    const ultimoMantenimiento = mantenimientos[mantenimientos.length - 1].fechaInicio;
    const fechaPredicha = new Date(ultimoMantenimiento);
    fechaPredicha.setDate(fechaPredicha.getDate() + intervaloPredicho);

    return {
      fecha: fechaPredicha,
      confianza: Math.min(0.95, 0.7 + (factorConsistencia * 0.3)),
      metodo: 'modelo adaptativo con historial',
      intervaloPredicho,
      mediaReal: media,
      desviacionReal: desviacion,
      factorConsistencia
    };
  }

  aplicarFactoresAjuste(equipo, prediccion) {
    // Factor ambiental
    const condicionAmbiental = equipo.condicionesAmbientales || 'normales';
    const factorAmbiental = this.factores.ambientales[condicionAmbiental] || 1.0;

    // Factor de uso
    const horasUso = equipo.horasUsoDiarias || this.factores.uso.referencia;
    const factorUso = Math.min(
      this.factores.uso.max,
      Math.max(
        this.factores.uso.min,
        horasUso / this.factores.uso.referencia
      )
    );

    // Factor de fallos (usando historial de mantenimientos correctivos)
    const fallos = equipo.historialMantenimientos.filter(m => m.tipo === 'Correctivo').length;
    const factorFallos = Math.max(
      this.factores.fallos.min,
      1 - (fallos * this.factores.fallos.reduccionPorFallo)
    );

    // Aplicar factores
    const intervaloAjustado = prediccion.intervaloPredicho * factorAmbiental * factorUso * factorFallos;

    const fechaAjustada = new Date(prediccion.fecha);
    fechaAjustada.setDate(fechaAjustada.getDate() + (intervaloAjustado - prediccion.intervaloPredicho));

    return {
      ...prediccion,
      fecha: fechaAjustada,
      intervaloPredicho: intervaloAjustado,
      confianza: Math.max(0.5, prediccion.confianza * 0.9 + (1 / (1 + fallos)) * 0.1),
      factores: {
        ambiental: factorAmbiental,
        uso: factorUso,
        fallos: factorFallos
      }
    };
  }

  async generarReporteMantenimientos() {
    const equipos = await prisma.equipo.findMany({
      include: {
        historialMantenimientos: {
          orderBy: { fechaInicio: 'desc' },
          take: 1
        }
      }
    });

    const hoy = new Date();
    const reporte = {
      mantenimientosUrgentes: [],
      mantenimientosProximos: [],
      equiposAtrasados: 0,
      equiposAnalizados: equipos.length
    };

    for (const equipo of equipos) {
      const prediccion = await this.predecirMantenimiento(equipo.id);
      
      const diasRestantes = Math.round((prediccion.fecha - hoy) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes < 0) {
        reporte.equiposAtrasados++;
        reporte.mantenimientosUrgentes.push({
          equipoId: equipo.id,
          etiquetaActivo: equipo.etiquetaActivo,
          tipo: equipo.tipoMantenimiento,
          diasAtraso: Math.abs(diasRestantes),
          ultimoMantenimiento: equipo.historialMantenimientos[0]?.fechaInicio,
          proximoMantenimiento: prediccion.fecha
        });
      } else if (diasRestantes <= 30) {
        reporte.mantenimientosProximos.push({
          equipoId: equipo.id,
          etiquetaActivo: equipo.etiquetaActivo,
          tipo: equipo.tipoMantenimiento,
          diasRestantes,
          proximoMantenimiento: prediccion.fecha
        });
      }
    }

    return reporte;
  }
}

module.exports = EquipoService;