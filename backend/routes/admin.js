const express = require('express');
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { generateStudentUniqueId } = require('../utils/idGenerator');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { logActivity, logUpdate, logCreate, logDelete, logAction } = require('../utils/activityLogger');

// ==================== MULTER CONFIG FOR STUDENT PHOTOS ====================
const studentPhotoDir = path.join(__dirname, '..', 'upload', 'student_photos');

// Ensure directory exists
if (!fs.existsSync(studentPhotoDir)) {
    fs.mkdirSync(studentPhotoDir, { recursive: true });
}

const studentPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, studentPhotoDir);
    },
    filename: (req, file, cb) => {
        const schoolId = req.user ? req.user.school_id : 'school';
        const studentId = req.params.id || 'id'; // This is the database ID NO
        const ext = path.extname(file.originalname);
        const serialNumber = Date.now();

        if (studentId !== 'id') {
            db.query('SELECT student_name FROM students WHERE id = ?', [studentId])
                .then(([rows]) => {
                    let studentName = 'student';
                    if (rows.length > 0 && rows[0].student_name) {
                        // Sanitize student name (lowercase, replace spaces/special chars with underscores)
                        studentName = rows[0].student_name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                    }
                    cb(null, `${schoolId}-${studentId}-${studentName}-${serialNumber}${ext}`);
                })
                .catch(err => {
                    console.error('Error fetching student details for photo:', err);
                    cb(null, `${schoolId}-${studentId}-student-${serialNumber}${ext}`);
                });
        } else {
            cb(null, `${schoolId}-${studentId}-student-${serialNumber}${ext}`);
        }
    }
});

const studentPhotoFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
};

const uploadStudentPhoto = multer({
    storage: studentPhotoStorage,
    fileFilter: studentPhotoFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// ==================== MULTER CONFIG FOR STUDENT DOCUMENTS ====================
const studentDocsDir = path.join(__dirname, '..', 'upload', 'student_docs');

// Ensure directory exists
if (!fs.existsSync(studentDocsDir)) {
    fs.mkdirSync(studentDocsDir, { recursive: true });
}

const studentDocsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, studentDocsDir);
    },
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
                .catch(err => {
                    console.error('Error fetching student details for doc:', err);
                    cb(null, `${schoolId}-${studentId}-${fieldName}-student-${serialNumber}${ext}`);
                });
        } else {
            cb(null, `${schoolId}-${studentId}-${fieldName}-student-${serialNumber}${ext}`);
        }
    }
});

const uploadStudentDocs = multer({
    storage: studentDocsStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDF files are allowed.'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});


// ==================== MULTER CONFIG FOR SIGNATURE ====================
const signatureDir = path.join(__dirname, '..', 'upload', 'signature');
// Middleware to fetch and sanitize school name for filename
const fetchSchoolNameForSignature = async (req, res, next) => {
    try {
        const schoolId = req.user.school_id;
        const [rows] = await db.query('SELECT name FROM schools WHERE id = ?', [schoolId]);
        if (rows.length > 0) {
            // Sanitize: lowercase, remove non-alphanumeric, replace spaces with underscores
            req.schoolName = rows[0].name.toLowerCase()
                .replace(/[^a-z0-9 ]/g, '')
                .trim()
                .replace(/\s+/g, '_');
        } else {
            req.schoolName = 'school_' + schoolId;
        }
        next();
    } catch (error) {
        console.error('Error fetching school name for signature:', error);
        req.schoolName = 'school_' + req.user.school_id;
        next();
    }
};

if (!fs.existsSync(signatureDir)) {
    fs.mkdirSync(signatureDir, { recursive: true });
}

const signatureStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, signatureDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = req.schoolName || (req.user ? req.user.school_id : 'unknown');
        cb(null, `${name}-signature-${uniqueSuffix}${ext}`);
    }
});

const uploadSignature = multer({
    storage: signatureStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only image files are allowed.'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Increased to 5MB
});

// ==================== MULTER CONFIG FOR TEACHER PHOTOS ====================
const teacherPhotoDir = path.join(__dirname, '..', 'upload', 'teacher_photos');

// Ensure directory exists
if (!fs.existsSync(teacherPhotoDir)) {
    fs.mkdirSync(teacherPhotoDir, { recursive: true });
}

const teacherPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, teacherPhotoDir);
    },
    filename: (req, file, cb) => {
        const schoolId = req.user ? req.user.school_id : 'school';
        const teacherId = req.params.id || 'id';
        const ext = path.extname(file.originalname);
        const serialNumber = Date.now();

        if (teacherId !== 'id') {
            db.query('SELECT name, employee_id FROM teachers WHERE id = ?', [teacherId])
                .then(([rows]) => {
                    let teacherName = 'teacher';
                    let displayId = teacherId;
                    if (rows.length > 0) {
                        if (rows[0].name) {
                            // Sanitize teacher name (lowercase, replace spaces/special chars with underscores)
                            teacherName = rows[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                        }
                        if (rows[0].employee_id) {
                            displayId = rows[0].employee_id;
                        }
                    }
                    cb(null, `${schoolId}-${displayId}-${teacherName}-${serialNumber}${ext}`);
                })
                .catch(err => {
                    console.error('Error fetching teacher name for photo:', err);
                    cb(null, `${schoolId}-${teacherId}-teacher-${serialNumber}${ext}`);
                });
        } else {
            cb(null, `${schoolId}-${teacherId}-teacher-${serialNumber}${ext}`);
        }
    }
});

const teacherPhotoFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
};

const uploadTeacherPhoto = multer({
    storage: teacherPhotoStorage,
    fileFilter: teacherPhotoFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

const nonTeachingStaffPhotoDir = path.join(__dirname, '..', 'upload', 'nonteachingstaff');
if (!fs.existsSync(nonTeachingStaffPhotoDir)) {
    fs.mkdirSync(nonTeachingStaffPhotoDir, { recursive: true });
}

const nonTeachingStaffPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, nonTeachingStaffPhotoDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `nms-${uniqueSuffix}${ext}`);
    }
});

const uploadNonTeachingStaffPhoto = multer({
    storage: nonTeachingStaffPhotoStorage,
    fileFilter: teacherPhotoFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ==================== MULTER CONFIG FOR SYLLABUS ====================
const syllabusDir = path.join(__dirname, '..', 'upload', 'syllabus');

// Ensure directory exists
if (!fs.existsSync(syllabusDir)) {
    fs.mkdirSync(syllabusDir, { recursive: true });
}

const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, syllabusDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `syllabus-${req.body.class}-${req.body.subject_id}-${uniqueSuffix}${ext}`);
    }
});

const syllabusFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
    }
};

