const { predictNextMaintenance } = require('./regressionModel');

const input = {
  equipoId: 1,
  fechaInicioUso: "2022-01-01T00:00:00.000Z",
  historialMantenimientos: [
    { fechaFin: "2022-07-01T00:00:00.000Z", horasUso: 500 },
    { fechaFin: "2023-01-01T00:00:00.000Z", horasUso: 1100 },
    { fechaFin: "2023-07-01T00:00:00.000Z", horasUso: 1650 }
  ]
};

const prediccion = predictNextMaintenance(input.historialMantenimientos);
console.log("Próximo mantenimiento estimado:", prediccion);
