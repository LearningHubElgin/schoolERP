const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { logActivity } = require('../middleware/activityLogger');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, name, phone } = req.body;

        // Validate input
        if (!email || !password || !role || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user (with default school_id = 1)
        const [result] = await db.query(
            'INSERT INTO users (email, password, role, name, phone, school_id) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, role, name, phone, 1]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, email, role },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        // Log successful registration
        req.user = { id: result.insertId, name, email, role, school_id: 1 };
        await logActivity(req, 'Register', `New user registered: ${name} (${role})`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                email,
                role,
                name,
                phone
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user (Support for Email OR Phone OR Student ID)
// @access  Public
router.post('/login', async (req, res) => {
    try {
        let { loginId, password, role } = req.body;

        if (!loginId || !password) {
            return res.status(401).json({
                success: false,
                message: 'Please provide Login ID and Password'
            });
        }

        // Trim whitespace from inputs
        loginId = loginId.trim();
        password = password.trim();

        // Role Emoji Mapping
        const roleEmojis = {
            admin: '🛡️',
            teacher: '👨‍🏫',
            student: '🎓',
            accountant: '💰',
            admission: '📝',
            librarian: '📚',
            storemanager: '🏪',
            security: '👮',
            driver: '🚌',
            nonteachingstaff: '🧑‍🔧'
        };
        const emoji = roleEmojis[role] || '👤';
        const { loginId: bodyLoginId, role: bodyRole, school_id: bodySchoolId, schoolId: bodySchoolIdAlt } = req.body;
        const displaySchoolId = bodySchoolId || bodySchoolIdAlt || 'N/A';

        // Find user by email OR phone OR ID OR student_unique_id with school info
        let query = `
            SELECT u.*, s.id as school_id, s.code as school_code, s.name as school_name, 
                   s.logo as school_logo, s.address as school_address, s.phone as school_phone,
                   s.email as school_email, s.principal_name, s.board, s.status as school_status
            FROM users u
            LEFT JOIN schools s ON u.school_id = s.id
            WHERE (u.email = ? OR u.phone = ? OR u.id = ? OR u.student_unique_id = ?)
        `;
        const params = [loginId, loginId, loginId, loginId];

        if (role) {
            if (role === 'transport') {
                query += ' AND u.role IN (?, ?)';
                params.push('transport', 'driver');
            } else {
                query += ' AND u.role = ?';
                params.push(role);
            }
        }

        query += ' ORDER BY (u.student_unique_id = ?) DESC, (u.email = ?) DESC, u.id DESC';
        params.push(loginId, loginId);

        const [users] = await db.query(query, params);

        const userFound = users.length > 0 ? users[0] : null;
        const currentRole = role || (userFound ? userFound.role : null);
        const attemptSchoolId = currentRole === 'superadmin' ? null : (userFound ? userFound.school_id : displaySchoolId);

        const loginAttemptData = { loginId };
        if (currentRole) loginAttemptData.role = currentRole;
        if (attemptSchoolId && attemptSchoolId !== 'N/A') loginAttemptData.schoolId = attemptSchoolId;

        console.log(`${emoji} Login attempt:`, loginAttemptData);

        if (users.length === 0) {
            await logActivity(req, 'Login', `Failed login attempt: User not found (${loginId})`, 'Failed');
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // ========== PASSOUT STUDENT CHECK ==========
        let isPassedOut = false;
        let passedOutYear = null;
        let passedOutClass = null;

        if (user.role === 'student') {
            // Check student status from students table
            const [studentData] = await db.query(
                `SELECT status, passed_out_year, passed_out_class 
                 FROM students 
                 WHERE user_id = ? AND school_id = ?`,
                [user.id, user.school_id]
            );

            if (studentData.length > 0) {
                isPassedOut = studentData[0].status === 'passed_out';
                passedOutYear = studentData[0].passed_out_year;
                passedOutClass = studentData[0].passed_out_class;
            }
        }

        // For passed out students, still allow login but with restricted access
        // Only check account status for non-passed-out students
        if (user.status !== 'active' && !isPassedOut) {
            return res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
        }
        // ========== END PASSOUT CHECK ==========

        // SECURE PASSWORD CHECK handles both plain text and bcrypt hash
        let isMatch = false;

        // Check if password looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Fallback for existing plain text passwords
            if (password === user.password) {
                isMatch = true;

                // Auto-migrate to secure hash for future logins
                try {
                    const newHashedPassword = await bcrypt.hash(password, 10);
                    await db.query('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, user.id]);
                    console.log(`🔒 Auto-migrated password for user ${user.id} to secure hash`);
                } catch (hashError) {
                    console.error('Error during automatic password migration:', hashError);
                }
            }
        }

        if (!isMatch) {
            await logActivity(req, 'Login', `Failed login attempt: Invalid password for ${user.email}`, 'Failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        const schoolLogInfo = user.role === 'superadmin' ? '' : ` - School ID: ${user.school_id} (${user.school_code || 'N/A'})`;
        console.log(`✅ Successful login: ${user.name} (${user.role})${schoolLogInfo}`);

        // Log successful login
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role, school_id: user.school_id };
        await logActivity(req, 'Login', `User logged in successfully: ${user.name} (${user.role})`);

        // Generate JWT token (includes school_id and passout info)
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                school_id: user.school_id,
                isPassedOut: isPassedOut,
                passedOutYear: passedOutYear,
                passedOutClass: passedOutClass
            },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        // Get the actual name from the role-specific table
        let displayName = user.name; // Default to users table name

        if (user.role === 'teacher') {
            const [teachers] = await db.query(
                'SELECT name FROM teachers WHERE user_id = ?',
                [user.id]
            );
            if (teachers.length > 0 && teachers[0].name) {
                displayName = teachers[0].name;
            }
        } else if (user.role === 'student') {
            const [students] = await db.query(
                'SELECT student_name FROM students WHERE user_id = ?',
                [user.id]
            );
            if (students.length > 0 && students[0].student_name) {
                displayName = students[0].student_name;
            }
        }

        const responseData = {
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: displayName,
                phone: user.phone,
                status: user.status,
                school_id: user.role === 'superadmin' ? null : user.school_id,
                // ========== PASSOUT INFO ==========
                isPassedOut: isPassedOut,
                passedOutYear: passedOutYear,
                passedOutClass: passedOutClass
                // ========== END PASSOUT INFO ==========
            }
        };

        if (user.role !== 'superadmin') {
            responseData.school = {
                id: user.school_id,
                code: user.school_code,
                name: user.school_name,
                logo: user.school_logo,
                address: user.school_address,
                phone: user.school_phone,
                email: user.school_email,
                principal_name: user.principal_name,
                board: user.board,
                status: user.school_status
            };
        } else {
            responseData.school = null;
        }

        res.json(responseData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user with school info
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');

        const [users] = await db.query(
            `SELECT u.id, u.email, u.role, u.name, u.phone, u.status, u.school_id,
                    s.code as school_code, s.name as school_name, s.logo as school_logo,
                    s.address as school_address, s.phone as school_phone, s.email as school_email,
                    s.pincode as school_pincode, s.principal_signature
             FROM users u
             LEFT JOIN schools s ON u.school_id = s.id
             WHERE u.id = ?`,
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // ========== PASSOUT CHECK FOR /ME ENDPOINT ==========
        let isPassedOut = false;
        let passedOutYear = null;
        let passedOutClass = null;

        if (user.role === 'student') {
            const [studentData] = await db.query(
                `SELECT status, passed_out_year, passed_out_class 
                 FROM students 
                 WHERE user_id = ? AND school_id = ?`,
                [user.id, user.school_id]
            );

            if (studentData.length > 0) {
                isPassedOut = studentData[0].status === 'passed_out';
                passedOutYear = studentData[0].passed_out_year;
                passedOutClass = studentData[0].passed_out_class;
            }
        }
        // ========== END PASSOUT CHECK ==========

        const responseData = {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                phone: user.phone,
                status: user.status,
                school_id: user.role === 'superadmin' ? null : user.school_id,
                // ========== PASSOUT INFO ==========
                isPassedOut: isPassedOut,
                passedOutYear: passedOutYear,
                passedOutClass: passedOutClass
                // ========== END PASSOUT INFO ==========
            }
        };

        if (user.role !== 'superadmin') {
            responseData.school = {
                id: user.school_id,
                code: user.school_code,
                name: user.school_name,
                logo: user.school_logo,
                address: user.school_address,
                phone: user.school_phone,
                email: user.school_email,
                pincode: user.school_pincode,
                principal_signature: user.principal_signature
            };
        } else {
            responseData.school = null;
        }

        res.json(responseData);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/auth/schools
// @desc    Get all active schools (for login dropdown)
// @access  Public
router.get('/schools', async (req, res) => {
    try {
        const [schools] = await db.query(
            `SELECT id, code, name, logo, city, state 
             FROM schools 
             WHERE status = 'active' 
             ORDER BY name ASC`
        );

        res.json({
            success: true,
            schools
        });
    } catch (error) {
        console.error('Get schools error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Configure nodemailer (add to .env)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link to email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Find user by email
        const [users] = await db.query(
            'SELECT id, name, role, school_id FROM users WHERE email = ?',
            [email]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }
        const user = users[0];

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Store token in database
        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );

        // Send email with reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: `"School ERP" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Reset Your Password</h2>
                    <p>Hello ${user.name},</p>
                    <p>You requested to reset your password. Click the link below to set a new password (valid for 1 hour):</p>
                    <a href="${resetLink}" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Password reset link sent to your email.' });

        // Log forgot-password
        req.user = { id: user.id, name: user.name, email: email, role: user.role, school_id: user.school_id };
        await logActivity(req, 'Password Reset Request', `Requested password reset link for ${email}`);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Find valid token
        const [tokens] = await db.query(
            'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        if (tokens.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
        const userId = tokens[0].user_id;

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        // Delete used token
        await db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

        res.json({ success: true, message: 'Password has been reset successfully.' });

        // Log password reset
        req.user = { id: userId, school_id: 1 };
        await logActivity(req, 'Password Changed', `Reset password using token`);
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;