const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notices = sequelize.define('Notices', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
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
    publish_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true
    },
    target_audience: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_active: {
        type: DataTypes.INTEGER,
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
    tableName: 'notices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Notices;
