const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Forms = sequelize.define('Forms', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    link_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'forms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Forms;
