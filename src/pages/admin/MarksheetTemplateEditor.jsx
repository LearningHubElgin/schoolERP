import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FileText, Save, Plus, ArrowLeft, Trash2, FileDown, Eye } from 'lucide-react';
import { API_URL } from '../../productionLink/productionLink';
import { generateMarksheetPDF } from '../../utils/MarksheetGenerator';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>
);

const DEFAULT_CONFIG = {
    designType: 'classic',
    header: { showLogo: true, schoolNameFontSize: 20, showAddress: true, showPhone: false, showEmail: false, title: 'MARKSHEET', titleFontSize: 16, showTermInfo: true },
    studentFields: {
        name: { enabled: true, label: 'Student Name' }, roll_number: { enabled: true, label: 'Roll Number' },
        class: { enabled: true, label: 'Class' }, father_name: { enabled: true, label: "Father's Name" },
        mother_name: { enabled: false, label: "Mother's Name" }, dob: { enabled: false, label: 'Date of Birth' },
        admission_no: { enabled: false, label: 'Admission No' },
    },
    marksColumns: {
        subject: { enabled: true, label: 'Subject', order: 1 },
        max_marks: { enabled: true, label: 'Max Marks', order: 2 },
        marks_obtained: { enabled: true, label: 'Marks Obtained', order: 3 },
        grade: { enabled: true, label: 'Grade', order: 4 },
        percentage: { enabled: false, label: 'Percentage', order: 5 },
        remarks: { enabled: false, label: 'Remarks', order: 6 },
        theory_marks: { enabled: false, label: 'Theory Marks', order: 7 },
        practical_marks: { enabled: false, label: 'Practical Marks', order: 8 },
        internal_marks: { enabled: false, label: 'Internal Marks', order: 9 },
        external_marks: { enabled: false, label: 'External Marks', order: 10 },
    },
    customColumns: [],
    columnGroups: [],
    customStudentFields: [],
    summary: { showTotal: true, showPercentage: false, showResult: false, showGrade: false, passingPercentage: 33 },
    footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Principal'], footerText: 'This is a computer generated marksheet.', showRemarks: false },
    styling: { primaryColor: '#4f46e5', headerBgColor: '#1e1b4b', headerTextColor: '#FFFFFF', tableHeaderBg: '#4f46e5', tableHeaderText: '#FFFFFF', evenRowBg: '#f8fafc', oddRowBg: '#FFFFFF', borderColor: '#e2e8f0', fontFamily: 'Inter', showBorder: true, borderStyle: 'full' },
    page: { orientation: 'portrait', size: 'a4', marginTop: 15, marginBottom: 15, marginLeft: 20, marginRight: 20 },
};

