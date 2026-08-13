const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NonTeachingStaff = sequelize.define('NonTeachingStaff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    designation: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    blood_group: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    emergency_contact: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
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
    tableName: 'non_teaching_staff',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = NonTeachingStaff;
