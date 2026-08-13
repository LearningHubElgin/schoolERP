const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transactions = sequelize.define('Transactions', {
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
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Transactions;
