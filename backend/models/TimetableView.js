const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimetableView = sequelize.define('TimetableView', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: true
    }
}, {
    tableName: 'timetable_view',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = TimetableView;
