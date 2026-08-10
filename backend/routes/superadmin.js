const express = require('express');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const { logCreate, logUpdate } = require('../utils/activityLogger');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../upload/schools');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const schoolNameRaw = req.body.schoolName || 'default';
        const sanitized = schoolNameRaw
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        cb(null, `school_${sanitized || 'default'}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpg, jpeg, png, gif, webp) are allowed!'));
        }
    }
});

// All superadmin routes are protected by JWT and role restriction
router.use(authMiddleware);
router.use(roleMiddleware('superadmin'));

// @route   POST /api/superadmin/upload-logo
// @desc    Upload school logo
// @access  Private (Super Admin)
router.post('/upload-logo', upload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // Return relative path
        const logoUrl = `/upload/schools/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            logoUrl: logoUrl
        });
    } catch (error) {
        console.error('Logo upload error:', error);
        res.status(500).json({ success: false, message: 'Server error uploading logo' });
    }
});

// @route   GET /api/superadmin/stats
// @desc    Get system-wide statistics for Super Admin
// @access  Private (Super Admin)
router.get('/stats', async (req, res) => {
    try {
        // Total schools
        const [schoolsCount] = await db.query('SELECT COUNT(*) as count FROM schools');
        const [activeSchools] = await db.query('SELECT COUNT(*) as count FROM schools WHERE status = "active"');
        
        // System-wide user counts
        const [studentCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
        const [teacherCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
        const [activeUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');

        // Distribution of subscription plans
        const [plans] = await db.query('SELECT subscription_plan, COUNT(*) as count FROM schools GROUP BY subscription_plan');

        res.json({
            success: true,
            stats: {
                totalSchools: schoolsCount[0].count,
                activeSchools: activeSchools[0].count,
                totalStudents: studentCount[0].count,
                totalTeachers: teacherCount[0].count,
                activeUsers: activeUsers[0].count,
                plansDistribution: plans
            }
        });
    } catch (error) {
        console.error('Super Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving statistics' });
    }
});

// @route   GET /api/superadmin/schools
// @desc    Get all schools
// @access  Private (Super Admin)
router.get('/schools', async (req, res) => {
    try {
        const [schools] = await db.query(`
            SELECT s.*, 
                   (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'teacher') AS teacher_count,
                   (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'student') AS student_count
            FROM schools s
            ORDER BY s.created_at DESC
        `);
        res.json({ success: true, schools });
    } catch (error) {
        console.error('Super Admin fetch schools error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving schools' });
    }
});

// @route   GET /api/superadmin/schools/:id
// @desc    Get single school details
// @access  Private (Super Admin)
router.get('/schools/:id', async (req, res) => {
    try {
        const [schools] = await db.query('SELECT * FROM schools WHERE id = ?', [req.params.id]);
        if (schools.length === 0) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }
        
        // Fetch current administrator's email for this school
        const [admins] = await db.query('SELECT email FROM users WHERE school_id = ? AND role = "admin" LIMIT 1', [req.params.id]);
        const adminEmail = admins.length > 0 ? admins[0].email : '';
        
        const schoolWithAdmin = {
            ...schools[0],
            admin_email: adminEmail
        };

        res.json({ success: true, school: schoolWithAdmin });
    } catch (error) {
        console.error('Super Admin fetch single school error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving school details' });
    }
});

// @route   POST /api/superadmin/schools
// @desc    Add new school and auto-generate its administrator account
// @access  Private (Super Admin)
router.post('/schools', async (req, res) => {
    try {
        const {
            name,
            address,
            city,
            state,
            pincode,
            phone,
            email,
            logo,
            principal_name,
            established_year,
            board,
            website,
            subscription_plan,
            subscription_end,
            admin_email,
            admin_password
        } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'School Name is required' });
        }

        if (admin_email && admin_email.trim()) {
            const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [admin_email.trim()]);
            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, message: 'The custom Admin Login ID (Email) already exists. Please choose a different one.' });
            }
        }

        // 1. Generate unique school code
        // Clean name of special characters and spaces
        const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
        let schoolCode = cleanName || 'SCH';
        
        // Ensure school code is unique
        let codeSuffix = 1;
        let finalCode = `${schoolCode}${codeSuffix.toString().padStart(2, '0')}`;
        
        while (true) {
            const [existingCode] = await db.query('SELECT id FROM schools WHERE code = ?', [finalCode]);
            if (existingCode.length === 0) {
                break;
            }
            codeSuffix++;
            finalCode = `${schoolCode}${codeSuffix.toString().padStart(2, '0')}`;
        }

        // 2. Insert school details
        const [schoolResult] = await db.query(`
            INSERT INTO schools (
                code, name, address, city, state, pincode, phone, email, logo,
                principal_name, established_year, board, website, 
                subscription_plan, subscription_start, subscription_end, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, ?, 'active')
        `, [
            finalCode,
            name,
            address || null,
            city || null,
            state || null,
            pincode || null,
            phone || null,
            email || null,
            logo || null,
            principal_name || null,
            established_year ? parseInt(established_year) : null,
            board || null,
            website || null,
            subscription_plan || 'basic',
            subscription_end || null
        ]);

        const schoolId = schoolResult.insertId;

        // 3. Generate credentials for the default Administrator
        let adminEmail = admin_email && admin_email.trim() ? admin_email.trim() : `admin_${finalCode.toLowerCase()}@school.erp`;
        let adminPassword = admin_password && admin_password.trim() ? admin_password.trim() : '';
        
        if (!adminPassword) {
            // Generate random 8-character password fallback
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 8; i++) {
                adminPassword += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // 4. Create Admin User
        await db.query(`
            INSERT INTO users (school_id, email, password, role, name, phone, status)
            VALUES (?, ?, ?, 'admin', ?, ?, 'active')
        `, [
            schoolId,
            adminEmail,
            hashedPassword,
            `${name} Administrator`,
            phone || '0000000000'
        ]);

        logCreate({
            schoolId: schoolId,
            moduleName: 'Super Admin',
            entityType: 'School',
            entityId: schoolId,
            entityName: name,
            data: { code: finalCode, name, subscription_plan, admin_email: adminEmail },
            description: `Registered new school: ${name} (${finalCode})`,
            user: req.user,
            req
        });

        res.json({
            success: true,
            message: 'School registered successfully with Admin credentials generated!',
            schoolId,
            schoolCode: finalCode,
            adminCredentials: {
                loginId: adminEmail,
                password: adminPassword
            }
        });

    } catch (error) {
        console.error('Super Admin create school error:', error);
        res.status(500).json({ success: false, message: 'Server error registering school branch' });
    }
});

