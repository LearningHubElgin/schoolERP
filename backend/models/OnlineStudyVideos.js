const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OnlineStudyVideos = sequelize.define('OnlineStudyVideos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    subject_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    topic_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    video_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    video_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'online_study_videos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = OnlineStudyVideos;
