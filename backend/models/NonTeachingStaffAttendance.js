const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NonTeachingStaffAttendance = sequelize.define('NonTeachingStaffAttendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    school_id: {
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
        type: DataTypes.STRING(20),
        allowNull: true
    },
    check_out_time: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'non_teaching_staff_attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = NonTeachingStaffAttendance;
