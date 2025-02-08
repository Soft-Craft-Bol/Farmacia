# Usa Node.js como base
FROM node:18

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Expone el puerto en el que corre el servicio
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]
