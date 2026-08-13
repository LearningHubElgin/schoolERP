const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Teachers = sequelize.define('Teachers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    employee_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    qualification: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    experience: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    emergency_contact: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    photo_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    allowance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    deduction: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    can_manage_students: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    managed_classes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    managed_streams: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'teachers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Teachers;
