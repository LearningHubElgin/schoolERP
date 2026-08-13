const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssignmentSubmissions = sequelize.define('AssignmentSubmissions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    assignment_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    grade: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'assignment_submissions',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = AssignmentSubmissions;
