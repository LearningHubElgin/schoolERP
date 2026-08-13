const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransportVehicles = sequelize.define('TransportVehicles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vehicle_no: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    model: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    registration_no: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    driver_id: {
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
    route: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    current_latitude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    current_longitude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    is_tracking: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    last_location_update: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tracking_start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    current_place_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'transport_vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TransportVehicles;
