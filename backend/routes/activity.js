const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// @route   GET /api/activity/logs
// @desc    Get all activity logs with filtering and pagination
router.get('/logs', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const actionType = req.query.actionType || '';
        const userRole = req.query.userRole || '';
        const startDate = req.query.startDate || '';
        const endDate = req.query.endDate || '';

        let query = `
            SELECT * FROM activity_logs 
            WHERE school_id = ?
        `;
        let countQuery = `
            SELECT COUNT(*) as total FROM activity_logs 
            WHERE school_id = ?
        `;
        const queryParams = [schoolId];
        const countParams = [schoolId];

        if (search) {
            const searchPattern = `%${search}%`;
            query += ` AND (user_name LIKE ? OR user_email LIKE ? OR details LIKE ?)`;
            countQuery += ` AND (user_name LIKE ? OR user_email LIKE ? OR details LIKE ?)`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
            countParams.push(searchPattern, searchPattern, searchPattern);
        }

        if (actionType) {
            query += ` AND action = ?`;
            countQuery += ` AND action = ?`;
            queryParams.push(actionType);
            countParams.push(actionType);
        }

        if (userRole) {
            query += ` AND user_role = ?`;
            countQuery += ` AND user_role = ?`;
            queryParams.push(userRole);
            countParams.push(userRole);
        }

        if (startDate) {
            query += ` AND created_at >= ?`;
            countQuery += ` AND created_at >= ?`;
            queryParams.push(startDate);
            countParams.push(startDate);
        }

        if (endDate) {
            // Append 23:59:59 to include the full end date
            const fullEndDate = `${endDate} 23:59:59`;
            query += ` AND created_at <= ?`;
            countQuery += ` AND created_at <= ?`;
            queryParams.push(fullEndDate);
            countParams.push(fullEndDate);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [logs] = await db.query(query, queryParams);
        const [totalCount] = await db.query(countQuery, countParams);

        const totalRecords = totalCount[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            logs,
            pagination: {
                page,
                limit,
                totalPages,
                totalRecords
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/activity/stats
// @desc    Get activity summary statistics
router.get('/stats', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const today = new Date().toISOString().split('T')[0];

        // Total activities today
        const [todayTotal] = await db.query(
            'SELECT COUNT(*) as count FROM activity_logs WHERE school_id = ? AND DATE(created_at) = ?',
            [schoolId, today]
        );

        // Total logins today
        const [todayLogins] = await db.query(
            'SELECT COUNT(*) as count FROM activity_logs WHERE school_id = ? AND action = "Login" AND DATE(created_at) = ?',
            [schoolId, today]
        );

        // Total deletions today
        const [todayDeletions] = await db.query(
            'SELECT COUNT(*) as count FROM activity_logs WHERE school_id = ? AND action = "Delete" AND DATE(created_at) = ?',
            [schoolId, today]
        );

        // Failed login attempts today
        const [failedLogins] = await db.query(
            'SELECT COUNT(*) as count FROM activity_logs WHERE school_id = ? AND action = "Login" AND status = "Failed" AND DATE(created_at) = ?',
            [schoolId, today]
        );

        res.json({
            success: true,
            stats: {
                todayTotal: todayTotal[0].count,
                todayLogins: todayLogins[0].count,
                todayDeletions: todayDeletions[0].count,
                failedLogins: failedLogins[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
