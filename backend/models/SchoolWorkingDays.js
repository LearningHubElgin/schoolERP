const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SchoolWorkingDays = sequelize.define('SchoolWorkingDays', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
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
    day_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    note: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'school_working_days',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = SchoolWorkingDays;
