const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassSections = sequelize.define('ClassSections', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'class_sections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ClassSections;
