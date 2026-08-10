const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const LOGO_PATH = path.join(__dirname, '../../src/assets/school_logo.jpeg');

const COLORS = {
    primary: '#047857', // Emerald 700
    primaryLight: '#ecfdf5', // Emerald 50
    textMain: '#1f2937', // Gray 800
    textMuted: '#6b7280', // Gray 500
    border: '#e5e7eb', // Gray 200
    accent: '#10b981' // Emerald 500
};

const generateApplicationPDF = (application, res) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    doc.pipe(res);

    // ================= HELPER FUNCTIONS =================

    const drawSectionHeader = (text, y) => {
        doc.rect(40, y, 515, 18)
            .fill(COLORS.primary);

        doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(text.toUpperCase(), 50, y + 5);

        return y + 25;
    };

    const drawField = (label, value, x, y, width = 200) => {
        doc.fillColor(COLORS.textMuted)
            .font('Helvetica')
            .fontSize(7.5)
            .text(label, x, y);

        doc.fillColor(COLORS.textMain)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(value || 'N/A', x, y + 10, { width: width, ellipsis: true });
    };

    const checkPageBreak = (currentY, neededSpace = 30) => {
        if (currentY + neededSpace > 790) {
            doc.addPage();
            // Draw page border on new page
            doc.rect(20, 20, 555, 802).stroke(COLORS.border);
            return 40;
        }
        return currentY;
    };

    // ================= LAYOUT START =================

    // Draw main page border
    doc.rect(20, 20, 555, 802).lineWidth(0.5).stroke(COLORS.border);

    // 1. HEADER
    const schoolName = application.school_name || 'School ERP System';
    const schoolAddress = application.school_address || '';
    const schoolCity = application.school_city || '';
    const schoolPincode = application.school_pincode || '';
    const fullAddress = `${schoolAddress}${schoolCity ? ', ' + schoolCity : ''}${schoolPincode ? '-' + schoolPincode : ''}`;

    let currentLogoPath = LOGO_PATH;
    if (application.school_logo) {
        const dbLogoPath = path.join(__dirname, '..', application.school_logo);
        if (fs.existsSync(dbLogoPath)) {
            currentLogoPath = dbLogoPath;
        }
    }

    if (fs.existsSync(currentLogoPath)) {
        doc.image(currentLogoPath, 45, 35, { width: 45 });
        doc.fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(20)
            .text(schoolName, 100, 40);
    } else {
        doc.fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(20)
            .text(schoolName, { align: 'center' });
    }

    // School Info next to logo or centered
    const infoX = fs.existsSync(currentLogoPath) ? 100 : 40;
    const infoWidth = fs.existsSync(currentLogoPath) ? 450 : 515;

    doc.fillColor(COLORS.textMuted)
        .font('Helvetica')
        .fontSize(8)
        .text(fullAddress, infoX, doc.y + 2, { width: infoWidth });

    if (application.school_phone || application.school_email) {
        let contactText = '';
        if (application.school_phone) contactText += `Phone: ${application.school_phone}`;
        if (application.school_email) contactText += `${contactText ? ' | ' : ''}Email: ${application.school_email}`;
        doc.text(contactText, infoX, doc.y + 1);
    }

    // Decorative line
    doc.moveTo(40, 95).lineTo(555, 95).lineWidth(1.5).stroke(COLORS.primary);

    doc.moveDown(0.8);

    // Form Title
    const titleY = 105;
    doc.rect(170, titleY, 255, 20).fill(COLORS.primaryLight);
    doc.rect(170, titleY, 255, 20).stroke(COLORS.primary);
    doc.fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('ADMISSION APPLICATION FORM', 170, titleY + 5, { align: 'center', width: 255 });

    let currentY = 135;

    // Application Info Bar (Premium Box)
    doc.rect(40, currentY, 515, 32).fill(COLORS.primaryLight);
    doc.rect(40, currentY, 515, 32).stroke(COLORS.border);
    drawField('Application No:', application.application_no, 55, currentY + 8);
    drawField('Application Date:', new Date(application.applied_date).toLocaleDateString('en-GB'), 300, currentY + 8);

    currentY += 45;

    // 2. STUDENT INFORMATION
    currentY = drawSectionHeader('Student Details', currentY);

    drawField('Full Name:', application.student_name, 50, currentY, 250);
    drawField('Date of Birth:', new Date(application.date_of_birth).toLocaleDateString('en-GB'), 320, currentY, 200);
    currentY += 30;

    drawField('Class Applying For:', `Class ${application.class}`, 50, currentY, 150);
    drawField('Blood Group:', application.blood_group, 220, currentY, 150);
    drawField('Gender:', application.gender, 390, currentY, 150);
    currentY += 38;

    // 3. PARENT DETAILS
    currentY = drawSectionHeader('Parent / Guardian Details', currentY);

    drawField("Father's Name:", application.father_name, 50, currentY, 250);
    drawField("Mother's Name:", application.mother_name, 320, currentY, 250);
    currentY += 30;

    drawField("Primary Contact:", application.parent_phone, 50, currentY, 200);
    drawField("Alternative Phone:", application.phone, 320, currentY, 200);
    currentY += 38;

    // 4. CONTACT DETAILS
    currentY = drawSectionHeader('Contact & Residential Details', currentY);

    drawField('Email Address:', application.email, 50, currentY, 250);
    drawField('Correspondence Address:', application.address, 50, currentY + 30, 465);
    currentY += 70;

    // 5. ACADEMIC HISTORY (If exists)
    if (application.previous_school || application.previous_class) {
        currentY = checkPageBreak(currentY, 60);
        currentY = drawSectionHeader('Academic Background', currentY);

        drawField('Last School Attended:', application.previous_school, 50, currentY, 350);
        drawField('Last Class:', application.previous_class, 420, currentY, 100);
        currentY += 38;
    }

    // 6. MEDICAL INFO
    if (application.medical_conditions) {
        currentY = checkPageBreak(currentY, 50);
        currentY = drawSectionHeader('Medical Information', currentY);

        doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(7.5).text('Medical Conditions / Allergies:', 50, currentY);
        doc.fillColor(COLORS.textMain).font('Helvetica-Bold').fontSize(8).text(application.medical_conditions, 50, currentY + 10, { width: 495 });
        currentY += 38;
    }

    // 7. DECLARATION
    currentY = checkPageBreak(currentY, 90);
    doc.rect(40, currentY, 515, 90).stroke(COLORS.border);

    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(9)
        .text('DECLARATION', 50, currentY + 8);

    doc.fillColor(COLORS.textMain).font('Helvetica').fontSize(7.5).lineGap(1)
        .text('I hereby declare that the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to the cancellation of the admission process. I agree to abide by the rules and regulations of the institution.', 50, currentY + 22, { width: 495 });

    // Signature lines
    const sigY = currentY + 70;
    doc.lineWidth(0.5).strokeColor(COLORS.textMuted);
    doc.moveTo(60, sigY).lineTo(200, sigY).stroke();
    doc.fillColor(COLORS.textMuted).text("Parent's Signature", 60, sigY + 4, { align: 'center', width: 140 });

    doc.moveTo(350, sigY).lineTo(490, sigY).stroke();
    doc.text("Student's Signature", 350, sigY + 4, { align: 'center', width: 140 });

    doc.end();
};

