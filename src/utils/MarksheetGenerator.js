import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a Marksheet PDF based on the provided configuration and data.
 * @param {Object} config - The marksheet template configuration.
 * @param {Object} data - The data for the marksheet.
 * @param {Object} data.school - School information (name, address, etc.)
 * @param {Object} data.term - Term information (name, year)
 * @param {Object} data.student - Student information (name, roll, class, etc.)
 * @param {Array} data.subjects - Array of subject objects with marks.
 * @param {string} schoolLogoBase64 - Base64 encoded school logo.
 * @returns {jsPDF} The generated jsPDF instance.
 */
export const generateMarksheetPDF = (config, data, schoolLogoBase64) => {
    const c = config;
    const designType = c.designType || 'classic';
    const pdf = new jsPDF({
        orientation: c.page?.orientation || 'portrait',
        unit: 'mm',
        format: c.page?.size || 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ml = c.page?.marginLeft || 20;
    const mr = c.page?.marginRight || 20;
    const mt = c.page?.marginTop || 15;
    const mb = c.page?.marginBottom || 15;
    const contentWidth = pageWidth - ml - mr;
    let y = mt;

    const hexToRgb = (hex) => {
        try { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
        catch { return [0, 0, 0]; }
    };

    const primaryRgb = hexToRgb(c.styling?.primaryColor || '#4f46e5');
    const tblHdrBg = hexToRgb(c.styling?.tableHeaderBg || '#4f46e5');
    const tblHdrTxt = hexToRgb(c.styling?.tableHeaderText || '#FFFFFF');
    const evenRgb = hexToRgb(c.styling?.evenRowBg || '#f8fafc');
    const oddRgb = hexToRgb(c.styling?.oddRowBg || '#FFFFFF');
    const borderRgb = hexToRgb(c.styling?.borderColor || '#e2e8f0');

    // Helper: add logo
    const addLogo = (lx, ly, lw, lh) => {
        if (c.header.showLogo && schoolLogoBase64) {
            try { pdf.addImage(schoolLogoBase64, 'PNG', lx, ly, lw, lh); } catch (e) { }
        }
    };

    // Helper: draw border
    const drawPageBorder = () => {
        if (designType === 'bordered_formal') {
            pdf.setDrawColor(...primaryRgb); pdf.setLineWidth(1.5);
            pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
            pdf.setLineWidth(0.5);
            pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
        }
    };

    // Prepare Student Fields
    const builtInFields = Object.entries(c.studentFields)
        .filter(([_, v]) => v.enabled)
        .map(([k, v]) => ({ label: v.label, value: data.student[k] || '-' }));

    const customFields = (c.customStudentFields || [])
        .filter(f => f.enabled)
        .map(f => ({ label: f.label, value: data.student.custom_fields?.[f.key] || data.student[f.key] || '-' }));

    const allFields = [...builtInFields, ...customFields];

    // Prepare Columns
    const builtInCols = Object.entries(c.marksColumns)
        .filter(([_, v]) => v.enabled)
        .map(([k, v]) => ({ key: k, label: v.label, order: v.order || 99, group: v.group }));

    const customCols = (c.customColumns || [])
        .filter(col => col.enabled)
        .map(col => ({ key: col.key, label: col.label, isCustom: true, order: col.order || 99, group: col.group }));

    const allCols = [...builtInCols, ...customCols].sort((a, b) => a.order - b.order);

    const getVal = (sub, col) => {
        const key = col.key;

        // 1. Calculated Fields
        if (key === 'percentage') {
            const marks = parseFloat(sub.marks_obtained);
            const total = parseFloat(sub.total_marks);
            return total > 0 ? `${((marks / total) * 100).toFixed(1)}%` : '-';
        }
        if (key === 'remarks') {
            const passingPct = c.summary?.passingPercentage || 33;
            const marks = parseFloat(sub.marks_obtained) || 0;
            const total = parseFloat(sub.total_marks) || 100;
            return marks >= (total * passingPct / 100) ? 'Pass' : 'Fail';
        }

        // 1. Dynamic Subject Lookup (Label-based)
        if (col.label?.toLowerCase() === 'subject') {
            const subj = sub.subject_name || sub.subject || sub.name || sub.subject_code;
            if (subj) return String(subj);
        }

        // 2. Pure Dynamic Lookup
        let val = sub[key];

        // 3. Intelligent Discovery (If direct key fails)
        if (val === undefined || val === null || val === '') {
            // Try matching by Label (e.g., "Subject Name" -> "subject_name")
            const normalizedLabel = col.label?.toLowerCase().trim().replace(/\s+/g, '_');
            const searchCandidates = [normalizedLabel, normalizedLabel?.replace(/_marks$/, ''), key.replace(/_marks$/, '')];
            
            for (const candidate of searchCandidates) {
                if (candidate && sub[candidate] !== undefined && sub[candidate] !== null && sub[candidate] !== '') {
                    val = sub[candidate];
                    break;
                }
            }
        }

        // 4. Case-Insensitive Key Search (Last Resort)
        if (val === undefined || val === null || val === '') {
            const lowerKey = key.toLowerCase();
            const dataKey = Object.keys(sub).find(k => k.toLowerCase() === lowerKey || k.toLowerCase().includes(lowerKey));
            if (dataKey) val = sub[dataKey];
        }

        return (val !== undefined && val !== null && val !== '') ? String(val) : '-';

    };

    let totalObtained = 0, totalMax = 0;
    data.subjects.forEach(s => {
        let sObtained = parseFloat(s.marks_obtained);
        if (isNaN(sObtained)) {
            let customSum = 0; let customFound = false;
            Object.entries(s).forEach(([k, v]) => {
                if (k.startsWith('custom_') && !isNaN(parseFloat(v))) {
                    const num = parseFloat(v);
                    if (k.toLowerCase().includes('total')) {
                        sObtained = num;
                    } else {
                        customSum += num;
                        customFound = true;
                    }
                }
            });
            if (isNaN(sObtained) && customFound) {
                sObtained = customSum;
            }
        }
        totalObtained += !isNaN(sObtained) ? sObtained : 0;

        let sMax = parseFloat(s.total_marks);
        if (isNaN(sMax) || sMax <= 0) sMax = 100;
        totalMax += sMax;
    });

    // ── HEADER RENDERING ──
    if (designType === 'classic' || designType === 'bordered_formal') {
        const startX = designType === 'bordered_formal' ? ml + 3 : ml;
        if (designType === 'bordered_formal') y += 5;
        const logoSize = 22;
        let textX = pageWidth / 2;
        let textAlign = 'center';
        if (c.header.showLogo && schoolLogoBase64) {
            addLogo(startX, y, logoSize, logoSize);
            textX = startX + logoSize + 5;
            textAlign = 'left';
        }
        pdf.setFontSize(c.header.schoolNameFontSize); pdf.setTextColor(...primaryRgb);
        pdf.text(data.school.name, textX, y + 8, { align: textAlign });
        y += 14;
        if (c.header.showAddress) {
            pdf.setFontSize(10); pdf.setTextColor(100, 100, 100);
            pdf.text(data.school.address || '', textX, y, { align: textAlign });
            y += 5;
        }
        y = Math.max(y, y + (logoSize - 15)); y += 2;
        pdf.setFontSize(c.header.titleFontSize); pdf.setTextColor(0, 0, 0);
        pdf.text(c.header.title, pageWidth / 2, y, { align: 'center' }); y += 8;
        if (c.header.showTermInfo) {
            pdf.setFontSize(11); pdf.setTextColor(80, 80, 80);
            pdf.text(`${data.term.term_name} ${data.term.academic_year || ''}`, pageWidth / 2, y, { align: 'center' });
            y += 4;
        }
        pdf.setDrawColor(...primaryRgb); pdf.setLineWidth(0.5); pdf.line(ml, y + 2, pageWidth - mr, y + 2); y += 8;
    }
    else if (designType === 'academic_record') {
        pdf.setFillColor(...primaryRgb); pdf.rect(ml, y, contentWidth, 30, 'F');
        if (c.header.showLogo && schoolLogoBase64) { addLogo(ml + 4, y + 3, 24, 24); }
        const textStartX = c.header.showLogo && schoolLogoBase64 ? ml + 32 : ml + 5;
        pdf.setFontSize(c.header.schoolNameFontSize); pdf.setTextColor(255, 255, 255);
        pdf.text(data.school.name, textStartX, y + 12);
        if (c.header.showAddress) { pdf.setFontSize(9); pdf.text(data.school.address || '', textStartX, y + 18); }
        y += 34;
        pdf.setFillColor(245, 245, 245); pdf.rect(ml, y, contentWidth, 12, 'F');
        pdf.setDrawColor(...primaryRgb); pdf.rect(ml, y, contentWidth, 12, 'S');
        pdf.setFontSize(c.header.titleFontSize); pdf.setTextColor(...primaryRgb);
        pdf.text(c.header.title, pageWidth / 2, y + 8, { align: 'center' }); y += 18;
        if (c.header.showTermInfo) {
            pdf.setFontSize(10); pdf.setTextColor(80, 80, 80);
            pdf.text(`Academic Session: ${data.term.academic_year || ''}`, pageWidth / 2, y, { align: 'center' });
            y += 6;
        }
        pdf.setDrawColor(...primaryRgb); pdf.setLineWidth(0.3); pdf.line(ml, y + 2, pageWidth - mr, y + 2); y += 8;
    }
    else if (designType === 'modern_branded') {
        const bannerH = 24;
        pdf.setFillColor(...primaryRgb); pdf.rect(0, 0, pageWidth, bannerH, 'F');
        const lighterRgb = primaryRgb.map(v => Math.min(255, v + 40));
        pdf.setFillColor(...lighterRgb); pdf.rect(0, bannerH - 3, pageWidth, 3, 'F');
        if (c.header.showLogo && schoolLogoBase64) { addLogo(ml + 2, 3, 18, 18); }
        pdf.setFontSize(c.header.schoolNameFontSize || 16); pdf.setTextColor(255, 255, 255);
        pdf.text(data.school.name, pageWidth / 2, bannerH / 2 + 2, { align: 'center' });
        y = bannerH + 8;
        if (c.header.showAddress) { pdf.setFontSize(9); pdf.setTextColor(100, 100, 100); pdf.text(data.school.address || '', pageWidth / 2, y, { align: 'center' }); y += 5; }
        pdf.setFontSize(c.header.titleFontSize); pdf.setTextColor(...primaryRgb); pdf.setFont(c.styling.fontFamily || 'helvetica', 'bold');
        pdf.text(c.header.title, pageWidth / 2, y, { align: 'center' }); pdf.setFont(c.styling.fontFamily || 'helvetica', 'normal'); y += 6;
        if (c.header.showTermInfo) { pdf.setFontSize(10); pdf.setTextColor(120, 120, 120); pdf.text(`${data.term.term_name} | ${data.term.academic_year || ''}`, pageWidth / 2, y, { align: 'center' }); y += 5; }
        pdf.setDrawColor(220, 220, 220); pdf.setLineWidth(0.3); pdf.line(ml, y, pageWidth - mr, y); y += 6;
    }
    else if (designType === 'institutional') {
        const logoW = 22;
        if (c.header.showLogo && schoolLogoBase64) { addLogo(ml, y, logoW, logoW); }
        const tx = c.header.showLogo && schoolLogoBase64 ? ml + logoW + 5 : ml;
        pdf.setFontSize(c.header.schoolNameFontSize); pdf.setTextColor(...primaryRgb);
        pdf.text(data.school.name, tx, y + 8);
        if (c.header.showAddress) { pdf.setFontSize(9); pdf.setTextColor(80, 80, 80); pdf.text(`(${data.school.address || ''})`, tx, y + 14); }
        y += Math.max(logoW, 20) + 4;
        pdf.setDrawColor(...primaryRgb); pdf.setLineWidth(0.8); pdf.line(ml, y, pageWidth - mr, y); y += 3;
        pdf.setLineWidth(0.3); pdf.line(ml, y, pageWidth - mr, y); y += 5;
        pdf.setFontSize(c.header.titleFontSize); pdf.setTextColor(0, 0, 0);
        pdf.text(c.header.title, pageWidth / 2, y, { align: 'center' }); y += 9;
        if (c.header.showTermInfo) { pdf.setFontSize(10); pdf.setTextColor(80, 80, 80); pdf.text(`Exam Session: ${data.term.term_name}, ${data.term.academic_year || ''}`, pageWidth / 2, y, { align: 'center' }); y += 4; }
        y += 3;
    }
    else if (designType === 'tabular_clean') {
        pdf.setDrawColor(...borderRgb); const infoBoxH = 20; pdf.setLineWidth(0.5); pdf.rect(ml, y, contentWidth, infoBoxH, 'S');
        if (c.header.showLogo && schoolLogoBase64) { addLogo(ml + 3, y + 2, 16, 16); pdf.setFontSize(14); pdf.setTextColor(...primaryRgb); pdf.text(data.school.name, ml + 22, y + 9); }
        else { pdf.setFontSize(14); pdf.setTextColor(...primaryRgb); pdf.text(data.school.name, ml + 5, y + 9); }
        if (c.header.showAddress) { pdf.setFontSize(8); pdf.setTextColor(100, 100, 100); pdf.text(data.school.address || '', ml + (c.header.showLogo && schoolLogoBase64 ? 22 : 5), y + 15); }
        y += infoBoxH + 2;
        pdf.setFillColor(...primaryRgb); pdf.rect(ml, y, contentWidth, 9, 'F');
        pdf.setFontSize(c.header.titleFontSize > 14 ? 12 : c.header.titleFontSize); pdf.setTextColor(255, 255, 255);
        pdf.text(c.header.title, pageWidth / 2, y + 6.5, { align: 'center' }); y += 14;
        if (c.header.showTermInfo) { pdf.setFontSize(9); pdf.setTextColor(80, 80, 80); pdf.text(`${data.term.term_name} | ${data.term.academic_year || ''}`, pageWidth / 2, y, { align: 'center' }); y += 5; }
    }

    // ── STUDENT INFO ──
    pdf.setTextColor(0, 0, 0); pdf.setFontSize(10); pdf.setFont(c.styling.fontFamily || 'helvetica', 'normal');
    if (designType === 'tabular_clean') {
        const rowH = 7; const labelW = contentWidth * 0.3;
        allFields.forEach((f) => {
            pdf.setDrawColor(...borderRgb); pdf.setLineWidth(0.3); pdf.rect(ml, y, labelW, rowH, 'S'); pdf.rect(ml + labelW, y, contentWidth - labelW, rowH, 'S');
            pdf.setFontSize(9); pdf.setTextColor(80, 80, 80); pdf.text(f.label, ml + 3, y + 5); pdf.setTextColor(0, 0, 0); pdf.text(f.value, ml + labelW + 3, y + 5); y += rowH;
        }); y += 4;
    } else if (designType === 'institutional') {
        allFields.forEach(f => { pdf.setFontSize(10); pdf.setTextColor(50, 50, 50); pdf.text(`${f.label}`, ml + 5, y); pdf.text(':', ml + 55, y); pdf.text(f.value, ml + 60, y); y += 6; }); y += 3;
    } else {
        const col1 = allFields.filter((_, i) => i % 2 === 0); const col2 = allFields.filter((_, i) => i % 2 === 1);
        for (let i = 0; i < Math.max(col1.length, col2.length); i++) {
            if (col1[i]) { pdf.setFontSize(10); pdf.text(`${col1[i].label}: ${col1[i].value}`, ml + 5, y); }
            if (col2[i]) { pdf.text(`${col2[i].label}: ${col2[i].value}`, pageWidth / 2 + 10, y); }
            y += 7;
        } y += 4;
    }

    // ── MARKS TABLE ──
    if (allCols.length === 0) return pdf;
    const showSno = designType === 'modern_branded' || designType === 'tabular_clean';
    const tableCols = showSno ? [{ key: 'sno', label: 'S.No' }, ...allCols] : allCols;
    const tableColsWithGroupsRaw = tableCols.map(col => {
        const groupId = col.key === 'sno' ? undefined : col.group;
        const groupName = (c.columnGroups || []).find(g => g.id === groupId)?.name;
        return { ...col, group: groupId, groupName: groupName };
    });
    const tableColsWithGroups = []; const seenGroupNames = new Set(); const processedKeys = new Set();
    tableColsWithGroupsRaw.forEach(col => {
        if (processedKeys.has(col.key)) return;
        if (col.groupName) {
            if (!seenGroupNames.has(col.groupName)) {
                seenGroupNames.add(col.groupName);
                const nameMembers = tableColsWithGroupsRaw.filter(c => c.groupName === col.groupName);
                nameMembers.forEach(m => { tableColsWithGroups.push(m); processedKeys.add(m.key); });
            }
        } else { tableColsWithGroups.push(col); processedKeys.add(col.key); }
    });
    const tableColWidth = contentWidth / tableColsWithGroups.length;
    const groupSpans = []; let currentGroupName = null; let startIdx = 0;
    tableColsWithGroups.forEach((col, i) => {
        if (col.groupName !== currentGroupName) { if (currentGroupName) { groupSpans.push({ name: currentGroupName, start: startIdx, count: i - startIdx }); } currentGroupName = col.groupName; startIdx = i; }
    });
    if (currentGroupName) { groupSpans.push({ name: currentGroupName, start: startIdx, count: tableColsWithGroups.length - startIdx }); }

    pdf.setFont(c.styling.fontFamily || 'helvetica', 'bold'); pdf.setFontSize(8.5);
    let maxHeaderLines = 1;
    const headerColLines = tableColsWithGroups.map(col => {
        const lines = pdf.splitTextToSize(col.label || '', tableColWidth - 2);
        if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
        return lines;
    });
    const subHeaderH = Math.max(10, maxHeaderLines * 4 + 2);
    const superH = groupSpans.length > 0 ? 8 : 0;
    const totalHeaderH = superH + subHeaderH;
    pdf.setFillColor(...tblHdrBg); pdf.rect(ml, y, contentWidth, totalHeaderH, 'F');
    if (superH > 0) {
        const lighterHdrBg = tblHdrBg.map(v => Math.round(v + (255 - v) * 0.15));
        groupSpans.forEach(gs => { const gx = ml + gs.start * tableColWidth; const gw = gs.count * tableColWidth; pdf.setFillColor(...lighterHdrBg); pdf.rect(gx, y, gw, superH, 'F'); });
    }
    if (c.styling.showBorder) {
        pdf.setDrawColor(...borderRgb); pdf.setLineWidth(0.3); pdf.rect(ml, y, contentWidth, totalHeaderH, 'S');
        tableColsWithGroups.forEach((col, i) => {
            if (i === 0) return; const vx = ml + i * tableColWidth;
            if (!col.group || (i > 0 && tableColsWithGroups[i - 1].group !== col.group)) { pdf.line(vx, y, vx, y + totalHeaderH); }
            else { pdf.line(vx, y + superH, vx, y + totalHeaderH); }
        });
        groupSpans.forEach(gs => { const gx = ml + gs.start * tableColWidth; const gw = gs.count * tableColWidth; pdf.line(gx, y + superH, gx + gw, y + superH); });
    }
    pdf.setTextColor(...tblHdrTxt);
    if (superH > 0) {
        pdf.setFontSize(8);
        groupSpans.forEach(gs => { const gx = ml + gs.start * tableColWidth; const gw = gs.count * tableColWidth; pdf.text(gs.name, gx + gw / 2, y + superH / 2 + 0.5, { align: 'center', baseline: 'middle' }); });
    }
    pdf.setFontSize(8.5);
    tableColsWithGroups.forEach((col, i) => {
        const lines = headerColLines[i]; const centerX = ml + i * tableColWidth + tableColWidth / 2;
        if (col.group) { const textY = y + superH + (subHeaderH / 2) + (lines.length === 1 ? 0.5 : -(lines.length - 1) * 1.5); pdf.text(lines, centerX, textY, { align: 'center', baseline: 'middle' }); }
        else { const textY = y + (totalHeaderH / 2) + (lines.length === 1 ? 0.5 : -(lines.length - 1) * 1.5); pdf.text(lines, centerX, textY, { align: 'center', baseline: 'middle' }); }
    });
    y += totalHeaderH;

    pdf.setFont(c.styling.fontFamily || 'helvetica', 'normal'); pdf.setFontSize(8.5);
    data.subjects.forEach((sub, ri) => {
        const bg = ri % 2 === 0 ? evenRgb : oddRgb;
        let maxRowLines = 1;
        const rowCellLines = tableColsWithGroups.map(col => {
            const val = col.key === 'sno' ? String(ri + 1) : getVal(sub, col);
            const lines = pdf.splitTextToSize(val || '', tableColWidth - 2);
            if (lines.length > maxRowLines) maxRowLines = lines.length;
            return lines;
        });
        const rowH = Math.max(8, maxRowLines * 4 + 2);
        pdf.setFillColor(...bg); pdf.rect(ml, y, contentWidth, rowH, 'F');
        if (c.styling.showBorder) {
            pdf.setDrawColor(...borderRgb); pdf.setLineWidth(0.1); pdf.rect(ml, y, contentWidth, rowH, 'S');
            for (let i = 1; i < tableColsWithGroups.length; i++) { pdf.line(ml + i * tableColWidth, y, ml + i * tableColWidth, y + rowH); }
        }
        pdf.setTextColor(0, 0, 0);
        rowCellLines.forEach((lines, i) => { const x = ml + i * tableColWidth + tableColWidth / 2; const textY = y + (rowH / 2) + (lines.length === 1 ? 1 : -(lines.length - 1) * 1.5); pdf.text(lines, x, textY, { align: 'center', baseline: 'middle' }); });
        y += rowH;
    });

    // ── SUMMARY ──
    if (c.summary.showTotal || c.summary.showPercentage || c.summary.showGrade) {
        pdf.setFillColor(...tblHdrBg); pdf.rect(ml, y, contentWidth, 10, 'F'); pdf.setTextColor(...tblHdrTxt); pdf.setFontSize(10);
        const parts = [];
        if (c.summary.showTotal) parts.push(`Total: ${totalObtained}/${totalMax}`);
        if (c.summary.showPercentage) parts.push(`Percentage: ${totalMax ? ((totalObtained / totalMax) * 100).toFixed(1) : 0}%`);
        if (c.summary.showGrade) {
            const p = totalMax ? (totalObtained / totalMax) * 100 : 0;
            let g = 'A+'; if (p < 90) g = 'A'; if (p < 80) g = 'B+'; if (p < 70) g = 'B'; if (p < 60) g = 'C'; if (p < 50) g = 'D'; if (p < 40) g = 'F';
            parts.push(`Grade: ${g}`);
        }
        pdf.text(parts.join('    |    '), pageWidth / 2, y + 6.5, { align: 'center' }); y += 12;
    }

    // ── GRADING SCALE ──
    if (designType === 'academic_record' || designType === 'institutional') {
        y += 3;
        const grades = [{ range: '91-100', grade: 'A+' }, { range: '81-90', grade: 'A' }, { range: '71-80', grade: 'B+' }, { range: '61-70', grade: 'B' }, { range: '51-60', grade: 'C' }, { range: '41-50', grade: 'D' }, { range: 'Below 40', grade: 'F' }];
        pdf.setFontSize(8); pdf.setTextColor(80, 80, 80); pdf.text('Grading Scale:', ml + 5, y); y += 4;
        const gW = contentWidth / grades.length;
        pdf.setFillColor(245, 245, 245); pdf.rect(ml, y, contentWidth, 12, 'F');
        pdf.setDrawColor(...borderRgb); pdf.rect(ml, y, contentWidth, 12, 'S');
        grades.forEach((g, i) => {
            pdf.setFontSize(7); pdf.setTextColor(80, 80, 80); pdf.text(g.range, ml + i * gW + gW / 2, y + 5, { align: 'center' });
            pdf.setTextColor(0, 0, 0); pdf.text(g.grade, ml + i * gW + gW / 2, y + 10, { align: 'center' });
        });
        y += 15;
    }

    // ── FOOTER ──
    const maxFooterY = pageHeight - mb - 35;
    const minFooterY = y + 8;
    if (y < minFooterY) y = minFooterY;
    if (y > maxFooterY) y = maxFooterY;
    pdf.setDrawColor(...primaryRgb); pdf.setLineWidth(0.3); pdf.line(ml, y, pageWidth - mr, y); y += 8;
    if (c.footer.showSignatureLines && c.footer.signatureLabels?.length) {
        const numSigs = c.footer.signatureLabels.length; const sigLineW = 50;
        c.footer.signatureLabels.forEach((label, i) => {
            let sigX;
            if (numSigs === 1) sigX = ml + contentWidth / 2;
            else if (numSigs === 2) sigX = (i === 0) ? (ml + sigLineW / 2) : (pageWidth - mr - sigLineW / 2);
            else { const step = contentWidth / (numSigs - 1); sigX = ml + step * i; if (i === 0) sigX += sigLineW / 2; if (i === numSigs - 1) sigX -= sigLineW / 2; }
            pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.3); pdf.line(sigX - sigLineW / 2, y + 8, sigX + sigLineW / 2, y + 8);
            pdf.setFontSize(9); pdf.setTextColor(80, 80, 80); pdf.text(label, sigX, y + 13, { align: 'center' });
        }); y += 18;
    }
    if (c.footer.footerText) { pdf.setFontSize(8); pdf.setTextColor(120, 120, 120); pdf.text(c.footer.footerText, pageWidth / 2, y + 2, { align: 'center' }); y += 4; }
    if (c.footer.showDate) { pdf.setFontSize(8); pdf.setTextColor(120, 120, 120); pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, y + 2, { align: 'center' }); }

    drawPageBorder();
    return pdf;
};
