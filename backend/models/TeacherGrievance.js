const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherGrievance = sequelize.define('TeacherGrievance', {
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
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
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
    tableName: 'teacher_grievance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TeacherGrievance;
