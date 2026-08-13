const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransferCertificates = sequelize.define('TransferCertificates', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    class: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    roll_no: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    father_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mother_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    admission_no: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    date_of_leaving: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    last_class_attended: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    reason_for_leaving: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    conduct: {
        type: DataTypes.STRING,
        allowNull: true
    },
    total_attendance_percentage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    eligible_for_admission: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    fees_cleared: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    outstanding_fees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    certificate_number: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    issued_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    issued_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'transfer_certificates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TransferCertificates;
