const Equipo = require('./Equipo');
// Crear un equipo
const laptop = new Equipo('laptop', '2020-01-15', '2020-02-01');

// Agregar mantenimientos reales (pueden estar fuera del intervalo teórico)
laptop.agregarMantenimiento('2022-06-10', 'preventivo', 'Mantenimiento regular');
laptop.agregarMantenimiento('2023-11-15', 'correctivo', 'Cambio de ventilador');
laptop.agregarMantenimiento('2024-03-20', 'preventivo', 'Limpieza general');

// Predecir próximo mantenimiento
const prediccion = laptop.predecirProximoMantenimiento();

console.log('Próximo mantenimiento predicho:');
console.log(`Fecha: ${prediccion.fecha.toLocaleDateString()}`);
console.log(`Confianza: ${(prediccion.confianza * 100).toFixed(1)}%`);
console.log(`Método: ${prediccion.metodo}`);
console.log(`Intervalo predicho: ${prediccion.intervaloPredicho.toFixed(1)} meses`);