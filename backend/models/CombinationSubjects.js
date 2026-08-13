const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CombinationSubjects = sequelize.define('CombinationSubjects', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    combination_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_optional: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'combination_subjects',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = CombinationSubjects;
