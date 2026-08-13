const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enquiries = sequelize.define('Enquiries', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    enquiry_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    student_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    class_applied: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    father_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mother_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    alternate_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    follow_up_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    follow_up_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    converted_to_application_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
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
    tableName: 'enquiries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Enquiries;
