const express = require('express');
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { generateStudentUniqueId } = require('../utils/idGenerator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const router = express.Router();
const { logActivity, logUpdate, logCreate, logDelete } = require('../utils/activityLogger');

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(roleMiddleware('teacher'));

// Middleware to check if teacher has student management permission
const studentPermissionMiddleware = async (req, res, next) => {
    try {
        const [teachers] = await db.query(
            'SELECT can_manage_students, managed_classes, managed_streams FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, req.user.school_id]
        );

        if (teachers.length === 0 || !teachers[0].can_manage_students) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage students'
            });
        }

        let managedClasses = teachers[0].managed_classes;
        if (typeof managedClasses === 'string') {
            try { managedClasses = JSON.parse(managedClasses); } catch (e) { managedClasses = []; }
        }

        let managedStreams = teachers[0].managed_streams;
        if (typeof managedStreams === 'string') {
            try { managedStreams = JSON.parse(managedStreams); } catch (e) { managedStreams = []; }
        }

        req.teacherPermissions = {
            allClasses: !managedClasses || managedClasses.includes('all'),
            allowedClasses: managedClasses || [],
            allowedStreams: managedStreams || []
        };
        next();
    } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @route   GET /api/teacher/permissions
// @desc    Get teacher permissions
// @access  Private (Teacher)
router.get('/permissions', async (req, res) => {
    try {
        const [teachers] = await db.query(
            'SELECT can_manage_students FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, req.user.school_id]
        );

        res.json({
            success: true,
            permissions: {
                can_manage_students: teachers.length > 0 ? !!teachers[0].can_manage_students : false
            }
        });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/profile
// @desc    Get teacher profile (school-specific)
// @access  Private (Teacher)

// ==================== MULTER CONFIG FOR TEACHER UPLOADS ====================
const teacherStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'assignments';
        if (req.path.includes('class-notes')) folder = 'class_notes';

        const dir = path.join(__dirname, '..', 'upload', folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

const teacherUpload = multer({
    storage: teacherStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Allow PDF, Doc, Images
        if (file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf' ||
            file.mimetype.includes('msword') ||
            file.mimetype.includes('officedocument')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'), false);
        }
    }
});

// ==================== MULTER CONFIG FOR STUDENT PHOTOS ====================
const studentPhotoDir = path.join(__dirname, '..', 'upload', 'student_photos');
if (!fs.existsSync(studentPhotoDir)) fs.mkdirSync(studentPhotoDir, { recursive: true });

const studentPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, studentPhotoDir),
    filename: (req, file, cb) => {
        const schoolId = req.user ? req.user.school_id : 'school';
        const studentId = req.params.id || 'id';
        const ext = path.extname(file.originalname);
        const serialNumber = Date.now();

        if (studentId !== 'id') {
            db.query('SELECT student_name FROM students WHERE id = ?', [studentId])
                .then(([rows]) => {
                    let studentName = 'student';
                    if (rows.length > 0 && rows[0].student_name) {
                        studentName = rows[0].student_name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                    }
                    cb(null, `${schoolId}-${studentId}-${studentName}-${serialNumber}${ext}`);
                })
                .catch(() => cb(null, `${schoolId}-${studentId}-student-${serialNumber}${ext}`));
        } else {
            cb(null, `${schoolId}-${studentId}-student-${serialNumber}${ext}`);
        }
    }
});

const uploadStudentPhoto = multer({
    storage: studentPhotoStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Invalid file type. Only images are allowed.'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ==================== MULTER CONFIG FOR STUDENT DOCUMENTS ====================
const studentDocsDir = path.join(__dirname, '..', 'upload', 'student_docs');
if (!fs.existsSync(studentDocsDir)) fs.mkdirSync(studentDocsDir, { recursive: true });

const studentDocsStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, studentDocsDir),
    filename: (req, file, cb) => {
        const schoolId = req.user ? req.user.school_id : 'school';
        const studentId = req.params.id || 'id';
        const fieldName = file.fieldname;
        const ext = path.extname(file.originalname);
        const serialNumber = Date.now();

        if (studentId !== 'id') {
            db.query('SELECT student_name FROM students WHERE id = ?', [studentId])
                .then(([rows]) => {
                    let studentName = 'student';
                    if (rows.length > 0 && rows[0].student_name) {
                        studentName = rows[0].student_name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                    }
                    cb(null, `${schoolId}-${studentId}-${fieldName}-${studentName}-${serialNumber}${ext}`);
                })
                .catch(() => cb(null, `${schoolId}-${studentId}-${fieldName}-student-${serialNumber}${ext}`));
        } else {
            cb(null, `${schoolId}-${studentId}-${fieldName}-student-${serialNumber}${ext}`);
        }
    }
});

