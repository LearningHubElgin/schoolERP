const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LessonPlanComments = sequelize.define('LessonPlanComments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    lesson_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'lesson_plan_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = LessonPlanComments;
