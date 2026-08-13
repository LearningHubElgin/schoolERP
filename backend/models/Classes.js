const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Classes = sequelize.define('Classes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    class_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    class_category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'classes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Classes;