const generatePaymentReceiptPDF = (application, paymentData, res) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.pipe(res);

    // ================= HELPER FUNCTIONS =================
    const drawSectionHeader = (text, y) => {
        doc.rect(40, y, 515, 22).fill(COLORS.primary);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text(text.toUpperCase(), 50, y + 6);
        return y + 32;
    };

    const drawField = (label, value, x, y, width = 200) => {
        doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(8).text(label, x, y);
        doc.fillColor(COLORS.textMain).font('Helvetica-Bold').fontSize(10).text(value || 'N/A', x, y + 12, { width: width, ellipsis: true });
    };

    // ================= LAYOUT START =================

    // Draw main page border
    doc.rect(20, 20, 555, 802).lineWidth(1).stroke(COLORS.border);

    // 1. HEADER
    const schoolName = application.school_name || 'School ERP System';
    const schoolAddress = application.school_address || '';
    const schoolCity = application.school_city || '';
    const schoolPincode = application.school_pincode || '';
    const fullAddress = `${schoolAddress}${schoolCity ? ', ' + schoolCity : ''}${schoolPincode ? '-' + schoolPincode : ''}`;

    let currentLogoPath = LOGO_PATH;
    if (application.school_logo) {
        const dbLogoPath = path.join(__dirname, '..', application.school_logo);
        if (fs.existsSync(dbLogoPath)) {
            currentLogoPath = dbLogoPath;
        }
    }

    if (fs.existsSync(currentLogoPath)) {
        doc.image(currentLogoPath, 45, 45, { width: 50 });
        doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(22).text(schoolName, 105, 50);
    } else {
        doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(24).text(schoolName, { align: 'center' });
    }

    doc.moveDown(0.2);
    const infoX = fs.existsSync(currentLogoPath) ? 105 : 40;
    doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(9).text(fullAddress, infoX, doc.y, { width: 450 });

    // Decorative line
    doc.moveTo(40, 110).lineTo(555, 110).lineWidth(2).stroke(COLORS.primary);

    doc.moveDown(1.5);

    // Title
    const titleY = 125;
    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(16).text('PAYMENT RECEIPT', 40, titleY, { align: 'center', width: 515 });

    let currentY = 160;

    // Receipt Info Bar
    doc.rect(40, currentY, 515, 40).fill(COLORS.primaryLight).stroke(COLORS.border);
    drawField('Receipt No:', `RCP-${application.application_no}`, 55, currentY + 10);
    drawField('Payment Date:', new Date().toLocaleDateString('en-GB'), 300, currentY + 10);

    currentY += 60;

    // 2. STUDENT INFORMATION
    currentY = drawSectionHeader('Student & Enrollment Details', currentY);

    drawField('Student Name:', application.student_name, 50, currentY, 200);
    drawField('Application No:', application.application_no, 320, currentY, 200);
    currentY += 35;

    drawField('Class:', `Class ${application.class}`, 50, currentY, 200);
    drawField('Section:', application.section || 'N/A', 320, currentY, 200);
    currentY += 35;

    drawField("Father's Name:", application.father_name, 50, currentY, 200);
    drawField('Contact Phone:', application.phone, 320, currentY, 200);
    currentY += 50;

    // 3. PAYMENT BREAKDOWN
    currentY = drawSectionHeader('Fee Payment Breakdown', currentY);

    // Table Header
    doc.rect(40, currentY, 515, 25).fill(COLORS.primaryLight).stroke(COLORS.border);
    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(9);
    doc.text('Description', 55, currentY + 8);
    doc.text('Total (Rs.)', 240, currentY + 8, { align: 'right', width: 80 });
    doc.text('Paid (Rs.)', 340, currentY + 8, { align: 'right', width: 80 });
    doc.text('Pending (Rs.)', 440, currentY + 8, { align: 'right', width: 80 });
    currentY += 25;

    // Fee Rows
    if (paymentData.fees && paymentData.fees.length > 0) {
        paymentData.fees.forEach(fee => {
            doc.rect(40, currentY, 515, 25).stroke(COLORS.border);
            doc.fillColor(COLORS.textMain).font('Helvetica').fontSize(9);
            doc.text(fee.type, 55, currentY + 8);
            doc.font('Helvetica-Bold').text(Number(fee.amount).toLocaleString(), 240, currentY + 8, { align: 'right', width: 80 });
            doc.fillColor(COLORS.primary).text(Number(fee.paid).toLocaleString(), 340, currentY + 8, { align: 'right', width: 80 });
            doc.fillColor('#ef4444').text(Number(fee.pending).toLocaleString(), 440, currentY + 8, { align: 'right', width: 80 });
            currentY += 25;
        });
    }

    // Total Summary Row
    doc.rect(40, currentY, 515, 30).fill(COLORS.primaryLight).stroke(COLORS.primary);
    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(10);
    doc.text('GRAND TOTAL', 55, currentY + 10);
    doc.text(Number(paymentData.total_amount).toLocaleString(), 240, currentY + 10, { align: 'right', width: 80 });
    doc.text(Number(paymentData.paid_amount).toLocaleString(), 340, currentY + 10, { align: 'right', width: 80 });
    doc.text(Number(paymentData.pending_amount).toLocaleString(), 440, currentY + 10, { align: 'right', width: 80 });

    currentY += 50;

    // Payment Method Details
    drawField('Payment Mode:', paymentData.payment_method === 'online' ? 'Online Gateway' : 'Offline (Cash/Cheque)', 50, currentY);
    if (paymentData.transaction_id) {
        drawField('Transaction ID:', paymentData.transaction_id, 320, currentY);
    }
    currentY += 40;

    // Status Badge
    const statusColor = paymentData.status === 'paid' ? COLORS.primary : '#f59e0b';
    const statusText = paymentData.status === 'paid' ? 'SUCCESSFULLY PAID' : 'PARTIAL PAYMENT / PENDING';

    doc.rect(170, currentY, 220, 35).fill(statusColor);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12)
        .text(statusText, 170, currentY + 12, { align: 'center', width: 220 });

    currentY += 60;

    // Note
    doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(8)
        .text('Note: This is an electronically generated document. No physical signature is required.', 40, currentY, { align: 'center', width: 515 });

    doc.end();
};


