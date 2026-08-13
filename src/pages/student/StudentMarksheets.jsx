import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import { generateMarksheetPDF } from '../../utils/MarksheetGenerator';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>
);

const getObtainedVal = (mark) => {
    if (!mark) return null;
    if (mark.marks_obtained !== null && mark.marks_obtained !== undefined && mark.marks_obtained !== '') {
        return parseFloat(mark.marks_obtained);
    }
    if (mark.custom_marks) {
        let cm = mark.custom_marks;
        if (typeof cm === 'string') {
            try { cm = JSON.parse(cm); } catch (e) { cm = {}; }
        }
        if (cm && typeof cm === 'object') {
            if (cm.marks_obtained != null && cm.marks_obtained !== '') return parseFloat(cm.marks_obtained);
            if (cm.total != null && cm.total !== '') return parseFloat(cm.total);
            if (cm.total_marks != null && cm.total_marks !== '') return parseFloat(cm.total_marks);

            const vals = Object.values(cm).map(v => parseFloat(v)).filter(v => !isNaN(v));
            if (vals.length > 0) {
                const maxVal = Math.max(...vals);
                const sumOthers = vals.reduce((a, b) => a + b, 0) - maxVal;
                if (maxVal === sumOthers && vals.length > 1) {
                    return maxVal;
                }
                return vals.reduce((a, b) => a + b, 0);
            }
        }
    }
    return null;
};

