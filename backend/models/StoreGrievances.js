const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreGrievances = sequelize.define('StoreGrievances', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    submitted_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    submitted_by_name: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    resolved_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    resolution_notes: {
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
    tableName: 'store_grievances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = StoreGrievances;
