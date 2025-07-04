📄 README: Modelo de Cadenas de Markov para Predicción de Mantenimiento
📚 Teoría: Cadenas de Markov
Una cadena de Markov es un modelo matemático para procesos estocásticos (aleatorios) que cumplen la propiedad de Markov:

La probabilidad de estar en un estado futuro depende únicamente del estado actual, no de la secuencia de estados anteriores.

Formalmente:

𝑃
(
𝑋
𝑛
+
1
∣
𝑋
𝑛
,
𝑋
𝑛
−
1
,
…
,
𝑋
0
)
=
𝑃
(
𝑋
𝑛
+
1
∣
𝑋
𝑛
)
P(X 
n+1
​
 ∣X 
n
​
 ,X 
n−1
​
 ,…,X 
0
​
 )=P(X 
n+1
​
 ∣X 
n
​
 )
Las cadenas de Markov se utilizan para modelar transiciones entre estados discretos con ciertas probabilidades conocidas.
En el contexto de mantenimiento, los estados son los tipos de mantenimiento (Preventivo, Correctivo, Predictivo) y las probabilidades representan la tendencia de un equipo a necesitar un determinado tipo de mantenimiento en el futuro, dado su último estado.

🧰 Implementación en este proyecto
🎯 Objetivo
Calcular una probabilidad de falla estimada del equipo en base a su historial de mantenimientos recientes y su estado actual. Esta probabilidad se usa para ajustar el período hasta el próximo mantenimiento programado.

📈 Estados modelados
Los estados definidos son:

Preventivo

Correctivo

Predictivo

🔗 Matriz de transición
En el archivo siguienteM.controller.js, definimos la siguiente matriz de transición empírica para los estados:

js
Copiar
Editar
const matrizMarkov = {
  'Preventivo': { Preventivo: 0.1, Correctivo: 0.3, Predictivo: 0.05 },
  'Correctivo': { Preventivo: 0.2, Correctivo: 0.5, Predictivo: 0.1 },
  'Predictivo': { Preventivo: 0.05, Correctivo: 0.1, Predictivo: 0.02 }
};
Aquí:

Por ejemplo: después de un mantenimiento Preventivo, hay una probabilidad del 30% de que el próximo sea Correctivo.

🧮 Cálculo
1️⃣ Tomamos el último tipo de mantenimiento realizado en el equipo.
2️⃣ Leemos la probabilidad de que falle en el futuro próximo, según la matriz de Markov.
3️⃣ Ajustamos esa probabilidad por el estado actual del equipo, usando un factor adicional:

js
Copiar
Editar
const factorEstado = {
  'En uso intensivo': 1.3,
  'En uso normal': 1.0,
  'En desuso': 0.8,
  'En mantenimiento': 0.7,
  'Dañado': 1.5
}[equipo.estado] || 1.0;
4️⃣ La probabilidad final es:

js
Copiar
Editar
const probabilidadFalla = Math.min(0.9, probabilidadBase * factorEstado);
⏳ Uso del resultado
El valor probabilidadFalla se usa para ajustar el próximo mantenimiento:

js
Copiar
Editar
const factorMarkov = 1 + (0.5 - probabilidadFalla);
Si la probabilidad de falla es alta (cercana a 0.5), el factorMarkov disminuye, acortando los días hasta el próximo mantenimiento.

📦 Ejemplo de respuesta
json
Copiar
Editar
"prediccion": {
  "proximoMantenimiento": "2026-03-08T10:21:36.548Z",
  "factores": {
    "estado": 1,
    "markov": 1.35,
    "horas": 1.015,
    "probabilidadFalla": 0.15
  },
  "diasBase": 180,
  "diasAjustados": 247
}
Aquí la probabilidadFalla calculada fue 0.15, lo que dio un factorMarkov mayor que 1, alargando el mantenimiento programado.

🔗 Referencias
Wikipedia: Cadena de Markov

Introducción básica a confiabilidad y mantenimiento predictivo.