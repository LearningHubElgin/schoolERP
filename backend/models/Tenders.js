const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tenders = sequelize.define('Tenders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    opening_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    closing_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    min_bid_amount: {
        type: DataTypes.DECIMAL(10, 2),
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
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    requisition_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'tenders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Tenders;
