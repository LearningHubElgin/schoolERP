const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentCards = sequelize.define('StudentCards', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    card_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    card_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'student_cards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = StudentCards;
