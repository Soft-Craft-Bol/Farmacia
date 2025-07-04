const prisma = require('../config/prisma');

const registrarMantenimiento = async (req, res) => {
    console.log("Registrar mantenimiento - Datos recibidos:", req.body);
  try {
    const { equipoId, tipo, descripcion, horasUso, tecnicoId, tecnicoNombre, estadoActual } = req.body;
    
    // Validar campos obligatorios
    if (!equipoId || !tipo || !tecnicoId || !tecnicoNombre || !estadoActual) {
      return res.status(400).json({ 
        error: "Faltan campos obligatorios",
        detalles: {
          equipoId: !equipoId ? "Requerido" : "OK",
          tipo: !tipo ? "Requerido" : "OK",
          tecnicoId: !tecnicoId ? "Requerido" : "OK",
          tecnicoNombre: !tecnicoNombre ? "Requerido" : "OK",
          estadoActual: !estadoActual ? "Requerido" : "OK"
        }
      });
    }

    // Obtener el equipo y su historial
    const equipo = await prisma.equipo.findUnique({
      where: { id: parseInt(equipoId) },
      include: {
        historialMantenimientos: {
          orderBy: { fechaFin: 'desc' },
          take: 5
        },
        componentes: true
      }
    });

    if (!equipo) {
      return res.status(404).json({ 
        error: "Equipo no encontrado",
        equipoId
      });
    }

    // 1. Cálculo base usando el período fijo
    const calcularPorPeriodoFijo = () => {
      if (!equipo.periodoMantenimiento) return null;
      const fechaBase = new Date();
      fechaBase.setDate(fechaBase.getDate() + equipo.periodoMantenimiento);
      return fechaBase;
    };

    // 2. Ajuste por estado del equipo
    const factoresEstado = {
      'En uso intensivo': 0.8,
      'En uso normal': 1.0,
      'En desuso': 1.3,
      'En mantenimiento': 1.1,
      'Dañado': 0.7
    };
    
    const factorEstado = factoresEstado[estadoActual] || 1.0;

    // 3. Modelo de Markov simple
    const probabilidadFalla = await calcularProbabilidadFalla(equipo);
    const factorMarkov = 1 + (0.5 - probabilidadFalla);

    // 4. Factor por horas de uso
    const horasTotales = equipo.horasUsoAcumuladas + (parseInt(horasUso) || 0);
    const factorHoras = Math.min(1.5, 1 + (horasTotales / 10000));

    // Cálculo final
    let proximoMantenimiento = calcularPorPeriodoFijo();
    let diasAjustados = equipo.periodoMantenimiento;
    
    if (proximoMantenimiento && equipo.periodoMantenimiento) {
      diasAjustados = Math.round(equipo.periodoMantenimiento * factorEstado * factorMarkov * factorHoras);
      proximoMantenimiento = new Date();
      proximoMantenimiento.setDate(proximoMantenimiento.getDate() + diasAjustados);
    }

    // Registrar el mantenimiento
    const fechaFin = new Date();
    const mantenimiento = await prisma.historialMantenimiento.create({
      data: {
        equipoId: equipo.id,
        fechaInicio: fechaFin,
        fechaFin,
        tipo,
        descripcion: descripcion || null,
        horasUso: parseInt(horasUso) || 0,
        tecnicoId: parseInt(tecnicoId),
        tecnicoNombre,
        parametrosPrediccion: {
          factorEstado,
          factorMarkov,
          factorHoras,
          probabilidadFalla,
          diasBase: equipo.periodoMantenimiento,
          diasAjustados
        }
      }
    });

    // Actualizar el equipo
    const equipoActualizado = await prisma.equipo.update({
      where: { id: equipo.id },
      data: {
        ultimoMantenimiento: fechaFin,
        proximoMantenimiento,
        horasUsoAcumuladas: horasTotales,
        estado: estadoActual
      },
      include: {
        componentes: true,
        historialMantenimientos: {
          orderBy: { fechaFin: 'desc' },
          take: 1
        }
      }
    });

    res.status(201).json({
      success: true,
      mantenimiento,
      equipo: equipoActualizado,
      prediccion: {
        proximoMantenimiento,
        factores: {
          estado: factorEstado,
          markov: factorMarkov,
          horas: factorHoras,
          probabilidadFalla
        },
        diasBase: equipo.periodoMantenimiento,
        diasAjustados
      }
    });

  } catch (error) {
    console.error("Error al registrar mantenimiento:", error);
    res.status(500).json({ 
      success: false,
      error: "Error al registrar mantenimiento",
      detalles: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// Funciones auxiliares
async function calcularProbabilidadFalla(equipo) {
  const matrizMarkov = {
    'Preventivo': { Preventivo: 0.1, Correctivo: 0.3, Predictivo: 0.05 },
    'Correctivo': { Preventivo: 0.2, Correctivo: 0.5, Predictivo: 0.1 },
    'Predictivo': { Preventivo: 0.05, Correctivo: 0.1, Predictivo: 0.02 }
  };

  if (equipo.historialMantenimientos.length === 0) {
    return 0.15; // Probabilidad base para equipo nuevo
  }

  const ultimoMantenimiento = equipo.historialMantenimientos[0];
  const tipoUltimo = ultimoMantenimiento.tipo in matrizMarkov ? ultimoMantenimiento.tipo : 'Preventivo';
  
  // Considerar también el estado del equipo
  const factorEstado = {
    'En uso intensivo': 1.3,
    'En uso normal': 1.0,
    'En desuso': 0.8,
    'En mantenimiento': 0.7,
    'Dañado': 1.5
  }[equipo.estado] || 1.0;

  // Probabilidad base según tipo de último mantenimiento
  const probabilidadBase = matrizMarkov[tipoUltimo][tipo] || 0.1;
  
  return Math.min(0.9, probabilidadBase * factorEstado);
}

// Otras funciones del controlador...
const obtenerHistorialPorEquipo = async (req, res) => {
  // Implementación...
};

const obtenerMantenimientoPorId = async (req, res) => {
  // Implementación...
};

module.exports = {
  registrarMantenimiento,
  obtenerHistorialPorEquipo,
  obtenerMantenimientoPorId
};