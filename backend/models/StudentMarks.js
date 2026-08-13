const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentMarks = sequelize.define('StudentMarks', {
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
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    marks_obtained: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_marks: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    grade: {
        type: DataTypes.STRING(5),
        allowNull: true
    },
    custom_marks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_finalized: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    entered_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'student_marks',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = StudentMarks;
