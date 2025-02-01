const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UsuarioRoles = sequelize.define('usuario_roles', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles', 
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: false,
    tableName: 'usuario_roles',
});

module.exports = UsuarioRoles;