const uploadSyllabus = multer({
    storage: syllabusStorage,
    fileFilter: syllabusFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics (school-specific)
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [totalStudents] = await db.query(
            'SELECT COUNT(*) as count FROM students s JOIN users u ON s.user_id = u.id WHERE s.school_id = ?',
            [schoolId]
        );
        const [totalTeachers] = await db.query(
            'SELECT COUNT(*) as count FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.school_id = ?',
            [schoolId]
        );
        const [totalStaff] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE role IN ("accountant", "admin", "admission") AND school_id = ?',
            [schoolId]
        );
        const [pendingRequisitions] = await db.query(
            'SELECT COUNT(*) as count FROM teachers_requisition WHERE status = "Pending" AND school_id = ?',
            [schoolId]
        );
        const [activeGrievances] = await db.query(
            'SELECT COUNT(*) as count FROM teacher_grievance WHERE status IN ("Pending", "In Progress") AND school_id = ?',
            [schoolId]
        );

        res.json({
            success: true,
            stats: {
                totalStudents: totalStudents[0].count,
                totalTeachers: totalTeachers[0].count,
                totalStaff: totalStaff[0].count,
                pendingRequisitions: pendingRequisitions[0].count,
                activeGrievances: activeGrievances[0].count
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


// @route   GET /api/admin/dashboard-enhanced
// @desc    Get comprehensive admin dashboard statistics for charts & widgets
// @access  Private (Admin)
router.get('/dashboard-enhanced', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Helper to get IST date string
        const getISTDate = () => {
            const now = new Date();
            // Offset for IST (UTC+5:30)
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(now.getTime() + istOffset);
            return istDate.toISOString().split('T')[0];
        };
        const today = getISTDate();

        // ---- 1. Basic Counts (parallel) ----
        const [
            [totalStudents],
            [totalTeachers],
            [totalStaff],
            [pendingRequisitions],
            [activeGrievances],
            [totalClasses],
            [totalVehicles]
        ] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM students s JOIN users u ON s.user_id = u.id WHERE s.school_id = ?', [schoolId]),
            db.query('SELECT COUNT(*) as count FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.school_id = ?', [schoolId]),
            db.query('SELECT COUNT(*) as count FROM users WHERE role IN ("accountant","admin","admission","librarian","storemanager","security","nonteachingstaff") AND school_id = ?', [schoolId]),
            db.query('SELECT COUNT(*) as count FROM teachers_requisition WHERE status = "Pending" AND school_id = ?', [schoolId]),
            db.query('SELECT COUNT(*) as count FROM teacher_grievance WHERE status IN ("Pending","In Progress") AND school_id = ?', [schoolId]),
            db.query('SELECT COUNT(DISTINCT name) as count FROM classes WHERE school_id = ?', [schoolId]),
            db.query('SELECT COUNT(*) as count FROM vehicles WHERE school_id = ?', [schoolId]).catch(() => [[{ count: 0 }]])
        ]);

        // ---- 2. Today's Student Attendance ----
        let todayStudentAttendance = { present: 0, absent: 0, late: 0, total: totalStudents[0].count, percentage: 0 };
        try {
            const [studentAttData] = await db.query(
                `SELECT 
                    COALESCE(SUM(CASE WHEN (status IN ('present','Present')) THEN 1 ELSE 0 END), 0) as presentCount,
                    COUNT(DISTINCT student_id) as markedCount
                 FROM students_attendance 
                 WHERE school_id = ? AND date = ?`,
                [schoolId, today]
            );

            if (studentAttData[0]) {
                const total = todayStudentAttendance.total;
                const present = studentAttData[0].presentCount;
                const marked = studentAttData[0].markedCount;

                todayStudentAttendance.present = present;
                // If any students were marked today, we assume the rest are absent/not-present
                // This provides a more realistic dashboard view than just counting explicit 'absent' marks
                todayStudentAttendance.absent = total > 0 ? Math.max(0, total - present) : 0;
                todayStudentAttendance.marked = marked;
                todayStudentAttendance.percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            }
        } catch (e) { console.error('Student attendance query error:', e.message); }

        // ---- 3. Today's Teacher Attendance ----
        let todayTeacherAttendance = { present: 0, absent: 0, late: 0, total: totalTeachers[0].count, percentage: 0 };
        try {
            const [teacherAttData] = await db.query(
                `SELECT 
                    COUNT(DISTINCT CASE WHEN ta.status IN ('Present','present') THEN ta.teacher_id END) as presentCount,
                    COUNT(DISTINCT CASE WHEN ta.status = 'Late' THEN ta.teacher_id END) as lateCount,
                    COUNT(DISTINCT ta.teacher_id) as markedCount
                 FROM teacher_attendance ta
                 JOIN teachers t ON ta.teacher_id = t.id
                 JOIN users u ON t.user_id = u.id
                 WHERE ta.school_id = ? AND ta.date = ?`,
                [schoolId, today]
            );

            if (teacherAttData[0]) {
                const total = todayTeacherAttendance.total;
                const present = teacherAttData[0].presentCount;
                const late = teacherAttData[0].lateCount;

                todayTeacherAttendance.present = present;
                todayTeacherAttendance.late = late;
                // For teachers, we also use total - (present + late) if we want a complete view,
                // but usually schools want explicit marked teacher attendance.
                // To be consistent with students, we'll show remaining as absent if markedCount > 0
                todayTeacherAttendance.absent = total > 0 ? Math.max(0, total - present - late) : 0;
                todayTeacherAttendance.marked = teacherAttData[0].markedCount;
                todayTeacherAttendance.percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
            }
        } catch (e) { console.error('Teacher attendance query error:', e.message); }

        // ---- 4. Weekly Attendance Trend (last 7 days) ----
        let weeklyAttendance = [];
        try {
            const [weekData] = await db.query(
                `SELECT 
                    sa.date,
                    DATE_FORMAT(sa.date, '%a') as day_name,
                    COALESCE(SUM(CASE WHEN sa.status IN ('present','Present') THEN 1 ELSE 0 END), 0) as student_present,
                    COUNT(DISTINCT sa.student_id) as student_total
                 FROM students_attendance sa
                 WHERE sa.school_id = ? AND sa.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                 GROUP BY sa.date
                 ORDER BY sa.date ASC`,
                [schoolId]
            );

            const [weekTeacherData] = await db.query(
                `SELECT 
                    ta.date,
                    COALESCE(SUM(CASE WHEN ta.status IN ('Present','present') THEN 1 ELSE 0 END), 0) as teacher_present,
                    COUNT(*) as teacher_total
                 FROM teacher_attendance ta
                 WHERE ta.school_id = ? AND ta.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                 GROUP BY ta.date
                 ORDER BY ta.date ASC`,
                [schoolId]
            );

            // Helper to handle date mapping correctly despite ISO string shifts
            const formatDate = (dateVal) => {
                if (!(dateVal instanceof Date)) return dateVal;
                // Since mysql driver might return local midnight as UTC, we add the offset back to get correct local date
                const d = new Date(dateVal.getTime() + (5.5 * 60 * 60 * 1000));
                return d.toISOString().split('T')[0];
            };

            const studentMap = {};
            weekData.forEach(d => {
                studentMap[formatDate(d.date)] = d;
            });

            const teacherMap = {};
            weekTeacherData.forEach(d => {
                teacherMap[formatDate(d.date)] = d;
            });

            // Generate last 7 days including today in IST
            const daysToInclude = 7;
            const fullWeekAttendance = [];
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;

            for (let i = daysToInclude - 1; i >= 0; i--) {
                const d = new Date(now.getTime() + istOffset - (i * 24 * 60 * 60 * 1000));
                const dateKey = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

                const sData = studentMap[dateKey];
                const tData = teacherMap[dateKey];

                const sTotal = totalStudents[0].count;
                const tTotal = totalTeachers[0].count;
                const sPresent = sData ? (parseInt(sData.student_present) || 0) : 0;
                const tPresent = tData ? (parseInt(tData.teacher_present) || 0) : 0;

                fullWeekAttendance.push({
                    date: dateKey,
                    day: dayName,
                    studentPercent: sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 0,
                    teacherPercent: tTotal > 0 ? Math.round((tPresent / tTotal) * 100) : 0,
                    studentPresent: sPresent,
                    studentAbsent: Math.max(0, sTotal - sPresent),
                    teacherPresent: tPresent,
                    teacherAbsent: Math.max(0, tTotal - tPresent),
                    totalStudents: sTotal,
                    totalTeachers: tTotal
                });
            }

            weeklyAttendance = fullWeekAttendance;
        } catch (e) { console.error('Weekly attendance query error:', e.message); }

        // ---- 5. Fee Collection Stats ----
        let feeStats = { totalCollected: 0, totalPending: 0, monthlyCollection: 0 };
        try {
            const [feeData] = await db.query(
                `SELECT 
                    COALESCE(SUM(paid_amount), 0) as collected,
                    COALESCE(SUM(CASE WHEN status != 'paid' THEN pending_amount ELSE 0 END), 0) as pending,
                    COALESCE(SUM(CASE WHEN MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE()) THEN paid_amount ELSE 0 END), 0) as monthly
                 FROM fee_records WHERE school_id = ?`,
                [schoolId]
            );
            if (feeData[0]) {
                feeStats.totalCollected = parseFloat(feeData[0].collected);
                feeStats.totalPending = parseFloat(feeData[0].pending);
                feeStats.monthlyCollection = parseFloat(feeData[0].monthly);
            }
        } catch (e) { console.error('Fee stats query error:', e.message); }

        // ---- 6. Monthly Revenue (last 6 months) ----
        let monthlyRevenue = [];
        try {
            const [mData] = await db.query(
                `SELECT 
                    DATE_FORMAT(payment_date, '%b') as month,
                    COALESCE(SUM(paid_amount), 0) as revenue
                 FROM fee_records
                 WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND school_id = ? AND paid_amount > 0
                 GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
                 ORDER BY MIN(payment_date) ASC`,
                [schoolId]
            );
            monthlyRevenue = mData;
        } catch (e) { console.error('Monthly revenue query error:', e.message); }

        // ---- 7. Class-wise Student Distribution ----
        let classDistribution = [];
        try {
            const [classData] = await db.query(
                `SELECT s.class as class_name, COUNT(*) as count
                 FROM students s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.school_id = ?
                 GROUP BY s.class
                 ORDER BY s.class ASC`,
                [schoolId]
            );
            classDistribution = classData;
        } catch (e) { console.error('Class distribution query error:', e.message); }

        // ---- 8. Gender Distribution ----
        let genderDistribution = { male: 0, female: 0, other: 0 };
        try {
            const [gData] = await db.query(
                `SELECT 
                    COALESCE(SUM(CASE WHEN LOWER(s.gender) = 'male' THEN 1 ELSE 0 END), 0) as male,
                    COALESCE(SUM(CASE WHEN LOWER(s.gender) = 'female' THEN 1 ELSE 0 END), 0) as female,
                    COALESCE(SUM(CASE WHEN LOWER(s.gender) NOT IN ('male','female') OR s.gender IS NULL THEN 1 ELSE 0 END), 0) as other
                 FROM students s JOIN users u ON s.user_id = u.id WHERE s.school_id = ?`,
                [schoolId]
            );
            if (gData[0]) genderDistribution = gData[0];
        } catch (e) { console.error('Gender distribution query error:', e.message); }

        // ---- 9. Monthly Expense Data (last 6 months) ----
        let monthlyExpenses = [];
        try {
            const [eData] = await db.query(
                `SELECT 
                    DATE_FORMAT(expense_date, '%b') as month,
                    COALESCE(SUM(amount), 0) as expense
                 FROM expenses
                 WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND school_id = ?
                 GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
                 ORDER BY MIN(expense_date) ASC`,
                [schoolId]
            );
            monthlyExpenses = eData;
        } catch (e) { console.error('Monthly expenses query error:', e.message); }

        // ---- Send Response ----
        res.json({
            success: true,
            stats: {
                totalStudents: totalStudents[0].count,
                totalTeachers: totalTeachers[0].count,
                totalStaff: totalStaff[0].count,
                totalClasses: totalClasses[0].count,
                totalVehicles: totalVehicles[0].count,
                pendingRequisitions: pendingRequisitions[0].count,
                activeGrievances: activeGrievances[0].count
            },
            todayStudentAttendance,
            todayTeacherAttendance,
            weeklyAttendance,
            feeStats,
            monthlyRevenue,
            monthlyExpenses,
            classDistribution,
            genderDistribution
        });

    } catch (error) {
        console.error('Enhanced dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (school-specific)
// @access  Private (Admin)
router.get('/users', async (req, res) => {
    try {
        const { role, status, page = 1, limit = 10, search = '' } = req.query;
        const schoolId = req.user.school_id;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE school_id = ?';
        const params = [schoolId];

        if (role && role !== 'All') {
            whereClause += ' AND role = ?';
            params.push(role);
        }

        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const [countResult] = await db.query(countQuery, params);
        const totalRecords = countResult[0].total;

        // Get paginated data
        let selectQuery = `SELECT id, email, role, name, phone, status, created_at FROM users ${whereClause}`;
        selectQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const paginatedParams = [...params, parseInt(limit), parseInt(offset)];
        const [users] = await db.query(selectQuery, paginatedParams);

        // Get stats for cards (independent of pagination/filters)
        const [statsResult] = await db.query(`
            SELECT 
                role, 
                COUNT(*) as count 
            FROM users 
            WHERE school_id = ? 
            GROUP BY role
        `, [schoolId]);

        res.json({
            success: true,
            users,
            pagination: {
                totalRecords: parseInt(totalRecords) || 0,
                totalPages: Math.ceil(totalRecords / limit),
                page: parseInt(page),
                limit: parseInt(limit)
            },
            roleStats: statsResult
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/admin/users
// @desc    Create a new user (Admin, Accountant)
// @access  Private (Admin)
router.post('/users', async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and role'
            });
        }

        // Check if email already exists (if provided)
        if (email) {
            const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND school_id = ?', [email, schoolId]);
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Default password is phone number or 'password123'
        const plainPassword = phone || 'password123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, role, password, status, school_id) VALUES (?, ?, ?, ?, ?, "active", ?)',
            [name, email || null, phone || null, role.toLowerCase(), hashedPassword, schoolId]
        );

        const newUserId = result.insertId;

        // If creating a nonteachingstaff user, also insert into non_teaching_staff table
        if (role.toLowerCase() === 'nonteachingstaff') {
            const year = new Date().getFullYear();
            const employeeId = `NTS${year}${newUserId.toString().padStart(3, '0')}`;
            await db.query(
                `INSERT INTO non_teaching_staff 
                 (user_id, employee_id, name, email, phone, designation, gender, school_id) 
                 VALUES (?, ?, ?, ?, ?, 'General Staff', 'Male', ?)`,
                [newUserId, employeeId, name, email || '', phone || '', schoolId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: newUserId
        });

        // Log user creation
        await logActivity(req, 'Create', `Created new user: ${name} (${role})`);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details or status
// @access  Private (Admin)
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, phone, role, status } = req.body;
        const userId = req.params.id;
        const schoolId = req.user.school_id;

        // Retrieve current user details to check Admission portal constraints
        const [userCheck] = await db.query('SELECT role, email, phone FROM users WHERE id = ? AND school_id = ?', [userId, schoolId]);
        if (userCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const currentRole = userCheck[0].role;
        const currentPhone = userCheck[0].phone;

        const finalRole = (role || currentRole || '').toLowerCase();
        const finalPhone = phone !== undefined ? phone : currentPhone;

        // Collect fields to update
        const updates = [];
        const params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email || null); }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone || null);
        }

        // For Admission portal users, the password MUST ALWAYS match the phone number
        if (finalRole === 'admission' && finalPhone) {
            const hashedPassword = await bcrypt.hash(String(finalPhone), 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        } else if (phone !== undefined && phone) {
            // Update password to match phone number for other staff accounts
            const hashedPassword = await bcrypt.hash(String(phone), 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        }
        if (role) { updates.push('role = ?'); params.push(role.toLowerCase()); }
        if (status) { updates.push('status = ?'); params.push(status.toLowerCase()); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided for update'
            });
        }

        params.push(userId, schoolId);
        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND school_id = ?`,
            params
        );

        res.json({
            success: true,
            message: 'User updated successfully'
        });

        // Log user update
        await logActivity(req, 'Update', `Updated user: ${name || email || userId} (ID: ${userId})`);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/requisitions
// @desc    Get all requisitions (from both teachers and students) - school-specific
// @access  Private (Admin)
router.get('/requisitions', async (req, res) => {
    try {
        const { status, source } = req.query;
        const schoolId = req.user.school_id;

        // Query for teacher requisitions (school-specific)
        let teacherQuery = `
            SELECT 
                CONCAT('T', r.id) AS id,
                'Teacher' AS source,
                r.teacher_name AS requesterName,
                r.item AS item,
                r.quantity,
                r.description,
                r.urgency,
                r.category,
                r.status,
                DATE_FORMAT(r.submitted_date, '%d/%m/%Y') AS submittedDate,
                DATE_FORMAT(r.approved_date, '%d/%m/%Y') AS approvedDate,
                DATE_FORMAT(r.rejected_date, '%d/%m/%Y') AS rejectedDate,
                r.rejection_reason AS rejectionReason,
                r.id AS originalId,
                r.created_at,
                DATE_FORMAT(r.created_at, '%h:%i %p') AS submittedTime
            FROM teachers_requisition r
            WHERE r.school_id = ?
        `;

        // Query for student requisitions (school-specific)
        let studentQuery = `
            SELECT 
                CONCAT('S', r.id) AS id,
                'Student' AS source,
                CONCAT(r.student_name, ' (Class ', r.class, ')') AS requesterName,
                r.title AS item,
                r.quantity,
                r.description,
                r.urgency,
                r.category,
                r.status,
                DATE_FORMAT(r.submitted_date, '%d/%m/%Y') AS submittedDate,
                NULL AS approvedDate,
                NULL AS rejectedDate,
                r.remarks AS rejectionReason,
                r.id AS originalId,
                r.created_at,
                DATE_FORMAT(r.created_at, '%h:%i %p') AS submittedTime
            FROM student_requisition r
            WHERE r.school_id = ?
        `;

        const teacherParams = [schoolId];
        const studentParams = [schoolId];

        if (status && status !== 'All') {
            teacherQuery += ' AND r.status = ?';
            studentQuery += ' AND r.status = ?';
            teacherParams.push(status);
            studentParams.push(status);
        }

        // Filter by source if specified
        if (source === 'Teacher') {
            teacherQuery += ' ORDER BY r.created_at DESC';
            const [requisitions] = await db.query(teacherQuery, teacherParams);
            return res.json({ success: true, requisitions });
        } else if (source === 'Student') {
            studentQuery += ' ORDER BY r.created_at DESC';
            const [requisitions] = await db.query(studentQuery, studentParams);
            return res.json({ success: true, requisitions });
        }

        // Combine both queries with UNION ALL
        const combinedQuery = `
            (${teacherQuery}) 
            UNION ALL 
            (${studentQuery})
            ORDER BY created_at DESC
        `;

        const [requisitions] = await db.query(combinedQuery, [...teacherParams, ...studentParams]);

        res.json({
            success: true,
            requisitions
        });
    } catch (error) {
        console.error('Get requisitions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/requisitions/:id
// @desc    Approve or reject requisition (handles both teacher and student)
// @access  Private (Admin)
router.put('/requisitions/:id', async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const compositeId = req.params.id;
        const schoolId = req.user.school_id;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        if (status === 'Rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        // Parse the composite ID to determine source and original ID
        const source = compositeId.charAt(0); // 'T' for teacher, 'S' for student
        const originalId = compositeId.substring(1);

        if (source === 'T') {
            // Update teacher requisition (school-specific)
            const dateField = status === 'Approved' ? 'approved_date' : 'rejected_date';
            await db.query(
                `UPDATE teachers_requisition 
                 SET status = ?, ${dateField} = CURDATE(), rejection_reason = ?
                 WHERE id = ? AND school_id = ?`,
                [status, rejectionReason || null, originalId, schoolId]
            );
        } else if (source === 'S') {
            // Update student requisition (school-specific)
            await db.query(
                `UPDATE student_requisition 
                 SET status = ?, remarks = ?
                 WHERE id = ? AND school_id = ?`,
                [status, rejectionReason || null, originalId, schoolId]
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid requisition ID format'
            });
        }

        res.json({
            success: true,
            message: `Requisition ${status} successfully`
        });
    } catch (error) {
        console.error('Update requisition error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/grievances
// @desc    Get all grievances (from both students and teachers) - school-specific
// @access  Private (Admin)
router.get('/grievances', async (req, res) => {
    try {
        const { status, source } = req.query;
        const schoolId = req.user.school_id;

        // Query for student grievances (school-specific)
        let studentQuery = `
            SELECT 
                CONCAT('S', g.id) AS id,
                'Student' COLLATE utf8mb4_general_ci AS source,
                u.name COLLATE utf8mb4_general_ci AS submitterName,
                CONCAT(s.class, '-', s.section) COLLATE utf8mb4_general_ci AS class,
                g.subject COLLATE utf8mb4_general_ci AS subject,
                g.category COLLATE utf8mb4_general_ci AS category,
                g.description COLLATE utf8mb4_general_ci AS description,
                g.priority COLLATE utf8mb4_general_ci AS priority,
                g.status COLLATE utf8mb4_general_ci AS status,
                DATE_FORMAT(g.submitted_date, '%d/%m/%Y') AS submittedDate,
                COALESCE(g.assigned_to, '') COLLATE utf8mb4_general_ci AS assignedTo,
                COALESCE(g.resolution, '') COLLATE utf8mb4_general_ci AS resolution,
                DATE_FORMAT(g.resolved_date, '%d/%m/%Y') AS resolvedDate,
                g.id AS originalId,
                g.created_at,
                DATE_FORMAT(g.created_at, '%h:%i %p') AS submittedTime
            FROM student_grievances g
            JOIN students s ON g.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE g.school_id = ?
        `;

        // Query for teacher grievances (school-specific)
        let teacherQuery = `
            SELECT 
                CONCAT('T', g.id) AS id,
                'Teacher' COLLATE utf8mb4_general_ci AS source,
                g.teacher_name COLLATE utf8mb4_general_ci AS submitterName,
                COALESCE(g.department, '') COLLATE utf8mb4_general_ci AS class,
                g.subject COLLATE utf8mb4_general_ci AS subject,
                g.category COLLATE utf8mb4_general_ci AS category,
                g.description COLLATE utf8mb4_general_ci AS description,
                g.priority COLLATE utf8mb4_general_ci AS priority,
                g.status COLLATE utf8mb4_general_ci AS status,
                DATE_FORMAT(g.submitted_date, '%d/%m/%Y') AS submittedDate,
                COALESCE(g.assigned_to, '') COLLATE utf8mb4_general_ci AS assignedTo,
                COALESCE(g.resolution, '') COLLATE utf8mb4_general_ci AS resolution,
                DATE_FORMAT(g.resolved_date, '%d/%m/%Y') AS resolvedDate,
                g.id AS originalId,
                g.created_at,
                DATE_FORMAT(g.created_at, '%h:%i %p') AS submittedTime
            FROM teacher_grievance g
            WHERE g.school_id = ?
        `;

        const studentParams = [schoolId];
        const teacherParams = [schoolId];

        if (status && status !== 'All') {
            studentQuery += ' AND g.status = ?';
            teacherQuery += ' AND g.status = ?';
            studentParams.push(status);
            teacherParams.push(status);
        }

        // Filter by source if specified
        if (source === 'Student') {
            studentQuery += ' ORDER BY g.submitted_date DESC';
            const [grievances] = await db.query(studentQuery, studentParams);
            return res.json({ success: true, grievances });
        } else if (source === 'Teacher') {
            teacherQuery += ' ORDER BY g.submitted_date DESC';
            const [grievances] = await db.query(teacherQuery, teacherParams);
            return res.json({ success: true, grievances });
        }

        // Combine both queries with UNION ALL
        const combinedQuery = `
            (${studentQuery}) 
            UNION ALL 
            (${teacherQuery})
            ORDER BY created_at DESC
        `;

        const [grievances] = await db.query(combinedQuery, [...studentParams, ...teacherParams]);

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

// @route   PUT /api/admin/grievances/:id
// @desc    Update grievance status (handles both student and teacher)
// @access  Private (Admin)
router.put('/grievances/:id', async (req, res) => {
    try {
        const { status, resolution } = req.body;
        const compositeId = req.params.id;
        const schoolId = req.user.school_id;

        if (!status || !['Pending', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Parse the composite ID to determine source and original ID
        const source = compositeId.charAt(0); // 'S' for student, 'T' for teacher
        const originalId = compositeId.substring(1);

        if (source === 'S') {
            // Update student grievance (school-specific)
            if (status === 'Resolved') {
                await db.query(
                    `UPDATE student_grievances SET status = ?, resolution = ?, resolved_date = CURDATE() WHERE id = ? AND school_id = ?`,
                    [status, resolution || null, originalId, schoolId]
                );
            } else {
                await db.query(
                    `UPDATE student_grievances SET status = ? WHERE id = ? AND school_id = ?`,
                    [status, originalId, schoolId]
                );
            }
        } else if (source === 'T') {
            // Update teacher grievance (school-specific)
            if (status === 'Resolved') {
                await db.query(
                    `UPDATE teacher_grievance SET status = ?, resolution = ?, resolved_date = CURDATE() WHERE id = ? AND school_id = ?`,
                    [status, resolution || null, originalId, schoolId]
                );
            } else {
                await db.query(
                    `UPDATE teacher_grievance SET status = ? WHERE id = ? AND school_id = ?`,
                    [status, originalId, schoolId]
                );
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid grievance ID format'
            });
        }

        res.json({
            success: true,
            message: 'Grievance updated successfully'
        });
    } catch (error) {
        console.error('Update grievance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/batches
// @desc    Get all batches (school-specific)
// @access  Private (Admin)
router.get('/batches', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [batches] = await db.query(
            `SELECT b.*, t.name as teacher_name
       FROM batches b
       LEFT JOIN teachers t ON b.class_teacher_id = t.id
       WHERE b.school_id = ?
       ORDER BY b.class, b.section`,
            [schoolId]
        );

        res.json({
            success: true,
            batches
        });
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/student-attendance-report
// @desc    Get student attendance report within a date range (school-specific)
// @access  Private (Admin)
router.get('/student-attendance-report', async (req, res) => {
    try {
        const { startDate, endDate, class: studentClass, section, streamId, subject, attendanceType } = req.query;
        const schoolId = req.user.school_id;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start and end dates are required' });
        }

        let query = `
            SELECT 
                s.id as student_id,
                s.student_name as name,
                s.roll_no,
                s.class,
                s.section,
                s.stream_id,
                sa.date,
                sa.status,
                sa.subject
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN students_attendance sa ON s.id = sa.student_id AND sa.date BETWEEN ? AND ?
            WHERE s.school_id = ?
        `;
        const params = [startDate, endDate, schoolId];

        if (studentClass) {
            query += ' AND s.class = ?';
            params.push(studentClass);
        }
        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }
        if (streamId && streamId !== '') {
            query += ' AND s.stream_id = ?';
            params.push(streamId);
        }
        if (subject && subject !== '') {
            // Subject is in attendance records, so we need to be careful with LEFT JOIN
            // If we filter results by subject, students with no attendance in that subject won't show up
            // unless we handle it. Usually, a report for a subject should show all students in 그 class/section
            // and their attendance for THAT subject.
            // If we filter sa.subject = ?, the students with sa = NULL will be filtered out.
            // So we move subject filter to the JOIN condition.
        }

        // Re-construct query to handle subject filter correctly in LEFT JOIN
        query = `
            SELECT 
                s.id as student_id,
                s.student_name as name,
                s.roll_no,
                s.class,
                s.section,
                s.stream_id,
                sa.date,
                CONCAT(UCASE(LEFT(sa.status,1)),SUBSTRING(sa.status,2)) AS status,
                sa.subject,
                sa.marked_by,
                sa.marked_by_history,
                COALESCE(t.name, marker.name) AS marker_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN students_attendance sa ON s.id = sa.student_id 
                AND sa.date BETWEEN ? AND ?
                ${subject && subject !== '' ? 'AND sa.subject = ?' : ''}
                ${attendanceType === 'subject_wise' && (!subject || subject === '') ? "AND sa.subject != 'day_wise'" : ''}
            LEFT JOIN users marker ON sa.marked_by = marker.id
            LEFT JOIN teachers t ON t.user_id = marker.id
            WHERE s.school_id = ?
        `;

        const queryParams = [startDate, endDate];
        if (subject && subject !== '') queryParams.push(subject);
        queryParams.push(schoolId);

        if (studentClass) {
            query += ' AND s.class = ?';
            queryParams.push(studentClass);
        }
        if (section) {
            query += ' AND s.section = ?';
            queryParams.push(section);
        }
        if (streamId && streamId !== '') {
            query += ' AND s.stream_id = ?';
            queryParams.push(streamId);
        }

        // Filter by class range based on attendanceType
        if (attendanceType === 'day_wise' && !studentClass) {
            query += ` AND NOT (UPPER(s.class) LIKE '%11%' OR UPPER(s.class) LIKE '%12%' OR UPPER(s.class) LIKE '%XI%')`;
        } else if (attendanceType === 'subject_wise' && !studentClass) {
            query += ` AND (UPPER(s.class) LIKE '%11%' OR UPPER(s.class) LIKE '%12%' OR UPPER(s.class) LIKE '%XI%')`;
        }

        query += ' ORDER BY s.class ASC, s.section ASC, s.roll_no ASC, sa.date ASC';

        const [report] = await db.query(query, queryParams);

        // Resolve marked_by_history user IDs to full teacher names
        const allMarkerIds = new Set();
        report.forEach(r => {
            if (r.marked_by) allMarkerIds.add(r.marked_by);
            if (r.marked_by_history) {
                String(r.marked_by_history).split(',').forEach(id => {
                    const trimmed = id.trim();
                    if (trimmed) allMarkerIds.add(trimmed);
                });
            }
        });

        if (allMarkerIds.size > 0) {
            const [userRows] = await db.query(
                `SELECT u.id, COALESCE(t.name, u.name) as name 
                 FROM users u 
                 LEFT JOIN teachers t ON t.user_id = u.id 
                 WHERE u.id IN (?)`,
                [Array.from(allMarkerIds)]
            );
            const nameMap = {};
            userRows.forEach(u => { nameMap[u.id] = u.name; });

            report.forEach(r => {
                if (r.marked_by_history) {
                    const names = String(r.marked_by_history)
                        .split(',')
                        .map(id => nameMap[id.trim()])
                        .filter(Boolean);
                    if (names.length > 0) {
                        r.marker_name = Array.from(new Set(names)).join(', ');
                    }
                } else if (r.marked_by && nameMap[r.marked_by]) {
                    r.marker_name = nameMap[r.marked_by];
                }
            });
        }

        // Fetch holidays and weekly schedule for the school
        const [holidays] = await db.query(
            `SELECT * FROM holidays WHERE school_id = ?`,
            [schoolId]
        );

        const [weeklySchedule] = await db.query(
            `SELECT * FROM school_weekly_schedule WHERE school_id = ?`,
            [schoolId]
        );

        res.json({
            success: true,
            report,
            holidays,
            weekly_schedule: weeklySchedule
        });
    } catch (error) {
        console.error('Get student attendance report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/student-attendance
// @desc    Update or create a student attendance record (admin edit)
// @access  Private (Admin)
router.put('/student-attendance', async (req, res) => {
    try {
        const { studentId, date, status, subject } = req.body;
        const schoolId = req.user.school_id;

        if (!studentId || !date || !status) {
            return res.status(400).json({ success: false, message: 'studentId, date and status are required' });
        }

        const effectiveSubject = subject || 'day_wise';
        const dbStatus = status.toLowerCase(); // DB stores lowercase enum

        // Try UPDATE first - this works even without a UNIQUE index
        const [updateResult] = await db.query(
            `UPDATE students_attendance 
             SET status = ?, marked_by = ?, updated_at = CURRENT_TIMESTAMP
             WHERE student_id = ? AND date = ? AND subject = ? AND school_id = ?`,
            [dbStatus, req.user.id, studentId, date, effectiveSubject, schoolId]
        );

        // If no existing record found, INSERT a new one
        if (updateResult.affectedRows === 0) {
            await db.query(
                `INSERT INTO students_attendance (student_id, date, subject, status, marked_by, school_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [studentId, date, effectiveSubject, dbStatus, req.user.id, schoolId]
            );
        }

        res.json({ success: true, message: 'Attendance updated' });
    } catch (error) {
        console.error('Update student attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/students/:id/photo
// @desc    Update student photo
router.post('/students/:id/photo', uploadStudentPhoto.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        const photoPath = `/upload/student_photos/${req.file.filename}`;

        await db.query(
            'UPDATE students SET photo_path = ? WHERE id = ? AND school_id = ?',
            [photoPath, studentId, schoolId]
        );

        res.json({
            success: true,
            message: 'Photo updated successfully',
            photo_path: photoPath
        });
    } catch (error) {
        console.error('Update student photo error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/students/:id/documents
// @desc    Update student documents (Father Photo, Mother Photo, Aadhaar, PAN)
router.post('/students/:id/documents', uploadStudentDocs.fields([
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

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const updates = [];
        const params = [];

        // Map field names to column names (they are the same in our case)
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
            await db.query(
                `UPDATE students SET ${updates.join(', ')} WHERE id = ? AND school_id = ?`,
                params
            );

            res.json({
                success: true,
                message: 'Documents updated successfully',
                updated_fields: updates.map(u => u.split(' ')[0])
            });
        } else {
            res.status(400).json({ success: false, message: 'No valid fields provided' });
        }
    } catch (error) {
        console.error('Update student documents error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// @route   GET /api/admin/students
// @desc    Get all students with full details (school-specific)
// @access  Private (Admin)
router.get('/students', async (req, res) => {
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
            WHERE s.school_id = ? AND (s.status IS NULL OR s.status != 'passed_out')
        `;
        const params = [schoolId];

        if (studentClass) {
            query += ' AND s.class = ?';
            params.push(studentClass);
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
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/admin/students
// @desc    Create new student manually (school-specific)
// @access  Private (Admin)
router.post('/students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            name, email, phone, class: studentClass, section, rollNo,
            fatherName, motherName, guardianPhone, address,
            dateOfBirth, gender, bloodGroup, medicalConditions, stream_id,
            student_unique_id
        } = req.body;

        // 1. Validation
        if (!name || !studentClass || !section || !rollNo || !gender || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Name, Class, Section, Gender and Date of Birth'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 2. Check if email already exists (only if email provided, school-specific)
            if (email) {
                const [existingUser] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND school_id = ?',
                    [email, schoolId]
                );

                if (existingUser.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Email already registered'
                    });
                }
            }

            // 4. Create User Account (Password: DOB in ddmmyyyy format)
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

            // Generate Unique ID if not provided
            let uniqueId = student_unique_id;
            if (uniqueId) {
                // Check if manually provided ID already exists in this school
                const [existingId] = await connection.query(
                    'SELECT id FROM students WHERE student_unique_id = ? AND school_id = ?',
                    [uniqueId, schoolId]
                );

                const [existingUserId] = await connection.query(
                    'SELECT id FROM users WHERE (student_unique_id = ? OR email = ?) AND school_id = ?',
                    [uniqueId, uniqueId, schoolId]
                );

                if (existingId.length > 0 || existingUserId.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Student Unique ID already exists'
                    });
                }
            } else {
                uniqueId = await generateStudentUniqueId(schoolId, connection);
            }

            const [userResult] = await connection.query(
                `INSERT INTO users (email, password, role, name, phone, status, school_id, student_unique_id)
                 VALUES (?, ?, 'student', ?, ?, 'active', ?, ?)`,
                [email || null, hashedPassword, name, phone, schoolId, uniqueId]
            );

            const userId = userResult.insertId;

            // 4. Use Provided Roll Number (check within school)
            const rollNo = req.body.rollNo;

            // Check if roll number already exists in the same class and section (school-specific)
            const [existingRoll] = await connection.query(
                'SELECT id FROM students WHERE roll_no = ? AND class = ? AND section = ? AND school_id = ? AND (status IS NULL OR status != ?)',
                [rollNo, studentClass, section, schoolId, 'passed_out']
            );

            if (existingRoll.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Roll Number already exists in this class and section'
                });
            }


            // 5. Insert into Students Table (school-specific)
            await connection.query(
                `INSERT INTO students 
                 (user_id, student_unique_id, student_name, email, phone, roll_no, class, section, stream_id, father_name, mother_name, father_phone, mother_phone, address, date_of_birth, gender, blood_group, medical_conditions, admission_date, school_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
                [
                    userId,
                    uniqueId,
                    name,
                    email || null,
                    phone || null,
                    rollNo,
                    studentClass,
                    section,
                    stream_id || null,
                    fatherName || null,
                    motherName || null,
                    req.body.fatherPhone || guardianPhone || null,
                    req.body.motherPhone || null,
                    address || null,
                    dateOfBirth || null,
                    gender || null,
                    bloodGroup || null,
                    medicalConditions || null,
                    schoolId,
                    req.user.id
                ]
            );

            await connection.commit();
            connection.release();

            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                student: {
                    id: userResult.insertId, // returning user id effectively, but maybe front end needs student id? 
                    // Let's return basics
                    name,
                    rollNo
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student details (school-specific)
// @access  Private (Admin)
router.put('/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        const {
            name, email, phone, class: studentClass, section,
            fatherName, motherName, guardianPhone, address,
            dateOfBirth, gender, bloodGroup, medicalConditions, stream_id,
            student_unique_id
        } = req.body;

        // 1. Validation
        if (!gender || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Gender and Date of Birth are mandatory.'
            });
        }

        // Get connection for transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Get full student record before update (school-specific)
            const [studentcheck] = await connection.query(
                'SELECT * FROM students WHERE id = ? AND school_id = ?',
                [studentId, schoolId]
            );

            if (studentcheck.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const userId = studentcheck[0].user_id;

            // Check for roll number uniqueness if it's being updated (school-specific)
            if (req.body.rollNo) {
                const [existingRoll] = await connection.query(
                    'SELECT id FROM students WHERE roll_no = ? AND class = ? AND section = ? AND id != ? AND school_id = ? AND (status IS NULL OR status != ?)',
                    [req.body.rollNo, studentClass, section, studentId, schoolId, 'passed_out']
                );

                if (existingRoll.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Roll Number already exists in this class and section'
                    });
                }
            }

            // Check for unique student_unique_id if it's being updated (school-specific)
            if (student_unique_id) {
                const [existingUnique] = await connection.query(
                    'SELECT id FROM students WHERE student_unique_id = ? AND id != ? AND school_id = ?',
                    [student_unique_id, studentId, schoolId]
                );

                const [existingUserUnique] = await connection.query(
                    'SELECT id FROM users WHERE (student_unique_id = ? OR email = ?) AND id != ? AND school_id = ?',
                    [student_unique_id, student_unique_id, userId, schoolId]
                );

                if (existingUnique.length > 0 || existingUserUnique.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'This Student Unique ID is already in use.'
                    });
                }
            }


            // Check for email uniqueness if it's being updated (school-specific)
            if (email) {
                const [existingEmail] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND id != ? AND school_id = ?',
                    [email, userId, schoolId]
                );

                if (existingEmail.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'This email is already registered to another student. Please use a different email.'
                    });
                }
            }



            // Update users table (name, email, phone, unique ID, and password if DOB changes)
            if (userId) {
                let userUpdateSql = 'UPDATE users SET name = ?, email = ?, phone = ?';
                const queryParams = [name, email || null, phone || null];

                if (student_unique_id) {
                    userUpdateSql += ', student_unique_id = ?';
                    queryParams.push(student_unique_id);
                }

                // If Date of Birth is updated, update password to DDMMYYYY format
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
            }

            // Update students table (school-specific)
            let studentUpdateSql = `UPDATE students 
                 SET student_name = ?, email = ?, phone = ?, roll_no = ?, class = ?, section = ?, stream_id = ?, father_name = ?, mother_name = ?, 
                     father_phone = ?, mother_phone = ?, address = ?, date_of_birth = ?, gender = ?, blood_group = ?, medical_conditions = ?`;
            const studentUpdateParams = [name, email || null, phone || null, req.body.rollNo, studentClass, section, stream_id || null, fatherName, motherName, req.body.fatherPhone || guardianPhone || null, req.body.motherPhone || null, address, dateOfBirth, gender, bloodGroup, medicalConditions];

            if (student_unique_id) {
                studentUpdateSql += ', student_unique_id = ?';
                studentUpdateParams.push(student_unique_id);
            }

            studentUpdateSql += ' WHERE id = ? AND school_id = ?';
            studentUpdateParams.push(studentId, schoolId);

            await connection.query(studentUpdateSql, studentUpdateParams);

            await connection.commit();
            connection.release();

            // Log activity log update with old and new values
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
                roll_no: req.body.rollNo,
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

            res.json({
                success: true,
                message: 'Student updated successfully'
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/students/:id/promote
// @desc    Promote a student to the next class (1-10, 11-12 only)
router.put('/students/:id/promote', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        // 1. Get student current class
        const [studentRows] = await db.query(
            `SELECT s.id, s.class, s.section, s.stream_id, u.name as student_name
             FROM students s JOIN users u ON s.user_id = u.id
             WHERE s.id = ? AND s.school_id = ?`,
            [studentId, schoolId]
        );
        if (studentRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = studentRows[0];
        const currentClass = String(student.class);
        const currentNum = parseInt(currentClass, 10);

        // 2. Validate promotion range
        if (isNaN(currentNum)) {
            return res.status(400).json({ success: false, message: 'Cannot determine class number for promotion' });
        }
        if (currentNum === 10) {
            // Class 10 → 11 requires stream_id, section, and roll_no from request body
            const { stream_id, section, roll_no } = req.body;
            if (!stream_id || !section || !roll_no) {
                return res.status(400).json({ success: false, message: 'For promotion from Class 10 to 11, please provide Group (stream), Section, and Roll Number.' });
            }
        }
        if (currentNum === 12) {
            return res.status(400).json({ success: false, message: 'Class 12 is the final class. Cannot promote further.' });
        }
        if (currentNum < 1 || currentNum > 12) {
            return res.status(400).json({ success: false, message: 'Promotion not available for this class' });
        }

        const nextClass = String(currentNum + 1);

        // 3. Check if CURRENT CLASS fees are cleared
        // Get current class name from classes table
        const [currentClassData] = await db.query(
            'SELECT name FROM classes WHERE class_number = ? AND school_id = ?',
            [currentClass, schoolId]
        );
        const currentClassName = currentClassData.length > 0 ? currentClassData[0].name : null;

        // Fee check using the same ledger-style calculation as accounts page:
        // Group by fee_type, use MAX(total_amount) for bill, SUM(paid_amount) for payments, then sum across groups
        // Use case-insensitive matching for class name
        let feeCheckQuery = `
            SELECT fee_type, academic_year,
                   MAX(total_amount) as bill_total, 
                   COALESCE(SUM(paid_amount), 0) as total_paid
            FROM fee_records 
            WHERE student_id = ? AND school_id = ?
              AND (LOWER(class_name) = LOWER(?) OR class_name = ? OR LOWER(class_name) = LOWER(CONCAT('class ', ?)))
            GROUP BY fee_type, academic_year`;
        const feeCheckParams = [studentId, schoolId, currentClassName || currentClass, currentClass, currentClass];

        const [feeCheckRows] = await db.query(feeCheckQuery, feeCheckParams);
        
        let totalBilled = 0;
        let totalPaid = 0;
        for (const row of feeCheckRows) {
            totalBilled += parseFloat(row.bill_total || 0);
            totalPaid += parseFloat(row.total_paid || 0);
        }
        const pendingAmount = totalBilled - totalPaid;

        // Also check if fee_structure exists but no record was created
        if (totalBilled === 0) {
            const [classData] = await db.query(
                'SELECT c.id FROM classes c WHERE c.class_number = ? AND c.school_id = ?',
                [currentClass, schoolId]
            );
            if (classData.length > 0) {
                // Filter by student's stream_id if they have one, otherwise check general (stream_id=0)
                let fsQuery = 'SELECT total_fee FROM fee_structures WHERE class_id = ? AND school_id = ?';
                const fsParams = [classData[0].id, schoolId];
                if (student.stream_id) {
                    fsQuery += ' AND stream_id = ?';
                    fsParams.push(student.stream_id);
                } else {
                    fsQuery += ' AND (stream_id = 0 OR stream_id IS NULL)';
                }
                const [fsCheck] = await db.query(fsQuery, fsParams);
                if (fsCheck.length > 0 && parseFloat(fsCheck[0].total_fee) > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Student has pending fee of ₹${fsCheck[0].total_fee} from fee structure. Please collect or create a fee record first.`
                    });
                }
            }
        }

        if (pendingAmount > 0) {
            return res.status(400).json({
                success: false,
                message: `Student has ₹${pendingAmount.toFixed(2)} pending fees. Please clear all fees before promotion.`
            });
        }

        // 4. Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Update student class (and stream/section/roll for 10→11)
            if (currentNum === 10) {
                const { stream_id, section, roll_no } = req.body;
                // Check roll number uniqueness in new class/section
                const [existingRoll] = await connection.query(
                    'SELECT id FROM students WHERE roll_no = ? AND class = ? AND section = ? AND id != ? AND school_id = ? AND (status IS NULL OR status != ?)',
                    [roll_no, nextClass, section, studentId, schoolId, 'passed_out']
                );
                if (existingRoll.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: 'Roll Number already exists in Class 11 for that section.' });
                }
                await connection.query(
                    'UPDATE students SET class = ?, stream_id = ?, section = ?, roll_no = ? WHERE id = ? AND school_id = ?',
                    [nextClass, stream_id, section, roll_no, studentId, schoolId]
                );
            } else {
                await connection.query(
                    'UPDATE students SET class = ? WHERE id = ? AND school_id = ?',
                    [nextClass, studentId, schoolId]
                );
            }

            // 5. Auto-create fee record for new class from fee_structures
            const [newClassData] = await connection.query(
                'SELECT c.id, c.name FROM classes c WHERE c.class_number = ? AND c.school_id = ?',
                [nextClass, schoolId]
            );

            if (newClassData.length > 0) {
                const [newFeeStructure] = await connection.query(
                    'SELECT total_fee FROM fee_structures WHERE class_id = ? AND school_id = ?',
                    [newClassData[0].id, schoolId]
                );

                if (newFeeStructure.length > 0 && parseFloat(newFeeStructure[0].total_fee) > 0) {
                    const totalFee = parseFloat(newFeeStructure[0].total_fee);
                    const currentYear = new Date().getFullYear();
                    const academicYear = `${currentYear}-${currentYear + 1}`;

                    await connection.query(
                        `INSERT INTO fee_records 
                         (student_id, student_name, class_name, fee_type, total_amount, paid_amount, pending_amount, status, academic_year, received_by, school_id)
                         VALUES (?, ?, ?, 'Annual Fee', ?, 0, ?, 'pending', ?, ?, ?)`,
                        [studentId, student.student_name, newClassData[0].name || nextClass, totalFee, totalFee, academicYear, req.user.id, schoolId]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: `Student promoted from Class ${currentClass} to Class ${nextClass} successfully!`,
                newClass: nextClass
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Promote student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/students/:id/retention
// @desc    Mark a student as Failed or Repeating and generate appropriate fees
router.put('/students/:id/retention', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        const { type } = req.body; // 'fail' or 'repeat'

        if (!['fail', 'repeat'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Type must be fail or repeat' });
        }

        // 1. Get student current class
        const [studentRows] = await db.query(
            `SELECT s.id, s.class, s.section, s.stream_id, u.name as student_name
             FROM students s JOIN users u ON s.user_id = u.id
             WHERE s.id = ? AND s.school_id = ?`,
            [studentId, schoolId]
        );
        if (studentRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = studentRows[0];
        const currentClass = String(student.class);

        // 2. Check if CURRENT CLASS fees are cleared
        const [currentClassData] = await db.query(
            'SELECT name, id FROM classes WHERE class_number = ? AND school_id = ?',
            [currentClass, schoolId]
        );
        const currentClassName = currentClassData.length > 0 ? currentClassData[0].name : null;

        let feeCheckQuery = `
            SELECT fee_type, academic_year,
                   MAX(total_amount) as bill_total, 
                   COALESCE(SUM(paid_amount), 0) as total_paid
            FROM fee_records 
            WHERE student_id = ? AND school_id = ?
              AND (LOWER(class_name) = LOWER(?) OR class_name = ? OR LOWER(class_name) = LOWER(CONCAT('class ', ?)))
            GROUP BY fee_type, academic_year`;
        const feeCheckParams = [studentId, schoolId, currentClassName || currentClass, currentClass, currentClass];

        const [feeCheckRows] = await db.query(feeCheckQuery, feeCheckParams);
        
        let totalBilled = 0;
        let totalPaid = 0;
        for (const row of feeCheckRows) {
            totalBilled += parseFloat(row.bill_total || 0);
            totalPaid += parseFloat(row.total_paid || 0);
        }
        const pendingAmount = totalBilled - totalPaid;

        if (totalBilled === 0) {
            if (currentClassData.length > 0) {
                let fsQuery = 'SELECT total_fee FROM fee_structures WHERE class_id = ? AND school_id = ?';
                const fsParams = [currentClassData[0].id, schoolId];
                if (student.stream_id) {
                    fsQuery += ' AND stream_id = ?';
                    fsParams.push(student.stream_id);
                } else {
                    fsQuery += ' AND (stream_id = 0 OR stream_id IS NULL)';
                }
                const [fsCheck] = await db.query(fsQuery, fsParams);
                if (fsCheck.length > 0 && parseFloat(fsCheck[0].total_fee) > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Student has pending fee of ₹${fsCheck[0].total_fee} from fee structure. Please collect or create a fee record first.`
                    });
                }
            }
        }

        if (pendingAmount > 0) {
            return res.status(400).json({
                success: false,
                message: `Student has ₹${pendingAmount.toFixed(2)} pending fees. Please clear all fees before proceeding.`
            });
        }

        // 3. Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Fetch retention fee policy based on type
            const settingKey = type === 'fail' ? 'fail_fee_policy' : 'repeat_fee_policy';
            const [policyRows] = await connection.query(
                `SELECT setting_value FROM school_settings WHERE school_id = ? AND setting_key = ?`,
                [schoolId, settingKey]
            );
            const policy = policyRows.length > 0 ? policyRows[0].setting_value : 'require';

            // 4. Auto-create fee record for the same class
            if (currentClassData.length > 0) {
                let totalFee = 0;
                
                // First try to get fee from fee structure
                const [feeStructure] = await connection.query(
                    'SELECT total_fee FROM fee_structures WHERE class_id = ? AND school_id = ?',
                    [currentClassData[0].id, schoolId]
                );

                if (feeStructure.length > 0) {
                    totalFee = parseFloat(feeStructure[0].total_fee);
                } else {
                    // Fallback to the student's previous fee for this class
                    const [prevFee] = await connection.query(
                        `SELECT MAX(total_amount) as prev_amount FROM fee_records 
                         WHERE student_id = ? AND school_id = ? AND (class_name = ? OR LOWER(class_name) = LOWER(?))`,
                        [studentId, schoolId, currentClassData[0].name, currentClassData[0].name]
                    );
                    if (prevFee.length > 0 && prevFee[0].prev_amount) {
                        totalFee = parseFloat(prevFee[0].prev_amount);
                    }
                }

                if (policy === 'exempt') {
                    totalFee = 0;
                }

                const currentYear = new Date().getFullYear();
                const academicYear = `${currentYear}-${currentYear + 1}`;
                const feeTypeDesc = type === 'fail' ? 'Annual Fee (Failed Class)' : 'Annual Fee (Repeating Class)';
                const finalFeeType = policy === 'exempt' ? `${feeTypeDesc} Exempt` : feeTypeDesc;

                await connection.query(
                    `INSERT INTO fee_records 
                     (student_id, student_name, class_name, fee_type, total_amount, paid_amount, pending_amount, status, academic_year, received_by, school_id)
                     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
                    [
                        studentId, 
                        student.student_name, 
                        currentClassData[0].name || currentClass, 
                        finalFeeType, 
                        totalFee, 
                        totalFee, 
                        totalFee > 0 ? 'pending' : 'paid', 
                        academicYear, 
                        req.user.id, 
                        schoolId
                    ]
                );
            }

            await connection.commit();
            connection.release();

            const actionVerb = type === 'fail' ? 'Failed' : 'Repeating';
            res.json({
                success: true,
                message: `Student marked as ${actionVerb} in Class ${currentClass}. Fee policy (${policy}) applied for the new academic year.`
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Retention student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        // Get user_id first (school-specific)
        const [student] = await db.query('SELECT user_id FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);

        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const userId = student[0].user_id;

        // 1. Explicitly delete from the students table to ensure it's removed 
        // (in case ON DELETE CASCADE is missing on the foreign key)
        await db.query('DELETE FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);

        // 2. Delete the associated user account
        if (userId) {
            await db.query('DELETE FROM users WHERE id = ? AND school_id = ?', [userId, schoolId]);
        }

        res.json({ success: true, message: 'Student deleted successfully' });

        // Log student deletion
        await logActivity(req, 'Delete', `Deleted student record (ID: ${studentId})`);
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            name, email, phone, subject,
            qualification, experience, joiningDate,
            dateOfBirth, gender, emergencyContact,
            can_manage_students
        } = req.body;

        // 1. Validation
        if (!name || !phone || !subject || !joiningDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (Name, Phone, Subject, Joining Date)'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 2. Check if email already exists (only if provided, school-specific)
            if (email) {
                const [existingUser] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND school_id = ?',
                    [email, schoolId]
                );

                if (existingUser.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Email already registered'
                    });
                }
            }

            // 2b. Check if phone already exists (must be unique, school-specific)
            if (phone) {
                const [existingPhone] = await connection.query(
                    'SELECT id FROM users WHERE phone = ? AND school_id = ?',
                    [phone, schoolId]
                );

                if (existingPhone.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'This phone number is already registered. Please use a different phone number.'
                    });
                }
            }

            // 3. Create User Account (Default Password: phone number)
            const hashedPassword = await bcrypt.hash(phone, 10); // Store secure hash

            const [userResult] = await connection.query(
                `INSERT INTO users (email, password, role, name, phone, status, school_id)
                 VALUES (?, ?, 'teacher', ?, ?, 'active', ?)`,
                [email || null, hashedPassword, name, phone, schoolId]
            );

            const userId = userResult.insertId;

            // 4. Generate Employee ID (Format: TCH + Year + UserID, e.g., TCH2026005)
            const year = new Date().getFullYear();
            const employeeId = `TCH${year}${userId.toString().padStart(3, '0')}`;


            // 5. Insert into Teachers Table (school-specific)
            await connection.query(
                `INSERT INTO teachers 
                 (user_id, employee_id, name, email, phone, subject, qualification, experience, joining_date, address, date_of_birth, gender, emergency_contact, school_id, can_manage_students)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    employeeId,
                    name,
                    email,
                    phone,
                    subject,
                    qualification,
                    experience,
                    joiningDate,
                    req.body.address,
                    dateOfBirth || null,
                    gender || null,
                    emergencyContact || null,
                    schoolId,
                    can_manage_students ? 1 : 0
                ]
            );

            await connection.commit();
            connection.release();

            logCreate({
                schoolId,
                moduleName: 'Teachers',
                entityType: 'Teacher',
                entityId: userId,
                entityName: name,
                data: {
                    employee_id: employeeId,
                    name,
                    email,
                    phone,
                    subject,
                    qualification,
                    joining_date: joiningDate
                },
                description: `Registered new teacher: ${name} (${employeeId})`,
                user: req.user,
                req
            });

            res.status(201).json({
                success: true,
                message: 'Teacher registered successfully',
                employeeId: employeeId
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Register teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


// @route   GET /api/admin/teachers
// @desc    Get all teachers with user details (school-specific)
// @access  Private (Admin)
router.get('/teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const query = `
            SELECT t.*, u.status, 
            (SELECT COUNT(*) FROM students s WHERE s.created_by = t.user_id) as students_added_count
            FROM teachers t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.school_id = ?
            ORDER BY t.employee_id ASC
        `;
        const [teachers] = await db.query(query, [schoolId]);

        res.json({
            success: true,
            teachers
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/teachers/:id
// @desc    Update teacher details (school-specific)
// @access  Private (Admin)
router.put('/teachers/:id', async (req, res) => {
    try {
        const {
            name, email, phone, subject,
            qualification, experience, joiningDate, address, status,
            dateOfBirth, gender, emergencyContact,
            can_manage_students, managed_classes, managed_streams // Updated fields
        } = req.body;

        const teacherId = req.params.id;
        const schoolId = req.user.school_id;
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Get user_id for this teacher (school-specific)
            const [teacherRows] = await connection.query(
                'SELECT * FROM teachers WHERE id = ? AND school_id = ?',
                [teacherId, schoolId]
            );

            if (teacherRows.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ success: false, message: 'Teacher not found' });
            }

            const teacherData = teacherRows[0];
            const userId = teacherData.user_id;

            // Use existing values if not provided in request
            const updatedName = name !== undefined ? name : teacherData.name;
            const updatedEmail = email !== undefined ? email : teacherData.email;
            const updatedPhone = phone !== undefined ? phone : teacherData.phone;
            const updatedSubject = subject !== undefined ? subject : teacherData.subject;
            const updatedQualification = qualification !== undefined ? qualification : teacherData.qualification;
            const updatedExperience = experience !== undefined ? experience : teacherData.experience;
            const updatedJoiningDate = joiningDate !== undefined ? joiningDate : teacherData.joining_date;
            const updatedAddress = address !== undefined ? address : teacherData.address;
            const updatedStatus = status !== undefined ? status : 'active';
            const updatedDOB = dateOfBirth !== undefined ? dateOfBirth : teacherData.date_of_birth;
            const updatedGender = gender !== undefined ? gender : teacherData.gender;
            const updatedEmergency = emergencyContact !== undefined ? emergencyContact : teacherData.emergency_contact;
            const updatedCanManage = can_manage_students !== undefined ? can_manage_students : teacherData.can_manage_students;
            const updatedManagedClasses = managed_classes !== undefined ? managed_classes : teacherData.managed_classes;
            const updatedManagedStreams = managed_streams !== undefined ? managed_streams : teacherData.managed_streams;

            // 2b. Check phone uniqueness (exclude current user)
            if (updatedPhone && updatedPhone !== teacherData.phone) {
                const [existingPhone] = await connection.query(
                    'SELECT id FROM users WHERE phone = ? AND id != ? AND school_id = ?',
                    [updatedPhone, userId, schoolId]
                );
                if (existingPhone.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'This phone number is already registered to another user. Please use a different phone number.'
                    });
                }
            }

            // 2c. Check email uniqueness (exclude current user)
            if (updatedEmail && updatedEmail !== teacherData.email) {
                const [existingEmail] = await connection.query(
                    'SELECT id FROM users WHERE email = ? AND id != ? AND school_id = ?',
                    [updatedEmail, userId, schoolId]
                );
                if (existingEmail.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'This email is already registered to another user. Please use a different email.'
                    });
                }
            }

            // 3. Get current phone number to check if it changed (school-specific)
            const [currentUserData] = await connection.query(
                'SELECT phone FROM users WHERE id = ? AND school_id = ?',
                [userId, schoolId]
            );

            const currentPhone = currentUserData[0]?.phone;
            const phoneChanged = updatedPhone && currentPhone !== updatedPhone;

            // 4. Update Users Table (Login Info + Password if phone changed, school-specific)
            if (phoneChanged) {
                await connection.query(
                    'UPDATE users SET name = ?, email = ?, phone = ?, status = ?, password = ? WHERE id = ? AND school_id = ?',
                    [updatedName, updatedEmail, updatedPhone, updatedStatus, updatedPhone, userId, schoolId]
                );
            } else {
                await connection.query(
                    'UPDATE users SET name = ?, email = ?, phone = ?, status = ? WHERE id = ? AND school_id = ?',
                    [updatedName, updatedEmail, updatedPhone, updatedStatus, userId, schoolId]
                );
            }

            // 4. Update Teachers Table (Profile Info, school-specific)
            await connection.query(
                `UPDATE teachers 
                 SET name = ?, phone = ?, subject = ?, qualification = ?, experience = ?, joining_date = ?, address = ?, email = ?,
                 date_of_birth = ?, gender = ?, emergency_contact = ?, can_manage_students = ?, managed_classes = ?, managed_streams = ?
                 WHERE id = ? AND school_id = ?`,
                [
                    updatedName,
                    updatedPhone,
                    updatedSubject,
                    updatedQualification,
                    updatedExperience,
                    updatedJoiningDate,
                    updatedAddress,
                    updatedEmail,
                    updatedDOB,
                    updatedGender,
                    updatedEmergency,
                    updatedCanManage ? 1 : 0,
                    updatedManagedClasses ? (typeof updatedManagedClasses === 'string' ? updatedManagedClasses : JSON.stringify(updatedManagedClasses)) : null,
                    updatedManagedStreams ? (typeof updatedManagedStreams === 'string' ? updatedManagedStreams : JSON.stringify(updatedManagedStreams)) : null,
                    teacherId,
                    schoolId
                ]
            );

            await connection.commit();
            connection.release();

            const oldData = {
                name: teacherData.name,
                email: teacherData.email,
                phone: teacherData.phone,
                subject: teacherData.subject,
                qualification: teacherData.qualification,
                experience: teacherData.experience,
                address: teacherData.address,
                joining_date: teacherData.joining_date
            };

            const newData = {
                name: updatedName,
                email: updatedEmail,
                phone: updatedPhone,
                subject: updatedSubject,
                qualification: updatedQualification,
                experience: updatedExperience,
                address: updatedAddress,
                joining_date: updatedJoiningDate
            };

            logUpdate({
                schoolId,
                moduleName: 'Teachers',
                entityType: 'Teacher',
                entityId: teacherId,
                entityName: updatedName,
                oldData,
                newData,
                description: `Updated teacher details for ${updatedName}`,
                user: req.user,
                req
            });

            res.json({ success: true, message: 'Teacher updated successfully' });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/teachers/:id
// @desc    Delete teacher (and linked user account) - school-specific
// @access  Private (Admin)
router.delete('/teachers/:id', async (req, res) => {
    try {
        const teacherId = req.params.id;
        const schoolId = req.user.school_id;

        const [teacher] = await db.query('SELECT * FROM teachers WHERE id = ? AND school_id = ?', [teacherId, schoolId]);

        if (teacher.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const userId = teacher[0].user_id;
        const teacherName = teacher[0].name;

        // Deleting the user from 'users' table will automatically delete the 
        // linked 'teachers' record because of ON DELETE CASCADE (school-specific)
        await db.query('DELETE FROM users WHERE id = ? AND school_id = ?', [userId, schoolId]);

        logDelete({
            schoolId,
            moduleName: 'Teachers',
            entityType: 'Teacher',
            entityId: teacherId,
            entityName: teacherName,
            data: teacher[0],
            description: `Deleted teacher: ${teacherName}`,
            user: req.user,
            req
        });

        res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get('/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [classes] = await db.query(
            'SELECT * FROM classes WHERE school_id = ? ORDER BY class_number ASC',
            [schoolId]
        );

        res.json({
            success: true,
            classes
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/classes/:id/streams
// @desc    Get unique streams assigned to a specific class
// @access  Private (Admin)
router.get('/classes/:id/streams', async (req, res) => {
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

        res.json({ success: true, streams });
    } catch (error) {
        console.error('Get class streams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/academic/classes
// @desc    Create new class (school-specific)
// @access  Private (Admin)
router.post('/classes', async (req, res) => {
    try {
        const { name, classNumber, description } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !classNumber) {
            return res.status(400).json({
                success: false,
                message: 'Please provide class name and number'
            });
        }

        // Check if class number already exists (school-specific)
        const [existing] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND school_id = ?',
            [classNumber, schoolId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Class number already exists'
            });
        }

        const [result] = await db.query(
            'INSERT INTO classes (name, class_number, description, school_id) VALUES (?, ?, ?, ?)',
            [name, classNumber, description || null, schoolId]
        );

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            classId: result.insertId
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/academic/classes/:id
// @desc    Update class (school-specific)
// @access  Private (Admin)
router.put('/classes/:id', async (req, res) => {
    try {
        const { name, classNumber, description } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !classNumber) {
            return res.status(400).json({
                success: false,
                message: 'Please provide class name and number'
            });
        }

        // Check if class exists (school-specific)
        const [classes] = await db.query(
            'SELECT id FROM classes WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check if new class number conflicts with another class (school-specific)
        const [existing] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND id != ? AND school_id = ?',
            [classNumber, req.params.id, schoolId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Class number already exists'
            });
        }

        await db.query(
            'UPDATE classes SET name = ?, class_number = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, classNumber, description || null, req.params.id, schoolId]
        );

        res.json({
            success: true,
            message: 'Class updated successfully'
        });
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/academic/classes/:id
// @desc    Delete class (school-specific)
// @access  Private (Admin)
router.delete('/classes/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [result] = await db.query(
            'DELETE FROM classes WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.json({
            success: true,
            message: 'Class deleted successfully'
        });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// SECTIONS ROUTES
// ============================================

// @route   GET /api/admin/subjects
// @desc    Get all subjects (school-specific)
// @access  Private (Admin)
router.get('/subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [subjects] = await db.query(
            'SELECT * FROM subjects WHERE school_id = ? ORDER BY name ASC',
            [schoolId]
        );
        res.json({ success: true, subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/academic/sections
// @desc    Get all sections (school-specific)
// @access  Private (Admin)
router.get('/sections', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [sections] = await db.query(
            'SELECT * FROM sections WHERE school_id = ? ORDER BY code ASC',
            [schoolId]
        );

        res.json({
            success: true,
            sections
        });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/academic/sections
// @desc    Create new section (school-specific)
// @access  Private (Admin)
router.post('/sections', async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide section name and code'
            });
        }

        // Check if code already exists (school-specific)
        const [existing] = await db.query(
            'SELECT id FROM sections WHERE code = ? AND school_id = ?',
            [code, schoolId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Section code already exists'
            });
        }

        const [result] = await db.query(
            'INSERT INTO sections (name, code, description, school_id) VALUES (?, ?, ?, ?)',
            [name, code.toUpperCase(), description || null, schoolId]
        );

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            sectionId: result.insertId
        });
    } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/academic/sections/:id
// @desc    Update section (school-specific)
// @access  Private (Admin)
router.put('/sections/:id', async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide section name and code'
            });
        }

        // Check if section exists (school-specific)
        const [sections] = await db.query(
            'SELECT id FROM sections WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (sections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Check if new code conflicts with another section (school-specific)
        const [existing] = await db.query(
            'SELECT id FROM sections WHERE code = ? AND id != ? AND school_id = ?',
            [code, req.params.id, schoolId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Section code already exists'
            });
        }

        await db.query(
            'UPDATE sections SET name = ?, code = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, code.toUpperCase(), description || null, req.params.id, schoolId]
        );

        res.json({
            success: true,
            message: 'Section updated successfully'
        });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/academic/sections/:id
// @desc    Delete section
// @access  Private (Admin)
router.delete('/sections/:id', async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { id } = req.params;

        // Check if section is assigned to any classes
        const [assignedClassesData] = await db.query(
            `SELECT DISTINCT c.id, c.name, c.class_number 
             FROM classes c 
             INNER JOIN class_sections cs ON c.id = cs.class_id 
             WHERE cs.section_id = ? AND (c.school_id = ? OR ? IS NULL)
             ORDER BY c.class_number ASC`,
            [id, schoolId, schoolId]
        );

        if (assignedClassesData.length > 0) {
            const classNames = assignedClassesData.map(cls => `${cls.name} (Class ${cls.class_number})`).join(', ');
            return res.json({
                success: false,
                message: `This section is assigned to ${assignedClassesData.length} class(es). Please remove it from all classes first before deleting.`,
                assignedClasses: assignedClassesData
            });
        }

        const [result] = await db.query(
            'DELETE FROM sections WHERE id = ? AND (school_id = ? OR ? IS NULL)',
            [id, schoolId, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        res.json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});



// @route   POST /api/academic/subjects
// @desc    Create new subject (school-specific)
// @access  Private (Admin)
router.post('/subjects', async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide subject name and code'
            });
        }

        // Check if code already exists in this school
        const [existing] = await db.query(
            'SELECT id FROM subjects WHERE code = ? AND school_id = ?',
            [code, schoolId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists in your school'
            });
        }

        const [result] = await db.query(
            'INSERT INTO subjects (name, code, description, school_id) VALUES (?, ?, ?, ?)',
            [name, code.toUpperCase(), description || null, schoolId]
        );

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            subjectId: result.insertId
        });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/academic/subjects/:id
// @desc    Update subject (school-specific)
// @access  Private (Admin)
router.put('/subjects/:id', async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const schoolId = req.user.school_id;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide subject name and code'
            });
        }

        // Check if subject exists and belongs to this school
        const [subjects] = await db.query(
            'SELECT id FROM subjects WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Check if new code conflicts with another subject in this school
        const [existing] = await db.query(
            'SELECT id FROM subjects WHERE code = ? AND id != ? AND school_id = ?',
            [code, req.params.id, schoolId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists in your school'
            });
        }

        await db.query(
            'UPDATE subjects SET name = ?, code = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, code.toUpperCase(), description || null, req.params.id, schoolId]
        );

        res.json({
            success: true,
            message: 'Subject updated successfully'
        });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/academic/subjects/:id
// @desc    Delete subject (school-specific)
// @access  Private (Admin)
router.delete('/subjects/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [result] = await db.query(
            'DELETE FROM subjects WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ==================== SYLLABUS MANAGEMENT ROUTES ====================

// @route   GET /api/admin/class-subjects/:classId
// @desc    Get subjects for a specific class (school-specific)
// @access  Private (Admin)
router.get('/class-subjects/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId } = req.params;
        const streamId = req.query.stream_id;

        let query = `SELECT cs.id as mapping_id, cs.stream_id, s.id, s.id as subject_id, s.name, s.name as subject_name, s.code, s.code as subject_code 
             FROM class_subjects cs
             JOIN subjects s ON cs.subject_id = s.id 
             WHERE cs.class_id = ? AND cs.school_id = ?`;
        const params = [classId, schoolId];

        if (streamId && streamId !== 'undefined' && streamId !== 'null') {
            query += ' AND cs.stream_id = ?';
            params.push(streamId);
        }

        query += ' ORDER BY s.name';
        const [subjects] = await db.query(query, params);

        res.json({
            success: true,
            subjects
        });
    } catch (error) {
        console.error('Get class subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/class-sections/:classId
// @desc    Get sections for a specific class (school-specific)
// @access  Private (Admin)
router.get('/class-sections/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId } = req.params;
        const streamId = req.query.stream_id;

        let query = `
             SELECT cs.id as mapping_id, s.id as section_id, s.name as section_name, s.code, cs.stream_id
             FROM class_sections cs
             JOIN sections s ON cs.section_id = s.id 
             WHERE cs.class_id = ? AND cs.school_id = ?
        `;
        const params = [classId, schoolId];

        if (streamId) {
            query += ` AND cs.stream_id = ?`;
            params.push(streamId);
        } else {
            // Group by section id to avoid duplicates if stream_id is not specified
            query += ` GROUP BY s.id`;
        }

        query += ` ORDER BY s.name`;

        const [sections] = await db.query(query, params);

        res.json({
            success: true,
            sections
        });
    } catch (error) {
        console.error('Get class sections error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/syllabus
// @desc    Upload syllabus for a subject and class
// @access  Private (Admin)
router.post('/syllabus', uploadSyllabus.single('file'), async (req, res) => {
    try {
        const { class: className, subject_id, title, content } = req.body;
        const schoolId = req.user.school_id;
        const uploadedBy = req.user.id;

        const filePath = req.file ? `/upload/syllabus/${req.file.filename}` : null;
        const textContent = content && content.trim() !== '' ? content : null;

        if (!filePath && !textContent) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide either a file or text content' });
        }

        if (!className || !subject_id || !title) {
            // Delete uploaded file if validation fails
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const [result] = await db.query(
            'INSERT INTO syllabus (school_id, class, subject_id, title, file_path, content, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [schoolId, className, subject_id, title, filePath, textContent, uploadedBy]
        );

        res.status(201).json({
            success: true,
            message: 'Syllabus uploaded successfully',
            syllabusId: result.insertId,
            filePath
        });
    } catch (error) {
        console.error('Upload syllabus error:', error);
        if (req.file) fs.unlinkSync(req.file.path); // Clean up file
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/syllabus/:id
// @desc    Update syllabus for a subject and class
// @access  Private (Admin)
router.put('/syllabus/:id', uploadSyllabus.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { class: className, subject_id, title, content } = req.body;
        const schoolId = req.user.school_id;

        // Verify authorization
        const [rows] = await db.query('SELECT file_path FROM syllabus WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (rows.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Syllabus not found' });
        }
        
        if (!className || !subject_id || !title) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
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
            return res.status(400).json({ success: false, message: 'Syllabus must have either a file or text content' });
        }

        await db.query(
            'UPDATE syllabus SET class = ?, subject_id = ?, title = ?, file_path = ?, content = ? WHERE id = ?',
            [className, subject_id, title, newFilePath, textContent, id]
        );
        res.json({ success: true, message: 'Syllabus updated successfully' });
    } catch (error) {
        console.error('Update syllabus error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== LEAVE MANAGEMENT ROUTES ====================

// @route   GET /api/admin/leaves
// @desc    Get all student leave requests
// @access  Private (Admin)
router.get('/leaves', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [leaves] = await db.query(
            `SELECT l.*, u.name as student_name, s.class, s.section 
             FROM student_leaves l
             JOIN students s ON l.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE l.school_id = ?
             ORDER BY l.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, leaves });
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/leaves/:id
// @desc    Approve or Reject leave
// @access  Private (Admin)
router.put('/leaves/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const schoolId = req.user.school_id;
        const leaveId = req.params.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await db.query(
            'UPDATE student_leaves SET status = ? WHERE id = ? AND school_id = ?',
            [status, leaveId, schoolId]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave request not found' });

        res.json({ success: true, message: `Leave ${status}` });
    } catch (error) {
        console.error('Update leave error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// @route   GET /api/admin/syllabus
// @desc    Get all syllabus across all classes
// @access  Private (Admin)
router.get('/syllabus', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [syllabus] = await db.query(
            `SELECT s.*, sub.name as subject_name, sub.code as subject_code, u.name as uploader_name, u.role as uploader_role
             FROM syllabus s 
             JOIN subjects sub ON s.subject_id = sub.id 
             LEFT JOIN users u ON s.uploaded_by = u.id
             WHERE s.school_id = ? 
             ORDER BY s.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, syllabus });
    } catch (error) {
        console.error('Get all syllabus error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/syllabus/:classId
// @desc    Get syllabus for a specific class
// @access  Private (Admin)
router.get('/syllabus/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId } = req.params;

        const [syllabus] = await db.query(
            `SELECT s.*, sub.name as subject_name, sub.code as subject_code, u.name as uploader_name, u.role as uploader_role
             FROM syllabus s 
             JOIN subjects sub ON s.subject_id = sub.id 
             LEFT JOIN users u ON s.uploaded_by = u.id
             WHERE s.school_id = ? AND s.class = ? 
             ORDER BY s.created_at DESC`,
            [schoolId, classId]
        );

        res.json({ success: true, syllabus });
    } catch (error) {
        console.error('Get syllabus error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/syllabus/:id
// @desc    Delete syllabus
// @access  Private (Admin)
router.delete('/syllabus/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        // Get file path first to delete file
        const [rows] = await db.query(
            'SELECT file_path FROM syllabus WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Syllabus not found' });
        }

        const filePath = path.join(__dirname, '..', rows[0].file_path);

        // Delete from DB
        await db.query('DELETE FROM syllabus WHERE id = ? AND school_id = ?', [id, schoolId]);

        // Delete file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: 'Syllabus deleted successfully' });
    } catch (error) {
        console.error('Delete syllabus error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/timetable/time-slots
// @desc    Get all time slots
// @access  Private (Admin)
router.get('/time-slots', async (req, res) => {
    try {
        const [timeSlots] = await db.query(
            'SELECT * FROM time_slots ORDER BY display_order ASC'
        );

        res.json({
            success: true,
            timeSlots
        });
    } catch (error) {
        console.error('Get time slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/time-slots/:id
// @desc    Update a time slot's start and end time
// @access  Private (Admin)
router.put('/time-slots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { start_time, end_time } = req.body;

        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Start time and end time are required'
            });
        }

        const [result] = await db.query(
            'UPDATE time_slots SET start_time = ?, end_time = ? WHERE id = ?',
            [start_time, end_time, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }

        res.json({
            success: true,
            message: 'Time slot updated successfully'
        });
    } catch (error) {
        console.error('Update time slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/time-slots
// @desc    Add a new time slot (class period or break)
// @access  Private (Admin)
router.post('/time-slots', async (req, res) => {
    try {
        const { start_time, end_time, is_break } = req.body;
        const schoolId = req.user.school_id;

        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Start time and end time are required'
            });
        }

        // Get max display_order for this school
        const [maxOrder] = await db.query(
            'SELECT COALESCE(MAX(display_order), 0) as max_order FROM time_slots WHERE school_id = ?',
            [schoolId]
        );
        const newOrder = maxOrder[0].max_order + 1;

        // Generate slot_name
        const slotName = is_break ? 'Break' : `${start_time} - ${end_time}`;

        const [result] = await db.query(
            'INSERT INTO time_slots (school_id, start_time, end_time, slot_name, is_break, display_order) VALUES (?, ?, ?, ?, ?, ?)',
            [schoolId, start_time, end_time, slotName, is_break ? 1 : 0, newOrder]
        );

        res.json({
            success: true,
            message: is_break ? 'Break added successfully' : 'Time slot added successfully',
            timeSlot: {
                id: result.insertId,
                school_id: schoolId,
                start_time,
                end_time,
                slot_name: slotName,
                is_break: is_break ? 1 : 0,
                display_order: newOrder
            }
        });
    } catch (error) {
        console.error('Add time slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/time-slots/:id
// @desc    Delete a time slot and its associated timetable entries
// @access  Private (Admin)
router.delete('/time-slots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.school_id;

        // Check if the slot exists
        const [slot] = await db.query(
            'SELECT * FROM time_slots WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (slot.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }

        // Delete associated timetable entries first
        await db.query(
            'DELETE FROM timetable WHERE time_slot_id = ? AND school_id = ?',
            [id, schoolId]
        );

        // Delete the time slot
        await db.query(
            'DELETE FROM time_slots WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        res.json({
            success: true,
            message: slot[0].is_break ? 'Break removed successfully' : 'Time slot deleted successfully'
        });
    } catch (error) {
        console.error('Delete time slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// CLASS TIMETABLE ROUTES
// ============================================

// @route   GET /api/timetable/class/:classNumber/:section
// @desc    Get timetable for a specific class and section
// @access  Private (Admin)
router.get('/class/:classNumber/:section', async (req, res) => {
    try {
        const { classNumber, section } = req.params;
        const schoolId = req.user.school_id;

        const [timetable] = await db.query(
            `SELECT * FROM timetable_view 
             WHERE class_number = ? AND section = ? AND school_id = ?
             ORDER BY 
               FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
               start_time`,
            [classNumber, section, schoolId]
        );

        res.json({
            success: true,
            timetable
        });
    } catch (error) {
        console.error('Get class timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/timetable/entry
// @desc    Add or update timetable entry
// @access  Private (Admin)
router.post('/entry', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            classNumber,
            section,
            dayOfWeek,
            timeSlotId,
            subjectId,
            teacherId,
            roomNumber
        } = req.body;

        // Validation
        if (!classNumber || !section || !dayOfWeek || !timeSlotId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if entry already exists (school-specific)
        const [existing] = await db.query(
            `SELECT id FROM timetable 
             WHERE class_number = ? AND section = ? AND day_of_week = ? AND time_slot_id = ? AND school_id = ?`,
            [classNumber, section, dayOfWeek, timeSlotId, schoolId]
        );

        if (existing.length > 0) {
            // Update existing entry
            await db.query(
                `UPDATE timetable 
                 SET subject_id = ?, teacher_id = ?, room_number = ?
                 WHERE id = ? AND school_id = ?`,
                [subjectId || null, teacherId || null, roomNumber || null, existing[0].id, schoolId]
            );

            res.json({
                success: true,
                message: 'Timetable entry updated successfully',
                entryId: existing[0].id
            });
        } else {
            // Create new entry (school-specific)
            const [result] = await db.query(
                `INSERT INTO timetable 
                 (class_number, section, day_of_week, time_slot_id, subject_id, teacher_id, room_number, school_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [classNumber, section, dayOfWeek, timeSlotId, subjectId || null, teacherId || null, roomNumber || null, schoolId]
            );

            res.status(201).json({
                success: true,
                message: 'Timetable entry created successfully',
                entryId: result.insertId
            });
        }
    } catch (error) {
        console.error('Add/Update timetable entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/timetable/entry/:id
// @desc    Delete timetable entry
// @access  Private (Admin)
router.delete('/entry/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM timetable WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Timetable entry not found'
            });
        }

        res.json({
            success: true,
            message: 'Timetable entry deleted successfully'
        });
    } catch (error) {
        console.error('Delete timetable entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// TEACHER TIMETABLE ROUTES
// ============================================

// @route   GET /api/timetable/available-teachers
// @desc    Get teachers available for a specific time slot
// @access  Private (Admin)
router.get('/available-teachers/:dayOfWeek/:timeSlotId', async (req, res) => {
    try {
        const { dayOfWeek, timeSlotId } = req.params;

        const [teachers] = await db.query(
            `SELECT te.id, te.employee_id, u.name, te.subject
             FROM teachers te
             JOIN users u ON te.user_id = u.id
             WHERE te.status = 'active'
             AND te.id NOT IN (
                 SELECT teacher_id FROM timetable 
                 WHERE day_of_week = ? AND time_slot_id = ? AND teacher_id IS NOT NULL
             )
             ORDER BY u.name`,
            [dayOfWeek, timeSlotId]
        );

        res.json({
            success: true,
            teachers
        });
    } catch (error) {
        console.error('Get available teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// BULK OPERATIONS
// ============================================

// @route   POST /api/timetable/bulk-create
// @desc    Create multiple timetable entries at once
// @access  Private (Admin)
router.post('/bulk-create', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { entries } = req.body;

        if (!Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of entries'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            for (const entry of entries) {
                const { classNumber, section, dayOfWeek, timeSlotId, subjectId, teacherId, roomNumber } = entry;

                // Check if entry exists (school-specific)
                const [existing] = await connection.query(
                    `SELECT id FROM timetable 
                     WHERE class_number = ? AND section = ? AND day_of_week = ? AND time_slot_id = ? AND school_id = ?`,
                    [classNumber, section, dayOfWeek, timeSlotId, schoolId]
                );

                if (existing.length > 0) {
                    // Update
                    await connection.query(
                        `UPDATE timetable 
                         SET subject_id = ?, teacher_id = ?, room_number = ?
                         WHERE id = ? AND school_id = ?`,
                        [subjectId || null, teacherId || null, roomNumber || null, existing[0].id, schoolId]
                    );
                } else {
                    // Insert (school-specific)
                    await connection.query(
                        `INSERT INTO timetable 
                         (class_number, section, day_of_week, time_slot_id, subject_id, teacher_id, room_number, school_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [classNumber, section, dayOfWeek, timeSlotId, subjectId || null, teacherId || null, roomNumber || null, schoolId]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: `${entries.length} timetable entries processed successfully`
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Bulk create timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/timetable/class/:classNumber/:section
// @desc    Delete all timetable entries for a class
// @access  Private (Admin)
router.delete('/class/:classNumber/:section', async (req, res) => {
    try {
        const { classNumber, section } = req.params;

        const [result] = await db.query(
            'DELETE FROM timetable WHERE class_number = ? AND section = ?',
            [classNumber, section]
        );

        res.json({
            success: true,
            message: `${result.affectedRows} timetable entries deleted`,
            deletedCount: result.affectedRows
        });
    } catch (error) {
        console.error('Delete class timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});




// @route   POST /api/timetable/teacher/assign
// @desc    Assign/Update a class to teacher's timetable with NAMES stored (supports regular, elective, and merged)
// @access  Private (Admin)
router.post('/teacher/assign', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { teacherId, dayOfWeek, timeSlotId, classNumber, section, subjectId, roomNumber, streamId, isElective, studentIds, isMerged, mergedClasses } = req.body;

        // ========== MERGED CLASS FLOW ==========
        if (isMerged) {
            if (!teacherId || !dayOfWeek || !timeSlotId || !subjectId || !mergedClasses || mergedClasses.length < 2) {
                return res.status(400).json({ success: false, message: 'Merged class requires at least 2 class-section pairs' });
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                const [subjRows] = await connection.query('SELECT name FROM subjects WHERE id = ? AND school_id = ?', [subjectId, schoolId]);
                const subjectName = subjRows.length > 0 ? subjRows[0].name : '';
                const [teacherRows] = await connection.query('SELECT t.name FROM teachers t WHERE t.id = ? AND t.school_id = ?', [teacherId, schoolId]);
                const teacherName = teacherRows.length > 0 ? teacherRows[0].name : '';
                const [slotRows] = await connection.query('SELECT start_time, end_time FROM time_slots WHERE id = ? AND school_id = ?', [timeSlotId, schoolId]);
                const timeSlotName = slotRows.length > 0 ? `${slotRows[0].start_time} - ${slotRows[0].end_time}` : '';

                // 1. Identify if teacher already has a merged group here
                const [oldMerged] = await connection.query(
                    `SELECT merge_group_id FROM timetable WHERE teacher_id = ? AND day_of_week = ? AND time_slot_id = ? AND school_id = ? AND merge_group_id IS NOT NULL LIMIT 1`,
                    [teacherId, dayOfWeek, timeSlotId, schoolId]
                );
                const currentMergeGroupId = oldMerged.length > 0 ? oldMerged[0].merge_group_id : null;

                // 2. Check for conflicts for each class-section
                for (const mc of mergedClasses) {
                    const [conflict] = await connection.query(
                        `SELECT t.id, tch.name as teacher_name FROM timetable t
                         LEFT JOIN teachers tch ON t.teacher_id = tch.id
                         WHERE t.class_number = ? AND t.section = ? AND t.day_of_week = ? AND t.time_slot_id = ? AND t.school_id = ?
                         AND (t.stream_id = ? OR (t.stream_id IS NULL AND ? IS NULL))
                         ${currentMergeGroupId ? 'AND (t.merge_group_id IS NULL OR t.merge_group_id != ?)' : ''}`,
                        currentMergeGroupId 
                            ? [mc.classNumber, mc.section, dayOfWeek, timeSlotId, schoolId, mc.streamId || null, mc.streamId || null, currentMergeGroupId]
                            : [mc.classNumber, mc.section, dayOfWeek, timeSlotId, schoolId, mc.streamId || null, mc.streamId || null]
                    );
                    if (conflict.length > 0) {
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({
                            success: false,
                            message: `Conflict: Class ${mc.classNumber}-${mc.section} already has an assignment on ${dayOfWeek} at this time (Teacher: ${conflict[0].teacher_name || 'Unknown'}).`
                        });
                    }
                }

                // 3. Also check if teacher already has a non-merged assignment at this slot
                const [teacherConflict] = await connection.query(
                    `SELECT id FROM timetable WHERE teacher_id = ? AND day_of_week = ? AND time_slot_id = ? AND school_id = ? AND merge_group_id IS NULL`,
                    [teacherId, dayOfWeek, timeSlotId, schoolId]
                );
                if (teacherConflict.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: 'Teacher already has a non-merged assignment at this slot. Delete it first.' });
                }

                // 4. Delete old merged entries if they exist
                if (currentMergeGroupId) {
                    await connection.query('DELETE FROM timetable WHERE merge_group_id = ?', [currentMergeGroupId]);
                }

                // 5. Generate a unique merge group ID and insert one row per merged class-section
                const crypto = require('crypto');
                const mergeGroupId = crypto.randomUUID();
                for (const mc of mergedClasses) {
                    await connection.query(
                        `INSERT INTO timetable 
                         (teacher_id, class_number, section, stream_id, day_of_week, time_slot_id, subject_id, room_number,
                          subject_name, teacher_name, time_slot_name, school_id, is_elective, merge_group_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
                        [teacherId, mc.classNumber, mc.section, mc.streamId || null, dayOfWeek, timeSlotId, subjectId,
                         roomNumber || null, subjectName, teacherName, timeSlotName, schoolId, mergeGroupId]
                    );
                }

                await connection.commit();
                connection.release();
                return res.status(201).json({ success: true, message: 'Merged class assigned successfully' });
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        }

        // ========== REGULAR / ELECTIVE FLOW (unchanged) ==========
        // Validate required fields
        if (!teacherId || !dayOfWeek || !timeSlotId || !classNumber || !section || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Fetch Names for Storage (school-specific)
            const [subjRows] = await connection.query('SELECT name FROM subjects WHERE id = ? AND school_id = ?', [subjectId, schoolId]);
            const subjectName = subjRows.length > 0 ? subjRows[0].name : '';

            const [teacherRows] = await connection.query(
                'SELECT t.name FROM teachers t WHERE t.id = ? AND t.school_id = ?',
                [teacherId, schoolId]
            );
            const teacherName = teacherRows.length > 0 ? teacherRows[0].name : '';

            const [slotRows] = await connection.query('SELECT start_time, end_time FROM time_slots WHERE id = ? AND school_id = ?', [timeSlotId, schoolId]);
            const timeSlotName = slotRows.length > 0 ? `${slotRows[0].start_time} - ${slotRows[0].end_time}` : '';

            const electiveFlag = isElective ? 1 : 0;

            // 2. Check for existing Teacher Slot (school-specific)
            const [existingTeacherSlot] = await connection.query(
                `SELECT id FROM timetable 
                 WHERE teacher_id = ? AND day_of_week = ? AND time_slot_id = ? AND school_id = ? AND merge_group_id IS NULL`,
                [teacherId, dayOfWeek, timeSlotId, schoolId]
            );

            let timetableId;

            if (existingTeacherSlot.length > 0) {
                timetableId = existingTeacherSlot[0].id;
                // Update existing entry
                await connection.query(
                    `UPDATE timetable 
                     SET class_number = ?, section = ?, subject_id = ?, room_number = ?,
                         subject_name = ?, teacher_name = ?, time_slot_name = ?, stream_id = ?, is_elective = ?
                     WHERE id = ? AND school_id = ?`,
                    [
                        classNumber, section, subjectId, roomNumber || null,
                        subjectName, teacherName, timeSlotName, streamId || null, electiveFlag,
                        timetableId, schoolId
                    ]
                );

                // If elective, update student assignments
                if (electiveFlag) {
                    await connection.query('DELETE FROM timetable_elective_students WHERE timetable_id = ?', [timetableId]);
                    if (studentIds && studentIds.length > 0) {
                        const values = studentIds.map(sid => [timetableId, sid, schoolId]);
                        await connection.query(
                            'INSERT INTO timetable_elective_students (timetable_id, student_id, school_id) VALUES ?',
                            [values]
                        );
                    }
                } else {
                    // If switched from elective to regular, clean up
                    await connection.query('DELETE FROM timetable_elective_students WHERE timetable_id = ?', [timetableId]);
                }

                await connection.commit();
                connection.release();

                return res.json({
                    success: true,
                    message: 'Teacher timetable updated successfully'
                });
            }

            // 3. Conflict check — always block if a regular subject exists at this class-section-slot
            const [existingRegularSlot] = await connection.query(
                `SELECT t.id, tch.name as current_teacher_name 
                 FROM timetable t
                 LEFT JOIN teachers tch ON t.teacher_id = tch.id
                 WHERE t.class_number = ? AND t.section = ? AND t.day_of_week = ? AND t.time_slot_id = ? AND t.school_id = ?
                 AND t.is_elective = 0
                 AND (t.stream_id = ? OR (t.stream_id IS NULL AND ? IS NULL))`,
                [classNumber, section, dayOfWeek, timeSlotId, schoolId, streamId || null, streamId || null]
            );

            if (existingRegularSlot.length > 0) {
                const currentTeacher = existingRegularSlot[0].current_teacher_name || 'Another Teacher';
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Conflict: Class ${classNumber}-${section} already has a regular subject assigned to ${currentTeacher} on ${dayOfWeek} at this time. Remove it first to add an elective.`
                });
            }

            // If adding a regular subject, also block if any electives exist at this slot
            if (!electiveFlag) {
                const [existingElectives] = await connection.query(
                    `SELECT t.id FROM timetable t
                     WHERE t.class_number = ? AND t.section = ? AND t.day_of_week = ? AND t.time_slot_id = ? AND t.school_id = ?
                     AND t.is_elective = 1
                     AND (t.stream_id = ? OR (t.stream_id IS NULL AND ? IS NULL))`,
                    [classNumber, section, dayOfWeek, timeSlotId, schoolId, streamId || null, streamId || null]
                );

                if (existingElectives.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: `Conflict: Class ${classNumber}-${section} already has elective subjects at this time slot. Remove them first to assign a regular subject.`
                    });
                }
            }

            // 4. Create New Entry (school-specific)
            const [result] = await connection.query(
                `INSERT INTO timetable 
                 (teacher_id, class_number, section, stream_id, day_of_week, time_slot_id, subject_id, room_number,
                  subject_name, teacher_name, time_slot_name, school_id, is_elective)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    teacherId, classNumber, section, streamId || null, dayOfWeek, timeSlotId, subjectId, roomNumber || null,
                    subjectName, teacherName, timeSlotName, schoolId, electiveFlag
                ]
            );

            timetableId = result.insertId;

            // 5. If elective, save student assignments
            if (electiveFlag && studentIds && studentIds.length > 0) {
                const values = studentIds.map(sid => [timetableId, sid, schoolId]);
                await connection.query(
                    'INSERT INTO timetable_elective_students (timetable_id, student_id, school_id) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            connection.release();

            res.status(201).json({
                success: true,
                message: electiveFlag ? 'Elective subject assigned successfully' : 'Class assigned successfully',
                entryId: timetableId
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Assign teacher class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/timetable/teacher/entry/:id
// @desc    Delete a teacher's timetable entry
// @access  Private (Admin)
router.delete('/teacher/entry/:id', async (req, res) => {
    try {
        // Check if entry is part of a merge group
        const [entry] = await db.query('SELECT merge_group_id FROM timetable WHERE id = ?', [req.params.id]);
        if (entry.length === 0) {
            return res.status(404).json({ success: false, message: 'Timetable entry not found' });
        }

        if (entry[0].merge_group_id) {
            // Delete ALL entries in the merge group
            await db.query('DELETE FROM timetable WHERE merge_group_id = ?', [entry[0].merge_group_id]);
            return res.json({ success: true, message: 'Merged class group deleted successfully' });
        }

        // Regular single delete
        const [result] = await db.query('DELETE FROM timetable WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Timetable entry not found' });
        }

        res.json({ success: true, message: 'Teacher timetable entry deleted successfully' });
    } catch (error) {
        console.error('Delete teacher timetable entry error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/timetable/teacher/:teacherId
// @desc    Get timetable for a specific teacher
// @access  Private (Admin/Teacher)
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Query to get teacher's timetable with all details
        const [timetable] = await db.query(
            `SELECT 
                t.id,
                t.class_number,
                t.section,
                t.day_of_week,
                t.time_slot_id,
                t.room_number,
                t.is_elective,
                ts.slot_name,
                ts.start_time,
                ts.end_time,
                ts.is_break,
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                t.stream_id,
                st.name as stream_name,
                t.merge_group_id,
                t.created_at,
                t.updated_at
             FROM timetable t
             JOIN time_slots ts ON t.time_slot_id = ts.id
             LEFT JOIN subjects s ON t.subject_id = s.id
             LEFT JOIN streams st ON t.stream_id = st.id
             WHERE t.teacher_id = ?
             ORDER BY 
               FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
               ts.start_time`,
            [teacherId]
        );

        res.json({
            success: true,
            timetable
        });
    } catch (error) {
        console.error('Get teacher timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/timetable/teacher/:teacherId/conflicts
// @desc    Check for scheduling conflicts for a teacher
// @access  Private (Admin)
router.get('/teacher/:teacherId/conflicts', async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Find slots where teacher has multiple classes
        const [conflicts] = await db.query(
            `SELECT 
                day_of_week,
                time_slot_id,
                COUNT(*) as conflict_count,
                GROUP_CONCAT(CONCAT(class_number, '-', section) SEPARATOR ', ') as classes
             FROM timetable
             WHERE teacher_id = ?
             GROUP BY day_of_week, time_slot_id
             HAVING COUNT(*) > 1`,
            [teacherId]
        );

        res.json({
            success: true,
            conflicts: conflicts,
            hasConflicts: conflicts.length > 0
        });
    } catch (error) {
        console.error('Check teacher conflicts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/timetable/teacher/:teacherId/workload
// @desc    Get teacher's workload statistics
// @access  Private (Admin)
router.get('/teacher/:teacherId/workload', async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Get total periods per day
        const [dailyWorkload] = await db.query(
            `SELECT 
                day_of_week,
                COUNT(*) as periods_count,
                GROUP_CONCAT(DISTINCT CONCAT(class_number, '-', section) ORDER BY class_number, section) as classes
             FROM timetable
             WHERE teacher_id = ?
             GROUP BY day_of_week
             ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')`,
            [teacherId]
        );

        // Get total workload
        const [totalWorkload] = await db.query(
            `SELECT 
                COUNT(*) as total_periods,
                COUNT(DISTINCT CONCAT(class_number, '-', section)) as unique_classes,
                COUNT(DISTINCT subject_id) as unique_subjects
             FROM timetable
             WHERE teacher_id = ?`,
            [teacherId]
        );

        res.json({
            success: true,
            dailyWorkload,
            totalWorkload: totalWorkload[0]
        });
    } catch (error) {
        console.error('Get teacher workload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/timetable/teacher/:teacherId/bulk-assign
// @desc    Bulk assign multiple classes to a teacher
// @access  Private (Admin)
router.post('/teacher/:teacherId/bulk-assign', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { teacherId } = req.params;
        const { assignments } = req.body;

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of assignments'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            let created = 0;
            let updated = 0;

            for (const assignment of assignments) {
                const { dayOfWeek, timeSlotId, classNumber, section, subjectId, roomNumber } = assignment;

                // Check if entry exists (school-specific)
                const [existing] = await connection.query(
                    `SELECT id FROM timetable 
                     WHERE teacher_id = ? AND day_of_week = ? AND time_slot_id = ? AND school_id = ?`,
                    [teacherId, dayOfWeek, timeSlotId, schoolId]
                );

                if (existing.length > 0) {
                    // Update
                    await connection.query(
                        `UPDATE timetable 
                         SET class_number = ?, section = ?, subject_id = ?, room_number = ?
                         WHERE id = ? AND school_id = ?`,
                        [classNumber, section, subjectId, roomNumber || null, existing[0].id, schoolId]
                    );
                    updated++;
                } else {
                    // Insert (school-specific)
                    await connection.query(
                        `INSERT INTO timetable 
                         (teacher_id, class_number, section, day_of_week, time_slot_id, subject_id, room_number, school_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [teacherId, classNumber, section, dayOfWeek, timeSlotId, subjectId, roomNumber || null, schoolId]
                    );
                    created++;
                }
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: `Bulk assignment completed: ${created} created, ${updated} updated`,
                created,
                updated
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Bulk assign teacher classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/timetable/teacher/:teacherId/clear
// @desc    Clear all timetable entries for a teacher
// @access  Private (Admin)
router.delete('/teacher/:teacherId/clear', async (req, res) => {
    try {
        const { teacherId } = req.params;

        const [result] = await db.query(
            'DELETE FROM timetable WHERE teacher_id = ?',
            [teacherId]
        );

        res.json({
            success: true,
            message: `${result.affectedRows} timetable entries cleared for teacher`,
            deletedCount: result.affectedRows
        });
    } catch (error) {
        console.error('Clear teacher timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// FEE MANAGEMENT ROUTES
// ============================================

// Helper to ensure fee_admission table exists
const ensureFeeAdmissionTable = async () => {
    try {
        // Check if old table 'admission_fees' exists and drop it to migrate to new name
        const [oldTable] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'admission_fees'
        `);

        if (oldTable.length > 0) {
            console.log('Dropping old admission_fees table to migrate to fee_admission...');
            await db.query('DROP TABLE admission_fees');
        }

        await db.query(`
            CREATE TABLE IF NOT EXISTS fee_admission (
                id int(11) NOT NULL AUTO_INCREMENT,
                amount decimal(10,2) NOT NULL DEFAULT 0.00,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Ensure at least one row exists
        const [rows] = await db.query('SELECT count(*) as count FROM fee_admission');
        if (rows[0].count === 0) {
            await db.query('INSERT INTO fee_admission (id, amount) VALUES (1, 0.00)');
        }
    } catch (error) {
        console.error('Error creating/migrating fee_admission table:', error);
    }
};

// @route   GET /api/admin/fees/admission
// @desc    Get admission fee for this school
// @access  Private (Admin)
router.get('/fees/admission', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get admission fee for this school
        const [fees] = await db.query(
            'SELECT * FROM fee_admission WHERE school_id = ?',
            [schoolId]
        );

        if (fees.length === 0) {
            return res.json({
                success: true,
                amount: null,
                message: 'Admission fee not configured for this school'
            });
        }

        res.json({
            success: true,
            amount: fees[0].amount
        });
    } catch (error) {
        console.error('Get admission fee error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/fees/admission
// @desc    Update admission fee for this school
// @access  Private (Admin)
router.post('/fees/admission', async (req, res) => {
    try {
        const { amount } = req.body;
        const schoolId = req.user.school_id;

        // Upsert admission fee for this school
        await db.query(`
            INSERT INTO fee_admission (school_id, amount)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        `, [schoolId, amount || 0]);

        res.json({
            success: true,
            message: 'Admission fee updated successfully',
            amount: amount || 0
        });
    } catch (error) {
        console.error('Update admission fee error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/fees/classes
// @desc    Get all classes for this school
// @access  Private (Admin)
router.get('/fees/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [classes] = await db.query(
            'SELECT id, name, class_number, description FROM classes WHERE school_id = ? ORDER BY class_number ASC',
            [schoolId]
        );

        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/fees/structure
// @desc    Get fee structure for all classes (school-specific) with dynamic columns
// @access  Private (Admin)
router.get('/fees/structure', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get all classes with their fee_structure IDs
        const classQuery = `
            SELECT
                c.id as class_id,
                CASE WHEN s.name IS NOT NULL THEN CONCAT(c.name, ' - ', s.name) ELSE c.name END as class_name,
                c.class_number,
                COALESCE(s.id, 0) as stream_id,
                f.id as fee_id,
                COALESCE(f.total_fee, 0) as total_fee,
                CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as has_config
            FROM classes c
            LEFT JOIN class_streams cs ON c.id = cs.class_id
            LEFT JOIN streams s ON cs.stream_id = s.id
            LEFT JOIN fee_structures f ON c.id = f.class_id AND f.school_id = ?
                AND f.stream_id = COALESCE(s.id, 0)
            WHERE c.school_id = ?
            ORDER BY
                CASE 
                    WHEN LOWER(c.class_number) IN('play', 'playgroup', 'pre-nursery') THEN 1
                    WHEN LOWER(c.class_number) = 'nursery' THEN 2
                    WHEN LOWER(c.class_number) = 'lkg' THEN 3
                    WHEN LOWER(c.class_number) = 'ukg' THEN 4
                    WHEN c.class_number REGEXP '^[0-9]+$' THEN CAST(c.class_number AS UNSIGNED) + 10
                    ELSE 999 
                END ASC,
                c.class_number ASC,
                s.name ASC
        `;
        const [classResults] = await db.query(classQuery, [schoolId, schoolId]);

        // 2. Get fee column values for all fee_structure IDs
        const feeIds = classResults.filter(r => r.fee_id).map(r => r.fee_id);
        let columnValues = [];
        if (feeIds.length > 0) {
            const [vals] = await db.query(
                `SELECT fcv.fee_structure_id, fcv.column_type_id, fcv.amount
                 FROM fee_column_values fcv
                 WHERE fcv.fee_structure_id IN (?)`,
                [feeIds]
            );
            columnValues = vals;
        }

        // 3. Build a map of fee_structure_id -> { column_type_id: amount }
        const valMap = {};
        for (const v of columnValues) {
            if (!valMap[v.fee_structure_id]) valMap[v.fee_structure_id] = {};
            valMap[v.fee_structure_id][v.column_type_id] = parseFloat(v.amount) || 0;
        }

        // 4. Attach column_values to each class result
        const data = classResults.map(row => ({
            ...row,
            column_values: row.fee_id ? (valMap[row.fee_id] || {}) : {}
        }));

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get fee structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/fees/structure/:classId
// @desc    Get fee structure for a specific class (school-specific)
// @access  Private (Admin)
router.get('/fees/structure/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const schoolId = req.user.school_id;

        const query = `
        SELECT
        c.id as class_id,
            c.name as class_name,
            c.class_number,
            f.id as fee_id,
            COALESCE(f.tuition_fee, 0) as tuition_fee,
            COALESCE(f.library_fee, 0) as library_fee,
            COALESCE(f.sports_fee, 0) as sports_fee,
            COALESCE(f.lab_fee, 0) as lab_fee,
            COALESCE(f.exam_fee, 0) as exam_fee,
            COALESCE(f.transport_fee, 0) as transport_fee,
            COALESCE(f.hostel_fee, 0) as hostel_fee,
            COALESCE(f.misc_fee, 0) as misc_fee,
            COALESCE(f.total_fee, 0) as total_fee,
            CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as has_config
            FROM classes c
            LEFT JOIN fee_structures f ON c.id = f.class_id AND f.school_id = ?
            WHERE c.id = ? AND c.school_id = ?
                `;

        const [results] = await db.query(query, [schoolId, classId, schoolId]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Get fee structure by class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/fees/structure
// @desc    Update or Insert fee structure for a class (dynamic columns)
// @access  Private (Admin)
router.post('/fees/structure', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            classId,
            streamId = 0,
            columns = {} // { columnTypeId: amount }
        } = req.body;

        // Validate classId
        if (!classId) {
            return res.status(400).json({
                success: false,
                message: 'Class ID is required'
            });
        }

        // Verify class belongs to this school
        const [classCheck] = await db.query(
            'SELECT id FROM classes WHERE id = ? AND school_id = ?',
            [classId, schoolId]
        );
        if (classCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Calculate total from dynamic columns
        const total = Object.values(columns).reduce((sum, val) => sum + (Number(val) || 0), 0);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Upsert Fee Structure row (only total_fee matters now)
            const [upsertResult] = await connection.query(`
                INSERT INTO fee_structures
                    (class_id, school_id, stream_id, total_fee)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    total_fee = VALUES(total_fee)
            `, [classId, schoolId, streamId || 0, total]);

            // Get the fee_structure id
            let feeStructureId;
            if (upsertResult.insertId && upsertResult.insertId > 0) {
                feeStructureId = upsertResult.insertId;
            } else {
                const [existing] = await connection.query(
                    'SELECT id FROM fee_structures WHERE class_id = ? AND school_id = ? AND stream_id = ?',
                    [classId, schoolId, streamId || 0]
                );
                feeStructureId = existing[0].id;
            }

            // Delete old column values for this fee structure
            await connection.query(
                'DELETE FROM fee_column_values WHERE fee_structure_id = ?',
                [feeStructureId]
            );

            // Insert new column values
            const colEntries = Object.entries(columns);
            if (colEntries.length > 0) {
                const insertValues = colEntries
                    .filter(([, amt]) => Number(amt) > 0)
                    .map(([colTypeId, amt]) => [feeStructureId, parseInt(colTypeId), Number(amt) || 0]);

                if (insertValues.length > 0) {
                    await connection.query(
                        'INSERT INTO fee_column_values (fee_structure_id, column_type_id, amount) VALUES ?',
                        [insertValues]
                    );
                }
            }

            // Sync: Also update the hardcoded columns in fee_structures table
            try {
                // Get all column_keys for the provided column type IDs
                const colTypeIds = Object.keys(columns).map(id => parseInt(id));
                if (colTypeIds.length > 0) {
                    const [colTypes] = await connection.query(
                        'SELECT id, column_key FROM fee_column_types WHERE id IN (?) AND school_id = ?',
                        [colTypeIds, schoolId]
                    );

                    // First reset all known fee columns to 0
                    const [allCols] = await connection.query(
                        'SELECT column_key FROM fee_column_types WHERE school_id = ? AND is_active = 1',
                        [schoolId]
                    );
                    const resetUpdates = [];
                    for (const col of allCols) {
                        // Check if column exists in fee_structures
                        const [exists] = await connection.query(
                            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'school_erp' AND TABLE_NAME = 'fee_structures' AND COLUMN_NAME = ?`,
                            [col.column_key]
                        );
                        if (exists.length > 0) {
                            resetUpdates.push(`\`${col.column_key}\` = 0`);
                        }
                    }

                    // Then set the actual values
                    const setUpdates = [];
                    for (const ct of colTypes) {
                        const [exists] = await connection.query(
                            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'school_erp' AND TABLE_NAME = 'fee_structures' AND COLUMN_NAME = ?`,
                            [ct.column_key]
                        );
                        if (exists.length > 0) {
                            const amt = Number(columns[ct.id]) || 0;
                            setUpdates.push(`\`${ct.column_key}\` = ${amt}`);
                        }
                    }

                    const allUpdates = [...resetUpdates, ...setUpdates];
                    if (allUpdates.length > 0) {
                        await connection.query(
                            `UPDATE fee_structures SET ${allUpdates.join(', ')} WHERE id = ?`,
                            [feeStructureId]
                        );
                    }
                }
            } catch (syncErr) {
                console.error('Warning: Could not sync hardcoded columns:', syncErr.message);
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: 'Fee structure updated successfully',
                data: {
                    classId,
                    totalFee: total
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Save fee structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/fees/structure/:classId
// @desc    Delete fee structure for a class (school-specific)
// @access  Private (Admin)
router.delete('/fees/structure/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const schoolId = req.user.school_id;

        const [result] = await db.query(
            'DELETE FROM fee_structures WHERE class_id = ? AND school_id = ?',
            [classId, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found for this class'
            });
        }

        res.json({
            success: true,
            message: 'Fee structure deleted successfully'
        });
    } catch (error) {
        console.error('Delete fee structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


// ===============================================
// FEE COLUMN TYPES MANAGEMENT ROUTES
// ===============================================

// Helper: ensure default fee columns exist for a school (ONLY if none exist yet)
const ensureDefaultFeeColumns = async (schoolId) => {
    // Check if this school already has ANY columns (including previously deleted ones)
    const [existing] = await db.query(
        'SELECT COUNT(*) as cnt FROM fee_column_types WHERE school_id = ?',
        [schoolId]
    );
    // Only seed defaults if this school has never had any columns
    if (existing[0].cnt > 0) return;

    const defaults = [
        { key: 'tuition_fee', name: 'Tuition', order: 1 },
        { key: 'library_fee', name: 'Library', order: 2 },
        { key: 'sports_fee', name: 'Sports', order: 3 },
        { key: 'lab_fee', name: 'Lab', order: 4 },
        { key: 'exam_fee', name: 'Exam', order: 5 },
        { key: 'transport_fee', name: 'Transport', order: 6 },
        { key: 'hostel_fee', name: 'Hostel', order: 7 },
        { key: 'misc_fee', name: 'Misc', order: 8 },
    ];
    for (const d of defaults) {
        await db.query(
            `INSERT IGNORE INTO fee_column_types (school_id, column_key, display_name, sort_order) VALUES (?, ?, ?, ?)`,
            [schoolId, d.key, d.name, d.order]
        );
    }
};

// @route   GET /api/admin/fees/columns
// @desc    Get all fee column types for this school
// @access  Private (Admin)
router.get('/fees/columns', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Ensure defaults exist (only seeds on first-ever request for this school)
        await ensureDefaultFeeColumns(schoolId);

        const [columns] = await db.query(
            'SELECT id, column_key, display_name, sort_order, is_active FROM fee_column_types WHERE school_id = ? AND is_active = 1 ORDER BY sort_order ASC',
            [schoolId]
        );

        res.json({ success: true, data: columns });
    } catch (error) {
        console.error('Get fee columns error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/fees/columns
// @desc    Add a new fee column type
// @access  Private (Admin)
router.post('/fees/columns', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { displayName } = req.body;

        if (!displayName || !displayName.trim()) {
            return res.status(400).json({ success: false, message: 'Column name is required' });
        }

        // Generate a unique column_key from display name
        const columnKey = displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_fee';

        // Get max sort_order
        const [maxOrder] = await db.query(
            'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM fee_column_types WHERE school_id = ?',
            [schoolId]
        );

        const [result] = await db.query(
            'INSERT INTO fee_column_types (school_id, column_key, display_name, sort_order) VALUES (?, ?, ?, ?)',
            [schoolId, columnKey, displayName.trim(), maxOrder[0].max_order + 1]
        );

        // Sync: Add the column to fee_structures table if it doesn't exist
        try {
            const [colCheck] = await db.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'school_erp' AND TABLE_NAME = 'fee_structures' AND COLUMN_NAME = ?`,
                [columnKey]
            );
            if (colCheck.length === 0) {
                await db.query(`ALTER TABLE fee_structures ADD COLUMN \`${columnKey}\` DECIMAL(10,2) DEFAULT 0.00`);
                console.log(`✅ Added column '${columnKey}' to fee_structures table`);
            }
        } catch (alterErr) {
            console.error(`Warning: Could not add column '${columnKey}' to fee_structures:`, alterErr.message);
        }

        res.json({
            success: true,
            message: 'Fee column added successfully',
            data: { id: result.insertId, column_key: columnKey, display_name: displayName.trim(), sort_order: maxOrder[0].max_order + 1 }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'A column with this name already exists' });
        }
        console.error('Add fee column error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/fees/columns/:id
// @desc    Edit (rename) a fee column type
// @access  Private (Admin)
router.put('/fees/columns/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { displayName } = req.body;

        if (!displayName || !displayName.trim()) {
            return res.status(400).json({ success: false, message: 'Column name is required' });
        }

        const [result] = await db.query(
            'UPDATE fee_column_types SET display_name = ? WHERE id = ? AND school_id = ?',
            [displayName.trim(), id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Column not found' });
        }

        res.json({ success: true, message: 'Fee column updated successfully' });
    } catch (error) {
        console.error('Update fee column error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/fees/columns/:id
// @desc    Delete a fee column type (cascades to fee_column_values)
// @access  Private (Admin)
router.delete('/fees/columns/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        console.log('Delete fee column request:', { id, schoolId });

        // Get the column_key BEFORE deleting (needed for ALTER TABLE)
        const [colInfo] = await db.query(
            'SELECT column_key FROM fee_column_types WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );
        const columnKey = colInfo.length > 0 ? colInfo[0].column_key : null;

        // Get all fee_structure_ids that have values for this column (before deletion)
        const [affected] = await db.query(
            `SELECT DISTINCT fcv.fee_structure_id 
             FROM fee_column_values fcv 
             WHERE fcv.column_type_id = ? 
             AND fcv.fee_structure_id IN (SELECT id FROM fee_structures WHERE school_id = ?)`,
            [id, schoolId]
        );

        console.log('Affected fee structures:', affected.length);

        // Delete the column type (ON DELETE CASCADE handles fee_column_values)
        const [result] = await db.query(
            'DELETE FROM fee_column_types WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        console.log('Delete result:', result.affectedRows);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Column not found' });
        }

        // Sync: Drop the column from fee_structures table if it exists
        if (columnKey) {
            try {
                const [colCheck] = await db.query(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'school_erp' AND TABLE_NAME = 'fee_structures' AND COLUMN_NAME = ?`,
                    [columnKey]
                );
                if (colCheck.length > 0) {
                    await db.query(`ALTER TABLE fee_structures DROP COLUMN \`${columnKey}\``);
                    console.log(`✅ Dropped column '${columnKey}' from fee_structures table`);
                }
            } catch (alterErr) {
                console.error(`Warning: Could not drop column '${columnKey}' from fee_structures:`, alterErr.message);
            }
        }

        // Recalculate total_fee for each affected fee_structure
        for (const row of affected) {
            await db.query(
                `UPDATE fee_structures SET total_fee = (
                    SELECT COALESCE(SUM(fcv.amount), 0) FROM fee_column_values fcv WHERE fcv.fee_structure_id = ?
                ) WHERE id = ?`,
                [row.fee_structure_id, row.fee_structure_id]
            );
        }

        res.json({ success: true, message: 'Fee column deleted successfully' });
    } catch (error) {
        console.error('Delete fee column error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});


// ===============================================
// EVENTS MANAGEMENT ROUTES
// ===============================================

// @route   GET /api/admin/events
// @desc    Get all events for the school
// @access  Private (Admin)
router.get('/events', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { status } = req.query;

        let query = `SELECT * FROM events WHERE school_id = ? `;
        const params = [schoolId];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY event_date DESC';

        const [events] = await db.query(query, params);

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/events/:id
// @desc    Get single event by ID
// @access  Private (Admin)
router.get('/events/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        const [events] = await db.query(
            'SELECT * FROM events WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event: events[0]
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/events
// @desc    Create a new event
// @access  Private (Admin)
router.post('/events', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { title, description, event_date, event_time, location, priority, status } = req.body;

        if (!title || !event_date) {
            return res.status(400).json({
                success: false,
                message: 'Title and event date are required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO events(school_id, title, description, event_date, event_time, location, priority, status, created_by)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                schoolId,
                title,
                description || null,
                event_date,
                event_time || null,
                location || null,
                priority || 'medium',
                status || 'active',
                req.user.id
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            eventId: result.insertId
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/events/:id
// @desc    Update an event
// @access  Private (Admin)
router.put('/events/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { title, description, event_date, event_time, location, priority, status } = req.body;

        const updates = [];
        const params = [];

        if (title) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (event_date) { updates.push('event_date = ?'); params.push(event_date); }
        if (event_time !== undefined) { updates.push('event_time = ?'); params.push(event_time); }
        if (location !== undefined) { updates.push('location = ?'); params.push(location); }
        if (priority) { updates.push('priority = ?'); params.push(priority); }
        if (status) { updates.push('status = ?'); params.push(status); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided for update'
            });
        }

        updates.push('updated_at = NOW()');
        params.push(id, schoolId);

        const [result] = await db.query(
            `UPDATE events SET ${updates.join(', ')} WHERE id = ? AND school_id = ? `,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully'
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/events/:id
// @desc    Delete an event
// @access  Private (Admin)
router.delete('/events/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM events WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ===============================================
// NOTICES MANAGEMENT ROUTES
// ===============================================

// @route   GET /api/admin/notices
// @desc    Get all notices for the school
// @access  Private (Admin)
router.get('/notices', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { is_active } = req.query;

        let query = `SELECT * FROM notices WHERE school_id = ? `;
        const params = [schoolId];

        if (is_active !== undefined && is_active !== 'all') {
            query += ' AND is_active = ?';
            params.push(is_active === 'true' || is_active === '1');
        }

        query += ' ORDER BY publish_date DESC';

        const [notices] = await db.query(query, params);

        res.json({
            success: true,
            notices
        });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/notices/:id
// @desc    Get single notice by ID
// @access  Private (Admin)
router.get('/notices/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        const [notices] = await db.query(
            'SELECT * FROM notices WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (notices.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            notice: notices[0]
        });
    } catch (error) {
        console.error('Get notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/notices
// @desc    Create a new notice
// @access  Private (Admin)
router.post('/notices', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { title, description, publish_date, expiry_date, priority, target_audience, is_active } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO notices(school_id, title, description, publish_date, expiry_date, priority, target_audience, is_active, created_by)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                schoolId,
                title,
                description || null,
                publish_date || new Date().toISOString().split('T')[0],
                expiry_date || null,
                priority || 'medium',
                target_audience || 'all',
                is_active !== undefined ? is_active : true,
                req.user.id
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            noticeId: result.insertId
        });
    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/notices/:id
// @desc    Update a notice
// @access  Private (Admin)
router.put('/notices/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { title, description, publish_date, expiry_date, priority, target_audience, is_active } = req.body;

        const updates = [];
        const params = [];

        if (title) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (publish_date) { updates.push('publish_date = ?'); params.push(publish_date); }
        if (expiry_date !== undefined) { updates.push('expiry_date = ?'); params.push(expiry_date); }
        if (priority) { updates.push('priority = ?'); params.push(priority); }
        if (target_audience) { updates.push('target_audience = ?'); params.push(target_audience); }
        if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided for update'
            });
        }

        updates.push('updated_at = NOW()');
        params.push(id, schoolId);

        const [result] = await db.query(
            `UPDATE notices SET ${updates.join(', ')} WHERE id = ? AND school_id = ? `,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            message: 'Notice updated successfully'
        });
    } catch (error) {
        console.error('Update notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/notices/:id
// @desc    Delete a notice
// @access  Private (Admin)
router.delete('/notices/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM notices WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            message: 'Notice deleted successfully'
        });
    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


// ===============================================
// STUDENT PHOTO MANAGEMENT ROUTES
// ===============================================

// @route   POST /api/admin/students/:id/photo
// @desc    Upload or update student photo
// @access  Private (Admin)
router.post('/students/:id/photo', uploadStudentPhoto.single('photo'), async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file provided'
            });
        }

        // Verify student belongs to this school
        const [students] = await db.query(
            'SELECT id, photo_path FROM students WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        if (students.length === 0) {
            // Delete uploaded file if student not found
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete old photo if exists
        const oldPhotoPath = students[0].photo_path;
        if (oldPhotoPath) {
            const oldFilePath = path.join(__dirname, '..', oldPhotoPath);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Store relative path
        const photoPath = `/upload/student_photos/${req.file.filename}`;

        // Update database
        await db.query(
            'UPDATE students SET photo_path = ? WHERE id = ? AND school_id = ?',
            [photoPath, studentId, schoolId]
        );

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo_path: photoPath
        });
    } catch (error) {
        console.error('Upload student photo error:', error);
        // Clean up file on error
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/students/:id/photo
// @desc    Get student photo
// @access  Private (Admin)
router.get('/students/:id/photo', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT photo_path FROM students WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const photoPath = students[0].photo_path;
        if (!photoPath) {
            return res.status(404).json({
                success: false,
                message: 'No photo available'
            });
        }

        const filePath = path.join(__dirname, '..', photoPath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Photo file not found'
            });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Get student photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/students/:id/photo
// @desc    Delete student photo
// @access  Private (Admin)
router.delete('/students/:id/photo', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT photo_path FROM students WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const photoPath = students[0].photo_path;
        if (photoPath) {
            const filePath = path.join(__dirname, '..', photoPath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query(
            'UPDATE students SET photo_path = NULL WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Delete student photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


// ===============================================
// TEACHER PHOTO MANAGEMENT ROUTES
// ===============================================

// @route   POST /api/admin/teachers/:id/photo
// @desc    Upload or update teacher photo
// @access  Private (Admin)
router.post('/teachers/:id/photo', uploadTeacherPhoto.single('photo'), async (req, res) => {
    try {
        const teacherId = req.params.id;
        const schoolId = req.user.school_id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file provided'
            });
        }

        // Verify teacher belongs to this school
        const [teachers] = await db.query(
            'SELECT id, photo_path FROM teachers WHERE id = ? AND school_id = ?',
            [teacherId, schoolId]
        );

        if (teachers.length === 0) {
            // Delete uploaded file if teacher not found
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Delete old photo if exists
        const oldPhotoPath = teachers[0].photo_path;
        if (oldPhotoPath) {
            const oldFilePath = path.join(__dirname, '..', oldPhotoPath);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Store relative path
        const photoPath = `/upload/teacher_photos/${req.file.filename}`;

        // Update database
        await db.query(
            'UPDATE teachers SET photo_path = ? WHERE id = ? AND school_id = ?',
            [photoPath, teacherId, schoolId]
        );

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo_path: photoPath
        });
    } catch (error) {
        console.error('Upload teacher photo error:', error);
        // Clean up file on error
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/teachers/:id/photo
// @desc    Get teacher photo
// @access  Private (Admin)
router.get('/teachers/:id/photo', async (req, res) => {
    try {
        const teacherId = req.params.id;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT photo_path FROM teachers WHERE id = ? AND school_id = ?',
            [teacherId, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const photoPath = teachers[0].photo_path;
        if (!photoPath) {
            return res.status(404).json({
                success: false,
                message: 'No photo available'
            });
        }

        const filePath = path.join(__dirname, '..', photoPath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Photo file not found'
            });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Get teacher photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/teachers/:id/photo
// @desc    Delete teacher photo
// @access  Private (Admin)
router.delete('/teachers/:id/photo', async (req, res) => {
    try {
        const teacherId = req.params.id;
        const schoolId = req.user.school_id;

        const [teachers] = await db.query(
            'SELECT photo_path FROM teachers WHERE id = ? AND school_id = ?',
            [teacherId, schoolId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const photoPath = teachers[0].photo_path;
        if (photoPath) {
            const filePath = path.join(__dirname, '..', photoPath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query(
            'UPDATE teachers SET photo_path = NULL WHERE id = ? AND school_id = ?',
            [teacherId, schoolId]
        );

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Delete teacher photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


// ===============================================
// CLASS-SECTIONS AND CLASS-SUBJECTS MANAGEMENT
// ===============================================

// @route   GET /api/admin/classes
// @desc    Get all classes for the school
// @access  Private (Admin)
router.get('/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [classes] = await db.query(
            'SELECT id, name, class_number, description FROM classes WHERE school_id = ? ORDER BY class_number',
            [schoolId]
        );
        res.json({ success: true, classes });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/sections
// @desc    Get all sections for the school
// @access  Private (Admin)
router.get('/sections', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [sections] = await db.query(
            'SELECT id, name, code, description FROM sections WHERE school_id = ? ORDER BY name',
            [schoolId]
        );
        res.json({ success: true, sections });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/subjects
// @desc    Get all subjects for the school
// @access  Private (Admin)
router.get('/subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [subjects] = await db.query(
            'SELECT id, name, code, description FROM subjects WHERE school_id = ? ORDER BY name',
            [schoolId]
        );
        res.json({ success: true, subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/class-sections/:classId
// @desc    Get sections assigned to a specific class
// @access  Private (Admin)
router.get('/class-sections/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const classId = req.params.classId;
        const streamId = req.query.stream_id;

        let query = `
            SELECT cs.id as mapping_id, cs.class_id, cs.section_id, cs.stream_id,
            s.name as section_name, s.code as section_code
            FROM class_sections cs
            JOIN sections s ON cs.section_id = s.id
            WHERE cs.school_id = ? AND cs.class_id = ?
        `;
        const params = [schoolId, classId];

        if (streamId && streamId !== 'undefined' && streamId !== 'null') {
            query += ` AND cs.stream_id = ?`;
            params.push(streamId);
        }

        query += ` ORDER BY s.name`;

        const [sections] = await db.query(query, params);

        res.json({ success: true, sections });
    } catch (error) {
        console.error('Get class sections error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/class-sections
// @desc    Assign a section to a class
// @access  Private (Admin)
router.post('/class-sections', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, section_id, stream_id } = req.body;

        if (!class_id || !section_id) {
            return res.status(400).json({ success: false, message: 'class_id and section_id are required' });
        }

        // Clean up orphaned class_sections where the section no longer exists
        await db.query(
            `DELETE FROM class_sections WHERE school_id = ? AND class_id = ?
            AND section_id NOT IN(SELECT id FROM sections WHERE school_id = ?)`,
            [schoolId, class_id, schoolId]
        );

        // Check if already exists (include stream_id in duplicate check)
        let dupQuery = 'SELECT id FROM class_sections WHERE school_id = ? AND class_id = ? AND section_id = ?';
        let dupParams = [schoolId, class_id, section_id];
        if (stream_id) {
            dupQuery += ' AND stream_id = ?';
            dupParams.push(stream_id);
        } else {
            dupQuery += ' AND stream_id IS NULL';
        }
        const [existing] = await db.query(dupQuery, dupParams);

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Section already assigned to this class/group' });
        }

        await db.query(
            'INSERT INTO class_sections (school_id, class_id, section_id, stream_id) VALUES (?, ?, ?, ?)',
            [schoolId, class_id, section_id, stream_id || null]
        );

        res.json({ success: true, message: 'Section assigned successfully' });
    } catch (error) {
        console.error('Add class section error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/class-sections/:id
// @desc    Remove a section from a class
// @access  Private (Admin)
router.delete('/class-sections/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const id = req.params.id;

        await db.query(
            'DELETE FROM class_sections WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        res.json({ success: true, message: 'Section removed from class successfully' });
    } catch (error) {
        console.error('Delete class section error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/class-sections-by-params
// @desc    Unassign a section from a class using query params
// @access  Private (Admin)
router.delete('/class-sections-by-params', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, section_id } = req.query;

        if (!class_id || !section_id) {
            return res.status(400).json({ success: false, message: 'Class ID and Section ID are required' });
        }

        console.log(`Fallback unassign section. Class: ${class_id}, Section: ${section_id}`);

        await db.query(
            'DELETE FROM class_sections WHERE class_id = ? AND section_id = ? AND school_id = ?',
            [class_id, section_id, schoolId]
        );

        res.json({ success: true, message: 'Section unassigned successfully (fallback)' });
    } catch (error) {
        console.error('Fallback unassign section error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/class-subjects/:classId
// @desc    Get subjects assigned to a specific class
// @access  Private (Admin)
router.get('/class-subjects/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const classId = req.params.classId;

        const [subjects] = await db.query(`
            SELECT cs.id as mapping_id, cs.class_id, cs.subject_id, cs.is_mandatory,
            s.name as subject_name, s.code as subject_code
            FROM class_subjects cs
            JOIN subjects s ON cs.subject_id = s.id
            WHERE cs.school_id = ? AND cs.class_id = ?
            ORDER BY s.name
        `, [schoolId, classId]);

        res.json({ success: true, subjects });
    } catch (error) {
        console.error('Get class subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/class-subjects
// @desc    Assign a subject to a class
// @access  Private (Admin)
router.post('/class-subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, subject_id, stream_id, is_mandatory = 1 } = req.body;

        if (!class_id || !subject_id) {
            return res.status(400).json({ success: false, message: 'class_id and subject_id are required' });
        }

        // Check if already exists (include stream_id in uniqueness check)
        const [existing] = await db.query(
            'SELECT id FROM class_subjects WHERE school_id = ? AND class_id = ? AND subject_id = ? AND (stream_id = ? OR (stream_id IS NULL AND ? IS NULL))',
            [schoolId, class_id, subject_id, stream_id || null, stream_id || null]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Subject already assigned to this class/stream' });
        }

        await db.query(
            'INSERT INTO class_subjects (school_id, class_id, subject_id, stream_id, is_mandatory) VALUES (?, ?, ?, ?, ?)',
            [schoolId, class_id, subject_id, stream_id || null, is_mandatory]
        );

        res.json({ success: true, message: 'Subject assigned to class successfully' });
    } catch (error) {
        console.error('Add class subject error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/class-subjects/:id
// @desc    Remove a subject from a class
// @access  Private (Admin)
router.delete('/class-subjects/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const id = req.params.id;

        await db.query(
            'DELETE FROM class_subjects WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        res.json({ success: true, message: 'Subject removed from class successfully' });
    } catch (error) {
        console.error('Delete class subject error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});



// ==================== TEACHER LEAVE MANAGEMENT ROUTES ====================

// @route   GET /api/admin/teacher-leaves
// @desc    Get all teacher leave requests
// @access  Private (Admin)
router.get('/teacher-leaves', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [leaves] = await db.query(
            `SELECT l.*, u.name as teacher_name, u.email
             FROM teacher_leaves l
             JOIN teachers t ON l.teacher_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE l.school_id = ?
            ORDER BY l.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, leaves });
    } catch (error) {
        console.error('Get teacher leaves error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/teacher-leaves/:id
// @desc    Approve or Reject teacher leave
// @access  Private (Admin)
router.put('/teacher-leaves/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const schoolId = req.user.school_id;
        const leaveId = req.params.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await db.query(
            'UPDATE teacher_leaves SET status = ? WHERE id = ? AND school_id = ?',
            [status, leaveId, schoolId]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave request not found' });

        res.json({ success: true, message: `Leave ${status} ` });
    } catch (error) {
        console.error('Update teacher leave error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==================== FORMS MANAGEMENT ROUTES ====================

// CONFIG FOR FORM UPLOADS
const formStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'upload/forms/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'form-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadForm = multer({ storage: formStorage });

// @route   POST /api/admin/forms
// @desc    Add a new form
// @access  Private (Admin)
router.post('/forms', uploadForm.single('file'), async (req, res) => {
    try {
        const { title, description, category, type, link_url } = req.body;
        const schoolId = req.user.school_id;
        let filePath = null;

        if (type === 'File') {
            if (!req.file) return res.status(400).json({ message: 'File is required' });
            filePath = `/ upload / forms / ${req.file.filename} `;
        } else if (type === 'Link') {
            if (!link_url) return res.status(400).json({ message: 'Link URL is required' });
        }

        const [result] = await db.query(
            'INSERT INTO forms (school_id, title, description, category, type, file_path, link_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [schoolId, title, description, category, type, filePath, link_url]
        );

        res.status(201).json({ success: true, message: 'Form added successfully', formId: result.insertId });
    } catch (error) {
        console.error('Add form error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/forms
// @desc    Get all forms
// @access  Private (Admin)
router.get('/forms', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [forms] = await db.query('SELECT * FROM forms WHERE school_id = ? ORDER BY created_at DESC', [schoolId]);
        res.json({ success: true, forms });
    } catch (error) {
        console.error('Get forms error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/forms/:id
// @desc    Update a form
// @access  Private (Admin)
router.put('/forms/:id', uploadForm.single('file'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const formId = req.params.id;
        const { title, description, category, type, link_url } = req.body;

        // Check if form exists
        const [forms] = await db.query('SELECT * FROM forms WHERE id = ? AND school_id = ?', [formId, schoolId]);
        if (forms.length === 0) return res.status(404).json({ message: 'Form not found' });
        const existingForm = forms[0];

        let filePath = existingForm.file_path; // Default to existing path

        // Handle File Update
        if (type === 'File' && req.file) {
            // Delete old file if it exists
            if (existingForm.file_path) {
                const oldFilePath = path.join(__dirname, '..', existingForm.file_path);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }
            filePath = `/ upload / forms / ${req.file.filename} `;
        } else if (type === 'Link') {
            filePath = null; // Clear file path if switching to Link
            if (existingForm.file_path) {
                const oldFilePath = path.join(__dirname, '..', existingForm.file_path);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }
        }

        await db.query(
            'UPDATE forms SET title = ?, description = ?, category = ?, type = ?, file_path = ?, link_url = ? WHERE id = ?',
            [title, description, category, type, filePath, type === 'Link' ? link_url : null, formId]
        );

        res.json({ success: true, message: 'Form updated successfully' });
    } catch (error) {
        console.error('Update form error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/forms/:id
// @desc    Delete a form
// @access  Private (Admin)
router.delete('/forms/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const formId = req.params.id;

        const [forms] = await db.query('SELECT * FROM forms WHERE id = ? AND school_id = ?', [formId, schoolId]);
        if (forms.length === 0) return res.status(404).json({ message: 'Form not found' });

        const form = forms[0];
        if (form.type === 'File' && form.file_path) {
            const filePath = path.join(__dirname, '..', form.file_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM forms WHERE id = ?', [formId]);
        res.json({ success: true, message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Delete form error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== MULTER CONFIG FOR STUDENT CARDS ====================
const cardsDir = path.join(__dirname, '..', 'upload', 'student_cards');

if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
}

const cardStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, cardsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `card - ${req.body.student_id} -${uniqueSuffix}${ext} `);
    }
});

const uploadCard = multer({
    storage: cardStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Images and PDF allowed.'), false);
        }
    }
});

// ==================== PRINCIPAL SIGNATURE ROUTES ====================

// @route   POST /api/admin/signature
// @desc    Upload principal signature
// @access  Private (Admin)
router.post('/signature', authMiddleware, fetchSchoolNameForSignature, uploadSignature.single('signature'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Signature image is required' });
        }

        const signaturePath = `/upload/signature/${req.file.filename}`;

        // Delete old signature file if exists
        try {
            const [school] = await db.query('SELECT principal_signature FROM schools WHERE id = ?', [schoolId]);
            if (school.length > 0 && school[0].principal_signature) {
                const oldFilePath = path.join(__dirname, '..', school[0].principal_signature);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        } catch (delErr) {
            console.error('Old signature cleanup error (non-fatal):', delErr);
        }

        await db.query('UPDATE schools SET principal_signature = ? WHERE id = ?', [signaturePath, schoolId]);

        console.log(`✅ Signature uploaded successfully: ${signaturePath} for school ${schoolId}`);
        res.json({ success: true, message: 'Signature uploaded successfully', signature_path: signaturePath });
    } catch (error) {
        console.error('❌ Signature upload error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error during signature upload' });
    }
});

// @route   GET /api/admin/signature
// @desc    Get current principal signature
// @access  Private (Admin)
router.get('/signature', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [school] = await db.query('SELECT principal_signature FROM schools WHERE id = ?', [schoolId]);

        res.json({
            success: true,
            signature_path: school.length > 0 ? school[0].principal_signature : null
        });
    } catch (error) {
        console.error('Get signature error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/signature
// @desc    Remove current principal signature
// @access  Private (Admin)
router.delete('/signature', authMiddleware, async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get current signature path
        const [school] = await db.query('SELECT principal_signature FROM schools WHERE id = ?', [schoolId]);

        if (school.length > 0 && school[0].principal_signature) {
            const signaturePath = school[0].principal_signature;
            const absolutePath = path.join(__dirname, '..', signaturePath);

            // 2. Delete file from filesystem if it exists
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }

            // 3. Update database
            await db.query('UPDATE schools SET principal_signature = NULL WHERE id = ?', [schoolId]);

            res.json({ success: true, message: 'Signature removed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'No signature found to remove' });
        }
    } catch (error) {
        console.error('Remove signature error:', error);
        res.status(500).json({ success: false, message: 'Server error during signature removal' });
    }
});

// @route   GET /api/admin/cards/next-number
// @desc    Get the next available student card number for preview
// @access  Private (Admin)
router.get('/cards/next-number', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { streamCode } = req.query;
        const year = new Date().getFullYear();

        const codePart = streamCode ? streamCode.toUpperCase() : '';
        const prefix = `${schoolId}STU${codePart}${year}`;

        const [maxRows] = await db.query(
            `SELECT card_number FROM student_cards WHERE school_id = ? AND card_number LIKE ? ORDER BY card_number DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0 && maxRows[0].card_number) {
            const lastSeqStr = maxRows[0].card_number.replace(prefix, '');
            const lastSeq = parseInt(lastSeqStr, 10);
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const nextNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
        res.json({ success: true, nextNumber });
    } catch (error) {
        console.error('Fetch next student card number error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/cards
// @desc    Create a card record for a student with auto-generated card_number
// @access  Private (Admin)
router.post('/cards', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { student_id, title, card_type, streamCode } = req.body;

        if (!student_id || !card_type) {
            return res.status(400).json({ success: false, message: 'Student ID and card type are required' });
        }

        // Check if card already issued for this student and card_type
        const [existingCard] = await db.query(
            'SELECT id FROM student_cards WHERE student_id = ? AND card_type = ? AND school_id = ?',
            [student_id, card_type, schoolId]
        );
        if (existingCard.length > 0) {
            return res.status(400).json({ success: false, message: `${card_type} already issued for this student` });
        }

        // Auto-generate card_number: SCHOOLIDSTU(STREAM)yearSEQUENCE (no hyphens)
        const year = new Date().getFullYear();
        const codePart = streamCode ? streamCode.toUpperCase() : '';
        const prefix = `${schoolId}STU${codePart}${year}`;

        // Get the max existing sequence for this school and year
        const [maxRows] = await db.query(
            `SELECT card_number FROM student_cards WHERE school_id = ? AND card_number LIKE ? ORDER BY card_number DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0 && maxRows[0].card_number) {
            const lastSeqStr = maxRows[0].card_number.replace(prefix, '');
            const lastSeq = parseInt(lastSeqStr, 10);
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const cardNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;

        await db.query(
            'INSERT INTO student_cards (school_id, student_id, card_type, title, card_number) VALUES (?, ?, ?, ?, ?)',
            [schoolId, student_id, card_type, title, cardNumber]
        );

        res.json({ success: true, message: 'Card issued successfully', card_number: cardNumber });
    } catch (error) {
        console.error('Upload card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/cards
// @desc    Get all distributed cards
// @access  Private (Admin)
router.get('/cards', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [cards] = await db.query(
            `SELECT sc.*, s.roll_no, s.student_name, s.class as class_name, s.section as section_name,
                    s.father_name, s.mother_name, s.date_of_birth as dob, s.phone, s.address, s.photo_path as student_photo
             FROM student_cards sc
             JOIN students s ON sc.student_id = s.id
             WHERE sc.school_id = ?
            ORDER BY sc.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, cards });
    } catch (error) {
        console.error('Get cards error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// @route   PUT /api/admin/cards/:id
// @desc    Update a card (type, title)
// @access  Private (Admin)
router.put('/cards/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const cardId = req.params.id;
        const { card_type, title } = req.body;

        const [existing] = await db.query('SELECT * FROM student_cards WHERE id = ? AND school_id = ?', [cardId, schoolId]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });

        await db.query(
            'UPDATE student_cards SET card_type = ?, title = ? WHERE id = ? AND school_id = ?',
            [card_type || existing[0].card_type, title || existing[0].title, cardId, schoolId]
        );

        res.json({ success: true, message: 'Card updated successfully' });
    } catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/cards/:id
// @desc    Delete a card
// @access  Private (Admin)
router.delete('/cards/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const cardId = req.params.id;

        const [cards] = await db.query('SELECT * FROM student_cards WHERE id = ? AND school_id = ?', [cardId, schoolId]);
        if (cards.length === 0) return res.status(404).json({ message: 'Card not found' });

        await db.query('DELETE FROM student_cards WHERE id = ?', [cardId]);

        res.json({ success: true, message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// TEACHER PAYSLIPS
// ============================================================

const payslipsDir = path.join(__dirname, '..', 'upload', 'teacher_payslips');
if (!fs.existsSync(payslipsDir)) {
    fs.mkdirSync(payslipsDir, { recursive: true });
}

const payslipStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, payslipsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `payslip-${req.body.teacher_id}-${uniqueSuffix}${ext}`);
    }
});

const uploadPayslip = multer({
    storage: payslipStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Images and PDF allowed.'), false);
        }
    }
});

// @route   POST /api/admin/payslips
// @desc    Upload a payslip for a teacher
// @access  Private (Admin)
router.post('/payslips', uploadPayslip.single('file'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { teacher_id, month, year, title } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        if (!teacher_id || !month || !year) {
            if (file) fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'Teacher, month and year are required' });
        }

        const filePath = `/upload/teacher_payslips/${file.filename}`;

        await db.query(
            'INSERT INTO teacher_payslips (school_id, teacher_id, month, year, title, file_path) VALUES (?, ?, ?, ?, ?, ?)',
            [schoolId, teacher_id, month, year, title || `Payslip ${month} ${year}`, filePath]
        );

        res.json({ success: true, message: 'Payslip uploaded successfully' });
    } catch (error) {
        console.error('Upload payslip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/payslips
// @desc    Get all payslips
// @access  Private (Admin)
router.get('/payslips', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [payslips] = await db.query(
            `SELECT tp.*, t.name as teacher_name, t.employee_id, t.subject
             FROM teacher_payslips tp
             JOIN teachers t ON tp.teacher_id = t.id
             WHERE tp.school_id = ?
            ORDER BY tp.year DESC, tp.month DESC, tp.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, payslips });
    } catch (error) {
        console.error('Get payslips error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/payslips/:id
// @desc    Update a payslip
// @access  Private (Admin)
router.put('/payslips/:id', uploadPayslip.single('file'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const payslipId = req.params.id;
        const { month, year, title } = req.body;

        const [existing] = await db.query('SELECT * FROM teacher_payslips WHERE id = ? AND school_id = ?', [payslipId, schoolId]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Payslip not found' });

        let filePath = existing[0].file_path;

        if (req.file) {
            const oldFilePath = path.join(__dirname, '..', existing[0].file_path);
            if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            filePath = `/upload/teacher_payslips/${req.file.filename}`;
        }

        await db.query(
            'UPDATE teacher_payslips SET month = ?, year = ?, title = ?, file_path = ? WHERE id = ? AND school_id = ?',
            [month || existing[0].month, year || existing[0].year, title || existing[0].title, filePath, payslipId, schoolId]
        );

        res.json({ success: true, message: 'Payslip updated successfully' });
    } catch (error) {
        console.error('Update payslip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/payslips/:id
// @desc    Delete a payslip
// @access  Private (Admin)
router.delete('/payslips/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const payslipId = req.params.id;

        const [payslips] = await db.query('SELECT * FROM teacher_payslips WHERE id = ? AND school_id = ?', [payslipId, schoolId]);
        if (payslips.length === 0) return res.status(404).json({ success: false, message: 'Payslip not found' });

        const payslip = payslips[0];
        const filePath = path.join(__dirname, '..', payslip.file_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query('DELETE FROM teacher_payslips WHERE id = ?', [payslipId]);

        res.json({ success: true, message: 'Payslip deleted successfully' });
    } catch (error) {
        console.error('Delete payslip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/settings/attendance
// @desc    Update school attendance settings (location, radius, time thresholds)
// @access  Private (Admin)
router.post('/settings/attendance', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { latitude, longitude, radius, half_day_hours, full_day_hours, phone, email, city, state, address } = req.body;

        if (!latitude || !longitude || !radius) {
            return res.status(400).json({ success: false, message: 'Location fields are required' });
        }

        // Update schools table for location data, hour thresholds, contact and location information
        await db.query(
            `UPDATE schools SET 
                latitude = ?, 
                longitude = ?, 
                attendance_radius_meters = ?, 
                min_hours_half_day = ?, 
                min_hours_full_day = ?,
                phone = ?,
                email = ?,
                city = ?,
                state = ?,
                address = ?
             WHERE id = ?`,
            [latitude, longitude, radius, half_day_hours || 4, full_day_hours || 6, phone || null, email || null, city || null, state || null, address || null, schoolId]
        );

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/settings/attendance
// @desc    Get school attendance settings
// @access  Private (Admin)
router.get('/settings/attendance', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Fetch all settings from schools table
        const [schoolRows] = await db.query(
            `SELECT * FROM schools WHERE id = ?`,
            [schoolId]
        );

        const settings = {
            school_latitude: schoolRows[0]?.latitude || '',
            school_longitude: schoolRows[0]?.longitude || '',
            attendance_radius: schoolRows[0]?.attendance_radius_meters || '500',
            principal_signature: schoolRows[0]?.principal_signature || null,
            min_hours_half_day: schoolRows[0]?.min_hours_half_day || '4',
            min_hours_full_day: schoolRows[0]?.min_hours_full_day || '6'
        };

        res.json({ success: true, settings, school: schoolRows[0] || null });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== STUDENT ATTENDANCE MODE CONFIG ====================

// @route   GET /api/admin/settings/student-attendance-mode
// @desc    Get current student attendance mode (subject_wise / day_wise)
// @access  Private (Admin)
router.get('/settings/student-attendance-mode', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [rows] = await db.query(
            `SELECT setting_value FROM school_settings WHERE school_id = ? AND setting_key = 'student_attendance_mode'`,
            [schoolId]
        );
        res.json({ success: true, mode: rows.length > 0 ? rows[0].setting_value : 'subject_wise' });
    } catch (error) {
        console.error('Get student attendance mode error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/settings/student-attendance-mode
// @desc    Set student attendance mode
// @access  Private (Admin)
router.post('/settings/student-attendance-mode', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { mode } = req.body;

        if (!['subject_wise', 'day_wise'].includes(mode)) {
            return res.status(400).json({ success: false, message: 'Mode must be subject_wise or day_wise' });
        }

        await db.query(
            `INSERT INTO school_settings(school_id, setting_key, setting_value)
        VALUES(?, 'student_attendance_mode', ?)
             ON DUPLICATE KEY UPDATE setting_value = ? `,
            [schoolId, mode, mode]
        );

        res.json({ success: true, message: `Attendance mode set to ${mode} ` });
    } catch (error) {
        console.error('Set student attendance mode error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== RETENTION FEE POLICIES CONFIG ====================

// @route   GET /api/admin/settings/retention-fee-policies
// @desc    Get current fail and repeat fee policies (require / exempt)
// @access  Private (Admin)
router.get('/settings/retention-fee-policies', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [rows] = await db.query(
            `SELECT setting_key, setting_value FROM school_settings WHERE school_id = ? AND setting_key IN ('fail_fee_policy', 'repeat_fee_policy')`,
            [schoolId]
        );
        let failPolicy = 'require';
        let repeatPolicy = 'require';
        
        rows.forEach(row => {
            if (row.setting_key === 'fail_fee_policy') failPolicy = row.setting_value;
            if (row.setting_key === 'repeat_fee_policy') repeatPolicy = row.setting_value;
        });

        res.json({ success: true, failPolicy, repeatPolicy });
    } catch (error) {
        console.error('Get retention fee policies error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/settings/retention-fee-policies
// @desc    Set fail and repeat fee policies
// @access  Private (Admin)
router.post('/settings/retention-fee-policies', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { failPolicy, repeatPolicy } = req.body;

        if (!['require', 'exempt'].includes(failPolicy) || !['require', 'exempt'].includes(repeatPolicy)) {
            return res.status(400).json({ success: false, message: 'Policies must be require or exempt' });
        }

        await db.query(
            `INSERT INTO school_settings(school_id, setting_key, setting_value)
             VALUES(?, 'fail_fee_policy', ?)
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [schoolId, failPolicy, failPolicy]
        );

        await db.query(
            `INSERT INTO school_settings(school_id, setting_key, setting_value)
             VALUES(?, 'repeat_fee_policy', ?)
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [schoolId, repeatPolicy, repeatPolicy]
        );

        res.json({ success: true, message: `Retention fee policies updated` });
    } catch (error) {
        console.error('Set retention fee policies error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/daywise-attendance-teachers
// @desc    Get all day-wise teacher -> class assignments
// @access  Private (Admin)
router.get('/daywise-attendance-teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [assignments] = await db.query(
            `SELECT dat.id, dat.teacher_id, dat.class_number, dat.section, dat.stream_id,
            t.name as teacher_name, t.employee_id,
            c.name as class_name, sec.name as section_name, st.name as stream_name
             FROM daywise_attendance_teachers dat
             JOIN teachers t ON dat.teacher_id = t.id
             LEFT JOIN classes c ON dat.class_number COLLATE utf8mb4_unicode_ci = c.class_number AND c.school_id = ?
            LEFT JOIN sections sec ON dat.section COLLATE utf8mb4_unicode_ci = sec.code AND sec.school_id = ?
                LEFT JOIN streams st ON dat.stream_id = st.id
             WHERE dat.school_id = ?
            ORDER BY dat.class_number, st.name, dat.section, t.name`,
            [schoolId, schoolId, schoolId]
        );
        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Get daywise teachers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/daywise-attendance-teachers
// @desc    Assign teacher(s) to class(es) for day-wise attendance
// @access  Private (Admin)
router.post('/daywise-attendance-teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { assignments } = req.body;

        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide assignments array' });
        }

        let inserted = 0;
        for (const a of assignments) {
            if (!a.teacher_id || !a.class_number || !a.section) continue;
            try {
                await db.query(
                    `INSERT INTO daywise_attendance_teachers(school_id, teacher_id, class_number, stream_id, section)
        VALUES(?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE id = id`,
                    [schoolId, a.teacher_id, a.class_number, a.stream_id || null, a.section]
                );
                inserted++;
            } catch (e) {
                if (e.code !== 'ER_DUP_ENTRY') throw e;
            }
        }

        res.json({ success: true, message: `${inserted} assignment(s) saved`, inserted });
    } catch (error) {
        console.error('Add daywise teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/daywise-attendance-teachers/:id
// @desc    Remove a teacher -> class assignment
// @access  Private (Admin)
router.delete('/daywise-attendance-teachers/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        await db.query('DELETE FROM daywise_attendance_teachers WHERE id = ? AND school_id = ?', [id, schoolId]);
        res.json({ success: true, message: 'Assignment removed' });
    } catch (error) {
        console.error('Delete daywise teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/attendance/teachers
// @desc    Get teacher attendance stats and list for a specific date
// @access  Private (Admin)
router.get('/attendance/teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Get all teachers
        const [teachers] = await db.query(
            `SELECT id, name, employee_id FROM teachers WHERE school_id = ? `,
            [schoolId]
        );

        // Get attendance for the date
        const [attendance] = await db.query(
            `SELECT * FROM teacher_attendance WHERE school_id = ? AND date = ? `,
            [schoolId, date]
        );

        // Combine data
        const attendanceMap = new Map();
        attendance.forEach(a => attendanceMap.set(a.teacher_id, a));

        // Fetch thresholds from schools table
        const [schoolSettings] = await db.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [schoolId]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

        const result = teachers.map(t => {
            const record = attendanceMap.get(t.id);
            let workingHours = '-';
            let dayType = '-';

            if (record && record.check_in_time && record.check_out_time) {
                try {
                    const [h1, m1, s1] = record.check_in_time.split(':').map(Number);
                    const [h2, m2, s2] = record.check_out_time.split(':').map(Number);

                    if (!isNaN(h1) && !isNaN(h2)) {
                        const startTotalMinutes = (h1 * 60) + m1;
                        const endTotalMinutes = (h2 * 60) + m2;
                        let diffMinutes = endTotalMinutes - startTotalMinutes;

                        if (diffMinutes < 0) diffMinutes += 1440;

                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        workingHours = `${hours}h ${minutes}m`;

                        // Calculate Day Type based on thresholds
                        if (hours >= minFull) dayType = 'Full Day';
                        else if (hours >= minHalf) dayType = 'Half Day';
                        else dayType = 'Below Half Day';
                    }
                } catch (e) {
                    console.error('Error calculating working hours:', e);
                }
            } else if (record && record.check_in_time) {
                dayType = 'In Progress';
            }

            // Normalize Status: Any presence (even 1 min) = "Present"
            let displayStatus = record ? (record.status === 'Absent' ? 'Absent' : 'Present') : 'Absent';
            if (record && record.status === 'Late') displayStatus = 'Late';

            return {
                teacher_id: t.id,
                name: t.name,
                employee_id: t.employee_id,
                attendance_id: record ? record.id : null,
                status: displayStatus,
                check_in: record ? record.check_in_time : '-',
                check_out: record ? record.check_out_time : '-',
                location_verified: record ? !!record.location_verified : false,
                working_hours: workingHours,
                day_type: dayType
            };
        });

        const stats = {
            total: teachers.length,
            present: result.filter(r => r.status === 'Present' || r.status === 'Late').length,
            late: result.filter(r => r.status === 'Late').length,
            half_day: result.filter(r => r.day_type === 'Half Day').length,
            full_day: result.filter(r => r.day_type === 'Full Day').length,
            absent: result.filter(r => r.status === 'Absent').length
        };

        res.json({ success: true, date, stats, attendance: result });
    } catch (error) {
        console.error('Get teacher attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/attendance-report/teachers
// @desc    Get comprehensive teacher attendance report across a date range
// @access  Private (Admin)
router.get('/attendance-report/teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start date and end date are required' });
        }

        // Get all teachers
        const [teachers] = await db.query(
            `SELECT id, name, employee_id, phone FROM teachers WHERE school_id = ?`,
            [schoolId]
        );

        // Get attendance across the date range
        const [attendance] = await db.query(
            `SELECT * FROM teacher_attendance 
             WHERE school_id = ? AND date BETWEEN ? AND ?`,
            [schoolId, startDate, endDate]
        );

        // Fetch thresholds from schools table
        const [schoolSettings] = await db.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [schoolId]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

        // Build report
        const report = teachers.map(teacher => {
            const teacherAttendance = {};
            attendance.filter(a => a.teacher_id === teacher.id).forEach(record => {
                const dateKey = record.date instanceof Date
                    ? `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}-${String(record.date.getDate()).padStart(2, '0')}`
                    : String(record.date).split('T')[0];

                let workingHours = '-';
                let dayType = '-';

                if (record.check_in_time && record.check_out_time) {
                    try {
                        const [h1, m1] = record.check_in_time.split(':').map(Number);
                        const [h2, m2] = record.check_out_time.split(':').map(Number);

                        if (!isNaN(h1) && !isNaN(h2)) {
                            const startMins = (h1 * 60) + (m1 || 0);
                            const endMins = (h2 * 60) + (m2 || 0);
                            let diffMins = endMins - startMins;
                            if (diffMins < 0) diffMins += 1440;

                            const h = Math.floor(diffMins / 60);
                            const m = diffMins % 60;
                            workingHours = `${h}h ${m}m`;

                            if (h >= minFull) dayType = 'Full Day';
                            else if (h >= minHalf) dayType = 'Half Day';
                            else dayType = 'Below Half Day';
                        }
                    } catch (e) { console.error(e); }
                } else if (record.check_in_time) {
                    dayType = 'In Progress';
                }

                let displayStatus = record.status === 'Absent' ? 'Absent' : 'Present';
                if (record.status === 'Late') displayStatus = 'Late';
                if (record.status === 'Half Day' && !record.check_out_time) displayStatus = 'Half Day';

                teacherAttendance[dateKey] = {
                    status: displayStatus,
                    check_in: record.check_in_time,
                    check_out: record.check_out_time,
                    working_hours: workingHours,
                    day_type: dayType
                };
            });

            return {
                teacher_id: teacher.id,
                name: teacher.name,
                employee_id: teacher.employee_id || `TCH-${String(teacher.id).padStart(3, '0')}`,
                phone: teacher.phone,
                attendance: teacherAttendance
            };
        });

        const [holidays] = await db.query(
            `SELECT * FROM holidays WHERE school_id = ?`,
            [schoolId]
        );

        const [weeklySchedule] = await db.query(
            `SELECT * FROM school_weekly_schedule WHERE school_id = ?`,
            [schoolId]
        );

        res.json({ success: true, report, holidays, weekly_schedule: weeklySchedule });
    } catch (error) {
        console.error('Get teacher attendance report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/attendance/manual
// @desc    Manually add or update teacher attendance
// @access  Private (Admin)
router.post('/attendance/manual', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { teacher_id, date, status, check_in, check_out } = req.body;

        if (!teacher_id || !date || !status) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        await db.query(
            `INSERT INTO teacher_attendance
            (school_id, teacher_id, date, status, check_in_time, check_out_time, location_verified)
        VALUES(?, ?, ?, ?, ?, ?, FALSE)
            ON DUPLICATE KEY UPDATE
        status = ?, check_in_time = ?, check_out_time = ? `,
            [
                schoolId, teacher_id, date, status, check_in || null, check_out || null,
                status, check_in || null, check_out || null
            ]
        );

        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Manual attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/nonteaching-staff/attendance-report
// @desc    Get non-teaching staff attendance report for a date range
// @access  Private (Admin)
router.get('/nonteaching-staff/attendance-report', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }

        // Get all non-teaching staff
        const [staffMembers] = await db.query(
            `SELECT id, user_id, name, employee_id, designation, department FROM non_teaching_staff WHERE school_id = ?`,
            [schoolId]
        );

        // Get all attendance records in the date range
        const [attendance] = await db.query(
            `SELECT * FROM non_teaching_staff_attendance WHERE school_id = ? AND date >= ? AND date <= ? ORDER BY date ASC`,
            [schoolId, startDate, endDate]
        );

        // Fetch thresholds from schools table
        const [schoolSettings] = await db.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [schoolId]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

        // Build report: one entry per staff member with attendance map by date
        const report = staffMembers.map(staff => {
            const staffAttendance = {};
            attendance.filter(a => a.user_id === staff.user_id).forEach(record => {
                const dateKey = record.date instanceof Date
                    ? `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}-${String(record.date.getDate()).padStart(2, '0')}`
                    : String(record.date).split('T')[0];

                let workingHours = null;
                let dayType = '-';

                if (record.check_in_time && record.check_out_time) {
                    try {
                        const [h1, m1] = record.check_in_time.split(':').map(Number);
                        const [h2, m2] = record.check_out_time.split(':').map(Number);
                        if (!isNaN(h1) && !isNaN(h2)) {
                            let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
                            if (diffMinutes < 0) diffMinutes += 1440;
                            const hours = Math.floor(diffMinutes / 60);
                            const minutes = diffMinutes % 60;
                            workingHours = `${hours}h ${minutes}m`;
                            if (hours >= minFull) dayType = 'Full Day';
                            else if (hours >= minHalf) dayType = 'Half Day';
                            else dayType = 'Below Half Day';
                        }
                    } catch (e) { /* ignore */ }
                } else if (record.check_in_time) {
                    dayType = 'In Progress';
                }

                let displayStatus = record.status === 'Absent' ? 'Absent' : 'Present';
                if (record.status === 'Late') displayStatus = 'Late';

                staffAttendance[dateKey] = {
                    status: displayStatus,
                    check_in: record.check_in_time || null,
                    check_out: record.check_out_time || null,
                    working_hours: workingHours,
                    day_type: dayType
                };
            });

            return {
                staff_id: staff.id,
                name: staff.name,
                employee_id: staff.employee_id,
                designation: staff.designation || '-',
                department: staff.department || '-',
                attendance: staffAttendance
            };
        });

        res.json({ success: true, report, startDate, endDate });
    } catch (error) {
        console.error('Get non-teaching staff attendance report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/nonteaching-staff/attendance
// @desc    Get non-teaching staff attendance stats and list for a specific date
// @access  Private (Admin)
router.get('/nonteaching-staff/attendance', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Get all non-teaching staff
        const [staffMembers] = await db.query(
            `SELECT id, user_id, name, employee_id FROM non_teaching_staff WHERE school_id = ? `,
            [schoolId]
        );

        // Get attendance for the date
        const [attendance] = await db.query(
            `SELECT * FROM non_teaching_staff_attendance WHERE school_id = ? AND date = ? `,
            [schoolId, date]
        );

        // Combine data
        const attendanceMap = new Map();
        attendance.forEach(a => attendanceMap.set(a.user_id, a));

        // Fetch thresholds from schools table
        const [schoolSettings] = await db.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [schoolId]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

        const result = staffMembers.map(s => {
            const record = attendanceMap.get(s.user_id);
            let workingHours = '-';
            let totalMinutes = 0;
            let dayType = '-';

            if (record && record.check_in_time && record.check_out_time) {
                try {
                    const [h1, m1, s1] = record.check_in_time.split(':').map(Number);
                    const [h2, m2, s2] = record.check_out_time.split(':').map(Number);

                    if (!isNaN(h1) && !isNaN(h2)) {
                        const startTotalMinutes = (h1 * 60) + m1;
                        const endTotalMinutes = (h2 * 60) + m2;
                        let diffMinutes = endTotalMinutes - startTotalMinutes;

                        if (diffMinutes < 0) diffMinutes += 1440;

                        totalMinutes = diffMinutes;
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        workingHours = `${hours}h ${minutes}m`;

                        // Calculate Day Type based on thresholds
                        if (hours >= minFull) dayType = 'Full Day';
                        else if (hours >= minHalf) dayType = 'Half Day';
                        else dayType = 'Below Half Day';
                    }
                } catch (e) {
                    console.error('Error calculating working hours:', e);
                }
            } else if (record && record.check_in_time) {
                dayType = 'In Progress';
            }

            // Normalize Status: If present at all (even 1 min), show as 'Present'
            let displayStatus = record ? (record.status === 'Absent' ? 'Absent' : 'Present') : 'Absent';
            if (record && record.status === 'Late') displayStatus = 'Late';

            return {
                staff_id: s.id,
                name: s.name,
                employee_id: s.employee_id,
                attendance_id: record ? record.id : null,
                status: displayStatus,
                check_in: record ? record.check_in_time : '-',
                check_out: record ? record.check_out_time : '-',
                location_verified: record ? !!record.location_verified : false,
                working_hours: workingHours,
                day_type: dayType
            };
        });

        const stats = {
            total: staffMembers.length,
            present: result.filter(r => r.status === 'Present' || r.status === 'Late').length,
            late: result.filter(r => r.status === 'Late').length,
            half_day: result.filter(r => r.day_type === 'Half Day').length,
            full_day: result.filter(r => r.day_type === 'Full Day').length,
            absent: result.filter(r => r.status === 'Absent').length
        };

        res.json({ success: true, date, stats, attendance: result });
    } catch (error) {
        console.error('Get non-teaching staff attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/nonteaching-staff/attendance/manual
// @desc    Manually add or update non-teaching staff attendance
// @access  Private (Admin)
router.post('/nonteaching-staff/attendance/manual', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { staff_id, date, status, check_in, check_out } = req.body;

        if (!staff_id || !date || !status) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const [staffRows] = await db.query(`SELECT user_id FROM non_teaching_staff WHERE id = ? AND school_id = ?`, [staff_id, schoolId]);
        if (staffRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }
        const user_id = staffRows[0].user_id;

        await db.query(
            `INSERT INTO non_teaching_staff_attendance
            (school_id, user_id, date, status, check_in_time, check_out_time)
        VALUES(?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
        status = ?, check_in_time = ?, check_out_time = ? `,
            [
                schoolId, user_id, date, status, check_in || null, check_out || null,
                status, check_in || null, check_out || null
            ]
        );

        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Manual non-teaching staff attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/driver/attendance
// @desc    Get driver attendance stats and list for a specific date
// @access  Private (Admin)
router.get('/driver/attendance', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Get all drivers
        const [drivers] = await db.query(
            `SELECT u.id, u.name, d.status as driver_status, 
                (SELECT employee_id FROM teachers WHERE user_id = u.id AND school_id = u.school_id) as emp_id_alt,
                u.phone
            FROM users u
            JOIN transport_drivers d ON u.id = d.user_id
            WHERE u.school_id = ? AND u.role = 'driver'`,
            [schoolId]
        );

        // Get attendance for the date
        const [attendance] = await db.query(
            `SELECT * FROM transport_driver_attendance WHERE school_id = ? AND date = ?`,
            [schoolId, date]
        );

        // Combine data
        const attendanceMap = new Map();
        attendance.forEach(a => attendanceMap.set(a.driver_id, a));

        // Fetch thresholds from schools table
        const [schoolSettings] = await db.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [schoolId]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

        const result = drivers.map(d => {
            const record = attendanceMap.get(d.id);
            let workingHours = '-';
            let dayType = '-';

            if (record && record.check_in_time && record.check_out_time) {
                try {
                    const [h1, m1] = record.check_in_time.split(':').map(Number);
                    const [h2, m2] = record.check_out_time.split(':').map(Number);

                    if (!isNaN(h1) && !isNaN(h2)) {
                        const startTotalMinutes = (h1 * 60) + (m1 || 0);
                        const endTotalMinutes = (h2 * 60) + (m2 || 0);
                        let diffMinutes = endTotalMinutes - startTotalMinutes;

                        if (diffMinutes < 0) diffMinutes += 1440;

                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        workingHours = `${hours}h ${minutes}m`;

                        if (hours >= minFull) dayType = 'Full Day';
                        else if (hours >= minHalf) dayType = 'Half Day';
                        else dayType = 'Below Half Day';
                    }
                } catch (e) {
                    console.error('Error calculating working hours:', e);
                }
            } else if (record && record.check_in_time) {
                dayType = 'In Progress';
            }

            let displayStatus = record ? (record.status === 'Absent' ? 'Absent' : 'Present') : 'Absent';
            if (record && record.status === 'Late') displayStatus = 'Late';
            if (record && record.status === 'Half Day' && !record.check_out_time) displayStatus = 'Half Day';

            return {
                driver_id: d.id,
                name: d.name,
                employee_id: d.emp_id_alt || `DRV-${String(d.id).padStart(3, '0')}`,
                status: displayStatus,
                check_in: record ? record.check_in_time : '-',
                check_out: record ? record.check_out_time : '-',
                location_verified: record ? !!record.location_verified : false,
                working_hours: workingHours,
                day_type: dayType
            };
        });

        const stats = {
            total: drivers.length,
            present: result.filter(r => r.status === 'Present' || r.status === 'Late').length,
            late: result.filter(r => r.status === 'Late').length,
            half_day: result.filter(r => r.day_type === 'Half Day' || r.status === 'Half Day').length,
            absent: result.filter(r => r.status === 'Absent').length
        };

        res.json({ success: true, date, stats, attendance: result });
    } catch (error) {
        console.error('Get driver attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/driver/attendance-report
// @desc    Get comprehensive driver attendance report across a date range
// @access  Private (Admin)
router.get('/driver/attendance-report', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start date and end date are required' });
        }

        // Get all drivers
        const [drivers] = await db.query(
            `SELECT u.id, u.name, d.status as driver_status, 
                (SELECT employee_id FROM teachers WHERE user_id = u.id AND school_id = u.school_id) as emp_id_alt,
                u.phone
            FROM users u
            JOIN transport_drivers d ON u.id = d.user_id
            WHERE u.school_id = ? AND u.role = 'driver'`,
            [schoolId]
        );

        // Get attendance across the date range
        const [attendance] = await db.query(
            `SELECT * FROM transport_driver_attendance 
             WHERE school_id = ? AND date BETWEEN ? AND ?`,
            [schoolId, startDate, endDate]
        );

        // Fetch thresholds from schools table
        const [schoolSettings] = await db.query(
            `SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = ?`,
            [schoolId]
        );
        const minHalf = parseFloat(schoolSettings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(schoolSettings[0]?.min_hours_full_day) || 4.0;

        // Build report
        const report = drivers.map(driver => {
            const driverAttendance = {};
            attendance.filter(a => a.driver_id === driver.id).forEach(record => {
                const dateKey = record.date instanceof Date
                    ? `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}-${String(record.date.getDate()).padStart(2, '0')}`
                    : String(record.date).split('T')[0];

                let workingHours = '-';
                let dayType = '-';

                if (record.check_in_time && record.check_out_time) {
                    try {
                        const [h1, m1] = record.check_in_time.split(':').map(Number);
                        const [h2, m2] = record.check_out_time.split(':').map(Number);

                        if (!isNaN(h1) && !isNaN(h2)) {
                            const startMins = (h1 * 60) + (m1 || 0);
                            const endMins = (h2 * 60) + (m2 || 0);
                            let diffMins = endMins - startMins;
                            if (diffMins < 0) diffMins += 1440;

                            const h = Math.floor(diffMins / 60);
                            const m = diffMins % 60;
                            workingHours = `${h}h ${m}m`;

                            if (h >= minFull) dayType = 'Full Day';
                            else if (h >= minHalf) dayType = 'Half Day';
                            else dayType = 'Below Half Day';
                        }
                    } catch (e) { console.error(e); }
                } else if (record.check_in_time) {
                    dayType = 'In Progress';
                }

                let displayStatus = record.status === 'Absent' ? 'Absent' : 'Present';
                if (record.status === 'Late') displayStatus = 'Late';
                if (record.status === 'Half Day' && !record.check_out_time) displayStatus = 'Half Day';

                driverAttendance[dateKey] = {
                    status: displayStatus,
                    check_in: record.check_in_time,
                    check_out: record.check_out_time,
                    working_hours: workingHours,
                    day_type: dayType
                };
            });

            return {
                driver_id: driver.id,
                name: driver.name,
                employee_id: driver.emp_id_alt || `DRV-${String(driver.id).padStart(3, '0')}`,
                phone: driver.phone,
                attendance: driverAttendance
            };
        });

        res.json({ success: true, report });
    } catch (error) {
        console.error('Get driver attendance report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/driver/attendance/manual
// @desc    Manually add or update driver attendance
// @access  Private (Admin)
router.post('/driver/attendance/manual', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { driver_id, date, status, check_in, check_out } = req.body;

        if (!driver_id || !date || !status) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        await db.query(
            `INSERT INTO transport_driver_attendance
                (school_id, driver_id, date, status, check_in_time, check_out_time, location_verified)
            VALUES(?, ?, ?, ?, ?, ?, FALSE)
            ON DUPLICATE KEY UPDATE
                status = ?, check_in_time = ?, check_out_time = ?`,
            [
                schoolId, driver_id, date, status, check_in || null, check_out || null,
                status, check_in || null, check_out || null
            ]
        );

        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Manual driver attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// ACADEMIC MANAGEMENT (Classes, Sections, Subjects)
// ============================================================

// --- CLASSES ---

// @route   GET /api/admin/classes
// @desc    Get all classes
// @access  Private (Admin)
router.get('/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [classes] = await db.query(
            'SELECT * FROM classes WHERE school_id = ? ORDER BY class_number ASC',
            [schoolId]
        );
        res.json({ success: true, classes });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/classes
// @desc    Create a new class
// @access  Private (Admin)
router.post('/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, classNumber, description } = req.body;

        if (!name || !classNumber) {
            return res.status(400).json({ success: false, message: 'Name and Class Number are required' });
        }

        await db.query(
            'INSERT INTO classes (school_id, name, class_number, description) VALUES (?, ?, ?, ?)',
            [schoolId, name, classNumber, description]
        );

        res.status(201).json({ success: true, message: 'Class created successfully' });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/classes/:id
// @desc    Update a class
// @access  Private (Admin)
router.put('/classes/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, classNumber, description } = req.body;
        const { id } = req.params;

        await db.query(
            'UPDATE classes SET name = ?, class_number = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, classNumber, description, id, schoolId]
        );

        res.json({ success: true, message: 'Class updated successfully' });
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/classes/:id
// @desc    Delete a class
// @access  Private (Admin)
router.delete('/classes/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        // Check if any students are enrolled in this class
        const [studentCheck] = await db.query(
            `SELECT COUNT(*) as count FROM students 
             WHERE class = (SELECT class_number FROM classes WHERE id = ? AND school_id = ?) 
             AND school_id = ? `,
            [id, schoolId, schoolId]
        );
        if (studentCheck[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete this class. ${studentCheck[0].count} student(s) are currently enrolled.Please reassign or remove them first.`
            });
        }

        // Delete related records to clear foreign key constraints
        await db.query('DELETE FROM class_sections WHERE class_id = ? AND school_id = ?', [id, schoolId]);
        await db.query('DELETE FROM class_subjects WHERE class_id = ? AND school_id = ?', [id, schoolId]);
        await db.query('DELETE FROM class_streams WHERE class_id = ? AND school_id = ?', [id, schoolId]);

        await db.query('DELETE FROM classes WHERE id = ? AND school_id = ?', [id, schoolId]);

        res.json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- SECTIONS ---

// @route   GET /api/admin/sections
// @desc    Get all sections
// @access  Private (Admin)
router.get('/sections', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [sections] = await db.query(
            'SELECT * FROM sections WHERE school_id = ? ORDER BY name ASC',
            [schoolId]
        );
        res.json({ success: true, sections });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/sections
// @desc    Create a new section
// @access  Private (Admin)
router.post('/sections', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Name and Code are required' });
        }

        await db.query(
            'INSERT INTO sections (school_id, name, code, description) VALUES (?, ?, ?, ?)',
            [schoolId, name, code, description]
        );

        res.status(201).json({ success: true, message: 'Section created successfully' });
    } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/sections/:id
// @desc    Update a section
// @access  Private (Admin)
router.put('/sections/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, code, description } = req.body;
        const { id } = req.params;

        await db.query(
            'UPDATE sections SET name = ?, code = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, code, description, id, schoolId]
        );

        res.json({ success: true, message: 'Section updated successfully' });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/sections/:id
// @desc    Delete a section
// @access  Private (Admin)
router.delete('/sections/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        // Check if section is assigned to any classes
        const [assignedClassesData] = await db.query(
            `SELECT DISTINCT c.id, c.name, c.class_number 
             FROM classes c 
             INNER JOIN class_sections cs ON c.id = cs.class_id 
             WHERE cs.section_id = ? AND c.school_id = ?
             ORDER BY c.class_number ASC`,
            [id, schoolId]
        );

        if (assignedClassesData.length > 0) {
            return res.json({
                success: false,
                message: `This section is assigned to ${assignedClassesData.length} class(es). Please remove it from all classes first before deleting.`,
                assignedClasses: assignedClassesData
            });
        }

        await db.query('DELETE FROM sections WHERE id = ? AND school_id = ?', [id, schoolId]);

        res.json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- SUBJECTS ---

// @route   GET /api/admin/subjects
// @desc    Get all subjects
// @access  Private (Admin)
router.get('/subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [subjects] = await db.query(
            'SELECT * FROM subjects WHERE school_id = ? ORDER BY name ASC',
            [schoolId]
        );
        res.json({ success: true, subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/subjects
// @desc    Create a new subject
// @access  Private (Admin)
router.post('/subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Name and Code are required' });
        }

        await db.query(
            'INSERT INTO subjects (school_id, name, code, description) VALUES (?, ?, ?, ?)',
            [schoolId, name, code, description]
        );

        res.status(201).json({ success: true, message: 'Subject created successfully' });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/subjects/:id
// @desc    Update a subject
// @access  Private (Admin)
router.put('/subjects/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, code, description } = req.body;
        const { id } = req.params;

        await db.query(
            'UPDATE subjects SET name = ?, code = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, code, description, id, schoolId]
        );

        res.json({ success: true, message: 'Subject updated successfully' });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/subjects/:id
// @desc    Delete a subject
// @access  Private (Admin)
router.delete('/subjects/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        await db.query('DELETE FROM subjects WHERE id = ? AND school_id = ?', [id, schoolId]);

        res.json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- CLASS CONFIGURATION (Assignments) ---



// @route   DELETE /api/admin/class-sections-by-params
// @desc    Unassign a section from a class using query params
// @access  Private (Admin)
router.delete('/class-sections-by-params', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, section_id } = req.query;

        if (!class_id || !section_id) {
            return res.status(400).json({ success: false, message: 'Class ID and Section ID are required' });
        }

        console.log(`Fallback unassign section.Class: ${class_id}, Section: ${section_id} `);

        const [result] = await db.query(
            'DELETE FROM class_sections WHERE class_id = ? AND section_id = ? AND school_id = ?',
            [class_id, section_id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        res.json({ success: true, message: 'Section unassigned successfully' });
    } catch (error) {
        console.error('Unassign section by params error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/class-sections/:id
// @desc    Unassign a section from a class
// @access  Private (Admin)
router.delete('/class-sections/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM class_sections WHERE id = ? AND school_id = ?', [id, schoolId]);

        if (result.affectedRows === 0) {
            console.warn(`Delete failed: Section assignment not found or unauthorized.ID: ${id}, SchoolID: ${schoolId} `);
            return res.status(404).json({ success: false, message: 'Section assignment not found or unauthorized' });
        }

        console.log(`Successfully unassigned section.ID: ${id} `);
        res.json({ success: true, message: 'Section unassigned successfully' });
    } catch (error) {
        console.error('Unassign section error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/class-subjects/:classId
// @desc    Get subjects assigned to a class
// @access  Private (Admin)
router.get('/class-subjects/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId } = req.params;
        const streamId = req.query.stream_id;

        let query = `SELECT cs.id as mapping_id, cs.stream_id, s.id as subject_id, s.name as subject_name, s.code as subject_code
             FROM class_subjects cs
             JOIN subjects s ON cs.subject_id = s.id
             WHERE cs.class_id = ? AND cs.school_id = ?`;
        const params = [classId, schoolId];

        if (streamId && streamId !== 'undefined' && streamId !== 'null') {
            query += ' AND cs.stream_id = ?';
            params.push(streamId);
        }

        query += ' ORDER BY s.name';
        const [subjects] = await db.query(query, params);

        res.json({ success: true, subjects });
    } catch (error) {
        console.error('Get class subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/class-subjects
// @desc    Assign a subject to a class
// @access  Private (Admin)
router.post('/class-subjects', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, subject_id, stream_id } = req.body;

        await db.query(
            'INSERT INTO class_subjects (school_id, class_id, subject_id, stream_id) VALUES (?, ?, ?, ?)',
            [schoolId, class_id, subject_id, stream_id || null]
        );

        res.status(201).json({ success: true, message: 'Subject assigned successfully' });
    } catch (error) {
        console.error('Assign subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/class-subjects-by-params
// @desc    Unassign a subject from a class using query params
// @access  Private (Admin)
router.delete('/class-subjects-by-params', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, subject_id } = req.query;

        if (!class_id || !subject_id) {
            return res.status(400).json({ success: false, message: 'Class ID and Subject ID are required' });
        }

        const [result] = await db.query(
            'DELETE FROM class_subjects WHERE class_id = ? AND subject_id = ? AND school_id = ?',
            [class_id, subject_id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        res.json({ success: true, message: 'Subject unassigned successfully' });
    } catch (error) {
        console.error('Unassign subject by params error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/class-subjects/:id
// @desc    Unassign a subject from a class
// @access  Private (Admin)
router.delete('/class-subjects/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM class_subjects WHERE id = ? AND school_id = ?', [id, schoolId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Subject assignment not found or unauthorized' });
        }

        res.json({ success: true, message: 'Subject unassigned successfully' });
    } catch (error) {
        console.error('Unassign subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===============================================
// HOLIDAYS MANAGEMENT ROUTES
// ===============================================

// GET all holidays
router.get('/holidays', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [holidays] = await db.query(
            'SELECT * FROM holidays WHERE school_id = ? ORDER BY start_date ASC',
            [schoolId]
        );
        res.json({ success: true, holidays });
    } catch (error) {
        console.error('Get holidays error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// CREATE holiday
router.post('/holidays', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { title, description, start_date, end_date, type } = req.body;
        if (!title || !start_date) {
            return res.status(400).json({ success: false, message: 'Title and start date are required' });
        }
        const [result] = await db.query(
            'INSERT INTO holidays (school_id, title, description, start_date, end_date, type) VALUES (?, ?, ?, ?, ?, ?)',
            [schoolId, title, description || null, start_date, end_date || null, type || 'Other']
        );
        res.status(201).json({ success: true, message: 'Holiday created successfully', holidayId: result.insertId });
    } catch (error) {
        console.error('Create holiday error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// UPDATE holiday
router.put('/holidays/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { title, description, start_date, end_date, type } = req.body;
        const [result] = await db.query(
            'UPDATE holidays SET title = ?, description = ?, start_date = ?, end_date = ?, type = ? WHERE id = ? AND school_id = ?',
            [title, description || null, start_date, end_date || null, type || 'Other', id, schoolId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Holiday not found' });
        }
        res.json({ success: true, message: 'Holiday updated successfully' });
    } catch (error) {
        console.error('Update holiday error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE holiday
router.delete('/holidays/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const [result] = await db.query(
            'DELETE FROM holidays WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Holiday not found' });
        }
        res.json({ success: true, message: 'Holiday deleted successfully' });
    } catch (error) {
        console.error('Delete holiday error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ===============================================
// SCHOOL WEEKLY SCHEDULE ROUTES
// ===============================================

// GET school weekly schedule
router.get('/school-weekly-schedule', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [schedule] = await db.query(
            'SELECT * FROM school_weekly_schedule WHERE school_id = ? ORDER BY day_of_week ASC',
            [schoolId]
        );
        res.json({ success: true, schedule });
    } catch (error) {
        console.error('Get weekly schedule error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST update school weekly schedule
router.post('/school-weekly-schedule', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { schedule } = req.body; // Expecting an array: [{ day_of_week: 0, is_working: true }, ...]

        if (!Array.isArray(schedule)) {
            return res.status(400).json({ success: false, message: 'schedule array is required' });
        }

        // Upsert each day
        for (const item of schedule) {
            await db.query(
                `INSERT INTO school_weekly_schedule (school_id, day_of_week, is_working) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE is_working = VALUES(is_working)`,
                [schoolId, item.day_of_week, item.is_working]
            );
        }

        res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        console.error('Update weekly schedule error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// ============================================
// STREAMS & COMBINATIONS MANAGEMENT
// ============================================

// @route   GET /api/admin/streams
// @desc    Get all streams for the school
router.get('/streams', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [streams] = await db.query(
            'SELECT * FROM streams WHERE school_id = ? ORDER BY name',
            [schoolId]
        );
        res.json({ success: true, streams });
    } catch (error) {
        console.error('Get streams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/streams
// @desc    Create a new stream
router.post('/streams', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, code, description } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Name and code are required' });
        }
        const [result] = await db.query(
            'INSERT INTO streams (school_id, name, code, description) VALUES (?, ?, ?, ?)',
            [schoolId, name, code.toUpperCase(), description || null]
        );
        res.json({ success: true, message: 'Stream created', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Stream code already exists' });
        }
        console.error('Create stream error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/streams/:id
// @desc    Update a stream
router.put('/streams/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { name, code, description } = req.body;
        await db.query(
            'UPDATE streams SET name = ?, code = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, code.toUpperCase(), description || null, id, schoolId]
        );
        res.json({ success: true, message: 'Stream updated' });
    } catch (error) {
        console.error('Update stream error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/streams/:id
// @desc    Delete a stream
router.delete('/streams/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        await db.query('DELETE FROM streams WHERE id = ? AND school_id = ?', [id, schoolId]);
        res.json({ success: true, message: 'Stream deleted' });
    } catch (error) {
        console.error('Delete stream error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/stream-combinations
// @desc    Get all combinations, optionally filtered by stream_id
router.get('/stream-combinations', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { stream_id } = req.query;
        let query = `SELECT sc.*, s.name as stream_name, s.code as stream_code 
                     FROM stream_combinations sc 
                     JOIN streams s ON sc.stream_id = s.id 
                     WHERE sc.school_id = ? `;
        const params = [schoolId];
        if (stream_id) {
            query += ' AND sc.stream_id = ?';
            params.push(stream_id);
        }
        query += ' ORDER BY s.name, sc.name';
        const [combinations] = await db.query(query, params);
        res.json({ success: true, combinations });
    } catch (error) {
        console.error('Get combinations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/stream-combinations
// @desc    Create a new combination
router.post('/stream-combinations', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { stream_id, name, code, description } = req.body;
        if (!stream_id || !name || !code) {
            return res.status(400).json({ success: false, message: 'Stream, name and code are required' });
        }
        const [result] = await db.query(
            'INSERT INTO stream_combinations (school_id, stream_id, name, code, description) VALUES (?, ?, ?, ?, ?)',
            [schoolId, stream_id, name, code.toUpperCase(), description || null]
        );
        res.json({ success: true, message: 'Combination created', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Combination code already exists' });
        }
        console.error('Create combination error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/stream-combinations/:id
// @desc    Delete a combination
router.delete('/stream-combinations/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        await db.query('DELETE FROM stream_combinations WHERE id = ? AND school_id = ?', [id, schoolId]);
        res.json({ success: true, message: 'Combination deleted' });
    } catch (error) {
        console.error('Delete combination error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/class-streams/:classId
// @desc    Get streams linked to a class
router.get('/class-streams/:classId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classId } = req.params;
        const [streams] = await db.query(
            `SELECT cs.id as link_id, s.*
    FROM class_streams cs 
             JOIN streams s ON cs.stream_id = s.id 
             WHERE cs.class_id = ? AND cs.school_id = ?
    ORDER BY s.name`,
            [classId, schoolId]
        );
        res.json({ success: true, streams });
    } catch (error) {
        console.error('Get class streams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/class-streams
// @desc    Link a stream to a class
router.post('/class-streams', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_id, stream_id } = req.body;
        if (!class_id || !stream_id) {
            return res.status(400).json({ success: false, message: 'Class and stream are required' });
        }
        await db.query(
            'INSERT INTO class_streams (school_id, class_id, stream_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id = id',
            [schoolId, class_id, stream_id]
        );
        res.json({ success: true, message: 'Stream linked to class' });
    } catch (error) {
        console.error('Link class stream error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/class-streams/:id
// @desc    Unlink a stream from a class
router.delete('/class-streams/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        await db.query('DELETE FROM class_streams WHERE id = ? AND school_id = ?', [id, schoolId]);
        res.json({ success: true, message: 'Stream unlinked from class' });
    } catch (error) {
        console.error('Unlink class stream error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/combination-subjects/:combinationId
// @desc    Get subjects for a combination
router.get('/combination-subjects/:combinationId', async (req, res) => {
    try {
        const { combinationId } = req.params;
        const [subjects] = await db.query(
            `SELECT cs.id as link_id, cs.is_optional, sub.id as subject_id, sub.name as subject_name, sub.code as subject_code
             FROM combination_subjects cs
             JOIN subjects sub ON cs.subject_id = sub.id
             WHERE cs.combination_id = ?
    ORDER BY cs.is_optional, sub.name`,
            [combinationId]
        );
        res.json({ success: true, subjects });
    } catch (error) {
        console.error('Get combination subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/combination-subjects
// @desc    Add subject to a combination
router.post('/combination-subjects', async (req, res) => {
    try {
        const { combination_id, subject_id, is_optional } = req.body;
        if (!combination_id || !subject_id) {
            return res.status(400).json({ success: false, message: 'Combination and subject are required' });
        }
        await db.query(
            'INSERT INTO combination_subjects (combination_id, subject_id, is_optional) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_optional = ?',
            [combination_id, subject_id, is_optional || false, is_optional || false]
        );
        res.json({ success: true, message: 'Subject added to combination' });
    } catch (error) {
        console.error('Add combination subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/combination-subjects/:id
// @desc    Remove subject from a combination
router.delete('/combination-subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM combination_subjects WHERE id = ?', [id]);
        res.json({ success: true, message: 'Subject removed from combination' });
    } catch (error) {
        console.error('Remove combination subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/classes-extended
// @desc    Get all classes with sort_order and category, properly ordered
router.get('/classes-extended', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [classes] = await db.query(
            `SELECT c.*,
    (SELECT COUNT(*) FROM class_streams cs2 WHERE cs2.class_id = c.id AND cs2.school_id = ?) as stream_count
             FROM classes c 
             WHERE c.school_id = ?
    ORDER BY c.sort_order, c.name`,
            [schoolId, schoolId]
        );
        res.json({ success: true, classes });
    } catch (error) {
        console.error('Get extended classes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/classes-extended
// @desc    Create a class with sort_order and class_category
router.post('/classes-extended', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, class_number, sort_order, class_category, description } = req.body;
        if (!name || !class_number) {
            return res.status(400).json({ success: false, message: 'Name and class identifier are required' });
        }
        // Check duplicate
        const [existing] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND school_id = ?',
            [class_number, schoolId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'This class already exists' });
        }
        const [result] = await db.query(
            'INSERT INTO classes (school_id, name, class_number, sort_order, class_category, description) VALUES (?, ?, ?, ?, ?, ?)',
            [schoolId, name, class_number, sort_order || 0, class_category || 'primary', description || null]
        );
        res.json({ success: true, message: 'Class created', id: result.insertId });
    } catch (error) {
        console.error('Create extended class error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/classes-extended/:id
// @desc    Update a class with sort_order and class_category
router.put('/classes-extended/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { name, class_number, sort_order, class_category, description } = req.body;
        await db.query(
            'UPDATE classes SET name = ?, class_number = ?, sort_order = ?, class_category = ?, description = ? WHERE id = ? AND school_id = ?',
            [name, class_number, sort_order || 0, class_category || 'primary', description || null, id, schoolId]
        );
        res.json({ success: true, message: 'Class updated' });
    } catch (error) {
        console.error('Update extended class error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// @route   POST /api/admin/non-teaching-staff
// @desc    Add a new non-teaching staff member
router.post('/non-teaching-staff', uploadNonTeachingStaffPhoto.single('photo'), async (req, res) => {
    let connection;
    try {
        const schoolId = req.user.school_id;
        const {
            name, email, phone, designation, joining_date,
            address, date_of_birth, gender, blood_group, emergency_contact
        } = req.body;

        if (!name || !email || !phone || !designation || !gender) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check for duplicate email in users
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Set password (using phone number as default) - Now Hashed
        const hashedPassword = await bcrypt.hash(phone, 10);

        // 2. Create User record
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, phone, role, password, status, school_id) VALUES (?, ?, ?, "nonteachingstaff", ?, "active", ?)',
            [name, email, phone, hashedPassword, schoolId]
        );

        const userId = userResult.insertId;

        // 3. Generate Employee ID (NTS + Year + UserID)
        const year = new Date().getFullYear();
        const employeeId = `NTS${year}${userId.toString().padStart(3, '0')}`;

        let photoPath = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            // Remove spaces/special characters for a clean filesystem name
            const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase();
            const newFilename = `${schoolId}-${safeName}-${employeeId}${ext}`;
            const newPath = path.join(nonTeachingStaffPhotoDir, newFilename);

            fs.renameSync(req.file.path, newPath);
            photoPath = `/upload/nonteachingstaff/${newFilename}`;
        }

        // 4. Create Non-Teaching Staff record
        await connection.query(
            `INSERT INTO non_teaching_staff 
             (user_id, employee_id, name, email, phone, designation, joining_date, address, date_of_birth, gender, blood_group, emergency_contact, school_id, photo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, employeeId, name, email, phone, designation, joining_date || null, address || null, date_of_birth || null, gender, blood_group || null, emergency_contact || null, schoolId, photoPath]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Non-teaching staff added successfully',
            staff: { id: userId, employee_id: employeeId, name, email }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Add non-teaching staff error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});
// @route   GET /api/admin/non-teaching-staff
// @desc    Get all non-teaching staff members
router.get('/non-teaching-staff', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [staff] = await db.query(
            'SELECT * FROM non_teaching_staff WHERE school_id = ? ORDER BY id DESC',
            [schoolId]
        );
        res.json({ success: true, staff });
    } catch (error) {
        console.error('Get non-teaching staff error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// @route   PUT /api/admin/non-teaching-staff/:id
// @desc    Update a non-teaching staff member
router.put('/non-teaching-staff/:id', uploadNonTeachingStaffPhoto.single('photo'), async (req, res) => {
    let connection;
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const {
            name, email, phone, designation, joining_date,
            address, date_of_birth, gender, blood_group, emergency_contact, status
        } = req.body;

        if (!name || !email || !phone || !designation || !gender) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Get user_id from non_teaching_staff record
        const [staffRows] = await connection.query('SELECT user_id, photo, employee_id FROM non_teaching_staff WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (staffRows.length === 0) {
            throw new Error('Staff member not found');
        }
        const userId = staffRows[0].user_id;

        // 2. Update users table (name, email, phone, status)
        await connection.query(
            'UPDATE users SET name = ?, email = ?, phone = ?, status = ? WHERE id = ? AND school_id = ?',
            [name, email, phone, status || 'Active', userId, schoolId]
        );

        let photoPath = staffRows[0].photo;
        if (req.file) {
            // Rename file to standard format
            const ext = path.extname(req.file.originalname);
            const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase();
            const newFilename = `${schoolId}-${safeName}-${staffRows[0].employee_id}${ext}`;
            const newPath = path.join(nonTeachingStaffPhotoDir, newFilename);

            fs.renameSync(req.file.path, newPath);
            photoPath = `/upload/nonteachingstaff/${newFilename}`;
        }

        // 3. Update non_teaching_staff table
        await connection.query(
            `UPDATE non_teaching_staff 
             SET name = ?, email = ?, phone = ?, designation = ?, joining_date = ?, 
                 address = ?, date_of_birth = ?, gender = ?, blood_group = ?, emergency_contact = ?, status = ?, photo = ?
             WHERE id = ? AND school_id = ?`,
            [name, email, phone, designation, joining_date || null, address || null, date_of_birth || null, gender, blood_group || null, emergency_contact || null, status || 'Active', photoPath, id, schoolId]
        );

        await connection.commit();

        // If a new photo was uploaded and an old one existed, delete the old one (only if path actually changed!)
        if (req.file && staffRows[0].photo && staffRows[0].photo !== photoPath) {
            const oldPhotoPath = path.join(__dirname, '..', staffRows[0].photo);
            if (fs.existsSync(oldPhotoPath)) {
                try {
                    fs.unlinkSync(oldPhotoPath);
                } catch (err) {
                    console.error('Failed to delete old photo:', err);
                }
            }
        }

        res.json({ success: true, message: 'Staff member updated successfully' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Update non-teaching staff error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

// @route   DELETE /api/admin/non-teaching-staff/:id
// @desc    Delete a non-teaching staff member
router.delete('/non-teaching-staff/:id', async (req, res) => {
    let connection;
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Get user_id and photo
        const [staffRows] = await connection.query('SELECT user_id, photo FROM non_teaching_staff WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (staffRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        const userId = staffRows[0].user_id;
        const photoPath = staffRows[0].photo;

        // 2. Delete from users (this will cascade to non_teaching_staff if foreign key is set up with CASCADE)
        // Or we can delete both explicitly to be safe
        await connection.query('DELETE FROM non_teaching_staff WHERE id = ?', [id]);
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();

        // Delete photo from filesystem if it exists
        if (photoPath) {
            const absolutePath = path.join(__dirname, '..', photoPath);
            if (fs.existsSync(absolutePath)) {
                try {
                    fs.unlinkSync(absolutePath);
                } catch (err) {
                    console.error('Failed to delete staff photo:', err);
                }
            }
        }

        res.json({ success: true, message: 'Staff member deleted successfully' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Delete non-teaching staff error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

// ============================================================
// NON-TEACHING STAFF ID CARDS
// ============================================================

// @route   GET /api/admin/non-teaching-staff-cards/next-number
// @desc    Get the next available card number (must be BEFORE the base GET route)
router.get('/non-teaching-staff-cards/next-number', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const year = new Date().getFullYear();
        const prefix = `${schoolId}ST${year}`;

        const [maxRows] = await db.query(
            `SELECT card_number FROM non_teaching_staff_cards WHERE school_id = ? AND card_number LIKE ? ORDER BY card_number DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0 && maxRows[0].card_number) {
            const lastSeqStr = maxRows[0].card_number.replace(prefix, '');
            const lastSeq = parseInt(lastSeqStr, 10);
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const nextNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
        res.json({ success: true, nextNumber });
    } catch (error) {
        console.error('Fetch next card number error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/non-teaching-staff-cards
// @desc    Get all issued staff cards
router.get('/non-teaching-staff-cards', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [cards] = await db.query(
            `SELECT nsc.*, nts.name as staff_name, nts.employee_id, nts.designation, nts.department, 
                    nts.phone, nts.email, nts.photo as staff_photo, nts.address,
                    s.principal_signature
             FROM non_teaching_staff_cards nsc
             JOIN non_teaching_staff nts ON nsc.user_id = nts.user_id AND nsc.school_id = nts.school_id
             JOIN schools s ON nsc.school_id = s.id
             WHERE nsc.school_id = ?
             ORDER BY nsc.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, cards });
    } catch (error) {
        console.error('Get staff cards error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/non-teaching-staff-cards
// @desc    Issue an official card for a staff member
router.post('/non-teaching-staff-cards', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { user_id, title } = req.body;

        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Check if card already issued
        const [existing] = await db.query(
            'SELECT id FROM non_teaching_staff_cards WHERE user_id = ? AND school_id = ?',
            [user_id, schoolId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Card already issued for this staff member' });
        }

        // Auto-generate card_number: SCHOOLID-YEAR-SEQUENCE
        const year = new Date().getFullYear();
        const prefix = `${schoolId}ST${year}`;

        const [maxRows] = await db.query(
            `SELECT card_number FROM non_teaching_staff_cards WHERE school_id = ? AND card_number LIKE ? ORDER BY card_number DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0 && maxRows[0].card_number) {
            const lastSeqStr = maxRows[0].card_number.replace(prefix, '');
            const lastSeq = parseInt(lastSeqStr, 10);
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const cardNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;

        await db.query(
            'INSERT INTO non_teaching_staff_cards (school_id, user_id, title, card_number) VALUES (?, ?, ?, ?)',
            [schoolId, user_id, title, cardNumber]
        );

        res.json({ success: true, message: 'Card issued successfully', card_number: cardNumber });
    } catch (error) {
        console.error('Issue staff card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/non-teaching-staff-cards/:id
// @desc    Revoke a staff card
router.delete('/non-teaching-staff-cards/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const cardId = req.params.id;

        await db.query('DELETE FROM non_teaching_staff_cards WHERE id = ? AND school_id = ?', [cardId, schoolId]);

        res.json({ success: true, message: 'Card revoked successfully' });
    } catch (error) {
        console.error('Delete staff card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// NON-TEACHING STAFF SHIFT TIME
// ============================================================

// @route   GET /api/admin/non-teaching-staff-shifts
// @desc    Get all shifts for the school
router.get('/non-teaching-staff-shifts', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [shifts] = await db.query(
            `SELECT s.*, nts.name as staff_name, nts.designation, nts.employee_id, nts.photo
             FROM non_teaching_staff_shifts s
             JOIN non_teaching_staff nts ON s.user_id = nts.user_id AND s.school_id = nts.school_id
             WHERE s.school_id = ?
             ORDER BY s.created_at DESC`,
            [schoolId]
        );

        res.json({ success: true, shifts });
    } catch (error) {
        console.error('Get shifts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/non-teaching-staff-shifts
// @desc    Assign a shift to a staff member
router.post('/non-teaching-staff-shifts', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { user_id, shift_name, start_time, end_time, effective_from, effective_to } = req.body;

        if (!user_id || !start_time || !end_time || !effective_from) {
            return res.status(400).json({ success: false, message: 'User ID, start time, end time, and effective date are required' });
        }

        await db.query(
            `INSERT INTO non_teaching_staff_shifts (school_id, user_id, shift_name, start_time, end_time, effective_from, effective_to)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, user_id, shift_name || 'General', start_time, end_time, effective_from, effective_to || null]
        );

        res.json({ success: true, message: 'Shift assigned successfully' });
    } catch (error) {
        console.error('Assign shift error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/non-teaching-staff-shifts/:id
// @desc    Update an existing shift
router.put('/non-teaching-staff-shifts/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const shiftId = req.params.id;
        const { shift_name, start_time, end_time, effective_from, effective_to } = req.body;

        await db.query(
            `UPDATE non_teaching_staff_shifts
             SET shift_name = ?, start_time = ?, end_time = ?, effective_from = ?, effective_to = ?
             WHERE id = ? AND school_id = ?`,
            [shift_name, start_time, end_time, effective_from, effective_to || null, shiftId, schoolId]
        );

        res.json({ success: true, message: 'Shift updated successfully' });
    } catch (error) {
        console.error('Update shift error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/non-teaching-staff-shifts/:id
// @desc    Delete a shift
router.delete('/non-teaching-staff-shifts/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const shiftId = req.params.id;

        await db.query('DELETE FROM non_teaching_staff_shifts WHERE id = ? AND school_id = ?', [shiftId, schoolId]);

        res.json({ success: true, message: 'Shift deleted successfully' });
    } catch (error) {
        console.error('Delete shift error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});





// ==================== BONAFIDE CERTIFICATE ROUTES ====================

// @route   GET /api/admin/certificates/next-number
// @desc    Generate next certificate number
router.get('/certificates/next-number', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();

        const prefix = `BON-${schoolId}-${currentYear}`;

        const [maxRows] = await db.query(
            `SELECT certificate_number FROM bonafide_certificates 
             WHERE school_id = ? AND certificate_number LIKE ? 
             ORDER BY id DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0) {
            const lastSeq = parseInt(maxRows[0].certificate_number.split('-').pop());
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const certificateNumber = `${prefix}-${String(nextSeq).padStart(4, '0')}`;
        res.json({ success: true, certificateNumber });
    } catch (error) {
        console.error('Error generating certificate number:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/certificates
// @desc    Save certificate record
router.post('/certificates', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            studentId, studentName, class: className, section,
            rollNo, fatherName, motherName, purpose,
            issuedDate, certificateNumber, remarks
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO bonafide_certificates 
             (school_id, student_id, student_name, class, section, roll_no,
              father_name, mother_name, purpose, issued_date, certificate_number, remarks, issued_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, studentId, studentName, className, section, rollNo,
                fatherName, motherName, purpose, issuedDate, certificateNumber, remarks, req.user.id]
        );

        res.json({ success: true, message: 'Certificate saved', id: result.insertId });
    } catch (error) {
        console.error('Error saving certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/certificates/history/:studentId
// @desc    Get certificate history for a student
router.get('/certificates/history/:studentId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [certificates] = await db.query(
            `SELECT * FROM bonafide_certificates 
             WHERE student_id = ? AND school_id = ? 
             ORDER BY issued_date DESC, created_at DESC`,
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, certificates });
    } catch (error) {
        console.error('Error fetching certificate history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/certificates/download/:id
// @desc    Download certificate PDF (return file)
router.get('/certificates/download/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [certificates] = await db.query(
            `SELECT * FROM bonafide_certificates WHERE id = ? AND school_id = ?`,
            [req.params.id, schoolId]
        );

        if (certificates.length === 0) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        // Return certificate data - frontend will generate PDF
        // Alternatively, store PDF file path and serve it
        res.json({ success: true, certificate: certificates[0] });
    } catch (error) {
        console.error('Error downloading certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/certificates/count/:studentId
// @desc    Get certificate count for a student
router.get('/certificates/count/:studentId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM bonafide_certificates WHERE student_id = ? AND school_id = ?',
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, count: result[0].count });
    } catch (error) {
        console.error('Error fetching certificate count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



// ==================== CHARACTER CERTIFICATE ROUTES ====================

// @route   GET /api/admin/character-certificates/next-number
// @desc    Generate next certificate number
router.get('/character-certificates/next-number', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();

        const prefix = `CHAR-${schoolId}-${currentYear}`;

        const [maxRows] = await db.query(
            `SELECT certificate_number FROM character_certificates 
             WHERE school_id = ? AND certificate_number LIKE ? 
             ORDER BY id DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0) {
            const lastSeq = parseInt(maxRows[0].certificate_number.split('-').pop());
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const certificateNumber = `${prefix}-${String(nextSeq).padStart(4, '0')}`;
        res.json({ success: true, certificateNumber });
    } catch (error) {
        console.error('Error generating character certificate number:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/character-certificates
// @desc    Save character certificate record
router.post('/character-certificates', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            studentId, studentName, class: className, section,
            rollNo, fatherName, motherName, purpose, conductRemarks,
            issuedDate, certificateNumber, remarks
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO character_certificates 
             (school_id, student_id, student_name, class, section, roll_no,
              father_name, mother_name, purpose, conduct_remarks, issued_date, certificate_number, remarks, issued_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, studentId, studentName, className, section, rollNo,
                fatherName, motherName, purpose, conductRemarks || null, issuedDate, certificateNumber, remarks || null, req.user.id]
        );

        res.json({ success: true, message: 'Certificate saved', id: result.insertId });
    } catch (error) {
        console.error('Error saving character certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/character-certificates/history/:studentId
// @desc    Get certificate history for a student
router.get('/character-certificates/history/:studentId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [certificates] = await db.query(
            `SELECT * FROM character_certificates 
             WHERE student_id = ? AND school_id = ? 
             ORDER BY issued_date DESC, created_at DESC`,
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, certificates });
    } catch (error) {
        console.error('Error fetching character certificate history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/character-certificates/count/:studentId
// @desc    Get certificate count for a student
router.get('/character-certificates/count/:studentId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM character_certificates WHERE student_id = ? AND school_id = ?',
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, count: result[0].count });
    } catch (error) {
        console.error('Error fetching character certificate count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/character-certificates/download/:id
// @desc    Get certificate data for download
router.get('/character-certificates/download/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [certificates] = await db.query(
            `SELECT * FROM character_certificates WHERE id = ? AND school_id = ?`,
            [req.params.id, schoolId]
        );

        if (certificates.length === 0) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        res.json({ success: true, certificate: certificates[0] });
    } catch (error) {
        console.error('Error downloading character certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});






// ==================== TRANSFER CERTIFICATE ROUTES ====================

// @route   GET /api/admin/transfer-certificates/next-number
// @desc    Generate next certificate number
router.get('/transfer-certificates/next-number', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();

        const prefix = `TC-${schoolId}-${currentYear}`;

        const [maxRows] = await db.query(
            `SELECT certificate_number FROM transfer_certificates 
             WHERE school_id = ? AND certificate_number LIKE ? 
             ORDER BY id DESC LIMIT 1`,
            [schoolId, `${prefix}%`]
        );

        let nextSeq = 1;
        if (maxRows.length > 0) {
            const lastSeq = parseInt(maxRows[0].certificate_number.split('-').pop());
            if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }

        const certificateNumber = `${prefix}-${String(nextSeq).padStart(4, '0')}`;
        res.json({ success: true, certificateNumber });
    } catch (error) {
        console.error('Error generating transfer certificate number:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/transfer-certificates
// @desc    Save transfer certificate record
router.post('/transfer-certificates', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            studentId, studentName, class: className, section,
            rollNo, fatherName, motherName, admissionNo,
            dateOfLeaving, lastClassAttended, reasonForLeaving,
            conduct, totalAttendancePercentage, feesCleared, outstandingFees,
            eligibleForAdmission, issuedDate, certificateNumber, remarks
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO transfer_certificates 
             (school_id, student_id, student_name, class, section, roll_no,
              father_name, mother_name, admission_no, date_of_leaving, last_class_attended,
              reason_for_leaving, conduct, total_attendance_percentage, fees_cleared,
              outstanding_fees, eligible_for_admission, issued_date, certificate_number, remarks, issued_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, studentId, studentName, className, section, rollNo,
                fatherName, motherName, admissionNo || null, dateOfLeaving, lastClassAttended,
                reasonForLeaving, conduct, totalAttendancePercentage || null, feesCleared ? 1 : 0,
                outstandingFees || 0, eligibleForAdmission ? 1 : 0, issuedDate, certificateNumber, remarks || null, req.user.id]
        );

        res.json({ success: true, message: 'Certificate saved', id: result.insertId });
    } catch (error) {
        console.error('Error saving transfer certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/transfer-certificates/history/:studentId
// @desc    Get certificate history for a student
router.get('/transfer-certificates/history/:studentId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [certificates] = await db.query(
            `SELECT * FROM transfer_certificates 
             WHERE student_id = ? AND school_id = ? 
             ORDER BY issued_date DESC, created_at DESC`,
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, certificates });
    } catch (error) {
        console.error('Error fetching transfer certificate history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/transfer-certificates/count/:studentId
// @desc    Get certificate count for a student
router.get('/transfer-certificates/count/:studentId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM transfer_certificates WHERE student_id = ? AND school_id = ?',
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, count: result[0].count });
    } catch (error) {
        console.error('Error fetching transfer certificate count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/transfer-certificates/download/:id
// @desc    Get certificate data for download
router.get('/transfer-certificates/download/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [certificates] = await db.query(
            `SELECT * FROM transfer_certificates WHERE id = ? AND school_id = ?`,
            [req.params.id, schoolId]
        );

        if (certificates.length === 0) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        res.json({ success: true, certificate: certificates[0] });
    } catch (error) {
        console.error('Error downloading transfer certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==================== ENQUIRY MANAGEMENT ROUTES ====================

// Helper to generate enquiry number
const generateEnquiryNumber = async (schoolId) => {
    const year = new Date().getFullYear();
    const prefix = `ENQ-${schoolId}-${year}`;
    const [rows] = await db.query(
        `SELECT enquiry_number FROM enquiries WHERE school_id = ? AND enquiry_number LIKE ? ORDER BY id DESC LIMIT 1`,
        [schoolId, `${prefix}%`]
    );
    let nextSeq = 1;
    if (rows.length > 0) {
        const lastSeq = parseInt(rows[0].enquiry_number.split('-').pop());
        if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }
    return `${prefix}-${String(nextSeq).padStart(4, '0')}`;
};

// GET all enquiries
router.get('/enquiries', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [enquiries] = await db.query(
            `SELECT e.*, u.name as assigned_to_name 
             FROM enquiries e 
             LEFT JOIN users u ON e.assigned_to = u.id 
             WHERE e.school_id = ? 
             ORDER BY e.created_at DESC`,
            [schoolId]
        );
        res.json({ success: true, enquiries });
    } catch (error) {
        console.error('Fetch enquiries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE enquiry
router.post('/enquiries', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const {
            student_name, date_of_birth, gender, class_applied, stream_id,
            father_name, mother_name, phone, alternate_phone, email, address,
            source, status, priority, assigned_to, remarks
        } = req.body;

        if (!student_name || !phone) {
            return res.status(400).json({ success: false, message: 'Student name and phone are required' });
        }

        const enquiryNumber = await generateEnquiryNumber(schoolId);

        const [result] = await db.query(
            `INSERT INTO enquiries 
             (school_id, enquiry_number, student_name, date_of_birth, gender, class_applied, stream_id,
              father_name, mother_name, phone, alternate_phone, email, address, source, status, priority,
              assigned_to, remarks, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, enquiryNumber, student_name, date_of_birth || null, gender || null, class_applied || null,
                stream_id || null, father_name || null, mother_name || null, phone, alternate_phone || null,
                email || null, address || null, source || 'Website', status || 'New', priority || 'Medium',
                assigned_to || null, remarks || null, req.user.id]
        );

        res.json({ success: true, message: 'Enquiry created', id: result.insertId, enquiryNumber });
    } catch (error) {
        console.error('Create enquiry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE enquiry
router.put('/enquiries/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const updates = req.body;
        const fields = [];
        const values = [];

        const allowedFields = ['student_name', 'date_of_birth', 'gender', 'class_applied', 'stream_id',
            'father_name', 'mother_name', 'phone', 'alternate_phone', 'email', 'address',
            'source', 'status', 'priority', 'assigned_to', 'remarks'];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updates[field] === '' ? null : updates[field]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        values.push(id, schoolId);
        await db.query(
            `UPDATE enquiries SET ${fields.join(', ')} WHERE id = ? AND school_id = ?`,
            values
        );

        res.json({ success: true, message: 'Enquiry updated' });
    } catch (error) {
        console.error('Update enquiry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE enquiry
router.delete('/enquiries/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        await db.query('DELETE FROM enquiries WHERE id = ? AND school_id = ?', [id, schoolId]);
        res.json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        console.error('Delete enquiry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// FOLLOW-UP
router.put('/enquiries/:id/follow-up', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;
        const { follow_up_date, follow_up_notes } = req.body;

        if (!follow_up_date) {
            return res.status(400).json({ success: false, message: 'Follow-up date required' });
        }

        await db.query(
            `UPDATE enquiries SET follow_up_date = ?, follow_up_notes = ?, status = 'Follow-up Scheduled' 
             WHERE id = ? AND school_id = ?`,
            [follow_up_date, follow_up_notes || null, id, schoolId]
        );

        res.json({ success: true, message: 'Follow-up scheduled' });
    } catch (error) {
        console.error('Follow-up error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CONVERT to application (creates a student_application record)
router.post('/enquiries/:id/convert', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { id } = req.params;

        // Get enquiry details
        const [enquiries] = await db.query('SELECT * FROM enquiries WHERE id = ? AND school_id = ?', [id, schoolId]);
        if (enquiries.length === 0) return res.status(404).json({ success: false, message: 'Enquiry not found' });

        const enq = enquiries[0];

        // Check if already converted
        if (enq.status === 'Converted') {
            return res.status(400).json({ success: false, message: 'Already converted' });
        }

        // Generate application number
        const [lastApp] = await db.query('SELECT application_no FROM student_applications ORDER BY id DESC LIMIT 1');
        let applicationNo;
        if (lastApp.length > 0) {
            const lastNo = parseInt(lastApp[0].application_no.replace('APP', ''));
            applicationNo = `APP${String(lastNo + 1).padStart(7, '0')}`;
        } else {
            applicationNo = `APP${new Date().getFullYear()}001`;
        }

        // Create application
        const [result] = await db.query(
            `INSERT INTO student_applications 
             (school_id, application_no, student_name, date_of_birth, gender, class, stream_id,
              father_name, mother_name, phone, parent_phone, email, address, applied_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'pending')`,
            [schoolId, applicationNo, enq.student_name, enq.date_of_birth, enq.gender, enq.class_applied,
                enq.stream_id, enq.father_name, enq.mother_name, enq.phone, enq.alternate_phone,
                enq.email, enq.address]
        );

        // Update enquiry status
        await db.query('UPDATE enquiries SET status = "Converted", converted_to_application_id = ? WHERE id = ?', [result.insertId, id]);

        res.json({ success: true, message: 'Converted to application', applicationId: result.insertId, applicationNo });
    } catch (error) {
        console.error('Convert enquiry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// GET students added by a specific teacher
router.get('/teacher-added-students/:teacherId', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const teacherUserId = req.params.teacherId;
        const [students] = await db.query(
            `SELECT student_unique_id, student_name, class, section, roll_no, created_at
             FROM students
             WHERE created_by = ? AND school_id = ?
             ORDER BY created_at DESC`,
            [teacherUserId, schoolId]
        );
        res.json({ success: true, students });
    } catch (error) {
        console.error('Teacher added students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/class-students
// @desc    Get students for a specific class and section
// @access  Private (Admin)
router.get('/class-students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_number, section } = req.query;

        if (!class_number || !section) {
            return res.status(400).json({ success: false, message: 'class_number and section are required' });
        }

        const [students] = await db.query(
            `SELECT id, student_name, roll_no, student_unique_id
             FROM students
             WHERE class = ? AND section = ? AND school_id = ?
             ORDER BY CAST(roll_no AS UNSIGNED), roll_no`,
            [class_number, section, schoolId]
        );

        res.json({ success: true, students });
    } catch (error) {
        console.error('Get class students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/timetable-elective-students/:timetableId
// @desc    Get students enrolled in a specific elective timetable entry
// @access  Private (Admin)
router.get('/timetable-elective-students/:timetableId', async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT tes.student_id
             FROM timetable_elective_students tes
             WHERE tes.timetable_id = ?`,
            [req.params.timetableId]
        );

        res.json({ success: true, studentIds: students.map(s => s.student_id) });
    } catch (error) {
        console.error('Get elective students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/elective-subject-students
// @desc    Get students already assigned to a specific subject as elective (across all slots)
// @access  Private (Admin)
router.get('/elective-subject-students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_number, section, subject_id } = req.query;

        if (!class_number || !section || !subject_id) {
            return res.status(400).json({ success: false, message: 'class_number, section, and subject_id are required' });
        }

        const [students] = await db.query(
            `SELECT DISTINCT tes.student_id
             FROM timetable_elective_students tes
             JOIN timetable t ON tes.timetable_id = t.id
             WHERE t.class_number = ? AND t.section = ? AND t.subject_id = ? AND t.is_elective = 1 AND t.school_id = ?`,
            [class_number, section, subject_id, schoolId]
        );

        res.json({ success: true, studentIds: students.map(s => s.student_id) });
    } catch (error) {
        console.error('Get elective subject students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/timetable-slot-elective-conflicts
// @desc    Get students already assigned to ANY elective in a specific slot
// @access  Private (Admin)
router.get('/timetable-slot-elective-conflicts', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { dayOfWeek, timeSlotId, classNumber, section } = req.query;

        if (!dayOfWeek || !timeSlotId || !classNumber || !section) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        const [conflicts] = await db.query(
            `SELECT tes.student_id, t.subject_name, t.teacher_name, t.id as timetable_id
             FROM timetable_elective_students tes
             JOIN timetable t ON tes.timetable_id = t.id
             WHERE t.day_of_week = ? AND t.time_slot_id = ? AND t.class_number = ? AND t.section = ? 
             AND t.is_elective = 1 AND t.school_id = ?`,
            [dayOfWeek, timeSlotId, classNumber, section, schoolId]
        );

        res.json({ success: true, conflicts });
    } catch (error) {
        console.error('Get slot elective conflicts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== ELECTIVE GROUP MANAGEMENT ====================

// @route   GET /api/admin/elective-groups
// @desc    Get all elective groups (grouped by subject + class + section)
// @access  Private (Admin)
router.get('/elective-groups', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_number, section } = req.query;

        let query = `SELECT 
                t.subject_id,
                s.name as subject_name,
                s.code as subject_code,
                t.class_number,
                t.section,
                t.teacher_id,
                tch.name as teacher_name,
                COUNT(DISTINCT t.id) as slot_count,
                COUNT(DISTINCT tes.student_id) as student_count
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            LEFT JOIN teachers tch ON t.teacher_id = tch.id
            LEFT JOIN timetable_elective_students tes ON tes.timetable_id = t.id
            WHERE t.is_elective = 1 AND t.school_id = ?`;
        const params = [schoolId];

        if (class_number) {
            query += ' AND t.class_number = ?';
            params.push(class_number);
        }
        if (section) {
            query += ' AND t.section = ?';
            params.push(section);
        }

        query += ' GROUP BY t.subject_id, t.class_number, t.section, t.teacher_id ORDER BY t.class_number, t.section, s.name';

        const [groups] = await db.query(query, params);
        res.json({ success: true, groups });
    } catch (error) {
        console.error('Get elective groups error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/elective-group-students
// @desc    Get students enrolled in a specific elective group (with student details)
// @access  Private (Admin)
router.get('/elective-group-students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class_number, section, subject_id } = req.query;

        if (!class_number || !section || !subject_id) {
            return res.status(400).json({ success: false, message: 'class_number, section, and subject_id required' });
        }

        const [students] = await db.query(
            `SELECT DISTINCT st.id, st.student_name, st.roll_no
             FROM timetable_elective_students tes
             JOIN timetable t ON tes.timetable_id = t.id
             JOIN students st ON tes.student_id = st.id
             WHERE t.class_number = ? AND t.section = ? AND t.subject_id = ? AND t.is_elective = 1 AND t.school_id = ?
             ORDER BY CAST(st.roll_no AS UNSIGNED), st.roll_no`,
            [class_number, section, subject_id, schoolId]
        );

        res.json({ success: true, students });
    } catch (error) {
        console.error('Get elective group students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/elective-group-students
// @desc    Update student enrollment for all timetable entries of a specific elective group
// @access  Private (Admin)
router.put('/elective-group-students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classNumber, section, subjectId, studentIds } = req.body;

        if (!classNumber || !section || !subjectId) {
            return res.status(400).json({ success: false, message: 'classNumber, section, and subjectId required' });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Get all timetable entries for this elective group
            const [entries] = await connection.query(
                'SELECT id FROM timetable WHERE class_number = ? AND section = ? AND subject_id = ? AND is_elective = 1 AND school_id = ?',
                [classNumber, section, subjectId, schoolId]
            );

            // For each entry, replace student mappings
            for (const entry of entries) {
                await connection.query('DELETE FROM timetable_elective_students WHERE timetable_id = ?', [entry.id]);

                if (studentIds && studentIds.length > 0) {
                    const values = studentIds.map(sid => [entry.id, sid, schoolId]);
                    await connection.query(
                        'INSERT INTO timetable_elective_students (timetable_id, student_id, school_id) VALUES ?',
                        [values]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.json({ success: true, message: `Updated ${entries.length} timetable entries with ${(studentIds || []).length} students` });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (error) {
        console.error('Update elective group students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/elective-group-student
// @desc    Remove a single student from an elective group (all slots)
// @access  Private (Admin)
router.delete('/elective-group-student', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classNumber, section, subjectId, studentId } = req.body;

        if (!classNumber || !section || !subjectId || !studentId) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        const [result] = await db.query(
            `DELETE tes FROM timetable_elective_students tes
             JOIN timetable t ON tes.timetable_id = t.id
             WHERE t.class_number = ? AND t.section = ? AND t.subject_id = ? AND t.is_elective = 1 AND t.school_id = ?
             AND tes.student_id = ?`,
            [classNumber, section, subjectId, schoolId, studentId]
        );

        res.json({ success: true, message: 'Student removed', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Remove elective group student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




// ========== LESSON PLANS REPORTS (Admin) ==========

// GET /api/admin/lesson-plans/report
// Filters: teacher_id, class, section, subject, week_start, week_end
router.get('/lesson-plans/report', async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { teacher_id, class_number, section, subject_id, week_start, week_end } = req.query;

    let query = `
      SELECT lp.*, 
             t.name as teacher_name, t.employee_id,
             s.name as subject_name,
             c.name as class_name, sec.name as section_name
      FROM lesson_plans lp
      JOIN teachers t ON lp.teacher_id = t.id
      JOIN subjects s ON lp.subject_id = s.id
      LEFT JOIN classes c ON (lp.class_number COLLATE utf8mb4_unicode_ci) = c.class_number AND c.school_id = ?
      LEFT JOIN sections sec ON (lp.section COLLATE utf8mb4_unicode_ci) = sec.code AND sec.school_id = ?
      WHERE lp.school_id = ?
    `;
    const params = [schoolId, schoolId, schoolId];

    if (teacher_id && teacher_id !== '') {
      query += ' AND lp.teacher_id = ?';
      params.push(teacher_id);
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
    if (week_start) {
      query += ' AND lp.week_start_date >= ?';
      params.push(week_start);
    }
    if (week_end) {
      query += ' AND lp.week_start_date <= ?';
      params.push(week_end);
    }

    query += ' ORDER BY lp.week_start_date DESC, lp.class_number, lp.section, s.name';

    const [plans] = await db.query(query, params);
    res.json({ success: true, lessonPlans: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/lesson-plans/summary
// Returns aggregated progress: by teacher, by class, by subject
router.get('/lesson-plans/summary', async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { week_start, week_end } = req.query;

    let whereClause = 'WHERE lp.school_id = ?';
    const params = [schoolId];
    if (week_start) {
      whereClause += ' AND lp.week_start_date >= ?';
      params.push(week_start);
    }
    if (week_end) {
      whereClause += ' AND lp.week_start_date <= ?';
      params.push(week_end);
    }
    const { teacher_id } = req.query;
    if (teacher_id && teacher_id !== '') {
      whereClause += ' AND lp.teacher_id = ?';
      params.push(teacher_id);
    }

    // By teacher
    const [byTeacher] = await db.query(`
      SELECT t.id, t.name, 
             COUNT(lp.id) as total_tasks,
             AVG(lp.completion_percentage) as avg_completion,
             SUM(CASE WHEN lp.completion_percentage >= 100 THEN 1 ELSE 0 END) as completed_tasks
      FROM lesson_plans lp
      JOIN teachers t ON lp.teacher_id = t.id
      ${whereClause}
      GROUP BY t.id, t.name
    `, params);

    // By class
    const [byClass] = await db.query(`
      SELECT lp.class_number, c.name as class_name,
             COUNT(lp.id) as total_tasks,
             AVG(lp.completion_percentage) as avg_completion
      FROM lesson_plans lp
      LEFT JOIN classes c ON (lp.class_number COLLATE utf8mb4_unicode_ci) = c.class_number AND c.school_id = ?
      ${whereClause}
      GROUP BY lp.class_number, c.name
    `, [schoolId, ...params]);

    // By subject
    const [bySubject] = await db.query(`
      SELECT s.id, s.name, s.code,
             COUNT(lp.id) as total_tasks,
             AVG(lp.completion_percentage) as avg_completion
      FROM lesson_plans lp
      JOIN subjects s ON lp.subject_id = s.id
      ${whereClause}
      GROUP BY s.id, s.name, s.code
    `, params);

    res.json({ success: true, summary: { byTeacher, byClass, bySubject } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});







// ==================== PASSOUT STUDENT MANAGEMENT ====================

// @route   PUT /api/admin/students/:id/passout
// @desc    Mark a student as passed out
router.put('/students/:id/passout', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;
        const { remarks } = req.body;
        const passedOutDate = new Date();
        const year = passedOutDate.getFullYear();

        // Get current class before updating
        const [student] = await db.query(
            'SELECT class, stream_id FROM students WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const currentClass = String(student[0].class);

        // --- Fee Checking Logic ---
        // Get current class name from classes table
        const [currentClassData] = await db.query(
            'SELECT name FROM classes WHERE class_number = ? AND school_id = ?',
            [currentClass, schoolId]
        );
        const currentClassName = currentClassData.length > 0 ? currentClassData[0].name : null;

        // Fee check using the same ledger-style calculation as accounts page:
        // Group by fee_type, use MAX(total_amount) for bill, SUM(paid_amount) for payments, then sum across groups
        // Use case-insensitive matching for class name
        let feeCheckQuery = `
            SELECT fee_type, 
                   MAX(total_amount) as bill_total, 
                   COALESCE(SUM(paid_amount), 0) as total_paid
            FROM fee_records 
            WHERE student_id = ? AND school_id = ?
              AND (LOWER(class_name) = LOWER(?) OR class_name = ? OR LOWER(class_name) = LOWER(CONCAT('class ', ?)))
            GROUP BY fee_type`;
        const feeCheckParams = [studentId, schoolId, currentClassName || currentClass, currentClass, currentClass];

        const [feeCheckRows] = await db.query(feeCheckQuery, feeCheckParams);
        
        let totalBilled = 0;
        let totalPaid = 0;
        for (const row of feeCheckRows) {
            totalBilled += parseFloat(row.bill_total || 0);
            totalPaid += parseFloat(row.total_paid || 0);
        }
        const pendingAmount = totalBilled - totalPaid;

        // Also check if fee_structure exists but no record was created
        if (totalBilled === 0) {
            const [classData] = await db.query(
                'SELECT c.id FROM classes c WHERE c.class_number = ? AND c.school_id = ?',
                [currentClass, schoolId]
            );
            if (classData.length > 0) {
                // Filter by student's stream_id if they have one, otherwise check general (stream_id=0)
                let fsQuery = 'SELECT total_fee FROM fee_structures WHERE class_id = ? AND school_id = ?';
                const fsParams = [classData[0].id, schoolId];
                if (student[0].stream_id) {
                    fsQuery += ' AND stream_id = ?';
                    fsParams.push(student[0].stream_id);
                } else {
                    fsQuery += ' AND (stream_id = 0 OR stream_id IS NULL)';
                }
                const [fsCheck] = await db.query(fsQuery, fsParams);
                // If there's a fee structure but no record, technically fees are pending unless zero
                if (fsCheck.length > 0 && parseFloat(fsCheck[0].total_fee) > 0) {
                    return res.status(400).json({ success: false, message: 'Fee records not generated for current class. Please generate and clear fees first before passout.' });
                }
            }
        } else if (pendingAmount > 0) {
            return res.status(400).json({ success: false, message: `Cannot passout. Student has pending fees (₹${pendingAmount.toFixed(2)}) for the current class.` });
        }
        // --- End Fee Checking Logic ---

        // Update student status
        await db.query(
            `UPDATE students 
             SET status = 'passed_out', 
                 passed_out_date = ?, 
                 passed_out_class = ?,
                 passed_out_year = ?,
                 remarks = ?,
                 updated_at = NOW()
             WHERE id = ? AND school_id = ?`,
            [passedOutDate, currentClass, year, remarks || null, studentId, schoolId]
        );

        // Also deactivate the user account (optional)
        const [studentUser] = await db.query(
            'SELECT user_id FROM students WHERE id = ?', [studentId]
        );
        if (studentUser.length > 0 && studentUser[0].user_id) {
            await db.query(
                'UPDATE users SET status = "inactive" WHERE id = ?',
                [studentUser[0].user_id]
            );
        }

        // Log activity
        await logActivity(req, 'Passout', `Student marked as passed out (ID: ${studentId})`);

        res.json({ 
            success: true, 
            message: 'Student marked as passed out successfully',
            passedOutDate,
            year
        });
    } catch (error) {
        console.error('Passout student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/students/:id/restore
// @desc    Restore a passed out student back to active
router.post('/students/:id/restore', async (req, res) => {
    try {
        const studentId = req.params.id;
        const schoolId = req.user.school_id;

        // Check if student exists and is passed out
        const [student] = await db.query(
            'SELECT user_id FROM students WHERE id = ? AND school_id = ? AND status = "passed_out"',
            [studentId, schoolId]
        );

        if (student.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found or not in passed out status' 
            });
        }

        // Restore student
        await db.query(
            `UPDATE students 
             SET status = 'active', 
                 passed_out_date = NULL,
                 passed_out_class = NULL,
                 passed_out_year = NULL,
                 updated_at = NOW()
             WHERE id = ? AND school_id = ?`,
            [studentId, schoolId]
        );

        // Reactivate user account
        if (student[0].user_id) {
            await db.query(
                'UPDATE users SET status = "active" WHERE id = ?',
                [student[0].user_id]
            );
        }

        await logActivity(req, 'Restore', `Student restored from passed out (ID: ${studentId})`);

        res.json({ success: true, message: 'Student restored successfully' });
    } catch (error) {
        console.error('Restore student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/passed-out-students
// @desc    Get all passed out students
router.get('/passed-out-students', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { year, class: className, search } = req.query;

        let query = `
            SELECT s.*, u.name, u.email, u.phone, st.name as stream_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN streams st ON s.stream_id = st.id
            WHERE s.school_id = ? AND s.status = 'passed_out'
        `;
        const params = [schoolId];

        if (year && year !== 'all') {
            query += ' AND s.passed_out_year = ?';
            params.push(year);
        }
        if (className && className !== 'all') {
            query += ' AND s.passed_out_class = ?';
            params.push(className);
        }
        if (search) {
            query += ' AND (s.student_name LIKE ? OR s.roll_no LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.passed_out_date DESC';

        const [students] = await db.query(query, params);
        res.json({ success: true, students });
    } catch (error) {
        console.error('Get passed out students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/passed-out-stats
// @desc    Get statistics for passed out students (years, classes)
router.get('/passed-out-stats', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get available years
        const [years] = await db.query(
            'SELECT DISTINCT passed_out_year as year FROM students WHERE school_id = ? AND status = "passed_out" ORDER BY passed_out_year DESC',
            [schoolId]
        );

        // Get available classes
        const [classes] = await db.query(
            'SELECT DISTINCT passed_out_class as class FROM students WHERE school_id = ? AND status = "passed_out" ORDER BY passed_out_class',
            [schoolId]
        );

        // Get total counts
        const [total] = await db.query(
            'SELECT COUNT(*) as total FROM students WHERE school_id = ? AND status = "passed_out"',
            [schoolId]
        );

        // Year-wise counts
        const [yearWise] = await db.query(
            'SELECT passed_out_year as year, COUNT(*) as count FROM students WHERE school_id = ? AND status = "passed_out" GROUP BY passed_out_year ORDER BY year DESC',
            [schoolId]
        );

        res.json({ 
            success: true, 
            stats: {
                total: total[0].total,
                years: years.map(y => y.year),
                classes: classes.map(c => c.class),
                yearWise
            }
        });
    } catch (error) {
        console.error('Get passed out stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;