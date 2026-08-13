const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quotations = sequelize.define('Quotations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    tender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vendor_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    vendor_contact: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    quoted_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    proposal_details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    proposal_file: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    submitted_date: {
        type: DataTypes.DATEONLY,
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
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'quotations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Quotations;
