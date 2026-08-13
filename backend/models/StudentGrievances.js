const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentGrievances = sequelize.define('StudentGrievances', {
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
    priority: {
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
    assigned_to: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    resolution: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resolved_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'student_grievances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StudentGrievances;
