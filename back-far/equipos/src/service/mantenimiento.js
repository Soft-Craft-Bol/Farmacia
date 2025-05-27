const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sumarDias(fecha, dias) {
  const fechaNueva = new Date(fecha);
  fechaNueva.setDate(fechaNueva.getDate() + Math.round(dias));
  return fechaNueva;
}

function entrenarRegresionLineal(X, Y) {
  const n = X.length;
  const sumX = X.reduce((a,b) => a + b, 0);
  const sumY = Y.reduce((a,b) => a + b, 0);
  const sumXY = X.reduce((sum, x, i) => sum + x * Y[i], 0);
  const sumX2 = X.reduce((sum, x) => sum + x * x, 0);

  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) {
    return { a: 0, b: 0 };
  }
  const b = (n * sumXY - sumX * sumY) / denominator;
  const a = (sumY - b * sumX) / n;

  return { a, b };
}

function predecir(reg, x) {
  return reg.a + reg.b * x;
}

async function obtenerEquiposConMantenimiento2(req, res) {
  try {
    const equipos = await prisma.equipo.findMany({
      select: {
        ultimoMantenimiento: true,
        proximoMantenimiento: true,
        horasUsoAcumuladas: true,
        userId: true,
        nombreUsuario: true,
        periodoMantenimiento: true,
        ubicacion: true,
        tipoMantenimiento: true,
        fechaCompra: true,
        fechaInicioUso: true,
        proveedor: true,
        numeroOrden: true,
        tipoEquipo: true,
      },
    });

    const datosHistoricos = [
      { x: 100, y: 90 },
      { x: 200, y: 85 },
      { x: 300, y: 80 },
      { x: 400, y: 75 },
      { x: 500, y: 70 },
    ];

    const X = datosHistoricos.map(d => d.x);
    const Y = datosHistoricos.map(d => d.y);

    const regresion = entrenarRegresionLineal(X, Y);

    const resultado = equipos.map((eq) => {
      const fechaBase = eq.ultimoMantenimiento ?? eq.fechaInicioUso;
      let proximoMantSimple = null;
      if (fechaBase && eq.periodoMantenimiento) {
        proximoMantSimple = sumarDias(fechaBase, eq.periodoMantenimiento);
      }

      const fechaBaseDate = fechaBase ? new Date(fechaBase) : null;

      const horasUso = eq.horasUsoAcumuladas || 0;
      let diasPredichos = predecir(regresion, horasUso);

      if (diasPredichos <= 0) diasPredichos = eq.periodoMantenimiento;

      const tolerancia = 30;
      const limiteInferior = Math.max(eq.periodoMantenimiento - tolerancia, 0);
      const limiteSuperior = eq.periodoMantenimiento;

      let diasParaProximo = diasPredichos;
      if (diasParaProximo < limiteInferior) diasParaProximo = limiteInferior;
      if (diasParaProximo > limiteSuperior) diasParaProximo = limiteSuperior;

      let proximoMantRegresion = null;
      if (fechaBaseDate) {
        proximoMantRegresion = sumarDias(fechaBaseDate, diasParaProximo);
      }

      return {
        ...eq,
        proximoMantenimientoSimple: proximoMantSimple,
        proximoMantenimientoRegresion: proximoMantRegresion,
        diasPredichos: diasPredichos.toFixed(2),
        diasParaProximo,
        limiteInferior,
        limiteSuperior,
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {
  obtenerEquiposConMantenimiento2,
};