const MarksheetTemplateEditor = () => {
    const [templates, setTemplates] = useState([]);
    const [activeView, setActiveView] = useState('list');
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateName, setTemplateName] = useState('');
    const [config, setConfig] = useState(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
    const [isDefault, setIsDefault] = useState(false);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [streamList, setStreamList] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [assignedSection, setAssignedSection] = useState('');
    const [assignedStream, setAssignedStream] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('header');
    const [previewUrl, setPreviewUrl] = useState('');
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [newCustomLabel, setNewCustomLabel] = useState('');
    const [samplePreviews, setSamplePreviews] = useState({});
    const [assignmentGroupId, setAssignmentGroupId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, label }
    const [schoolLogoBase64, setSchoolLogoBase64] = useState(null);
    const previewTimerRef = useRef(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchTemplates();
        fetchClasses();
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

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/classes`, { headers });
            const data = res.data.classes || res.data.data || (Array.isArray(res.data) ? res.data : []);
            const sortedData = [...data].sort((a, b) => {
                const nameA = String(a.name || a.class_name || '');
                const nameB = String(b.name || b.class_name || '');
                const numA = parseInt(nameA.replace(/\D/g, ''), 10);
                const numB = parseInt(nameB.replace(/\D/g, ''), 10);
                if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
                return nameA.localeCompare(nameB);
            });
            setClassList(sortedData);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setClassList([]);
        }
    };

    const fetchSections = async (classId) => {
        if (!classId) {
            setSectionList([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/admin/class-sections/${classId}`, { headers });
            const data = res.data.sections || res.data.data || (Array.isArray(res.data) ? res.data : []);
            setSectionList(data);
        } catch (err) {
            console.error('Error fetching sections:', err);
            setSectionList([]);
        }
    };

    const fetchStreams = async (classId) => {
        if (!classId) {
            setStreamList([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/admin/class-streams/${classId}`, { headers });
            const data = res.data.streams || res.data.data || (Array.isArray(res.data) ? res.data : []);
            setStreamList(data);
        } catch (err) {
            console.error('Error fetching streams:', err);
            setStreamList([]);
        }
    };

    useEffect(() => {
        const selectedClassDetails = classList.filter(c => assignedClasses.includes(String(c.id)));
        const hsClasses = selectedClassDetails.filter(c => (String(c.name).includes('11') || String(c.name).includes('12')));
        const nonHSClasses = selectedClassDetails.filter(c => !(String(c.name).includes('11') || String(c.name).includes('12')));

        if (assignedClasses.length > 0) {
            // If any HS classes are selected, fetch streams
            if (hsClasses.length > 0) {
                fetchStreams(hsClasses[0].id);
            } else {
                setStreamList([]);
                setAssignedStream('');
            }

            // If exactly one non-HS class is selected, fetch sections (for potential future use, though we currently auto-assign all)
            if (nonHSClasses.length === 1 && hsClasses.length === 0) {
                fetchSections(nonHSClasses[0].id);
            } else {
                setSectionList([]);
                setAssignedSection('');
            }
        } else {
            setSectionList([]);
            setAssignedSection('');
            setStreamList([]);
            setAssignedStream('');
        }
    }, [assignedClasses, classList]);

    // Auto-update preview whenever config or logo changes
    useEffect(() => {
        if (activeView !== 'editor') return;
        if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
        previewTimerRef.current = setTimeout(() => { updatePreview(); }, 400);
        return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
    }, [config, activeView, schoolLogoBase64]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/marksheet-templates`, { headers });
            setTemplates(res.data.templates || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
        setLoading(false);
    };

    const handleEdit = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateName(template.name);
            setConfig({ ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), ...template.config });
            setIsDefault(!!template.is_default);
            const classes = template.assigned_class ? template.assigned_class.split(',').filter(Boolean) : [];
            setAssignedClasses(classes);
            setAssignedSection(template.assigned_section || '');
            setAssignedStream(template.assigned_stream || '');
        } else {
            setEditingTemplate(null);
            setTemplateName('');
            setConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
            setIsDefault(false);
            setAssignedClasses([]);
            setAssignedSection('');
            setAssignedStream('');
        }
        setActiveView('editor');
        setActiveSection('header');
    };

    const deleteTemplate = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await axios.delete(`${API_URL}/api/marksheet-templates/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await fetchTemplates();
            if (editingTemplate && (editingTemplate.id === id || editingTemplate._id === id)) {
                createNew();
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting template');
        }
    };

    const createNew = () => {
        setEditingTemplate(null);
        setTemplateName('New Marksheet Template');
        setConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
        setIsDefault(false);
        setAssignedClasses([]);
        setAssignedSection('');
        setAssignedStream('');
        setActiveView('editor');
        setActiveSection('header');
    };

    // ── Sample Template Definitions ──
    const SAMPLE_TEMPLATES = [
        {
            name: 'Classic Formal',
            description: 'Traditional centered header with navy blue theme. Best for formal report cards.',
            emoji: '🎓', color: '#191970', is_default: true,
            config: {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), designType: 'classic',
                header: { showLogo: true, schoolNameFontSize: 22, showAddress: true, showPhone: false, showEmail: false, title: 'MARKSHEET', titleFontSize: 18, showTermInfo: true },
                styling: { primaryColor: '#191970', headerBgColor: '#191970', headerTextColor: '#FFFFFF', tableHeaderBg: '#191970', tableHeaderText: '#FFFFFF', evenRowBg: '#F0F0FF', oddRowBg: '#FFFFFF', borderColor: '#CBD5E1', fontFamily: 'helvetica', showBorder: true, borderStyle: 'full' },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Principal'], footerText: 'This is a computer generated marksheet.', showRemarks: false },
            }
        },
        {
            name: 'Academic Record',
            description: 'Logo on left with colored header banner, grading scale at bottom. Formal academic style.',
            emoji: '📜', color: '#006400', is_default: false,
            config: {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), designType: 'academic_record',
                header: { showLogo: true, schoolNameFontSize: 18, showAddress: true, showPhone: true, showEmail: true, title: 'ACADEMIC RECORD', titleFontSize: 16, showTermInfo: true },
                studentFields: { name: { enabled: true, label: 'Student Name' }, roll_number: { enabled: true, label: 'Roll No.' }, class: { enabled: true, label: 'Class & Section' }, father_name: { enabled: true, label: "Father's Name" }, mother_name: { enabled: true, label: "Mother's Name" }, dob: { enabled: true, label: 'Date of Birth' }, admission_no: { enabled: true, label: 'Admission No.' } },
                marksColumns: { subject: { enabled: true, label: 'Subject' }, max_marks: { enabled: true, label: 'Total' }, marks_obtained: { enabled: true, label: 'Obtained' }, grade: { enabled: true, label: 'Grade' }, percentage: { enabled: false, label: '%' }, remarks: { enabled: false, label: 'Remarks' }, theory_marks: { enabled: true, label: 'Theory' }, practical_marks: { enabled: true, label: 'Practical' }, internal_marks: { enabled: false, label: 'Internal' }, external_marks: { enabled: false, label: 'External' } },
                styling: { primaryColor: '#006400', headerBgColor: '#006400', headerTextColor: '#FFFFFF', tableHeaderBg: '#006400', tableHeaderText: '#FFFFFF', evenRowBg: '#F0FFF0', oddRowBg: '#FFFFFF', borderColor: '#A8D8A8', fontFamily: 'times', showBorder: true, borderStyle: 'full' },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Exam Controller', 'Principal'], footerText: 'This document is the property of the institution.', showRemarks: false },
            }
        },
        {
            name: 'Modern Branded',
            description: 'Colored top banner with accent shape. Clean, modern look with S.No column.',
            emoji: '🎨', color: '#4B0082', is_default: false,
            config: {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), designType: 'modern_branded',
                header: { showLogo: true, schoolNameFontSize: 16, showAddress: false, showPhone: false, showEmail: false, title: 'STUDENT REPORT CARD', titleFontSize: 16, showTermInfo: true },
                marksColumns: { subject: { enabled: true, label: 'Subject' }, max_marks: { enabled: true, label: 'Max Marks' }, marks_obtained: { enabled: true, label: 'Marks Obtained' }, grade: { enabled: true, label: 'Grade' }, percentage: { enabled: true, label: 'Percentage' }, remarks: { enabled: false, label: 'Remarks' }, theory_marks: { enabled: false, label: 'Theory' }, practical_marks: { enabled: false, label: 'Practical' }, internal_marks: { enabled: false, label: 'Internal' }, external_marks: { enabled: false, label: 'External' } },
                styling: { primaryColor: '#4B0082', headerBgColor: '#4B0082', headerTextColor: '#FFFFFF', tableHeaderBg: '#4B0082', tableHeaderText: '#FFFFFF', evenRowBg: '#F5F0FF', oddRowBg: '#FFFFFF', borderColor: '#D1C4E9', fontFamily: 'helvetica', showBorder: true, borderStyle: 'full' },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Principal'], footerText: 'Report generated electronically.', showRemarks: false },
            }
        },
        {
            name: 'Institutional Style',
            description: 'Logo and school name side-by-side, double divider line, colon-aligned student info.',
            emoji: '🏛️', color: '#000080', is_default: false,
            config: {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), designType: 'institutional',
                header: { showLogo: true, schoolNameFontSize: 20, showAddress: true, showPhone: true, showEmail: true, title: 'EXAMINATION MARKSHEET', titleFontSize: 16, showTermInfo: true },
                studentFields: { name: { enabled: true, label: 'Student Name' }, roll_number: { enabled: true, label: 'Roll No.' }, class: { enabled: true, label: 'Class' }, father_name: { enabled: true, label: "Father's Name" }, mother_name: { enabled: false, label: "Mother's Name" }, dob: { enabled: true, label: 'Date of Birth' }, admission_no: { enabled: true, label: 'Admission No.' } },
                marksColumns: { subject: { enabled: true, label: 'Subject' }, max_marks: { enabled: true, label: 'Max Marks' }, marks_obtained: { enabled: true, label: 'Marks Obtained' }, grade: { enabled: true, label: 'Grade' }, percentage: { enabled: false, label: '%' }, remarks: { enabled: true, label: 'Remarks' }, theory_marks: { enabled: false, label: 'Theory' }, practical_marks: { enabled: false, label: 'Practical' }, internal_marks: { enabled: false, label: 'Internal' }, external_marks: { enabled: false, label: 'External' } },
                styling: { primaryColor: '#000080', headerBgColor: '#000080', headerTextColor: '#FFFFFF', tableHeaderBg: '#000080', tableHeaderText: '#FFFFFF', evenRowBg: '#F0F0FF', oddRowBg: '#FFFFFF', borderColor: '#B0B0D0', fontFamily: 'times', showBorder: true, borderStyle: 'full' },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'HOD', 'Principal'], footerText: 'Issued by the Office of the Controller of Examinations.', showRemarks: false },
            }
        },
        {
            name: 'Bordered Formal',
            description: 'Double-border page frame with centered layout. Premium certificate-style appearance.',
            emoji: '📋', color: '#8B4513', is_default: false,
            config: {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), designType: 'bordered_formal',
                header: { showLogo: true, schoolNameFontSize: 22, showAddress: true, showPhone: false, showEmail: false, title: 'STATEMENT OF MARKS', titleFontSize: 18, showTermInfo: true },
                styling: { primaryColor: '#8B4513', headerBgColor: '#8B4513', headerTextColor: '#FFFFFF', tableHeaderBg: '#8B4513', tableHeaderText: '#FFFFFF', evenRowBg: '#FFF8F0', oddRowBg: '#FFFFFF', borderColor: '#D2B48C', fontFamily: 'times', showBorder: true, borderStyle: 'full' },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher', 'Principal', 'Chairman'], footerText: 'This is an official document.', showRemarks: false },
            }
        },
        {
            name: 'Tabular Clean',
            description: 'All data in bordered table cells. Compact layout with S.No column, ideal for records.',
            emoji: '📑', color: '#008080', is_default: false,
            config: {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)), designType: 'tabular_clean',
                header: { showLogo: true, schoolNameFontSize: 14, showAddress: true, showPhone: false, showEmail: false, title: 'MARKS STATEMENT', titleFontSize: 12, showTermInfo: true },
                studentFields: { name: { enabled: true, label: 'Student Name' }, roll_number: { enabled: true, label: 'Roll No.' }, class: { enabled: true, label: 'Class' }, father_name: { enabled: true, label: "Father's Name" }, mother_name: { enabled: false, label: "Mother's Name" }, dob: { enabled: false, label: 'DOB' }, admission_no: { enabled: false, label: 'Adm. No' } },
                marksColumns: { subject: { enabled: true, label: 'Subject' }, max_marks: { enabled: true, label: 'Max' }, marks_obtained: { enabled: true, label: 'Scored' }, grade: { enabled: false, label: 'Grade' }, percentage: { enabled: true, label: '%' }, remarks: { enabled: true, label: 'Remark' }, theory_marks: { enabled: false, label: 'Theory' }, practical_marks: { enabled: false, label: 'Practical' }, internal_marks: { enabled: false, label: 'Internal' }, external_marks: { enabled: false, label: 'External' } },
                styling: { primaryColor: '#008080', headerBgColor: '#008080', headerTextColor: '#FFFFFF', tableHeaderBg: '#008080', tableHeaderText: '#FFFFFF', evenRowBg: '#F0FFFF', oddRowBg: '#FFFFFF', borderColor: '#B2DFDB', fontFamily: 'helvetica', showBorder: true, borderStyle: 'full' },
                footer: { showDate: true, showSignatureLines: true, signatureLabels: ['Class Teacher'], footerText: '', showRemarks: false },
                summary: { showTotal: true, showPercentage: false, showResult: false, showGrade: false, passingPercentage: 33 },
                page: { orientation: 'portrait', size: 'a4', marginTop: 12, marginBottom: 12, marginLeft: 15, marginRight: 15 },
            }
        },
    ];

    const loadSampleTemplates = async (samples = SAMPLE_TEMPLATES) => {
        setSaving(true);
        try {
            for (const tmpl of samples) {
                await axios.post(`${API_URL}/api/marksheet-templates`, { name: tmpl.name, config: tmpl.config, is_default: tmpl.is_default }, { headers });
            }
            await fetchTemplates();
        } catch (err) { console.error(err); alert('Error loading sample templates'); }
        setSaving(false);
    };

    const loadSingleSample = async (sample) => {
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/marksheet-templates`, { name: sample.name, config: sample.config, is_default: sample.is_default }, { headers });
            await fetchTemplates();
        } catch (err) { console.error(err); alert('Error loading template'); }
        setSaving(false);
    };

    const saveTemplate = async () => {
        if (!templateName.trim()) return alert('Please enter a template name');
        setSaving(true);
        try {
            const payload = {
                name: templateName,
                config,
                is_default: isDefault,
                assigned_class: assignedClasses.join(','),
                assigned_section: assignedSection,
                assigned_stream: assignedStream
            };
            if (editingTemplate) {
                await axios.put(`${API_URL}/api/marksheet-templates/${editingTemplate.id || editingTemplate._id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/api/marksheet-templates`, payload, { headers });
            }
            await fetchTemplates();
            alert('Template saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Error saving template');
        }
        setSaving(false);
    };

    const updateConfig = (section, key, value) => {
        setConfig(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    };
    const updateNestedConfig = (section, field, key, value) => {
        setConfig(prev => ({
            ...prev, [section]: { ...prev[section], [field]: { ...prev[section][field], [key]: value } }
        }));
    };
    const updateSignatureLabel = (index, value) => {
        setConfig(prev => { const labels = [...prev.footer.signatureLabels]; labels[index] = value; return { ...prev, footer: { ...prev.footer, signatureLabels: labels } }; });
    };
    const addSignatureLabel = () => {
        setConfig(prev => ({ ...prev, footer: { ...prev.footer, signatureLabels: [...prev.footer.signatureLabels, 'Signature'] } }));
    };
    const removeSignatureLabel = (index) => {
        setConfig(prev => { const labels = prev.footer.signatureLabels.filter((_, i) => i !== index); return { ...prev, footer: { ...prev.footer, signatureLabels: labels } }; });
    };

    // ── Custom Columns ──
    const addCustomColumn = () => {
        if (!newCustomLabel.trim()) return;
        const key = 'custom_' + Date.now();
        const currentCount = (config.marksColumns ? Object.keys(config.marksColumns).length : 0) + (config.customColumns ? config.customColumns.length : 0);
        setConfig(prev => ({
            ...prev,
            customColumns: [...(prev.customColumns || []), { key, label: newCustomLabel.trim(), enabled: true, order: currentCount + 1 }]
        }));
        setNewCustomLabel('');
        setShowAddColumnModal(false);
    };
    const removeColumn = (id, label) => {
        setDeleteConfirm({ type: 'column', id, label });
    };

    const executeDelete = () => {
        if (!deleteConfirm) return;
        const { type, id } = deleteConfirm;

        if (type === 'column') {
            // Check if it's a custom column
            const isCustom = (config.customColumns || []).some(c => c.key === id);
            if (isCustom) {
                setConfig(prev => ({ ...prev, customColumns: (prev.customColumns || []).filter(c => c.key !== id) }));
            } else {
                // Standard column
                setConfig(prev => {
                    const newMarksCols = { ...prev.marksColumns };
                    delete newMarksCols[id];
                    return { ...prev, marksColumns: newMarksCols };
                });
            }
        } else if (type === 'columnGroup') {
            setConfig(prev => {
                const newGroups = (prev.columnGroups || []).filter(g => g.id !== id);
                const newMarksCols = { ...prev.marksColumns };
                Object.keys(newMarksCols).forEach(k => { if (newMarksCols[k].group === id) delete newMarksCols[k].group; });
                const newCustomCols = (prev.customColumns || []).map(c => c.group === id ? { ...c, group: undefined } : c);
                return { ...prev, columnGroups: newGroups, marksColumns: newMarksCols, customColumns: newCustomCols };
            });
        }
        setDeleteConfirm(null);
    };

    const updateCustomColumn = (key, field, value) => {
        setConfig(prev => ({
            ...prev,
            customColumns: (prev.customColumns || []).map(c => c.key === key ? { ...c, [field]: value } : c)
        }));
    };

    // ── Column Groups ──
    const addColumnGroup = () => {
        const id = 'group_' + Date.now();
        setConfig(prev => ({
            ...prev,
            columnGroups: [...(prev.columnGroups || []), { id, name: 'New Group' }]
        }));
    };
    const removeColumnGroup = (id) => {
        const group = (config.columnGroups || []).find(g => g.id === id);
        setDeleteConfirm({ type: 'columnGroup', id, label: group?.name || 'this group' });
    };
    const updateColumnGroup = (id, name) => {
        setConfig(prev => ({
            ...prev,
            columnGroups: (prev.columnGroups || []).map(g => g.id === id ? { ...g, name } : g)
        }));
    };
    const toggleColumnInGroup = (groupId, columnKey) => {
        setConfig(prev => {
            const newMarksCols = { ...prev.marksColumns };
            const newCustomCols = [...(prev.customColumns || [])];

            if (newMarksCols[columnKey]) {
                newMarksCols[columnKey] = {
                    ...newMarksCols[columnKey],
                    group: newMarksCols[columnKey].group === groupId ? undefined : groupId
                };
            } else {
                const idx = newCustomCols.findIndex(c => c.key === columnKey);
                if (idx !== -1) {
                    newCustomCols[idx] = {
                        ...newCustomCols[idx],
                        group: newCustomCols[idx].group === groupId ? undefined : groupId
                    };
                }
            }
            return { ...prev, marksColumns: newMarksCols, customColumns: newCustomCols };
        });
    };

    // ── Custom Student Fields ──
    const addCustomStudentField = () => {
        if (!newCustomLabel.trim()) return;
        const key = 'custom_field_' + Date.now();
        setConfig(prev => ({
            ...prev,
            customStudentFields: [...(prev.customStudentFields || []), { key, label: newCustomLabel.trim(), enabled: true, value: '' }]
        }));
        setNewCustomLabel('');
        setShowAddFieldModal(false);
    };
    const removeCustomStudentField = (key) => {
        setConfig(prev => ({ ...prev, customStudentFields: (prev.customStudentFields || []).filter(f => f.key !== key) }));
    };
    const updateCustomStudentField = (key, field, value) => {
        setConfig(prev => ({
            ...prev,
            customStudentFields: (prev.customStudentFields || []).map(f => f.key === key ? { ...f, [field]: value } : f)
        }));
    };

    // ── Sample Data ──
    const sampleData = {
        school: { name: localStorage.getItem('schoolName') || 'ABC Public School', address: '123 Main Street, City', phone: '9876543210', email: 'school@example.com' },
        term: { term_name: 'Mid-Term Exam', academic_year: '2025-26' },
        student: { name: 'Rahul Sharma', roll_number: '101', class: '10-A', father_name: 'Mr. Rajesh Sharma', mother_name: 'Mrs. Priya Sharma', dob: '2010-05-15', admission_no: 'ADM-2024-001' },
        subjects: [
            { subject_name: 'Mathematics', marks_obtained: 85, total_marks: 100, grade: 'A', theory_marks: 65, practical_marks: 20, internal_marks: 25, external_marks: 60 },
            { subject_name: 'Science', marks_obtained: 78, total_marks: 100, grade: 'B+', theory_marks: 58, practical_marks: 20, internal_marks: 22, external_marks: 56 },
            { subject_name: 'English', marks_obtained: 92, total_marks: 100, grade: 'A+', theory_marks: 72, practical_marks: 20, internal_marks: 28, external_marks: 64 },
            { subject_name: 'Hindi', marks_obtained: 70, total_marks: 100, grade: 'B+', theory_marks: 55, practical_marks: 15, internal_marks: 20, external_marks: 50 },
            { subject_name: 'Social Science', marks_obtained: 65, total_marks: 100, grade: 'B', theory_marks: 50, practical_marks: 15, internal_marks: 18, external_marks: 47 },
        ],
    };

    // ── Generate PDF (returns jsPDF instance) ── accepts optional cfg override
    const buildPDF = useCallback(async (cfgOverride) => {
        const c = cfgOverride || config;

        const data = {
            school: sampleData.school,
            term: sampleData.term,
            student: sampleData.student,
            subjects: sampleData.subjects
        };

        return generateMarksheetPDF(c, data, schoolLogoBase64);
    }, [config, schoolLogoBase64]);

    const updatePreview = useCallback(async () => {
        try {
            const pdf = await buildPDF();
            const dataUri = pdf.output('datauristring');
            setPreviewUrl(dataUri);
        } catch (e) { console.error('Preview error:', e); }
    }, [buildPDF]);

    const generateSamplePreviews = useCallback(async () => {
        const previews = {};
        for (let i = 0; i < SAMPLE_TEMPLATES.length; i++) {
            const s = SAMPLE_TEMPLATES[i];
            try {
                const pdf = await buildPDF(s.config);
                previews[i] = pdf.output('datauristring');
            } catch (e) { console.error('Sample preview error:', e); }
        }
        setSamplePreviews(previews);
    }, [buildPDF]);

    useEffect(() => { generateSamplePreviews(); }, []);

    const downloadPreviewPDF = async () => {
        const pdf = await buildPDF();
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const editorSections = [
        { id: 'header', label: '🏫 Header' }, { id: 'studentFields', label: '👤 Student Info' },
        { id: 'marksColumns', label: '📊 Marks Columns' }, { id: 'summary', label: '📋 Summary' },
        { id: 'footer', label: '📝 Footer' }, { id: 'styling', label: '🎨 Styling' }, { id: 'page', label: '📄 Page' },
    ];

    const handlePreviewTemplateInNewTab = async (t) => {
        try {
            const cfg = t.config || t;
            const pdf = await buildPDF(cfg);
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (e) {
            console.error('Preview error:', e);
            alert('Error generating preview PDF.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading templates...</p>
                </div>
            </div>
        );
    }

    if (activeView === 'list') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                {/* Compact Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
                            <FileText className="text-indigo-600 w-5 h-5" />
                            Marksheet Templates
                        </h1>
                        <p className="text-slate-500 text-xs mt-0.5 font-medium">Select a design to edit or create a new one for your classes</p>
                    </div>
                    <button
                        onClick={createNew}
                        className="w-full sm:w-auto px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 active:scale-95"
                    >
                        <Plus size={15} /> Create New Template
                    </button>
                </div>

                {/* Compact Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {templates.map((t, idx) => (
                        <Card key={t.id || t._id || `tmpl-${idx}`} className="group hover:shadow-md transition-all border-slate-200 overflow-hidden bg-white rounded-xl p-3.5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {t.is_default && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">Default</span>
                                        )}
                                        <button
                                            onClick={() => deleteTemplate(t.id || t._id)}
                                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-slate-800 mb-1.5 line-clamp-1 leading-snug">{t.name || t.templateName}</h3>

                                <div className="flex flex-wrap gap-1 mb-3">
                                    {!t.assigned_class ? (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded">All Classes</span>
                                    ) : (
                                        t.assigned_class.split(',').filter(Boolean).map((cid, i) => {
                                            const cls = classList.find(c => String(c.id) === String(cid));
                                            return cls ? (
                                                <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded border border-indigo-100">
                                                    {cls.name}
                                                </span>
                                            ) : null;
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between py-2 border-t border-slate-100 mb-2.5">
                                    <div>
                                        <span className="text-[9px] font-semibold text-slate-400 block leading-tight">Last Updated</span>
                                        <span className="text-xs font-bold text-slate-700">
                                            {new Date(t.updated_at || t.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handlePreviewTemplateInNewTab(t)}
                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 border border-indigo-100 shadow-2xs active:scale-95"
                                        title="Preview Marksheet PDF in New Tab"
                                    >
                                        <Eye size={12} /> Preview
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleEdit(t)}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 group/btn shadow-sm active:scale-95"
                                >
                                    Edit Template Design
                                    <ArrowLeft className="rotate-180 group-hover/btn:translate-x-0.5 transition-transform" size={13} />
                                </button>
                            </div>
                        </Card>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-200 text-center shadow-sm p-4">
                            <div className="bg-slate-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                <FileText className="text-slate-400" size={22} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 mb-1">No Templates Found</h3>
                            <p className="text-slate-500 text-xs max-w-xs mx-auto mb-4 font-medium">Start by creating your first marksheet template for your school.</p>
                            <button
                                onClick={createNew}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                + Build First Template
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Template Management Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200 sticky top-0 z-40">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => setActiveView('list')}
                        className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                        title="Back to List"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <div className="flex-1 max-w-xs">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Template Name</span>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="e.g. Class 1 Marksheet"
                            className="bg-transparent border-none p-0 text-lg font-extrabold text-slate-900 focus:ring-0 w-full placeholder:text-slate-300"
                        />
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden lg:block"></div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex flex-col relative">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Assign Classes</span>
                            <div className="flex items-center gap-3">
                                <div className="group relative">
                                    <button className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer text-left min-w-[120px] truncate max-w-[150px] flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                        {assignedClasses.length === 0 ? 'All Classes' :
                                            assignedClasses.length === 1 ? classList.find(c => String(c.id) === String(assignedClasses[0]))?.name || '1 Class' :
                                                `${assignedClasses.length} Classes`}
                                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 hidden group-hover:block p-2 max-h-64 overflow-y-auto">
                                        <div className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => setAssignedClasses([])}>
                                            <input type="checkbox" checked={assignedClasses.length === 0} readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-xs font-medium text-slate-700">All Classes</span>
                                        </div>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        {Array.isArray(classList) && [...classList].sort((a, b) => {
                                            const nameA = String(a.name || a.class_name || '');
                                            const nameB = String(b.name || b.class_name || '');
                                            const numA = parseInt(nameA.replace(/\D/g, ''), 10);
                                            const numB = parseInt(nameB.replace(/\D/g, ''), 10);
                                            if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
                                            return nameA.localeCompare(nameB);
                                        }).map((c, idx) => (
                                            <div
                                                key={c.id || `cls-${idx}`}
                                                className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                                                onClick={() => {
                                                    const id = String(c.id);
                                                    setAssignedClasses(prev =>
                                                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                                                    );
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={assignedClasses.includes(String(c.id))}
                                                    readOnly
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-xs text-slate-700">{c.name || c.class_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {streamList.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-px bg-slate-200"></div>
                                        <div className="flex flex-col">
                                            <select
                                                className="bg-transparent border-none p-0 text-xs font-bold text-indigo-600 focus:ring-0 cursor-pointer min-w-[100px] hover:text-indigo-700"
                                                value={assignedStream}
                                                onChange={(e) => setAssignedStream(e.target.value)}
                                            >
                                                <option value="">All Groups</option>
                                                {Array.isArray(streamList) && streamList.map((s, idx) => (
                                                    <option key={s.id || `stream-${idx}`} value={s.id}>{s.name || s.stream_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={downloadPreviewPDF} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm">
                        <FileDown size={18} className="text-slate-400 group-hover:text-indigo-600" />
                        <span className="hidden sm:inline">Preview PDF</span>
                    </button>
                    <button onClick={saveTemplate} disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200 active:scale-95">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
            {/* Main Editor: Sidebar + Config + Preview */}
            <div className="flex gap-3 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                {/* Left: Section Nav */}
                <div className="w-44 flex-shrink-0">
                    <Card className="p-2 h-full">
                        <div className="flex flex-col gap-1">
                            {editorSections.map(s => (
                                <button key={s.id} onClick={() => setActiveSection(s.id)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeSection === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Center: Config Panel */}
                <div className="flex-1 min-w-0 overflow-y-auto">
                    <Card className="p-5 h-full">
                        {/* HEADER */}
                        {activeSection === 'header' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">🏫 Header Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ToggleField label="Show School Logo" checked={config.header.showLogo} onChange={v => updateConfig('header', 'showLogo', v)} />
                                    <ToggleField label="Show Address" checked={config.header.showAddress} onChange={v => updateConfig('header', 'showAddress', v)} />
                                    <ToggleField label="Show Phone" checked={config.header.showPhone} onChange={v => updateConfig('header', 'showPhone', v)} />
                                    <ToggleField label="Show Email" checked={config.header.showEmail} onChange={v => updateConfig('header', 'showEmail', v)} />
                                    <ToggleField label="Show Term Info" checked={config.header.showTermInfo} onChange={v => updateConfig('header', 'showTermInfo', v)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Title Text</label><input type="text" value={config.header.title} onChange={e => updateConfig('header', 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">School Name Font Size</label><input type="number" min="12" max="32" value={config.header.schoolNameFontSize} onChange={e => updateConfig('header', 'schoolNameFontSize', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Title Font Size</label><input type="number" min="10" max="28" value={config.header.titleFontSize} onChange={e => updateConfig('header', 'titleFontSize', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
                                </div>
                            </div>
                        )}

                        {/* STUDENT FIELDS */}
                        {activeSection === 'studentFields' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h2 className="text-lg font-semibold text-slate-800">👤 Student Information Fields</h2>
                                    <button onClick={() => { setNewCustomLabel(''); setShowAddFieldModal(true); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">+ Add Custom Field</button>
                                </div>
                                <p className="text-sm text-slate-500">Toggle which student details appear. Add custom fields for anything not listed.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(config.studentFields).map(([key, field]) => (
                                        <div key={key} className={`flex items-center p-3 rounded-lg border transition-colors ${field.enabled ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                            <input type="checkbox" checked={field.enabled} onChange={e => updateNestedConfig('studentFields', key, 'enabled', e.target.checked)} className="w-4 h-4 text-blue-600 rounded mr-3" />
                                            <input type="text" value={field.label} onChange={e => updateNestedConfig('studentFields', key, 'label', e.target.value)} className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none" />
                                        </div>
                                    ))}
                                </div>
                                {/* Custom Student Fields */}
                                {(config.customStudentFields || []).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-green-700 mb-2">✨ Custom Fields</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {(config.customStudentFields || []).map(f => (
                                                <div key={f.key} className={`flex items-center p-3 rounded-lg border transition-colors ${f.enabled ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
                                                    <input type="checkbox" checked={f.enabled} onChange={e => updateCustomStudentField(f.key, 'enabled', e.target.checked)} className="w-4 h-4 text-green-600 rounded mr-2" />
                                                    <input type="text" value={f.label} onChange={e => updateCustomStudentField(f.key, 'label', e.target.value)} className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none" />
                                                    <input type="text" value={f.value || ''} onChange={e => updateCustomStudentField(f.key, 'value', e.target.value)} placeholder="Default value" className="w-28 ml-2 px-2 py-1 border rounded text-xs text-slate-500 outline-none" />
                                                    <button onClick={() => removeCustomStudentField(f.key)} className="ml-2 text-red-400 hover:text-red-600 text-sm">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MARKS COLUMNS */}
                        {activeSection === 'marksColumns' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h2 className="text-lg font-semibold text-slate-800">📊 Marks Table Columns</h2>
                                    <button onClick={() => { setNewCustomLabel(''); setShowAddColumnModal(true); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">+ Add Custom Column</button>
                                </div>

                                <p className="text-sm text-slate-500">Enable columns and arrange their sequence in the table. Columns assigned to categories will appear together.</p>

                                <div className="space-y-8">
                                    {/* GROUPED COLUMNS SECTIONS */}
                                    {(config.columnGroups || []).map(group => {
                                        const groupCols = [
                                            ...Object.entries(config.marksColumns)
                                                .filter(([_, c]) => c.group === group.id)
                                                .map(([key, c]) => ({ ...c, key, isCustom: false })),
                                            ...(config.customColumns || [])
                                                .filter(c => c.group === group.id)
                                                .map(c => ({ ...c, isCustom: true }))
                                        ].sort((a, b) => (a.order || 0) - (b.order || 0));

                                        if (groupCols.length === 0) return null;

                                        return (
                                            <div key={group.id} className="space-y-3">
                                                <div className="flex items-center px-1">
                                                    <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 shadow-sm">
                                                        {group.name} Section
                                                    </div>
                                                    <div className="flex-1 h-px bg-blue-100 ml-3"></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {groupCols.map(col => (
                                                        <ColumnItem
                                                            key={col.key}
                                                            col={col}
                                                            updateNestedConfig={updateNestedConfig}
                                                            updateCustomColumn={updateCustomColumn}
                                                            removeColumn={removeColumn}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* GENERAL / UNASSIGNED COLUMNS */}
                                    <div className="space-y-3">
                                        <div className="flex items-center px-1">
                                            <div className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 shadow-sm">
                                                General / Unassigned
                                            </div>
                                            <div className="flex-1 h-px bg-slate-100 ml-3"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                ...Object.entries(config.marksColumns)
                                                    .filter(([_, c]) => !c.group)
                                                    .map(([key, c]) => ({ ...c, key, isCustom: false })),
                                                ...(config.customColumns || [])
                                                    .filter(c => !c.group)
                                                    .map(c => ({ ...c, isCustom: true }))
                                            ].sort((a, b) => (a.order || 0) - (b.order || 0)).map(col => (
                                                <ColumnItem
                                                    key={col.key}
                                                    col={col}
                                                    updateNestedConfig={updateNestedConfig}
                                                    updateCustomColumn={updateCustomColumn}
                                                    removeColumn={removeColumn}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* GROUP MANAGEMENT - MOVED TO BOTTOM */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                            Column Groups (Exam Categories)
                                        </h3>
                                        <button onClick={addColumnGroup} className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm">+ Create New Group</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(config.columnGroups || []).map(g => {
                                            const assigned = [
                                                ...Object.entries(config.marksColumns).filter(([_, c]) => c.group === g.id).map(([_, c]) => c.label),
                                                ...(config.customColumns || []).filter(c => c.group === g.id).map(c => c.label)
                                            ];
                                            return (
                                                <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-200 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <input
                                                            type="text"
                                                            value={g.name}
                                                            onChange={e => updateColumnGroup(g.id, e.target.value)}
                                                            className="text-sm font-bold text-slate-700 outline-none w-full bg-transparent focus:text-blue-600"
                                                            placeholder="Group Name (e.g. FA-1)"
                                                        />
                                                        <button onClick={() => removeColumnGroup(g.id)} className="ml-2 text-slate-300 hover:text-red-500 transition-colors text-xs">✕</button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 min-h-[20px] mb-2">
                                                        {assigned.map((label, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-100">{label}</span>
                                                        ))}
                                                        {assigned.length === 0 && <span className="text-[10px] text-slate-400 italic">No columns assigned</span>}
                                                    </div>
                                                    <button
                                                        onClick={() => setAssignmentGroupId(g.id)}
                                                        className="w-full py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                    >
                                                        + Assign / Select Columns
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {(config.columnGroups || []).length === 0 && (
                                            <div className="col-span-full py-6 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-300">
                                                <p className="text-sm italic mb-2">No categories defined.</p>
                                                <p className="text-[10px] text-center max-w-[200px]">Create groups to categorize columns under a single header (e.g., Theory/Practical).</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUMMARY */}
                        {activeSection === 'summary' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">📋 Summary & Result</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ToggleField label="Show Total" checked={config.summary.showTotal} onChange={v => updateConfig('summary', 'showTotal', v)} />
                                    <ToggleField label="Show Percentage" checked={config.summary.showPercentage} onChange={v => updateConfig('summary', 'showPercentage', v)} />
                                    <ToggleField label="Show Result (Pass/Fail)" checked={config.summary.showResult} onChange={v => updateConfig('summary', 'showResult', v)} />
                                    <ToggleField label="Show Overall Grade" checked={config.summary.showGrade} onChange={v => updateConfig('summary', 'showGrade', v)} />
                                </div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Passing Percentage</label><input type="number" min="0" max="100" value={config.summary.passingPercentage} onChange={e => updateConfig('summary', 'passingPercentage', parseInt(e.target.value))} className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
                            </div>
                        )}

                        {/* FOOTER */}
                        {activeSection === 'footer' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">📝 Footer Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ToggleField label="Show Generated Date" checked={config.footer.showDate} onChange={v => updateConfig('footer', 'showDate', v)} />
                                    <ToggleField label="Show Signature Lines" checked={config.footer.showSignatureLines} onChange={v => updateConfig('footer', 'showSignatureLines', v)} />
                                    <ToggleField label="Show Remarks Section" checked={config.footer.showRemarks} onChange={v => updateConfig('footer', 'showRemarks', v)} />
                                </div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Footer Text</label><input type="text" value={config.footer.footerText} onChange={e => updateConfig('footer', 'footerText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
                                {config.footer.showSignatureLines && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Signature Labels</label>
                                        <div className="space-y-2">
                                            {config.footer.signatureLabels.map((label, i) => (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <input type="text" value={label} onChange={e => updateSignatureLabel(i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                                                    <button onClick={() => removeSignatureLabel(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">✕</button>
                                                </div>
                                            ))}
                                            <button onClick={addSignatureLabel} className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">+ Add Signature</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STYLING */}
                        {activeSection === 'styling' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">🎨 Design & Colors</h2>
                                {/* Design Type Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Design Layout</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {[
                                            { id: 'classic', label: '🎓 Classic', desc: 'Centered header' },
                                            { id: 'academic_record', label: '📜 Academic', desc: 'Logo left + banner' },
                                            { id: 'modern_branded', label: '🎨 Modern', desc: 'Top color banner' },
                                            { id: 'institutional', label: '🏛️ Institutional', desc: 'Side-by-side logo' },
                                            { id: 'bordered_formal', label: '📋 Bordered', desc: 'Page border frame' },
                                            { id: 'tabular_clean', label: '📑 Tabular', desc: 'All data in tables' },
                                        ].map(dt => (
                                            <button key={dt.id} onClick={() => setConfig(prev => ({ ...prev, designType: dt.id }))}
                                                className={`p-2.5 rounded-lg border-2 text-left transition-all ${config.designType === dt.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                                                <div className="text-sm font-semibold">{dt.label}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{dt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ColorField label="Primary Color" value={config.styling.primaryColor} onChange={v => updateConfig('styling', 'primaryColor', v)} />
                                    <ColorField label="Header BG" value={config.styling.headerBgColor} onChange={v => updateConfig('styling', 'headerBgColor', v)} />
                                    <ColorField label="Table Header BG" value={config.styling.tableHeaderBg} onChange={v => updateConfig('styling', 'tableHeaderBg', v)} />
                                    <ColorField label="Table Header Text" value={config.styling.tableHeaderText} onChange={v => updateConfig('styling', 'tableHeaderText', v)} />
                                    <ColorField label="Even Row BG" value={config.styling.evenRowBg} onChange={v => updateConfig('styling', 'evenRowBg', v)} />
                                    <ColorField label="Odd Row BG" value={config.styling.oddRowBg} onChange={v => updateConfig('styling', 'oddRowBg', v)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Font Family</label><select value={config.styling.fontFamily} onChange={e => updateConfig('styling', 'fontFamily', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none"><option value="helvetica">Helvetica</option><option value="times">Times New Roman</option><option value="courier">Courier</option></select></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Border Style</label><select value={config.styling.borderStyle} onChange={e => updateConfig('styling', 'borderStyle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none"><option value="full">Full Borders</option><option value="minimal">Minimal</option><option value="none">No Borders</option></select></div>
                                    <ToggleField label="Show Table Borders" checked={config.styling.showBorder} onChange={v => updateConfig('styling', 'showBorder', v)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Quick Presets</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[
                                            { n: 'Midnight Blue', c: '#191970' }, { n: 'Royal Green', c: '#006400' }, { n: 'Maroon', c: '#800000' },
                                            { n: 'Navy', c: '#000080' }, { n: 'Teal', c: '#008080' }, { n: 'Purple', c: '#4B0082' },
                                        ].map(p => (
                                            <button key={p.n} onClick={() => setConfig(prev => ({ ...prev, styling: { ...prev.styling, primaryColor: p.c, headerBgColor: p.c, tableHeaderBg: p.c } }))} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs transition-colors">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.c }}></span>{p.n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PAGE */}
                        {activeSection === 'page' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">📄 Page Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Orientation</label><select value={config.page.orientation} onChange={e => updateConfig('page', 'orientation', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Page Size</label><select value={config.page.size} onChange={e => updateConfig('page', 'size', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none"><option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option></select></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].map(key => (
                                        <div key={key}><label className="block text-sm font-medium text-slate-700 mb-1">{key.replace('margin', 'Margin ')}</label><input type="number" min="5" max="50" value={config.page[key]} onChange={e => updateConfig('page', key, parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" /></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Live PDF Preview */}
                <div className="w-[380px] flex-shrink-0">
                    <Card className="p-2 h-full">
                        <div className="flex items-center justify-between px-2 py-1 mb-1">
                            <span className="text-sm font-semibold text-slate-700">👁️ Live Preview</span>
                            <button onClick={downloadPreviewPDF} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Open Full ↗</button>
                        </div>
                        <div className="bg-slate-100 rounded-lg overflow-hidden h-full">
                            {previewUrl ? (
                                <iframe src={previewUrl} className="w-full h-full border-0 rounded-lg" title="PDF Preview" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        Generating preview...
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* COLUMN ASSIGNMENT MODAL */}
            {assignmentGroupId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800">Assign Columns</h3>
                                <p className="text-xs text-slate-500">Assigning to: <span className="font-bold text-blue-600">{(config.columnGroups || []).find(g => g.id === assignmentGroupId)?.name}</span></p>
                            </div>
                            <button onClick={() => setAssignmentGroupId(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Enabled Columns</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            ...Object.entries(config.marksColumns).filter(([_, c]) => c.enabled).map(([key, c]) => ({ key, label: c.label, group: c.group })),
                                            ...(config.customColumns || []).filter(c => c.enabled).map(c => ({ key: c.key, label: c.label, group: c.group }))
                                        ].map(col => (
                                            <div
                                                key={col.key}
                                                onClick={() => toggleColumnInGroup(assignmentGroupId, col.key)}
                                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${col.group === assignmentGroupId ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${col.group === assignmentGroupId ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                        {col.group === assignmentGroupId && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    <span className={`text-sm ${col.group === assignmentGroupId ? 'font-bold text-blue-700' : 'font-medium text-slate-600'}`}>{col.label}</span>
                                                </div>
                                                {col.group && col.group !== assignmentGroupId && (
                                                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded uppercase tracking-tighter">
                                                        In: {(config.columnGroups || []).find(g => g.id === col.group)?.name || 'Other'}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex justify-end">
                            <button
                                onClick={() => setAssignmentGroupId(null)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                                <span className="text-3xl font-bold">!</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Are you sure?</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                You are about to delete <span className="font-bold text-slate-700">"{deleteConfirm.label}"</span>. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Custom Column Modal ── */}
            {showAddColumnModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddColumnModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">➕ Add Custom Column</h3>
                        <p className="text-sm text-slate-500 mb-4">Enter the column name. This will appear as a new column in the marks table.</p>
                        <input type="text" value={newCustomLabel} onChange={e => setNewCustomLabel(e.target.value)} placeholder="e.g., Co-Curricular, Project Score" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none mb-4" autoFocus onKeyDown={e => e.key === 'Enter' && addCustomColumn()} />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowAddColumnModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                            <button onClick={addCustomColumn} disabled={!newCustomLabel.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">Add Column</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Custom Student Field Modal ── */}
            {showAddFieldModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddFieldModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">➕ Add Custom Student Field</h3>
                        <p className="text-sm text-slate-500 mb-4">Enter a label for the custom field. You can also set a default value.</p>
                        <input type="text" value={newCustomLabel} onChange={e => setNewCustomLabel(e.target.value)} placeholder="e.g., House, Blood Group, Transport" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none mb-4" autoFocus onKeyDown={e => e.key === 'Enter' && addCustomStudentField()} />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowAddFieldModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                            <button onClick={addCustomStudentField} disabled={!newCustomLabel.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">Add Field</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Sub-components ──
const ColumnItem = ({ col, updateNestedConfig, updateCustomColumn, removeColumn }) => {
    const isCustom = col.isCustom;
    const key = col.key;
    const enabled = col.enabled;

    return (
        <div key={key} className={`flex items-center p-3 rounded-xl border transition-all ${enabled ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white opacity-60'}`}>
            <input
                type="checkbox"
                checked={enabled}
                onChange={e => isCustom ? updateCustomColumn(key, 'enabled', e.target.checked) : updateNestedConfig('marksColumns', key, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded mr-3 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
                <input
                    type="text"
                    value={col.label}
                    onChange={e => isCustom ? updateCustomColumn(key, 'label', e.target.value) : updateNestedConfig('marksColumns', key, 'label', e.target.value)}
                    className={`w-full bg-transparent text-sm font-bold outline-none truncate ${enabled ? 'text-blue-900' : 'text-slate-500'}`}
                />
                {isCustom && <span className="text-[8px] font-bold text-blue-400 block leading-none">Custom Column</span>}
            </div>
            <div className="flex items-center gap-2 mr-1">
                <span className="text-[10px] font-bold text-slate-400">Order</span>
                <input
                    type="number"
                    value={col.order || 0}
                    onChange={e => isCustom ? updateCustomColumn(key, 'order', parseInt(e.target.value) || 0) : updateNestedConfig('marksColumns', key, 'order', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-600 bg-white shadow-sm"
                />
            </div>
            <button
                onClick={() => removeColumn(key, col.label)}
                className="text-slate-300 hover:text-red-500 transition-colors ml-1 p-1 hover:bg-red-50 rounded"
            >
                ✕
            </button>
        </div>
    );
};

const ToggleField = ({ label, checked, onChange }) => (
    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="relative">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
            <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
            </div>
        </div>
    </label>
);

const ColorField = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-9 h-9 rounded border border-slate-300 cursor-pointer" />
            <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-sm font-mono outline-none" />
        </div>
    </div>
);

export default MarksheetTemplateEditor;
