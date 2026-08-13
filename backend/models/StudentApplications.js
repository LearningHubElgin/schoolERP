const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentApplications = sequelize.define('StudentApplications', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    application_no: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    student_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    class: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    father_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mother_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    father_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    mother_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    parent_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    previous_school: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    previous_class: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    blood_group: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    medical_conditions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    student_photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    father_photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mother_photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    student_aadhaar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    father_aadhaar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mother_aadhaar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    father_pan: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mother_pan: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    photo_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    applied_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    admitted_date: {
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
    applicable_months: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    processed_by: {
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
    tableName: 'student_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = StudentApplications;
