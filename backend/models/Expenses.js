const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expenses = sequelize.define('Expenses', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    receipt_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    expense_time: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'expenses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Expenses;
