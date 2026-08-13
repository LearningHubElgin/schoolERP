const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LibraryBooks = sequelize.define('LibraryBooks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isbn: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    author: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    publisher: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_copies: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    available_copies: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shelf_location: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    cover_image: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    description: {
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
    tableName: 'library_books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LibraryBooks;
