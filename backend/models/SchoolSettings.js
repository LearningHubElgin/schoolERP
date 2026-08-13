const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SchoolSettings = sequelize.define('SchoolSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    setting_key: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    setting_value: {
        type: DataTypes.TEXT,
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
    tableName: 'school_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = SchoolSettings;
