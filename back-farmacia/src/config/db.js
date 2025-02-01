const { Sequelize } = require('sequelize');

// Datos de conexión a la base de datos
const sequelize = new Sequelize('user_db', 'gaspar', 'armando1gaspar', {
    host: 'localhost', 
    dialect: 'postgres',
    port: 5432, 
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, connectDB };
