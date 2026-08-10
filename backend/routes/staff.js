const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// === NON-TEACHING STAFF SELF ATTENDANCE ===

// 1. Get Monthly Attendance
router.get('/attendance/monthly', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;
        const { month } = req.query; // format: YYYY-MM
        
        if (!month) {
            return res.status(400).json({ success: false, message: 'Month parameter (YYYY-MM) is required' });
        }

        const [records] = await connection.query(
            `SELECT date, status, check_in_time, check_out_time 
             FROM non_teaching_staff_attendance 
             WHERE user_id = ? AND school_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
            [userId, schoolId, month]
        );

        res.json({ success: true, records });
    } catch (error) {
        console.error('Fetch staff attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. Check-In
router.post('/attendance/check-in', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;
        const { latitude, longitude } = req.body;
        const today = new Date().toISOString().split('T')[0];
        // Generate a localized 12-hour time format string
        const checkInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        // Location Validation
        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'Location access is required for attendance check-in. Please enable GPS capabilities.' });
        }

        // Fetch School Geofence Data from schools table
        const [schoolRows] = await connection.query(
            'SELECT latitude, longitude, attendance_radius_meters FROM schools WHERE id = ?',
            [schoolId]
        );

        const settings = {
            school_latitude: schoolRows[0]?.latitude,
            school_longitude: schoolRows[0]?.longitude,
            attendance_radius: schoolRows[0]?.attendance_radius_meters
        };

        if (settings.school_latitude && settings.school_longitude) {
            // Haversine Formula for precise Earth surface distance calculation
            const R = 6371e3; // Earth radius in meters
            const rad = Math.PI / 180;
            const reqLat = parseFloat(latitude);
            const reqLng = parseFloat(longitude);
            const schLat = parseFloat(settings.school_latitude);
            const schLng = parseFloat(settings.school_longitude);

            const dLat = (reqLat - schLat) * rad;
            const dLon = (reqLng - schLng) * rad;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(schLat * rad) * Math.cos(reqLat * rad) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceMeters = Math.round(R * c);

            const allowedRadius = parseFloat(settings.attendance_radius) || 200; // Default 200m

            if (distanceMeters > allowedRadius) {
                const limitDisp = allowedRadius >= 1000 ? (allowedRadius / 1000).toFixed(1) + ' km' : allowedRadius + ' meters';
                const distDisp = distanceMeters >= 1000 ? (distanceMeters / 1000).toFixed(1) + ' km' : distanceMeters + ' meters';
                
                return res.status(400).json({ 
                    success: false, 
                    message: `Geofence failed! You are ${distDisp} away. Allowed radius is ${limitDisp}.`
                });
            }
        }

        // Check if already checked in today
        const [existing] = await connection.query(
            'SELECT id FROM non_teaching_staff_attendance WHERE user_id = ? AND date = ?',
            [userId, today]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Already checked in for today' });
        }

        await connection.query(
            `INSERT INTO non_teaching_staff_attendance (user_id, school_id, date, status, check_in_time) 
             VALUES (?, ?, ?, 'present', ?)`,
            [userId, schoolId, today, checkInTime]
        );

        res.json({ success: true, message: 'Checked in successfully', time: checkInTime });
    } catch (error) {
        console.error('Staff Check-In error:', error);
        res.status(500).json({ success: false, message: 'Server error parsing distance calculation. Please try again.' });
    }
});

// 3. Check-Out
router.put('/attendance/check-out', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const checkOutTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        // Verify they are checked in today
        const [existing] = await connection.query(
            'SELECT id, check_out_time FROM non_teaching_staff_attendance WHERE user_id = ? AND date = ?',
            [userId, today]
        );

        if (existing.length === 0) {
            return res.status(400).json({ success: false, message: 'You have not checked in today' });
        }
        if (existing[0].check_out_time) {
            return res.status(400).json({ success: false, message: 'Already checked out for today' });
        }

        // Get settings for thresholds from schools table
        const [schoolSettings] = await connection.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [req.user.school_id]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 6;

        const checkInTimeStr = existing[0].check_in_time; // usually "HH:MM:SS AM/PM" or "HH:MM:SS"
        let status = 'present';

        if (checkInTimeStr) {
            // Helper to parse "HH:MM:SS AM/PM" or "HH:MM:SS"
            const parseTime = (tStr) => {
                const parts = tStr.match(/(\d+):(\d+):(\d+)(?:\s*(AM|PM))?/i);
                if (!parts) return null;
                let h = parseInt(parts[1]);
                const m = parseInt(parts[2]);
                const isPM = parts[4] && parts[4].toUpperCase() === 'PM';
                const isAM = parts[4] && parts[4].toUpperCase() === 'AM';
                if (isPM && h < 12) h += 12;
                if (isAM && h === 12) h = 0;
                return h * 60 + m;
            };

            const startMins = parseTime(checkInTimeStr);
            const endMins = parseTime(checkOutTime);

            if (startMins !== null && endMins !== null) {
                let diffMinutes = endMins - startMins;
                if (diffMinutes < 0) diffMinutes += 1440;
                const diffHours = diffMinutes / 60;

                if (diffHours >= minFull) status = 'present';
                else if (diffHours >= minHalf) status = 'half_day';
                else status = 'present'; // Keep as present for any duration
            }
        }

        await connection.query(
            'UPDATE non_teaching_staff_attendance SET check_out_time = ?, status = ? WHERE id = ?',
            [checkOutTime, status, existing[0].id]
        );

        res.json({ success: true, message: 'Checked out successfully', time: checkOutTime });
    } catch (error) {
        console.error('Staff Check-Out error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 4. Get Location Settings
router.get('/settings/location', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [schoolRows] = await connection.query(
            'SELECT latitude, longitude, attendance_radius_meters FROM schools WHERE id = ?',
            [schoolId]
        );
        const settings = {
            school_latitude: schoolRows[0]?.latitude,
            school_longitude: schoolRows[0]?.longitude,
            attendance_radius: schoolRows[0]?.attendance_radius_meters
        };
        
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Fetch location settings error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving settings' });
    }
});

// 5. Get Staff Profile
router.get('/profile', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await connection.query(
            'SELECT * FROM non_teaching_staff WHERE user_id = ?',
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.json({ success: true, profile: rows[0] });
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving profile' });
    }
});

// 6. Get my ID card
router.get('/my-id-card', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        const [cards] = await connection.query(
            `SELECT nsc.*, nts.name as staff_name, nts.employee_id, nts.designation, nts.department, 
                    nts.phone, nts.email, nts.photo as staff_photo, nts.address,
                    s.principal_signature
             FROM non_teaching_staff_cards nsc
             JOIN non_teaching_staff nts ON nsc.user_id = nts.user_id AND nsc.school_id = nts.school_id
             JOIN schools s ON nsc.school_id = s.id
             WHERE nsc.user_id = ? AND nsc.school_id = ?`,
            [userId, schoolId]
        );

        if (cards.length === 0) {
            return res.status(404).json({ success: false, message: 'ID Card not issued' });
        }

        res.json({ success: true, card: cards[0] });
    } catch (error) {
        console.error('Fetch my ID card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 7. Get my shift
router.get('/my-shift', authMiddleware, roleMiddleware('nonteachingstaff'), async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        const [shifts] = await connection.query(
            `SELECT s.*, nts.name as staff_name, nts.designation
             FROM non_teaching_staff_shifts s
             JOIN non_teaching_staff nts ON s.user_id = nts.user_id AND s.school_id = nts.school_id
             WHERE s.user_id = ? AND s.school_id = ?
               AND s.effective_from <= CURDATE()
               AND (s.effective_to IS NULL OR s.effective_to >= CURDATE())
             ORDER BY s.effective_from DESC
             LIMIT 1`,
            [userId, schoolId]
        );

        if (shifts.length === 0) {
            return res.status(404).json({ success: false, message: 'No active shift assigned' });
        }

        res.json({ success: true, shift: shifts[0] });
    } catch (error) {
        console.error('Fetch my shift error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

