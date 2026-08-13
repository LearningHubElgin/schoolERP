const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DaywiseAttendanceTeachers = sequelize.define('DaywiseAttendanceTeachers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    class_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'daywise_attendance_teachers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DaywiseAttendanceTeachers;
