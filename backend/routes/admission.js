const express = require('express');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { generateStudentUniqueId } = require('../utils/idGenerator');
const { generateApplicationPDF, generatePaymentReceiptPDF, generateReportPDF } = require('../utils/pdfGenerator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ==================== MULTER CONFIG FOR APPLICATION DOCUMENTS ====================
const applicationDocsDir = path.join(__dirname, '..', 'upload', 'application_documents');

const studentPhotosDir = path.join(__dirname, '..', 'upload', 'student_photos');

// Ensure directories exist
if (!fs.existsSync(applicationDocsDir)) {
    fs.mkdirSync(applicationDocsDir, { recursive: true });
}
if (!fs.existsSync(studentPhotosDir)) {
    fs.mkdirSync(studentPhotosDir, { recursive: true });
}

const applicationDocStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'student_photo') {
            cb(null, studentPhotosDir);
        } else {
            cb(null, applicationDocsDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const fieldName = file.fieldname;

        // Use simpler filename for student photos if desired, or keep consistent
        cb(null, `app-${req.params.id}-${fieldName}-${uniqueSuffix}${ext}`);
    }
});

const applicationDocFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.'), false);
    }
};

const uploadApplicationDocs = multer({
    storage: applicationDocStorage,
    fileFilter: applicationDocFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

// Ensure required columns exist on student_applications table
(async () => {
    try {
        await db.query(`ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS father_phone VARCHAR(20) DEFAULT NULL`);
    } catch (e) {
        try { await db.query(`ALTER TABLE student_applications ADD COLUMN father_phone VARCHAR(20) DEFAULT NULL`); } catch (err) {}
    }
    try {
        await db.query(`ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(20) DEFAULT NULL`);
    } catch (e) {
        try { await db.query(`ALTER TABLE student_applications ADD COLUMN mother_phone VARCHAR(20) DEFAULT NULL`); } catch (err) {}
    }
    try {
        await db.query(`ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS applicable_months TEXT DEFAULT NULL`);
    } catch (e) {
        try { await db.query(`ALTER TABLE student_applications ADD COLUMN applicable_months TEXT DEFAULT NULL`); } catch (err) {}
    }
})();

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// @route   POST /api/admission/applications
// @desc    Create new application (PUBLIC)
// @access  Public
router.post('/applications', uploadApplicationDocs.fields([
    { name: 'student_photo', maxCount: 1 },
    { name: 'father_photo', maxCount: 1 },
    { name: 'mother_photo', maxCount: 1 },
    { name: 'student_aadhaar', maxCount: 1 },
    { name: 'father_aadhaar', maxCount: 1 },
    { name: 'mother_aadhaar', maxCount: 1 },
    { name: 'father_pan', maxCount: 1 },
    { name: 'mother_pan', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            studentName, dateOfBirth, gender, class: studentClass, stream_id, fatherName, motherName,
            fatherPhone, motherPhone, phone, email, address, previousSchool, previousClass, bloodGroup, medicalConditions,
            applicable_months
        } = req.body;

        if (!studentName || !dateOfBirth || !gender || !studentClass) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (Student Name, Date of Birth, Gender, Class)'
            });
        }

        const fPhone = fatherPhone || null;
        const mPhone = motherPhone || null;
        const parentPhoneVal = fPhone || mPhone || null;
        const studentPhoneVal = (phone && phone.trim() !== '') ? phone.trim() : null;

        // Check if student phone number is already in use (if provided)
        if (studentPhoneVal) {
            const [existingUser] = await db.query(
                'SELECT id FROM users WHERE phone = ? AND school_id = ?',
                [studentPhoneVal, req.body.school_id || 1]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Student phone number is already registered'
                });
            }

            const [existingApp] = await db.query(
                'SELECT id FROM student_applications WHERE phone = ? AND school_id = ? AND status != "rejected"',
                [studentPhoneVal, req.body.school_id || 1]
            );

            if (existingApp.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'An application with this student phone number already exists'
                });
            }
        }

        // Generate Application Number
        const [lastApp] = await db.query(
            'SELECT application_no FROM student_applications ORDER BY id DESC LIMIT 1'
        );

        let applicationNo;
        if (lastApp.length > 0) {
            const lastNo = parseInt(lastApp[0].application_no.replace('APP', ''));
            applicationNo = `APP${String(lastNo + 1).padStart(7, '0')}`;
        } else {
            applicationNo = 'APP2026001';
        }

        const schoolId = req.body.school_id || 1;

        const files = req.files || {};
        const studentPhoto = files.student_photo ? `/upload/student_photos/${files.student_photo[0].filename}` : null;
        const fatherPhoto = files.father_photo ? `/upload/application_documents/${files.father_photo[0].filename}` : null;
        const motherPhoto = files.mother_photo ? `/upload/application_documents/${files.mother_photo[0].filename}` : null;
        const studentAadhaar = files.student_aadhaar ? `/upload/application_documents/${files.student_aadhaar[0].filename}` : null;
        const fatherAadhaar = files.father_aadhaar ? `/upload/application_documents/${files.father_aadhaar[0].filename}` : null;
        const motherAadhaar = files.mother_aadhaar ? `/upload/application_documents/${files.mother_aadhaar[0].filename}` : null;
        const fatherPan = files.father_pan ? `/upload/application_documents/${files.father_pan[0].filename}` : null;
        const motherPan = files.mother_pan ? `/upload/application_documents/${files.mother_pan[0].filename}` : null;

        const applicableMonthsStr = Array.isArray(applicable_months) ? JSON.stringify(applicable_months) : (applicable_months || null);

        const [result] = await db.query(
            `INSERT INTO student_applications 
       (application_no, student_name, date_of_birth, gender, class, stream_id, father_name, mother_name, 
        father_phone, mother_phone, phone, parent_phone, email, address, previous_school, previous_class, blood_group, 
        medical_conditions, student_photo, father_photo, mother_photo, student_aadhaar, father_aadhaar, mother_aadhaar, father_pan, mother_pan, applicable_months, applied_date, processed_by, school_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), NULL, ?)`,
            [
                applicationNo, studentName, dateOfBirth, gender, studentClass, stream_id || null, fatherName || '', motherName || '',
                fPhone, mPhone, studentPhoneVal || '', parentPhoneVal || '', email || '', address || '', previousSchool || null, previousClass || null, bloodGroup || null, medicalConditions || null,
                studentPhoto, fatherPhoto, motherPhoto, studentAadhaar, fatherAadhaar, motherAadhaar, fatherPan, motherPan,
                applicableMonthsStr, schoolId
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            applicationId: result.insertId,
            applicationNo,
            application: {
                id: result.insertId,
                application_no: applicationNo
            }
        });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admission/applications/:id/documents
