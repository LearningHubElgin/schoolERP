const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LessonPlans = sequelize.define('LessonPlans', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    class_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    week_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    topic: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sub_topics: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    completion_percentage: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    completion_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'lesson_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LessonPlans;
