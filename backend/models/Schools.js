const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schools = sequelize.define('Schools', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    principal_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    established_year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    board: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    website: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subscription_plan: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    subscription_start: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    subscription_end: {
        type: DataTypes.DATEONLY,
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
    latitude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    attendance_radius_meters: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    principal_signature: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    min_hours_half_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    min_hours_full_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    fee_collection_cycle: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'schools',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Schools;
