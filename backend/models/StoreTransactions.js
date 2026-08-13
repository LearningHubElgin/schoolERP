const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreTransactions = sequelize.define('StoreTransactions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    store_id: {
        type: DataTypes.INTEGER,
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
    student_name: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    buyer_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    class_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    transaction_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    payment_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bill_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'store_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StoreTransactions;
