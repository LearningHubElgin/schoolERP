const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// ─── DASHBOARD STATISTICS ───────────────────────────────────────

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;

        // 1. Total Buses
        const [[{ totalBuses }]] = await db.query(
            'SELECT COUNT(*) as totalBuses FROM transport_vehicles WHERE school_id = ?',
            [school_id]
        );

        // 2. Active Routes
        const [[{ activeRoutes }]] = await db.query(
            'SELECT COUNT(DISTINCT route) as activeRoutes FROM transport_vehicles WHERE school_id = ? AND route IS NOT NULL AND route != "Not Set"',
            [school_id]
        );

        // 3. Total Students Assigned
        const [[{ totalStudents }]] = await db.query(
            'SELECT COUNT(*) as totalStudents FROM transport_assignments WHERE school_id = ?',
            [school_id]
        );

        // 4. Active Fleet Stats
        const [activeBuses] = await db.query(`
            SELECT 
                v.id, 
                v.vehicle_no as busNo, 
                v.route, 
                v.status, 
                u.name as driver,
                (SELECT COUNT(*) FROM transport_assignments a WHERE a.vehicle_id = v.id) as students
            FROM transport_vehicles v
            LEFT JOIN users u ON v.driver_id = u.id
            WHERE v.school_id = ?
        `, [school_id]);

        // Map status for UI format if needed
        const formattedBuses = activeBuses.map(bus => ({
            ...bus,
            status: bus.status === 'Active' ? 'On Trip' : bus.status === 'Inactive' ? 'Idle' : 'Maintenance'
        }));

        res.json({
            success: true,
            stats: {
                totalBuses: totalBuses || 0,
                activeRoutes: activeRoutes || 0,
                totalStudents: totalStudents || 0,
                tripsToday: formattedBuses.filter(b => b.status === 'On Trip').length || 0
            },
            activeBuses: formattedBuses
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ─── VEHICLE MANAGEMENT ─────────────────────────────────────────

// Get all vehicles
router.get('/vehicles', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const [vehicles] = await db.execute(`
            SELECT v.*, u.name as driver_name 
            FROM transport_vehicles v
            LEFT JOIN users u ON v.driver_id = u.id
            WHERE v.school_id = ?
        `, [school_id]);

        res.json({
            success: true,
            vehicles
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Add new vehicle
router.post('/vehicles', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { vehicle_no, type, model, capacity, registration_no, status, route } = req.body;
    try {
        const school_id = req.user.school_id || 1;
        const [result] = await db.execute(
            'INSERT INTO transport_vehicles (school_id, vehicle_no, type, model, capacity, registration_no, status, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [school_id, vehicle_no, type, model, capacity, registration_no, status || 'Active', route || 'Not Set']
        );

        res.json({
            success: true,
            message: 'Vehicle added successfully',
            vehicleId: result.insertId
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update vehicle
router.put('/vehicles/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { id } = req.params;
    const { vehicle_no, type, model, capacity, registration_no, status, route } = req.body;
    try {
        const school_id = req.user.school_id || 1;
        const [result] = await db.execute(
            'UPDATE transport_vehicles SET vehicle_no = ?, type = ?, model = ?, capacity = ?, registration_no = ?, status = ?, route = ? WHERE id = ? AND school_id = ?',
            [vehicle_no, type, model, capacity, registration_no, status, route || 'Not Set', id, school_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Vehicle updated successfully'
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete vehicle
router.delete('/vehicles/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const school_id = req.user.school_id || 1;
        const [result] = await db.execute(
            'DELETE FROM transport_vehicles WHERE id = ? AND school_id = ?',
            [id, school_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Vehicle not found or unauthorized (Requested ID: ${id}, Your School ID: ${school_id})`
            });
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Assign driver to vehicle
router.post('/vehicles/assign-driver', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { vehicleId, driverId } = req.body;
    try {
        await db.execute(
            'UPDATE transport_vehicles SET driver_id = ? WHERE id = ?',
            [driverId, vehicleId]
        );

        res.json({
            success: true,
            message: 'Driver assigned successfully'
        });
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ─── STUDENT ASSIGNMENT ─────────────────────────────────────────

// Get student transport assignments
router.get('/assignments', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const [assignments] = await db.execute(`
            SELECT a.*, s.name as student_name, s.email as student_email, v.vehicle_no, v.type as vehicle_type 
            FROM transport_assignments a
            JOIN users s ON a.student_id = s.id
            JOIN transport_vehicles v ON a.vehicle_id = v.id
            WHERE a.school_id = ?
        `, [school_id]);

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Assign student to vehicle
router.post('/assignments', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { studentId, vehicleId, routeName, pickupPoint } = req.body;
    try {
        const school_id = req.user.school_id || 1;

        // Use REPLACE INTO or INSERT ... ON DUPLICATE KEY UPDATE to handle re-assignment
        await db.execute(`
            INSERT INTO transport_assignments (school_id, student_id, vehicle_id, route_name, pickup_point)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE vehicle_id = VALUES(vehicle_id), route_name = VALUES(route_name), pickup_point = VALUES(pickup_point)
        `, [school_id, studentId, vehicleId, routeName, pickupPoint]);

        res.json({
            success: true,
            message: 'Student assigned to transport successfully'
        });
    } catch (error) {
        console.error('Error assigning student:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ─── DRIVER MANAGEMENT ──────────────────────────────────────────

// Get all drivers with profiles
router.get('/drivers', authMiddleware, async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const [drivers] = await db.execute(`
            SELECT u.id, u.name, u.email, u.phone, u.status as user_status,
                   d.license_no, d.experience_years, d.status as driver_status
            FROM users u
            LEFT JOIN transport_drivers d ON u.id = d.user_id
            WHERE u.role = 'driver' AND u.school_id = ?
        `, [school_id]);

        res.json({
            success: true,
            drivers
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Register new driver (User + Profile)
router.post('/drivers', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { name, email, phone, licenseNo, experience } = req.body;
    const school_id = req.user.school_id || 1;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Check if user already exists
        const [existing] = await connection.query('SELECT id FROM users WHERE (email = ? OR phone = ?) AND school_id = ?', [email || null, phone, school_id]);
        if (existing.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
        }

        // 2. Create User account (Password = phone)
        const hashedPassword = await bcrypt.hash(phone, 10);
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, phone, role, password, status, school_id) VALUES (?, ?, ?, "driver", ?, "active", ?)',
            [name, email || null, phone, hashedPassword, school_id]
        );

        const userId = userResult.insertId;

        // 3. Create Driver profile
        await connection.query(
            'INSERT INTO transport_drivers (user_id, school_id, license_no, experience_years) VALUES (?, ?, ?, ?)',
            [userId, school_id, licenseNo || '', experience || 0]
        );

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            userId
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error registering driver:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update driver details
router.put('/drivers/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, licenseNo, experience, status } = req.body;
    const school_id = req.user.school_id || 1;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Update user table
        await connection.query(
            'UPDATE users SET name = ?, email = ?, phone = ?, status = ? WHERE id = ? AND school_id = ? AND role = "driver"',
            [name, email || null, phone, status || 'active', id, school_id]
        );

        // 2. Update transport_drivers table
        await connection.query(
            'UPDATE transport_drivers SET license_no = ?, experience_years = ? WHERE user_id = ? AND school_id = ?',
            [licenseNo || '', experience || 0, id, school_id]
        );

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Driver details updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error updating driver:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete driver
router.delete('/drivers/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { id } = req.params;
    const school_id = req.user.school_id || 1;

    try {
        // Since we have ON DELETE CASCADE, deleting from users will remove driver profile too
        const [result] = await db.execute(
            'DELETE FROM users WHERE id = ? AND school_id = ? AND role = "driver"',
            [id, school_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Driver not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ─── DRIVER ATTENDANCE ──────────────────────────────────────────

// Get driver attendance for a specific date
router.get('/attendance', authMiddleware, roleMiddleware('admin', 'transport'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Fetch all drivers and their attendance for the given date
        const [drivers] = await db.execute(`
            SELECT 
                u.id as driver_id, 
                u.name, 
                u.phone,
                u.email,
                da.status as attendance_status,
                da.remarks
            FROM users u
            LEFT JOIN transport_drivers td ON u.id = td.user_id
            LEFT JOIN transport_driver_attendance da ON u.id = da.driver_id AND da.date = ?
            WHERE u.role = 'driver' AND u.school_id = ?
            ORDER BY u.name ASC
        `, [date, school_id]);

        res.json({
            success: true,
            date: date,
            drivers: drivers.map(d => ({
                ...d,
                attendance_status: d.attendance_status || 'Not Marked'
            }))
        });
    } catch (error) {
        console.error('Error fetching driver attendance:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update/mark driver attendance
router.post('/attendance', authMiddleware, roleMiddleware('admin', 'transport'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const admin_id = req.user.id;
        const { date, driver_id, status, remarks } = req.body;

        if (!date || !driver_id || !status) {
            return res.status(400).json({ success: false, message: 'Date, driver ID, and status are required' });
        }

        // Validate status enum
        const validStatuses = ['Present', 'Absent', 'Half Day', 'Late'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid attendance status' });
        }

        // Insert or update attendance record using ON DUPLICATE KEY UPDATE
        await db.execute(`
            INSERT INTO transport_driver_attendance (school_id, driver_id, date, status, remarks, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status), 
                remarks = VALUES(remarks),
                created_by = VALUES(created_by)
        `, [school_id, driver_id, date, status, remarks || null, admin_id]);

        res.json({
            success: true,
            message: 'Attendance saved successfully'
        });
    } catch (error) {
        console.error('Error saving driver attendance:', error);

        // Handle case where table doesn't exist yet (migration not run)
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({
                success: false,
                message: 'Database structure for attendance is missing. Please run database migrations first.'
            });
        }

        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET Attendance report for a date range
router.get('/attendance-report', authMiddleware, roleMiddleware('admin', 'transport'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start date and end date are required' });
        }

        // Fetch all drivers and their attendance within the range
        // We join with the attendance table filtered by the range
        const [report] = await db.execute(`
            SELECT 
                u.id as driver_id, 
                u.name, 
                u.phone,
                da.date,
                da.status,
                da.remarks
            FROM users u
            LEFT JOIN transport_driver_attendance da ON u.id = da.driver_id AND da.date BETWEEN ? AND ?
            WHERE u.role = 'driver' AND u.school_id = ?
            ORDER BY u.name ASC, da.date ASC
        `, [startDate, endDate, school_id]);

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Error fetching driver attendance report:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Remove student from transport
router.delete('/assignments/:studentId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { studentId } = req.params;
    try {
        const school_id = req.user.school_id || 1;
        await db.execute('DELETE FROM transport_assignments WHERE student_id = ? AND school_id = ?', [studentId, school_id]);

        res.json({
            success: true,
            message: 'Student removed from transport successfully'
        });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get Driver Profile
router.get('/driver/profile', authMiddleware, roleMiddleware('transport', 'driver'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const driver_id = req.user.id;

        const [profiles] = await db.execute(`
            SELECT u.id, u.name, u.email, u.phone, u.status as user_status,
                   d.license_no, d.experience_years, d.status as driver_status
            FROM users u
            LEFT JOIN transport_drivers d ON u.id = d.user_id
            WHERE u.id = ? AND u.school_id = ?
            LIMIT 1
        `, [driver_id, school_id]);

        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Driver profile not found' });
        }

        res.json({
            success: true,
            driver: profiles[0]
        });
    } catch (error) {
        console.error('Error fetching driver profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get Driver My Travel data (Assigned Vehicle + Assigned Students)
router.get('/driver/my-travel', authMiddleware, roleMiddleware('transport', 'driver'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const driver_id = req.user.id;

        // 1. Get Assigned Vehicle
        const [vehicles] = await db.execute(`
            SELECT * FROM transport_vehicles
            WHERE driver_id = ? AND school_id = ?
            LIMIT 1
        `, [driver_id, school_id]);

        if (vehicles.length === 0) {
            return res.json({ success: true, hasVehicle: false, message: 'No vehicle assigned to this driver.' });
        }

        const vehicle = vehicles[0];

        // 2. Get Assigned Students for this vehicle
        const [students] = await db.execute(`
            SELECT u.id, u.name, s.phone as student_phone, s.father_phone, s.mother_phone, 
                   a.pickup_point as stop, a.route_name
            FROM transport_assignments a
            JOIN users u ON a.student_id = u.id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE a.vehicle_id = ? AND a.school_id = ?
        `, [vehicle.id, school_id]);

        // Map generic class if table is missing, use vehicle route if stop is missing
        const formattedStudents = students.map(s => ({
            ...s,
            class: 'Student',
            stop: s.stop || vehicle.route || 'Not Set'
        }));

        res.json({
            success: true,
            hasVehicle: true,
            vehicle: vehicle,
            students: formattedStudents
        });
    } catch (error) {
        console.error('Error fetching driver travel data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Helper function to calculate distance in meters (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const rLat1 = (lat1 * Math.PI) / 180;
    const rLat2 = (lat2 * Math.PI) / 180;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rLat1) * Math.cos(rLat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
}

// Get driver's attendance status for today
router.get('/driver/attendance-today', authMiddleware, roleMiddleware('transport', 'driver'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const driver_id = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const [attendance] = await db.execute(`
            SELECT * FROM transport_driver_attendance 
            WHERE driver_id = ? AND date = ? AND school_id = ?
            LIMIT 1
        `, [driver_id, today, school_id]);

        res.json({
            success: true,
            isMarked: attendance.length > 0,
            attendance: attendance.length > 0 ? attendance[0] : null
        });
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Self-attendance using geofencing
router.post('/driver/self-attendance', authMiddleware, roleMiddleware('transport', 'driver'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const driver_id = req.user.id;
        const latitude = parseFloat(req.body.latitude);
        const longitude = parseFloat(req.body.longitude);
        const today = new Date().toISOString().split('T')[0];

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'Current location is required' });
        }

        // 1. Check if already marked
        const [existing] = await db.query(
            'SELECT id FROM transport_driver_attendance WHERE driver_id = ? AND date = ? AND school_id = ?',
            [driver_id, today, school_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
        }

        // 2. Fetch School Settings for geofencing from schools table
        const [schoolRows] = await db.query(
            'SELECT latitude as school_latitude, longitude as school_longitude, attendance_radius_meters as attendance_radius FROM schools WHERE id = ?',
            [school_id]
        );

        if (schoolRows.length === 0) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        const config = schoolRows[0];

        if (!config.school_latitude || !config.school_longitude) {
            return res.status(500).json({ success: false, message: 'School location settings not configured. Please contact administrator.' });
        }

        const schoolLat = parseFloat(config.school_latitude);
        const schoolLng = parseFloat(config.school_longitude);
        const radius = parseFloat(config.attendance_radius || 500);

        // 3. Calculate distance
        const distance = calculateDistance(latitude, longitude, schoolLat, schoolLng);

        console.log(`[Attendance] Driver: ${driver_id}, Dist: ${Math.round(distance)}m, Radius: ${radius}m, RawDist: ${distance}`);

        if (isNaN(distance) || distance > radius) {
            return res.status(200).json({
                success: false,
                message: isNaN(distance)
                    ? 'Invalid location data'
                    : `You are outside the attendance radius. Distance: ${Math.round(distance)}m, Allowed: ${radius}m`
            });
        }

        // 4. Mark Attendance (Check-in)
        const checkInTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        await db.execute(`
            INSERT INTO transport_driver_attendance 
            (school_id, driver_id, date, status, remarks, latitude, longitude, distance_from_school, check_in_time, location_verified)
            VALUES (?, ?, ?, 'Present', 'Self-attendance (Geo)', ?, ?, ?, ?, 1)
        `, [school_id, driver_id, today, latitude, longitude, Math.round(distance), checkInTime]);

        res.json({
            success: true,
            message: 'Attendance marked successfully'
        });

    } catch (error) {
        console.error('Error marking self attendance:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Driver check-out
router.post('/driver/check-out', authMiddleware, roleMiddleware('transport', 'driver'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const driver_id = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const checkOutTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        const [existing] = await db.query(
            'SELECT id, check_out_time FROM transport_driver_attendance WHERE driver_id = ? AND date = ? AND school_id = ?',
            [driver_id, today, school_id]
        );

        if (existing.length === 0) {
            return res.status(400).json({ success: false, message: 'Please check-in first' });
        }

        if (existing[0].check_out_time) {
            return res.status(400).json({ success: false, message: 'Already checked out for today' });
        }

        await db.execute(
            'UPDATE transport_driver_attendance SET check_out_time = ? WHERE id = ?',
            [checkOutTime, existing[0].id]
        );

        res.json({ success: true, message: 'Checked out successfully' });
    } catch (error) {
        console.error('Error driver check-out:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all vehicles currently being tracked (Admin Only)
router.get('/vehicles/tracking', authMiddleware, roleMiddleware('admin', 'transport'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const [trackingData] = await db.execute(`
            SELECT v.id, v.vehicle_no, v.registration_no, v.type, v.route,
                   v.current_latitude, v.current_longitude, v.current_place_name, v.last_location_update,
                   u.name as driver_name, u.phone as driver_phone
            FROM transport_vehicles v
            LEFT JOIN users u ON v.driver_id = u.id
            WHERE v.school_id = ? AND v.is_tracking = 1
        `, [school_id]);

        res.json({
            success: true,
            vehicles: trackingData
        });
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get tracking data for a student's assigned vehicle (Student Only)
router.get('/student/tracking', authMiddleware, roleMiddleware('student'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const student_id = req.user.id;

        // 1. Get the assigned vehicle id
        const [assignment] = await db.execute(`
            SELECT vehicle_id FROM transport_assignments 
            WHERE student_id = ? AND school_id = ?
        `, [student_id, school_id]);

        if (assignment.length === 0) {
            return res.json({ success: true, trackingActive: false, message: 'No vehicle assigned' });
        }

        const vehicle_id = assignment[0].vehicle_id;

        // 2. Get the tracking data for that vehicle
        const [trackingData] = await db.execute(`
            SELECT v.id, v.vehicle_no, v.registration_no, v.type, v.route,
                   v.current_latitude, v.current_longitude, v.current_place_name, v.last_location_update,
                   u.name as driver_name, u.phone as driver_phone
            FROM transport_vehicles v
            LEFT JOIN users u ON v.driver_id = u.id
            WHERE v.id = ? AND v.school_id = ? AND v.is_tracking = 1
        `, [vehicle_id, school_id]);

        // 3. Get school location from schools table
        const [schoolRows] = await db.execute(`
            SELECT latitude as school_latitude, longitude as school_longitude FROM schools WHERE id = ?
        `, [school_id]);

        let schoolLocation = null;
        if (schoolRows.length > 0) {
            const config = schoolRows[0];
            if (config.school_latitude && config.school_longitude) {
                schoolLocation = {
                    lat: parseFloat(config.school_latitude),
                    lng: parseFloat(config.school_longitude),
                    name: "School Location"
                };
            }
        }

        res.json({
            success: true,
            trackingActive: trackingData.length > 0,
            vehicle: trackingData.length > 0 ? trackingData[0] : null,
            schoolLocation
        });
    } catch (error) {
        console.error('Error fetching student tracking data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update vehicle location (Driver Only)
router.post('/vehicles/update-location', authMiddleware, roleMiddleware('driver', 'transport'), async (req, res) => {
    try {
        const { latitude, longitude, placeName } = req.body;
        const driver_id = req.user.id;
        const school_id = req.user.school_id || 1;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }

        const [result] = await db.execute(`
            UPDATE transport_vehicles 
            SET current_latitude = ?, current_longitude = ?, current_place_name = ?, last_location_update = CURRENT_TIMESTAMP
            WHERE driver_id = ? AND school_id = ? AND is_tracking = 1
        `, [latitude, longitude, placeName || null, driver_id, school_id]);

        if (result.affectedRows === 0) {
            return res.status(200).json({ success: false, trackingActive: false, message: 'No active tracking session found for this driver.' });
        }

        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Toggle tracking session (Driver Only)
router.post('/vehicles/toggle-tracking', authMiddleware, roleMiddleware('driver', 'transport'), async (req, res) => {
    try {
        const { status } = req.body; // 1 for start, 0 for stop
        const driver_id = req.user.id;
        const school_id = req.user.school_id || 1;

        const [result] = await db.execute(`
            UPDATE transport_vehicles 
            SET is_tracking = ?, 
                last_location_update = CURRENT_TIMESTAMP,
                tracking_start_time = IF(? = 1, CURRENT_TIMESTAMP, NULL),
                current_place_name = IF(? = 1, current_place_name, NULL)
            WHERE driver_id = ? AND school_id = ?
        `, [status ? 1 : 0, status ? 1 : 0, status ? 1 : 0, driver_id, school_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found or not assigned to you.' });
        }

        res.json({
            success: true,
            message: status ? 'Tracking started' : 'Tracking stopped',
            isTracking: !!status
        });
    } catch (error) {
        console.error('Error toggling tracking:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get driver's attendance history for a specific month
router.get('/driver/attendance-history', authMiddleware, roleMiddleware('transport', 'driver'), async (req, res) => {
    try {
        const school_id = req.user.school_id || 1;
        const driver_id = req.user.id;
        const { month, year } = req.query;

        // If month/year provided filter by them, otherwise last 31 days
        let query = 'SELECT date, status, remarks FROM transport_driver_attendance WHERE driver_id = ? AND school_id = ?';
        let params = [driver_id, school_id];

        if (month && year) {
            query += ' AND MONTH(date) = ? AND YEAR(date) = ?';
            params.push(month, year);
        }

        query += ' ORDER BY date DESC';
        if (!month) query += ' LIMIT 31';

        const [history] = await db.execute(query, params);

        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get school location (Allow drivers to fetch for routing/ETA)
router.get('/school-location', authMiddleware, roleMiddleware('transport', 'driver', 'admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [rows] = await db.query(
            'SELECT latitude as school_latitude, longitude as school_longitude FROM schools WHERE id = ?',
            [schoolId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        res.json({
            success: true,
            latitude: rows[0].school_latitude,
            longitude: rows[0].school_longitude
        });
    } catch (error) {
        console.error('Get school location error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
