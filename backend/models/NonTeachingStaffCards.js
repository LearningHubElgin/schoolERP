const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NonTeachingStaffCards = sequelize.define('NonTeachingStaffCards', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    card_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'non_teaching_staff_cards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = NonTeachingStaffCards;
