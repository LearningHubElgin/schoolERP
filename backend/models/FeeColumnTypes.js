const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeColumnTypes = sequelize.define('FeeColumnTypes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    column_key: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    display_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_active: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'fee_column_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = FeeColumnTypes;
