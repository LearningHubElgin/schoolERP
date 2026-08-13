const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransportAssignments = sequelize.define('TransportAssignments', {
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
    vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    route_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    pickup_point: {
        type: DataTypes.STRING(255),
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
    tableName: 'transport_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TransportAssignments;
