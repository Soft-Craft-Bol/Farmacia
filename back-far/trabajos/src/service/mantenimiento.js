console.log("🔧 Iniciando predicción...");

const matrizTransicion = {
  Preventivo: { Preventivo: 0.7, Correctivo: 0.3 },
  Correctivo: { Preventivo: 0.6, Correctivo: 0.4 },
};

const intervaloDias = {
  Preventivo: [50, 70],
  Correctivo: [30, 60],
};

function predecirSiguienteMantenimiento(actual) {
  const transiciones = matrizTransicion[actual];
  const aleatorio = Math.random();
  let acumulado = 0;

  for (const estado in transiciones) {
    acumulado += transiciones[estado];
    if (aleatorio <= acumulado) return estado;
  }

  return actual;
}

function diasAleatoriosEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sumarDias(fecha, dias) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

const maquinas = [
  { nombre: "Laptop A", ultimoMantenimiento: "Preventivo", fechaUltimo: "2025-05-01" },
  { nombre: "Impresora B", ultimoMantenimiento: "Correctivo", fechaUltimo: "2025-06-10" },
  { nombre: "Servidor C", ultimoMantenimiento: "Correctivo", fechaUltimo: "2025-06-01" },
  { nombre: "PC D", ultimoMantenimiento: "Preventivo", fechaUltimo: "2025-06-15" },
];

console.log("📦 Predicción de próximo mantenimiento con fechas:");
maquinas.forEach((m) => {
  const tipoPredicho = predecirSiguienteMantenimiento(m.ultimoMantenimiento);
  const [min, max] = intervaloDias[tipoPredicho];
  const dias = diasAleatoriosEntre(min, max);
  const fechaProxima = sumarDias(new Date(m.fechaUltimo), dias);

  console.log(`🖥️  ${m.nombre}`);
  console.log(`   Último: ${m.ultimoMantenimiento} (${m.fechaUltimo})`);
  console.log(`   🔮 Siguiente: ${tipoPredicho} en ${dias} días → 📅 ${fechaProxima.toISOString().split("T")[0]}`);
});
