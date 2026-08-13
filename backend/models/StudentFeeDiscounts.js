const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentFeeDiscounts = sequelize.define('StudentFeeDiscounts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discount_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    frequency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    applicable_months: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'student_fee_discounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = StudentFeeDiscounts;
