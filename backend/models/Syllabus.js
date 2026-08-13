const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Syllabus = sequelize.define('Syllabus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    class: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'syllabus',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Syllabus;
