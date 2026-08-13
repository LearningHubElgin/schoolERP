const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherFullDetails = sequelize.define('TeacherFullDetails', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: true
    }
}, {
    tableName: 'teacher_full_details',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = TeacherFullDetails;
