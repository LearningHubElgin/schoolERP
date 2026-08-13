const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VisitorApprovals = sequelize.define('VisitorApprovals', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    visitor_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    whom_to_meet: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    purpose: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    visit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    visit_time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    check_in_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    check_out_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'visitor_approvals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = VisitorApprovals;
