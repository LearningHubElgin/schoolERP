const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarksheetTemplates = sequelize.define('MarksheetTemplates', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    config: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_default: {
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
    assigned_class: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    assigned_section: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    assigned_stream: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'marksheet_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = MarksheetTemplates;
