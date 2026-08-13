const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Students = sequelize.define('Students', {
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
    student_unique_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    application_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    student_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    roll_no: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    class: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    combination_id: {
        type: DataTypes.INTEGER,
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
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    father_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    father_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    mother_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mother_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    admission_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    blood_group: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    medical_conditions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    previous_school: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    previous_class: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    batch_id: {
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
    },
    photo_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
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
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passed_out_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    passed_out_class: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    passed_out_year: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Students;
