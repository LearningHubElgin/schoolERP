const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SchoolWeeklySchedule = sequelize.define('SchoolWeeklySchedule', {
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_working: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'school_weekly_schedule',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = SchoolWeeklySchedule;
