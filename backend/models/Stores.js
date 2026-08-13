const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stores = sequelize.define('Stores', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
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
    tableName: 'stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Stores;
