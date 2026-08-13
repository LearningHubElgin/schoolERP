const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassNotes = sequelize.define('ClassNotes', {
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
    class: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'class_notes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ClassNotes;
