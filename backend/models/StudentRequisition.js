const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentRequisition = sequelize.define('StudentRequisition', {
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
    student_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    class: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    title: {
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    urgency: {
        type: DataTypes.STRING(50),
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
    approved_by: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    approved_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'student_requisition',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StudentRequisition;
