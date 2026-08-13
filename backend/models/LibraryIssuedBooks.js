const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LibraryIssuedBooks = sequelize.define('LibraryIssuedBooks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fine_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    issued_by: {
        type: DataTypes.INTEGER,
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
    tableName: 'library_issued_books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LibraryIssuedBooks;
