const express = require('express'); // Express framework
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/student/profile
// @desc    Get student profile
// @access  Private (Student)
// @route   GET /api/student/profile
// @desc    Get student profile
// @access  Private (Student)

// ==================== MULTER CONFIG FOR STUDENT UPLOADS ====================
const studentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'upload', 'assignment_submissions');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

const studentUpload = multer({
    storage: studentStorage,
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

router.get('/profile', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id; // Get school_id from JWT token

        const [students] = await db.query(
            `SELECT s.*, 
                    u.name, u.email, u.phone as user_phone, u.status, st.name as stream_name
             FROM students s
             JOIN users u ON s.user_id = u.id
             LEFT JOIN streams st ON s.stream_id = st.id
             WHERE s.user_id = ? AND s.school_id = ?`,
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        res.json({
            success: true,
            student: students[0]
        });
    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/student/attendance
// @desc    Get student attendance records
// @access  Private (Student)
router.get('/attendance', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentId = students[0].id;

        // Get student class number to determine attendance mode
        const [studentInfo] = await db.query(
            'SELECT class FROM students WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );
        const studentClass = studentInfo.length > 0 ? String(studentInfo[0].class || '').toUpperCase() : '';
        const isHigherSecondary = studentClass.includes('XI') || studentClass.includes('11') || studentClass.includes('XII') || studentClass.includes('12') || studentClass === '11' || studentClass === '12';
        const attendanceMode = isHigherSecondary ? 'subject_wise' : 'day_wise';

        const [attendance] = await db.query(
            `SELECT 
                a.*,
                DATE_FORMAT(a.date, '%Y-%m-%d') as date_str,
                u.name as marked_by_name
             FROM students_attendance a
             LEFT JOIN teachers t ON a.marked_by = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE a.student_id = ? AND a.school_id = ?
             ORDER BY a.date DESC, a.subject`,
            [studentId, schoolId]
        );

        const totalClasses = attendance.length;
        const presentClasses = attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

        res.json({
            success: true,
            attendance,
            attendanceMode,
            studentClass: studentInfo.length > 0 ? studentInfo[0].class : null,
            stats: {
                totalClasses,
                presentClasses,
                absentClasses: totalClasses - presentClasses,
                attendancePercentage
            }
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/student/fees
// @desc    Get student fee structure based on class and payment history
// @access  Private (Student)
router.get('/fees', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get student details including class and stream
        const [students] = await db.query(
            'SELECT id, class, stream_id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentId = students[0].id;
        const studentClass = students[0].class;
        const studentStreamId = students[0].stream_id;

        // Get class_id from classes table (school-specific)
        const [classData] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND school_id = ?',
            [studentClass, schoolId]
        );

        let feeStructure = null;
        let currentClassName = null;
        if (classData.length > 0) {
            const classId = classData[0].id;

            // Get class name for filtering summary totals
            const [classInfo] = await db.query(
                'SELECT name FROM classes WHERE id = ? AND school_id = ?',
                [classId, schoolId]
            );
            if (classInfo.length > 0) {
                currentClassName = classInfo[0].name;
            }

            // Get fee structure for student's class (school-specific, stream-aware)
            let feeQuery = 'SELECT * FROM fee_structures WHERE class_id = ? AND school_id = ?';
            const feeParams = [classId, schoolId];
            if (studentStreamId) {
                feeQuery += ' AND stream_id = ?';
                feeParams.push(studentStreamId);
            }
            const [fees] = await db.query(feeQuery, feeParams);

            // Fallback: if no stream-specific structure, try without stream filter
            if (fees.length === 0 && studentStreamId) {
                const [fallbackFees] = await db.query(
                    'SELECT * FROM fee_structures WHERE class_id = ? AND school_id = ?',
                    [classId, schoolId]
                );
                if (fallbackFees.length > 0) {
                    feeStructure = fallbackFees[0];
                }
            } else if (fees.length > 0) {
                feeStructure = fees[0];
            }
        }

        // Get all fee records for payment info (school-specific) - ALL classes for Fee Records tab
        const [feeRecords] = await db.query(
            `SELECT fr.*, u.name as receiver_name 
             FROM fee_records fr 
             LEFT JOIN users u ON fr.received_by = u.id
             WHERE fr.student_id = ? AND fr.school_id = ?
             ORDER BY fr.payment_date DESC, fr.id DESC`,
            [studentId, schoolId]
        );

        // Get payment history from fee_records table (Ledger entries)
        const [paymentRecords] = await db.query(
            `SELECT fr.id, fr.student_id, fr.paid_amount as amount, 
                    fr.payment_date, fr.payment_method, fr.transaction_id, 
                    fr.fee_type, fr.class_name, u.name as receiver_name
             FROM fee_records fr 
             LEFT JOIN users u ON fr.received_by = u.id
             WHERE fr.student_id = ? AND fr.paid_amount > 0 AND fr.school_id = ?
             ORDER BY fr.payment_date DESC, fr.id DESC`,
            [studentId, schoolId]
        );

        const payments = paymentRecords.map(payment => ({
            id: payment.id,
            student_id: payment.student_id,
            amount: payment.amount,
            // Use payment_date checking created_at as fallback if needed
            payment_date: payment.payment_date,
            payment_method: payment.payment_method || 'offline',
            transaction_id: payment.transaction_id || '-',
            received_by_name: payment.receiver_name || 'System',
            remarks: payment.fee_type || 'Fee Payment',
            class_name: payment.class_name || 'Unknown Class'
        }));

        // Calculate total amounts for CURRENT CLASS ONLY (for summary cards)
        const currentClassRecords = currentClassName
            ? feeRecords.filter(r => r.class_name === currentClassName || r.class_name === String(studentClass))
            : feeRecords;

        const totalPaid = currentClassRecords.reduce((sum, record) => sum + parseFloat(record.paid_amount || 0), 0);

        // Total Billed comes from distinct fee types (Admission Fee, Annual Fee, etc.)
        let totalBilled = 0;
        const distinctFeeTypes = new Map();

        currentClassRecords.forEach(record => {
            if (record.fee_type && record.total_amount) {
                // Store the highest total_amount for each fee type to handle any updates/discrepancies
                const currentAmount = distinctFeeTypes.get(record.fee_type) || 0;
                const recordAmount = parseFloat(record.total_amount);
                if (recordAmount > currentAmount) {
                    distinctFeeTypes.set(record.fee_type, recordAmount);
                }
            }
        });

        // Sum up the distinct billed amounts
        distinctFeeTypes.forEach(amount => {
            totalBilled += amount;
        });

        // Add admission fee to feeStructure if it exists in distinctFeeTypes
        if (feeStructure) {
            feeStructure.admission_fee = distinctFeeTypes.get('Admission Fee') || 0;

            // If we're displaying distinct fees, we should update the total_fee in feeStructure
            // to reflect the total billed, so the UI total matches the itemized sum.
            if (totalBilled > 0) {
                feeStructure.total_fee = totalBilled;
            }

            // Add dynamic fee column data
            try {
                const [feeColumnsData] = await db.query(
                    'SELECT id, column_key, display_name, sort_order FROM fee_column_types WHERE school_id = ? AND is_active = 1 ORDER BY sort_order ASC',
                    [schoolId]
                );
                feeStructure.fee_columns = feeColumnsData;

                if (feeStructure.id && feeColumnsData.length > 0) {
                    const [colValues] = await db.query(
                        'SELECT column_type_id, amount FROM fee_column_values WHERE fee_structure_id = ?',
                        [feeStructure.id]
                    );
                    const columnValues = {};
                    colValues.forEach(v => { columnValues[v.column_type_id] = parseFloat(v.amount); });

                    // Fallback: if fee_column_values is empty, use legacy hardcoded columns
                    if (Object.keys(columnValues).length === 0) {
                        feeColumnsData.forEach(col => {
                            const legacyVal = parseFloat(feeStructure[col.column_key] || 0);
                            if (legacyVal > 0) {
                                columnValues[col.id] = legacyVal;
                            }
                        });
                    }

                    feeStructure.column_values = columnValues;
                } else {
                    feeStructure.column_values = {};
                }
            } catch (e) {
                feeStructure.fee_columns = [];
                feeStructure.column_values = {};
            }
        }

        // Fallback: If no records exist but we have a fee structure, use the fee structure total
        if (totalBilled === 0 && feeStructure && feeStructure.total_fee && currentClassRecords.length === 0) {
            totalBilled = parseFloat(feeStructure.total_fee);
        }

        const totalPending = totalBilled - totalPaid;

        // Calculate Store Pending Amount
        let storePendingAmount = 0;
        try {
            const [storePending] = await db.query(
                `SELECT COALESCE(SUM(subtotal), 0) as pending_total
                 FROM store_bills WHERE student_id = ? AND school_id = ? AND payment_status = 'pending'`,
                [studentId, schoolId]
            );
            if (storePending.length > 0) {
                storePendingAmount = parseFloat(storePending[0].pending_total) || 0;
            }
        } catch (e) { /* store_bills may not exist yet or error */ }

        const response = {
            success: true,
            feeStructure,
            feeRecords: currentClassRecords,
            feeRecord: { // aggregated object for frontend
                total_amount: totalBilled,
                paid_amount: totalPaid,
                pending_amount: totalPending
            },
            payments,
            totalPaid,
            studentClass,
            storePendingAmount: storePendingAmount
        };

        res.json(response);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/student/grievances
// @desc    Get student grievances
// @access  Private (Student)
router.get('/grievances', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentId = students[0].id;

        const [grievances] = await db.query(
            'SELECT * FROM student_grievances WHERE student_id = ? AND school_id = ? ORDER BY submitted_date DESC',
            [studentId, schoolId]
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

// @route   POST /api/student/grievances
// @desc    Submit a new grievance
// @access  Private (Student)
router.post('/grievances', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { subject, category, description, priority } = req.body;

        if (!subject || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentId = students[0].id;

        const [result] = await db.query(
            `INSERT INTO student_grievances (student_id, school_id, subject, category, description, priority, submitted_date, status)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'Pending')`,
            [studentId, schoolId, subject, category, description, priority || 'Medium']
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

// @route   GET /api/student/announcements
// @desc    Get all announcements (school-specific)
// @access  Private (Student)
router.get('/announcements', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [announcements] = await db.query(
            'SELECT * FROM announcements WHERE school_id = ? ORDER BY date DESC LIMIT 20',
            [schoolId]
        );

        res.json({
            success: true,
            announcements
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});



// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private (Student)
// @route   GET /api/student/dashboard
// @desc    Get student dashboard data (with passout support)
// @access  Private (Student)
router.get('/dashboard', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get student details including passout status
        const [students] = await db.query(
            `SELECT s.*, u.name 
             FROM students s
             JOIN users u ON s.user_id = u.id
             WHERE s.user_id = ? AND s.school_id = ?`,
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];
        const studentId = student.id;
        const studentClass = student.class;
        
        // ========== PASSOUT STUDENT CHECK ==========
        const isPassedOut = student.status === 'passed_out';
        const passedOutYear = student.passed_out_year;
        const passedOutClass = student.passed_out_class;
        // ========== END PASSOUT CHECK ==========

        // 1. Determine Attendance Mode based on class (11/12 = subject_wise, others = day_wise)
        const isHS = ['11', '12'].includes(String(studentClass)) ||
            String(studentClass).toUpperCase().includes('XI');
        const attendanceMode = isHS ? 'subject_wise' : 'day_wise';

        // 2. Get Attendance Data (school-specific)
        const [attendance] = await db.query(
            'SELECT status, subject FROM students_attendance WHERE student_id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        // Filter based on mode
        const modeAttendance = attendanceMode === 'day_wise'
            ? attendance.filter(a => a.subject === 'day_wise')
            : attendance.filter(a => a.subject !== 'day_wise');

        const totalClasses = modeAttendance.length;
        const presentClasses = modeAttendance.filter(a => a.status === 'present').length;
        const attendancePercentage = totalClasses > 0 ?
            ((presentClasses / totalClasses) * 100).toFixed(1) : 0;

        // For subject_wise: compute per-subject attendance breakdown
        let subjectAttendance = [];
        if (attendanceMode === 'subject_wise') {
            const subjectMap = {};
            modeAttendance.forEach(a => {
                if (!subjectMap[a.subject]) {
                    subjectMap[a.subject] = { subject: a.subject, present: 0, total: 0 };
                }
                subjectMap[a.subject].total++;
                if (a.status === 'present') subjectMap[a.subject].present++;
            });
            subjectAttendance = Object.values(subjectMap).map(s => ({
                subject: s.subject,
                present: s.present,
                total: s.total,
                percentage: s.total > 0 ? parseFloat(((s.present / s.total) * 100).toFixed(1)) : 0
            }));
            subjectAttendance.sort((a, b) => a.subject.localeCompare(b.subject));
        }

        // 3. Get Pending Fees (school-specific)
        const [classData] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND school_id = ?',
            [studentClass, schoolId]
        );

        let pendingFees = 0;

        // Get class name for filtering
        let currentClassName = null;
        if (classData.length > 0) {
            const [classInfo] = await db.query(
                'SELECT name FROM classes WHERE id = ? AND school_id = ?',
                [classData[0].id, schoolId]
            );
            if (classInfo.length > 0) {
                currentClassName = classInfo[0].name;
            }
        }

        // Sum pending amount from CURRENT CLASS fee records only (matching fees page logic)
        const [feeRecords] = await db.query(
            'SELECT total_amount, paid_amount, class_name, fee_type FROM fee_records WHERE student_id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        // Filter to current class only
        const currentClassRecords = currentClassName
            ? feeRecords.filter(r => r.class_name === currentClassName || r.class_name === String(studentClass))
            : feeRecords;

        if (currentClassRecords.length > 0 || classData.length > 0) {
            let totalBilled = 0;
            const distinctFeeTypes = new Map();

            currentClassRecords.forEach(record => {
                if (record.fee_type && record.total_amount) {
                    const currentAmount = distinctFeeTypes.get(record.fee_type) || 0;
                    const recordAmount = parseFloat(record.total_amount);
                    if (recordAmount > currentAmount) {
                        distinctFeeTypes.set(record.fee_type, recordAmount);
                    }
                }
            });

            distinctFeeTypes.forEach(amount => {
                totalBilled += amount;
            });

            // Fallback: if no records sum to billed but we have a fee structure
            if (totalBilled === 0 && classData.length > 0) {
                const [feeStructure] = await db.query(
                    'SELECT total_fee FROM fee_structures WHERE class_id = ? AND school_id = ?',
                    [classData[0].id, schoolId]
                );
                if (feeStructure.length > 0) {
                    totalBilled = parseFloat(feeStructure[0].total_fee);
                }
            }

            // Fallback 2: if still 0
            if (totalBilled === 0) {
                totalBilled = currentClassRecords.reduce((sum, record) => sum + parseFloat(record.total_amount || 0), 0);
            }

            const totalPaid = currentClassRecords.reduce((sum, record) => sum + parseFloat(record.paid_amount || 0), 0);
            pendingFees = totalBilled - totalPaid;
        }

        // 4. Get Store Pending Amount
        let storePendingAmount = 0;
        try {
            const [[storePending]] = await db.query(
                `SELECT COALESCE(SUM(subtotal), 0) as pending_total
                 FROM store_bills WHERE student_id = ? AND school_id = ? AND payment_status = 'pending'`,
                [studentId, schoolId]
            );
            storePendingAmount = parseFloat(storePending.pending_total) || 0;
        } catch (e) { /* store_bills may not exist yet */ }

        // 5. Get Grievances Count (school-specific)
        const [grievances] = await db.query(
            'SELECT COUNT(*) as count FROM student_grievances WHERE student_id = ? AND school_id = ?',
            [studentId, schoolId]
        );
        const grievancesCount = grievances[0].count;

        // 6. Get Recent Announcements (school-specific)
        const [announcements] = await db.query(
            'SELECT * FROM announcements WHERE school_id = ? ORDER BY date DESC LIMIT 5',
            [schoolId]
        );

        // 7. Upcoming Events (school-specific) - Get both count and event list from events table
        const [eventsCount] = await db.query(
            `SELECT COUNT(*) as count FROM events 
             WHERE event_date >= CURDATE() AND school_id = ? AND status != 'cancelled'`,
            [schoolId]
        );
        const upcomingEventsCount = eventsCount[0].count;

        // Get actual upcoming events list
        const [upcomingEventsList] = await db.query(
            `SELECT * FROM events 
             WHERE event_date >= CURDATE() AND school_id = ? AND status != 'cancelled'
             ORDER BY event_date ASC LIMIT 5`,
            [schoolId]
        );

        // 8. Get Notices (school-specific) from notices table
        const [noticesList] = await db.query(
            `SELECT * FROM notices 
             WHERE school_id = ? AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date >= CURDATE())
             ORDER BY publish_date DESC LIMIT 5`,
            [schoolId]
        );

        // 9. Total Students in Class (school-specific)
        const [classMates] = await db.query(
            'SELECT COUNT(*) as count FROM students WHERE class = ? AND section = ? AND school_id = ?',
            [studentClass, student.section, schoolId]
        );

        // 10. Get Subjects from Timetable (school-specific)
        const [subjects] = await db.query(
            `SELECT DISTINCT s.name, s.code 
             FROM timetable t 
             JOIN subjects s ON t.subject_id = s.id 
             WHERE t.class_number = ? AND t.section = ? AND t.school_id = ?
             ORDER BY s.name`,
            [studentClass, student.section, schoolId]
        );

        const dashboardData = {
            success: true,
            studentName: student.name,
            // ========== PASSOUT INFO ==========
            isPassedOut: isPassedOut,
            passedOutYear: passedOutYear,
            passedOutClass: passedOutClass,
            // ========== END PASSOUT INFO ==========
            stats: {
                attendancePercentage: parseFloat(attendancePercentage),
                attendanceMode,
                totalAttendanceDays: totalClasses,
                presentDays: presentClasses,
                pendingFees: parseFloat(pendingFees).toFixed(2),
                storePendingAmount: storePendingAmount.toFixed(2),
                totalPendingAmount: (parseFloat(pendingFees) + storePendingAmount).toFixed(2),
                upcomingEvents: upcomingEventsCount,
                submittedGrievances: grievancesCount,
                totalStudentsInClass: classMates[0].count,
                isHigherSecondary: isHS,
                subjectAttendance: subjectAttendance
            },
            announcements: announcements.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                date: new Date(a.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                priority: a.priority === 'high' ? 'High' : a.priority === 'medium' ? 'Medium' : 'Low',
                category: a.category
            })),
            events: upcomingEventsList.map(e => ({
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
            })),
            notices: noticesList.map(n => ({
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
            })),
            subjects: subjects
        };

        res.json(dashboardData);

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
// ==================== ONLINE STUDY ROUTES ====================

// @route   GET /api/student/online-study/videos
// @desc    Get all study videos for students (school-specific)
// @access  Private (Student)
router.get('/online-study/videos', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { subject_id, topic } = req.query;

        let query = `
            SELECT 
                v.*,
                s.name as subject_name
            FROM online_study_videos v
            LEFT JOIN subjects s ON v.subject_id = s.id
            WHERE v.school_id = ?
        `;
        const params = [schoolId];

        if (subject_id) {
            query += ' AND v.subject_id = ?';
            params.push(subject_id);
        }

        if (topic) {
            query += ' AND v.topic_name LIKE ?';
            params.push(`%${topic}%`);
        }

        query += ' ORDER BY v.created_at DESC';

        const [videos] = await db.query(query, params);
        res.json({
            success: true,
            videos
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
});

// @route   GET /api/student/online-study/subjects
// @desc    Get all subjects with videos (school-specific)
// @access  Private (Student)
router.get('/online-study/subjects', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [subjects] = await db.query(
            'SELECT id, name FROM subjects WHERE school_id = ? ORDER BY name',
            [schoolId]
        );
        res.json({
            success: true,
            subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects',
            error: error.message
        });
    }
});

// @route   GET /api/student/online-study/playlists
// @desc    Get all playlists (school-specific)
// @access  Private (Student)
router.get('/online-study/playlists', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { subject_id } = req.query;

        let query = `
            SELECT p.*, s.name as subject_name, 
            (SELECT COUNT(*) FROM online_study_videos v WHERE v.playlist_id = p.id) as video_count
            FROM study_playlists p
            LEFT JOIN subjects s ON p.subject_id = s.id
            WHERE p.school_id = ?
        `;
        const params = [schoolId];

        if (subject_id) {
            query += ' AND p.subject_id = ?';
            params.push(subject_id);
        }

        query += ' ORDER BY p.created_at DESC';

        const [playlists] = await db.query(query, params);
        res.json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/student/online-study/notes
// @desc    Get notes (school-specific)
// @access  Private (Student)
router.get('/online-study/notes', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { parent_type, parent_id } = req.query;

        if (!parent_type || !parent_id) {
            return res.status(400).json({ message: 'Missing parameters' });
        }

        const [notes] = await db.query(
            'SELECT * FROM study_notes WHERE school_id = ? AND parent_type = ? AND parent_id = ? ORDER BY created_at DESC',
            [schoolId, parent_type, parent_id]
        );

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== STUDENT REQUISITION ROUTES ====================

// @route   GET /api/student/requisitions
// @desc    Get student requisitions (school-specific)
// @access  Private (Student)
router.get('/requisitions', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentId = students[0].id;

        const [requisitions] = await db.query(
            'SELECT * FROM student_requisition WHERE student_id = ? AND school_id = ? ORDER BY submitted_date DESC',
            [studentId, schoolId]
        );

        res.json({
            success: true,
            requisitions
        });
    } catch (error) {
        console.error('Get requisitions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/student/requisitions
// @desc    Submit a new requisition (school-specific)
// @access  Private (Student)
router.post('/requisitions', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { title, category, description, quantity, urgency } = req.body;

        if (!title || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const [students] = await db.query(
            'SELECT s.id, u.name, s.class FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ? AND s.school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];

        const [result] = await db.query(
            `INSERT INTO student_requisition (student_id, school_id, student_name, class, title, category, description, quantity, urgency, submitted_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Pending')`,
            [student.id, schoolId, student.name, student.class, title, category, description, quantity || 1, urgency || 'Normal']
        );

        res.status(201).json({
            success: true,
            message: 'Requisition submitted successfully',
            requisitionId: result.insertId
        });
    } catch (error) {
        console.error('Submit requisition error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});



// @route   GET /api/student/library/books
// @desc    Get student's issued books (school-specific)
// @access  Private (Student)
router.get('/library/books', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get student ID
        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found'
            });
        }

        const studentId = students[0].id;

        // 2. Get issued books (school-specific)
        const [books] = await db.query(
            `SELECT 
                ib.id,
                ib.issue_date,
                ib.due_date,
                ib.status,
                ib.fine_amount,
                lb.title,
                lb.author,
                lb.isbn,
                lb.category
             FROM library_issued_books ib
             JOIN library_books lb ON ib.book_id = lb.id
             WHERE ib.student_id = ? AND ib.school_id = ?
             ORDER BY ib.issue_date DESC`,
            [studentId, schoolId]
        );

        res.json({
            success: true,
            books
        });

    } catch (error) {
        console.error('Get student library books error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/student/timetable
// @desc    Get student's class timetable (school-specific)
// @access  Private (Student)
router.get('/timetable', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get student details (class & section & stream)
        const [students] = await db.query(
            `SELECT s.id as student_id, s.class, s.section, s.stream_id, st.name as stream_name
             FROM students s
             LEFT JOIN streams st ON s.stream_id = st.id
             WHERE s.user_id = ? AND s.school_id = ?`,
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const student = students[0];

        // 2. Get all time slots
        const [timeSlots] = await db.query(
            'SELECT * FROM time_slots ORDER BY start_time'
        );

        // 3. Get timetable entries for student's class (school-specific, stream-aware)
        // Include non-elective entries + elective entries where student is enrolled
        let timetableQuery = `SELECT 
                tt.*,
                ts.slot_name,
                ts.start_time,
                ts.end_time,
                ts.is_break,
                s.name as subject_name,
                s.code as subject_code,
                t.name as teacher_name
            FROM timetable tt
            JOIN time_slots ts ON tt.time_slot_id = ts.id
            JOIN subjects s ON tt.subject_id = s.id
            LEFT JOIN teachers t ON tt.teacher_id = t.id
            WHERE tt.class_number = ? AND tt.section = ? AND tt.school_id = ?
            AND (
                tt.is_elective = 0
                OR (tt.is_elective = 1 AND tt.id IN (
                    SELECT tes.timetable_id FROM timetable_elective_students tes WHERE tes.student_id = ?
                ))
            )`;
        const queryParams = [student.class, student.section, schoolId, student.student_id];

        // Filter by stream for higher secondary students
        if (student.stream_id) {
            timetableQuery += ` AND (tt.stream_id = ? OR tt.stream_id IS NULL)`;
            queryParams.push(student.stream_id);
        } else {
            timetableQuery += ` AND tt.stream_id IS NULL`;
        }

        timetableQuery += ` ORDER BY ts.start_time`;

        const [timetable] = await db.query(timetableQuery, queryParams);

        res.json({
            success: true,
            timetable,
            timeSlots,
            studentClass: {
                class: student.class,
                section: student.section,
                stream_name: student.stream_name || null
            }
        });

    } catch (error) {
        console.error('Get student timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/student/syllabus
// @desc    Get syllabus for student's class
// @access  Private (Student)
router.get('/syllabus', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // 1. Get student class
        const [students] = await db.query(
            'SELECT class FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const studentClass = students[0].class;

        // 2. Get class_id from classes table
        const [classes] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND school_id = ?',
            [studentClass, schoolId]
        );

        if (classes.length === 0) {
            // Fallback: If class config not found, try simple query (legacy behavior)
            const [syllabus] = await db.query(
                `SELECT s.*, sub.name as subject_name, sub.code as subject_code 
                 FROM syllabus s 
                 JOIN subjects sub ON s.subject_id = sub.id 
                 WHERE s.school_id = ? AND s.class = ? 
                 ORDER BY s.created_at DESC`,
                [schoolId, studentClass]
            );
            return res.json({ success: true, syllabus });
        }

        const classId = classes[0].id;

        // 3. Get all subjects for this class and any uploaded syllabus
        const [syllabus] = await db.query(
            `SELECT 
                sub.id as subject_id,
                sub.name as subject_name, 
                sub.code as subject_code,
                s.id, 
                s.title, 
                s.file_path,
                s.content,
                s.created_at
             FROM class_subjects cs
             JOIN subjects sub ON cs.subject_id = sub.id
             LEFT JOIN syllabus s ON s.subject_id = sub.id AND s.class = ? AND s.school_id = ?
             WHERE cs.class_id = ? AND cs.school_id = ?
             ORDER BY sub.name, s.created_at DESC`,
            [studentClass, schoolId, classId, schoolId]
        );

        res.json({ success: true, syllabus });
    } catch (error) {
        console.error('Get syllabus error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ==================== STUDENT ASSIGNMENTS ROUTES ====================

// @route   GET /api/student/assignments
// @desc    Get assignments for student's class
// @access  Private (Student)
router.get('/assignments', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT s.* FROM students s WHERE s.user_id = ? AND s.school_id = ?',
            [req.user.id, schoolId]
        );
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student = students[0];

        // Fetch assignments for student's class/section
        const [assignments] = await db.query(
            `SELECT a.*, s.name as subject_name,
             (SELECT COUNT(*) FROM assignment_submissions sub WHERE sub.assignment_id = a.id AND sub.student_id = ?) as is_submitted,
             (SELECT sub.grade FROM assignment_submissions sub WHERE sub.assignment_id = a.id AND sub.student_id = ?) as grade,
             (SELECT sub.feedback FROM assignment_submissions sub WHERE sub.assignment_id = a.id AND sub.student_id = ?) as feedback
             FROM assignments a
             LEFT JOIN subjects s ON a.subject_id = s.id
             WHERE a.class = ? AND a.section = ? AND a.school_id = ?
             ORDER BY a.created_at DESC`,
            [student.id, student.id, student.id, student.class, student.section, schoolId]
        );

        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/student/assignments/:id/submit
// @desc    Submit assignment solution
// @access  Private (Student)
router.post('/assignments/:id/submit', studentUpload.single('file'), roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const assignmentId = req.params.id;

        if (!req.file) return res.status(400).json({ message: 'File is required' });

        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const studentId = students[0].id;

        // Check if already submitted
        const [existing] = await db.query(
            'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
            [assignmentId, studentId]
        );

        const filePath = `/upload/assignment_submissions/${req.file.filename}`;

        if (existing.length > 0) {
            // Update submission
            await db.query(
                `UPDATE assignment_submissions SET file_path = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [filePath, existing[0].id]
            );
            res.json({ success: true, message: 'Submission updated' });
        } else {
            // New submission
            await db.query(
                `INSERT INTO assignment_submissions (assignment_id, student_id, school_id, file_path)
                 VALUES (?, ?, ?, ?)`,
                [assignmentId, studentId, schoolId, filePath]
            );
            res.json({ success: true, message: 'Assignment submitted' });
        }
    } catch (error) {
        console.error('Submit assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== STUDENT CLASS NOTES ROUTES ====================

// @route   GET /api/student/class-notes
// @desc    Get class notes for student's class
// @access  Private (Student)
router.get('/class-notes', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT s.* FROM students s WHERE s.user_id = ? AND s.school_id = ?',
            [req.user.id, schoolId]
        );
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student = students[0];

        const [notes] = await db.query(
            `SELECT n.*, s.name as subject_name, t.name as teacher_name
             FROM class_notes n
             LEFT JOIN subjects s ON n.subject_id = s.id
             LEFT JOIN teachers t ON n.teacher_id = t.id
             WHERE n.class = ? AND n.section = ? AND n.school_id = ?
             ORDER BY n.created_at DESC`,
            [student.class, student.section, schoolId]
        );

        res.json({ success: true, notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/student/holidays
// @desc    Get holiday list
// @access  Private (Student)
router.get('/holidays', roleMiddleware('student'), async (req, res) => {
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

// @route   POST /api/student/leaves
// @desc    Apply for leave
// @access  Private (Student)
router.post('/leaves', roleMiddleware('student'), async (req, res) => {
    try {
        const { start_date, end_date, reason } = req.body;
        const schoolId = req.user.school_id;

        const [students] = await db.query('SELECT id FROM students WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const studentId = students[0].id;

        await db.query(
            `INSERT INTO student_leaves (student_id, school_id, start_date, end_date, reason)
             VALUES (?, ?, ?, ?, ?)`,
            [studentId, schoolId, start_date, end_date, reason]
        );

        res.json({ success: true, message: 'Leave application submitted' });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/student/leaves
// @desc    Get my leave history
// @access  Private (Student)
router.get('/leaves', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [students] = await db.query('SELECT id FROM students WHERE user_id = ? AND school_id = ?', [req.user.id, schoolId]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const studentId = students[0].id;

        const [leaves] = await db.query(
            `SELECT * FROM student_leaves WHERE student_id = ? ORDER BY created_at DESC`,
            [studentId]
        );

        res.json({ success: true, leaves });
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==================== FORMS ROUTES ====================

// @route   GET /api/student/forms
// @desc    Get available forms
// @access  Private (Student)
router.get('/forms', async (req, res) => {
    try {
        // Get student's school_id
        const userId = req.user.id;
        const [students] = await db.query('SELECT school_id FROM students WHERE user_id = ?', [userId]);

        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const schoolId = students[0].school_id;

        const [forms] = await db.query('SELECT * FROM forms WHERE school_id = ? ORDER BY created_at DESC', [schoolId]);
        res.json({ success: true, forms });
    } catch (error) {
        console.error('Get student forms error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/student/cards
// @desc    Get my cards
// @access  Private (Student)
router.get('/cards', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        // Get student ID and basic info first
        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [userId, schoolId]
        );
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const studentId = students[0].id;

        const [cards] = await db.query(
            `SELECT sc.*, 
                    s.student_name, s.roll_no, s.class as class_name, s.section as section_name,
                    s.father_name, s.mother_name, s.date_of_birth as dob, s.phone, s.address, s.photo_path as student_photo,
                    sch.name as school_name, sch.logo as school_logo, sch.address as school_address, 
                    sch.phone as school_phone, sch.email as school_email, sch.pincode as school_pincode,
                    sch.principal_signature
             FROM student_cards sc
             JOIN students s ON sc.student_id = s.id
             JOIN schools sch ON sc.school_id = sch.id
             WHERE sc.student_id = ? AND sc.school_id = ? 
             ORDER BY sc.created_at DESC`,
            [studentId, schoolId]
        );

        res.json({ success: true, cards });
    } catch (error) {
        console.error('Get my cards error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// STORE PURCHASES (Student Portal)
// ==========================================

// @route   GET /api/student/store-purchases
// @desc    Get all store bills for the logged-in student
router.get('/store-purchases', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        // Get student ID
        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [userId, schoolId]
        );
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const studentId = students[0].id;

        // Get all bills
        const [bills] = await db.query(
            `SELECT sb.*, s.name as store_name, s.slug as store_slug, s.icon as store_icon
             FROM store_bills sb
             JOIN stores s ON sb.store_id = s.id
             WHERE sb.student_id = ? AND sb.school_id = ?
             ORDER BY sb.created_at DESC`,
            [studentId, schoolId]
        );

        // Parse items_json for each bill
        const parsedBills = bills.map(b => ({
            ...b,
            items: JSON.parse(b.items_json || '[]')
        }));

        // Calculate summary
        const totalSpent = bills.reduce((s, b) => s + parseFloat(b.subtotal), 0);
        const pendingAmount = bills.filter(b => b.payment_status === 'pending').reduce((s, b) => s + parseFloat(b.subtotal), 0);
        const paidAmount = bills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + parseFloat(b.subtotal), 0);

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
        console.error('Store purchases error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/student/store-bills/:billNumber
// @desc    Get a specific store bill for student view/download
router.get('/store-bills/:billNumber', async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.school_id;

        const [students] = await db.query(
            'SELECT id FROM students WHERE user_id = ? AND school_id = ?',
            [userId, schoolId]
        );
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const [bills] = await db.query(
            `SELECT sb.*, s.name as store_name, s.slug as store_slug, s.icon as store_icon,
                    sc.name as school_name, sc.address as school_address, sc.phone as school_phone
             FROM store_bills sb
             JOIN stores s ON sb.store_id = s.id
             JOIN schools sc ON sb.school_id = sc.id
             WHERE sb.bill_number = ? AND sb.student_id = ? AND sb.school_id = ?`,
            [req.params.billNumber, students[0].id, schoolId]
        );

        if (bills.length === 0) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        const bill = bills[0];
        bill.items = JSON.parse(bill.items_json || '[]');

        res.json({ success: true, bill });
    } catch (error) {
        console.error('Fetch student bill error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;