const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('Usuarios', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    apellido: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    profesion: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    fecha_nac: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    usuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'usuarios',
});

module.exports = User;
