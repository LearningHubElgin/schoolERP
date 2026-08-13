const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Timetable = sequelize.define('Timetable', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    class_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    day_of_week: {
        type: DataTypes.STRING,
        allowNull: true
    },
    time_slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    time_slot_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    subject_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teacher_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    room_number: {
        type: DataTypes.STRING(50),
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
    is_elective: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_merged: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    merged_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    merge_group_id: {
        type: DataTypes.STRING(36),
        allowNull: true
    }
}, {
    tableName: 'timetable',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Timetable;
