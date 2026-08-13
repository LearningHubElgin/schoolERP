const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherClasses = sequelize.define('TeacherClasses', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    class: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'teacher_classes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TeacherClasses;
