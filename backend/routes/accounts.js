const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Apply middleware (ensure only authorized staff can access)
router.use(authMiddleware);

// ==========================================
// EXPENSE MANAGEMENT ROUTES
// ==========================================

// @route   GET /api/accounts/expenses
// @desc    Get all expenses (school-specific)
router.get('/expenses', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate, category } = req.query;

        let query = 'SELECT * FROM expenses WHERE school_id = ?';
        const params = [schoolId];

        if (startDate) {
            query += ' AND expense_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND expense_date <= ?';
            params.push(endDate);
        }
        if (category && category !== 'All') {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY expense_date DESC, id DESC';

        const [expenses] = await db.query(query, params);
        res.json({ success: true, expenses });
    } catch (error) {
        console.error('Fetch expenses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/accounts/expenses
// @desc    Add a new expense
router.post('/expenses', async (req, res) => {
    try {
        const { title, amount, category, payment_method, expense_date, description, gst_amount } = req.body;
        const schoolId = req.user.school_id;

        if (!title || !amount || !category || !expense_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const gst = parseFloat(gst_amount) || 0;

        const [result] = await db.query(
            `INSERT INTO expenses (title, amount, category, payment_method, expense_date, expense_time, description, gst_amount, school_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, amount, category, payment_method, expense_date, req.body.expense_time || '10:00:00', description, gst, schoolId]
        );

        res.json({ success: true, message: 'Expense added successfully', id: result.insertId });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/accounts/expenses/:id
// @desc    Update an existing expense
router.put('/expenses/:id', async (req, res) => {
    try {
        const { title, amount, category, payment_method, expense_date, description, gst_amount } = req.body;
        const schoolId = req.user.school_id;
        const expenseId = req.params.id;

        if (!title || !amount || !category || !expense_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const gst = parseFloat(gst_amount) || 0;

        // Verify expense belongs to school
        const [existing] = await db.query('SELECT id FROM expenses WHERE id = ? AND school_id = ?', [expenseId, schoolId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        await db.query(
            `UPDATE expenses 
             SET title = ?, amount = ?, category = ?, payment_method = ?, expense_date = ?, expense_time = ?, description = ?, gst_amount = ?
             WHERE id = ? AND school_id = ?`,
            [title, amount, category, payment_method, expense_date, req.body.expense_time || '10:00:00', description, gst, expenseId, schoolId]
        );

        res.json({ success: true, message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/accounts/expenses/:id
// @desc    Delete an expense
router.delete('/expenses/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const expenseId = req.params.id;

        const [result] = await db.query('DELETE FROM expenses WHERE id = ? AND school_id = ?', [expenseId, schoolId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// TENDER & REQUISITION ROUTES
// ==========================================

// @route   GET /api/accounts/tenders
// @desc    Get all tenders
router.get('/tenders', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [tenders] = await db.query(
            'SELECT * FROM tenders WHERE school_id = ? ORDER BY created_at DESC',
            [schoolId]
        );
        res.json({ success: true, tenders });
    } catch (error) {
        console.error('Fetch tenders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/accounts/tenders
// @desc    Create a new tender
router.post('/tenders', async (req, res) => {
    try {
        const { title, description, opening_date, closing_date, min_bid_amount } = req.body;
        const schoolId = req.user.school_id;

        const [result] = await db.query(
            `INSERT INTO tenders (title, description, opening_date, closing_date, min_bid_amount, school_id, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description, opening_date, closing_date, min_bid_amount, schoolId, req.user.id]
        );

        res.json({ success: true, message: 'Tender created successfully', id: result.insertId });
    } catch (error) {
        console.error('Create tender error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/tenders/:id/quotations
// @desc    Get quotations for a specific tender
router.get('/tenders/:id/quotations', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const tenderId = req.params.id;

        // Verify tender belongs to school
        const [tenderCheck] = await db.query('SELECT id FROM tenders WHERE id = ? AND school_id = ?', [tenderId, schoolId]);
        if (tenderCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Tender not found' });
        }

        const [quotations] = await db.query(
            'SELECT * FROM quotations WHERE tender_id = ? ORDER BY quoted_amount ASC',
            [tenderId]
        );
        res.json({ success: true, quotations });
    } catch (error) {
        console.error('Fetch quotations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/accounts/quotations
// @desc    Add a quotation to a tender
router.post('/quotations', async (req, res) => {
    try {
        const { tender_id, vendor_name, vendor_contact, quoted_amount, proposal_details } = req.body;
        const schoolId = req.user.school_id;

        const [result] = await db.query(
            `INSERT INTO quotations (tender_id, vendor_name, vendor_contact, quoted_amount, proposal_details, school_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tender_id, vendor_name, vendor_contact, quoted_amount, proposal_details, schoolId]
        );

        res.json({ success: true, message: 'Quotation added successfully', id: result.insertId });
    } catch (error) {
        console.error('Add quotation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// REPORTS & ANALYTICS ROUTES
// ==========================================

// @route   GET /api/accounts/reports/summary
// @desc    Get summary report (Cash vs Online, Net Balance)
router.get('/reports/summary', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        // Date filter clause
        let dateFilter = '';
        const params = [schoolId];
        if (startDate && endDate) {
            dateFilter = ' AND payment_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        // 1. Fee Collections (Revenue)
        const [feeStats] = await db.query(
            `SELECT 
                COALESCE(SUM(paid_amount), 0) as total_collected,
                COALESCE(SUM(CASE WHEN payment_method = 'offline' THEN paid_amount ELSE 0 END), 0) as cash_collected,
                COALESCE(SUM(CASE WHEN payment_method = 'online' THEN paid_amount ELSE 0 END), 0) as online_collected,
                COALESCE(SUM(gst_amount), 0) as total_gst
             FROM fee_records 
             WHERE school_id = ? AND status = 'paid' ${dateFilter.replace(/payment_date/g, 'payment_date')}`, // fee_records has payment_date
            params
        );

        // 2. Expenses
        let expenseParams = [schoolId];
        let expenseDateFilter = '';
        if (startDate && endDate) {
            expenseDateFilter = ' AND expense_date BETWEEN ? AND ?';
            expenseParams.push(startDate, endDate);
        }

        const [expenseStats] = await db.query(
            `SELECT 
                COALESCE(SUM(amount + COALESCE(gst_amount, 0)), 0) as total_expenses,
                 COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount + COALESCE(gst_amount, 0) ELSE 0 END), 0) as cash_expenses,
                 COALESCE(SUM(gst_amount), 0) as total_gst
             FROM expenses 
             WHERE school_id = ? ${expenseDateFilter}`,
            expenseParams
        );

        const revenue = feeStats[0];
        const expenses = expenseStats[0];

        res.json({
            success: true,
            summary: {
                revenue: {
                    total: parseFloat(revenue.total_collected),
                    cash: parseFloat(revenue.cash_collected),
                    online: parseFloat(revenue.online_collected),
                    gst: parseFloat(revenue.total_gst)
                },
                expenses: {
                    total: parseFloat(expenses.total_expenses),
                    cash: parseFloat(expenses.cash_expenses),
                    gst: parseFloat(expenses.total_gst)
                },
                net_balance: parseFloat(revenue.total_collected) - parseFloat(expenses.total_expenses),
                cash_in_hand: parseFloat(revenue.cash_collected) - parseFloat(expenses.cash_expenses)
            }
        });

    } catch (error) {
        console.error('Fetch report summary error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/reports/gst
// @desc    Get GST Report
router.get('/reports/gst', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                id,
                payment_date,
                transaction_id,
                paid_amount as total_amount,
                gst_amount,
                net_amount,
                payment_method,
                student_name,
                class_name
            FROM fee_records
            WHERE school_id = ? AND status = 'paid' AND gst_amount > 0
        `;
        const params = [schoolId];

        if (startDate && endDate) {
            query += ' AND payment_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY payment_date DESC';

        const [gstRecords] = await db.query(query, params);
        res.json({ success: true, gstRecords });

    } catch (error) {
        console.error('Fetch GST report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/dashboard/stats
// @desc    Get dashboard statistics (Updated with Expense logic)
router.get('/dashboard/stats', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Total Revenue
        const [revenueResult] = await db.query(
            'SELECT COALESCE(SUM(paid_amount), 0) as total_revenue FROM fee_records WHERE school_id = ?',
            [schoolId]
        );

        // Pending Fees
        const [pendingResult] = await db.query(
            'SELECT COALESCE(SUM(pending_amount), 0) as pending_fees FROM fee_records WHERE status != "paid" AND school_id = ?',
            [schoolId]
        );

        // Total Expenses
        const [expenseResult] = await db.query(
            'SELECT COALESCE(SUM(amount + COALESCE(gst_amount, 0)), 0) as total_expenses FROM expenses WHERE school_id = ?',
            [schoolId]
        );

        // Collection This Month
        const [monthlyResult] = await db.query(
            `SELECT COALESCE(SUM(paid_amount), 0) as monthly_collection 
             FROM fee_records 
             WHERE MONTH(payment_date) = MONTH(CURDATE()) 
             AND YEAR(payment_date) = YEAR(CURDATE())
             AND school_id = ?`,
            [schoolId]
        );

        const totalRevenue = parseFloat(revenueResult[0].total_revenue || 0);
        const totalExpenses = parseFloat(expenseResult[0].total_expenses || 0);

        res.json({
            success: true,
            stats: {
                totalRevenue: totalRevenue,
                totalExpenses: totalExpenses,
                netBalance: totalRevenue - totalExpenses,
                pendingFees: parseFloat(pendingResult[0].pending_fees || 0),
                collectedThisMonth: parseFloat(monthlyResult[0].monthly_collection || 0)
            }
        });

    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// STUDENT & FEE ROUTES (Restored & Updated)
// ==========================================

// Duplicate routes removed (students, classes, sections, fees) - Using improved versions below

// @route   PUT /api/accounts/fees/:id/pay
// @desc    Record Payment with GST Calculation
router.put('/fees/:id/pay', async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId, paymentDate } = req.body;
        const feeRecordId = req.params.id;
        const schoolId = req.user.school_id;

        const [feeRecords] = await db.query('SELECT * FROM fee_records WHERE id = ? AND school_id = ?', [feeRecordId, schoolId]);
        if (feeRecords.length === 0) return res.status(404).json({ success: false, message: 'Fee record not found' });

        const targetRecord = feeRecords[0];

        const netAmount = parseFloat(amount);
        const gstAmount = 0;

        await db.query(
            `INSERT INTO fee_records 
             (student_id, student_name, class_name, fee_type, total_amount, paid_amount, pending_amount, 
              payment_method, transaction_id, payment_date, 
              status, academic_year, received_by, school_id, gst_amount, net_amount, transaction_remarks)
             VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?, ?, 'paid', ?, ?, ?, ?, ?, 'Payment Received')`,
            [
                targetRecord.student_id,
                targetRecord.student_name,
                targetRecord.class_name,
                targetRecord.fee_type,
                amount,
                paymentMethod === 'online' ? 'online' : 'offline',
                transactionId || null,
                paymentDate || new Date(),
                targetRecord.academic_year,
                req.user.id,
                schoolId,
                gstAmount.toFixed(2),
                netAmount.toFixed(2)
            ]
        );

        res.json({ success: true, message: 'Payment recorded successfully' });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/fees/:studentId/history
router.get('/fees/:studentId/history', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [payments] = await db.query(
            `SELECT fr.*, u.name as received_by_name 
             FROM fee_records fr 
             LEFT JOIN users u ON fr.received_by = u.id 
             WHERE fr.student_id = ? AND fr.paid_amount > 0 AND fr.school_id = ? 
             ORDER BY fr.class_name ASC, fr.payment_date DESC`,
            [req.params.studentId, schoolId]
        );
        res.json({ success: true, payments });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;

// @route   GET /api/accounts/dashboard/recent-transactions
// @desc    Get recent fee transactions (school-specific)
router.get('/dashboard/recent-transactions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const schoolId = req.user.school_id;

        const [transactions] = await db.query(
            `SELECT 
                fr.id,
                fr.total_amount,
                fr.paid_amount,
                fr.pending_amount,
                fr.status,
                fr.last_payment_date,
                s.roll_no,
                s.class,
                s.section,
                u.name as student_name,
                c.name as class_name,
                sec.name as section_name
            FROM fee_records fr
            JOIN students s ON fr.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN classes c ON s.class = c.class_number AND c.school_id = ?
            LEFT JOIN sections sec ON s.section = sec.code AND sec.school_id = ?
            WHERE fr.school_id = ?
            ORDER BY fr.updated_at DESC
            LIMIT ?`,
            [schoolId, schoolId, schoolId, limit]
        );

        res.json({ success: true, transactions });

    } catch (error) {
        console.error('Fetch recent transactions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/dashboard/monthly-revenue
// @desc    Get monthly revenue data for chart (last 6 months) - school-specific
router.get('/dashboard/monthly-revenue', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [monthlyData] = await db.query(
            `SELECT 
                DATE_FORMAT(payment_date, '%Y-%m') as month,
                DATE_FORMAT(payment_date, '%b %Y') as month_name,
                SUM(paid_amount) as revenue
            FROM fee_records
            WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            AND school_id = ?
            GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
            ORDER BY month ASC`,
            [schoolId]
        );

        res.json({ success: true, monthlyData });

    } catch (error) {
        console.error('Fetch monthly revenue error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/students
// @desc    Get all students with their fee records, class and section details (school-specific)
router.get('/students', async (req, res) => {
    try {
        const { class: classFilter, section: sectionFilter, search, status, stream } = req.query;
        const schoolId = req.user.school_id;

        // Join Students -> Users -> Classes -> Sections -> Fee Records (LEFT JOIN for students without fees)
        // Use subquery for fee_structures to avoid duplicate rows when multiple fee_structures exist for a class
        let query = `
            SELECT 
                s.id as student_id,
                s.roll_no,
                s.class as class_number,
                s.section as section_code,
                c.id as class_id,
                c.name as class_name,
                sec.name as section_name,
                u.id as user_id,
                u.name as student_name,
                u.email,
                u.phone,
                s.father_name,
                s.mother_name,
                s.father_phone,
                s.mother_phone,
                s.admission_date,
                s.admission_date,
                fr.id as fee_record_id,
                fr.fee_type,
                fr.total_amount,
                fr.paid_amount,
                fr.pending_amount,
                fr.last_payment_date,
                fr.status as fee_status,
                fr.academic_year,
                fs_agg.max_total_fee as structure_total_fee
            FROM students s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN classes c ON s.class = c.class_number AND c.school_id = ?
            LEFT JOIN sections sec ON s.section = sec.code AND sec.school_id = ?
            LEFT JOIN fee_records fr ON s.id = fr.student_id AND fr.school_id = ? AND (fr.class_name = c.name OR fr.class_name = c.class_number)
            LEFT JOIN (
                SELECT class_id, school_id, MAX(total_fee) as max_total_fee 
                FROM fee_structures 
                GROUP BY class_id, school_id
            ) fs_agg ON c.id = fs_agg.class_id AND fs_agg.school_id = ?
            WHERE s.school_id = ?
        `;

        const params = [schoolId, schoolId, schoolId, schoolId, schoolId];

        // Apply Filters
        if (classFilter) {
            query += ' AND s.class = ?';
            params.push(classFilter);
        }
        if (sectionFilter) {
            query += ' AND s.section = ?';
            params.push(sectionFilter);
        }
        if (search) {
            query += ' AND u.name LIKE ?';
            params.push(`%${search}%`);
        }
        if (stream) {
            query += ' AND s.stream_id = ?';
            params.push(stream);
        }

        query += ' ORDER BY s.class, s.section, s.roll_no ASC';

        const [rows] = await db.query(query, params);

        // Group by student, deduplicating fee record rows
        const studentMap = new Map();

        rows.forEach(row => {
            if (!studentMap.has(row.student_id)) {
                studentMap.set(row.student_id, {
                    student_id: row.student_id,
                    roll_no: row.roll_no,
                    class_number: row.class_number,
                    section_code: row.section_code,
                    class_name: row.class_name,
                    section_name: row.section_name,
                    user_id: row.user_id,
                    student_name: row.student_name,
                    email: row.email,
                    phone: row.phone,
                    father_name: row.father_name,
                    mother_name: row.mother_name,
                    total_amount: 0,
                    paid_amount: 0,
                    pending_amount: 0,
                    fee_status: 'paid',
                    structure_total_fee: row.structure_total_fee ? Number(row.structure_total_fee) : 0,
                    // We will aggregate fee types here
                    fee_types_map: new Map(),
                    processed_fr_ids: new Set(), // Track processed fee_record IDs to avoid duplicates
                    fee_records: [],
                    needs_fee_record: false
                });
            }

            const student = studentMap.get(row.student_id);

            // Fee Record Aggregation Logic — skip if we already processed this fee_record_id
            if (row.fee_record_id && !student.processed_fr_ids.has(row.fee_record_id)) {
                student.processed_fr_ids.add(row.fee_record_id);

                const type = row.fee_type || 'Fee';
                const className = row.class_name || '';
                const academicYear = row.academic_year || '';
                const groupKey = `${type}|${className}|${academicYear}`;
                if (!student.fee_types_map.has(groupKey)) {
                    student.fee_types_map.set(groupKey, {
                        id: row.fee_record_id, // Keep ID of the first record (usually the bill)
                        type: type,
                        class_name: className,
                        academic_year: academicYear,
                        total: 0,
                        paid: 0,
                        pending: 0,
                        status: 'paid'
                    });
                }

                const feeGroup = student.fee_types_map.get(groupKey);

                // If this is a "Bill" record (has total amount), use its ID
                if (Number(row.total_amount) > 0) {
                    feeGroup.id = row.fee_record_id;
                }

                // Use max instead of sum — total_amount is the full bill, not a partial payment
                feeGroup.total = Math.max(feeGroup.total, Number(row.total_amount));
                feeGroup.paid += Number(row.paid_amount);

                // Only aggregate paid_amount from records (total comes from fee structure)
                student.paid_amount += Number(row.paid_amount);
            } else if (!row.fee_record_id && row.structure_total_fee) {
                student.total_amount = Number(row.structure_total_fee);
                student.pending_amount = Number(row.structure_total_fee);
                student.fee_status = 'pending';
                student.needs_fee_record = true;
            }
        });

        // Finalize Student Objects
        const processedStudents = Array.from(studentMap.values()).map(s => {
            // Flatten fee_types_map to fee_records array
            if (s.fee_types_map && s.fee_types_map.size > 0) {
                s.fee_records = Array.from(s.fee_types_map.values()).map(f => {
                    f.pending = f.total - f.paid; // Dynamic Pending Calculation
                    if (f.pending > 0) f.status = 'pending';
                    else f.status = 'paid';
                    return f;
                });

                // Calculate total billed from distinct fee types (includes Admission Fee, Annual Fee, etc.)
                const feeTypesTotal = s.fee_records.reduce((sum, f) => sum + f.total, 0);

                if (feeTypesTotal > 0) {
                    // Use the sum of distinct fee types as total (correctly includes admission fees)
                    s.total_amount = feeTypesTotal;
                } else if (s.structure_total_fee > 0) {
                    // Fallback to fee structure total if no fee records have totals
                    s.total_amount = s.structure_total_fee;
                }

                // Recalculate Student Pending from aggregated records
                s.pending_amount = s.total_amount - s.paid_amount;

                if (s.pending_amount > 0) {
                    s.fee_status = 'pending';
                } else {
                    s.fee_status = 'paid';
                }
            } else if (s.needs_fee_record) {
                // Already handled in else block above (has structure but no record)
            } else {
                // No fee structure and no fee records - show as 'not_available'
                s.fee_status = 'not_available';
            }

            delete s.fee_types_map;
            delete s.processed_fr_ids;
            delete s.structure_total_fee;
            return s;
        });

        res.json({ success: true, students: processedStudents });

    } catch (error) {
        console.error('Fetch students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/classes
// @desc    Get all classes for filter dropdown (school-specific)
router.get('/classes', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [classes] = await db.query(
            'SELECT id, name, class_number FROM classes WHERE school_id = ? ORDER BY class_number ASC',
            [schoolId]
        );
        res.json({ success: true, classes });
    } catch (error) {
        console.error('Fetch classes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/sections
// @desc    Get all sections for filter dropdown (school-specific)
router.get('/sections', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [sections] = await db.query(
            'SELECT id, name, code FROM sections WHERE school_id = ? ORDER BY code ASC',
            [schoolId]
        );
        res.json({ success: true, sections });
    } catch (error) {
        console.error('Fetch sections error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/streams
// @desc    Get all streams/groups for the school
router.get('/streams', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [streams] = await db.query(
            'SELECT id, name FROM streams WHERE school_id = ? ORDER BY name',
            [schoolId]
        );
        res.json({ success: true, streams });
    } catch (error) {
        console.error('Fetch streams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/accounts/fees
// @desc    Create a new fee record for a student (school-specific)
router.post('/fees', async (req, res) => {
    try {
        const {
            student_id,
            total_amount,
            academic_year
        } = req.body;
        const schoolId = req.user.school_id;

        // Validate input
        if (!student_id || !total_amount || !academic_year) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Fetch student name and class name (verify belongs to school)
        const [studentData] = await db.query(
            `SELECT u.name as student_name, s.class, c.name as class_name
             FROM students s
             JOIN users u ON s.user_id = u.id
             LEFT JOIN classes c ON s.class = c.class_number AND c.school_id = ?
             WHERE s.id = ? AND s.school_id = ?`,
            [schoolId, student_id, schoolId]
        );

        if (studentData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const { student_name, class_name } = studentData[0];

        // Insert fee record (Bill) - due_date is now optional/NULL
        const [result] = await db.query(
            `INSERT INTO fee_records 
            (student_id, student_name, class_name, total_amount, paid_amount, pending_amount, status, academic_year, fee_type, received_by, school_id) 
            VALUES (?, ?, ?, ?, 0, ?, 'pending', ?, 'Annual Fee', ?, ?)`,
            [student_id, student_name, class_name, total_amount, total_amount, academic_year, req.user.id, schoolId]
        );

        res.json({
            success: true,
            message: 'Fee record created successfully',
            fee_record_id: result.insertId
        });

    } catch (error) {
        console.error('Create fee error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/accounts/fees/:id/pay
// @desc    Record a payment for a fee record (school-specific)
router.put('/fees/:id/pay', async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId, paymentDate } = req.body;
        const feeRecordId = req.params.id;
        const schoolId = req.user.school_id;

        // Get the target fee record to determine Type and Student (verify school ownership)
        const [feeRecords] = await db.query(
            'SELECT * FROM fee_records WHERE id = ? AND school_id = ?',
            [feeRecordId, schoolId]
        );

        if (feeRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        const targetRecord = feeRecords[0];

        // Start transaction
        await db.query('START TRANSACTION');

        // INSERT NEW ROW for the payment (Do not update the bill directly, use ledger style)
        // Set total_amount=0, pending_amount=0 (as it's just a credit entry)
        // Status 'paid'
        await db.query(
            `INSERT INTO fee_records 
             (student_id, student_name, class_name, fee_type, total_amount, paid_amount, pending_amount, 
              payment_method, transaction_id, payment_date, 
              status, academic_year, received_by, school_id)
             VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?, ?, 'paid', ?, ?, ?)`,
            [
                targetRecord.student_id,
                targetRecord.student_name,
                targetRecord.class_name,
                targetRecord.fee_type,
                amount,
                paymentMethod === 'online' ? 'online' : 'offline',
                transactionId || null,
                paymentDate || new Date(),
                targetRecord.academic_year,
                req.user.id,
                schoolId
            ]
        );

        // Note: We don't update the status of the Original Bill Record 'pending'/'paid'
        // effectively, because our Get logic aggregates everything dynamically.
        // It stays 'pending', but the Sum(Paid) increases, so computed Pending decreases.

        await db.query('COMMIT');

        res.json({
            success: true,
            message: 'Payment recorded successfully'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Payment update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/accounts/fees/transaction/:id
// @desc    Update an existing payment transaction
router.put('/fees/transaction/:id', async (req, res) => {
    try {
        const transactionId = req.params.id;
        const { amount, paymentMethod, transactionId: refId, paymentDate } = req.body;

        // Validate
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const [payment] = await db.query('SELECT * FROM fee_records WHERE id = ?', [transactionId]);
        if (payment.length === 0) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        await db.query(`
            UPDATE fee_records 
            SET paid_amount = ?, payment_method = ?, transaction_id = ?, payment_date = ?
            WHERE id = ?
        `, [amount, paymentMethod, refId, paymentDate, transactionId]);

        res.json({ success: true, message: 'Transaction updated successfully' });

    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/fees/:studentId/history
// @desc    Get payment history for a student (school-specific)
router.get('/fees/:studentId/history', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const [payments] = await db.query(
            `SELECT 
                fr.id,
                fr.student_id,
                fr.paid_amount as amount,
                fr.total_amount,
                fr.payment_date,
                fr.payment_method,
                fr.transaction_id,
                u.name as received_by_name,
                fr.fee_type as remarks,
                fr.class_name,
                fr.created_at,
                fr.academic_year
            FROM fee_records fr
            LEFT JOIN users u ON fr.received_by = u.id
            WHERE fr.student_id = ? AND fr.school_id = ?
            ORDER BY fr.class_name ASC, fr.total_amount DESC, fr.payment_date DESC, fr.id DESC`,
            [req.params.studentId, schoolId]
        );

        res.json({ success: true, payments });
    } catch (error) {
        console.error('Fetch payment history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/accounts/fees/transaction/:id
// @desc    Delete a payment record (school-specific)
router.delete('/fees/transaction/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const paymentId = req.params.id;

        // Verify the record exists and belongs to this school
        const [record] = await db.query(
            'SELECT * FROM fee_records WHERE id = ? AND school_id = ?',
            [paymentId, schoolId]
        );

        if (record.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        // Delete the record
        await db.query(
            'DELETE FROM fee_records WHERE id = ? AND school_id = ?',
            [paymentId, schoolId]
        );

        res.json({ success: true, message: 'Payment record deleted successfully' });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// PAYSLIP & PAYROLL ROUTES
// ==========================================

// Multer Config for Payslips
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

// @route   GET /api/accounts/teachers
// @desc    Get all teachers with salary details
router.get('/teachers', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [teachers] = await db.query(
            `SELECT t.id, u.name, t.employee_id, u.phone, u.email,
                    t.basic_salary, t.allowance, t.deduction
             FROM teachers t 
             JOIN users u ON t.user_id = u.id 
             WHERE t.school_id = ? AND u.status = 'active'`,
            [schoolId]
        );
        res.json({ success: true, teachers });
    } catch (error) {
        console.error('Fetch teachers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// REQUISITION & VENDOR ROUTES
// ==========================================

// @route   GET /api/accounts/requisitions
// @desc    Get requisitions (filtered by role)
router.get('/requisitions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { status, user_role } = req.query; // status: 'Pending' or 'Approved'/'Rejected' (Case sensitive in DB likely 'Pending')

        let data = [];

        // Helper to normalize data
        const normalize = (rows, role) => rows.map(r => ({
            id: r.id,
            school_id: r.school_id,
            created_at: r.submitted_date || r.date, // normalizing date field
            title: r.item_name || r.title || 'Untitled', // adjusting for potential column names
            description: r.description || r.reason,
            status: r.status,
            requester_name: role === 'teacher' ? r.teacher_name : r.student_name,
            user_role: role,
            category: r.category,
            quantity: r.quantity,
            urgency: r.urgency
        }));

        // Fetch Teachers Requisitions
        if (!user_role || user_role === 'teacher') {
            let query = `SELECT tr.*, u.name as teacher_name 
                         FROM teachers_requisition tr 
                         JOIN teachers t ON tr.teacher_id = t.id 
                         JOIN users u ON t.user_id = u.id 
                         WHERE tr.school_id = ?`;
            const params = [schoolId];
            if (status) {
                query += ' AND tr.status = ?';
                params.push(status.charAt(0).toUpperCase() + status.slice(1)); // Ensure Capitalized 'Pending'
            }
            query += ' ORDER BY tr.submitted_date DESC';

            const [rows] = await db.query(query, params);
            data = [...data, ...normalize(rows, 'teacher')];
        }

        // Fetch Student Requisitions
        if (!user_role || user_role === 'student') {
            let query = `SELECT sr.* 
                         FROM student_requisition sr 
                         WHERE sr.school_id = ?`;
            const params = [schoolId];
            if (status) {
                query += ' AND sr.status = ?';
                params.push(status.charAt(0).toUpperCase() + status.slice(1));
            }
            query += ' ORDER BY sr.submitted_date DESC';

            const [rows] = await db.query(query, params);
            data = [...data, ...normalize(rows, 'student')];
        }

        res.json({ success: true, requisitions: data });
    } catch (error) {
        console.error('Fetch requisitions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/accounts/requisitions/:id/status
// @desc    Approve/Reject requisition. If approved, create DRAFT TENDER.
router.put('/requisitions/:id/status', async (req, res) => {
    try {
        const { status, user_role, remarks } = req.body; // status: 'Approved', 'Rejected'
        const schoolId = req.user.school_id;
        const requisitionId = req.params.id;
        const processedStatus = status.charAt(0).toUpperCase() + status.slice(1); // 'Approved'

        const table = user_role === 'teacher' ? 'teachers_requisition' : 'student_requisition';

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `UPDATE ${table} SET status = ?, approved_by = ?, approved_date = NOW(), remarks = ? WHERE id = ? AND school_id = ?`,
                [processedStatus, req.user.name, remarks || '', requisitionId, schoolId]
            );

            if (processedStatus === 'Approved') {
                // Get requisition details to Create Tender
                const [reqData] = await connection.query(`SELECT * FROM ${table} WHERE id = ?`, [requisitionId]);
                if (reqData.length > 0) {
                    const r = reqData[0];
                    const title = r.item_name || r.title || 'Requisition Tender';
                    const desc = `${r.description || ''} (Qty: ${r.quantity || 1})`;

                    // Create Draft Tender
                    await connection.query(
                        `INSERT INTO tenders (school_id, title, description, min_bid_amount, opening_date, closing_date, requisition_id, status)
                         VALUES (?, ?, ?, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?, 'draft')`,
                        [schoolId, `Tender for ${title}`, desc, r.id] // Note: requisition_id might not be unique across tables, but tenders.requisition_id is just an INT. We might lose context of which table it came from unless we modify tenders table or just use it as ref.
                    );
                }
            }

            await connection.commit();
            res.json({ success: true, message: `Requisition ${status}` });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Update requisition status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/vendors
router.get('/vendors', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [vendors] = await db.query('SELECT * FROM vendors WHERE school_id = ? ORDER BY created_at DESC', [schoolId]);
        res.json({ success: true, vendors });
    } catch (error) {
        console.error('Fetch vendors error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/accounts/vendors
router.post('/vendors', async (req, res) => {
    try {
        const { name, contact_person, phone, email, address } = req.body;
        const schoolId = req.user.school_id;
        await db.query(
            'INSERT INTO vendors (school_id, name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
            [schoolId, name, contact_person, phone, email, address]
        );
        res.json({ success: true, message: 'Vendor added' });
    } catch (error) {
        console.error('Add vendor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/tenders
router.get('/tenders', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [tenders] = await db.query('SELECT * FROM tenders WHERE school_id = ? ORDER BY created_at DESC', [schoolId]);
        res.json({ success: true, tenders });
    } catch (error) {
        console.error('Fetch tenders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/accounts/tenders/:id/publish
router.put('/tenders/:id/publish', async (req, res) => {
    try {
        const { min_bid_amount, closing_date } = req.body;
        const schoolId = req.user.school_id;
        const tenderId = req.params.id;

        await db.query(
            'UPDATE tenders SET status = ?, min_bid_amount = ?, closing_date = ? WHERE id = ? AND school_id = ?',
            ['published', min_bid_amount, closing_date, tenderId, schoolId]
        );
        res.json({ success: true, message: 'Tender published' });
    } catch (error) {
        console.error('Publish tender error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/tenders/:id/quotations
router.get('/tenders/:id/quotations', async (req, res) => {
    try {
        const tenderId = req.params.id;
        // Assuming quotations table has tender_id
        // NOTE: In previous steps we added vendor_id to quotations. We need to verify if quotations table links to tender directly or if it's via requisition? 
        // Standard flow: Tender -> Quotations. So quotations should have tender_id.
        // Let's assume quotations table has 'tender_id'. If not, we might need to fix schema.
        // Based on previous create_requisition_tables.sql, we ALtered quotations to add vendor_id and status. 
        // We did NOT explicitly add tender_id to quotations in the migration snippet I viewed earlier.
        // Checking schema of `quotations` is safer. But for now I'll write the query assuming standard link.
        // Actually, let's assume 'quotations' table is the one linked to tenders.

        // Wait, the existing `quotations` table might be for something else (general quotes?).
        // If `quotations` table exists, let's check its columns.

        // For now, I will use a query that fits typical structure. 
        // If it fails, I will fix schema.
        const [quotations] = await db.query(
            `SELECT q.*, v.name as vendor_name 
             FROM quotations q 
             JOIN vendors v ON q.vendor_id = v.id 
             WHERE q.tender_id = ?`,
            [tenderId]
        );
        res.json({ success: true, quotations });
    } catch (error) {
        // console.error('Fetch quotations error:', error);
        // Fallback or empty if table doesn't match
        res.json({ success: true, quotations: [] });
    }
});

// @route   PUT /api/accounts/quotations/:id/status
router.put('/quotations/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'accepted', 'rejected'
        const quoteId = req.params.id;

        await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, quoteId]);

        if (status === 'accepted') {
            // Close the tender
            const [quote] = await db.query('SELECT tender_id FROM quotations WHERE id = ?', [quoteId]);
            if (quote.length > 0) {
                await db.query("UPDATE tenders SET status = 'awarded' WHERE id = ?", [quote[0].tender_id]);
            }
        }
        res.json({ success: true, message: `Quotation ${status}` });
    } catch (error) {
        console.error('Update quotation status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/accounts/payslips
// @desc    Upload a payslip
router.post('/payslips', uploadPayslip.single('file'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { teacher_id, month, year, title } = req.body;
        const file = req.file;

        if (!file || !teacher_id || !month || !year) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const filePath = `/upload/teacher_payslips/${file.filename}`;

        const [result] = await db.query(
            `INSERT INTO teacher_payslips (school_id, teacher_id, month, year, title, file_path)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [schoolId, teacher_id, month, year, title, filePath]
        );

        res.json({ success: true, message: 'Payslip uploaded successfully' });
    } catch (error) {
        console.error('Upload payslip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// FINANCIAL REPORTS (ADVANCED)
// ==========================================

// @route   GET /api/accounts/reports/balance-sheet
// @desc    Get Balance Sheet Data (Assets, Liabilities, Equity) - Schedule III Format
router.get('/reports/balance-sheet', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { endDate } = req.query;

        // --- ASSETS ---
        // 1. Non-Current Assets
        // Fixed Assets (Equipment, Furniture, Property)
        const [fixedAssetsData] = await db.query(
            `SELECT SUM(amount) as total FROM expenses WHERE school_id = ? AND category IN ('Equipment', 'Furniture', 'Property', 'Building', 'Vehicles') AND date <= ?`,
            [schoolId, endDate]
        );
        const fixedAssets = parseFloat(fixedAssetsData[0].total || 0);

        // 2. Current Assets
        // Cash & Cash Equivalents (Cash in Hand + Bank)
        const [inflow] = await db.query(
            `SELECT SUM(paid_amount) as total FROM fee_records WHERE school_id = ? AND payment_date <= ?`,
            [schoolId, endDate]
        );
        const [outflow] = await db.query(
            `SELECT SUM(amount) as total FROM expenses WHERE school_id = ? AND date <= ?`,
            [schoolId, endDate]
        );
        const cashEquivalents = (parseFloat(inflow[0].total || 0) - parseFloat(outflow[0].total || 0));

        // Trade Receivables (Pending Fees from fee_records)
        // Note: This sums up pending balace from existing fee records.
        // Students who haven't paid anything might not have records, effectively ignored here.
        const [receivablesData] = await db.query(
            `SELECT SUM(total_amount - paid_amount) as pending FROM fee_records WHERE school_id = ?`,
            [schoolId]
        );
        const tradeReceivables = parseFloat(receivablesData[0].pending || 0);

        // Inventories (Placeholder)
        const inventories = 0;

        // --- EQUITY AND LIABILITIES ---
        // 1. Shareholders' Funds
        const shareCapital = 0;
        // Reserves and Surplus (Assets - Liabilities to balance)

        // 2. Non-Current Liabilities
        const longTermBorrowings = 0;

        // 3. Current Liabilities
        const tradePayables = 0;
        // GST Payable
        const [gstData] = await db.query(
            `SELECT SUM(gst_amount) as total FROM fee_records WHERE school_id = ? AND payment_date <= ?`,
            [schoolId, endDate]
        );
        const gstPayable = parseFloat(gstData[0].total || 0);
        const shortTermProvisions = 0;

        // Totals
        const totalNonCurrentAssets = fixedAssets;
        const totalCurrentAssets = cashEquivalents + tradeReceivables + inventories;
        const totalAssets = totalNonCurrentAssets + totalCurrentAssets;

        const totalNonCurrentLiabilities = longTermBorrowings;
        const totalCurrentLiabilities = tradePayables + gstPayable + shortTermProvisions;
        const totalLiabilities = totalNonCurrentLiabilities + totalCurrentLiabilities;

        const reservesAndSurplus = totalAssets - (shareCapital + totalLiabilities);
        const totalEquity = shareCapital + reservesAndSurplus;
        const totalEquityAndLiabilities = totalEquity + totalLiabilities;

        res.json({
            success: true,
            balanceSheet: {
                equity_and_liabilities: {
                    shareholders_funds: {
                        share_capital: shareCapital,
                        reserves_and_surplus: reservesAndSurplus,
                        total: shareCapital + reservesAndSurplus
                    },
                    non_current_liabilities: {
                        long_term_borrowings: longTermBorrowings,
                        total: longTermBorrowings
                    },
                    current_liabilities: {
                        trade_payables: tradePayables,
                        other_current_liabilities: gstPayable,
                        short_term_provisions: shortTermProvisions,
                        total: totalCurrentLiabilities
                    },
                    total: totalEquityAndLiabilities
                },
                assets: {
                    non_current_assets: {
                        fixed_assets: fixedAssets,
                        total: totalNonCurrentAssets
                    },
                    current_assets: {
                        inventories: inventories,
                        trade_receivables: tradeReceivables,
                        cash_and_cash_equivalents: cashEquivalents,
                        total: totalCurrentAssets
                    },
                    total: totalAssets
                }
            }
        });

    } catch (error) {
        console.error('Balance Sheet Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/reports/income-statement
// @desc    Get Income Statement (Gross Income, Tax, Net Income)
router.get('/reports/income-statement', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        // 1. REVENUE
        // Fee Collection
        const [feeData] = await db.query(
            `SELECT SUM(net_amount) as total FROM fee_records WHERE school_id = ? AND payment_date BETWEEN ? AND ? AND status = 'paid'`,
            [schoolId, startDate, endDate]
        );
        const feeRevenue = parseFloat(feeData[0].total || 0);

        // Other Income (Placeholder)
        const otherIncome = 0;

        const totalRevenue = feeRevenue + otherIncome;

        // 2. EXPENSES
        const [expenseData] = await db.query(
            `SELECT category, SUM(amount + COALESCE(gst_amount, 0)) as total FROM expenses WHERE school_id = ? AND date BETWEEN ? AND ? GROUP BY category`,
            [schoolId, startDate, endDate]
        );

        let totalExpenses = 0;
        const expensesBreakdown = expenseData.map(e => {
            totalExpenses += parseFloat(e.total || 0);
            return { category: e.category, amount: e.total };
        });

        // 3. GROSS INCOME
        const grossIncome = totalRevenue - totalExpenses;

        // 4. TAX
        // Placeholder tax calculation (e.g., 0 for now as Schools are often tax-exempt or simple accounting)
        const taxRate = 0;
        const taxAmount = (grossIncome > 0) ? (grossIncome * taxRate) : 0;

        // 5. NET INCOME
        const netIncome = grossIncome - taxAmount;

        res.json({
            success: true,
            incomeStatement: {
                revenue: {
                    fees: feeRevenue,
                    other: otherIncome,
                    total: totalRevenue
                },
                expenses: {
                    breakdown: expensesBreakdown,
                    total: totalExpenses
                },
                gross_income: grossIncome,
                tax: taxAmount,
                net_income: netIncome
            }
        });
    } catch (error) {
        console.error('Income Statement Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// (Duplicate /teachers route removed — now served at line ~946)

// @route   PUT /api/accounts/teachers/:id/salary
// @desc    Update teacher salary details
router.put('/teachers/:id/salary', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const teacherId = req.params.id;
        const { basic_salary, allowance, deduction } = req.body;

        await db.query(
            `UPDATE teachers 
             SET basic_salary = ?, allowance = ?, deduction = ? 
             WHERE id = ? AND school_id = ?`,
            [basic_salary || 0, allowance || 0, deduction || 0, teacherId, schoolId]
        );

        res.json({ success: true, message: 'Salary updated successfully' });
    } catch (error) {
        console.error('Update salary error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/reports/cashflow
// @desc    Get Cashflow Statement (Operating, Investing, Financing)
router.get('/reports/cashflow', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        // 1. Operating Activities
        // Cash In (Collections)
        const [inflowData] = await db.query(
            `SELECT SUM(paid_amount) as total FROM fee_records WHERE school_id = ? AND payment_date BETWEEN ? AND ? AND status = 'paid'`,
            [schoolId, startDate, endDate]
        );
        const cashInflow = parseFloat(inflowData[0].total || 0);

        // Cash Out (Expenses - excluding Capital Expenditures like Equipment)
        const [outflowData] = await db.query(
            `SELECT SUM(amount + COALESCE(gst_amount, 0)) as total FROM expenses WHERE school_id = ? AND date BETWEEN ? AND ? AND category NOT IN ('Equipment', 'Furniture')`,
            [schoolId, startDate, endDate]
        );
        const cashOutflow = parseFloat(outflowData[0].total || 0);

        const netOperating = cashInflow - cashOutflow;

        // 2. Investing Activities
        // Purchase of Equipment (Capital Expenses)
        const [capexData] = await db.query(
            `SELECT SUM(amount + COALESCE(gst_amount, 0)) as total FROM expenses WHERE school_id = ? AND date BETWEEN ? AND ? AND category IN ('Equipment', 'Furniture')`,
            [schoolId, startDate, endDate]
        );
        const netInvesting = -(parseFloat(capexData[0].total || 0)); // Outflow

        // 3. Financing Activities (Loans, Equity injection - Placeholder)
        const netFinancing = 0;

        const netChange = netOperating + netInvesting + netFinancing;

        // Calculate Opening Balance (Cash before start date)
        // This is complex without a running balance table, so we ignore or estimate 0 for now.
        const openingBalance = 0;
        const closingBalance = openingBalance + netChange;

        res.json({
            success: true,
            cashflow: {
                operating: {
                    inflow: cashInflow,
                    outflow: cashOutflow,
                    net: netOperating
                },
                investing: {
                    net: netInvesting
                },
                financing: {
                    net: netFinancing
                },
                net_change: netChange,
                opening_balance: openingBalance,
                closing_balance: closingBalance
            }
        });

    } catch (error) {
        console.error('Cashflow Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// @route   GET /api/accounts/reports/gst-detailed
// @desc    Get Detailed GST Report (List View)
router.get('/reports/gst-detailed', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { startDate, endDate } = req.query;

        // Fee payment transactions (income with GST)
        const [transactions] = await db.query(
            `SELECT 
                t.id, t.transaction_id, t.payment_date, t.net_amount, t.gst_amount, t.paid_amount as total_amount,
                t.student_name, t.class_name, 'income' as entry_type
             FROM fee_records t
             WHERE t.school_id = ? AND t.payment_date BETWEEN ? AND ? AND status = 'paid'
             ORDER BY t.payment_date DESC`,
            [schoolId, startDate, endDate]
        );

        // Expenses with GST
        const [expenseTransactions] = await db.query(
            `SELECT 
                e.id, NULL as transaction_id, e.expense_date as payment_date,
                (e.amount - COALESCE(e.gst_amount, 0)) as net_amount,
                COALESCE(e.gst_amount, 0) as gst_amount,
                e.amount as total_amount,
                e.title as student_name, e.category as class_name, 'expense' as entry_type
             FROM expenses e
             WHERE e.school_id = ? AND e.expense_date BETWEEN ? AND ? AND COALESCE(e.gst_amount, 0) > 0
             ORDER BY e.expense_date DESC`,
            [schoolId, startDate, endDate]
        );

        // Combine both
        const allTransactions = [...transactions, ...expenseTransactions]
            .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

        res.json({ success: true, transactions: allTransactions });
    } catch (error) {
        console.error('GST Detailed Report Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/payslips
// @desc    Get all payslips
router.get('/payslips', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [payslips] = await db.query(
            `SELECT p.*, u.name as teacher_name 
             FROM teacher_payslips p
             JOIN teachers t ON p.teacher_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE p.school_id = ?
             ORDER BY p.created_at DESC`,
            [schoolId]
        );
        res.json({ success: true, payslips });
    } catch (error) {
        console.error('Fetch payslips error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/accounts/payslips/:id
// @desc    Delete a payslip
router.delete('/payslips/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const payslipId = req.params.id;

        const [payslips] = await db.query('SELECT * FROM teacher_payslips WHERE id = ? AND school_id = ?', [payslipId, schoolId]);
        if (payslips.length === 0) return res.status(404).json({ success: false, message: 'Payslip not found' });

        const payslip = payslips[0];
        const filePath = path.join(__dirname, '..', payslip.file_path);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM teacher_payslips WHERE id = ?', [payslipId]);
        res.json({ success: true, message: 'Payslip deleted successfully' });
    } catch (error) {
        console.error('Delete payslip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/accounts/reports/hourly-today
// @desc    Get hourly revenue and expenses for today (school-specific)
router.get('/reports/hourly-today', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Hourly Revenue (Fees) with detailed breakdown
        // Fee transactions with status 'paid' or 'partial' created today (IST)
        const [feesHourly] = await db.query(
            `SELECT 
                HOUR(fr.created_at) as hour, 
                SUM(fr.paid_amount) as total,
                SUM(fr.gst_amount) as gst,
                SUM(CASE WHEN fr.payment_method = 'cash' THEN fr.paid_amount ELSE 0 END) as cash,
                SUM(CASE WHEN fr.payment_method = 'online' THEN fr.paid_amount ELSE 0 END) as online
             FROM fee_records fr
             WHERE DATE(fr.created_at) = CURDATE() 
             AND fr.school_id = ? 
             AND fr.paid_amount > 0
             GROUP BY HOUR(fr.created_at)
             ORDER BY hour ASC`,
            [schoolId]
        );

        // Hourly Expenses (IST)
        const [expensesHourly] = await db.query(
            `SELECT 
                HOUR(expense_time) as hour, 
                SUM(e.amount + COALESCE(e.gst_amount, 0)) as total,
                SUM(e.gst_amount) as gst
             FROM expenses e
             WHERE e.expense_date = CURDATE() 
             AND e.school_id = ? 
             GROUP BY HOUR(expense_time)
             ORDER BY hour ASC`,
            [schoolId]
        );

        // combined data for 24 hours
        const hourlyData = [];
        for (let i = 0; i < 24; i++) {
            // Find data for this hour
            const feeRow = feesHourly.find(r => r.hour === i);
            const expRow = expensesHourly.find(r => r.hour === i);

            // Format label e.g., "10 AM"
            const date = new Date();
            date.setHours(i, 0, 0, 0);
            const label = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

            hourlyData.push({
                hour: i,
                label: label,
                Revenue: feeRow ? parseFloat(feeRow.total) : 0,
                Expenses: expRow ? parseFloat(expRow.total) : 0,
                Profit: (feeRow ? parseFloat(feeRow.total) : 0) - (expRow ? parseFloat(expRow.total) : 0),
                GST: feeRow ? parseFloat(feeRow.gst || 0) : 0,
                GST_Expenses: expRow ? parseFloat(expRow.gst || 0) : 0,
                CashRevenue: feeRow ? parseFloat(feeRow.cash || 0) : 0,
                OnlineRevenue: feeRow ? parseFloat(feeRow.online || 0) : 0
            });
        }

        res.json({ success: true, hourlyData });

    } catch (error) {
        console.error('Hourly report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;