const getGradeVal = (mark, obtained, total = 100) => {
    if (mark.grade && mark.grade !== '-' && mark.grade !== '') return mark.grade;
    if (obtained === null || obtained === undefined || isNaN(obtained)) return '-';
    const pct = (obtained / (parseFloat(total) || 100)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
};

const getDisplayColumns = (templateConfig, marksList) => {
    const cfg = templateConfig;
    const labelMap = {};

    if (cfg) {
        if (cfg.customColumns && Array.isArray(cfg.customColumns)) {
            cfg.customColumns.forEach(c => {
                if (c && c.key && c.label) {
                    labelMap[c.key] = c.label;
                }
            });
        }
        if (cfg.marksColumns) {
            Object.entries(cfg.marksColumns).forEach(([k, v]) => {
                if (v && v.label) {
                    labelMap[k === 'max_marks' ? 'total_marks' : k] = v.label;
                }
            });
        }
    }

    let cols = [];

    if (cfg && cfg.customColumns && Array.isArray(cfg.customColumns) && cfg.customColumns.length > 0) {
        const builtIn = cfg.marksColumns ? Object.entries(cfg.marksColumns)
            .filter(([k, v]) => v && v.enabled && k !== 'grade')
            .map(([k, v]) => ({ key: k === 'subject' ? 'subject' : k, label: v.label, order: v.order || 99 })) : [];

        const custom = cfg.customColumns
            .filter(c => c && c.enabled)
            .map(c => ({ key: c.key, label: c.label, isCustom: true, order: c.order || 99 }));

        cols = [...builtIn, ...custom].sort((a, b) => (a.order || 99) - (b.order || 99));
    } else {
        const foundKeysMap = new Map();
        (marksList || []).forEach(m => {
            if (m.custom_marks) {
                let cm = m.custom_marks;
                if (typeof cm === 'string') {
                    try { cm = JSON.parse(cm); } catch (e) { cm = {}; }
                }
                if (cm && typeof cm === 'object') {
                    Object.keys(cm).forEach(k => {
                        if (!foundKeysMap.has(k) && k !== 'marks_obtained' && k !== 'total' && k !== 'total_marks' && k !== 'grade') {
                            const lbl = labelMap[k] || (k.startsWith('custom_') ? k.replace(/^custom_\d+/, '').replace(/^custom_/, '').replace(/_/g, ' ') : k);
                            foundKeysMap.set(k, { key: k, label: lbl || k, isCustom: true, order: 10 });
                        }
                    });
                }
            }
        });

        const custom = Array.from(foundKeysMap.values());
        if (custom.length > 0) {
            cols = [
                { key: 'subject', label: 'Subject', order: 1 },
                ...custom
            ];
        } else {
            cols = [
                { key: 'subject', label: 'Subject', order: 1 },
                { key: 'max_marks', label: 'Max Marks', order: 2 },
                { key: 'marks_obtained', label: 'Marks Obtained', order: 3 }
            ];
        }
    }

    const uniqueMap = new Map();
    cols.forEach(c => {
        if (c.key !== 'grade' && !uniqueMap.has(c.key)) uniqueMap.set(c.key, c);
    });

    return Array.from(uniqueMap.values());
};

const getCellVal = (mark, col) => {
    if (!mark) return '-';
    const key = col.key;
    if (key === 'subject' || key === 'subject_name') return mark.subject_name || '-';
    if (key === 'max_marks') return mark.total_marks || 100;
    if (key === 'grade') return getGradeVal(mark, getObtainedVal(mark), mark.total_marks || 100);
    if (key === 'marks_obtained') {
        const obt = getObtainedVal(mark);
        return obt != null ? obt : '-';
    }
    if (key === 'percentage') {
        const obt = getObtainedVal(mark);
        const tot = parseFloat(mark.total_marks || 100);
        return obt != null && tot > 0 ? `${((obt / tot) * 100).toFixed(1)}%` : '-';
    }

    if (mark.custom_marks) {
        let cm = mark.custom_marks;
        if (typeof cm === 'string') {
            try { cm = JSON.parse(cm); } catch (e) { cm = {}; }
        }
        if (cm && typeof cm === 'object' && cm[key] !== undefined && cm[key] !== null) {
            return cm[key];
        }
    }

    return '-';
};

const StudentMarksheets = () => {
    const [terms, setTerms] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(null);
    const [schoolLogoBase64, setSchoolLogoBase64] = useState(null);
    const previewRef = useRef(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchMarksheets();
        fetchSchoolLogo();
    }, []);

    const fetchSchoolLogo = async () => {
        const logoPath = localStorage.getItem('schoolLogo');
        if (!logoPath) return;
        try {
            const logoUrl = `${API_URL}${logoPath}`;
            const response = await fetch(logoUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => setSchoolLogoBase64(reader.result);
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error('Error fetching logo:', err);
        }
    };

    const fetchMarksheets = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/marks/student/my-marksheets`, { headers });
            setTerms(res.data.terms || []);
            setStudentInfo(res.data.student || null);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    // ─── VIEW MARKSHEET (PREVIEW) ────────────────────────────
    const viewMarksheet = async (term) => {
        setPreviewLoading(term.id);
        try {
            const res = await axios.get(`${API_URL}/api/marks/student/marksheet/${term.id}`, { headers });
            const templateConfig = res.data.template?.config || res.data.template || null;
            setPreviewData({ ...res.data, templateConfig });
        } catch (err) {
            console.error(err);
            alert('Error loading marksheet preview');
        }
        setPreviewLoading(null);
    };

    const handlePrintPreview = () => {
        const content = previewRef.current;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Marksheet</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; color: #1e1e1e; }
                .ms-header { text-align: center; border-bottom: 3px double #191970; padding-bottom: 16px; margin-bottom: 20px; }
                .ms-header h1 { font-size: 24px; color: #191970; margin-bottom: 4px; }
                .ms-header p { font-size: 11px; color: #666; }
                .ms-title { text-align: center; font-size: 20px; font-weight: bold; margin: 16px 0 6px; }
                .ms-subtitle { text-align: center; font-size: 13px; color: #555; margin-bottom: 18px; }
                .ms-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px; }
                .ms-info span.label { font-weight: 600; color: #475569; }
                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                th { background: #191970; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; }
                td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                tr:nth-child(even) { background: #f5f5ff; }
                .total-row td { background: #191970 !important; color: #fff; font-weight: bold; font-size: 13px; }
                .result-box { display: flex; justify-content: center; gap: 40px; margin: 18px 0; font-size: 15px; font-weight: bold; }
                .pass { color: #16a34a; }
                .fail { color: #dc2626; }
                .ms-footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px; font-size: 10px; color: #94a3b8; font-style: italic; }
                @media print { body { padding: 15px; } }
            </style></head><body>
            ${content.innerHTML}
            <script>window.print(); window.close();<\/script>
            </body></html>
        `);
        win.document.close();
    };

    const downloadMarksheet = async (term) => {
        setDownloading(term.id);
        try {
            const res = await axios.get(`${API_URL}/api/marks/student/marksheet/${term.id}`, { headers });
            const { student, marks, school, term: termInfo, template } = res.data;

            const config = template?.config || template || {
                designType: 'classic',
                header: { showLogo: true, schoolNameFontSize: 20, showAddress: true, showPhone: true, showEmail: true, title: 'MARKSHEET', titleFontSize: 16, showTermInfo: true },
                studentFields: {
                    name: { enabled: true, label: 'Student Name' }, roll_number: { enabled: true, label: 'Roll Number' },
                    class: { enabled: true, label: 'Class' }, father_name: { enabled: true, label: "Father's Name" },
                },
                marksColumns: {
                    subject: { enabled: true, label: 'Subject', order: 1 },
                    max_marks: { enabled: true, label: 'Max Marks', order: 2 },
                    marks_obtained: { enabled: true, label: 'Marks Obtained', order: 3 },
                    grade: { enabled: true, label: 'Grade', order: 4 },
                },
                customColumns: [],
                columnGroups: [],
                summary: { showTotal: true, showPercentage: true, showResult: false, showGrade: true, passingPercentage: 33 },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Principal'], footerText: 'This is a computer generated marksheet.' },
                styling: { primaryColor: '#191970', headerBgColor: '#191970', headerTextColor: '#FFFFFF', tableHeaderBg: '#191970', tableHeaderText: '#FFFFFF', evenRowBg: '#F0F0FF', oddRowBg: '#FFFFFF', borderColor: '#CBD5E1', fontFamily: 'helvetica', showBorder: true, borderStyle: 'full' },
                page: { orientation: 'portrait', size: 'a4', marginTop: 15, marginBottom: 15, marginLeft: 20, marginRight: 20 },
            };

            const formattedSubjects = (marks || []).map(m => {
                const obt = getObtainedVal(m);
                const gr = getGradeVal(m, obt, m.total_marks || 100);
                let customMarksObj = {};
                if (m.custom_marks) {
                    try {
                        customMarksObj = typeof m.custom_marks === 'string' ? JSON.parse(m.custom_marks) : m.custom_marks;
                    } catch (e) { }
                }
                return {
                    subject_name: m.subject_name,
                    total_marks: m.total_marks || 100,
                    marks_obtained: obt !== null ? obt : '-',
                    grade: gr,
                    custom_marks: customMarksObj,
                    ...customMarksObj
                };
            });

            const doc = generateMarksheetPDF(config, {
                school: school || {},
                term: termInfo || {},
                student: student || {},
                subjects: formattedSubjects
            }, schoolLogoBase64);

            doc.save(`Marksheet-${student?.name || 'Student'}-${termInfo?.term_name || 'Exam'}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Error downloading marksheet');
        }
        setDownloading(null);
    };

    const getGradeColor = (grade) => {
        if (!grade) return '#94a3b8';
        const g = String(grade).toUpperCase();
        if (g === 'A+' || g === 'A') return '#16a34a';
        if (g === 'B+' || g === 'B') return '#2563eb';
        if (g === 'C+' || g === 'C') return '#d97706';
        if (g === 'D') return '#ea580c';
        return '#dc2626';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading marksheets...</p>
                </div>
            </div>
        );
    }

    let previewTotalObtained = 0, previewTotalMax = 0, previewPercentage = 0, previewResult = '';
    if (previewData?.marks) {
        previewData.marks.forEach(m => {
            const obt = getObtainedVal(m);
            if (obt != null) previewTotalObtained += obt;
            previewTotalMax += parseFloat(m.total_marks || 100);
        });
        previewPercentage = previewTotalMax > 0 ? (previewTotalObtained / previewTotalMax) * 100 : 0;
        previewResult = previewPercentage >= 33 ? 'PASS' : 'FAIL';
    }

    const displayCols = getDisplayColumns(previewData?.templateConfig, previewData?.marks);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">📋 My Marksheets</h1>
                <p className="text-slate-500 text-sm mt-1">View and download your exam marksheets</p>
            </div>

            {studentInfo && (
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                            {studentInfo.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">{studentInfo.name}</h2>
                            <p className="text-sm text-slate-500">
                                Class {studentInfo.class}-{studentInfo.section} {studentInfo.roll_number ? `| Roll No: ${studentInfo.roll_number}` : ''}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {terms.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">No Marksheets Available</h2>
                    <p className="text-slate-400">Your marksheets will appear here once your exam results are published.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {terms.map(term => (
                        <Card key={term.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{term.term_name}</h3>
                                    {term.academic_year && (
                                        <p className="text-sm text-slate-500 mt-1">{term.academic_year}</p>
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${term.finalized_count > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {term.finalized_count > 0 ? '✅ Published' : '⏳ Pending'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                <span>📊 {term.total_count} subject{term.total_count !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => viewMarksheet(term)}
                                    disabled={previewLoading === term.id}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${term.finalized_count > 0
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        } disabled:opacity-50`}
                                >
                                    {previewLoading === term.id ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>👁️</span>
                                            <span>View</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => downloadMarksheet(term)}
                                    disabled={downloading === term.id}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${term.finalized_count > 0
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        } disabled:opacity-50`}
                                >
                                    {downloading === term.id ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📥</span>
                                            <span>Download</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MARKSHEET PREVIEW MODAL */}
            {previewData && createPortal(
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-[99999] p-4 md:p-8 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setPreviewData(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">📋 Marksheet Preview</h2>
                                <button onClick={() => setPreviewData(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                            </div>

                            <div ref={previewRef} className="border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
                                <div style={{ textAlign: 'center', borderBottom: '3px double #191970', padding: '20px 20px 16px', background: 'linear-gradient(to bottom, #f8fafc, #fff)' }}>
                                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#191970', letterSpacing: '1px' }}>
                                        {previewData.school?.name || 'School'}
                                    </h1>
                                    {previewData.school?.address && (
                                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#666' }}>{previewData.school.address}</p>
                                    )}
                                    {(previewData.school?.phone || previewData.school?.email) && (
                                        <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#888' }}>
                                            {previewData.school.phone && `📞 ${previewData.school.phone}`}
                                            {previewData.school.phone && previewData.school.email && '  |  '}
                                            {previewData.school.email && `✉️ ${previewData.school.email}`}
                                        </p>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center', padding: '14px 0 6px' }}>
                                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', letterSpacing: '3px', color: '#1e1e1e' }}>MARKSHEET</h2>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
                                        {previewData.term?.term_name || ''} {previewData.term?.academic_year || ''}
                                    </p>
                                </div>

                                <div style={{ margin: '12px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px' }}>
                                    <div><span style={{ fontWeight: 600, color: '#475569' }}>Student Name: </span>{previewData.student?.name || ''}</div>
                                    <div><span style={{ fontWeight: 600, color: '#475569' }}>Class: </span>{previewData.student?.class || ''}-{previewData.student?.section || ''}</div>
                                    {previewData.student?.roll_number && (
                                        <div><span style={{ fontWeight: 600, color: '#475569' }}>Roll Number: </span>{previewData.student.roll_number}</div>
                                    )}
                                    {previewData.student?.father_name && (
                                        <div><span style={{ fontWeight: 600, color: '#475569' }}>Father's Name: </span>{previewData.student.father_name}</div>
                                    )}
                                    {previewData.student?.dob && (
                                        <div><span style={{ fontWeight: 600, color: '#475569' }}>Date of Birth: </span>{new Date(previewData.student.dob).toLocaleDateString('en-IN')}</div>
                                    )}
                                </div>

                                <div style={{ padding: '0 20px 6px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
                                        <thead>
                                            <tr style={{ background: '#191970' }}>
                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>S.No</th>
                                                {displayCols.map((col, idx) => (
                                                    <th key={col.key || idx} style={{ padding: '10px 12px', textAlign: col.key === 'subject' ? 'left' : 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                                                        {col.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.marks?.map((mark, idx) => (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#f5f5ff' : '#fff' }}>
                                                    <td style={{ padding: '9px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'center' }}>{idx + 1}</td>
                                                    {displayCols.map((col, cIdx) => {
                                                        const val = getCellVal(mark, col);
                                                        const isGrade = col.key === 'grade';
                                                        return (
                                                            <td key={col.key || cIdx} style={{ padding: '9px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textAlign: col.key === 'subject' ? 'left' : 'center', fontWeight: col.key === 'marks_obtained' || col.key === 'subject' ? 600 : 400 }}>
                                                                {isGrade ? (
                                                                    <span style={{ padding: '2px 10px', borderRadius: '12px', fontWeight: 600, fontSize: '11px', background: `${getGradeColor(val)}18`, color: getGradeColor(val) }}>
                                                                        {val}
                                                                    </span>
                                                                ) : val}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>
                                </div>



                                <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', padding: '12px 20px', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                                    This is a computer generated marksheet. Signature not required. • Generated on: {new Date().toLocaleDateString('en-IN')}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button onClick={handlePrintPreview}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2">
                                    🖨️ Print / Download PDF
                                </button>
                                <button onClick={() => {
                                    const termData = terms.find(t => t.id === previewData.term?.id);
                                    if (termData) downloadMarksheet(termData);
                                }}
                                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2">
                                    📥 Save as PDF
                                </button>
                                <button onClick={() => setPreviewData(null)}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                    ✓ Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default StudentMarksheets;
