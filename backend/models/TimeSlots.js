const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeSlots = sequelize.define('TimeSlots', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    start_time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    end_time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slot_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    is_break: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    tableName: 'time_slots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TimeSlots;
