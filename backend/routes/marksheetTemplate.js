const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// GET routes allow admin, teacher, and student
router.get('/*', authMiddleware, roleMiddleware('admin', 'teacher', 'student'));

// Mutation routes require admin role
router.use(authMiddleware);
router.post('*', roleMiddleware('admin'));
router.put('*', roleMiddleware('admin'));
router.delete('*', roleMiddleware('admin'));

// @route   GET /api/marksheet-templates
// @desc    Get all marksheet templates for the school
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [templates] = await db.query(
            'SELECT * FROM marksheet_templates WHERE school_id = ? ORDER BY is_default DESC, updated_at DESC',
            [schoolId]
        );
        // Parse JSON config for each template
        const parsed = templates.map(t => ({
            ...t,
            config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config
        }));
        res.json({ success: true, templates: parsed });
    } catch (error) {
        console.error('Get marksheet templates error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marksheet-templates/:id
// @desc    Get a specific marksheet template
// @access  Admin
router.get('/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [rows] = await db.query(
            'SELECT * FROM marksheet_templates WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        const template = rows[0];
        template.config = typeof template.config === 'string' ? JSON.parse(template.config) : template.config;
        res.json({ success: true, template });
    } catch (error) {
        console.error('Get marksheet template error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/marksheet-templates
// @desc    Create a new marksheet template
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, config, is_default, assigned_class, assigned_section, assigned_stream } = req.body;

        if (!name || !config) {
            return res.status(400).json({ success: false, message: 'Name and config are required' });
        }

        // If setting as default, unset other defaults first
        if (is_default) {
            await db.query('UPDATE marksheet_templates SET is_default = 0 WHERE school_id = ?', [schoolId]);
        }

        const [result] = await db.query(
            'INSERT INTO marksheet_templates (school_id, name, config, is_default, assigned_class, assigned_section, assigned_stream) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [schoolId, name, JSON.stringify(config), is_default ? 1 : 0, assigned_class || null, assigned_section || null, assigned_stream || null]
        );

        res.json({ success: true, message: 'Template created', templateId: result.insertId });
    } catch (error) {
        console.error('Create marksheet template error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/marksheet-templates/:id
// @desc    Update a marksheet template
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, config, is_default, assigned_class, assigned_section, assigned_stream } = req.body;

        // Verify ownership
        const [existing] = await db.query(
            'SELECT id FROM marksheet_templates WHERE id = ? AND school_id = ?',
            [req.params.id, schoolId]
        );
        if (!existing.length) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        // If setting as default, unset other defaults first
        if (is_default) {
            await db.query('UPDATE marksheet_templates SET is_default = 0 WHERE school_id = ?', [schoolId]);
        }

        await db.query(
            'UPDATE marksheet_templates SET name = ?, config = ?, is_default = ?, assigned_class = ?, assigned_section = ?, assigned_stream = ? WHERE id = ? AND school_id = ?',
            [name, JSON.stringify(config), is_default ? 1 : 0, assigned_class || null, assigned_section || null, assigned_stream || null, req.params.id, schoolId]
        );

        res.json({ success: true, message: 'Template updated' });
    } catch (error) {
        console.error('Update marksheet template error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/marksheet-templates/active/:class/:section
// @desc    Get the best matching template for a class
// @access  Admin, Teacher, Student
router.get('/active/:class/:section', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { class: className, section } = req.params;

        const cleanClassName = className.replace(/^Class\s+/i, '').trim();

        // 1. Fetch Class ID for the given name or class_number
        const [classes] = await db.query(
            'SELECT id, name, class_number FROM classes WHERE (name = ? OR class_number = ? OR name = ? OR class_number = ?) AND school_id = ?',
            [className, className, cleanClassName, cleanClassName, schoolId]
        );
        const classId = classes.length > 0 ? String(classes[0].id) : null;

        // 2. Fetch all templates for the school
        const [templates] = await db.query(
            'SELECT * FROM marksheet_templates WHERE school_id = ? ORDER BY is_default DESC, updated_at DESC',
            [schoolId]
        );

        let match = null;
        
        // 3. Try class-specific match using ID
        if (classId) {
            match = templates.find(t => {
                if (!t.assigned_class) return false;
                const assignedIds = t.assigned_class.split(',').map(c => c.trim());
                return assignedIds.includes(classId);
            });
        }

        // 4. Try class-specific match using name/cleanClassName
        if (!match) {
            match = templates.find(t => {
                if (!t.assigned_class) return false;
                const assigned = t.assigned_class.split(',').map(c => c.trim().toLowerCase());
                return assigned.includes(className.toLowerCase()) || assigned.includes(cleanClassName.toLowerCase());
            });
        }

        // 5. Fallback to default template
        if (!match) {
            match = templates.find(t => t.is_default);
        }

        // 6. Fallback to first available template
        if (!match && templates.length > 0) {
            match = templates[0];
        }

        if (!match) {
            return res.status(404).json({ success: false, message: 'No template found' });
        }

        match.config = typeof match.config === 'string' ? JSON.parse(match.config) : match.config;
        res.json({ success: true, template: match });
    } catch (error) {
        console.error('Get active template error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