const uploadStudentDocs = multer({
    storage: studentDocsStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Invalid file type. Only images and PDF files are allowed.'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/profile', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            `SELECT t.*, u.email, u.phone, u.status
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ? AND t.school_id = ?`,
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher profile not found'
            });
        }

        // Get assigned classes (school-specific)
        const [classes] = await db.query(
            'SELECT class, section FROM teacher_classes WHERE teacher_id = ? AND school_id = ?',
            [teachers[0].id, schoolId]
        );

        res.json({
            success: true,
            teacher: {
                ...teachers[0],
                classes: classes.map(c => `${c.class}-${c.section}`)
            }
        });
    } catch (error) {
        console.error('Get teacher profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/teacher/change-password
// @desc    Change teacher password
// @access  Private (Teacher)
router.put('/change-password', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        // Get current user (teacher's login credentials)
        const [users] = await db.query(
            'SELECT password FROM users WHERE id = ? AND school_id = ?',
            [userId, schoolId]
        );
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const storedPassword = users[0].password;
        let isMatch = false;

        // Check if stored password is bcrypt hash or plain text
        if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
            isMatch = await bcrypt.compare(currentPassword, storedPassword);
        } else {
            isMatch = (currentPassword === storedPassword);
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE users SET password = ? WHERE id = ? AND school_id = ?',
            [hashedPassword, userId, schoolId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

        // Log password change
        await logActivity(req, 'Password Changed', `User changed their own password`);
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// @route   GET /api/teacher/students
// @desc    Get students for teacher's classes (school-specific)
// @access  Private (Teacher)
router.get('/students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherId = teachers[0].id;

        // Get teacher's classes (school-specific)
        const [classes] = await db.query(
            'SELECT class, section FROM teacher_classes WHERE teacher_id = ? AND school_id = ?',
            [teacherId, schoolId]
        );

        if (classes.length === 0) {
            return res.json({
                success: true,
                students: []
            });
        }

        // Build query for students in these classes (school-specific)
        const classConditions = classes.map(() => '(s.class = ? AND s.section = ?)').join(' OR ');
        const classParams = classes.flatMap(c => [c.class, c.section]);

        const [students] = await db.query(
            `SELECT s.id, s.roll_no, s.student_name as name, s.class, s.section, s.email, s.phone
       FROM students s
       WHERE (${classConditions}) AND s.school_id = ?
       ORDER BY s.class, s.section, s.roll_no`,
            [...classParams, schoolId]
        );

        res.json({
            success: true,
            students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teacher/attendance-mode
// @desc    Get hybrid attendance classes: day-wise (1-10) from admin config + subject-wise (11-12) from timetable
// @access  Private (Teacher)
router.get('/attendance-mode', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get teacher ID
        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.json({ success: true, mode: 'hybrid', assignedClasses: [] });
        }

        const teacherId = teachers[0].id;

        // 1. Get day-wise assigned classes (classes 1-10, assigned by admin)
        const [dayWiseClasses] = await db.query(
            `SELECT dat.class_number, dat.section,
                    c.name as class_name, sec.name as section_name,
                    COUNT(DISTINCT s.id) as student_count
             FROM daywise_attendance_teachers dat
             LEFT JOIN classes c ON dat.class_number COLLATE utf8mb4_unicode_ci = c.class_number AND c.school_id = ?
             LEFT JOIN sections sec ON dat.section COLLATE utf8mb4_unicode_ci = sec.code AND sec.school_id = ?
             LEFT JOIN students s ON s.class = dat.class_number COLLATE utf8mb4_unicode_ci AND s.section = dat.section COLLATE utf8mb4_unicode_ci AND s.school_id = ?
             WHERE dat.school_id = ? AND dat.teacher_id = ?
             GROUP BY dat.class_number, dat.section, c.name, sec.name
             ORDER BY dat.class_number, dat.section`,
            [schoolId, schoolId, schoolId, schoolId, teacherId]
        );

        // 2. Get timetable-based classes for 11 & 12 (subject-wise)
        const [timetableClasses] = await db.query(
            `SELECT DISTINCT 
                tt.class_number,
                tt.section,
                c.name as class_name,
                sec.name as section_name,
                COUNT(DISTINCT s.id) as student_count
            FROM timetable tt
            LEFT JOIN classes c ON tt.class_number = c.class_number AND c.school_id = ?
            LEFT JOIN sections sec ON tt.section = sec.code AND sec.school_id = ?
            LEFT JOIN students s ON s.class = tt.class_number AND s.section = tt.section AND s.school_id = ?
            WHERE tt.teacher_id = ? AND tt.school_id = ?
              AND (
                UPPER(tt.class_number) LIKE '%11%' OR UPPER(tt.class_number) LIKE '%12%'
                OR UPPER(tt.class_number) LIKE '%XI%'
              )
            GROUP BY tt.class_number, tt.section, c.name, sec.name
            ORDER BY tt.class_number, tt.section`,
            [schoolId, schoolId, schoolId, teacherId, schoolId]
        );

        // Tag each class with its attendance mode
        const dayWiseKeys = new Set(dayWiseClasses.map(c => `${c.class_number}-${c.section}`));

        // 3. Also get timetable-based classes for 1-10 (fallback for teachers not in daywise_attendance_teachers)
        const [timetableClasses1to10] = await db.query(
            `SELECT DISTINCT 
                tt.class_number,
                tt.section,
                c.name as class_name,
                sec.name as section_name,
                COUNT(DISTINCT s.id) as student_count
            FROM timetable tt
            LEFT JOIN classes c ON tt.class_number = c.class_number AND c.school_id = ?
            LEFT JOIN sections sec ON tt.section = sec.code AND sec.school_id = ?
            LEFT JOIN students s ON s.class = tt.class_number AND s.section = tt.section AND s.school_id = ?
            WHERE tt.teacher_id = ? AND tt.school_id = ?
              AND NOT (
                UPPER(tt.class_number) LIKE '%11%' OR UPPER(tt.class_number) LIKE '%12%'
                OR UPPER(tt.class_number) LIKE '%XI%'
              )
            GROUP BY tt.class_number, tt.section, c.name, sec.name
            ORDER BY tt.class_number, tt.section`,
            [schoolId, schoolId, schoolId, teacherId, schoolId]
        );

        const allClasses = [
            ...dayWiseClasses.map(c => ({ ...c, attendance_mode: 'day_wise' })),
            // Add timetable 1-10 classes that aren't already in daywise
            ...timetableClasses1to10
                .filter(c => !dayWiseKeys.has(`${c.class_number}-${c.section}`))
                .map(c => ({ ...c, attendance_mode: 'day_wise' })),
            ...timetableClasses.map(c => ({ ...c, attendance_mode: 'subject_wise' }))
        ];

        res.json({ success: true, mode: 'hybrid', assignedClasses: allClasses });
    } catch (error) {
        console.error('Get attendance mode error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/teacher/attendance
// @desc    Mark attendance (only for today)
// @access  Private (Teacher)
router.post('/attendance', async (req, res) => {
    try {
        const { date, subject, attendanceData, className, section } = req.body;

        // The frontend sends 'day_wise' as subject for classes 1-10, or the actual subject name for classes 11-12
        const effectiveSubject = subject || 'day_wise';
        const isSubjectWise = effectiveSubject !== 'day_wise';

        if (!date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        if (isSubjectWise && !subject) {
            return res.status(400).json({ success: false, message: 'Please select a subject' });
        }

        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id, name FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherName = teachers[0].name || 'Unknown Teacher';

        // Derive class and section for cleaner logging (with database query fallback if not provided)
        let derivedClass = className || 'N/A';
        let derivedSection = section || '';

        if ((!className || className === 'N/A') && attendanceData.length > 0) {
            try {
                const [studentInfo] = await db.query(
                    'SELECT class, section FROM students WHERE id = ?',
                    [attendanceData[0].studentId]
                );
                if (studentInfo.length > 0) {
                    derivedClass = studentInfo[0].class;
                    derivedSection = studentInfo[0].section || '';
                }
            } catch (err) {
                console.error('Error fetching student class details:', err.message);
            }
        }

        const values = attendanceData.map(record => [
            record.studentId,
            date,
            effectiveSubject,
            record.status,
            req.user.id,
            String(req.user.id),
            record.remarks || null,
            schoolId
        ]);

        const displayClass = derivedSection ? `${derivedClass}-${derivedSection}` : derivedClass;
        console.log(`📝 [Attendance] Teacher "${teacherName}" marked attendance for Class "${displayClass}" (${values.length} students) on ${date} (Subject/Mode: ${effectiveSubject})`);

        // Ensure marked_by_history column exists
        await db.query(`ALTER TABLE students_attendance ADD COLUMN IF NOT EXISTS marked_by_history VARCHAR(255) NULL AFTER marked_by`).catch(() => {});

        await db.query(
            `INSERT INTO students_attendance (student_id, date, subject, status, marked_by, marked_by_history, remarks, school_id)
             VALUES ?
             ON DUPLICATE KEY UPDATE 
                 status = VALUES(status), 
                 remarks = VALUES(remarks),
                 marked_by = VALUES(marked_by),
                 marked_by_history = IF(marked_by_history IS NULL OR marked_by_history = '', 
                                        CAST(VALUES(marked_by) AS CHAR), 
                                        IF(FIND_IN_SET(VALUES(marked_by), marked_by_history), 
                                           marked_by_history, 
                                           CONCAT_WS(',', marked_by_history, VALUES(marked_by)))),
                 updated_at = CURRENT_TIMESTAMP`,
            [values]
        );

        res.json({
            success: true,
            message: 'Attendance marked successfully'
        });

    } catch (error) {
        console.error('❌ [Attendance] Error marking student attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/teacher/attendance/:date
// @desc    Get attendance for a specific date
// @access  Private (Teacher)
router.get('/attendance/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { classNumber, section, subject } = req.query;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        let query = `
            SELECT 
                a.*,
                s.roll_no,
                s.student_name,
                s.class,
                s.section,
                COALESCE(t.name, u.name) as marker_teacher_name
            FROM students_attendance a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN users u ON a.marked_by = u.id
            LEFT JOIN teachers t ON t.user_id = u.id
            WHERE a.date = ? AND a.school_id = ?
        `;

        const params = [date, schoolId];

        if (classNumber && section) {
            query += ' AND s.class = ? AND s.section = ?';
            params.push(classNumber, section);
        }

        if (subject) {
            query += ' AND a.subject = ?';
            params.push(subject);
        }

        query += ' ORDER BY s.class, s.section, s.roll_no';

        const [attendance] = await db.query(query, params);

        // Resolve all teacher names from marked_by and marked_by_history
        const allUserIds = new Set();
        attendance.forEach(rec => {
            if (rec.marked_by) allUserIds.add(rec.marked_by);
            if (rec.marked_by_history) {
                String(rec.marked_by_history).split(',').forEach(id => {
                    const trimmed = id.trim();
                    if (trimmed) allUserIds.add(trimmed);
                });
            }
        });

        let teacherNamesJoined = '';
        if (allUserIds.size > 0) {
            const [userRows] = await db.query(
                `SELECT u.id, COALESCE(t.name, u.name) as name 
                 FROM users u 
                 LEFT JOIN teachers t ON t.user_id = u.id 
                 WHERE u.id IN (?)`,
                [Array.from(allUserIds)]
            );
            const nameMap = {};
            userRows.forEach(u => { nameMap[u.id] = u.name; });
            teacherNamesJoined = Array.from(allUserIds).map(id => nameMap[id] || `User #${id}`).join(', ');
        }

        res.json({
            success: true,
            attendance,
            already_marked: attendance.length > 0,
            marked_by_names: teacherNamesJoined || (attendance[0]?.marker_teacher_name || '')
        });

    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teacher/attendance-summary
// @desc    Get attendance summary for teacher's classes
// @access  Private (Teacher)
router.get('/attendance-summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherId = teachers[0].id;

        let query = `
            SELECT 
                s.class,
                s.section,
                a.date,
                COUNT(*) as total_students,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count
            FROM students_attendance a
            JOIN students s ON a.student_id = s.id
            WHERE (a.marked_by = ? OR a.marked_by = ?) AND a.school_id = ?
        `;

        const params = [req.user.id, teacherId, schoolId];

        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY s.class, s.section, a.date ORDER BY a.date DESC, s.class, s.section';

        const [summary] = await db.query(query, params);

        res.json({
            success: true,
            summary
        });

    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teacher/assigned-classes
// @desc    Get classes assigned to the teacher from timetable
// @access  Private (Teacher)
router.get('/assigned-classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherId = teachers[0].id;

        // Get unique class-section combinations from timetable (school-specific)
        const [classes] = await db.query(
            `SELECT DISTINCT 
                tt.class_number,
                tt.section,
                c.name as class_name,
                sec.name as section_name,
                COUNT(DISTINCT s.id) as student_count
            FROM timetable tt
            LEFT JOIN classes c ON tt.class_number = c.class_number AND c.school_id = ?
            LEFT JOIN sections sec ON tt.section = sec.code AND sec.school_id = ?
            LEFT JOIN students s ON s.class = tt.class_number AND s.section = tt.section AND s.school_id = ?
            WHERE tt.teacher_id = ? AND tt.school_id = ?
            GROUP BY tt.class_number, tt.section, c.name, sec.name
            ORDER BY tt.class_number, tt.section`,
            [schoolId, schoolId, schoolId, teacherId, schoolId]
        );

        res.json({
            success: true,
            classes
        });

    } catch (error) {
        console.error('Get assigned classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teacher/students-by-class
// @desc    Get students for a specific class, section, and optionally stream
// @access  Private (Teacher)
router.get('/students-by-class', async (req, res) => {
    try {
        const { classNumber, section, streamId } = req.query;
        const schoolId = req.user.school_id;

        if (!classNumber || !section) {
            return res.status(400).json({
                success: false,
                message: 'Please provide class number and section'
            });
        }

        try {
            await db.query("ALTER TABLE students ADD COLUMN father_phone VARCHAR(20) DEFAULT NULL");
        } catch (e) {}
        try {
            await db.query("ALTER TABLE students ADD COLUMN mother_phone VARCHAR(20) DEFAULT NULL");
        } catch (e) {}

        let query = `SELECT 
                s.id,
                s.user_id,
                s.student_unique_id,
                s.roll_no,
                s.class,
                s.section,
                s.student_name as name,
                s.email,
                s.phone,
                s.date_of_birth,
                s.gender,
                s.address,
                s.father_name,
                s.mother_name,
                s.father_phone,
                s.mother_phone,
                s.admission_date,
                s.blood_group,
                s.medical_conditions,
                s.previous_school,
                s.previous_class,
                s.photo_path
            FROM students s
            WHERE s.class = ? AND s.section = ? AND s.school_id = ?`;

        const params = [classNumber, section, schoolId];

        if (streamId) {
            query += ' AND s.stream_id = ?';
            params.push(streamId);
        }

        query += ' ORDER BY s.roll_no';

        const [students] = await db.query(query, params);

        res.json({
            success: true,
            students
        });

    } catch (error) {
        console.error('Get students by class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teacher/class-streams
// @desc    Get streams linked to a class number
// @access  Private (Teacher)
router.get('/class-streams', async (req, res) => {
    try {
        const { classNumber } = req.query;
        const schoolId = req.user.school_id;

        if (!classNumber) {
            return res.status(400).json({ success: false, message: 'Class number is required' });
        }

        const [streams] = await db.query(
            `SELECT cs.id as link_id, st.* 
             FROM class_streams cs 
             JOIN streams st ON cs.stream_id = st.id 
             JOIN classes c ON cs.class_id = c.id
             WHERE c.class_number = ? AND cs.school_id = ? AND c.school_id = ?
             ORDER BY st.name`,
            [classNumber, schoolId, schoolId]
        );

        res.json({
            success: true,
            streams
        });
    } catch (error) {
        console.error('Get class streams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/hs-timetable-entries
// @desc    Get this teacher's distinct timetable entries for higher-secondary (11/12) classes
// @access  Private (Teacher)
router.get('/hs-timetable-entries', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );
        if (teachers.length === 0) {
            return res.json({ success: true, entries: [] });
        }
        const teacherId = teachers[0].id;

        const [entries] = await db.query(
            `SELECT DISTINCT 
                tt.class_number,
                tt.section,
                tt.subject_id,
                COALESCE(s.name, tt.subject_name) as subject_name,
                COALESCE(s.code, '') as subject_code,
                sec.name as section_name,
                tt.stream_id,
                str.name as stream_name
            FROM timetable tt
            LEFT JOIN subjects s ON tt.subject_id = s.id
            LEFT JOIN sections sec ON tt.section = sec.code AND sec.school_id = ?
            LEFT JOIN streams str ON tt.stream_id = str.id
            WHERE tt.teacher_id = ? AND tt.school_id = ?
              AND (
                UPPER(tt.class_number) LIKE '%11%' OR UPPER(tt.class_number) LIKE '%12%'
                OR UPPER(tt.class_number) LIKE '%XI%'
              )
            ORDER BY tt.class_number, tt.section, subject_name`,
            [schoolId, teacherId, schoolId]
        );

        res.json({ success: true, entries });
    } catch (error) {
        console.error('Get HS timetable entries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/attendance-check
// @desc    Check if attendance already exists for date and class
// @access  Private (Teacher)
router.get('/attendance-check', async (req, res) => {
    try {
        const { date, classNumber, section } = req.query;
        const schoolId = req.user.school_id;

        if (!date || !classNumber || !section) {
            return res.status(400).json({
                success: false,
                message: 'Please provide date, class number and section'
            });
        }

        // Check if attendance exists (school-specific)
        const [attendance] = await db.query(
            `SELECT DISTINCT a.date
            FROM students_attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.date = ? AND s.class = ? AND s.section = ? AND a.school_id = ?
            LIMIT 1`,
            [date, classNumber, section, schoolId]
        );

        res.json({
            success: true,
            exists: attendance.length > 0
        });

    } catch (error) {
        console.error('Check attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/teacher/subjects
// @desc    Get subjects taught by the teacher
// @access  Private (Teacher)
router.get('/subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherId = teachers[0].id;
        const { classNumber, section } = req.query;

        // Get unique subjects from timetable (school-specific)
        let query = `SELECT DISTINCT 
                s.id,
                s.name,
                s.code
            FROM timetable tt
            JOIN subjects s ON tt.subject_id = s.id
            WHERE tt.teacher_id = ? AND tt.school_id = ?`;

        const params = [teacherId, schoolId];

        if (classNumber && section) {
            query += ' AND tt.class_number = ? AND tt.section = ?';
            params.push(classNumber, section);
        }

        query += ' ORDER BY s.name';

        const [subjects] = await db.query(query, params);

        res.json({
            success: true,
            subjects
        });

    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/teacher/requisitions
// @desc    Create a new requisition
// @access  Private (Teacher)
router.post('/requisitions', async (req, res) => {
    try {
        const { item, quantity, description, urgency, category } = req.body;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id, name FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacher = teachers[0];

        const [result] = await db.query(
            `INSERT INTO teachers_requisition 
             (teacher_id, teacher_name, item, quantity, description, urgency, category, submitted_date, status, school_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Pending', ?)`,
            [teacher.id, teacher.name, item, quantity, description, urgency, category, schoolId]
        );

        res.json({
            success: true,
            message: 'Requisition created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create requisition error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create requisition'
        });
    }
});

// @route   GET /api/teacher/requisitions/:teacherId
// @desc    Get all requisitions for a teacher
// @access  Private (Teacher)
router.get('/requisitions/:teacherId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [results] = await db.query(
            'SELECT * FROM teachers_requisition WHERE teacher_id = ? AND school_id = ? ORDER BY created_at DESC',
            [req.params.teacherId, schoolId]
        );
        res.json(results);
    } catch (error) {
        console.error('Get requisitions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch requisitions'
        });
    }
});

// @route   GET /api/teacher/my-requisitions
// @desc    Get all requisitions for the logged-in teacher
// @access  Private (Teacher)
router.get('/my-requisitions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherId = teachers[0].id;

        const [results] = await db.query(
            'SELECT *, DATE_FORMAT(submitted_date, "%Y-%m-%d") as submitted_date FROM teachers_requisition WHERE teacher_id = ? AND school_id = ? ORDER BY submitted_date DESC, id DESC',
            [teacherId, schoolId]
        );
        res.json(results);
    } catch (error) {
        console.error('Get my requisitions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch requisitions'
        });
    }
});

// @route   PUT /api/teacher/requisitions/:id
// @desc    Update pending requisition
// @access  Private (Teacher)
router.put('/requisitions/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const requisitionId = req.params.id;
        const { item, quantity, description, urgency, category } = req.body;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacherId = teachers[0].id;

        const [reqs] = await db.query(
            'SELECT id, status, DATE(submitted_date) as date_only, CURDATE() as today_date FROM teachers_requisition WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [requisitionId, teacherId, schoolId]
        );

        if (reqs.length === 0) {
            return res.status(404).json({ success: false, message: 'Requisition not found' });
        }

        const reqItem = reqs[0];
        const submittedDateStr = new Date(reqItem.date_only).toISOString().split('T')[0];
        const todayDateStr = new Date(reqItem.today_date).toISOString().split('T')[0];

        if (submittedDateStr !== todayDateStr) {
            return res.status(400).json({ success: false, message: 'You can only edit requisitions submitted today.' });
        }

        if (reqItem.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending requisitions can be edited' });
        }

        await db.query(
            `UPDATE teachers_requisition 
             SET item = ?, quantity = ?, description = ?, urgency = ?, category = ? 
             WHERE id = ? AND teacher_id = ? AND school_id = ?`,
            [item, quantity, description, urgency, category, requisitionId, teacherId, schoolId]
        );

        res.json({ success: true, message: 'Requisition updated successfully' });
    } catch (error) {
        console.error('Update requisition error:', error);
        res.status(500).json({ success: false, message: 'Failed to update requisition' });
    }
});

// @route   DELETE /api/teacher/requisitions/:id
// @desc    Delete requisition (ONLY allowed on the same day of submission)
// @access  Private (Teacher)
router.delete('/requisitions/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const requisitionId = req.params.id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacherId = teachers[0].id;

        const [reqs] = await db.query(
            'SELECT id, DATE(submitted_date) as date_only, CURDATE() as today_date FROM teachers_requisition WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [requisitionId, teacherId, schoolId]
        );

        if (reqs.length === 0) {
            return res.status(404).json({ success: false, message: 'Requisition not found' });
        }

        const reqItem = reqs[0];
        const submittedDateStr = new Date(reqItem.date_only).toISOString().split('T')[0];
        const todayDateStr = new Date(reqItem.today_date).toISOString().split('T')[0];

        if (submittedDateStr !== todayDateStr) {
            return res.status(400).json({
                success: false,
                message: 'You can only delete requisitions submitted today.'
            });
        }

        await db.query('DELETE FROM teachers_requisition WHERE id = ? AND teacher_id = ? AND school_id = ?', [requisitionId, teacherId, schoolId]);

        res.json({ success: true, message: 'Requisition deleted successfully' });
    } catch (error) {
        console.error('Delete requisition error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete requisition' });
    }
});

// @route   GET /api/debug/teachers
// @desc    Get all teachers for debugging
router.get('/debug/teachers', async (req, res) => {
    try {
        const [teachers] = await db.query('SELECT * FROM teachers');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TEACHER GRIEVANCE ROUTES ====================

// @route   GET /api/teacher/grievances
// @desc    Get teacher grievances
// @access  Private (Teacher)
router.get('/grievances', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT id, name FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacherId = teachers[0].id;

        const [grievances] = await db.query(
            'SELECT *, DATE_FORMAT(submitted_date, "%Y-%m-%d") as submitted_date FROM teacher_grievance WHERE teacher_id = ? AND school_id = ? ORDER BY submitted_date DESC, id DESC',
            [teacherId, schoolId]
        );

        res.json({
            success: true,
            grievances
        });
    } catch (error) {
        console.error('Get grievances error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/teacher/grievances
// @desc    Submit a new grievance
// @access  Private (Teacher)
router.post('/grievances', async (req, res) => {
    try {
        const { subject, category, description, priority } = req.body;
        const schoolId = req.user.school_id;

        if (!subject || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [teachers] = await db.query(
            'SELECT id, name FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacher = teachers[0];

        const [result] = await db.query(
            `INSERT INTO teacher_grievance (teacher_id, teacher_name, department, subject, category, description, priority, submitted_date, status, school_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Pending', ?)`,
            [teacher.id, teacher.name, teacher.department || '', subject, category, description, priority || 'Medium', schoolId]
        );

        res.status(201).json({
            success: true,
            message: 'Grievance submitted successfully',
            grievanceId: result.insertId
        });
    } catch (error) {
        console.error('Submit grievance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/teacher/grievances/:id
// @desc    Update pending grievance
// @access  Private (Teacher)
router.put('/grievances/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const grievanceId = req.params.id;
        const { subject, category, description, priority } = req.body;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacherId = teachers[0].id;

        const [g] = await db.query(
            'SELECT id, status, DATE(submitted_date) as date_only, CURDATE() as today_date FROM teacher_grievance WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [grievanceId, teacherId, schoolId]
        );

        if (g.length === 0) {
            return res.status(404).json({ success: false, message: 'Grievance not found' });
        }

        const gItem = g[0];
        const submittedDateStr = new Date(gItem.date_only).toISOString().split('T')[0];
        const todayDateStr = new Date(gItem.today_date).toISOString().split('T')[0];

        if (submittedDateStr !== todayDateStr) {
            return res.status(400).json({ success: false, message: 'You can only edit grievances submitted today.' });
        }

        if (gItem.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending grievances can be edited' });
        }

        await db.query(
            `UPDATE teacher_grievance 
             SET subject = ?, category = ?, description = ?, priority = ? 
             WHERE id = ? AND teacher_id = ? AND school_id = ?`,
            [subject, category, description, priority, grievanceId, teacherId, schoolId]
        );

        res.json({ success: true, message: 'Grievance updated successfully' });
    } catch (error) {
        console.error('Update grievance error:', error);
        res.status(500).json({ success: false, message: 'Failed to update grievance' });
    }
});

// @route   DELETE /api/teacher/grievances/:id
// @desc    Delete grievance (ONLY allowed on the same day of submission)
// @access  Private (Teacher)
router.delete('/grievances/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const grievanceId = req.params.id;

        const [teachers] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacherId = teachers[0].id;

        const [g] = await db.query(
            'SELECT id, DATE(submitted_date) as date_only, CURDATE() as today_date FROM teacher_grievance WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [grievanceId, teacherId, schoolId]
        );

        if (g.length === 0) {
            return res.status(404).json({ success: false, message: 'Grievance not found' });
        }

        const gItem = g[0];
        const submittedDateStr = new Date(gItem.date_only).toISOString().split('T')[0];
        const todayDateStr = new Date(gItem.today_date).toISOString().split('T')[0];

        if (submittedDateStr !== todayDateStr) {
            return res.status(400).json({
                success: false,
                message: 'You can only delete grievances submitted today.'
            });
        }

        await db.query('DELETE FROM teacher_grievance WHERE id = ? AND teacher_id = ? AND school_id = ?', [grievanceId, teacherId, schoolId]);

        res.json({ success: true, message: 'Grievance deleted successfully' });
    } catch (error) {
        console.error('Delete grievance error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete grievance' });
    }
});





// @route   GET /api/teacher/dashboard-stats
// @desc    Get aggregated stats for teacher dashboard
// @access  Private (Teacher)
router.get('/dashboard-stats', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get Teacher ID and Name
        const [teachers] = await db.query(
            'SELECT id, name FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacher = teachers[0];

        // 2. Get Today's Schedule (school-specific)
        const [schedule] = await db.query(`
            SELECT 
                ts.start_time, ts.end_time,
                s.name as subject,
                tt.class_number,
                tt.section,
                tt.room_number
            FROM timetable tt
            JOIN time_slots ts ON tt.time_slot_id = ts.id
            JOIN subjects s ON tt.subject_id = s.id
            WHERE tt.teacher_id = ? AND tt.school_id = ?
            AND tt.day_of_week = DAYNAME(CURDATE())
            ORDER BY ts.start_time
        `, [teacher.id, schoolId]);

        // 3. Get Total Students (from assigned classes via timetable, school-specific)
        const [studentCount] = await db.query(`
            SELECT COUNT(DISTINCT s.id) as total
            FROM students s
            JOIN (
                SELECT DISTINCT class_number, section FROM timetable 
                WHERE teacher_id = ? AND school_id = ?
            ) tc ON s.class = tc.class_number AND s.section = tc.section
            WHERE s.school_id = ?
        `, [teacher.id, schoolId, schoolId]);

        // 4. Get Attendance Rate (Last 30 days, school-specific)
        const [attendanceStats] = await db.query(`
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
            FROM students_attendance
            WHERE marked_by = ? AND school_id = ?
            AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `, [teacher.id, schoolId]);

        const attendanceRate = attendanceStats[0].total_records > 0
            ? (attendanceStats[0].present_count / attendanceStats[0].total_records) * 100
            : 0;

        // 5. Get Pending Requisitions (school-specific)
        const [requisitionStats] = await db.query(`
            SELECT count(*) as count FROM teachers_requisition 
            WHERE teacher_id = ? AND status = 'Pending' AND school_id = ?
        `, [teacher.id, schoolId]);

        const [pendingRequisitions] = await db.query(`
            SELECT * FROM teachers_requisition 
            WHERE teacher_id = ? AND status = 'Pending' AND school_id = ?
            ORDER BY submitted_date DESC LIMIT 5
        `, [teacher.id, schoolId]);

        // 6. Get Pending Grievances (school-specific)
        const [grievanceStats] = await db.query(`
            SELECT count(*) as count FROM teacher_grievance 
            WHERE teacher_id = ? AND status = 'Pending' AND school_id = ?
        `, [teacher.id, schoolId]);

        const [pendingGrievances] = await db.query(`
            SELECT * FROM teacher_grievance 
            WHERE teacher_id = ? AND status = 'Pending' AND school_id = ?
            ORDER BY submitted_date DESC LIMIT 5
        `, [teacher.id, schoolId]);

        res.json({
            success: true,
            teacherName: teacher.name,
            stats: {
                classesToday: schedule.length,
                totalStudents: studentCount[0].total || 0,
                attendanceRate: Math.round(attendanceRate),
                pendingRequisitions: requisitionStats[0].count || 0,
                pendingGrievances: grievanceStats[0].count || 0
            },
            schedule: schedule.map(s => ({
                time: `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`,
                class: `${s.class_number}-${s.section}`,
                subject: s.subject,
                room: s.room_number || 'N/A'
            })),
            pendingRequisitions: pendingRequisitions.map(r => ({
                id: r.id,
                item: r.item,
                description: r.description,
                quantity: r.quantity,
                urgency: r.urgency,
                status: r.status,
                submittedDate: new Date(r.submitted_date).toLocaleDateString()
            })),
            pendingGrievances: pendingGrievances.map(g => ({
                id: g.id,
                subject: g.subject,
                category: g.category,
                description: g.description,
                priority: g.priority,
                status: g.status,
                submittedDate: new Date(g.submitted_date).toLocaleDateString()
            }))
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/teacher/timetable
// @desc    Get teacher's personal timetable
// @access  Private (Teacher)
router.get('/timetable', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get teacher ID and Name (school-specific)
        const [teachers] = await db.query(
            `SELECT id, employee_id, name 
             FROM teachers 
             WHERE user_id = ? AND school_id = ?`,
            [req.user.id, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const teacher = teachers[0];

        // 2. Get all time slots
        const [timeSlots] = await db.query(
            'SELECT * FROM time_slots ORDER BY start_time'
        );

        // 3. Get timetable entries for this teacher (school-specific)
        const [timetable] = await db.query(
            `SELECT 
                tt.id,
                tt.class_number,
                tt.section,
                tt.day_of_week,
                tt.time_slot_id,
                tt.room_number,
                tt.is_elective,
                tt.merge_group_id,
                ts.slot_name,
                ts.start_time,
                ts.end_time,
                ts.is_break,
                s.name as subject_name,
                s.code as subject_code
            FROM timetable tt
            JOIN time_slots ts ON tt.time_slot_id = ts.id
            JOIN subjects s ON tt.subject_id = s.id
            WHERE tt.teacher_id = ? AND tt.school_id = ?
            ORDER BY ts.start_time`,
            [teacher.id, schoolId]
        );

        res.json({
            success: true,
            timetable,
            timeSlots,
            teacher: {
                employeeId: teacher.employee_id,
                name: teacher.name
            }
        });

    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== ASSIGNMENTS ROUTES ====================

// @route   POST /api/teacher/assignments
// @desc    Create a new assignment
// @access  Private (Teacher)
router.post('/assignments', teacherUpload.single('file'), async (req, res) => {
    try {
        const { classNumber, section, subject_id, title, description, due_date } = req.body;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const filePath = req.file ? `/upload/assignments/${req.file.filename}` : null;

        const [result] = await db.query(
            `INSERT INTO assignments (school_id, teacher_id, class, section, subject_id, title, description, file_path, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, teacherId, classNumber, section, subject_id, title, description, filePath, due_date || null]
        );

        res.status(201).json({ success: true, message: 'Assignment created', id: result.insertId });
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/assignments
// @desc    Get assignments created by teacher
// @access  Private (Teacher)
router.get('/assignments', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [assignments] = await db.query(
            `SELECT a.*, s.name as subject_name 
             FROM assignments a
             LEFT JOIN subjects s ON a.subject_id = s.id
             WHERE a.teacher_id = ? AND a.school_id = ?
             ORDER BY a.created_at DESC`,
            [teacherId, schoolId]
        );

        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/assignments/:id/submissions
// @desc    Get submissions for an assignment
// @access  Private (Teacher)
router.get('/assignments/:id/submissions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const assignmentId = req.params.id;

        const [submissions] = await db.query(
            `SELECT sub.*, st.student_name, st.roll_no 
             FROM assignment_submissions sub
             JOIN students st ON sub.student_id = st.id
             WHERE sub.assignment_id = ? AND sub.school_id = ?
             ORDER BY sub.submitted_at DESC`,
            [assignmentId, schoolId]
        );

        res.json({ success: true, submissions });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== CLASS NOTES ROUTES ====================

// @route   POST /api/teacher/class-notes
// @desc    Upload class notes
// @access  Private (Teacher)
router.post('/class-notes', teacherUpload.single('file'), async (req, res) => {
    try {
        const { classNumber, section, subject_id, title, description } = req.body;
        const schoolId = req.user.school_id;

        if (!req.file) return res.status(400).json({ message: 'File is required' });

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const filePath = `/upload/class_notes/${req.file.filename}`;

        const [result] = await db.query(
            `INSERT INTO class_notes (school_id, teacher_id, class, section, subject_id, title, description, file_path)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, teacherId, classNumber, section, subject_id, title, description, filePath]
        );

        res.status(201).json({ success: true, message: 'Class note uploaded', id: result.insertId });
    } catch (error) {
        console.error('Upload note error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/class-notes
// @desc    Get class notes uploaded by teacher
// @access  Private (Teacher)
router.get('/class-notes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [notes] = await db.query(
            `SELECT n.*, s.name as subject_name 
             FROM class_notes n
             LEFT JOIN subjects s ON n.subject_id = s.id
             WHERE n.teacher_id = ? AND n.school_id = ?
             ORDER BY n.created_at DESC`,
            [teacherId, schoolId]
        );

        res.json({ success: true, notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/teacher/assignments/:id
// @desc    Update an assignment
// @access  Private (Teacher)
router.put('/assignments/:id', teacherUpload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { classNumber, section, subject_id, title, description, due_date } = req.body;
        const schoolId = req.user.school_id;

        // Get teacher id
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        // Check ownership
        const [existing] = await db.query(
            'SELECT id, file_path FROM assignments WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [id, teacherId, schoolId]
        );

        if (existing.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        let filePath = existing[0].file_path;
        if (req.file) {
            // Delete old file if exists
            if (filePath && fs.existsSync(path.join(__dirname, '..', filePath))) {
                fs.unlinkSync(path.join(__dirname, '..', filePath));
            }
            filePath = `/upload/assignments/${req.file.filename}`;
        }

        await db.query(
            `UPDATE assignments 
             SET class = ?, section = ?, subject_id = ?, title = ?, description = ?, due_date = ?, file_path = ?
             WHERE id = ?`,
            [classNumber, section, subject_id, title, description, due_date, filePath, id]
        );

        res.json({ success: true, message: 'Assignment updated successfully' });
    } catch (error) {
        console.error('Update assignment error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/teacher/assignments/:id
// @desc    Delete an assignment
// @access  Private (Teacher)
router.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.school_id;

        // Get teacher id
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [existing] = await db.query(
            'SELECT id, file_path FROM assignments WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [id, teacherId, schoolId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Delete file
        if (existing[0].file_path) {
            const filePath = path.join(__dirname, '..', existing[0].file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM assignments WHERE id = ?', [id]);

        res.json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/teacher/class-notes/:id
// @desc    Update a class note
// @access  Private (Teacher)
router.put('/class-notes/:id', teacherUpload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { classNumber, section, subject_id, title, description } = req.body;
        const schoolId = req.user.school_id;

        // Get teacher id
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [existing] = await db.query(
            'SELECT id, file_path FROM class_notes WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [id, teacherId, schoolId]
        );

        if (existing.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        let filePath = existing[0].file_path;
        if (req.file) {
            if (filePath && fs.existsSync(path.join(__dirname, '..', filePath))) {
                fs.unlinkSync(path.join(__dirname, '..', filePath));
            }
            filePath = `/upload/class_notes/${req.file.filename}`;
        }

        await db.query(
            `UPDATE class_notes 
             SET class = ?, section = ?, subject_id = ?, title = ?, description = ?, file_path = ?
             WHERE id = ?`,
            [classNumber, section, subject_id, title, description, filePath, id]
        );

        res.json({ success: true, message: 'Note updated successfully' });
    } catch (error) {
        console.error('Update note error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/teacher/class-notes/:id
// @desc    Delete a class note
// @access  Private (Teacher)
router.delete('/class-notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.school_id;

        // Get teacher id
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [existing] = await db.query(
            'SELECT id, file_path FROM class_notes WHERE id = ? AND teacher_id = ? AND school_id = ?',
            [id, teacherId, schoolId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        if (existing[0].file_path) {
            const filePath = path.join(__dirname, '..', existing[0].file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM class_notes WHERE id = ?', [id]);

        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/teacher/holidays
// @desc    Get holiday list
// @access  Private (Teacher)
router.get('/holidays', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [holidays] = await db.query(
            `SELECT * FROM holidays WHERE school_id = ? ORDER BY start_date ASC`,
            [schoolId]
        );

        const [weeklySchedule] = await db.query(
            `SELECT * FROM school_weekly_schedule WHERE school_id = ?`,
            [schoolId]
        );

        res.json({ success: true, holidays, weekly_schedule: weeklySchedule });
    } catch (error) {
        console.error('Get holidays error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==================== LEAVE MANAGEMENT ROUTES ====================

// @route   POST /api/teacher/leaves
// @desc    Apply for leave
// @access  Private (Teacher)
router.post('/leaves', roleMiddleware('teacher'), async (req, res) => {
    try {
        const { start_date, end_date, reason } = req.body;
        const schoolId = req.user.school_id;
        const userId = req.user.id;

        // Get teacher ID
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [userId, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        await db.query(
            `INSERT INTO teacher_leaves (teacher_id, school_id, start_date, end_date, reason)
             VALUES (?, ?, ?, ?, ?)`,
            [teacherId, schoolId, start_date, end_date, reason]
        );

        res.json({ success: true, message: 'Leave application submitted' });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/leaves
// @desc    Get my leave history
// @access  Private (Teacher)
router.get('/leaves', roleMiddleware('teacher'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const userId = req.user.id;

        // Get teacher ID
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [userId, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [leaves] = await db.query(
            `SELECT * FROM teacher_leaves WHERE teacher_id = ? ORDER BY created_at DESC`,
            [teacherId]
        );

        res.json({ success: true, leaves });
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/payslips
// @desc    Get payslips for logged-in teacher
// @access  Private (Teacher)
router.get('/payslips', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        // Get teacher id from user id
        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [userId, schoolId]);
        if (teacher.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher record not found' });
        }

        const teacherId = teacher[0].id;

        const [payslips] = await db.query(
            `SELECT * FROM teacher_payslips WHERE teacher_id = ? AND school_id = ? ORDER BY year DESC, month DESC`,
            [teacherId, schoolId]
        );

        res.json({ success: true, payslips });
    } catch (error) {
        console.error('Get teacher payslips error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/settings/location
// @desc    Get school location settings for verification
// @access  Private (Teacher)
router.get('/settings/location', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [schoolRows] = await db.query(
            `SELECT latitude as school_latitude, longitude as school_longitude, attendance_radius_meters as attendance_radius FROM schools WHERE id = ?`,
            [schoolId]
        );

        if (schoolRows.length === 0) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        const settings = schoolRows[0];
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Get location settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/teacher/self-attendance
// @desc    Teacher Check-in / Check-out with location
// @access  Private (Teacher)
router.post('/self-attendance', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;
        const { type, latitude, longitude } = req.body; // type: 'check_in' or 'check_out'

        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [userId, schoolId]);
        if (teacher.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const teacherId = teacher[0].id;
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const time = now.toLocaleTimeString('en-US', { hour12: false });

        if (type === 'check_in') {
            await db.query(
                `INSERT INTO teacher_attendance 
                (school_id, teacher_id, date, status, check_in_time, location_verified, latitude, longitude)
                VALUES (?, ?, ?, 'Present', ?, TRUE, ?, ?)
                ON DUPLICATE KEY UPDATE check_in_time = ?, location_verified = TRUE`,
                [schoolId, teacherId, date, time, latitude, longitude, time]
            );
        } else if (type === 'check_out') {
            // Get settings for thresholds from schools table
            const [schoolSettings] = await db.query(
                `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
                [schoolId]
            );
            const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
            const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

            // Get Check-in time
            const [record] = await db.query(
                `SELECT check_in_time FROM teacher_attendance WHERE school_id = ? AND teacher_id = ? AND date = ?`,
                [schoolId, teacherId, date]
            );

            let status = 'Present';
            if (record.length > 0 && record[0].check_in_time) {
                // Parse times manually to avoid timezone issues with Date object combined with 1970 date
                const [h1, m1, s1] = record[0].check_in_time.split(':').map(Number);
                const [h2, m2, s2] = time.split(':').map(Number);

                const startTotalMinutes = (h1 * 60) + m1;
                const endTotalMinutes = (h2 * 60) + m2;
                let diffMinutes = endTotalMinutes - startTotalMinutes;
                if (diffMinutes < 0) diffMinutes += 1440; // overnight

                const diffHours = diffMinutes / 60;

                if (diffHours >= minFull) status = 'Present';
                else if (diffHours >= minHalf) status = 'Half Day';
                else status = 'Present'; // Keep as "Present" for short duration as per user request
            }

            await db.query(
                `UPDATE teacher_attendance 
                 SET check_out_time = ?, status = ?
                 WHERE school_id = ? AND teacher_id = ? AND date = ?`,
                [time, status, schoolId, teacherId, date]
            );
        }

        res.json({ success: true, message: `Successfully ${type === 'check_in' ? 'checked in' : 'checked out'}` });
    } catch (error) {
        console.error('Self attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/self-attendance/today
// @desc    Get today's attendance status
// @access  Private (Teacher)
router.get('/self-attendance/today', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [userId, schoolId]);
        if (teacher.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const teacherId = teacher[0].id;
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const [attendance] = await db.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, status, check_in_time, check_out_time, location_verified, latitude, longitude FROM teacher_attendance WHERE school_id = ? AND teacher_id = ? AND date = ?`,
            [schoolId, teacherId, date]
        );

        res.json({ success: true, attendance: attendance[0] || null });
    } catch (error) {
        console.error('Get self attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/self-attendance/monthly
// @desc    Get monthly attendance status
// @access  Private (Teacher)
router.get('/self-attendance/monthly', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;
        const { month } = req.query; // format YYYY-MM

        if (!month) return res.status(400).json({ success: false, message: 'Month is required' });

        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [userId, schoolId]);
        if (teacher.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const teacherId = teacher[0].id;

        const [records] = await db.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, status, check_in_time, check_out_time 
             FROM teacher_attendance 
             WHERE school_id = ? AND teacher_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
            [schoolId, teacherId, month]
        );

        res.json({ success: true, records });
    } catch (error) {
        console.error('Get monthly attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// STORE PURCHASES (Teacher View)
// ==========================================

// @route   GET /api/teacher/store-purchases
// @desc    Get all store bills for the logged-in teacher
router.get('/store-purchases', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [bills] = await db.query(
            `SELECT sb.*, s.name as store_name, s.icon as store_icon
             FROM store_bills sb
             JOIN stores s ON sb.store_id = s.id
             WHERE sb.student_id = ? AND sb.buyer_type = 'teacher' AND sb.school_id = ?
             ORDER BY sb.created_at DESC`,
            [teacherId, schoolId]
        );

        const parsedBills = bills.map(b => ({
            ...b,
            items: JSON.parse(b.items_json || '[]')
        }));

        const totalSpent = bills.reduce((a, b) => a + parseFloat(b.subtotal), 0);
        const pendingAmount = bills.filter(b => b.payment_status === 'pending').reduce((a, b) => a + parseFloat(b.subtotal), 0);
        const paidAmount = bills.filter(b => b.payment_status === 'paid').reduce((a, b) => a + parseFloat(b.subtotal), 0);

        res.json({
            success: true,
            bills: parsedBills,
            summary: {
                totalBills: bills.length,
                totalSpent: totalSpent.toFixed(2),
                pendingAmount: pendingAmount.toFixed(2),
                paidAmount: paidAmount.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Teacher store purchases error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/store-bills/:billNumber
// @desc    Get a specific store bill for the teacher
router.get('/store-bills/:billNumber', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [bills] = await db.query(
            `SELECT sb.*, s.name as store_name, s.slug as store_slug, s.icon as store_icon,
                    sch.school_name, sch.address as school_address, sch.phone as school_phone
             FROM store_bills sb
             JOIN stores s ON sb.store_id = s.id
             LEFT JOIN schools sch ON sb.school_id = sch.id
             WHERE sb.bill_number = ? AND sb.student_id = ? AND sb.buyer_type = 'teacher' AND sb.school_id = ?`,
            [req.params.billNumber, teacherId, schoolId]
        );

        if (bills.length === 0) return res.status(404).json({ success: false, message: 'Bill not found' });
        const bill = bills[0];
        bill.items = JSON.parse(bill.items_json || '[]');
        res.json({ success: true, bill });
    } catch (error) {
        console.error('Teacher store bill error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/classes
// @desc    Get all classes
router.get('/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const teacherId = req.user.id;

        // Get teacher's allowed classes
        const [teacherRows] = await db.query(
            'SELECT managed_classes FROM teachers WHERE user_id = ? AND school_id = ?',
            [teacherId, schoolId]
        );
        
        let managedClasses = teacherRows[0]?.managed_classes;
        if (typeof managedClasses === 'string') {
            try {
                managedClasses = JSON.parse(managedClasses);
            } catch (e) {
                managedClasses = [];
            }
        }

        const allClasses = !managedClasses || managedClasses.includes('all');
        const allowedClassList = Array.isArray(managedClasses) ? managedClasses : [];

        let query = 'SELECT * FROM classes WHERE school_id = ?';
        const params = [schoolId];

        if (!allClasses) {
            query += ' AND class_number IN (?)';
            params.push(allowedClassList.length > 0 ? allowedClassList : ['NONE']);
        }

        query += ' ORDER BY class_number ASC';

        const [classes] = await db.query(query, params);
        res.json({ success: true, classes });
    } catch (error) {
        console.error('Teacher Get classes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/class-streams/:id
// @desc    Get streams for a specific class (filtered by teacher permissions)
router.get('/class-streams/:id', studentPermissionMiddleware, async (req, res) => {
    try {
        const classId = req.params.id;
        const schoolId = req.user.school_id;
        const query = `
            SELECT DISTINCT st.id, st.name 
            FROM class_sections cs
            JOIN streams st ON cs.stream_id = st.id
            WHERE cs.school_id = ? AND cs.class_id = ?
            ORDER BY st.name
        `;
        const [streams] = await db.query(query, [schoolId, classId]);

        // Filter by teacher's allowed streams
        const { allowedStreams } = req.teacherPermissions;
        let filteredStreams = streams;
        if (allowedStreams && allowedStreams.length > 0) {
            filteredStreams = streams.filter(s => 
                allowedStreams.includes(String(s.id)) || allowedStreams.includes(s.id)
            );
        }

        res.json({ success: true, streams: filteredStreams });
    } catch (error) {
        console.error('Teacher Get class streams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/class-sections/:classId
// @desc    Get sections for a specific class
router.get('/class-sections/:classId', async (req, res) => {
    try {
        const classId = req.params.classId;
        const streamId = req.query.stream_id;
        const schoolId = req.user.school_id;

        let query = `
            SELECT s.id, s.name, s.code 
            FROM class_sections cs
            JOIN sections s ON cs.section_id = s.id
            WHERE cs.school_id = ? AND cs.class_id = ?
        `;
        const params = [schoolId, classId];
        if (streamId) {
            query += ' AND cs.stream_id = ?';
            params.push(streamId);
        }
        query += ' ORDER BY s.name';

        const [sections] = await db.query(query, params);
        res.json({ success: true, sections });
    } catch (error) {
        console.error('Teacher Get sections error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== STUDENT MANAGEMENT FOR AUTHORIZED TEACHERS ====================

// @route   GET /api/teacher/manage-students
// @desc    Get all students (Authorized Teachers only)
router.get('/manage-students', studentPermissionMiddleware, async (req, res) => {
    try {
        const { class: studentClass, section } = req.query;
        const schoolId = req.user.school_id;

        let query = `
            SELECT 
                s.*, 
                u.name, 
                u.email, 
                u.phone, 
                u.status as user_status,
                st.name as stream_name
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            LEFT JOIN streams st ON s.stream_id = st.id
            WHERE s.school_id = ?
        `;
        const params = [schoolId];

        // Apply granular class permissions
        const { allClasses, allowedClasses } = req.teacherPermissions;
        if (!allClasses) {
            if (allowedClasses.length > 0) {
                query += ' AND s.class IN (?)';
                params.push(allowedClasses);
            } else {
                query += ' AND 1=0'; // No classes allowed, return nothing
            }
        }

        if (studentClass) {
            query += ' AND s.class = ?';
            params.push(studentClass);
        }

        // Apply stream filtering if not all classes
        if (!allClasses && (studentClass === '11' || studentClass === '12')) {
            if (req.teacherPermissions.allowedStreams.length > 0) {
                query += ' AND s.stream_id IN (?)';
                params.push(req.teacherPermissions.allowedStreams);
            }
        }
        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }

        if (studentClass || section) {
            query += ' ORDER BY CAST(s.class AS UNSIGNED) ASC, s.section ASC, CAST(s.roll_no AS UNSIGNED) ASC, u.name ASC';
        } else {
            query += ' ORDER BY s.created_at DESC';
        }

        const [students] = await db.query(query, params);

        res.json({
            success: true,
            students
        });
    } catch (error) {
        console.error('Teacher Get students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/teacher/manage-students
// @desc    Create new student (Authorized Teachers only)
router.post('/manage-students', studentPermissionMiddleware, async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            name, email, phone, class: studentClass, section, rollNo,
            fatherName, motherName, fatherPhone, motherPhone, father_phone, mother_phone, address,
            dateOfBirth, gender, bloodGroup, medicalConditions, stream_id,
            student_unique_id
        } = req.body;

        if (!name || !studentClass || !section || !rollNo) {
            return res.status(400).json({ success: false, message: 'Please provide Name, Class and Section' });
        }

        // Check if teacher is allowed to add student to this class and stream
        const { allClasses, allowedClasses, allowedStreams } = req.teacherPermissions;
        if (!allClasses) {
            const isAuthorizedClass = allowedClasses.includes(String(studentClass));
            if (!isAuthorizedClass) {
                return res.status(403).json({ success: false, message: `Not authorized for Class ${studentClass}` });
            }
            
            // If Class 11/12, check stream
            if ((String(studentClass) === '11' || String(studentClass) === '12') && allowedStreams.length > 0) {
                if (!allowedStreams.includes(Number(stream_id))) {
                    return res.status(403).json({ success: false, message: 'You are not authorized to manage students in this Stream/Group' });
                }
            }
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            if (email) {
                const [existingUser] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND school_id = ?',
                    [email, schoolId]
                );
                if (existingUser.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: 'Email already registered' });
                }
            }

            let plainPassword = 'password123';
            if (dateOfBirth) {
                const dob = new Date(dateOfBirth);
                const day = String(dob.getDate()).padStart(2, '0');
                const month = String(dob.getMonth() + 1).padStart(2, '0');
                const year = dob.getFullYear();
                plainPassword = `${day}${month}${year}`;
            } else if (phone) { 
                plainPassword = phone;
            }
            
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            let uniqueId = student_unique_id;
            if (!uniqueId) {
                uniqueId = await generateStudentUniqueId(schoolId, connection);
            }

            const [userResult] = await connection.query(
                `INSERT INTO users (email, password, role, name, phone, status, school_id, student_unique_id)
                 VALUES (?, ?, 'student', ?, ?, 'active', ?, ?)`,
                [email || null, hashedPassword, name, phone, schoolId, uniqueId]
            );

            const userId = userResult.insertId;

            const [existingRoll] = await connection.query(
                'SELECT id FROM students WHERE roll_no = ? AND class = ? AND section = ? AND school_id = ?',
                [rollNo, studentClass, section, schoolId]
            );

            if (existingRoll.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ success: false, message: 'Roll Number already exists in this class and section' });
            }

            await connection.query(
                `INSERT INTO students 
                 (user_id, student_unique_id, student_name, email, phone, roll_no, class, section, stream_id, father_name, mother_name, father_phone, mother_phone, address, date_of_birth, gender, blood_group, medical_conditions, admission_date, school_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
                [userId, uniqueId, name, email || null, phone || null, rollNo, studentClass, section, stream_id || null, fatherName || null, motherName || null, fatherPhone || father_phone || null, motherPhone || mother_phone || null, address || null, dateOfBirth || null, gender || null, bloodGroup || null, medicalConditions || null, schoolId, req.user.id]
            );

            await connection.commit();
            connection.release();
            res.status(201).json({ success: true, message: 'Student created successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Teacher Create student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/teacher/manage-students/:id
// @desc    Update student (Authorized Teachers only)
router.put('/manage-students/:id', studentPermissionMiddleware, async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        const {
            name, email, phone, class: studentClass, section, rollNo,
            fatherName, motherName, fatherPhone, motherPhone, father_phone, mother_phone, address,
            dateOfBirth, gender, bloodGroup, medicalConditions, stream_id,
            student_unique_id
        } = req.body;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [studentcheck] = await connection.query(
                'SELECT * FROM students WHERE id = ? AND school_id = ?',
                [studentId, schoolId]
            );

            if (studentcheck.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            const userId = studentcheck[0].user_id;

            if (rollNo) {
                const [existingRoll] = await connection.query(
                    'SELECT id FROM students WHERE roll_no = ? AND class = ? AND section = ? AND id != ? AND school_id = ?',
                    [rollNo, studentClass, section, studentId, schoolId]
                );
                if (existingRoll.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: 'Roll Number already exists in this class and section' });
                }
            }

            if (email) {
                const [existingEmail] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND id != ? AND school_id = ?',
                    [email, userId, schoolId]
                );
                if (existingEmail.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: 'Email already registered to another student' });
                }
            }

            let userUpdateSql = 'UPDATE users SET name = ?, email = ?, phone = ?';
            const queryParams = [name, email || null, phone || null];
            if (student_unique_id) {
                userUpdateSql += ', student_unique_id = ?';
                queryParams.push(student_unique_id);
            }

            if (dateOfBirth) {
                const dob = new Date(dateOfBirth);
                const day = String(dob.getDate()).padStart(2, '0');
                const month = String(dob.getMonth() + 1).padStart(2, '0');
                const year = dob.getFullYear();
                const newPassword = `${day}${month}${year}`;
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                userUpdateSql += ', password = ?';
                queryParams.push(hashedPassword);
            }

            userUpdateSql += ' WHERE id = ? AND school_id = ?';
            queryParams.push(userId, schoolId);
            await connection.query(userUpdateSql, queryParams);

            await connection.query(
                `UPDATE students 
                 SET student_name = ?, email = ?, phone = ?, roll_no = ?, class = ?, section = ?, stream_id = ?, father_name = ?, mother_name = ?, 
                     father_phone = ?, mother_phone = ?, address = ?, date_of_birth = ?, gender = ?, blood_group = ?, medical_conditions = ?
                 WHERE id = ? AND school_id = ?`,
                [name, email || null, phone || null, rollNo, studentClass, section, stream_id || null, fatherName, motherName, fatherPhone || father_phone || null, motherPhone || mother_phone || null, address, dateOfBirth, gender, bloodGroup, medicalConditions, studentId, schoolId]
            );

            await connection.commit();
            connection.release();

            const oldData = {
                student_name: studentcheck[0].student_name,
                class: studentcheck[0].class,
                section: studentcheck[0].section,
                phone: studentcheck[0].phone,
                roll_no: studentcheck[0].roll_no,
                email: studentcheck[0].email,
                father_name: studentcheck[0].father_name,
                mother_name: studentcheck[0].mother_name,
                address: studentcheck[0].address
            };

            const newData = {
                student_name: name,
                class: studentClass,
                section: section,
                phone: phone || null,
                roll_no: rollNo,
                email: email || null,
                father_name: fatherName,
                mother_name: motherName,
                address: address
            };

            logUpdate({
                schoolId,
                moduleName: 'Students',
                entityType: 'Student',
                entityId: studentId,
                entityName: name,
                oldData,
                newData,
                description: `Updated student record for ${name} (${studentClass}-${section})`,
                user: req.user,
                req
            });

            res.json({ success: true, message: 'Student updated successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Teacher Update student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/teacher/manage-students/:id
// @desc    Delete student (Authorized Teachers only)
router.delete('/manage-students/:id', studentPermissionMiddleware, async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        const [student] = await db.query('SELECT user_id FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);
        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const userId = student[0].user_id;
        await db.query('DELETE FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);
        if (userId) {
            await db.query('DELETE FROM users WHERE id = ? AND school_id = ?', [userId, schoolId]);
        }

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Teacher Delete student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/teacher/manage-students/:id/photo
router.post('/manage-students/:id/photo', studentPermissionMiddleware, uploadStudentPhoto.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const studentId = req.params.id;
        const photoPath = `/upload/student_photos/${req.file.filename}`;
        await db.query('UPDATE students SET photo_path = ? WHERE id = ? AND school_id = ?', [photoPath, studentId, req.user.school_id]);
        res.json({ success: true, message: 'Photo updated successfully', photo_path: photoPath });
    } catch (error) {
        console.error('Teacher Update student photo error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/teacher/manage-students/:id/photo
router.delete('/manage-students/:id/photo', studentPermissionMiddleware, async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        await db.query('UPDATE students SET photo_path = NULL WHERE id = ? AND school_id = ?', [studentId, schoolId]);
        res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Teacher Delete student photo error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/teacher/manage-students/:id/documents
router.post('/manage-students/:id/documents', studentPermissionMiddleware, uploadStudentDocs.fields([
    { name: 'father_photo', maxCount: 1 },
    { name: 'mother_photo', maxCount: 1 },
    { name: 'student_aadhaar', maxCount: 1 },
    { name: 'father_aadhaar', maxCount: 1 },
    { name: 'mother_aadhaar', maxCount: 1 },
    { name: 'father_pan', maxCount: 1 },
    { name: 'mother_pan', maxCount: 1 }
]), async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        const files = req.files;
        if (!files || Object.keys(files).length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });

        const updates = [];
        const params = [];
        const allowedFields = ['father_photo', 'mother_photo', 'student_aadhaar', 'father_aadhaar', 'mother_aadhaar', 'father_pan', 'mother_pan'];

        for (const field of allowedFields) {
            if (files[field]) {
                const filePath = `/upload/student_docs/${files[field][0].filename}`;
                updates.push(`${field} = ?`);
                params.push(filePath);
            }
        }

        if (updates.length > 0) {
            params.push(studentId, schoolId);
            await db.query(`UPDATE students SET ${updates.join(', ')} WHERE id = ? AND school_id = ?`, params);
            res.json({ success: true, message: 'Documents updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'No valid fields provided' });
        }
    } catch (error) {
        console.error('Teacher Update student documents error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teacher/sections
// @desc    Get all sections (Authorized Teachers only)
router.get('/sections', studentPermissionMiddleware, async (req, res) => {
    try {
        const [sections] = await db.query('SELECT * FROM sections WHERE school_id = ? ORDER BY name ASC', [req.user.school_id]);
        res.json({ success: true, sections });
    } catch (error) {
        console.error('Teacher Get sections error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});





// ========== LESSON PLANS (Teacher) ==========

// GET /api/teacher/lesson-plans?week_start=YYYY-MM-DD&class=&section=&subject_id=
router.get('/lesson-plans', async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
    if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
    const teacherId = teachers[0].id;
    const { week_start, class_number, section, subject_id } = req.query;

    let query = `
      SELECT lp.*, s.name as subject_name, t.name as teacher_name
      FROM lesson_plans lp
      JOIN subjects s ON lp.subject_id = s.id
      JOIN teachers t ON lp.teacher_id = t.id
      WHERE lp.school_id = ? AND lp.teacher_id = ?
    `;
    const params = [schoolId, teacherId];

    if (week_start) {
      query += ' AND lp.week_start_date = ?';
      params.push(week_start);
    }
    if (class_number) {
      query += ' AND lp.class_number = ?';
      params.push(class_number);
    }
    if (section) {
      query += ' AND lp.section = ?';
      params.push(section);
    }
    if (subject_id) {
      query += ' AND lp.subject_id = ?';
      params.push(subject_id);
    }

    query += ' ORDER BY lp.week_start_date DESC, lp.class_number, lp.section, s.name';

    const [plans] = await db.query(query, params);
    res.json({ success: true, lessonPlans: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/lesson-plans
router.post('/lesson-plans', async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { class_number, section, subject_id, week_start_date, week_end_date, scheduled_date, topic, sub_topics, description, completion_percentage, completion_date, notes } = req.body;
    const finalEndDate = week_end_date || scheduled_date || null;

    if (!class_number || !section || !subject_id || !week_start_date || !topic) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
    if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
    const teacherId = teachers[0].id;

    const [result] = await db.query(
      `INSERT INTO lesson_plans 
        (school_id, teacher_id, class_number, section, subject_id, week_start_date, scheduled_date, topic, sub_topics, description, completion_percentage, completion_date, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [schoolId, teacherId, class_number, section, subject_id, week_start_date, finalEndDate, topic, sub_topics ? JSON.stringify(sub_topics) : null, description || null, completion_percentage || 0, completion_date || null, notes || null, 
       completion_percentage >= 100 ? 'completed' : (completion_percentage > 0 ? 'in_progress' : 'pending')]
    );

    res.json({ success: true, message: 'Lesson plan added', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/teacher/lesson-plans/:id
router.put('/lesson-plans/:id', async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const planId = req.params.id;
    const { week_start_date, week_end_date, scheduled_date, topic, sub_topics, description, completion_percentage, completion_date, notes } = req.body;
    const finalEndDate = week_end_date || scheduled_date || null;

    let status = 'pending';
    if (completion_percentage >= 100) status = 'completed';
    else if (completion_percentage > 0) status = 'in_progress';

    await db.query(
      `UPDATE lesson_plans SET 
        week_start_date = ?, scheduled_date = ?, topic = ?, sub_topics = ?, description = ?, completion_percentage = ?, completion_date = ?, notes = ?, status = ?
       WHERE id = ? AND school_id = ?`,
      [week_start_date, finalEndDate, topic, sub_topics ? JSON.stringify(sub_topics) : null, description, completion_percentage, completion_date || null, notes, status, planId, schoolId]
    );

    res.json({ success: true, message: 'Lesson plan updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/teacher/lesson-plans/:id
router.delete('/lesson-plans/:id', async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const planId = req.params.id;

    await db.query(
      'DELETE FROM lesson_plans WHERE id = ? AND school_id = ?',
      [planId, schoolId]
    );

    res.json({ success: true, message: 'Lesson plan deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== SYLLABUS MANAGEMENT ROUTES ====================
const syllabusDir = path.join(__dirname, '..', 'upload', 'syllabus');
if (!fs.existsSync(syllabusDir)) fs.mkdirSync(syllabusDir, { recursive: true });

const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, syllabusDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `syllabus-${req.body.class}-${req.body.subject_id}-${uniqueSuffix}${ext}`);
    }
});

const uploadSyllabus = multer({
    storage: syllabusStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/syllabus-classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [classes] = await db.query(
            `SELECT DISTINCT c.* 
             FROM timetable tt 
             JOIN classes c ON tt.class_number = c.class_number AND c.school_id = ?
             WHERE tt.teacher_id = ? AND tt.school_id = ? 
             ORDER BY c.name`,
            [schoolId, teacherId, schoolId]
        );
        res.json({ success: true, classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/syllabus-subjects/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId } = req.params;
        const streamId = req.query.stream_id;

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        // Get class number for filtering timetable
        const [classRows] = await db.query('SELECT class_number FROM classes WHERE id = ?', [classId]);
        if (classRows.length === 0) return res.status(404).json({ success: false, message: 'Class not found' });
        const classNumber = classRows[0].class_number;

        let query = `SELECT DISTINCT s.id as subject_id, s.name as subject_name, s.code as subject_code 
                     FROM timetable tt 
                     JOIN subjects s ON tt.subject_id = s.id 
                     WHERE tt.class_number = ? AND tt.teacher_id = ? AND tt.school_id = ?`;
        const params = [classNumber, teacherId, schoolId];

        if (streamId && streamId !== 'null' && streamId !== 'undefined') {
            query += ' AND tt.stream_id = ?';
            params.push(streamId);
        }

        const [subjects] = await db.query(query, params);
        res.json({ success: true, subjects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/syllabus-streams/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [classRows] = await db.query('SELECT class_number FROM classes WHERE id = ?', [classId]);
        if (classRows.length === 0) return res.status(404).json({ success: false, message: 'Class not found' });
        const classNumber = classRows[0].class_number;

        const [streams] = await db.query(
            `SELECT DISTINCT st.* FROM timetable tt 
             JOIN streams st ON tt.stream_id = st.id 
             WHERE tt.class_number = ? AND tt.teacher_id = ? AND tt.school_id = ?`,
            [classNumber, teacherId, schoolId]
        );
        res.json({ success: true, streams });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/syllabus', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [syllabus] = await db.query(
            `SELECT DISTINCT s.*, sub.name as subject_name, sub.code as subject_code, u.name as uploader_name, u.role as uploader_role,
             IF(s.uploaded_by = ?, 1, 0) as can_delete
             FROM syllabus s 
             JOIN subjects sub ON s.subject_id = sub.id 
             LEFT JOIN users u ON s.uploaded_by = u.id
             JOIN timetable tt ON s.class COLLATE utf8mb4_unicode_ci = tt.class_number COLLATE utf8mb4_unicode_ci 
                             AND s.subject_id = tt.subject_id
                             AND tt.teacher_id = ? AND tt.school_id = ?
             WHERE s.school_id = ? 
             ORDER BY s.created_at DESC`,
            [req.user.id, teacherId, schoolId, schoolId]
        );
        res.json({ success: true, syllabus });
    } catch (error) {
        console.error('Syllabus GET error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/syllabus/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId: classNumber } = req.params;

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [syllabus] = await db.query(
            `SELECT DISTINCT s.*, sub.name as subject_name, sub.code as subject_code, u.name as uploader_name, u.role as uploader_role,
             IF(s.uploaded_by = ?, 1, 0) as can_delete
             FROM syllabus s 
             JOIN subjects sub ON s.subject_id = sub.id 
             LEFT JOIN users u ON s.uploaded_by = u.id
             JOIN timetable tt ON s.class COLLATE utf8mb4_unicode_ci = tt.class_number COLLATE utf8mb4_unicode_ci 
                             AND s.subject_id = tt.subject_id
                             AND tt.teacher_id = ? AND tt.school_id = ?
             WHERE s.school_id = ? 
             AND s.class COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci 
             ORDER BY s.created_at DESC`,
            [req.user.id, teacherId, schoolId, schoolId, classNumber]
        );
        res.json({ success: true, syllabus });
    } catch (error) {
        console.error('Syllabus filtered GET error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/syllabus', uploadSyllabus.single('file'), async (req, res) => {
    try {
        const { class: className, subject_id, title, content } = req.body;
        const schoolId = req.user.school_id;
        const uploadedBy = req.user.id;
        
        if (!req.file && (!content || content.trim() === '')) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file or provide syllabus content text' });
        }
        
        if (!className || !subject_id || !title) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const teacherId = teachers[0].id;

        // Verify that class & subject is assigned to teacher
        const [timetableCheck] = await db.query(
            `SELECT id FROM timetable 
             WHERE class_number = ? AND subject_id = ? AND teacher_id = ? AND school_id = ?`,
            [className, subject_id, teacherId, schoolId]
        );

        if (timetableCheck.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ success: false, message: 'You are not assigned to teach this class and subject.' });
        }
        
        const filePath = req.file ? `/upload/syllabus/${req.file.filename}` : null;
        const textContent = content && content.trim() !== '' ? content : null;
        
        await db.query(
            'INSERT INTO syllabus (school_id, class, subject_id, title, file_path, content, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [schoolId, className, subject_id, title, filePath, textContent, uploadedBy]
        );
        res.status(201).json({ success: true, message: 'Syllabus added successfully', filePath });
    } catch (error) {
        console.error(error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/syllabus/:id', uploadSyllabus.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { class: className, subject_id, title, content } = req.body;
        const schoolId = req.user.school_id;

        // Verify authorization
        const [rows] = await db.query('SELECT file_path, uploaded_by FROM syllabus WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (rows.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Syllabus not found' });
        }
        
        if (!className || !subject_id || !title) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (teachers.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const teacherId = teachers[0].id;

        // Verify that class & subject is assigned to teacher
        const [timetableCheck] = await db.query(
            `SELECT id FROM timetable 
             WHERE class_number = ? AND subject_id = ? AND teacher_id = ? AND school_id = ?`,
            [className, subject_id, teacherId, schoolId]
        );

        if (timetableCheck.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ success: false, message: 'You are not assigned to teach this class and subject.' });
        }
        
        let newFilePath = rows[0].file_path;
        if (req.file) {
            newFilePath = `/upload/syllabus/${req.file.filename}`;
            // Optional: delete old file
            if (rows[0].file_path && fs.existsSync(path.join(__dirname, '..', rows[0].file_path))) {
                fs.unlinkSync(path.join(__dirname, '..', rows[0].file_path));
            }
        } else if (req.body.remove_file === 'true') {
            newFilePath = null;
            if (rows[0].file_path && fs.existsSync(path.join(__dirname, '..', rows[0].file_path))) {
                fs.unlinkSync(path.join(__dirname, '..', rows[0].file_path));
            }
        }
        
        const textContent = content && content.trim() !== '' ? content : null;
        
        // If they clear the text and there's no file, that's an error
        if (!newFilePath && !textContent) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Syllabus must have either a PDF or text content' });
        }

        await db.query(
            'UPDATE syllabus SET class = ?, subject_id = ?, title = ?, file_path = ?, content = ? WHERE id = ?',
            [className, subject_id, title, newFilePath, textContent, id]
        );
        res.json({ success: true, message: 'Syllabus updated successfully' });
    } catch (error) {
        console.error(error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/syllabus/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const [rows] = await db.query('SELECT file_path, uploaded_by FROM syllabus WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Syllabus not found' });
        
        const filePath = path.join(__dirname, '..', rows[0].file_path);
        await db.query('DELETE FROM syllabus WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Syllabus deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;