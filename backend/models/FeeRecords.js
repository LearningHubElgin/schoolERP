const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeRecords = sequelize.define('FeeRecords', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    class_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    fee_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    pending_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    received_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false
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
    tableName: 'fee_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = FeeRecords;
