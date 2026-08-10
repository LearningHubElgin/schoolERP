const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const generateBillPdf = require('../utils/generateBillPdf');

// Apply auth middleware to all store routes
router.use(authMiddleware);

// ==========================================
// STORE ROUTES
// ==========================================

// @route   GET /api/store/stores
// @desc    Get all stores for the school
router.get('/stores', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [stores] = await db.query(
            'SELECT * FROM stores WHERE school_id = ? AND is_active = TRUE ORDER BY name',
            [schoolId]
        );
        res.json({ success: true, stores });
    } catch (error) {
        console.error('Fetch stores error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/store/stores
// @desc    Create a new store
router.post('/stores', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, slug, icon, description } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ success: false, message: 'Name and slug are required' });
        }

        await db.query(
            'INSERT INTO stores (school_id, name, slug, icon, description) VALUES (?, ?, ?, ?, ?)',
            [schoolId, name, slug, icon || '🏪', description || '']
        );

        res.json({ success: true, message: 'Store created successfully' });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/store/stores/:id
// @desc    Update a store
router.put('/stores/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, icon, description, is_active } = req.body;

        await db.query(
            'UPDATE stores SET name = ?, icon = ?, description = ?, is_active = ? WHERE id = ? AND school_id = ?',
            [name, icon, description, is_active, req.params.id, schoolId]
        );

        res.json({ success: true, message: 'Store updated' });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// DASHBOARD
// ==========================================

// @route   GET /api/store/dashboard
// @desc    Overview dashboard — stats for all stores
router.get('/dashboard', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Get all stores
        const [stores] = await db.query(
            'SELECT * FROM stores WHERE school_id = ? AND is_active = TRUE',
            [schoolId]
        );

        // For each store, get summary stats
        const storeStats = [];
        for (const store of stores) {
            const [[invStats]] = await db.query(
                `SELECT 
                    COUNT(*) as total_items,
                    COALESCE(SUM(quantity), 0) as total_stock,
                    COALESCE(SUM(quantity * selling_price), 0) as stock_value,
                    COALESCE(SUM(CASE WHEN quantity <= low_stock_threshold THEN 1 ELSE 0 END), 0) as low_stock_items
                 FROM store_inventory WHERE store_id = ? AND school_id = ?`,
                [store.id, schoolId]
            );

            const [[salesStats]] = await db.query(
                `SELECT 
                    COUNT(*) as total_transactions,
                    COALESCE(SUM(total_amount), 0) as total_revenue
                 FROM store_transactions WHERE store_id = ? AND school_id = ? AND transaction_type = 'sale'`,
                [store.id, schoolId]
            );

            const [[todaySales]] = await db.query(
                `SELECT COALESCE(SUM(total_amount), 0) as today_revenue, COUNT(*) as today_transactions
                 FROM store_transactions 
                 WHERE store_id = ? AND school_id = ? AND transaction_type = 'sale' 
                 AND DATE(created_at) = CURDATE()`,
                [store.id, schoolId]
            );

            storeStats.push({
                ...store,
                total_items: invStats.total_items,
                total_stock: invStats.total_stock,
                stock_value: invStats.stock_value,
                low_stock_items: invStats.low_stock_items,
                total_transactions: salesStats.total_transactions,
                total_revenue: salesStats.total_revenue,
                today_revenue: todaySales.today_revenue,
                today_transactions: todaySales.today_transactions
            });
        }

        res.json({ success: true, stores: storeStats });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/stores/:storeSlug/dashboard
// @desc    Individual store dashboard
router.get('/stores/:storeSlug/dashboard', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { storeSlug } = req.params;

        const [storeRows] = await db.query(
            'SELECT * FROM stores WHERE slug = ? AND school_id = ?',
            [storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        const store = storeRows[0];

        // Inventory stats
        const [[invStats]] = await db.query(
            `SELECT 
                COUNT(*) as total_items,
                COALESCE(SUM(quantity), 0) as total_stock,
                COALESCE(SUM(quantity * selling_price), 0) as stock_value,
                COALESCE(SUM(CASE WHEN quantity <= low_stock_threshold THEN 1 ELSE 0 END), 0) as low_stock_items
             FROM store_inventory WHERE store_id = ? AND school_id = ?`,
            [store.id, schoolId]
        );

        // Today's sales
        const [[todaySales]] = await db.query(
            `SELECT COALESCE(SUM(total_amount), 0) as today_revenue, COUNT(*) as today_count
             FROM store_transactions 
             WHERE store_id = ? AND school_id = ? AND transaction_type = 'sale' AND DATE(created_at) = CURDATE()`,
            [store.id, schoolId]
        );

        // This month's sales
        const [[monthSales]] = await db.query(
            `SELECT COALESCE(SUM(total_amount), 0) as month_revenue, COUNT(*) as month_count
             FROM store_transactions 
             WHERE store_id = ? AND school_id = ? AND transaction_type = 'sale' 
             AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`,
            [store.id, schoolId]
        );

        // Recent transactions
        const [recentTransactions] = await db.query(
            `SELECT * FROM store_transactions 
             WHERE store_id = ? AND school_id = ?
             ORDER BY created_at DESC LIMIT 10`,
            [store.id, schoolId]
        );

        // Low stock items
        const [lowStockItems] = await db.query(
            `SELECT * FROM store_inventory 
             WHERE store_id = ? AND school_id = ? AND quantity <= low_stock_threshold
             ORDER BY quantity ASC`,
            [store.id, schoolId]
        );

        res.json({
            success: true,
            store,
            stats: { ...invStats, ...todaySales, ...monthSales },
            recentTransactions,
            lowStockItems
        });
    } catch (error) {
        console.error('Store dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// INVENTORY
// ==========================================

// @route   GET /api/store/inventory-overview
// @desc    Store-wise inventory overview (all stores)
router.get('/inventory-overview', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [data] = await db.query(
            `SELECT s.id as store_id, s.name as store_name, s.slug, s.icon,
                    COUNT(si.id) as total_items,
                    COALESCE(SUM(si.quantity), 0) as total_stock,
                    COALESCE(SUM(si.quantity * si.selling_price), 0) as stock_value,
                    COALESCE(SUM(CASE WHEN si.quantity <= si.low_stock_threshold THEN 1 ELSE 0 END), 0) as low_stock_items
             FROM stores s
             LEFT JOIN store_inventory si ON si.store_id = s.id AND si.school_id = ?
             WHERE s.school_id = ? AND s.is_active = TRUE
             GROUP BY s.id
             ORDER BY s.name`,
            [schoolId, schoolId]
        );
        res.json({ success: true, stores: data });
    } catch (error) {
        console.error('Inventory overview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/stores/:storeSlug/inventory
// @desc    Get inventory for a specific store
router.get('/stores/:storeSlug/inventory', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [storeRows] = await db.query(
            'SELECT id, name FROM stores WHERE slug = ? AND school_id = ?',
            [req.params.storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const [items] = await db.query(
            'SELECT * FROM store_inventory WHERE store_id = ? AND school_id = ? ORDER BY item_name',
            [storeRows[0].id, schoolId]
        );
        res.json({ success: true, store: storeRows[0], items });
    } catch (error) {
        console.error('Fetch inventory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/store/stores/:storeSlug/inventory
// @desc    Add inventory item
router.post('/stores/:storeSlug/inventory', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [storeRows] = await db.query(
            'SELECT id FROM stores WHERE slug = ? AND school_id = ?',
            [req.params.storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const { item_name, category, sku, quantity, unit_price, selling_price, low_stock_threshold, description } = req.body;

        await db.query(
            `INSERT INTO store_inventory 
             (store_id, school_id, item_name, category, sku, quantity, unit_price, selling_price, low_stock_threshold, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [storeRows[0].id, schoolId, item_name, category || '', sku || '', quantity || 0, unit_price || 0, selling_price || 0, low_stock_threshold || 5, description || '']
        );

        res.json({ success: true, message: 'Item added to inventory' });
    } catch (error) {
        console.error('Add inventory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/store/stores/:storeSlug/inventory/:id
// @desc    Update inventory item
router.put('/stores/:storeSlug/inventory/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { item_name, category, sku, quantity, unit_price, selling_price, low_stock_threshold, description } = req.body;

        await db.query(
            `UPDATE store_inventory SET 
                item_name = ?, category = ?, sku = ?, quantity = ?, unit_price = ?, 
                selling_price = ?, low_stock_threshold = ?, description = ?
             WHERE id = ? AND school_id = ?`,
            [item_name, category, sku, quantity, unit_price, selling_price, low_stock_threshold, description, req.params.id, schoolId]
        );

        res.json({ success: true, message: 'Item updated' });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/store/stores/:storeSlug/inventory/:id
// @desc    Delete inventory item
router.delete('/stores/:storeSlug/inventory/:id', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        await db.query('DELETE FROM store_inventory WHERE id = ? AND school_id = ?', [req.params.id, schoolId]);
        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        console.error('Delete inventory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// BILL HTML GENERATOR
// ==========================================
function generateBillHtml(bill) {
    const itemRows = bill.items.map(i => `
        <tr>
            <td style="width:45%;padding:5px 0;border-bottom:1px solid #eee;">${i.item_name}</td>
            <td style="width:15%;text-align:center;padding:5px 0;border-bottom:1px solid #eee;">${i.quantity}</td>
            <td style="width:20%;text-align:right;padding:5px 0;border-bottom:1px solid #eee;">${parseFloat(i.unit_price).toLocaleString('en-IN')}</td>
            <td style="width:20%;text-align:right;padding:5px 0;border-bottom:1px solid #eee;">${(i.total_amount || i.quantity * i.unit_price).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    const logoHtml = bill.school_logo_base64
        ? `<div style="margin-bottom:10px;"><img src="${bill.school_logo_base64}" alt="Logo" style="height:60px;object-fit:contain;"></div>`
        : '';

    const getGstSection = () => {
        if (!bill.gst_type || bill.gst_type === 'none') return '';
        const label = bill.gst_type === 'inclusive' ? '(Inc.)' : '(Exc.)';
        return `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#555;">
                <span>GST ${bill.gst_percentage}% ${label}</span>
                <span>₹${parseFloat(bill.gst_amount).toLocaleString('en-IN')}</span>
            </div>
        `;
    };

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Bill - ${bill.bill_number}</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 350px; margin: 0 auto; padding: 20px; color: #333; background: #fff; }
    .header { text-align: center; border-bottom: 2px dashed #bbb; padding-bottom: 15px; margin-bottom: 15px; }
    .header h2 { margin: 5px 0; font-size: 16px; font-weight: 700; text-transform: uppercase; }
    .header p { margin: 2px 0; font-size: 11px; color: #555; }
    .info { font-size: 12px; margin-bottom: 15px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
    th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; font-weight: 600; }
    .total-section { border-top: 1px dashed #bbb; padding-top: 10px; margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 5px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #888; border-top: 1px dashed #eee; padding-top: 10px; }
    .badge { padding: 2px 8px; border-radius: 10px; font-weight: 600; font-size: 10px; }
</style></head><body>
    <div class="header">
        ${logoHtml}
        <h2>${bill.school_name || 'School Store'}</h2>
        <p>${bill.school_address || ''}</p>
        ${bill.school_phone ? `<p>Phone: ${bill.school_phone}</p>` : ''}
        <p style="margin-top:5px;font-weight:600;">${bill.store_name} Receipt</p>
    </div>
    <div class="info">
        <div class="info-row"><span>Bill No:</span> <strong>${bill.bill_number}</strong></div>
        <div class="info-row"><span>Date:</span> <span>${new Date(bill.date).toLocaleString('en-IN')}</span></div>
        <div class="info-row"><span>Customer:</span> <strong>${bill.student_name}</strong></div>
        <div class="info-row"><span>Type:</span> <span>${(bill.buyer_type || 'student').toUpperCase()}</span></div>
    </div>
    <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amt</th></tr></thead>
        <tbody>${itemRows}</tbody>
    </table>
    <div class="total-section">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#555;">
            <span>Subtotal</span><span>₹${parseFloat(bill.subtotal).toLocaleString('en-IN')}</span>
        </div>
        ${getGstSection()}
        <div class="total-row">
            <span>TOTAL</span><span>₹${parseFloat(bill.total_amount).toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:11px;">
            <span>Mode: ${(bill.payment_method || 'cash').toUpperCase()}</span>
            <span style="background:${bill.payment_status === 'paid' ? '#d4edda' : '#fff3cd'};color:${bill.payment_status === 'paid' ? '#155724' : '#856404'};" class="badge">
                ${bill.payment_status === 'paid' ? 'PAID' : 'PENDING'}
            </span>
        </div>
    </div>
    <div class="footer">Thank you! • Computer Generated Output</div>
</body></html>`;
}

// ==========================================
// POS & TRANSACTIONS
// ==========================================

// @route   GET /api/store/people/search
// @desc    Search students AND teachers/staff for POS
router.get('/students/search', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, students: [] });
        }

        // Search students
        const [students] = await db.query(
            `SELECT s.id, s.student_name as name, s.class, s.section, s.roll_no, s.phone,
                    'student' as buyer_type
             FROM students s
             WHERE s.school_id = ? AND (s.student_name LIKE ? OR s.roll_no LIKE ? OR s.phone LIKE ?)
             LIMIT 10`,
            [schoolId, `%${q}%`, `%${q}%`, `%${q}%`]
        );

        // Search teachers/staff
        const [teachers] = await db.query(
            `SELECT t.id, t.name, t.employee_id, t.subject, t.phone,
                    'teacher' as buyer_type
             FROM teachers t
             WHERE t.school_id = ? AND (t.name LIKE ? OR t.employee_id LIKE ? OR t.phone LIKE ?)
             LIMIT 10`,
            [schoolId, `%${q}%`, `%${q}%`, `%${q}%`]
        );

        // Combine results with unified shape
        const results = [
            ...students.map(s => ({
                id: s.id,
                name: s.name,
                detail: `${s.class || ''} ${s.section || ''} • Roll: ${s.roll_no || 'N/A'}`,
                phone: s.phone,
                buyer_type: 'student',
                class: s.class,
                section: s.section
            })),
            ...teachers.map(t => ({
                id: t.id,
                name: t.name,
                detail: `Teacher • ${t.subject || ''} • ID: ${t.employee_id || 'N/A'}`,
                phone: t.phone,
                buyer_type: 'teacher'
            }))
        ];

        res.json({ success: true, students: results });
    } catch (error) {
        console.error('Search people error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/store/stores/:storeSlug/transactions
// @desc    Create a POS sale with auto-generated bill
router.post('/stores/:storeSlug/transactions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [storeRows] = await db.query(
            'SELECT id, name, slug FROM stores WHERE slug = ? AND school_id = ?',
            [req.params.storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        const store = storeRows[0];

        const { items, student_id, student_name, class_name, payment_method, payment_status, buyer_type, gst_percentage, gst_type, notes } = req.body;
        // items: [{ item_id, item_name, quantity, unit_price, total_amount }]

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items provided' });
        }

        // If pending, a person must be selected
        const status = payment_status || 'paid';
        const bType = buyer_type || 'student';
        if (status === 'pending' && !student_id) {
            return res.status(400).json({ success: false, message: 'Please select a student or teacher for pending payments' });
        }

        // Generate bill number: BILL-SLUG-YYYYMMDD-SEQ
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const slugUpper = store.slug.toUpperCase().slice(0, 4);
        const [[seqRow]] = await db.query(
            "SELECT COUNT(*) as cnt FROM store_bills WHERE store_id = ? AND DATE(created_at) = CURDATE()",
            [store.id]
        );
        const seq = String((seqRow.cnt || 0) + 1).padStart(3, '0');
        const billNumber = `BILL-${slugUpper}-${dateStr}-${seq}`;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Get school details for bill
            const [schoolRows] = await connection.query('SELECT name, address, phone, logo FROM schools WHERE id = ?', [schoolId]);
            const schoolInfo = schoolRows[0] || {};

            // Logic for GST types
            const gstType = gst_type || 'none';
            const gstPct = parseFloat(gst_percentage) || 0;

            let subtotal = 0;
            let gstAmount = 0;
            let totalAmount = 0;

            // Calculate base subtotal from items
            const itemsSum = items.reduce((sum, i) => sum + (i.total_amount || i.quantity * i.unit_price), 0);

            if (gstType === 'inclusive') {
                // If inclusive, the itemsSum is the Total Amount. 
                // We back-calculate GST. Total = Base + GST. GST = Base * Pct. Total = Base * (1+Pct).
                // Base = Total / (1 + Pct/100).
                totalAmount = itemsSum;
                const baseAmount = totalAmount / (1 + (gstPct / 100));
                gstAmount = totalAmount - baseAmount;
                subtotal = baseAmount;
            } else if (gstType === 'exclusive') {
                // Exclusive: itemsSum is Subtotal. Add GST on top.
                subtotal = itemsSum;
                gstAmount = subtotal * (gstPct / 100);
                totalAmount = subtotal + gstAmount;
            } else {
                // None
                subtotal = itemsSum;
                gstAmount = 0;
                totalAmount = itemsSum;
            }

            // Rounding
            subtotal = parseFloat(subtotal.toFixed(2));
            gstAmount = parseFloat(gstAmount.toFixed(2));
            totalAmount = parseFloat(totalAmount.toFixed(2));

            // Insert into store_bills
            const [billResult] = await connection.query(
                `INSERT INTO store_bills 
                 (bill_number, store_id, school_id, student_id, student_name, buyer_type, class_name, items_json, subtotal, gst_percentage, gst_amount, total_amount, gst_type, payment_status, payment_method, notes, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [billNumber, store.id, schoolId, student_id || null, student_name || 'Walk-in Customer', bType, class_name || '', JSON.stringify(items), subtotal, gstPct, gstAmount, totalAmount, gstType, status, payment_method || 'cash', notes || '', req.user.id]
            );

            for (const item of items) {
                // Check stock
                const [stockCheck] = await connection.query(
                    'SELECT quantity FROM store_inventory WHERE id = ? AND school_id = ?',
                    [item.item_id, schoolId]
                );
                if (stockCheck.length === 0 || stockCheck[0].quantity < item.quantity) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${item.item_name}` });
                }

                // Insert transaction with bill info
                await connection.query(
                    `INSERT INTO store_transactions 
                     (store_id, school_id, student_id, student_name, buyer_type, class_name, item_id, item_name, quantity, unit_price, total_amount, transaction_type, payment_method, payment_status, bill_number, notes, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sale', ?, ?, ?, ?, ?)`,
                    [store.id, schoolId, student_id || null, student_name || 'Walk-in', bType, class_name || '', item.item_id, item.item_name, item.quantity, item.unit_price, item.total_amount, payment_method || 'cash', status, billNumber, notes || '', req.user.id]
                );

                // Deduct stock
                await connection.query(
                    'UPDATE store_inventory SET quantity = quantity - ? WHERE id = ? AND school_id = ?',
                    [item.quantity, item.item_id, schoolId]
                );
            }

            await connection.commit();
            connection.release();

            // Resolve school logo path from DB
            let logoPath = null;
            if (schoolInfo.logo) {
                const tryPaths = [
                    path.join(__dirname, '..', schoolInfo.logo),
                    path.join(__dirname, '..', 'upload', schoolInfo.logo),
                    path.join(__dirname, '..', 'upload', 'schools', path.basename(schoolInfo.logo))
                ];
                for (const p of tryPaths) {
                    if (fs.existsSync(p)) { logoPath = p; break; }
                }
            }

            // Build bill data
            const billData = {
                bill_number: billNumber,
                store_name: store.name,
                school_name: schoolInfo.name,
                school_address: schoolInfo.address,
                school_phone: schoolInfo.phone,
                logoPath,
                student_name: student_name || 'Walk-in Customer',
                buyer_type: bType,
                class_name: class_name || '',
                items,
                subtotal,
                gst_percentage: gstPct,
                gst_amount: gstAmount,
                total_amount: totalAmount,
                gst_type: gstType,
                payment_status: status,
                payment_method: payment_method || 'cash',
                date: today.toISOString()
            };

            // Generate and save PDF bill
            try {
                const uploadDir = path.join(__dirname, '..', 'upload', 'bills');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                const billFilePath = path.join(uploadDir, `${billNumber}.pdf`);
                // Store relative path (from backend root/upload) or absolute? 
                // Let's store absolute path for consistency with current code, or relative to be safer?
                // The current code uses absolute path in DB: 'bill_file_path'.

                await generateBillPdf(billData, billFilePath);
                // Update file path in DB
                await db.query('UPDATE store_bills SET bill_file_path = ? WHERE bill_number = ?', [billFilePath, billNumber]);
                console.log(`📄 Bill PDF saved: ${billFilePath}`);
            } catch (fileErr) {
                console.error('Bill PDF save error:', fileErr);
            }

            res.json({
                success: true,
                message: status === 'pending'
                    ? `Sale recorded — amount added to ${bType === 'teacher' ? 'teacher' : 'student'} pending!`
                    : 'Sale completed! 🎉',
                bill: { ...billData, logoPath: undefined }
            });

        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }

    } catch (error) {
        console.error('POS transaction error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/stores/:storeSlug/bills
// @desc    Get bill summaries for a store
router.get('/stores/:storeSlug/bills', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [storeRows] = await db.query(
            'SELECT id, name FROM stores WHERE slug = ? AND school_id = ?',
            [req.params.storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const { startDate, endDate } = req.query;
        let query = `
            SELECT id, bill_number, created_at as date, total_amount, student_name, class_name, 
                   payment_method, payment_status, 
                   JSON_LENGTH(items_json) as item_count
            FROM store_bills 
            WHERE store_id = ? AND school_id = ?
        `;
        const params = [storeRows[0].id, schoolId];

        if (startDate && endDate) {
            query += ' AND DATE(created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        query += ' ORDER BY created_at DESC LIMIT 500';

        const [bills] = await db.query(query, params);
        res.json({ success: true, store: storeRows[0], bills });
    } catch (error) {
        console.error('Fetch bills error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/bills/:billNumber
// @desc    Get a single bill by bill number
router.get('/bills/:billNumber', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [bills] = await db.query(
            `SELECT sb.*, s.name as store_name, s.slug as store_slug, s.icon as store_icon
             FROM store_bills sb
             JOIN stores s ON sb.store_id = s.id
             WHERE sb.bill_number = ? AND sb.school_id = ?`,
            [req.params.billNumber, schoolId]
        );
        if (bills.length === 0) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        const bill = bills[0];
        bill.items = JSON.parse(bill.items_json || '[]');
        res.json({ success: true, bill });
    } catch (error) {
        console.error('Fetch bill error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/bills/:billNumber/download
// @desc    Download bill PDF file
router.get('/bills/:billNumber/download', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [bills] = await db.query(
            'SELECT bill_file_path FROM store_bills WHERE bill_number = ? AND school_id = ?',
            [req.params.billNumber, schoolId]
        );
        if (bills.length === 0) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        const filePath = bills[0].bill_file_path;
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Bill PDF file not found on server' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.billNumber}.pdf"`);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (error) {
        console.error('Download bill error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/stores/:storeSlug/transactions
// @desc    Get transactions for a store
router.get('/stores/:storeSlug/transactions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [storeRows] = await db.query(
            'SELECT id, name FROM stores WHERE slug = ? AND school_id = ?',
            [req.params.storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const { startDate, endDate } = req.query;
        let query = 'SELECT * FROM store_transactions WHERE store_id = ? AND school_id = ?';
        const params = [storeRows[0].id, schoolId];

        if (startDate && endDate) {
            query += ' AND DATE(created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        query += ' ORDER BY created_at DESC LIMIT 500';

        const [transactions] = await db.query(query, params);
        res.json({ success: true, store: storeRows[0], transactions });
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// REPORTS
// ==========================================

// @route   GET /api/store/reports-overview
// @desc    Store-wise reports overview
router.get('/reports-overview', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { period } = req.query; // 'today', 'week', 'month', 'year'

        let dateFilter = '';
        if (period === 'today') dateFilter = 'AND DATE(st.created_at) = CURDATE()';
        else if (period === 'week') dateFilter = 'AND st.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        else if (period === 'month') dateFilter = 'AND MONTH(st.created_at) = MONTH(CURDATE()) AND YEAR(st.created_at) = YEAR(CURDATE())';
        else if (period === 'year') dateFilter = 'AND YEAR(st.created_at) = YEAR(CURDATE())';

        const [data] = await db.query(
            `SELECT s.id as store_id, s.name as store_name, s.slug, s.icon,
                    COUNT(st.id) as total_sales,
                    COALESCE(SUM(st.total_amount), 0) as total_revenue,
                    COALESCE(SUM(st.quantity), 0) as items_sold
             FROM stores s
             LEFT JOIN store_transactions st ON st.store_id = s.id AND st.school_id = ? AND st.transaction_type = 'sale' ${dateFilter}
             WHERE s.school_id = ? AND s.is_active = TRUE
             GROUP BY s.id
             ORDER BY total_revenue DESC`,
            [schoolId, schoolId]
        );
        res.json({ success: true, stores: data });
    } catch (error) {
        console.error('Reports overview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/store/stores/:storeSlug/reports
// @desc    Detailed reports for a specific store
router.get('/stores/:storeSlug/reports', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [storeRows] = await db.query(
            'SELECT id, name FROM stores WHERE slug = ? AND school_id = ?',
            [req.params.storeSlug, schoolId]
        );
        if (storeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        const storeId = storeRows[0].id;

        // Daily sales (last 30 days)
        const [dailySales] = await db.query(
            `SELECT DATE(created_at) as date, 
                    COUNT(*) as transactions, 
                    SUM(total_amount) as revenue,
                    SUM(quantity) as items_sold
             FROM store_transactions 
             WHERE store_id = ? AND school_id = ? AND transaction_type = 'sale'
             AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at) ORDER BY date DESC`,
            [storeId, schoolId]
        );

        // Top selling items
        const [topItems] = await db.query(
            `SELECT item_name, SUM(quantity) as total_qty, SUM(total_amount) as total_revenue
             FROM store_transactions 
             WHERE store_id = ? AND school_id = ? AND transaction_type = 'sale'
             GROUP BY item_name ORDER BY total_qty DESC LIMIT 10`,
            [storeId, schoolId]
        );

        // Category breakdown
        const [categoryData] = await db.query(
            `SELECT si.category, SUM(st.quantity) as qty_sold, SUM(st.total_amount) as revenue
             FROM store_transactions st
             JOIN store_inventory si ON st.item_id = si.id
             WHERE st.store_id = ? AND st.school_id = ? AND st.transaction_type = 'sale'
             GROUP BY si.category ORDER BY revenue DESC`,
            [storeId, schoolId]
        );

        res.json({ success: true, store: storeRows[0], dailySales, topItems, categoryData });
    } catch (error) {
        console.error('Store reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// GRIEVANCES
// ==========================================

// @route   GET /api/store/grievances
router.get('/grievances', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [grievances] = await db.query(
            `SELECT sg.*, s.name as store_name 
             FROM store_grievances sg 
             LEFT JOIN stores s ON sg.store_id = s.id
             WHERE sg.school_id = ? ORDER BY sg.created_at DESC`,
            [schoolId]
        );
        res.json({ success: true, grievances });
    } catch (error) {
        console.error('Fetch grievances error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/store/grievances
router.post('/grievances', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { store_id, subject, description, priority } = req.body;

        await db.query(
            `INSERT INTO store_grievances (school_id, store_id, subject, description, priority, submitted_by, submitted_by_name)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, store_id || null, subject, description, priority || 'medium', req.user.id, req.user.name]
        );
        res.json({ success: true, message: 'Grievance submitted' });
    } catch (error) {
        console.error('Submit grievance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/store/grievances/:id
router.put('/grievances/:id', async (req, res) => {
    try {
        const { status, resolution_notes } = req.body;
        await db.query(
            'UPDATE store_grievances SET status = ?, resolution_notes = ?, resolved_by = ? WHERE id = ? AND school_id = ?',
            [status, resolution_notes, req.user.id, req.params.id, req.user.school_id]
        );
        res.json({ success: true, message: 'Grievance updated' });
    } catch (error) {
        console.error('Update grievance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// REQUISITIONS
// ==========================================

// @route   GET /api/store/requisitions
router.get('/requisitions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const [requisitions] = await db.query(
            `SELECT sr.*, s.name as store_name 
             FROM store_requisitions sr 
             LEFT JOIN stores s ON sr.store_id = s.id
             WHERE sr.school_id = ? ORDER BY sr.created_at DESC`,
            [schoolId]
        );
        res.json({ success: true, requisitions });
    } catch (error) {
        console.error('Fetch requisitions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/store/requisitions
router.post('/requisitions', async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { store_id, item_name, quantity, description, urgency } = req.body;

        await db.query(
            `INSERT INTO store_requisitions (school_id, store_id, item_name, quantity, description, urgency, submitted_by, submitted_by_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, store_id || null, item_name, quantity || 1, description, urgency || 'medium', req.user.id, req.user.name]
        );
        res.json({ success: true, message: 'Requisition submitted' });
    } catch (error) {
        console.error('Submit requisition error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
