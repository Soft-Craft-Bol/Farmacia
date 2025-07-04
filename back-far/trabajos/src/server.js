const express = require('express');
const path = require('path');
const app = require('./app');  
require('dotenv').config();

const PORT = process.env.PORT || 7000;

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

console.log("🔧 Iniciando predicción...");

const matrizTransicion = {
  Preventivo: { Preventivo: 0.7, Correctivo: 0.3 },
  Correctivo: { Preventivo: 0.6, Correctivo: 0.4 },
};

// En uso, manetimiento, revision, en desuso, 

// parametros se mediran por semanas
//periodo = semanas 
// 1 semana = 7 dias
// 2 semanas = 14 dias
// 3 semanas = 21 dias
// un equipo poodria funcionar 3 semanas sin mantenimiento, pero luego de eso se vuelve necesario un mantenimiento correctivo o preventivo
// tendria que sugerir mantenimiento preventivo cada 50 a 70 dias
// y correctivo cada 30 a 60 dias
// Si esta en un periodo de falla, entonces que cambien de estados


//revison = mantiniemiento preventivo y ahi es donde se usa el estado en falla 
// Se podria tratar de manejar historial de mantenimientos 
// Cuendo se r



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


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);


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
});

