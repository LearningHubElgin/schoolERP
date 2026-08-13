import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import { Eye, FileText, ChevronLeft, Save, Layout, Settings2, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { generateMarksheetPDF } from '../../utils/MarksheetGenerator';
import { downloadSubjectMarksReportPDF } from '../../utils/SubjectMarksReportGenerator';

const Card = ({ children, className = '', ...props }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`} {...props}>{children}</div>
);

const TeacherMarksEntry = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [students, setStudents] = useState([]);
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeBulkCol, setActiveBulkCol] = useState(null);
    const [bulkValue, setBulkValue] = useState('');
    const [bulkEnabledCols, setBulkEnabledCols] = useState(new Set()); // New state for local bulk selection
    const [showBulkConfig, setShowBulkConfig] = useState(false); // Toggle for config UI
    const [schoolLogoBase64, setSchoolLogoBase64] = useState(null);
    const [previewingStudent, setPreviewingStudent] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchAssignments();
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
            console.error('Error fetching school logo:', err);
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/marks/teacher/my-assignments`, { headers });
            setAssignments(res.data.assignments || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const loadStudents = async (assignment) => {
        setSelectedAssignment(assignment);
        setSaveSuccess(false);
        setTemplateLoading(true);
        try {
            // Fetch students and marks
            const res = await axios.get(`${API_URL}/api/marks/teacher/students/${assignment.id}`, { headers });
            setStudents(res.data.students || []);

            // Fetch template for this class with safe fallback
            try {
                const templateRes = await axios.get(`${API_URL}/api/marksheet-templates/active/${assignment.class}/${assignment.section || 'All'}`, { headers });
                setTemplate(templateRes.data.template || null);
            } catch (tmplErr) {
                console.warn('Template fallback to default columns:', tmplErr);
                setTemplate(null);
            }
        } catch (err) {
            console.error(err);
        }
        setTemplateLoading(false);
    };

    const calculateGrade = (obtained, total = 100) => {
        if (obtained === null || obtained === undefined || obtained === '') return '';
        const obt = parseFloat(obtained);
        const tot = parseFloat(total) || 100;
        if (isNaN(obt) || tot <= 0) return '';
        const pct = (obt / tot) * 100;
        if (pct >= 90) return 'A+';
        if (pct >= 80) return 'A';
        if (pct >= 70) return 'B+';
        if (pct >= 60) return 'B';
        if (pct >= 50) return 'C';
        if (pct >= 40) return 'D';
        return 'F';
    };

    const getGroupedCols = () => {
        if (!template || !template.config) {
            return [{
                id: 'none',
                name: '',
                cols: [
                    { key: 'total_marks', label: 'Max Marks' },
                    { key: 'marks_obtained', label: 'Marks Obtained' },
                    { key: 'grade', label: 'Grade' }
                ]
            }];
        }
        const c = template.config;
        const columnGroups = c.columnGroups || [];

        const isSubjectCol = (key, label) => {
            const k = (key || '').toLowerCase();
            const l = (label || '').toLowerCase();
            return k === 'subject' || k === 'subject_name' || l === 'subject' || l === 'subject name';
        };

        // 1. Get all enabled columns with their group names (excluding subject since title already displays subject)
        const builtIn = Object.entries(c.marksColumns || {})
            .filter(([k, v]) => v.enabled && !isSubjectCol(k, v.label))
            .map(([k, v]) => ({
                key: k === 'max_marks' ? 'total_marks' : k,
                label: v.label,
                order: v.order || 0,
                groupId: v.group || null,
                groupName: columnGroups.find(g => g.id === v.group)?.name || null,
                isCustom: false
            }));

        const custom = (c.customColumns || [])
            .filter(v => v.enabled && !isSubjectCol(v.key, v.label))
            .map(v => ({
                key: v.key,
                label: v.label,
                order: v.order || 0,
                groupId: v.group || null,
                groupName: columnGroups.find(g => g.id === v.group)?.name || null,
                isCustom: true
            }));

        const allColsRaw = [...builtIn, ...custom].sort((a, b) => a.order - b.order);

        // 2. Cluster columns by Group Name while respecting original order
        const grouped = [];
        const seenGroupNames = new Set();
        const processedKeys = new Set();

        allColsRaw.forEach(col => {
            if (processedKeys.has(col.key)) return;

            if (col.groupName) {
                if (!seenGroupNames.has(col.groupName)) {
                    seenGroupNames.add(col.groupName);
                    // Cluster all columns sharing this group NAME together
                    const nameMembers = allColsRaw.filter(c => c.groupName === col.groupName);
                    grouped.push({
                        id: `group_${col.groupName}`,
                        name: col.groupName,
                        cols: nameMembers
                    });
                    nameMembers.forEach(m => processedKeys.add(m.key));
                }
            } else {
                // Unassigned column - stays in its original relative position
                grouped.push({
                    id: `unassigned_${col.key}`,
                    name: null, // Mark as unassigned
                    cols: [col]
                });
                processedKeys.add(col.key);
            }
        });

        return grouped;
    };

    const getFlattenedCols = () => {
        return getGroupedCols().reduce((acc, group) => [...acc, ...group.cols], []);
    };

    const updateMark = (studentId, field, value) => {
        setStudents(prev => prev.map(s => {
            if (s.id !== studentId) return s;

            const updatedStudent = { ...s, [field]: value };

            // Auto-calculate grade when marks_obtained or total_marks changes
            if (field === 'marks_obtained' || field === 'total_marks') {
                const obt = field === 'marks_obtained' ? value : s.marks_obtained;
                const tot = field === 'total_marks' ? value : (s.total_marks || 100);
                updatedStudent.grade = calculateGrade(obt, tot);
            }

            // Core fields mapped directly to student object
            const coreFields = [
                'marks_obtained', 'total_marks', 'grade', 'percentage', 'remarks',
                'theory_marks', 'practical_marks', 'internal_marks', 'external_marks'
            ];
            if (coreFields.includes(field)) {
                return updatedStudent;
            }

            // Other fields go into custom_marks
            const nextCustom = { ...(s.custom_marks || {}) };
            if (value === '' || value === null || value === undefined) {
                delete nextCustom[field];
            } else {
                nextCustom[field] = value;
            }

            return { ...updatedStudent, custom_marks: nextCustom };
        }));
    };

    const saveMarks = async () => {
        if (!selectedAssignment) return;
        setSaving(true);
        setSaveSuccess(false);
        try {
            const marksData = students.map(s => ({
                student_id: s.id,
                marks_obtained: s.marks_obtained !== null && s.marks_obtained !== '' ? s.marks_obtained : '',
                total_marks: s.total_marks || 100,
                grade: s.grade || calculateGrade(s.marks_obtained, s.total_marks || 100),
                custom_marks: s.custom_marks || {}
            }));

            await axios.post(`${API_URL}/api/marks/teacher/enter-marks`, {
                assignment_id: selectedAssignment.id,
                marks: marksData
            }, { headers });

            setSaveSuccess(true);
            fetchAssignments(); // refresh completion status
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) { console.error(err); alert('Error saving marks'); }
        setSaving(false);
    };

    // ── PDF Marksheet Generation Logic (Using Shared Utility) ──
    const buildStudentPDF = useCallback((student) => {
        if (!template || !template.config) return null;

        const data = {
            school: {
                name: localStorage.getItem('schoolName') || 'School Name',
                address: localStorage.getItem('schoolAddress') || '',
            },
            term: {
                term_name: selectedAssignment.term_name,
                academic_year: selectedAssignment.academic_year || ''
            },
            student: {
                name: student.name,
                roll_number: student.roll_number || '-',
                class: `${selectedAssignment.class}${selectedAssignment.section ? `-${selectedAssignment.section}` : ''}`,
                father_name: student.father_name || '-',
                mother_name: student.mother_name || '-',
                dob: student.dob,
                admission_no: student.admission_no || '-',
                custom_fields: student.custom_fields || {}
            },
            subjects: [{
                subject_name: selectedAssignment.subject_name,
                marks_obtained: student.marks_obtained,
                total_marks: student.total_marks || 100,
                theory_marks: student.theory_marks,
                practical_marks: student.practical_marks,
                internal_marks: student.internal_marks,
                external_marks: student.external_marks,
                grade: student.grade,
                remarks: student.remarks,
                ...student.custom_marks
            }]
        };

        return generateMarksheetPDF(template.config, data, schoolLogoBase64);
    }, [template, schoolLogoBase64, selectedAssignment]);

    const toggleStudentPreview = (student) => {
        if (!student) {
            setPreviewingStudent(null);
            setPreviewUrl(null);
            return;
        }
        const pdf = buildStudentPDF(student);
        if (pdf) {
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            setPreviewingStudent(student);
            setPreviewUrl(url);
        }
    };

    const applyBulkSet = (colKey) => {
        if (!colKey || bulkValue === '') return;

        setStudents(prev => prev.map(s => {
            const coreFields = ['marks_obtained', 'total_marks', 'grade'];
            if (coreFields.includes(colKey)) {
                return { ...s, [colKey]: bulkValue };
            }

            const nextCustom = { ...(s.custom_marks || {}) };
            if (bulkValue === '' || bulkValue === null) {
                delete nextCustom[colKey];
            } else {
                nextCustom[colKey] = bulkValue;
            }
            return { ...s, custom_marks: nextCustom };
        }));

        setBulkValue('');
        setActiveBulkCol(null);
    };

    const handleDownloadReport = () => {
        downloadSubjectMarksReportPDF({
            assignment: selectedAssignment,
            students: students,
            groupedCols: getGroupedCols(),
            columns: getFlattenedCols(),
            calculateGrade: calculateGrade,
            teacherName: selectedAssignment?.teacher_name || selectedAssignment?.teacherName || ''
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">📝 Enter Marks</h1>
                <p className="text-slate-500 text-sm mt-1">Select an assignment and enter marks for students</p>
            </div>

            {/* Assignment Cards */}
            {!selectedAssignment && (
                <div>
                    <h2 className="text-lg font-semibold text-slate-700 mb-3">My Assignments</h2>
                    {assignments.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-slate-400 text-lg">No assignments found.</p>
                            <p className="text-slate-400 text-sm mt-1">Admin has not assigned you any subjects for marks entry yet.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignments.map(a => (
                                <Card key={a.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => loadStudents(a)}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{a.subject_name}</h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Class {String(a.class || '').replace(/^Class\s+/i, '')}{a.section ? `-Section ${String(a.section || '').replace(/^Section\s+/i, '')}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${a.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {a.is_completed ? '✅ Done' : '⏳ Pending'}
                                            </span>
                                            {Boolean(a.is_locked) && (
                                                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                                                    <span>🔒</span> Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span>📋 {a.term_name}</span>
                                        {a.academic_year && <span>• {a.academic_year}</span>}
                                    </div>
                                    <button className="mt-3 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                        {a.is_locked ? 'View Marks (Locked)' : a.is_completed ? 'Edit Marks' : 'Enter Marks'} →
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Marks Entry Table */}
            {selectedAssignment && (
                <div className="flex flex-col gap-2 h-[calc(100vh-160px)] min-h-[380px]">
                    {Boolean(selectedAssignment.is_locked) && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs flex-shrink-0">
                            <span className="text-sm">🔒</span>
                            <span>Marks entry for this subject has been <strong>locked</strong> by Admin. Viewing is enabled, but editing and saving marks is disabled.</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => { setSelectedAssignment(null); setStudents([]); }}
                                className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200 transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                                title="Download Subject Marks Report PDF"
                            >
                                <FileDown size={14} />
                                <span className="hidden sm:inline">Download Report</span>
                                <span className="sm:hidden">Report</span>
                            </button>
                        </div>
                        <div className="flex-1 text-right sm:text-left">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                                {selectedAssignment.subject_name} - Class {selectedAssignment.class?.replace(/^Class\s+/i, '')}{selectedAssignment.section ? ` - Sec ${selectedAssignment.section.replace(/^Section\s+/i, '')}` : ''}
                                {Boolean(selectedAssignment.is_locked) && (
                                    <span className="px-2 py-0.5 text-[10px] bg-rose-100 text-rose-700 rounded-full font-bold border border-rose-200">🔒 Locked</span>
                                )}
                            </h2>
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border-slate-200 flex-1 flex flex-col shadow-sm">
                        <div className="overflow-x-auto flex-1 overflow-y-auto relative">
                            <table className="w-full min-w-full border-separate border-spacing-0">
                                <thead className="sticky top-0 z-20 bg-[#1e1b4b]">
                                    {(() => {
                                        const groupedCols = getGroupedCols();
                                        const hasGroupedCols = groupedCols.some(g => g.name !== null);
                                        const rowSpan = hasGroupedCols ? 2 : 1;
                                        return (
                                            <>
                                                {/* Row 1: Main Headers */}
                                                <tr className="bg-[#1e1b4b] text-white text-xs font-bold">
                                                    <th className="px-1 py-1.5 border-r border-white/20 text-center font-bold text-xs w-[45px] min-w-[45px] max-w-[45px] sticky left-0 z-30 bg-[#1e1b4b]" rowSpan={rowSpan}>Roll</th>
                                                    <th className="px-1.5 py-1.5 border-r border-white/20 text-left font-bold text-xs w-[130px] min-w-[130px] max-w-[130px] sticky left-[45px] z-30 bg-[#1e1b4b] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]" rowSpan={rowSpan}>Student Name</th>

                                                    {groupedCols.map((group, gIdx) => (
                                                        group.name !== null ? (
                                                            <th key={group.id} className={`px-1 py-1 border-r border-b border-white/30 text-center font-bold text-xs ${gIdx % 2 === 0 ? 'bg-[#312e81]' : 'bg-[#3730a3]'}`} colSpan={group.cols.length}>
                                                                {group.name}
                                                            </th>
                                                        ) : (
                                                            group.cols.map(col => (
                                                                <th key={col.key} className="px-1.5 py-1.5 border-r border-white/20 text-center font-semibold text-xs bg-[#1e1b4b] min-w-[85px] sm:min-w-[100px] group" rowSpan={rowSpan}>
                                                                    <div className="flex flex-col items-center gap-0.5">
                                                                        <span>{col.label}</span>
                                                                        {bulkEnabledCols.has(col.key) && (
                                                                            <button
                                                                                onClick={() => setActiveBulkCol(activeBulkCol === col.key ? null : col.key)}
                                                                                className="text-[9px] bg-white/10 hover:bg-white hover:text-indigo-900 px-1 py-0.2 rounded transition-all opacity-70 group-hover:opacity-100 flex items-center gap-0.5"
                                                                            >
                                                                                <span className="text-orange-400">⚡</span> Set
                                                                            </button>
                                                                        )}
                                                                        {activeBulkCol === col.key && (
                                                                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white p-1.5 rounded-md shadow-xl border border-slate-200 z-50 flex items-center gap-1 text-slate-800 normal-case">
                                                                                <input
                                                                                    autoFocus
                                                                                    type="text"
                                                                                    value={bulkValue}
                                                                                    onChange={(e) => setBulkValue(e.target.value)}
                                                                                    placeholder="Val"
                                                                                    className="w-14 h-7 text-xs border border-slate-300 rounded px-1"
                                                                                    onKeyDown={(e) => e.key === 'Enter' && applyBulkSet(col.key)}
                                                                                />
                                                                                <button onClick={() => applyBulkSet(col.key)} className="h-7 px-1.5 bg-blue-600 text-white rounded text-xs font-semibold">OK</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </th>
                                                            ))
                                                        )
                                                    ))}

                                                    <th className="px-2 py-1.5 border-l border-white/20 text-center font-bold text-xs min-w-[60px] bg-[#1e1b4b]" rowSpan={rowSpan}>Action</th>
                                                </tr>

                                                {/* Row 2: Sub-column headers (only if column groups exist) */}
                                                {hasGroupedCols && (
                                                    <tr className="text-white">
                                                        {groupedCols.map((group, gIdx) => (
                                                            group.name !== null && group.cols.map((col, cIdx) => (
                                                                <th key={col.key} className={`px-1.5 py-1 border-white/10 text-center text-[11px] font-semibold min-w-[85px] sm:min-w-[100px] group ${cIdx === group.cols.length - 1 ? 'border-r border-white/30' : 'border-r border-white/10'
                                                                    } ${gIdx % 2 === 0 ? 'bg-[#312e81]' : 'bg-[#3730a3]'}`}>
                                                                    <div className="flex flex-col items-center gap-0.5">
                                                                        <span>{col.label}</span>
                                                                        {bulkEnabledCols.has(col.key) && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => setActiveBulkCol(activeBulkCol === col.key ? null : col.key)}
                                                                                    className="text-[9px] bg-white/10 hover:bg-white hover:text-indigo-900 px-1 py-0.2 rounded transition-all opacity-70 group-hover:opacity-100 flex items-center gap-0.5"
                                                                                >
                                                                                    <span className="text-orange-400">⚡</span> Set
                                                                                </button>
                                                                                {activeBulkCol === col.key && (
                                                                                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white p-1.5 rounded-md shadow-xl border border-slate-200 z-50 flex items-center gap-1 text-slate-800 normal-case">
                                                                                        <input
                                                                                            autoFocus
                                                                                            type="text"
                                                                                            value={bulkValue}
                                                                                            onChange={(e) => setBulkValue(e.target.value)}
                                                                                            placeholder="Val"
                                                                                            className="w-14 h-7 text-xs border border-slate-300 rounded px-1"
                                                                                            onKeyDown={(e) => e.key === 'Enter' && applyBulkSet(col.key)}
                                                                                        />
                                                                                        <button onClick={() => applyBulkSet(col.key)} className="h-7 px-1.5 bg-blue-600 text-white rounded text-xs font-semibold">OK</button>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </th>
                                                            ))
                                                        ))}
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })()}
                                </thead>
                                <tbody>
                                    {(() => {
                                        const sortedStudents = [...students].sort((a, b) => {
                                            const rA = parseInt(a.roll_number || '0', 10);
                                            const rB = parseInt(b.roll_number || '0', 10);
                                            if (!isNaN(rA) && !isNaN(rB) && rA !== rB) return rA - rB;
                                            return String(a.roll_number || '').localeCompare(String(b.roll_number || ''));
                                        });

                                        return sortedStudents.map((student, idx) => {
                                            const cols = getFlattenedCols();
                                            const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                                            return (
                                                <tr key={student.id} className={`border-b ${rowBg} hover:bg-blue-50/50 transition-colors`}>
                                                    {/* Fixed Roll Column */}
                                                    <td className={`px-1 py-1.5 text-center text-slate-700 font-semibold text-xs border-r sticky left-0 z-10 w-[45px] min-w-[45px] max-w-[45px] ${rowBg}`}>{student.roll_number || '-'}</td>

                                                    {/* Fixed Student Name Column */}
                                                    <td className={`px-1.5 py-1.5 font-semibold text-slate-900 text-xs border-r sticky left-[45px] z-10 w-[130px] min-w-[130px] max-w-[130px] truncate shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] ${rowBg}`} title={student.name}>{student.name}</td>

                                                    {cols.map(col => {
                                                        if (col.key === 'grade') {
                                                            const calculatedG = calculateGrade(student.marks_obtained, student.total_marks || 100);
                                                            const g = student.grade || calculatedG;
                                                            return (
                                                                <td key={col.key} className="px-1 py-1 text-center">
                                                                    <span className={`inline-block min-w-[32px] px-1.5 py-0.5 text-xs font-extrabold rounded text-center ${g === 'A+' || g === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                                                            g === 'B+' || g === 'B' ? 'bg-blue-100 text-blue-800' :
                                                                                g === 'C' || g === 'D' ? 'bg-amber-100 text-amber-800' :
                                                                                    g === 'F' ? 'bg-red-100 text-red-800' :
                                                                                        'bg-slate-100 text-slate-500'
                                                                        }`}>
                                                                        {g || '-'}
                                                                    </span>
                                                                </td>
                                                            );
                                                        }
                                                        if (col.key === 'total_marks' || col.key === 'max_marks') {
                                                            return (
                                                                <td key={col.key} className="px-1 py-1 text-center">
                                                                    <input
                                                                        type="number"
                                                                        value={student.total_marks ?? 100}
                                                                        onChange={(e) => updateMark(student.id, 'total_marks', e.target.value)}
                                                                        placeholder="100"
                                                                        disabled={Boolean(selectedAssignment?.is_locked)}
                                                                        className="w-14 h-7 text-xs px-1 py-0 border border-slate-300 rounded text-center font-bold focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                                                    />
                                                                </td>
                                                            );
                                                        }
                                                        if (col.key === 'percentage') {
                                                            const pct = student.marks_obtained !== null && student.marks_obtained !== ''
                                                                ? ((parseFloat(student.marks_obtained) / (parseFloat(student.total_marks) || 100)) * 100).toFixed(1)
                                                                : '-';
                                                            return (
                                                                <td key={col.key} className="px-1 py-1 text-center">
                                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                                                                        {pct !== '-' ? `${pct}%` : '-'}
                                                                    </span>
                                                                </td>
                                                            );
                                                        }
                                                        const getVal = (colKey) => {
                                                            return student[colKey] ?? student.custom_marks?.[colKey] ?? '';
                                                        };
                                                        const rawLockedCols = selectedAssignment?.locked_columns;
                                                        const lockedColsList = rawLockedCols
                                                            ? (typeof rawLockedCols === 'string' ? JSON.parse(rawLockedCols) : rawLockedCols)
                                                            : [];
                                                        const isColLocked = Boolean(selectedAssignment?.is_locked) || (Array.isArray(lockedColsList) && lockedColsList.includes(col.key));

                                                        return (
                                                            <td key={col.key} className="px-1 py-1 text-center">
                                                                <input
                                                                    type="text"
                                                                    value={getVal(col.key)}
                                                                    onChange={(e) => updateMark(student.id, col.key, e.target.value, col.isCustom)}
                                                                    placeholder="-"
                                                                    disabled={isColLocked}
                                                                    title={isColLocked ? '🔒 Column locked by Admin' : ''}
                                                                    className={`w-14 h-7 text-xs px-1 py-0 border rounded text-center focus:ring-1 focus:ring-blue-500 ${
                                                                        isColLocked
                                                                            ? 'bg-rose-50 border-rose-200 text-rose-700 cursor-not-allowed font-bold'
                                                                            : (col.key === 'marks_obtained' ? 'font-bold bg-blue-50 border-blue-300 text-blue-700' : 'bg-white')
                                                                    }`}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                    <td className={`px-1 py-1 text-center border-l ${rowBg}`}>
                                                        <button
                                                            onClick={() => toggleStudentPreview(student)}
                                                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                            title="View Marksheet Preview"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Bar Footer displaying column-wise entered stats */}
                        <div className="bg-[#1e1b4b] text-white py-1.5 px-3 text-xs font-bold flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-indigo-900">
                            {(() => {
                                const flattenedCols = getFlattenedCols().filter(col => col.key !== 'grade' && col.key !== 'percentage' && col.key !== 'remarks');
                                const getValForCol = (s, colKey) => {
                                    return s[colKey] ?? s.custom_marks?.[colKey] ?? null;
                                };

                                if (flattenedCols.length === 0) {
                                    const overallEntered = students.filter(s => s.marks_obtained !== null && s.marks_obtained !== undefined && String(s.marks_obtained).trim() !== '').length;
                                    return <span>Entered: <span className="text-emerald-400">{overallEntered}</span>/{students.length}</span>;
                                }

                                return (
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="text-indigo-200">Entered:</span>
                                        {flattenedCols.map(col => {
                                            const count = students.filter(s => {
                                                const v = getValForCol(s, col.key);
                                                return v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '-';
                                            }).length;
                                            return (
                                                <span key={col.key} className="bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                                                    {col.label}: <span className="text-emerald-400 font-bold">{count}</span>/{students.length}
                                                </span>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </Card>

                    <div className="flex items-center justify-between gap-2 flex-shrink-0 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={saveMarks}
                                disabled={saving || Boolean(selectedAssignment?.is_locked)}
                                className={`px-4 py-1.5 text-white rounded-md font-bold text-xs transition-all shadow-sm active:scale-95 ${
                                    selectedAssignment?.is_locked 
                                        ? 'bg-slate-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                                }`}
                            >
                                {saving ? 'Saving...' : selectedAssignment?.is_locked ? '🔒 Locked by Admin' : '💾 Save Marks'}
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-bold text-xs hover:bg-indigo-100 transition-all flex items-center gap-1.5 active:scale-95"
                                title="Download Subject Marks Report PDF"
                            >
                                <FileDown size={14} />
                                <span>Report PDF</span>
                            </button>
                        </div>
                        {saveSuccess && (
                            <span className="text-green-600 text-xs font-semibold animate-pulse">✅ Saved!</span>
                        )}
                    </div>
                </div>
            )}

            {/* Marksheet Preview Modal */}
            {previewingStudent && previewUrl && createPortal(
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[99999] p-4 md:p-8 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <FileText size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base leading-none">{previewingStudent.name}</h3>
                                    <p className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium">Marksheet Preview</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.download = `${previewingStudent.name}_marksheet.pdf`;
                                        link.click();
                                    }}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    Download
                                </button>
                                <button onClick={() => toggleStudentPreview(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <span className="text-lg font-bold">✕</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100 p-2 md:p-4 overflow-hidden">
                            <iframe
                                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full rounded-xl border border-slate-200 shadow-inner bg-white"
                                title="Marksheet Preview"
                            />
                        </div>
                        <div className="p-4 bg-white border-t flex justify-end gap-3">
                            <button onClick={() => toggleStudentPreview(null)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Close Preview</button>
                            <button
                                onClick={() => {
                                    const iframe = document.querySelector('iframe');
                                    iframe?.contentWindow?.print();
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                Print Marksheet
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default TeacherMarksEntry;