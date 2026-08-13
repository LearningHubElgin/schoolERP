const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherAttendance = sequelize.define('TeacherAttendance', {
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    check_in_time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    check_out_time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location_verified: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'teacher_attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TeacherAttendance;
