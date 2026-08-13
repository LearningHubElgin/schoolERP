const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grievances = sequelize.define('Grievances', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true
    },
    submitted_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    resolved_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    assigned_to: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    resolution: {
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
    tableName: 'grievances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Grievances;
