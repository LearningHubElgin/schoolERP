const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreRequisitions = sequelize.define('StoreRequisitions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    item_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    urgency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    submitted_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    submitted_by_name: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    approved_by: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    approved_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'store_requisitions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StoreRequisitions;
