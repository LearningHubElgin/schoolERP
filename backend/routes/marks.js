const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// ============================
// ADMIN ROUTES (marks management)
// ============================

// @route   POST /api/marks/admin/create-exam-term
// @desc    Create a new exam term
// @access  Admin
router.post('/admin/create-exam-term', roleMiddleware('admin'), async (req, res) => {
    try {
        const { term_name, academic_year } = req.body;
        const schoolId = req.user.school_id;

        if (!term_name) {
            return res.status(400).json({ success: false, message: 'Term name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO exam_terms (school_id, term_name, academic_year, status) VALUES (?, ?, ?, ?)',
            [schoolId, term_name, academic_year || '', 'active']
        );

        res.json({ success: true, message: 'Exam term created', termId: result.insertId });
    } catch (error) {
        console.error('Create exam term error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marks/admin/exam-terms
// @desc    Get all exam terms
// @access  Admin
router.get('/admin/exam-terms', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [terms] = await db.query(
            'SELECT * FROM exam_terms WHERE school_id = ? ORDER BY created_at DESC',
            [schoolId]
        );
        res.json({ success: true, terms });
    } catch (error) {
        console.error('Get exam terms error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/marks/admin/exam-terms/:id
// @desc    Delete an exam term (only if draft/active)
// @access  Admin
router.delete('/admin/exam-terms/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const termId = req.params.id;

        // Delete related marks and assignments first
        await db.query('DELETE FROM student_marks WHERE exam_term_id = ? AND school_id = ?', [termId, schoolId]);
        await db.query('DELETE FROM marks_assignments WHERE exam_term_id = ? AND school_id = ?', [termId, schoolId]);
        await db.query('DELETE FROM exam_terms WHERE id = ? AND school_id = ?', [termId, schoolId]);

        res.json({ success: true, message: 'Exam term deleted' });
    } catch (error) {
        console.error('Delete exam term error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/admin/assign-teacher
// @desc    Assign a teacher to enter marks for a class/subject
// @access  Admin
router.post('/admin/assign-teacher', roleMiddleware('admin'), async (req, res) => {
    try {
        let { exam_term_id, teacher_id, class: className, section, subject_id } = req.body;
        const schoolId = req.user.school_id;

        if (!teacher_id || !className || !subject_id) {
            return res.status(400).json({ success: false, message: 'Class, Subject, and Teacher are required' });
        }

        // If no exam_term_id supplied, find active/default or auto-create one
        if (!exam_term_id) {
            const [terms] = await db.query(
                'SELECT id FROM exam_terms WHERE school_id = ? ORDER BY id ASC LIMIT 1',
                [schoolId]
            );
            if (terms.length > 0) {
                exam_term_id = terms[0].id;
            } else {
                const [newTerm] = await db.query(
                    'INSERT INTO exam_terms (school_id, term_name, status) VALUES (?, ?, ?)',
                    [schoolId, 'General Term', 'active']
                );
                exam_term_id = newTerm.insertId;
            }
        }

        // Check if assignment already exists
        const [existing] = await db.query(
            'SELECT id FROM marks_assignments WHERE school_id = ? AND exam_term_id = ? AND class = ? AND section = ? AND subject_id = ?',
            [schoolId, exam_term_id, className, section || '', subject_id]
        );

        if (existing.length > 0) {
            // Update existing assignment
            await db.query(
                'UPDATE marks_assignments SET teacher_id = ? WHERE id = ?',
                [teacher_id, existing[0].id]
            );
            return res.json({ success: true, message: 'Assignment updated' });
        }

        await db.query(
            'INSERT INTO marks_assignments (school_id, exam_term_id, teacher_id, class, section, subject_id) VALUES (?, ?, ?, ?, ?, ?)',
            [schoolId, exam_term_id, teacher_id, className, section || '', subject_id]
        );

        res.json({ success: true, message: 'Teacher assigned successfully' });
    } catch (error) {
        console.error('Assign teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marks/admin/assignments/:termId
// @desc    Get all assignments for an exam term (or 'all' for all assignments)
// @access  Admin
router.get('/admin/assignments/:termId', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const termId = req.params.termId;

        let query = `SELECT ma.*, 
                            t.name as teacher_name,
                            s.name as subject_name
                     FROM marks_assignments ma
                     LEFT JOIN teachers t ON ma.teacher_id = t.id
                     LEFT JOIN subjects s ON ma.subject_id = s.id
                     WHERE ma.school_id = ?`;
        const params = [schoolId];

        if (termId && termId !== 'all') {
            query += ` AND ma.exam_term_id = ?`;
            params.push(termId);
        }

        query += ` ORDER BY ma.class, ma.section, s.name`;

        const [assignments] = await db.query(query, params);

        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/marks/admin/assignments/:id
// @desc    Delete an assignment
// @access  Admin
router.delete('/admin/assignments/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        await db.query('DELETE FROM marks_assignments WHERE id = ? AND school_id = ?', [req.params.id, schoolId]);
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marks/admin/progress/:termId
// @desc    Get marks entry progress for all classes (or for a specific term)
// @access  Admin
router.get('/admin/progress/:termId', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const termId = req.params.termId;

        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN is_locked TINYINT(1) DEFAULT 0`); } catch (e) {}
        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN locked_columns TEXT NULL`); } catch (e) {}
        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN is_published TINYINT(1) DEFAULT 0`); } catch (e) {}

        let query = `SELECT ma.id, ma.class, ma.section, ma.subject_id, s.name as subject_name,
                            t.name as teacher_name, ma.is_completed, ma.is_locked, ma.is_published, ma.locked_columns,
                            (SELECT COUNT(*) FROM student_marks sm 
                             WHERE sm.exam_term_id = ma.exam_term_id 
                             AND sm.subject_id = ma.subject_id 
                             AND sm.school_id = ma.school_id) as marks_entered
                     FROM marks_assignments ma
                     LEFT JOIN teachers t ON ma.teacher_id = t.id
                     LEFT JOIN subjects s ON ma.subject_id = s.id
                     WHERE ma.school_id = ?`;
        const params = [schoolId];

        if (termId && termId !== 'all') {
            query += ` AND ma.exam_term_id = ?`;
            params.push(termId);
        }

        query += ` ORDER BY ma.class, ma.section, s.name`;

        const [assignments] = await db.query(query, params);

        res.json({ success: true, progress: assignments });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/admin/toggle-lock
// @desc    Lock or unlock marks entry for an assignment
// @access  Admin
router.post('/admin/toggle-lock', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { assignment_id, is_locked, class: className, section, subject_id } = req.body;
        
        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN is_locked TINYINT(1) DEFAULT 0`); } catch (e) {}
        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN locked_columns TEXT NULL`); } catch (e) {}

        if (assignment_id) {
            await db.query(
                `UPDATE marks_assignments SET is_locked = ? WHERE id = ? AND school_id = ?`,
                [is_locked ? 1 : 0, assignment_id, schoolId]
            );
        } else if (className && subject_id) {
            await db.query(
                `UPDATE marks_assignments SET is_locked = ? WHERE class = ? AND section = ? AND subject_id = ? AND school_id = ?`,
                [is_locked ? 1 : 0, className, section || '', subject_id, schoolId]
            );
        } else {
            return res.status(400).json({ success: false, message: 'Assignment ID or Class/Subject required' });
        }

        res.json({
            success: true,
            is_locked: is_locked ? 1 : 0,
            message: `Marks entry ${is_locked ? 'locked 🔒' : 'unlocked 🔓'} successfully`
        });
    } catch (error) {
        console.error('Toggle lock error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/admin/toggle-publish
// @desc    Publish or unpublish marks entry for an assignment
// @access  Admin
router.post('/admin/toggle-publish', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { assignment_id, is_published, class: className, section, subject_id } = req.body;

        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN is_published TINYINT(1) DEFAULT 0`); } catch (e) {}

        if (assignment_id) {
            await db.query(
                `UPDATE marks_assignments SET is_published = ? WHERE id = ? AND school_id = ?`,
                [is_published ? 1 : 0, assignment_id, schoolId]
            );
        } else if (className && subject_id) {
            await db.query(
                `UPDATE marks_assignments SET is_published = ? WHERE class = ? AND section = ? AND subject_id = ? AND school_id = ?`,
                [is_published ? 1 : 0, className, section || '', subject_id, schoolId]
            );
        } else {
            return res.status(400).json({ success: false, message: 'Assignment ID or Class/Subject required' });
        }

        res.json({
            success: true,
            is_published: is_published ? 1 : 0,
            message: `Marks ${is_published ? 'published 📢' : 'unpublished 🚫'} successfully`
        });
    } catch (error) {
        console.error('Toggle publish error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/admin/bulk-publish
// @desc    Bulk publish or unpublish marks entries
// @access  Admin
router.post('/admin/bulk-publish', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { assignment_ids, is_published, class: className, section } = req.body;

        try { await db.query(`ALTER TABLE marks_assignments ADD COLUMN is_published TINYINT(1) DEFAULT 0`); } catch (e) {}

        if (Array.isArray(assignment_ids) && assignment_ids.length > 0) {
            await db.query(
                `UPDATE marks_assignments SET is_published = ? WHERE id IN (?) AND school_id = ?`,
                [is_published ? 1 : 0, assignment_ids, schoolId]
            );
        } else if (className) {
            let query = `UPDATE marks_assignments SET is_published = ? WHERE class = ? AND school_id = ?`;
            const params = [is_published ? 1 : 0, className, schoolId];
            if (section && section !== 'All') {
                query += ` AND section = ?`;
                params.push(section);
            }
            await db.query(query, params);
        } else {
            await db.query(
                `UPDATE marks_assignments SET is_published = ? WHERE school_id = ?`,
                [is_published ? 1 : 0, schoolId]
            );
        }

        res.json({
            success: true,
            is_published: is_published ? 1 : 0,
            message: `All selected marks ${is_published ? 'published 📢' : 'unpublished 🚫'} successfully`
        });
    } catch (error) {
        console.error('Bulk publish error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/admin/toggle-column-lock
// @desc    Lock or unlock a specific column for an assignment
// @access  Admin
router.post('/admin/toggle-column-lock', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { assignment_id, column_key, is_locked, class: className, section, subject_id } = req.body;

        try {
            await db.query(`ALTER TABLE marks_assignments ADD COLUMN locked_columns TEXT NULL`);
        } catch (e) {}

        let assignment;
        if (assignment_id) {
            const [rows] = await db.query(`SELECT * FROM marks_assignments WHERE id = ? AND school_id = ?`, [assignment_id, schoolId]);
            assignment = rows[0];
        } else if (className && subject_id) {
            const [rows] = await db.query(`SELECT * FROM marks_assignments WHERE class = ? AND section = ? AND subject_id = ? AND school_id = ?`, [className, section || '', subject_id, schoolId]);
            assignment = rows[0];
        }

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        let lockedCols = [];
        if (assignment.locked_columns) {
            try {
                lockedCols = typeof assignment.locked_columns === 'string' ? JSON.parse(assignment.locked_columns) : assignment.locked_columns;
                if (!Array.isArray(lockedCols)) lockedCols = [];
            } catch (e) {
                lockedCols = [];
            }
        }

        if (is_locked) {
            if (!lockedCols.includes(column_key)) lockedCols.push(column_key);
        } else {
            lockedCols = lockedCols.filter(k => k !== column_key);
        }

        const lockedColsStr = JSON.stringify(lockedCols);

        await db.query(
            `UPDATE marks_assignments SET locked_columns = ? WHERE id = ? AND school_id = ?`,
            [lockedColsStr, assignment.id, schoolId]
        );

        res.json({
            success: true,
            assignment_id: assignment.id,
            locked_columns: lockedCols,
            message: `Column ${is_locked ? 'locked 🔒' : 'unlocked 🔓'} successfully`
        });
    } catch (error) {
        console.error('Toggle column lock error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marks/admin/class-marks/:termId/:className/:section
// @desc    Get all marks for a class to review before finalization
// @access  Admin
router.get('/admin/class-marks/:termId/:className/:section', roleMiddleware('admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { termId, className, section } = req.params;

        let queryClass = className;
        if (queryClass.toLowerCase().startsWith('class ')) {
            queryClass = queryClass.replace(/^Class\s+/i, '');
        }

        let querySection = section;
        if (querySection && querySection.toLowerCase().startsWith('section ')) {
            querySection = querySection.replace(/^Section\s+/i, '');
        }

        const romanMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12' };
        if (romanMap[queryClass]) queryClass = romanMap[queryClass];

        // Get all students in the class
        const [students] = await db.query(
            `SELECT s.id, u.name, s.roll_no as roll_number, s.father_name 
             FROM students s
             JOIN users u ON s.user_id = u.id
             WHERE s.school_id = ? AND (s.class = ? OR s.class = ?) AND (s.section = ? OR s.section = ?)
             ORDER BY s.roll_no, u.name`,
            [schoolId, className, queryClass, section, querySection]
        );

        // Get all subjects assigned for this class along with assigned teacher name
        const cleanClass = String(className).replace(/^Class\s+/i, '').trim();
        let subjQuery = `SELECT ma.subject_id, s.name as subject_name, ma.is_completed, GROUP_CONCAT(DISTINCT COALESCE(t.name, u.name) SEPARATOR ', ') as teacher_name
                         FROM marks_assignments ma
                         LEFT JOIN subjects s ON ma.subject_id = s.id
                         LEFT JOIN teachers t ON ma.teacher_id = t.id
                         LEFT JOIN users u ON t.user_id = u.id
                         WHERE ma.school_id = ? 
                         AND (ma.class = ? OR ma.class = ? OR ma.class = ? OR REPLACE(LOWER(ma.class), 'class ', '') = ?) 
                         AND (ma.section = ? OR ma.section = ? OR ma.section = '' OR ma.section IS NULL)`;
        const subjParams = [schoolId, className, queryClass, `Class ${queryClass}`, cleanClass, section, querySection];
        if (termId && termId !== 'all') {
            subjQuery += ` AND ma.exam_term_id = ?`;
            subjParams.push(termId);
        }
        subjQuery += ` GROUP BY ma.subject_id, s.name, ma.is_completed ORDER BY s.name`;
        const [subjects] = await db.query(subjQuery, subjParams);

        // Get all marks for these students
        let marksQuery = `SELECT sm.*
                          FROM student_marks sm
                          WHERE sm.school_id = ?
                          AND sm.student_id IN (SELECT id FROM students WHERE school_id = ? AND (class = ? OR class = ?) AND (section = ? OR section = ? OR section = '' OR section IS NULL))`;
        const marksParams = [schoolId, schoolId, className, queryClass, section, querySection];
        if (termId && termId !== 'all') {
            marksQuery += ` AND sm.exam_term_id = ?`;
            marksParams.push(termId);
        }
        const [marks] = await db.query(marksQuery, marksParams);

        // Get school info for PDF
        const [school] = await db.query(
            'SELECT name, logo, address, phone, email FROM schools WHERE id = ?',
            [schoolId]
        );

        // Get exam term info if provided
        let term = [{}];
        if (termId && termId !== 'all') {
            const [termRes] = await db.query('SELECT * FROM exam_terms WHERE id = ?', [termId]);
            if (termRes.length > 0) term = termRes;
        }

        // Get active marksheet template for this class
        const [templates] = await db.query(
            'SELECT * FROM marksheet_templates WHERE school_id = ? ORDER BY is_default DESC, updated_at DESC',
            [schoolId]
        );
        let template = templates.find(t => t.is_default) || templates[0] || null;
        if (template) {
            try {
                if (typeof template.config === 'string') template.config = JSON.parse(template.config);
            } catch (e) {}
        }

        res.json({
            success: true,
            students,
            subjects,
            marks,
            template,
            school: school[0] || {},
            term: term[0] || { term_name: 'Academic Marks' }
        });
    } catch (error) {
        console.error('Get class marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/admin/finalize-marks
// @desc    Finalize marks for a class
// @access  Admin
router.post('/admin/finalize-marks', roleMiddleware('admin'), async (req, res) => {
    try {
        const { exam_term_id, className, section } = req.body;
        const schoolId = req.user.school_id;

        const romanMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12' };

        let queryClass = className.replace(/^Class\s+/i, '');
        if (romanMap[queryClass]) queryClass = romanMap[queryClass];

        let querySection = section ? section.replace(/^Section\s+/i, '') : '';

        // Mark all student_marks as finalized for this class
        let updateMarksQuery = `UPDATE student_marks sm 
                                SET sm.is_finalized = 1 
                                WHERE sm.school_id = ?
                                AND sm.student_id IN (SELECT id FROM students WHERE school_id = ? AND (class = ? OR class = ?) AND (section = ? OR section = ?))`;
        const updateMarksParams = [schoolId, schoolId, className, queryClass, section, querySection];

        if (exam_term_id && exam_term_id !== 'all') {
            updateMarksQuery += ` AND sm.exam_term_id = ?`;
            updateMarksParams.push(exam_term_id);
        }

        await db.query(updateMarksQuery, updateMarksParams);

        // Update assignments for this class as completed
        let updateAssignQuery = `UPDATE marks_assignments SET is_completed = 1 
                                 WHERE school_id = ? AND class = ? AND (section = ? OR section = '')`;
        const updateAssignParams = [schoolId, className, section];
        if (exam_term_id && exam_term_id !== 'all') {
            updateAssignQuery += ` AND exam_term_id = ?`;
            updateAssignParams.push(exam_term_id);
        }

        await db.query(updateAssignQuery, updateAssignParams);

        res.json({ success: true, message: 'Marks finalized successfully' });
    } catch (error) {
        console.error('Finalize marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// TEACHER ROUTES (marks entry)
// ============================

// @route   GET /api/marks/teacher/my-assignments
// @desc    Get teacher's assigned subjects/classes for marks entry
// @access  Teacher
router.get('/teacher/my-assignments', roleMiddleware('teacher'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        // Get teacher_id from the teachers table using user_id
        const [teacher] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );
        if (!teacher.length) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const teacherId = teacher[0].id;

        const [assignments] = await db.query(
            `SELECT ma.*, et.term_name, et.academic_year, et.status as term_status,
                    s.name as subject_name
             FROM marks_assignments ma
             LEFT JOIN exam_terms et ON ma.exam_term_id = et.id
             LEFT JOIN subjects s ON ma.subject_id = s.id
             WHERE ma.teacher_id = ? AND ma.school_id = ?
             ORDER BY et.created_at DESC, ma.class, ma.section`,
            [teacherId, schoolId]
        );

        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Get teacher assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marks/teacher/students/:assignmentId
// @desc    Get students list with existing marks for an assignment
// @access  Teacher
router.get('/teacher/students/:assignmentId', roleMiddleware('teacher'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const assignmentId = req.params.assignmentId;

        // Get assignment details
        const [assignment] = await db.query(
            'SELECT * FROM marks_assignments WHERE id = ? AND school_id = ?',
            [assignmentId, schoolId]
        );
        if (!assignment.length) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        const { class: className, section, exam_term_id, subject_id } = assignment[0];

        // Normalize class/section for students table query
        const romanMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12' };

        let queryClass = className.replace(/^Class\s+/i, '');
        if (romanMap[queryClass]) queryClass = romanMap[queryClass];

        let querySection = section ? section.replace(/^Section\s+/i, '') : '';

        // Get students
        const [students] = await db.query(
            `SELECT s.id, u.name, s.roll_no as roll_number, s.father_name 
             FROM students s
             JOIN users u ON s.user_id = u.id
             WHERE s.school_id = ? AND (s.class = ? OR s.class = ?) AND (s.section = ? OR s.section = ?)
             ORDER BY s.roll_no, u.name`,
            [schoolId, className, queryClass, section, querySection]
        );

        // Get existing marks
        const [existingMarks] = await db.query(
            `SELECT student_id, marks_obtained, total_marks, grade, custom_marks 
             FROM student_marks 
             WHERE school_id = ? AND exam_term_id = ? AND subject_id = ?`,
            [schoolId, exam_term_id, subject_id]
        );

        // Merge marks with students
        const studentsWithMarks = students.map(student => {
            const mark = existingMarks.find(m => m.student_id === student.id);
            let customMarks = {};
            try {
                customMarks = typeof mark?.custom_marks === 'string' ? JSON.parse(mark.custom_marks) : (mark?.custom_marks || {});
            } catch (e) { customMarks = {}; }

            return {
                ...student,
                marks_obtained: mark ? mark.marks_obtained : null,
                total_marks: mark ? mark.total_marks : 100,
                grade: mark ? mark.grade : null,
                custom_marks: customMarks
            };
        });

        res.json({ success: true, students: studentsWithMarks, assignment: assignment[0] });
    } catch (error) {
        console.error('Get students for marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marks/teacher/enter-marks
// @desc    Save marks for students
// @access  Teacher
router.post('/teacher/enter-marks', roleMiddleware('teacher'), async (req, res) => {
    try {
        const { assignment_id, marks } = req.body;
        const schoolId = req.user.school_id;

        // Get teacher_id
        const [teacher] = await db.query(
            'SELECT id FROM teachers WHERE user_id = ? AND school_id = ?',
            [req.user.id, schoolId]
        );
        if (!teacher.length) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const teacherId = teacher[0].id;

        // Get assignment details
        const [assignment] = await db.query(
            'SELECT * FROM marks_assignments WHERE id = ? AND school_id = ?',
            [assignment_id, schoolId]
        );
        if (!assignment.length) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        if (assignment[0].is_locked) {
            return res.status(403).json({ success: false, message: '🔒 Marks entry for this subject is locked by Admin.' });
        }

        const { exam_term_id, subject_id } = assignment[0];

        // Helper to calculate grade
        const getGrade = (marks, total) => {
            const pct = (marks / total) * 100;
            if (pct >= 90) return 'A+';
            if (pct >= 80) return 'A';
            if (pct >= 70) return 'B+';
            if (pct >= 60) return 'B';
            if (pct >= 50) return 'C';
            if (pct >= 40) return 'D';
            return 'F';
        };

        // Insert or update marks for each student
        for (const mark of marks) {
            const grade = mark.marks_obtained !== null && mark.marks_obtained !== ''
                ? getGrade(parseFloat(mark.marks_obtained), parseFloat(mark.total_marks || 100))
                : null;

            await db.query(
                `INSERT INTO student_marks (school_id, exam_term_id, student_id, subject_id, marks_obtained, total_marks, grade, teacher_id, custom_marks)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    marks_obtained = VALUES(marks_obtained), 
                    total_marks = VALUES(total_marks), 
                    grade = VALUES(grade), 
                    custom_marks = VALUES(custom_marks),
                    entered_at = NOW()`,
                [schoolId, exam_term_id, mark.student_id, subject_id,
                    mark.marks_obtained !== '' ? mark.marks_obtained : null,
                    mark.total_marks || 100, grade, teacherId, 
                    JSON.stringify(mark.custom_marks || {})]
            );
        }

        // Mark assignment as completed
        await db.query(
            'UPDATE marks_assignments SET is_completed = 1 WHERE id = ?',
            [assignment_id]
        );

        res.json({ success: true, message: 'Marks saved successfully' });
    } catch (error) {
        console.error('Enter marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// STUDENT ROUTES (marksheet view/download)
// ============================

// @route   GET /api/marks/student/my-marksheets
// @desc    Get available finalized marksheets
// @access  Student
router.get('/student/my-marksheets', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get student_id 
        const [student] = await db.query(
            'SELECT s.id, u.name, s.class, s.section, s.roll_no as roll_number, s.father_name FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ? AND s.school_id = ?',
            [req.user.id, schoolId]
        );
        if (!student.length) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const studentId = student[0].id;

        // Get all terms where this student has finalized marks
        const [terms] = await db.query(
            `SELECT DISTINCT et.id, et.term_name, et.academic_year, et.status,
                    (SELECT COUNT(*) FROM student_marks sm WHERE sm.exam_term_id = et.id AND sm.student_id = ? AND sm.is_finalized = 1) as finalized_count,
                    (SELECT COUNT(*) FROM student_marks sm WHERE sm.exam_term_id = et.id AND sm.student_id = ?) as total_count
             FROM exam_terms et
             INNER JOIN student_marks sm ON sm.exam_term_id = et.id AND sm.student_id = ?
             WHERE et.school_id = ?
             ORDER BY et.created_at DESC`,
            [studentId, studentId, studentId, schoolId]
        );

        res.json({ success: true, terms, student: student[0] });
    } catch (error) {
        console.error('Get student marksheets error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marks/student/marksheet/:termId
// @desc    Get detailed marks for a specific term (for PDF)
// @access  Student
router.get('/student/marksheet/:termId', roleMiddleware('student'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const termId = req.params.termId;

        // Get student info
        const [student] = await db.query(
            'SELECT s.id, u.name, s.class, s.section, s.roll_no as roll_number, s.father_name, s.mother_name, s.date_of_birth as dob FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ? AND s.school_id = ?',
            [req.user.id, schoolId]
        );
        if (!student.length) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const studentId = student[0].id;

        // Get marks for this term (only for published subjects)
        const [marks] = await db.query(
            `SELECT sm.marks_obtained, sm.total_marks, sm.grade, sm.is_finalized, sm.custom_marks,
                    s.name as subject_name
             FROM student_marks sm
             LEFT JOIN subjects s ON sm.subject_id = s.id
             LEFT JOIN marks_assignments ma ON ma.exam_term_id = sm.exam_term_id AND ma.subject_id = sm.subject_id AND ma.school_id = sm.school_id
             WHERE sm.student_id = ? AND sm.exam_term_id = ? AND sm.school_id = ?
               AND (ma.is_published = 1 OR ma.id IS NULL)
             ORDER BY s.name`,
            [studentId, termId, schoolId]
        );

        // Get school info
        const [school] = await db.query(
            'SELECT name, logo, address, phone, email FROM schools WHERE id = ?',
            [schoolId]
        );

        // Get term info
        const [term] = await db.query('SELECT * FROM exam_terms WHERE id = ?', [termId]);

        // Get active marksheet template for this student's class
        const studentClass = student[0].class || '';
        const cleanClassName = studentClass.replace(/^Class\s+/i, '').trim();

        const [classes] = await db.query(
            'SELECT id, name, class_number FROM classes WHERE (name = ? OR class_number = ? OR name = ? OR class_number = ?) AND school_id = ?',
            [studentClass, studentClass, cleanClassName, cleanClassName, schoolId]
        );
        const classId = classes.length > 0 ? String(classes[0].id) : null;

        const [templates] = await db.query(
            'SELECT * FROM marksheet_templates WHERE school_id = ? ORDER BY is_default DESC, updated_at DESC',
            [schoolId]
        );

        let templateMatch = null;
        if (classId) {
            templateMatch = templates.find(t => {
                if (!t.assigned_class) return false;
                const assignedIds = t.assigned_class.split(',').map(c => c.trim());
                return assignedIds.includes(classId);
            });
        }
        if (!templateMatch) {
            templateMatch = templates.find(t => {
                if (!t.assigned_class) return false;
                const assigned = t.assigned_class.split(',').map(c => c.trim().toLowerCase());
                return assigned.includes(studentClass.toLowerCase()) || assigned.includes(cleanClassName.toLowerCase());
            });
        }
        if (!templateMatch && templates.length > 0) {
            templateMatch = templates[0];
        }

        if (templateMatch && typeof templateMatch.config === 'string') {
            try { templateMatch.config = JSON.parse(templateMatch.config); } catch (e) {}
        }

        res.json({
            success: true,
            student: student[0],
            marks,
            school: school[0] || {},
            term: term[0] || {},
            template: templateMatch || null
        });
    } catch (error) {
        console.error('Get marksheet error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
