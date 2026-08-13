const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherPayslips = sequelize.define('TeacherPayslips', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'teacher_payslips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TeacherPayslips;
