const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Database pool is in config/database.js
const { authMiddleware } = require('../middleware/auth'); // Standard auth middleware

// Get all pending visitor approvals for a school
router.get('/', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { status, date } = req.query;

        let query = 'SELECT * FROM visitor_approvals WHERE school_id = ?';
        const queryParams = [school_id];

        if (date) {
            query += ' AND visit_date = ?';
            queryParams.push(date);
        }

        if (status && status !== 'all') {
            query += ' AND status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY visit_date DESC, visit_time DESC';

        const [rows] = await db.query(query, queryParams);
        res.json({ success: true, visitors: rows });
    } catch (error) {
        console.error("Error fetching visitors:", error);
        res.status(500).json({ success: false, message: 'Server error fetching visitors' });
    }
});

// Create a new visitor approval request (from Security Guard)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { visitor_name, phone, purpose, whom_to_meet, visit_date, visit_time, notes } = req.body;

        const finalDate = visit_date || new Date().toISOString().split('T')[0];
        const finalTime = visit_time || new Date().toTimeString().split(' ')[0];
        
        const query = `
            INSERT INTO visitor_approvals 
            (school_id, visitor_name, phone, whom_to_meet, purpose, visit_date, visit_time, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `;
        
        const [result] = await db.query(query, [
            school_id, visitor_name, phone, whom_to_meet, purpose, finalDate, finalTime, notes || ''
        ]);

        res.status(201).json({ 
            success: true, 
            message: 'Visitor registration request sent to Admin',
            visitorId: result.insertId 
        });
    } catch (error) {
        console.error("Error creating visitor approval:", error);
        res.status(500).json({ success: false, message: 'Server error registering visitor' });
    }
});

// Update visitor approval status (Admin action)
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const visitorId = req.params.id;
        const school_id = req.user.school_id;
        const { status } = req.body;

        const validStatuses = ['pending', 'approved', 'rejected', 'checked_in', 'checked_out'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Verify the record belongs to the user's school
        const [existing] = await db.query('SELECT id FROM visitor_approvals WHERE id = ? AND school_id = ?', [visitorId, school_id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Visitor record not found' });
        }

        const query = 'UPDATE visitor_approvals SET status = ? WHERE id = ?';
        await db.query(query, [status, visitorId]);

        res.json({ success: true, message: `Visitor status updated to ${status}` });
    } catch (error) {
        console.error("Error updating visitor approval status:", error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
});

// Check-in visitor (Security Guard action)
router.put('/:id/check-in', authMiddleware, async (req, res) => {
    try {
        const visitorId = req.params.id;
        const school_id = req.user.school_id;

        const [existing] = await db.query('SELECT id FROM visitor_approvals WHERE id = ? AND school_id = ?', [visitorId, school_id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Visitor record not found' });
        }

        const query = 'UPDATE visitor_approvals SET status = "checked_in", check_in_time = NOW() WHERE id = ?';
        await db.query(query, [visitorId]);

        res.json({ success: true, message: 'Visitor checked in successfully' });
    } catch (error) {
        console.error("Error checking in visitor:", error);
        res.status(500).json({ success: false, message: 'Server error checking in' });
    }
});

// Check-out visitor (Security Guard action)
router.put('/:id/check-out', authMiddleware, async (req, res) => {
    try {
        const visitorId = req.params.id;
        const school_id = req.user.school_id;

        const [existing] = await db.query('SELECT id FROM visitor_approvals WHERE id = ? AND school_id = ?', [visitorId, school_id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Visitor record not found' });
        }

        const query = 'UPDATE visitor_approvals SET status = "checked_out", check_out_time = NOW() WHERE id = ?';
        await db.query(query, [visitorId]);

        res.json({ success: true, message: 'Visitor checked out successfully' });
    } catch (error) {
        console.error("Error checking out visitor:", error);
        res.status(500).json({ success: false, message: 'Server error checking out' });
    }
});

// Update visitor details
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;
        const { visitor_name, phone, whom_to_meet, purpose, visit_date, visit_time, notes } = req.body;

        const [result] = await db.query(
            'UPDATE visitor_approvals SET visitor_name = ?, phone = ?, whom_to_meet = ?, purpose = ?, visit_date = ?, visit_time = ?, notes = ? WHERE id = ? AND school_id = ?',
            [visitor_name, phone, whom_to_meet, purpose, visit_date, visit_time, notes, id, school_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Visitor not found or unauthorized' });
        }

        res.json({ success: true, message: 'Visitor updated successfully' });
    } catch (error) {
        console.error('Error updating visitor:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create a new visitor appointment (Admin action)
router.post('/appointment', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { visitor_name, phone, purpose, whom_to_meet, visit_date, visit_time, notes } = req.body;

        const query = `
            INSERT INTO visitor_approvals 
            (school_id, visitor_name, phone, whom_to_meet, purpose, visit_date, visit_time, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)
        `;
        
        const [result] = await db.query(query, [
            school_id, visitor_name, phone, whom_to_meet, purpose, visit_date, visit_time, notes || ''
        ]);

        res.status(201).json({ 
            success: true, 
            message: 'Visitor appointment scheduled successfully',
            appointmentId: result.insertId 
        });
    } catch (error) {
        console.error("Error creating visitor appointment:", error);
        res.status(500).json({ success: false, message: 'Server error scheduling appointment' });
    }
});

// Get all visitor appointments (Security Guard/Admin view)
router.get('/appointments', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id;
        
        // Fetch appointments that are today or in the future
        const query = `
            SELECT * FROM visitor_approvals 
            WHERE school_id = ? 
            AND status IN ('approved', 'rejected') 
            AND check_in_time IS NULL
            AND visit_date >= CURDATE()
            ORDER BY visit_date ASC, visit_time ASC
        `;

        const [rows] = await db.query(query, [school_id]);
        res.json({ success: true, appointments: rows });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, message: 'Server error fetching appointments' });
    }
});

