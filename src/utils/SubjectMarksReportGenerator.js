import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a Subject Marks Report PDF for a class assignment.
 * Supports multi-row headers (e.g. Pre Test -> Copy, Unit Test, etc.)
 * @param {Object} params
 * @param {Object} params.assignment - Selected assignment details (subject_name, class, section, term_name, academic_year)
 * @param {Array} params.students - Array of student objects with marks
 * @param {Array} [params.groupedCols] - Optional grouped columns list ({ name, cols })
 * @param {Array} [params.columns] - List of flattened columns ({ key, label })
 * @param {Function} params.calculateGrade - Helper function to compute grade from marks
 * @param {string} [params.schoolName] - School name override
 * @param {string} [params.schoolAddress] - School address override
 */
export const downloadSubjectMarksReportPDF = ({
    assignment,
    students,
    groupedCols = [],
    columns = [],
    calculateGrade,
    teacherName,
    schoolName = localStorage.getItem('schoolName') || 'School Name',
    schoolAddress = localStorage.getItem('schoolAddress') || ''
}) => {
    if (!assignment || !students || students.length === 0) {
        alert('No student marks available to generate report.');
        return;
    }

    // Determine flattened columns list if not provided directly
    const flatCols = columns.length > 0
        ? columns
        : (groupedCols ? groupedCols.flatMap(g => g.cols || []) : []);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header Banner
    doc.setFillColor(30, 27, 75); // #1e1b4b
    doc.rect(0, 0, 297, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(String(schoolName).toUpperCase(), 14, 10);

    const rawTerm = (assignment?.term_name || assignment?.exam_term_name || '').trim();
    const isGenericTerm = !rawTerm || rawTerm.toLowerCase() === 'academic term';
    const displayTerm = isGenericTerm ? '' : rawTerm;
    const termText = displayTerm ? `${displayTerm}${assignment.academic_year ? ` (${assignment.academic_year})` : ''}` : (assignment?.academic_year ? `(${assignment.academic_year})` : '');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`SUBJECT MARKS REPORT${displayTerm ? ` - ${displayTerm}` : ''}`, 14, 17);

    if (schoolAddress) {
        doc.setFontSize(8);
        doc.text(schoolAddress, 283, 12, { align: 'right' });
    }

    // Subheader Meta Info Formatting
    const rawTeacher = teacherName || assignment?.teacher_name || assignment?.teacherName || '';
    const rawClass = String(assignment?.class || '').replace(/^class\s+/i, '').trim();
    const formattedClass = rawClass ? `Class ${rawClass}` : '-';

    const rawSec = String(assignment?.section || '').replace(/^section\s+/i, '').trim();
    const formattedSec = rawSec ? ` - Section ${rawSec}` : '';
    const classSecText = `${formattedClass}${formattedSec}`;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);

    let xPos = 14;

    // 1. Subject
    doc.setFont('helvetica', 'bold');
    doc.text(`Subject:`, xPos, 29);
    doc.setFont('helvetica', 'normal');
    doc.text(assignment.subject_name || '-', xPos + 15, 29);
    xPos += 60;

    // 2. Teacher (if available)
    if (rawTeacher) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Teacher:`, xPos, 29);
        doc.setFont('helvetica', 'normal');
        doc.text(rawTeacher, xPos + 15, 29);
        xPos += 65;
    }

    // 3. Class & Sec
    doc.setFont('helvetica', 'bold');
    doc.text(`Class & Sec:`, xPos, 29);
    doc.setFont('helvetica', 'normal');
    doc.text(classSecText, xPos + 21, 29);
    xPos += 65;

    // 4. Academic Term (only if term text is present)
    if (termText) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Term:`, xPos, 29);
        doc.setFont('helvetica', 'normal');
        doc.text(termText, xPos + 11, 29);
    }

    // Summary Stats (Column-wise dynamic entered counts matching web table)
    const activeCols = flatCols.filter(col => col.key !== 'grade' && col.key !== 'percentage' && col.key !== 'remarks');
    const getValForCol = (s, colKey) => {
        return s[colKey] ?? s.custom_marks?.[colKey] ?? null;
    };

    let summaryText = '';
    if (activeCols.length > 0) {
        const colStats = activeCols.map(col => {
            const count = students.filter(s => {
                const v = getValForCol(s, col.key);
                return v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '-';
            }).length;
            return `${col.label}: ${count}/${students.length}`;
        });
        summaryText = `Entered: ${colStats.join('   |   ')}`;
    } else {
        const overallEntered = students.filter(s => {
            if (s.marks_obtained !== null && s.marks_obtained !== undefined && String(s.marks_obtained).trim() !== '') return true;
            if (s.custom_marks && typeof s.custom_marks === 'object') {
                return Object.values(s.custom_marks).some(v => v !== null && v !== undefined && String(v).trim() !== '');
            }
            return false;
        }).length;
        summaryText = `Entered: ${overallEntered}/${students.length} Students`;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`Summary:`, 14, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(summaryText, 33, 35);

    // Build Table Header (Multi-Row Support for Grouped Columns)
    const hasGroupedCols = groupedCols && groupedCols.some(g => g.name !== null);
    let tableHeaders = [];

    if (hasGroupedCols) {
        const row1 = [
            { content: 'Roll', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Student Name', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } }
        ];
        const row2 = [];

        groupedCols.forEach((group, gIdx) => {
            if (group.name !== null) {
                row1.push({
                    content: group.name,
                    colSpan: group.cols.length,
                    styles: {
                        halign: 'center',
                        valign: 'middle',
                        fillColor: gIdx % 2 === 0 ? [49, 46, 129] : [55, 48, 163]
                    }
                });
                group.cols.forEach(col => {
                    row2.push({
                        content: col.label,
                        styles: { halign: 'center', valign: 'middle' }
                    });
                });
            } else {
                group.cols.forEach(col => {
                    row1.push({
                        content: col.label,
                        rowSpan: 2,
                        styles: { halign: 'center', valign: 'middle' }
                    });
                });
            }
        });

        tableHeaders = [row1, row2];
    } else {
        tableHeaders = [['Roll', 'Student Name', ...flatCols.map(c => c.label)]];
    }

    // Build Table Data Rows
    const sortedStudents = [...students].sort((a, b) => {
        const rA = parseInt(a.roll_number || '0', 10);
        const rB = parseInt(b.roll_number || '0', 10);
        if (!isNaN(rA) && !isNaN(rB) && rA !== rB) return rA - rB;
        return String(a.roll_number || '').localeCompare(String(b.roll_number || ''));
    });

    const tableData = sortedStudents.map(student => {
        const row = [
            student.roll_number || '-',
            student.name || '-'
        ];

        flatCols.forEach(col => {
            let val = '-';
            if (col.key === 'grade') {
                val = student.grade || (calculateGrade ? calculateGrade(student.marks_obtained, student.total_marks || 100) : '') || '-';
            } else if (col.key === 'total_marks' || col.key === 'max_marks') {
                val = student.total_marks ?? 100;
            } else if (col.key === 'percentage') {
                const pct = student.marks_obtained !== null && student.marks_obtained !== ''
                    ? ((parseFloat(student.marks_obtained) / (parseFloat(student.total_marks) || 100)) * 100).toFixed(1)
                    : '-';
                val = pct !== '-' ? `${pct}%` : '-';
            } else {
                if (col.key === 'marks_obtained') val = student.marks_obtained ?? '-';
                else if (col.key === 'remarks') val = student.remarks ?? '-';
                else if (col.key === 'theory_marks') val = student.theory_marks ?? '-';
                else if (col.key === 'practical_marks') val = student.practical_marks ?? '-';
                else if (col.key === 'internal_marks') val = student.internal_marks ?? '-';
                else if (col.key === 'external_marks') val = student.external_marks ?? '-';
                else val = student.custom_marks?.[col.key] ?? '-';
            }
            row.push(val !== '' && val !== null && val !== undefined ? String(val) : '-');
        });

        return row;
    });

    autoTable(doc, {
        startY: 40,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [30, 27, 75],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 8.5
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [30, 41, 59]
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 16 },
            1: { halign: 'left', cellWidth: 45 }
        },
        styles: {
            halign: 'center',
            valign: 'middle'
        }
    });

    const filename = `${assignment.subject_name}_Class_${assignment.class}${assignment.section ? `_${assignment.section}` : ''}_Marks_Report.pdf`;
    doc.save(filename);
};
