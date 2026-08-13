import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Eye, Download, CheckCircle, Lock, Unlock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../../productionLink/productionLink';
import { generateMarksheetPDF } from '../../utils/MarksheetGenerator';
import { downloadSubjectMarksReportPDF } from '../../utils/SubjectMarksReportGenerator';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>
);

const AdminMarksManagement = () => {
    const [activeTab, setActiveTab] = useState('assign');
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState([]);

    // Form state for assignment
    const [assignForm, setAssignForm] = useState({
        teacher_id: '', class: '', section: '', subject_id: ''
    });
    const [assignStreams, setAssignStreams] = useState([]);
    const [assignStream, setAssignStream] = useState('');

    // Review state
    const [reviewData, setReviewData] = useState(null);
    const [reviewClass, setReviewClass] = useState('');
    const [reviewSection, setReviewSection] = useState('');
    const [reviewStreams, setReviewStreams] = useState([]);
    const [reviewStream, setReviewStream] = useState('');
    const [reviewTemplate, setReviewTemplate] = useState(null);
    const [reviewSubjectId, setReviewSubjectId] = useState('all');
    const [reviewSearchStudent, setReviewSearchStudent] = useState('');
    const [previewStudentModal, setPreviewStudentModal] = useState(null);

    // Progress report modal state
    const [selectedProgressItem, setSelectedProgressItem] = useState(null);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressReportData, setProgressReportData] = useState(null);
    const [loadingProgressReport, setLoadingProgressReport] = useState(false);

    // Lock & Publish confirmation modal state
    const [confirmLockModal, setConfirmLockModal] = useState(null);
    const [confirmColumnLockModal, setConfirmColumnLockModal] = useState(null);
    const [togglingLock, setTogglingLock] = useState(false);
    const [confirmPublishModal, setConfirmPublishModal] = useState(null);
    const [togglingPublish, setTogglingPublish] = useState(false);

    // Helper: check if a class is higher secondary
    const isHigherSecondary = (className) => {
        if (!className) return false;
        const name = String(className).toUpperCase();
        return name.includes('XI') || name.includes('11') || name.includes('12');
    };

    // Template state
    const [marksheetTemplates, setMarksheetTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTeachers(),
                fetchClasses(),
                fetchSubjects(),
                fetchAssignments(),
                fetchProgress(),
                fetchMarksheetTemplates()
            ]);
            setLoading(false);
        };
        initData();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/teachers`, { headers });
            setTeachers(res.data.teachers || []);
        } catch (err) { console.error(err); }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/classes`, { headers });
            const classData = res.data.classes || [];
            const sortedClasses = [...classData].sort((a, b) => 
                (a.class_name || a.name || '').localeCompare(b.class_name || b.name || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setClasses(sortedClasses);
        } catch (err) { console.error(err); }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/subjects`, { headers });
            setSubjects(res.data.subjects || []);
        } catch (err) { console.error(err); }
    };

    const fetchMarksheetTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/marksheet-templates`, { headers });
            const tmpls = res.data.templates || [];
            setMarksheetTemplates(tmpls);
            const def = tmpls.find(t => t.is_default);
            if (def) setSelectedTemplateId(String(def.id));
        } catch (err) { console.error('Error fetching templates:', err); }
    };

    const fetchSections = async (classId, streamId = null) => {
        try {
            let url = `${API_URL}/api/admin/class-sections/${classId}`;
            if (streamId) url += `?stream_id=${streamId}`;
            const res = await axios.get(url, { headers });
            setSections(res.data.sections || []);
        } catch (err) { console.error(err); }
    };

    const fetchStreams = async (classId) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/class-streams/${classId}`, { headers });
            return res.data.streams || [];
        } catch (err) { console.error(err); return []; }
    };

    const fetchClassSubjects = async (classId) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/class-subjects/${classId}`, { headers });
            setSubjects(res.data.subjects || res.data.classSubjects || []);
        } catch (err) { console.error(err); }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/marks/admin/assignments/all`, { headers });
            setAssignments(res.data.assignments || []);
        } catch (err) { console.error(err); }
    };

    const fetchProgress = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/marks/admin/progress/all`, { headers });
            setProgress(res.data.progress || []);
        } catch (err) { console.error(err); }
    };

    const assignTeacher = async () => {
        if (!assignForm.teacher_id || !assignForm.class || !assignForm.subject_id) {
            return alert('Please select Class, Subject, and Teacher');
        }
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/marks/admin/assign-teacher`, assignForm, { headers });
            setAssignForm({ teacher_id: '', class: '', section: '', subject_id: '' });
            setAssignStream('');
            fetchAssignments();
            fetchProgress();
            alert('Teacher assigned successfully!');
        } catch (err) { 
            console.error(err); 
            alert(err.response?.data?.message || 'Error assigning teacher'); 
        }
        setSaving(false);
    };

    const deleteAssignment = async (id) => {
        if (!window.confirm('Remove this assignment?')) return;
        try {
            await axios.delete(`${API_URL}/api/marks/admin/assignments/${id}`, { headers });
            fetchAssignments();
            fetchProgress();
        } catch (err) { console.error(err); }
    };

    const requestToggleLock = (p, nextLockState) => {
        setConfirmLockModal({ item: p, nextLockState });
    };

    const executeToggleLock = async () => {
        if (!confirmLockModal) return;
        const { item: p, nextLockState: isLocked } = confirmLockModal;
        setTogglingLock(true);
        try {
            const res = await axios.post(`${API_URL}/api/marks/admin/toggle-lock`, {
                assignment_id: p.id,
                class: p.class,
                section: p.section,
                subject_id: p.subject_id,
                is_locked: isLocked
            }, { headers });
            if (res.data.success) {
                setProgress(prev => prev.map(item => {
                    const matchId = p.id && item.id === p.id;
                    const matchClass = item.class === p.class && item.section === p.section && String(item.subject_id) === String(p.subject_id);
                    if (matchId || matchClass) {
                        return { ...item, is_locked: isLocked ? 1 : 0 };
                    }
                    return item;
                }));
            }
        } catch (err) {
            console.error('Error toggling lock state:', err);
            alert(err.response?.data?.message || 'Failed to update lock state');
        } finally {
            setTogglingLock(false);
            setConfirmLockModal(null);
        }
    };

    const requestToggleColumnLock = (item, col, nextLockState) => {
        setConfirmColumnLockModal({ item, column: col, nextLockState });
    };

    const executeToggleColumnLock = async () => {
        if (!confirmColumnLockModal) return;
        const { item, column, nextLockState } = confirmColumnLockModal;
        setTogglingLock(true);
        try {
            const res = await axios.post(`${API_URL}/api/marks/admin/toggle-column-lock`, {
                assignment_id: item.id,
                class: item.class,
                section: item.section,
                subject_id: item.subject_id,
                column_key: column.key,
                is_locked: nextLockState
            }, { headers });

            if (res.data.success) {
                const updatedLockedCols = res.data.locked_columns || [];
                // Update selectedProgressItem state
                setSelectedProgressItem(prev => prev ? { ...prev, locked_columns: updatedLockedCols } : prev);
                // Update progress list state
                setProgress(prev => prev.map(p => {
                    const matchId = item.id && p.id === item.id;
                    const matchClass = p.class === item.class && p.section === item.section && String(p.subject_id) === String(item.subject_id);
                    if (matchId || matchClass) {
                        return { ...p, locked_columns: updatedLockedCols };
                    }
                    return p;
                }));
            }
        } catch (err) {
            console.error('Error toggling column lock state:', err);
            alert(err.response?.data?.message || 'Failed to update column lock state');
        } finally {
            setTogglingLock(false);
            setConfirmColumnLockModal(null);
        }
    };

    const requestTogglePublish = (item, nextPublishState) => {
        setConfirmPublishModal({ item, is_published: nextPublishState, isBulk: false });
    };

    const executeTogglePublish = async () => {
        if (!confirmPublishModal) return;
        const { item, is_published, isBulk, ids } = confirmPublishModal;
        setTogglingPublish(true);
        try {
            if (isBulk) {
                const res = await axios.post(`${API_URL}/api/marks/admin/bulk-publish`, {
                    assignment_ids: ids,
                    is_published,
                    class: reviewClass,
                    section: reviewSection
                }, { headers });
                if (res.data.success) {
                    setProgress(prev => prev.map(p => {
                        const matchClass = !reviewClass || (p.class === reviewClass && (!reviewSection || reviewSection === 'All' || p.section === reviewSection));
                        if (ids && ids.length > 0 ? ids.includes(p.id) : matchClass) {
                            return { ...p, is_published: is_published ? 1 : 0 };
                        }
                        return p;
                    }));
                }
            } else {
                const res = await axios.post(`${API_URL}/api/marks/admin/toggle-publish`, {
                    assignment_id: item.id,
                    class: item.class,
                    section: item.section,
                    subject_id: item.subject_id,
                    is_published
                }, { headers });
                if (res.data.success) {
                    setProgress(prev => prev.map(p => {
                        const matchId = item.id && p.id === item.id;
                        const matchClass = p.class === item.class && p.section === item.section && String(p.subject_id) === String(item.subject_id);
                        if (matchId || matchClass) {
                            return { ...p, is_published: is_published ? 1 : 0 };
                        }
                        return p;
                    }));
                }
            }
        } catch (err) {
            console.error('Error toggling publish state:', err);
            alert(err.response?.data?.message || 'Failed to update publish state');
        } finally {
            setTogglingPublish(false);
            setConfirmPublishModal(null);
        }
    };

    const fetchClassMarks = async () => {
        if (!reviewClass) return alert('Select a class');
        try {
            const res = await axios.get(
                `${API_URL}/api/marks/admin/class-marks/all/${reviewClass}/${reviewSection || 'All'}`,
                { headers }
            );
            setReviewData(res.data);
            if (res.data.template) {
                setReviewTemplate(res.data.template);
            } else {
                try {
                    const tmplRes = await axios.get(
                        `${API_URL}/api/marksheet-templates/active/${reviewClass}/${reviewSection || 'All'}`,
                        { headers }
                    );
                    setReviewTemplate(tmplRes.data.template || null);
                } catch (e) {
                    setReviewTemplate(null);
                }
            }
        } catch (err) { console.error(err); alert('Error loading marks data'); }
    };

    const getDynamicColumns = (overrideTemplate = null, marksList = null) => {
        const tmpl = overrideTemplate || reviewTemplate;
        const targetMarks = marksList || reviewData?.marks;

        // 1. Build a comprehensive lookup map of key -> label from ALL available templates
        const labelMap = {};
        const templatesToInspect = [
            ...(marksheetTemplates || []),
            ...(reviewData?.template ? [reviewData.template] : []),
            ...(tmpl ? [tmpl] : [])
        ];

        templatesToInspect.forEach(t => {
            const c = t?.config || t;
            if (c) {
                (c.customColumns || []).forEach(col => {
                    if (col.key && col.label) {
                        labelMap[col.key] = col.label;
                    }
                });
                if (c.marksColumns) {
                    Object.entries(c.marksColumns).forEach(([k, v]) => {
                        if (v && v.label) {
                            labelMap[k === 'max_marks' ? 'total_marks' : k] = v.label;
                        }
                    });
                }
            }
        });

        // 2. Check if custom_marks keys exist in the actual marks list
        const foundKeys = new Set();
        (targetMarks || []).forEach(m => {
            if (m.custom_marks) {
                try {
                    const cm = typeof m.custom_marks === 'string' ? JSON.parse(m.custom_marks) : m.custom_marks;
                    if (cm && typeof cm === 'object') {
                        Object.keys(cm).forEach(k => foundKeys.add(k));
                    }
                } catch (e) {}
            }
        });

        if (foundKeys.size > 0) {
            return Array.from(foundKeys).map(k => {
                const label = labelMap[k] || (k.startsWith('custom_') ? (k.replace(/^custom_\d+/, '').replace(/^custom_/, '').replace(/_/g, ' ') || k) : k);
                return { key: k, label: label || k };
            });
        }

        // 3. Fallback to template config columns if no custom_marks JSON keys found
        if (tmpl && tmpl.config) {
            const c = tmpl.config;
            const isSubjectCol = (key, label) => {
                const k = (key || '').toLowerCase();
                const l = (label || '').toLowerCase();
                return k === 'subject' || k === 'subject_name' || l === 'subject' || l === 'subject name';
            };
            const custom = (c.customColumns || []).filter(v => v.enabled && !isSubjectCol(v.key, v.label)).map(v => ({ key: v.key, label: v.label || v.key }));
            const builtIn = Object.entries(c.marksColumns || {})
                .filter(([k, v]) => v.enabled && !isSubjectCol(k, v.label))
                .map(([k, v]) => ({ key: k === 'max_marks' ? 'total_marks' : k, label: v.label }));

            const all = [...custom, ...builtIn];
            if (all.length > 0) return all;
        }

        // 4. Default fallback
        return [
            { key: 'total_marks', label: 'Max Marks' },
            { key: 'marks_obtained', label: 'Marks Obtained' },
            { key: 'grade', label: 'Grade' }
        ];
    };

    const handleViewProgressReport = async (item) => {
        setSelectedProgressItem(item);
        setShowProgressModal(true);
        setLoadingProgressReport(true);
        setProgressReportData(null);

        try {
            const cls = item.class;
            const sec = item.section || 'All';
            const term = item.exam_term_id || 'all';

            const res = await axios.get(`${API_URL}/api/marks/admin/class-marks/${term}/${cls}/${sec}`, { headers });
            setProgressReportData(res.data);
        } catch (err) {
            console.error('Error fetching teacher progress report:', err);
        }
        setLoadingProgressReport(false);
    };

    const getGroupedColsFromTemplate = (tmpl) => {
        if (!tmpl || !tmpl.config) return [];
        const c = tmpl.config;
        const columnGroups = c.columnGroups || [];

        const isSubjectCol = (key, label) => {
            const k = (key || '').toLowerCase();
            const l = (label || '').toLowerCase();
            return k === 'subject' || k === 'subject_name' || l === 'subject' || l === 'subject name';
        };

        const builtIn = Object.entries(c.marksColumns || {})
            .filter(([k, v]) => v.enabled && !isSubjectCol(k, v.label))
            .map(([k, v]) => ({
                key: k === 'max_marks' ? 'total_marks' : k,
                label: v.label,
                order: v.order || 0,
                groupName: null,
                isCustom: false
            }));

        const custom = (c.customColumns || [])
            .filter(v => v.enabled && !isSubjectCol(v.key, v.label))
            .map(v => ({
                key: v.key,
                label: v.label,
                order: v.order || 0,
                groupName: columnGroups.find(g => g.id === v.group)?.name || null,
                isCustom: true
            }));

        const allColsRaw = [...builtIn, ...custom].sort((a, b) => a.order - b.order);
        if (allColsRaw.length === 0) return [];

        const grouped = [];
        const seenGroupNames = new Set();
        const processedKeys = new Set();

        allColsRaw.forEach(col => {
            if (processedKeys.has(col.key)) return;

            if (col.groupName) {
                if (!seenGroupNames.has(col.groupName)) {
                    seenGroupNames.add(col.groupName);
                    const nameMembers = allColsRaw.filter(c => c.groupName === col.groupName);
                    grouped.push({
                        id: `group_${col.groupName}`,
                        name: col.groupName,
                        cols: nameMembers
                    });
                    nameMembers.forEach(m => processedKeys.add(m.key));
                }
            } else {
                grouped.push({
                    id: `unassigned_${col.key}`,
                    name: null,
                    cols: [col]
                });
                processedKeys.add(col.key);
            }
        });

        return grouped;
    };

    const downloadTeacherProgressReportPDF = () => {
        if (!selectedProgressItem || !progressReportData) return;

        const targetSubjId = selectedProgressItem.subject_id;
        const rawStudents = progressReportData.students || [];
        const rawMarks = progressReportData.marks || [];
        const tmpl = progressReportData.template || reviewTemplate;

        const sortedStudents = [...rawStudents].sort((a, b) => {
            const rA = parseInt(a.roll_number || a.roll_no || '0', 10);
            const rB = parseInt(b.roll_number || b.roll_no || '0', 10);
            if (!isNaN(rA) && !isNaN(rB) && rA !== rB) return rA - rB;
            return String(a.roll_number || a.roll_no || '').localeCompare(String(b.roll_number || b.roll_no || ''));
        });

        const formattedStudents = sortedStudents.map(st => {
            const m = rawMarks.find(mark => String(mark.student_id) === String(st.id) && String(mark.subject_id) === String(targetSubjId));
            let customMarksObj = {};
            if (m && m.custom_marks) {
                try {
                    customMarksObj = typeof m.custom_marks === 'string' ? JSON.parse(m.custom_marks) : m.custom_marks;
                } catch (e) {}
            }
            return {
                ...st,
                roll_number: st.roll_number || '-',
                name: st.name || '-',
                marks_obtained: m?.marks_obtained ?? null,
                total_marks: m?.total_marks ?? 100,
                grade: m?.grade ?? null,
                remarks: m?.remarks ?? '',
                theory_marks: m?.theory_marks ?? '',
                practical_marks: m?.practical_marks ?? '',
                internal_marks: m?.internal_marks ?? '',
                external_marks: m?.external_marks ?? '',
                custom_marks: customMarksObj
            };
        });

        const groupedCols = getGroupedColsFromTemplate(tmpl);
        const dynamicCols = getDynamicColumns(tmpl, rawMarks);

        downloadSubjectMarksReportPDF({
            assignment: {
                subject_name: selectedProgressItem.subject_name,
                class: selectedProgressItem.class,
                section: selectedProgressItem.section,
                term_name: selectedProgressItem.term_name || selectedProgressItem.exam_term_name || progressReportData?.term?.name || progressReportData?.term?.term_name || '',
                academic_year: selectedProgressItem.academic_year || progressReportData?.term?.academic_year || ''
            },
            teacherName: selectedProgressItem.teacher_name,
            students: formattedStudents,
            groupedCols: groupedCols,
            columns: dynamicCols,
            schoolName: progressReportData?.school?.name || reviewData?.school?.name || localStorage.getItem('schoolName') || 'School Name',
            schoolAddress: progressReportData?.school?.address || localStorage.getItem('schoolAddress') || ''
        });
    };

    const jumpToReviewAndFinalize = (item) => {
        setShowProgressModal(false);
        setActiveTab('review');
        setReviewClass(item.class);
        setReviewSection(item.section || '');
        setReviewSubjectId(String(item.subject_id));

        const cls = item.class;
        const sec = item.section || 'All';
        const term = item.exam_term_id || 'all';
        axios.get(`${API_URL}/api/marks/admin/class-marks/${term}/${cls}/${sec}`, { headers })
            .then(res => {
                setReviewData(res.data);
            })
            .catch(err => console.error(err));
    };

    const finalizeMarks = async () => {
        if (!window.confirm('Finalize marks for this class? Students will be able to view and download their marksheets.')) return;
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/marks/admin/finalize-marks`, {
                exam_term_id: 'all',
                className: reviewClass,
                section: reviewSection
            }, { headers });
            alert('Marks finalized successfully!');
            fetchProgress();
            fetchClassMarks();
        } catch (err) { console.error(err); alert('Error finalizing'); }
        setSaving(false);
    };

    const [schoolLogoBase64, setSchoolLogoBase64] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
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
            reader.onloadend = () => {
                setSchoolLogoBase64(reader.result);
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error('Error fetching school logo:', err);
        }
    };

    const getActiveTemplateConfig = () => {
        return reviewTemplate?.config || {
            designType: 'classic',
            header: { showLogo: true, schoolNameFontSize: 20, showAddress: true, showPhone: false, showEmail: false, title: 'MARKSHEET', titleFontSize: 16, showTermInfo: true },
            studentFields: {
                name: { enabled: true, label: 'Student Name' }, roll_number: { enabled: true, label: 'Roll Number' },
                class: { enabled: true, label: 'Class' }, father_name: { enabled: true, label: "Father's Name" },
            },
            marksColumns: {
                subject: { enabled: true, label: 'Subject', order: 1 },
                max_marks: { enabled: true, label: 'Max Marks', order: 2 },
                marks_obtained: { enabled: true, label: 'Marks Obtained', order: 3 },
                grade: { enabled: false, label: 'Grade', order: 4 },
            },
            customColumns: [],
            columnGroups: [],
            summary: { showTotal: true, showPercentage: false, showResult: false, showGrade: false, passingPercentage: 33 },
            footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Principal'], footerText: 'This is a computer generated marksheet.' },
            styling: { primaryColor: '#191970', headerBgColor: '#191970', headerTextColor: '#FFFFFF', tableHeaderBg: '#191970', tableHeaderText: '#FFFFFF', evenRowBg: '#F0F0FF', oddRowBg: '#FFFFFF', borderColor: '#CBD5E1', fontFamily: 'helvetica', showBorder: true, borderStyle: 'full' },
            page: { orientation: 'portrait', size: 'a4', marginTop: 15, marginBottom: 15, marginLeft: 20, marginRight: 20 },
        };
    };

    const buildMarksheetData = (student) => {
        const studentMarks = (reviewData?.marks || []).filter(m => String(m.student_id) === String(student.id));
        return {
            school: {
                name: reviewData?.school?.name || 'Demo school',
                address: reviewData?.school?.address || '123 Main Street, City',
                phone: reviewData?.school?.phone || '',
                email: reviewData?.school?.email || ''
            },
            term: {
                term_name: reviewData?.term?.name || 'Mid-Term Exam 2025-26',
                academic_year: '2025-26'
            },
            student: {
                name: student.name,
                roll_number: student.roll_number || '-',
                class: `${reviewClass} ${reviewSection ? `- ${reviewSection}` : ''}`,
                father_name: student.father_name || 'Mr. Rajesh Sharma',
                mother_name: student.mother_name || '-',
                dob: student.dob || '-',
                admission_no: student.admission_no || '-'
            },
            subjects: (reviewData?.subjects || []).map(sub => {
                const mark = studentMarks.find(m => String(m.subject_id) === String(sub.subject_id));
                let customMarksObj = {};
                if (mark?.custom_marks) {
                    try {
                        customMarksObj = typeof mark.custom_marks === 'string' ? JSON.parse(mark.custom_marks) : mark.custom_marks;
                    } catch (e) {}
                }
                
                let marksObtained = '-';
                if (mark) {
                    if (mark.marks_obtained !== null && mark.marks_obtained !== undefined && mark.marks_obtained !== '') {
                        marksObtained = mark.marks_obtained;
                    } else {
                        let sum = 0; let found = false;
                        ['theory_marks', 'practical_marks', 'internal_marks', 'external_marks'].forEach(f => {
                            if (mark[f] != null && mark[f] !== '') {
                                const v = parseFloat(mark[f]);
                                if (!isNaN(v)) { sum += v; found = true; }
                            }
                        });

                        // Check customMarksObj for total key or sum of components
                        if (!found && customMarksObj && typeof customMarksObj === 'object') {
                            const keys = Object.keys(customMarksObj);
                            const totalKey = keys.find(k => k.toLowerCase().includes('total'));
                            if (totalKey && customMarksObj[totalKey] != null && customMarksObj[totalKey] !== '') {
                                const v = parseFloat(customMarksObj[totalKey]);
                                if (!isNaN(v)) { sum = v; found = true; }
                            }
                            if (!found) {
                                keys.forEach(k => {
                                    const v = parseFloat(customMarksObj[k]);
                                    if (!isNaN(v)) { sum += v; found = true; }
                                });
                            }
                        }

                        if (found) marksObtained = sum;
                    }
                }

                // Determine subject max total marks from template or custom columns
                let totalMax = parseFloat(mark?.total_marks);
                if (isNaN(totalMax) || totalMax <= 0) {
                    const cfg = reviewTemplate?.config;
                    if (cfg?.customColumns?.length) {
                        let cfgMaxSum = 0;
                        cfg.customColumns.forEach(cc => {
                            if (cc.enabled) {
                                const match = cc.label?.match(/\((\d+)\)/);
                                if (match && match[1]) {
                                    cfgMaxSum += parseFloat(match[1]);
                                }
                            }
                        });
                        if (cfgMaxSum > 0) totalMax = cfgMaxSum;
                    }
                    if (isNaN(totalMax) || totalMax <= 0) totalMax = 100;
                }

                return {
                    subject_name: sub.subject_name,
                    total_marks: totalMax,
                    marks_obtained: marksObtained,
                    grade: mark?.grade || '-',
                    theory_marks: mark?.theory_marks,
                    practical_marks: mark?.practical_marks,
                    internal_marks: mark?.internal_marks,
                    external_marks: mark?.external_marks,
                    ...customMarksObj
                };
            })
        };
    };

    const generatePDF = (student) => {
        if (!reviewData) return;
        const cfg = getActiveTemplateConfig();
        const data = buildMarksheetData(student);
        const doc = generateMarksheetPDF(cfg, data, schoolLogoBase64);
        doc.save(`Marksheet-${student.name}.pdf`);
    };

    const openPreviewModal = (student) => {
        if (!student || !reviewData) return;
        setPreviewStudentModal(student);
        const cfg = getActiveTemplateConfig();
        const data = buildMarksheetData(student);
        const doc = generateMarksheetPDF(cfg, data, schoolLogoBase64);
        const url = doc.output('bloburl');
        setPreviewUrl(url);
    };

    const generateAllPDFs = () => {
        if (!reviewData?.students?.length) return;
        reviewData.students.forEach(student => {
            generatePDF(student);
        });
    };

    const handleClassChange = async (classValue) => {
        setAssignForm({ ...assignForm, class: classValue, section: '', subject_id: '' });
        setAssignStream('');
        setAssignStreams([]);
        const classObj = classes.find(c => String(c.class_name || c.name) === classValue || String(c.id) === classValue);
        if (classObj) {
            fetchClassSubjects(classObj.id);
            if (isHigherSecondary(classValue)) {
                const streams = await fetchStreams(classObj.id);
                setAssignStreams(streams);
                setSections([]);
            } else {
                fetchSections(classObj.id);
            }
        }
    };

    const handleAssignStreamChange = (streamId) => {
        setAssignStream(streamId);
        setAssignForm({ ...assignForm, section: '' });
        const classObj = classes.find(c => String(c.class_name || c.name) === assignForm.class || String(c.id) === assignForm.class);
        if (classObj && streamId) {
            fetchSections(classObj.id, streamId);
        } else {
            setSections([]);
        }
    };

    const handleReviewClassChange = async (classValue) => {
        setReviewClass(classValue);
        setReviewSection('');
        setReviewStream('');
        setReviewStreams([]);
        setReviewData(null);
        const classObj = classes.find(c => String(c.class_name || c.name) === classValue || String(c.id) === classValue);
        if (classObj) {
            if (isHigherSecondary(classValue)) {
                const streams = await fetchStreams(classObj.id);
                setReviewStreams(streams);
                setSections([]);
            } else {
                fetchSections(classObj.id);
            }
        } else {
            setSections([]);
        }
    };

    const handleReviewStreamChange = (streamId) => {
        setReviewStream(streamId);
        setReviewSection('');
        const classObj = classes.find(c => String(c.class_name || c.name) === reviewClass || String(c.id) === reviewClass);
        if (classObj && streamId) {
            fetchSections(classObj.id, streamId);
        } else {
            setSections([]);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading marks management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">📝 Marks Management</h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">Assign teachers to classes & subjects, track entry progress, and finalize marks</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'assign', label: '👨‍🏫 Assign Teachers', color: 'green' },
                    { id: 'review', label: '✅ Review & Finalize', color: 'green' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${activeTab === tab.id
                            ? `bg-${tab.color}-600 text-white shadow-md`
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB: Assign Teachers */}
            {activeTab === 'assign' && (
                <div className="space-y-3">
                    <Card className="p-3.5 sm:p-4">
                        <h2 className="text-base font-bold text-slate-800 mb-2">👨‍🏫 Assign Teacher to Class & Subject</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                                <select
                                    value={assignForm.class}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c, idx) => (
                                        <option key={`c_assign_${c.id || c.class_name || c.name}_${idx}`} value={c.class_name || c.name}>{c.class_name || c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {isHigherSecondary(assignForm.class) && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Group *</label>
                                    <select
                                        value={assignStream}
                                        onChange={(e) => handleAssignStreamChange(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select Group</option>
                                        {assignStreams.map((s, idx) => (
                                            <option key={`stream_assign_${s.id || s.name}_${idx}`} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                                <select
                                    value={assignForm.section}
                                    onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                                    disabled={isHigherSecondary(assignForm.class) && !assignStream}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((s, idx) => (
                                        <option key={`sec_assign_${s.id || s.section_name || s.name}_${idx}`} value={s.section_name || s.name}>{s.section_name || s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                                <select
                                    value={assignForm.subject_id}
                                    onChange={(e) => setAssignForm({ ...assignForm, subject_id: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((s, idx) => (
                                        <option key={`subj_assign_${s.id || s.subject_id}_${idx}`} value={s.id || s.subject_id}>{s.name || s.subject_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher *</label>
                                <select
                                    value={assignForm.teacher_id}
                                    onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map((t, idx) => (
                                        <option key={`teacher_assign_${t.id}_${idx}`} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-3">
                            <button
                                onClick={assignTeacher}
                                disabled={saving}
                                className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                            >
                                {saving ? 'Assigning...' : '✓ Assign Teacher'}
                            </button>
                        </div>
                    </Card>

                    <Card className="p-3.5 sm:p-4">
                        <h2 className="text-base font-bold text-slate-800 mb-2">Current Teacher Assignments</h2>
                        {assignments.length === 0 ? (
                            <p className="text-slate-400 text-xs text-center py-4">No teacher assignments yet. Use the form above to assign a teacher to a class & subject.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b">
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Class</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Section / Group</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Subject</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Assigned Teacher</th>
                                            <th className="px-3 py-2 text-center font-semibold text-slate-600">Status</th>
                                            <th className="px-3 py-2 text-center font-semibold text-slate-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map(a => (
                                            <tr key={a.id} className="border-b hover:bg-slate-50">
                                                <td className="px-3 py-2 text-slate-700 font-medium">{a.class}</td>
                                                <td className="px-3 py-2 text-slate-700">{a.section || '-'}</td>
                                                <td className="px-3 py-2 text-slate-700 font-bold text-indigo-700">{a.subject_name}</td>
                                                <td className="px-3 py-2 text-slate-700 font-semibold">{a.teacher_name}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${a.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {a.is_completed ? '✅ Done' : '⏳ Pending Marks'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <button onClick={() => deleteAssignment(a.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* TAB: Review & Finalize */}
            {activeTab === 'review' && (
                <div className="space-y-3">
                    <Card className="p-3.5 sm:p-4">
                        <h2 className="text-base font-bold text-slate-800 mb-2">Review & Finalize Marks</h2>
                        <div className="flex gap-3 items-end flex-wrap">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                                <select
                                    value={reviewClass}
                                    onChange={(e) => handleReviewClassChange(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 min-w-[130px]"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c, idx) => (
                                        <option key={`c_review_${c.id || c.class_name || c.name}_${idx}`} value={c.class_name || c.name}>{c.class_name || c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {isHigherSecondary(reviewClass) && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Group *</label>
                                    <select
                                        value={reviewStream}
                                        onChange={(e) => handleReviewStreamChange(e.target.value)}
                                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs min-w-[130px]"
                                    >
                                        <option value="">Select Group</option>
                                        {reviewStreams.map((s, idx) => (
                                            <option key={`stream_review_${s.id || s.name}_${idx}`} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                                <select
                                    value={reviewSection}
                                    onChange={(e) => setReviewSection(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs min-w-[120px]"
                                    disabled={isHigherSecondary(reviewClass) && !reviewStream}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((s, idx) => (
                                        <option key={`sec_review_${s.id || s.section_name || s.name}_${idx}`} value={s.section_name || s.name}>{s.section_name || s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={fetchClassMarks}
                                className="px-5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                📊 Load Marks
                            </button>
                        </div>
                    </Card>

                    {/* Marks Entry Progress by Assigned Teachers Card */}
                    {(() => {
                        const filteredProgress = progress.filter(p => {
                            if (!reviewClass) return true;
                            const matchClass = String(p.class).replace(/^Class\s+/i, '').trim().toLowerCase() === String(reviewClass).replace(/^Class\s+/i, '').trim().toLowerCase();
                            if (!matchClass) return false;
                            if (reviewSection && reviewSection !== 'All') {
                                const matchSec = String(p.section || '').replace(/^Section\s+/i, '').trim().toLowerCase() === String(reviewSection).replace(/^Section\s+/i, '').trim().toLowerCase();
                                return matchSec;
                            }
                            return true;
                        });

                        return (
                            <Card className="p-3.5 sm:p-4 border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <span className="p-1 bg-indigo-50 text-indigo-600 rounded text-xs">📊</span>
                                            Marks Entry Progress by Assigned Teachers
                                        </h3>
                                        {reviewClass && (
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                Class: <span className="font-bold text-slate-700">{reviewClass}</span>
                                                {reviewSection ? ` • Sec ${reviewSection}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {filteredProgress.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => {
                                                    const filteredIds = filteredProgress.map(p => p.id).filter(Boolean);
                                                    setConfirmPublishModal({ is_published: true, isBulk: true, ids: filteredIds });
                                                }}
                                                title="Publish all displayed marks entries so students & parents can view them"
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                            >
                                                📢 Publish All
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const filteredIds = filteredProgress.map(p => p.id).filter(Boolean);
                                                    setConfirmPublishModal({ is_published: false, isBulk: true, ids: filteredIds });
                                                }}
                                                title="Unpublish all displayed marks entries (hide from students & parents)"
                                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                            >
                                                🚫 Unpublish All
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {filteredProgress.length === 0 ? (
                                    <p className="text-slate-400 text-xs text-center py-4">No teacher progress records found for this selection.</p>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="min-w-full text-xs md:text-sm">
                                            <thead>
                                                <tr className="bg-slate-100 border-b text-slate-700 font-bold">
                                                    <th className="px-4 py-2.5 text-left">Class</th>
                                                    <th className="px-4 py-2.5 text-left">Section</th>
                                                    <th className="px-4 py-2.5 text-left">Subject</th>
                                                    <th className="px-4 py-2.5 text-left">Teacher</th>
                                                    <th className="px-4 py-2.5 text-center">Marks Entered Count</th>
                                                    <th className="px-4 py-2.5 text-center">Status</th>
                                                    <th className="px-4 py-2.5 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredProgress.map((p, i) => (
                                                    <tr key={`rev_p_${i}`} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-2.5 text-slate-700 font-semibold">{p.class}</td>
                                                        <td className="px-4 py-2.5 text-slate-700">{p.section || '-'}</td>
                                                        <td className="px-4 py-2.5 text-slate-700 font-bold text-indigo-700">{p.subject_name}</td>
                                                        <td className="px-4 py-2.5 text-slate-700 font-semibold">{p.teacher_name}</td>
                                                        <td className="px-4 py-2.5 text-center text-slate-600 font-bold">{p.marks_entered}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className={`px-2.5 py-0.5 text-[11px] rounded-full font-bold ${p.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {p.is_completed ? '✅ Completed' : '⏳ Pending'}
                                                                </span>
                                                                <span className={`px-2 py-0.5 text-[10px] rounded-md font-extrabold ${p.is_published ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                                    {p.is_published ? '📢 Published' : '📝 Unpublished'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center">
                                                             <div className="flex items-center justify-center gap-2">
                                                                 <button
                                                                     onClick={() => handleViewProgressReport(p)}
                                                                     title="View Teacher Marks Report"
                                                                     className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                                                 >
                                                                     <Eye className="w-3.5 h-3.5" /> View Marks
                                                                 </button>
                                                                 {p.is_published ? (
                                                                     <button
                                                                         onClick={() => requestTogglePublish(p, false)}
                                                                         title="Unpublish Marks (Hide from student/parent dashboard)"
                                                                         className="px-2.5 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                                                     >
                                                                         🚫 Unpublish
                                                                     </button>
                                                                 ) : (
                                                                     <button
                                                                         onClick={() => requestTogglePublish(p, true)}
                                                                         title="Publish Marks (Make visible to student/parent dashboard)"
                                                                         className="px-2.5 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                                                     >
                                                                         📢 Publish
                                                                     </button>
                                                                 )}
                                                             </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        );
                    })()}
                </div>
            )}
            {/* Marksheet Preview Modal */}
            {previewStudentModal && reviewData && createPortal(
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[99999] p-4 md:p-8 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
                        {/* Modal Top Header */}
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-white/10 rounded-lg text-blue-400 font-bold text-sm">📄</span>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base leading-none">{previewStudentModal.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Marksheet Preview ({reviewTemplate?.name || 'Active Template'})</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => generatePDF(previewStudentModal)}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download PDF
                                </button>
                                <button
                                    onClick={() => {
                                        const iframe = document.querySelector('iframe');
                                        iframe?.contentWindow?.print();
                                    }}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
                                >
                                    🖨️ Print
                                </button>
                                <button
                                    onClick={() => setPreviewStudentModal(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors text-base font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Marksheet Document Dynamic Canvas Body */}
                        <div className="flex-1 bg-slate-100 p-2 md:p-4 overflow-hidden">
                            {previewUrl ? (
                                <iframe
                                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full rounded-xl border border-slate-200 shadow-inner bg-white"
                                    title="Marksheet Live Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 font-semibold text-sm">
                                    Loading Marksheet Preview...
                                </div>
                            )}
                        </div>

                        {/* Modal Bottom Footer */}
                        <div className="p-4 bg-white border-t flex justify-end gap-3">
                            <button
                                onClick={() => setPreviewStudentModal(null)}
                                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Teacher Marks Entry Report Modal */}
            {showProgressModal && selectedProgressItem && createPortal(
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[99999] p-4 md:p-8 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
                        {/* Modal Top Header */}
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 font-bold text-sm">📊</span>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base leading-none">
                                        Teacher Marks Report - {selectedProgressItem.teacher_name}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">
                                        {selectedProgressItem.subject_name} • {selectedProgressItem.class} {selectedProgressItem.section ? `- ${selectedProgressItem.section}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={downloadTeacherProgressReportPDF}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download PDF Report
                                </button>
                                <button
                                    onClick={() => jumpToReviewAndFinalize(selectedProgressItem)}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    🚀 Open in Review & Finalize
                                </button>
                                <button
                                    onClick={() => setShowProgressModal(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors text-base font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body Table */}
                        <div className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto">
                            {loadingProgressReport ? (
                                <div className="py-16 text-center text-slate-500 font-bold text-sm">
                                    <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Loading Teacher Marks Entry Report...
                                </div>
                            ) : progressReportData ? (
                                <div className="space-y-4">
                                    {/* Stats Banner */}
                                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-3">
                                        <div className="flex items-center gap-2 text-xs md:text-sm">
                                            <span className="font-bold text-slate-600">Assigned Teacher:</span>
                                            <span className="font-black text-indigo-900">{selectedProgressItem.teacher_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs md:text-sm">
                                            <span className="font-bold text-slate-600">Marks Entered Count:</span>
                                            <span className="font-black text-slate-800">{selectedProgressItem.marks_entered} Students</span>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 text-xs rounded-full font-bold ${selectedProgressItem.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {selectedProgressItem.is_completed ? '✅ Entry Completed' : '⏳ Entry Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    {(() => {
                                        const rawStudents = progressReportData.students || [];
                                        const students = [...rawStudents].sort((a, b) => {
                                            const rA = parseInt(a.roll_number || a.roll_no || '0', 10);
                                            const rB = parseInt(b.roll_number || b.roll_no || '0', 10);
                                            if (!isNaN(rA) && !isNaN(rB) && rA !== rB) return rA - rB;
                                            return String(a.roll_number || a.roll_no || '').localeCompare(String(b.roll_number || b.roll_no || ''));
                                        });
                                        const marks = progressReportData.marks || [];
                                        const targetSubjId = selectedProgressItem.subject_id;
                                        const dynamicCols = getDynamicColumns(progressReportData.template || reviewTemplate, progressReportData.marks);

                                        return (
                                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-xs md:text-sm">
                                                        <thead>
                                                            <tr className="bg-[#1e1b4b] text-white font-bold text-center">
                                                                <th className="py-3 px-3 text-center border-r border-white/20 w-16">Roll</th>
                                                                <th className="py-3 px-4 text-left border-r border-white/20">Student Name</th>
                                                                {dynamicCols.map((col, idx) => {
                                                                    const rawLocked = selectedProgressItem?.locked_columns;
                                                                    const lockedCols = rawLocked
                                                                        ? (typeof rawLocked === 'string' ? JSON.parse(rawLocked) : rawLocked)
                                                                        : [];
                                                                    const isColLocked = Array.isArray(lockedCols) && lockedCols.includes(col.key);

                                                                    return (
                                                                        <th key={`pcol_${col.key}_${idx}`} className="py-2.5 px-3 border-r border-white/20 text-center align-middle">
                                                                            <div className="flex flex-col items-center justify-center gap-1.5 min-w-[120px]">
                                                                                <span className="font-bold text-white text-xs">{col.label}</span>
                                                                                <button
                                                                                    onClick={() => requestToggleColumnLock(selectedProgressItem, col, !isColLocked)}
                                                                                    title={isColLocked ? `Click to Unlock ${col.label} Entry` : `Click to Lock ${col.label} Entry`}
                                                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                                                                                        isColLocked
                                                                                            ? 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-400'
                                                                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400'
                                                                                    }`}
                                                                                >
                                                                                    {isColLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                                                                    {isColLocked ? 'Locked' : 'Unlocked'}
                                                                                </button>
                                                                            </div>
                                                                        </th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {students.map((st, sIdx) => {
                                                                const mark = marks.find(m => String(m.student_id) === String(st.id) && String(m.subject_id) === String(targetSubjId));

                                                                return (
                                                                    <tr key={`pst_${st.id}_${sIdx}`} className={`border-b border-slate-100 ${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                                        <td className="py-2.5 px-3 text-center font-bold text-slate-600">{st.roll_number || '-'}</td>
                                                                        <td className="py-2.5 px-4 font-bold text-slate-800">{st.name}</td>
                                                                        {dynamicCols.map((col, cIdx) => {
                                                                            let val = '-';
                                                                            if (mark) {
                                                                                if (col.key === 'marks_obtained' && mark.marks_obtained != null) val = mark.marks_obtained;
                                                                                else if ((col.key === 'total_marks' || col.key === 'max_marks') && mark.total_marks != null) val = mark.total_marks;
                                                                                else if (col.key === 'grade' && mark.grade) val = mark.grade;
                                                                                else if (mark[col.key] != null) val = mark[col.key];
                                                                                else if (mark.custom_marks) {
                                                                                    try {
                                                                                        const cm = typeof mark.custom_marks === 'string' ? JSON.parse(mark.custom_marks) : mark.custom_marks;
                                                                                        if (cm && cm[col.key] !== undefined && cm[col.key] !== null) val = cm[col.key];
                                                                                    } catch (e) {}
                                                                                }
                                                                            }

                                                                            return (
                                                                                <td key={`pcell_${st.id}_${col.key}_${cIdx}`} className="py-2.5 px-4 text-center font-semibold text-slate-700">
                                                                                    <span className="inline-block bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-800 font-bold min-w-[50px]">
                                                                                        {val !== null && val !== undefined ? val : '-'}
                                                                                    </span>
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <p className="text-center text-slate-400 py-12">No report data found for this teacher entry.</p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white border-t flex justify-end gap-3">
                            <button
                                onClick={downloadTeacherProgressReportPDF}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md active:scale-95"
                            >
                                <Download className="w-4 h-4" /> Download Marks Report PDF
                            </button>
                            <button
                                onClick={() => setShowProgressModal(false)}
                                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Lock / Unlock Confirmation Modal */}
            {confirmLockModal && createPortal(
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                confirmLockModal.nextLockState ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                {confirmLockModal.nextLockState ? '🔒' : '🔓'}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {confirmLockModal.nextLockState ? 'Lock Marks Entry?' : 'Unlock Marks Entry?'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {confirmLockModal.item.class} {confirmLockModal.item.section ? `• Section ${confirmLockModal.item.section}` : ''} • <span className="font-bold text-indigo-700">{confirmLockModal.item.subject_name}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 text-xs text-slate-600 space-y-2">
                            <p className="font-semibold text-slate-700">
                                Assigned Teacher: <span className="font-bold text-slate-900">{confirmLockModal.item.teacher_name}</span>
                            </p>
                            {confirmLockModal.nextLockState ? (
                                <p className="text-rose-700 font-medium leading-relaxed bg-rose-50 p-2.5 rounded-lg border border-rose-200/60">
                                    ⚠️ <strong>Warning:</strong> Locking will prevent <strong className="text-rose-900">{confirmLockModal.item.teacher_name}</strong> from entering or editing marks for <strong>{confirmLockModal.item.subject_name}</strong>.
                                </p>
                            ) : (
                                <p className="text-emerald-700 font-medium leading-relaxed bg-emerald-50 p-2.5 rounded-lg border border-emerald-200/60">
                                    ℹ️ Unlocking will allow <strong className="text-emerald-900">{confirmLockModal.item.teacher_name}</strong> to enter and modify marks for <strong>{confirmLockModal.item.subject_name}</strong> again.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmLockModal(null)}
                                disabled={togglingLock}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeToggleLock}
                                disabled={togglingLock}
                                className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                                    confirmLockModal.nextLockState
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                }`}
                            >
                                {togglingLock ? (
                                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                                ) : null}
                                {confirmLockModal.nextLockState ? 'Yes, Lock Entry' : 'Yes, Unlock Entry'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Column Lock / Unlock Confirmation Modal */}
            {confirmColumnLockModal && createPortal(
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                confirmColumnLockModal.nextLockState ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                {confirmColumnLockModal.nextLockState ? '🔒' : '🔓'}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {confirmColumnLockModal.nextLockState ? `Lock "${confirmColumnLockModal.column.label}" Column?` : `Unlock "${confirmColumnLockModal.column.label}" Column?`}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {confirmColumnLockModal.item.class} {confirmColumnLockModal.item.section ? `• Section ${confirmColumnLockModal.item.section}` : ''} • <span className="font-bold text-indigo-700">{confirmColumnLockModal.item.subject_name}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 text-xs text-slate-600 space-y-2">
                            <p className="font-semibold text-slate-700">
                                Assigned Teacher: <span className="font-bold text-slate-900">{confirmColumnLockModal.item.teacher_name}</span>
                            </p>
                            {confirmColumnLockModal.nextLockState ? (
                                <p className="text-rose-700 font-medium leading-relaxed bg-rose-50 p-2.5 rounded-lg border border-rose-200/60">
                                    ⚠️ <strong>Warning:</strong> Locking will prevent <strong className="text-rose-900">{confirmColumnLockModal.item.teacher_name}</strong> from entering or modifying marks for <strong>"{confirmColumnLockModal.column.label}"</strong>.
                                </p>
                            ) : (
                                <p className="text-emerald-700 font-medium leading-relaxed bg-emerald-50 p-2.5 rounded-lg border border-emerald-200/60">
                                    ℹ️ Unlocking will allow <strong className="text-emerald-900">{confirmColumnLockModal.item.teacher_name}</strong> to enter and edit marks for <strong>"{confirmColumnLockModal.column.label}"</strong> again.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmColumnLockModal(null)}
                                disabled={togglingLock}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeToggleColumnLock}
                                disabled={togglingLock}
                                className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                                    confirmColumnLockModal.nextLockState
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                }`}
                            >
                                {togglingLock ? (
                                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                                ) : null}
                                {confirmColumnLockModal.nextLockState ? 'Yes, Lock Column' : 'Yes, Unlock Column'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Publish / Unpublish Confirmation Modal */}
            {confirmPublishModal && createPortal(
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                confirmPublishModal.is_published ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {confirmPublishModal.is_published ? '📢' : '🚫'}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {confirmPublishModal.isBulk
                                        ? (confirmPublishModal.is_published ? 'Publish All Selected Marks?' : 'Unpublish All Selected Marks?')
                                        : (confirmPublishModal.is_published ? 'Publish Marks?' : 'Unpublish Marks?')
                                    }
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {confirmPublishModal.isBulk ? (
                                        <span>Targeting <strong className="text-slate-800">{confirmPublishModal.ids?.length || 0} Subject Assignment(s)</strong></span>
                                    ) : (
                                        <span>{confirmPublishModal.item?.class} {confirmPublishModal.item?.section ? `• Section ${confirmPublishModal.item?.section}` : ''} • <span className="font-bold text-indigo-700">{confirmPublishModal.item?.subject_name}</span></span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 text-xs text-slate-600 space-y-2">
                            {confirmPublishModal.is_published ? (
                                <p className="text-emerald-800 font-medium leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-200/60">
                                    📢 <strong>Student Visibility:</strong> Publishing will make marks <strong>immediately visible</strong> to students and parents on their dashboard and report cards.
                                </p>
                            ) : (
                                <p className="text-amber-800 font-medium leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-200/60">
                                    🔒 <strong>Student Visibility:</strong> Unpublishing will <strong>hide marks</strong> from students and parents so they cannot view them on their portal.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmPublishModal(null)}
                                disabled={togglingPublish}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeTogglePublish}
                                disabled={togglingPublish}
                                className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                                    confirmPublishModal.is_published
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                        : 'bg-slate-700 hover:bg-slate-800 shadow-slate-200'
                                }`}
                            >
                                {togglingPublish ? (
                                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                                ) : null}
                                {confirmPublishModal.is_published
                                    ? (confirmPublishModal.isBulk ? 'Yes, Publish All' : 'Yes, Publish Marks')
                                    : (confirmPublishModal.isBulk ? 'Yes, Unpublish All' : 'Yes, Unpublish Marks')
                                }
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminMarksManagement;
