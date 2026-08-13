const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamTerms = sequelize.define('ExamTerms', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    term_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    academic_year: {
        type: DataTypes.STRING(20),
        allowNull: true
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
    tableName: 'exam_terms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ExamTerms;
