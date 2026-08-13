const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ActivityLogs = sequelize.define('ActivityLogs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    user_email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    user_role: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    academic_year_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    module_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    entity_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    entity_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    entity_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    old_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    new_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    changed_fields: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    performed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    performed_by_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    performed_by_role: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    browser: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    device: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    operating_system: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    request_method: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    request_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    session_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    severity: {
        type: DataTypes.STRING,
        allowNull: true
    },
    execution_time: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    request_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    correlation_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ActivityLogs;
