const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreInventory = sequelize.define('StoreInventory', {
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
    item_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    low_stock_threshold: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
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
    tableName: 'store_inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = StoreInventory;