// @desc    Upload documents for an application (photos, Aadhaar, PAN)
// @access  Public
router.post('/applications/:id/documents', uploadApplicationDocs.fields([
    { name: 'student_photo', maxCount: 1 },
    { name: 'father_photo', maxCount: 1 },
    { name: 'mother_photo', maxCount: 1 },
    { name: 'student_aadhaar', maxCount: 1 },
    { name: 'father_aadhaar', maxCount: 1 },
    { name: 'mother_aadhaar', maxCount: 1 },
    { name: 'father_pan', maxCount: 1 },
    { name: 'mother_pan', maxCount: 1 }
]), async (req, res) => {
    try {
        const applicationId = req.params.id;

        // Check if application exists
        const [application] = await db.query('SELECT id FROM student_applications WHERE id = ?', [applicationId]);
        if (application.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Build update query dynamically based on uploaded files
        const updates = [];
        const values = [];

        const fileFields = [
            'student_photo', 'father_photo', 'mother_photo',
            'student_aadhaar', 'father_aadhaar', 'mother_aadhaar',
            'father_pan', 'mother_pan'
        ];

        fileFields.forEach(field => {
            if (req.files && req.files[field] && req.files[field][0]) {
                updates.push(`${field} = ?`);
                const folder = field === 'student_photo' ? 'student_photos' : 'application_documents';
                values.push(`/upload/${folder}/${req.files[field][0].filename}`);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        values.push(applicationId);
        await db.query(`UPDATE student_applications SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({
            success: true,
            message: 'Documents uploaded successfully',
            uploadedFiles: Object.keys(req.files || {})
        });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admission/applications
// @desc    Get all applications (PUBLIC - filterable by school)
// @access  Public
router.get('/applications', async (req, res) => {
    try {
        const { status, school_id } = req.query;

        let query = 'SELECT * FROM student_applications WHERE 1=1';
        const params = [];

        // Filter by school if provided
        if (school_id) {
            query += ' AND school_id = ?';
            params.push(school_id);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [applications] = await db.query(query, params);

        res.json({
            success: true,
            applications
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admission/applications/:id
// @desc    Get application details (PUBLIC)
// @access  Public
router.get('/applications/:id', async (req, res) => {
    try {
        const [applications] = await db.query(
            `SELECT sa.*, s.name AS stream_name 
             FROM student_applications sa 
             LEFT JOIN streams s ON sa.stream_id = s.id 
             WHERE sa.id = ?`,
            [req.params.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            application: applications[0]
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admission/applications/:id/pdf
// @desc    Download application PDF (PUBLIC)
// @access  Public
router.get('/applications/:id/pdf', async (req, res) => {
    try {
        const [applications] = await db.query(
            `SELECT sa.*, s.name as school_name, s.address as school_address, s.city as school_city, s.state as school_state, s.pincode as school_pincode, s.phone as school_phone, s.email as school_email, s.logo as school_logo
             FROM student_applications sa
             JOIN schools s ON sa.school_id = s.id
             WHERE sa.id = ?`,
            [req.params.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const application = applications[0];

        // set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Application_${application.application_no}.pdf`);

        // generate and pipe pdf
        generateApplicationPDF(application, res);

    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admission/applications/:id/payment-receipt
// @desc    Download payment receipt PDF for admitted student
// @access  Public
router.get('/applications/:id/payment-receipt', async (req, res) => {
    try {
        // Get application details with school info
        const [applications] = await db.query(
            `SELECT sa.*, s.name as school_name, s.address as school_address, s.city as school_city, s.state as school_state, s.pincode as school_pincode, s.phone as school_phone, s.email as school_email, s.logo as school_logo
             FROM student_applications sa
             JOIN schools s ON sa.school_id = s.id
             WHERE sa.id = ?`,
            [req.params.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const application = applications[0];

        if (application.status.toLowerCase() !== 'admitted') {
            return res.status(400).json({
                success: false,
                message: 'Payment receipt is only available for admitted students'
            });
        }

        // Get fee records - ONLY admission-time fees (Admission Fee + Annual Fee created during admission)
        // Strategy 1: Using application_id (most reliable, for newly admitted students)
        let [studentFees] = await db.query(
            `SELECT fr.* 
             FROM fee_records fr
             JOIN students s ON fr.student_id = s.id
             WHERE s.application_id = ?
             AND fr.fee_type IN ('Admission Fee', 'Annual Fee')
             ORDER BY fr.created_at ASC`,
            [req.params.id]
        );

        // Strategy 2: Fallback to email match (for older records)
        if (studentFees.length === 0 && application.email) {
            [studentFees] = await db.query(
                `SELECT fr.* 
                 FROM fee_records fr
                 JOIN students s ON fr.student_id = s.id
                 JOIN users u ON s.user_id = u.id
                 WHERE u.email = ?
                 AND fr.fee_type IN ('Admission Fee', 'Annual Fee')
                 ORDER BY fr.created_at ASC`,
                [application.email]
            );
        }

        // Strategy 3: Fallback to phone + name + class match (most flexible)
        if (studentFees.length === 0) {
            [studentFees] = await db.query(
                `SELECT fr.* 
                 FROM fee_records fr
                 JOIN students s ON fr.student_id = s.id
                 WHERE s.phone = ? AND s.student_name = ? AND s.class = ?
                 AND fr.fee_type IN ('Admission Fee', 'Annual Fee')
                 ORDER BY fr.created_at ASC`,
                [application.phone, application.student_name, application.class]
            );
        }

        // Filter to only keep the FIRST record of each fee type (admission-time payments)
        const admissionTimeFees = [];
        const seenTypes = new Set();
        for (const fee of studentFees) {
            if (!seenTypes.has(fee.fee_type)) {
                admissionTimeFees.push(fee);
                seenTypes.add(fee.fee_type);
            }
        }
        studentFees = admissionTimeFees;


        // Prepare payment data
        let paymentData = {
            total_amount: 0,
            paid_amount: 0,
            pending_amount: 0,
            payment_method: 'offline',
            status: 'pending',
            academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            fees: [],
            transaction_id: ''
        };

        if (studentFees.length > 0) {
            // Populate fees array for PDF breakdown
            paymentData.fees = studentFees.map(fee => ({
                type: fee.fee_type,
                amount: Number(fee.total_amount),
                paid: Number(fee.paid_amount),
                pending: Number(fee.pending_amount)
            }));

            // Calculate totals
            paymentData.total_amount = studentFees.reduce((sum, fee) => sum + Number(fee.total_amount), 0);
            paymentData.paid_amount = studentFees.reduce((sum, fee) => sum + Number(fee.paid_amount), 0);
            paymentData.pending_amount = studentFees.reduce((sum, fee) => sum + Number(fee.pending_amount), 0);

            // Determine status
            paymentData.status = paymentData.pending_amount <= 0 ? 'paid' : 'pending';

            // Extract common details from the first record (or Admission Fee specifically)
            const primaryRecord = studentFees.find(f => f.fee_type === 'Admission Fee') || studentFees[0];
            paymentData.payment_method = primaryRecord.payment_method;
            paymentData.transaction_id = primaryRecord.transaction_id || '';
            paymentData.academic_year = primaryRecord.academic_year;
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Payment_Receipt_${application.application_no}.pdf`);

        // Generate and pipe PDF
        generatePaymentReceiptPDF(application, paymentData, res);

    } catch (error) {
        console.error('Generate payment receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admission/fee-structure/:classNumber
// @desc    Get fee structure for a specific class (PUBLIC - school-specific, optionally stream-specific)
// @access  Public
router.get('/fee-structure/:classNumber', async (req, res) => {
    try {
        const { classNumber } = req.params;
        const { school_id, stream_id } = req.query;
        const schoolId = school_id || 1; // Default to school 1

        console.log('Fetching fee structure for class:', classNumber, 'school:', schoolId, 'stream:', stream_id);

        // First get the class_id from classes table (school-specific)
        const [classData] = await db.query(
            'SELECT id FROM classes WHERE class_number = ? AND school_id = ?',
            [classNumber, schoolId]
        );

        if (classData.length === 0) {
            console.log('Class not found:', classNumber);
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        const classId = classData[0].id;
        console.log('Class ID found:', classId);

        // Get fee structure for this class (school-specific, stream-specific if provided)
        let query = 'SELECT * FROM fee_structures WHERE class_id = ? AND school_id = ?';
        const queryParams = [classId, schoolId];

        if (stream_id) {
            query += ' AND stream_id = ?';
            queryParams.push(stream_id);
        }

        const [feeStructure] = await db.query(query, queryParams);

        // Fetch school-specific admission fee
        const [admissionFees] = await db.query('SELECT amount FROM fee_admission WHERE school_id = ? LIMIT 1', [schoolId]);
        const admissionFee = admissionFees.length > 0 ? admissionFees[0].amount : 0;

        if (feeStructure.length === 0) {
            console.log('Fee structure not found for class_id:', classId);
            // Return admission fee even if structure missing, but frontend expects feeStructure
            return res.status(404).json({
                success: false,
                message: 'Fee structure not configured for this class'
            });
        }

        console.log('Fee structure found:', feeStructure[0]);

        // Fetch dynamic fee columns & values for this fee structure
        let feeColumnsData = [];
        let columnValues = {};
        try {
            const [columns] = await db.query(
                'SELECT id, column_key, display_name, sort_order FROM fee_column_types WHERE school_id = ? AND is_active = 1 ORDER BY sort_order ASC',
                [schoolId]
            );
            feeColumnsData = columns;

            if (feeStructure[0].id && columns.length > 0) {
                const [values] = await db.query(
                    'SELECT column_type_id, amount FROM fee_column_values WHERE fee_structure_id = ?',
                    [feeStructure[0].id]
                );
                values.forEach(v => { columnValues[v.column_type_id] = parseFloat(v.amount); });
            }
        } catch (e) { /* fee_column_types may not exist yet */ }

        // Fetch applicable months for this class if configured
        let applicableMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let monthsCount = 12;
        try {
            const cleanCls = String(classNumber).replace(/^Class\s+/i, '').replace(/\s+Only$/i, '').trim();
            const [disc] = await db.query(`
                SELECT sfd.applicable_months 
                FROM student_fee_discounts sfd
                JOIN students s ON s.id = sfd.student_id
                WHERE s.school_id = ? AND (s.class = ? OR s.class = ? OR s.class LIKE ?) AND sfd.applicable_months IS NOT NULL
                LIMIT 1
            `, [schoolId, classNumber, cleanCls, `Class ${cleanCls}%`]);

            if (disc.length > 0 && disc[0].applicable_months) {
                const parsed = typeof disc[0].applicable_months === 'string' ? JSON.parse(disc[0].applicable_months) : disc[0].applicable_months;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    applicableMonths = parsed;
                    monthsCount = parsed.length;
                }
            }
        } catch (e) {
            console.error('Error fetching applicable months for fee-structure:', e);
        }

        res.json({
            success: true,
            feeStructure: {
                ...feeStructure[0],
                admission_fee: admissionFee,
                fee_columns: feeColumnsData,
                column_values: columnValues,
                applicable_months: applicableMonths,
                months_count: monthsCount
            }
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

// @route   GET /api/admission/classes
// @desc    Get available classes for a school
// @access  Public
router.get('/classes', async (req, res) => {
    try {
        const { school_id } = req.query;
        const schoolId = school_id || 1;

        console.log('Fetching classes for school:', schoolId);

        const [classes] = await db.query(
            'SELECT id, class_number, name FROM classes WHERE school_id = ? ORDER BY class_number',
            [schoolId]
        );

        console.log(`Found ${classes.length} classes`);

        res.json({
            success: true,
            classes: classes
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admission/streams
// @desc    Get available streams/groups for a school
// @access  Public
router.get('/streams', async (req, res) => {
    try {
        const { school_id } = req.query;
        const schoolId = school_id || 1;

        console.log('Fetching streams for school:', schoolId);

        const [streams] = await db.query(
            'SELECT id, name AS stream_name FROM streams WHERE school_id = ? ORDER BY name',
            [schoolId]
        );

        console.log(`Found ${streams.length} streams`);

        res.json({
            success: true,
            streams: streams
        });
    } catch (error) {
        console.error('Get streams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admission/class-sections/:classId
// @desc    Get sections assigned to a specific class
// @access  Public
router.get('/class-sections/:classId', async (req, res) => {
    try {
        const { school_id, stream_id } = req.query;
        const schoolId = school_id || 1;
        const classId = req.params.classId;

        let query = `
            SELECT cs.id as mapping_id, cs.class_id, cs.section_id, 
                   s.name as section_name, s.code as section_code
            FROM class_sections cs
            JOIN sections s ON cs.section_id = s.id
            WHERE cs.school_id = ? AND cs.class_id = ?
        `;
        const params = [schoolId, classId];

        if (stream_id) {
            query += ' AND (cs.stream_id = ? OR cs.stream_id IS NULL)';
            params.push(stream_id);
        }

        query += ' ORDER BY s.name';

        const [sections] = await db.query(query, params);

        res.json({ success: true, sections });
    } catch (error) {
        console.error('Get class sections error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admission/dashboard
// @desc    Get admission dashboard statistics (PUBLIC - filterable by school)
// @access  Public
router.get('/dashboard', async (req, res) => {
    try {
        const { school_id } = req.query;
        const schoolId = school_id || null; // Allow filtering by school

        console.log('📋 Admission Dashboard Request - school_id param:', school_id);
        console.log('📋 Using schoolId for filtering:', schoolId);

        const schoolFilter = schoolId ? 'AND school_id = ?' : '';
        const params = schoolId ? [schoolId] : [];

        console.log('📋 Query filter:', schoolFilter, 'Params:', params);

        // Total applications
        const [totalApplications] = await db.query(
            `SELECT COUNT(*) as count FROM student_applications WHERE 1=1 ${schoolFilter}`,
            params
        );

        // Pending applications
        const [pendingApplications] = await db.query(
            `SELECT COUNT(*) as count FROM student_applications WHERE status = "pending" ${schoolFilter}`,
            params
        );

        // Admitted today
        const [admittedToday] = await db.query(
            `SELECT COUNT(*) as count FROM student_applications WHERE status = "admitted" AND admitted_date = CURDATE() ${schoolFilter}`,
            params
        );

        // Rejected this week
        const [rejectedThisWeek] = await db.query(
            `SELECT COUNT(*) as count FROM student_applications WHERE status = "rejected" AND rejected_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${schoolFilter}`,
            params
        );

        console.log('📋 Dashboard Stats:', {
            total: totalApplications[0].count,
            pending: pendingApplications[0].count,
            admitted: admittedToday[0].count,
            rejected: rejectedThisWeek[0].count
        });

        res.json({
            success: true,
            stats: {
                totalApplications: totalApplications[0].count,
                pendingReview: pendingApplications[0].count,
                admittedToday: admittedToday[0].count,
                rejectedThisWeek: rejectedThisWeek[0].count
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

// @route   GET /api/admission/recent-applications
// @desc    Get recent applications (PUBLIC - filterable by school)
// @access  Public
router.get('/recent-applications', async (req, res) => {
    try {
        const { school_id } = req.query;
        const schoolId = school_id || null;

        let query = 'SELECT id, application_no, student_name, class, applied_date, created_at, status FROM student_applications WHERE 1=1';
        const params = [];

        if (schoolId) {
            query += ' AND school_id = ?';
            params.push(schoolId);
        }

        query += ' ORDER BY created_at DESC LIMIT 5';

        const [applications] = await db.query(query, params);

        res.json({
            success: true,
            applications
        });
    } catch (error) {
        console.error('Get recent applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// PROTECTED ROUTES - Authentication required
// Middleware applied to each route individually
// ============================================

const logFile = path.join(__dirname, '../debug_admission_log.txt');

function logDebug(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(logFile, logEntry);
}

// @route   PUT /api/admission/applications/:id/admit
// @desc    Admit an application with payment tracking
router.put('/applications/:id/admit', authMiddleware, roleMiddleware('admission'), async (req, res) => {
    try {
        const {
            section,
            admissionFeeAmount, annualFeeAmount,
            admissionPaid, annualPaid,
            admissionPaymentMethod, admissionPaymentDate, admissionTransactionId,
            annualPaymentMethod, annualPaymentDate, annualTransactionId,
            rollNo
        } = req.body;

        logDebug('Admit Request Received', req.body);


        // 1. Basic Validation
        if (!section) {
            return res.status(400).json({
                success: false,
                message: 'Please provide section'
            });
        }

        if (!admissionFeeAmount && !annualFeeAmount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one fee amount (Admission or Annual)'
            });
        }

        // 2. Fetch Application Data (verify it belongs to user's school)
        const schoolId = req.user.school_id;

        const [applications] = await db.query(
            'SELECT * FROM student_applications WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (applications.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found or does not belong to your school' });
        }

        const application = applications[0];

        if (application.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Application is not pending' });
        }

        // 3. Start Transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Step A: Update Application Status
            await connection.query(
                `UPDATE student_applications 
                 SET status = 'admitted', section = ?, admitted_date = CURDATE(), processed_by = ?
                 WHERE id = ?`,
                [section, req.user.id, req.params.id]
            );

            // removed admitted_students Step B

            // Step B: Create User Account (Required to get user_id) with school_id
            // Password = Date of Birth (DDMMYYYY) - Plain text (NOT hashed)
            let passwordStr = '123456';
            if (application.date_of_birth) {
                const dob = new Date(application.date_of_birth);
                passwordStr = dob.getDate().toString().padStart(2, '0') +
                    (dob.getMonth() + 1).toString().padStart(2, '0') +
                    dob.getFullYear();
            }
            // Store password as plain text (no hashing)
            // If email is not provided, store as NULL (database allows multiple NULLs in unique column)
            const userEmail = (application.email && application.email.trim() !== '') ? application.email : null;

            // Verify student phone is still unique before creating user
            const [existingPhone] = await connection.query(
                'SELECT id FROM users WHERE phone = ?',
                [application.phone]
            );
            if (existingPhone.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'This student phone number is already registered. Cannot confirm admission.'
                });
            }

            const hashedAdmissionPassword = await bcrypt.hash(passwordStr, 10);
            
            // Generate Unique ID
            const uniqueId = await generateStudentUniqueId(schoolId, connection);

            const [userResult] = await connection.query(
                `INSERT INTO users (email, password, role, name, phone, status, school_id, student_unique_id)
                 VALUES (?, ?, 'student', ?, ?, 'active', ?, ?)`,
                [userEmail, hashedAdmissionPassword, application.student_name, application.phone, schoolId, uniqueId]
            );

            const userId = userResult.insertId;

            // Step C: Generate Sequential Roll Number (Class & Section wise, school-specific)
            const currentYear = new Date().getFullYear();

            // Get max roll number for this class & section to avoid gaps/duplicates (locking row to prevent race condition)
            const [existingStudents] = await connection.query(
                'SELECT COALESCE(MAX(CAST(roll_no AS UNSIGNED)), 0) as count FROM students WHERE class = ? AND section = ? AND school_id = ? FOR UPDATE',
                [application.class, section, schoolId]
            );

            const nextSeq = parseInt(existingStudents[0].count, 10) + 1;
            //
            const rollNo = `${nextSeq}`;

            // Step D: Insert into STUDENTS table (Now stores student_name, application_id, photo_path, school_id, and stream_id)
            const [studentResult] = await connection.query(
                `INSERT INTO students 
                 (user_id, student_unique_id, application_id, student_name, roll_no, class, stream_id, section, date_of_birth, gender,
                  address, father_name, mother_name, father_phone, mother_phone, phone, email,
                  admission_date, blood_group, medical_conditions, previous_school, previous_class, 
                  photo_path, father_photo, mother_photo, student_aadhaar, father_aadhaar, mother_aadhaar, 
                  father_pan, mother_pan, school_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    uniqueId,
                    req.params.id,  // Store application_id for direct link
                    application.student_name,
                    rollNo,
                    application.class,
                    application.stream_id || null, // stream_id
                    section,
                    application.date_of_birth,
                    application.gender,
                    application.address,
                    application.father_name,
                    application.mother_name,
                    application.father_phone || application.parent_phone || null, // father_phone
                    application.mother_phone || null,                             // mother_phone
                    application.phone,        // student phone
                    application.email || null,// student email (nullable)
                    application.blood_group,
                    application.medical_conditions,
                    application.previous_school,
                    application.previous_class,
                    application.student_photo || null,
                    application.father_photo || null,
                    application.mother_photo || null,
                    application.student_aadhaar || null,
                    application.father_aadhaar || null,
                    application.mother_aadhaar || null,
                    application.father_pan || null,
                    application.mother_pan || null,
                    schoolId  // Add school_id
                ]
            );


            const studentId = studentResult.insertId;

            if (application.applicable_months) {
                await connection.query(`
                    INSERT INTO student_fee_discounts (school_id, student_id, applicable_months)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE applicable_months = VALUES(applicable_months)
                `, [schoolId, studentId, application.applicable_months]);
            }

            // Step E: Create Fee Records (Admission and Annual separately)
            const academicYear = `${currentYear}-${currentYear + 1}`;
            const dueDateStr = '2026-05-31';

            // Helper to determine payment details
            const getPaymentDetails = (method, date, txId, paidAmt) => {
                const now = new Date();
                const currentDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
                const recordPaymentDate = method === 'online' ? date : (Number(paidAmt) > 0 ? currentDateTime : null);

                let validMethod = 'cash';
                if (method === 'online') validMethod = 'upi';
                else if (method === 'offline') validMethod = 'cash';

                return { recordPaymentDate, validMethod, txId: txId || null };
            };

            // 1. Admission Fee Record
            const totalAdmissionFee = Number(admissionFeeAmount) || 0;
            const paidAdmission = Number(admissionPaid) || 0;
            const pendingAdmission = totalAdmissionFee - paidAdmission;

            if (totalAdmissionFee > 0) {
                const { recordPaymentDate, validMethod, txId } = getPaymentDetails(admissionPaymentMethod, admissionPaymentDate, admissionTransactionId, paidAdmission);

                const [admFeeResult] = await connection.query(
                    `INSERT INTO fee_records 
                     (student_id, student_name, class_name, fee_type, total_amount, paid_amount, pending_amount, 
                      payment_method, transaction_id, payment_date, last_payment_date, status, academic_year, received_by, school_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        studentId,
                        application.student_name,
                        application.class,
                        'Admission Fee',
                        totalAdmissionFee,
                        paidAdmission,
                        pendingAdmission,
                        admissionPaymentMethod,
                        txId,
                        recordPaymentDate,
                        recordPaymentDate,
                        pendingAdmission <= 0 ? 'paid' : 'pending',
                        academicYear,
                        req.user.id,
                        schoolId
                    ]
                );

                if (paidAdmission > 0) {
                    logDebug('Updated Admission Fee Record with payment', {
                        fee_record_id: admFeeResult.insertId,
                        student_id: studentId,
                        amount: paidAdmission
                    });
                } else {
                    logDebug('Admission Fee Record created (pending)', { paidAdmission });
                }
            }

            // 2. Annual Fee Record
            const totalAnnualFee = Number(annualFeeAmount) || 0;
            const paidAnnual = Number(annualPaid) || 0;
            const pendingAnnual = totalAnnualFee - paidAnnual;

            if (totalAnnualFee > 0) {
                const { recordPaymentDate, validMethod, txId } = getPaymentDetails(annualPaymentMethod, annualPaymentDate, annualTransactionId, paidAnnual);

                const [annFeeResult] = await connection.query(
                    `INSERT INTO fee_records 
                     (student_id, student_name, class_name, fee_type, total_amount, paid_amount, pending_amount, 
                      payment_method, transaction_id, payment_date, last_payment_date, status, academic_year, received_by, school_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        studentId,
                        application.student_name,
                        application.class,
                        'Annual Fee',
                        totalAnnualFee,
                        paidAnnual,
                        pendingAnnual,
                        annualPaymentMethod,
                        txId,
                        recordPaymentDate,
                        recordPaymentDate,
                        pendingAnnual <= 0 ? 'paid' : 'pending',
                        academicYear,
                        req.user.id,
                        schoolId
                    ]
                );

                if (paidAnnual > 0) {
                    logDebug('Updated Annual Fee Record with payment', {
                        fee_record_id: annFeeResult.insertId,
                        student_id: studentId,
                        amount: paidAnnual
                    });
                } else {
                    logDebug('Annual Fee Record created (pending)', { paidAnnual });
                }
            }

            logDebug('Admission process completed successfully');

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: 'Student admitted and records created successfully',
                studentId: studentId
            });

        } catch (error) {
            await connection.rollback();
            connection.release();

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Admission failed: Email already exists in the system.'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Admit application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
// @route   PUT /api/admission/applications/:id/reject
// @desc    Reject an application with reason
// @access  Private (Admission)
router.put('/applications/:id/reject', authMiddleware, roleMiddleware('admission'), async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rejection reason'
            });
        }

        // Check if application exists and belongs to user's school
        const schoolId = req.user.school_id;

        const [applications] = await db.query(
            'SELECT * FROM student_applications WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or does not belong to your school'
            });
        }

        if (applications[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Application is not pending'
            });
        }

        // Update application with rejection (school_id already verified)
        await db.query(
            `UPDATE student_applications 
       SET status = 'rejected', rejected_date = CURDATE(), rejection_reason = ?, processed_by = ?
       WHERE id = ?`,
            [rejectionReason, req.user.id, req.params.id]
        );

        res.json({
            success: true,
            message: 'Application rejected successfully'
        });
    } catch (error) {
        console.error('Reject application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});



// @route   DELETE /api/admission/applications/:id
// @desc    Delete application
// @access  Private (Admission)
router.delete('/applications/:id', authMiddleware, roleMiddleware('admission'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [result] = await db.query(
            'DELETE FROM student_applications WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or does not belong to your school'
            });
        }

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


// @route   PUT /api/admission/applications/:id
// @desc    Update application details
// @access  Private (Admission)
router.put('/applications/:id', authMiddleware, roleMiddleware('admission'), async (req, res) => {
    try {
        const {
            studentName, dateOfBirth, class: studentClass, stream_id, fatherName, motherName,
            fatherPhone, motherPhone, phone, email, address, previousSchool, previousClass, bloodGroup, medicalConditions
        } = req.body;

        if (!studentName || !dateOfBirth || !studentClass) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const fPhone = fatherPhone || null;
        const mPhone = motherPhone || null;
        const parentPhoneVal = fPhone || mPhone || null;
        const studentPhoneVal = (phone && phone.trim() !== '') ? phone.trim() : null;

        // Check if application exists
        const [applications] = await db.query(
            'SELECT * FROM student_applications WHERE id = ?',
            [req.params.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update application
        await db.query(
            `UPDATE student_applications 
             SET student_name = ?, date_of_birth = ?, class = ?, stream_id = ?, father_name = ?, mother_name = ?, 
             father_phone = ?, mother_phone = ?, phone = ?, parent_phone = ?, email = ?, address = ?, previous_school = ?, previous_class = ?, blood_group = ?, 
             medical_conditions = ?
             WHERE id = ?`,
            [studentName, dateOfBirth, studentClass, stream_id || null, fatherName, motherName, fPhone, mPhone, studentPhoneVal, parentPhoneVal, email, address,
                previousSchool, previousClass, bloodGroup, medicalConditions, req.params.id]
        );

        res.json({
            success: true,
            message: 'Application updated successfully'
        });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admission/reports
// @desc    Generate and download admission report PDF
// @access  Private (Admission)
router.get('/reports', authMiddleware, roleMiddleware('admission'), async (req, res) => {
    try {
        const { startDate, endDate, status, class: studentClass, school_id } = req.query;

        // Use school_id from query or from authenticated user
        const schoolId = school_id || req.user.school_id;

        console.log('Generating report with filters:', req.query);
        console.log('Using school_id:', schoolId);

        let query = 'SELECT sa.*, s.name AS stream_name, sc.name as school_name FROM student_applications sa LEFT JOIN streams s ON sa.stream_id = s.id JOIN schools sc ON sa.school_id = sc.id WHERE 1=1';
        const params = [];

        // Filter by school_id (REQUIRED for multi-tenant)
        if (schoolId) {
            query += ' AND sa.school_id = ?';
            params.push(schoolId);
        }

        // Apply filters
        if (status && status !== 'All') {
            query += ' AND sa.status = ?';
            params.push(status.toLowerCase());
        }

        if (studentClass && studentClass !== 'All') {
            query += ' AND sa.class = ?';
            params.push(studentClass);
        }

        if (startDate) {
            query += ' AND sa.applied_date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND sa.applied_date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY sa.applied_date DESC';

        const [students] = await db.query(query, params);

        console.log(`Found ${students.length} records for report`);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Admission_Report_${Date.now()}.pdf`);

        // Generate PDF
        generateReportPDF(students, { startDate, endDate, status, class: studentClass }, res);

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});







module.exports = router;