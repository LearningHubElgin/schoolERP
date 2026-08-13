const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreBills = sequelize.define('StoreBills', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    bill_number: {
        type: DataTypes.STRING(50),
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
    items_json: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    gst_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    gst_percentage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payment_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bill_file_path: {
        type: DataTypes.STRING(500),
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
    tableName: 'store_bills',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StoreBills;
