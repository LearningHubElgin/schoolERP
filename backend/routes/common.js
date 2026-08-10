const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/common/events-notices
// @desc    Get upcoming events and notices for any authenticated user
// @access  Private (All roles)
router.get('/events-notices', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get upcoming events from events table
        const [upcomingEventsList] = await db.query(
            `SELECT * FROM events 
             WHERE event_date >= CURDATE() AND school_id = ? AND status != 'cancelled'
             ORDER BY event_date ASC LIMIT 5`,
            [schoolId]
        );

        // Get active notices from notices table
        const [noticesList] = await db.query(
            `SELECT * FROM notices 
             WHERE school_id = ? AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date >= CURDATE())
             ORDER BY publish_date DESC LIMIT 5`,
            [schoolId]
        );

        // Format events
        const events = upcomingEventsList.map(e => ({
            id: e.id,
            title: e.title,
            description: e.description,
            date: new Date(e.event_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            time: e.event_time,
            location: e.location,
            rawDate: e.event_date,
            priority: e.priority === 'high' ? 'High' : e.priority === 'medium' ? 'Medium' : 'Low',
            status: e.status
        }));

        // Format notices
        const notices = noticesList.map(n => ({
            id: n.id,
            title: n.title,
            description: n.description,
            date: new Date(n.publish_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            priority: n.priority === 'high' ? 'High' : n.priority === 'medium' ? 'Medium' : 'Low',
            targetAudience: n.target_audience
        }));

        res.json({
            success: true,
            events,
            notices
        });

    } catch (error) {
        console.error('Get events and notices error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
