// predictorService.js
function linearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function predictNextMaintenance(historial) {
  if (historial.length < 2) {
    throw new Error("Se requieren al menos 2 mantenimientos para predecir.");
  }

  // Ordenar cronológicamente
  historial.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));

  const fechas = historial.map(h => new Date(h.fechaFin).getTime());
  const horas = historial.map(h => h.horasUso);

  // Convertir fechas a días desde la primera fecha
  const baseDate = fechas[0];
  const dias = fechas.map(f => (f - baseDate) / (1000 * 60 * 60 * 24));

  const { slope, intercept } = linearRegression(dias, horas);
  const horasActuales = historial[historial.length - 1].horasUso;
  const diasPredichos = (horasActuales - intercept) / slope;

  const fechaEstimada = new Date(baseDate + diasPredichos * 24 * 60 * 60 * 1000);

  return {
    fechaEstimada: fechaEstimada.toISOString(),
    diasParaProximo: Math.round(diasPredichos - dias[dias.length - 1])
  };
}

module.exports = { predictNextMaintenance };
