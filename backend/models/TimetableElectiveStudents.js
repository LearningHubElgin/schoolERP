const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimetableElectiveStudents = sequelize.define('TimetableElectiveStudents', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    timetable_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'timetable_elective_students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TimetableElectiveStudents;
