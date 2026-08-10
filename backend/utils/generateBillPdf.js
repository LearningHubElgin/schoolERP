const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a professional PDF bill and save it to disk.
 * @param {Object} bill - Bill data object
 * @param {string} savePath - Full path where the PDF will be saved
 * @returns {Promise<string>} - Path to the saved PDF
 */
function generateBillPdf(bill, savePath) {
    return new Promise((resolve, reject) => {
        try {
            const dir = path.dirname(savePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            // 80mm width ~ 226 points. 
            const doc = new PDFDocument({ size: [226, 800], margin: 10, autoFirstPage: true });
            // Note: Height 800 is arbitrary, pdfkit adds pages if needed, but for receipts we want long single page usually.
            // But paginated is fine. 

            const stream = fs.createWriteStream(savePath);
            doc.pipe(stream);

            // Use Segoe UI for Rupee symbol support
            // Fallback to Helvetica if not found (though on Windows server it should be there)
            let regularFont = 'Helvetica';
            let boldFont = 'Helvetica-Bold';

            if (process.platform === 'win32') {
                const fontPath = 'C:\\Windows\\Fonts\\segoeui.ttf';
                const fontPathBold = 'C:\\Windows\\Fonts\\segoeuib.ttf';
                if (fs.existsSync(fontPath)) regularFont = fontPath;
                if (fs.existsSync(fontPathBold)) boldFont = fontPathBold;
            }

            const pageWidth = 226 - 20; // 206
            const margin = 10;
            const centerX = margin + pageWidth / 2;

            // Helper for centered text
            const centerText = (txt, size = 8, isBold = false) => {
                doc.font(isBold ? boldFont : regularFont).fontSize(size);
                doc.text(txt, margin, doc.y, { width: pageWidth, align: 'center' });
            };

            // Helper for key-value row
            const infoRow = (label, value) => {
                const y = doc.y;
                doc.font(regularFont).fontSize(8);
                doc.text(label, margin, y, { width: pageWidth * 0.4, lineBreak: false });
                doc.text(value, margin, y, { width: pageWidth, align: 'right' });
            };

            // Helper for dashed line
            const drawLine = () => {
                doc.moveDown(0.2);
                doc.save()
                    .lineWidth(0.5)
                    .dash(3, { space: 2 })
                    .moveTo(margin, doc.y)
                    .lineTo(margin + pageWidth, doc.y)
                    .stroke()
                    .restore();
                doc.moveDown(0.2);
            };

            // ── SCHOOL LOGO ──
            if (bill.logoPath && fs.existsSync(bill.logoPath)) {
                try {
                    const logoSize = 40;
                    doc.image(bill.logoPath, centerX - (logoSize / 2), doc.y, { width: logoSize, height: logoSize });
                    doc.moveDown(0.5);
                    // image doesn't auto-advance text cursor in same way text does, need explicit move or check doc.y
                    doc.y += logoSize + 5;
                } catch (e) {
                    console.error('Logo error:', e);
                }
            }

            // ── HEADER ──
            centerText(bill.school_name || 'School Store', 10, true);
            if (bill.school_address) centerText(bill.school_address, 7);
            if (bill.school_phone) centerText(`Ph: ${bill.school_phone}`, 7);

            doc.moveDown(0.2);
            centerText(`${bill.store_name || 'Store'} Receipt`, 9, true);

            drawLine();

            // ── BILL INFO ──
            infoRow('Bill No:', bill.bill_number);
            infoRow('Date:', new Date(bill.date).toLocaleDateString('en-IN') + ' ' + new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
            infoRow('Customer:', (bill.student_name || 'Walk-in').substring(0, 25)); // Truncate
            infoRow('Type:', (bill.buyer_type || 'student').toUpperCase());
            if (bill.class_name) infoRow('Class:', bill.class_name);

            drawLine();

            // ── ITEMS HEADER ──
            const yHead = doc.y;
            doc.font(boldFont).fontSize(7);

            // Columns: Item (45%), Qty (15%), Rate (20%), Amt (20%)
            const wItem = pageWidth * 0.45;
            const wQty = pageWidth * 0.15;
            const wRate = pageWidth * 0.20;
            const wAmt = pageWidth * 0.20;

            const xItem = margin;
            const xQty = xItem + wItem;
            const xRate = xQty + wQty;
            const xAmt = xRate + wRate;

            doc.text('Item', xItem, yHead, { width: wItem });
            doc.text('Qty', xQty, yHead, { width: wQty, align: 'center' });
            doc.text('Rate', xRate, yHead, { width: wRate, align: 'right' });
            doc.text('Amt', xAmt, yHead, { width: wAmt, align: 'right' });

            doc.moveDown(0.2);
            doc.lineWidth(0.5).moveTo(margin, doc.y).lineTo(margin + pageWidth, doc.y).stroke();
            doc.moveDown(0.2);

            // ── ITEMS LIST ──
            doc.font(regularFont).fontSize(7);
            (bill.items || []).forEach(item => {
                const y = doc.y;
                const amt = item.total_amount || (item.quantity * item.unit_price);

                doc.text(item.item_name, xItem, y, { width: wItem });

                // If item name wraps, we need to handle y-advancement carefully
                // Store the Y after printing Item name
                const yAfterItem = doc.y;

                // Print other columns at original Y
                doc.text(item.quantity, xQty, y, { width: wQty, align: 'center' });
                doc.text('\u20B9' + parseFloat(item.unit_price).toLocaleString('en-IN'), xRate, y, { width: wRate, align: 'right' });
                doc.text('\u20B9' + parseFloat(amt).toLocaleString('en-IN'), xAmt, y, { width: wAmt, align: 'right' });

                // Set doc.y to the max height used by this row
                doc.y = Math.max(yAfterItem, doc.y);
                doc.moveDown(0.2);
            });

            drawLine();

            // ── TOTALS ──
            infoRow('Subtotal:', `\u20B9${parseFloat(bill.subtotal).toLocaleString('en-IN')}`);

            if (bill.gst_type && bill.gst_type !== 'none' && bill.gst_percentage > 0) {
                const label = bill.gst_type === 'inclusive' ? 'Inc.' : 'Exc.';
                infoRow(`GST ${bill.gst_percentage}% (${label})`, `\u20B9${parseFloat(bill.gst_amount).toLocaleString('en-IN')}`);
            }

            doc.moveDown(0.2);
            doc.lineWidth(1).moveTo(margin, doc.y).lineTo(margin + pageWidth, doc.y).stroke();
            doc.moveDown(0.2);

            doc.font(boldFont).fontSize(10);
            infoRow('TOTAL:', `\u20B9${parseFloat(bill.total_amount).toLocaleString('en-IN')}`);

            doc.moveDown(0.5);
            doc.font(regularFont).fontSize(7);
            infoRow('Payment:', (bill.payment_method || 'cash').toUpperCase());
            infoRow('Status:', bill.payment_status === 'paid' ? 'PAID' : 'PENDING');

            // ── FOOTER ──
            drawLine();
            centerText('Thank you for your purchase!', 7, false);
            centerText('Computer Generated Receipt', 6, false);

            doc.end();

            stream.on('finish', () => resolve(savePath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = generateBillPdf;