// @route   PUT /api/superadmin/schools/:id
// @desc    Update school status or subscription
// @access  Private (Super Admin)
router.put('/schools/:id', async (req, res) => {
    try {
        const schoolId = req.params.id;
        const { 
            name, address, city, state, pincode, established_year, website,
            status, subscription_plan, subscription_end, board, principal_name, phone, email, logo,
            admin_email, admin_password
        } = req.body;

        // 1. Update associated Admin credentials if provided
        const [admins] = await db.query(
            'SELECT id, email FROM users WHERE school_id = ? AND role = "admin" ORDER BY id ASC LIMIT 1',
            [schoolId]
        );

        if (admins.length > 0) {
            const primaryAdminId = admins[0].id;

            if (admin_email && admin_email.trim()) {
                const emailClean = admin_email.trim();
                // Verify unique except the current primary admin user
                const [existing] = await db.query(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [emailClean, primaryAdminId]
                );
                if (existing.length > 0) {
                    return res.status(400).json({ success: false, message: 'The specified Admin Login ID (Email) is already in use by another user.' });
                }
                
                // Update admin email
                await db.query(
                    'UPDATE users SET email = ? WHERE id = ?',
                    [emailClean, primaryAdminId]
                );
            }

            if (admin_password && admin_password.trim()) {
                const passwordHash = await bcrypt.hash(admin_password.trim(), 10);
                await db.query(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [passwordHash, primaryAdminId]
                );
            }
        }

        const updates = [];
        const params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (address !== undefined) { updates.push('address = ?'); params.push(address || null); }
        if (city !== undefined) { updates.push('city = ?'); params.push(city || null); }
        if (state !== undefined) { updates.push('state = ?'); params.push(state || null); }
        if (pincode !== undefined) { updates.push('pincode = ?'); params.push(pincode || null); }
        if (established_year !== undefined) { updates.push('established_year = ?'); params.push(established_year ? parseInt(established_year) : null); }
        if (website !== undefined) { updates.push('website = ?'); params.push(website || null); }
        if (status) { updates.push('status = ?'); params.push(status); }
        if (subscription_plan) { updates.push('subscription_plan = ?'); params.push(subscription_plan); }
        if (subscription_end !== undefined) { updates.push('subscription_end = ?'); params.push(subscription_end || null); }
        if (board) { updates.push('board = ?'); params.push(board); }
        if (principal_name !== undefined) { updates.push('principal_name = ?'); params.push(principal_name || null); }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone || null); }
        if (email) { updates.push('email = ?'); params.push(email); }
        if (logo !== undefined) { updates.push('logo = ?'); params.push(logo || null); }

        if (updates.length === 0) {
            // It's possible only admin credentials were updated
            return res.json({ success: true, message: 'School admin credentials updated successfully' });
        }

        params.push(schoolId);
        await db.query(`UPDATE schools SET ${updates.join(', ')} WHERE id = ?`, params);

        logUpdate({
            schoolId: schoolId,
            moduleName: 'Super Admin',
            entityType: 'School',
            entityId: schoolId,
            entityName: name || `School #${schoolId}`,
            oldData: null,
            newData: req.body,
            description: `Updated school details / subscription for ${name || `School #${schoolId}`}`,
            user: req.user,
            req
        });

        res.json({ success: true, message: 'School details updated successfully' });
    } catch (error) {
        console.error('Super Admin update school error:', error);
        res.status(500).json({ success: false, message: 'Server error updating school details' });
    }
});

module.exports = router;
