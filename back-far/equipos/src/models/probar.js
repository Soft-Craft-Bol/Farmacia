const EquipoMejorado = require('./EquipoMejorado');

function mostrarPrediccion(equipo) {
  const prediccion = equipo.predecirProximoMantenimiento();
  
  console.log('📊 Predicción de Mantenimiento');
  console.log('-----------------------------');
  console.log(`🖥️ Tipo de equipo: ${equipo.tipo}`);
  console.log(`📅 Último mantenimiento: ${equipo.mantenimientos.length > 0 
    ? equipo.mantenimientos[equipo.mantenimientos.length-1].fecha.toLocaleDateString() 
    : 'Nunca'}`);
  console.log(`🔮 Próximo mantenimiento recomendado: ${prediccion.fecha.toLocaleDateString()}`);
  console.log(`✅ Confianza: ${(prediccion.confianza * 100).toFixed(0)}%`);
  console.log(`📌 Método: ${prediccion.metodo}`);
  
  if (prediccion.factores) {
    console.log('\nFactores de ajuste:');
    console.log(`🌡️ Condiciones ambientales: ${equipo.condicionesAmbientales} (x${prediccion.factores.ambiental.toFixed(2)})`);
    console.log(`⏱️ Horas de uso diario: ${equipo.horasUsoDiarias}h (x${prediccion.factores.uso.toFixed(2)})`);
    console.log(`⚠️ Fallos reportados: ${equipo.fallosReportados} (x${prediccion.factores.fallos.toFixed(2)})`);
  }
  
  const diasRestantes = Math.round((prediccion.fecha - new Date()) / (1000 * 60 * 60 * 24));
  console.log(`\n⏳ Días restantes: ${diasRestantes > 0 ? diasRestantes : 'MANTENIMIENTO ATRASADO!'}`);
}

// Ejemplo de uso
const monitor = new EquipoMejorado('monitor', '2022-05-10', '2022-05-15');
monitor.condicionesAmbientales = 'adversas';
monitor.horasUsoDiarias = 12;
monitor.agregarMantenimiento('2023-05-20', 'preventivo', 'Limpieza y revisión');
monitor.agregarMantenimiento('2024-02-15', 'correctivo', 'Cambio de backlight');

mostrarPrediccion(monitor);