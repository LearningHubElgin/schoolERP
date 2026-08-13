const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassStreams = sequelize.define('ClassStreams', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'class_streams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ClassStreams;