const generateReportPDF = (students, filters, res) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    doc.pipe(res);

    // ================= HELPER FUNCTIONS =================
    const drawTable = (data, startY) => {
        const headers = ['App No', 'Student Name', 'Class', 'Stream/Group', 'Father Name', 'Phone', 'Status', 'Date'];
        const colWidths = [80, 150, 60, 100, 150, 100, 80, 80];
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        let y = startY;

        // Draw Header
        doc.rect(40, y, tableWidth, 25).fill(COLORS.primary);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);

        let x = 45;
        headers.forEach((header, i) => {
            doc.text(header.toUpperCase(), x, y + 8);
            x += colWidths[i];
        });

        y += 25;

        // Draw Rows
        doc.font('Helvetica').fontSize(9);
        data.forEach((student, index) => {
            if (y > 520) { // Check page break for landscape
                doc.addPage({ layout: 'landscape' });
                doc.rect(20, 20, 802, 555).stroke(COLORS.border);
                y = 40;
                // Redraw header
                doc.rect(40, y, tableWidth, 25).fill(COLORS.primary);
                doc.fillColor('#ffffff').font('Helvetica-Bold');
                let hx = 45;
                headers.forEach((header, i) => {
                    doc.text(header.toUpperCase(), hx, y + 8);
                    hx += colWidths[i];
                });
                y += 25;
                doc.font('Helvetica');
            }

            // Alternating row background
            if (index % 2 === 0) {
                doc.rect(40, y, tableWidth, 20).fill(COLORS.primaryLight);
            } else {
                doc.rect(40, y, tableWidth, 20).stroke(COLORS.border);
            }

            doc.fillColor(COLORS.textMain);
            let dx = 45;
            const rowData = [
                student.application_no,
                student.student_name,
                student.class,
                student.stream_name || '--',
                student.father_name,
                student.phone,
                student.status.charAt(0).toUpperCase() + student.status.slice(1),
                new Date(student.applied_date).toLocaleDateString('en-GB')
            ];

            rowData.forEach((text, i) => {
                doc.text(text || '--', dx, y + 5, { width: colWidths[i] - 10, ellipsis: true });
                dx += colWidths[i];
            });

            y += 20;
        });
    };

    // ================= LAYOUT START =================

    // Draw main page border (landscape)
    doc.rect(20, 20, 802, 555).lineWidth(1).stroke(COLORS.border);

    // HEADER
    const schoolName = (students.length > 0 && students[0].school_name) ? students[0].school_name : 'School ERP System';
    
    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(22).text(schoolName, { align: 'center' });
    doc.fillColor(COLORS.textMuted).fontSize(14).text('ADMISSION APPLICATIONS REPORT', { align: 'center' });
    doc.moveDown(0.5);

    // Filters Info
    const filterText = `Status: ${filters.status || 'All'} | Class: ${filters.class || 'All'} | Period: ${filters.startDate ? new Date(filters.startDate).toLocaleDateString('en-GB') : 'Initial'} to ${filters.endDate ? new Date(filters.endDate).toLocaleDateString('en-GB') : 'Present'}`;
    doc.fontSize(9).fillColor(COLORS.textMuted).text(filterText, { align: 'center' });

    doc.moveDown(1);

    // Report Table
    if (students.length > 0) {
        drawTable(students, doc.y);
    } else {
        doc.moveDown(3);
        doc.fontSize(12).fillColor(COLORS.textMuted).text('No matching application records found for the selected criteria.', { align: 'center' });
    }

    doc.end();
};

module.exports = { generateApplicationPDF, generatePaymentReceiptPDF, generateReportPDF };