// Delete a visitor appointment
router.delete('/appointment/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;

        const [result] = await db.query(
            'DELETE FROM visitor_approvals WHERE id = ? AND school_id = ? AND status IN ("approved", "rejected") AND check_in_time IS NULL',
            [id, school_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or cannot be deleted (already checked in)' });
        }

        res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ success: false, message: 'Server error deleting appointment' });
    }
});

// Get dashboard statistics and recent activity for Security Guard
router.get('/dashboard-stats', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const today = new Date().toISOString().split('T')[0];

        // 1. Statistics
        const [statsRows] = await db.query(`
            SELECT 
                COUNT(CASE WHEN visit_date = ? THEN 1 END) as todayTotal,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checkedIn,
                COUNT(CASE WHEN status = 'approved' AND check_in_time IS NULL AND visit_date = ? THEN 1 END) as expected
            FROM visitor_approvals 
            WHERE school_id = ?
        `, [today, today, school_id]);

        const stats = statsRows[0];

        // 2. Pending Approvals (Top 5)
        const [pendingRows] = await db.query(`
            SELECT id, visitor_name, whom_to_meet as host_role 
            FROM visitor_approvals 
            WHERE school_id = ? AND status = 'pending' 
            ORDER BY created_at DESC 
            LIMIT 5
        `, [school_id]);

        // 3. Recent Checked In (Top 5 today)
        const [checkInRows] = await db.query(`
            SELECT id, visitor_name, DATE_FORMAT(check_in_time, '%H:%i') as visit_time 
            FROM visitor_approvals 
            WHERE school_id = ? AND status = 'checked_in' AND DATE(check_in_time) = ?
            ORDER BY check_in_time DESC 
            LIMIT 5
        `, [school_id, today]);

        res.json({
            success: true,
            stats,
            pendingVisitors: pendingRows,
            recentCheckedIn: checkInRows
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
    }
});

module.exports = router;
