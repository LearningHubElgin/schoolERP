const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NonTeachingStaffShifts = sequelize.define('NonTeachingStaffShifts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shift_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    start_time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    end_time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'non_teaching_staff_shifts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = NonTeachingStaffShifts;
