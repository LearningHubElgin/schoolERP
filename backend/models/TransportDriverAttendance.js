const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransportDriverAttendance = sequelize.define('TransportDriverAttendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    check_in_time: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    check_out_time: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    location_verified: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    marked_at: {
        type: DataTypes.DATE,
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
    distance_from_school: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'transport_driver_attendance',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = TransportDriverAttendance;
