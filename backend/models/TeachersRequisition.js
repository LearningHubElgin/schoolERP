const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeachersRequisition = sequelize.define('TeachersRequisition', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teacher_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    item: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    urgency: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    submitted_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    approved_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    rejected_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'teachers_requisition',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TeachersRequisition;
