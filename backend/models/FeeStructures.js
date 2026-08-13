const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeStructures = sequelize.define('FeeStructures', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    group_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    tuition_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    library_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    sports_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    lab_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    exam_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    hostel_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    misc_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_fee: {
        type: DataTypes.DECIMAL(10, 2),
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
    tableName: 'fee_structures',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = FeeStructures;
