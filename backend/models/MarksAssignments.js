const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarksAssignments = sequelize.define('MarksAssignments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    exam_term_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    class: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_completed: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_locked: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    locked_columns: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_published: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'marks_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = MarksAssignments;
