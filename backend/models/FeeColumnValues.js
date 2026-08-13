const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeColumnValues = sequelize.define('FeeColumnValues', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    fee_structure_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    column_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'fee_column_values',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = FeeColumnValues;
