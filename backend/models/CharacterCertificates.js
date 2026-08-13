const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CharacterCertificates = sequelize.define('CharacterCertificates', {
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
    purpose: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    conduct_remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    issued_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    certificate_number: {
        type: DataTypes.STRING(100),
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
    tableName: 'character_certificates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = CharacterCertificates;
