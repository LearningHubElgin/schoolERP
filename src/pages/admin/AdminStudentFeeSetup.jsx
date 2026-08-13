import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const ALL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const AdminStudentFeeSetup = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Filters
    const [search, setSearch] = useState('');
    const [classNumber, setClassNumber] = useState('');
    const [section, setSection] = useState('');

    // Single Student Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        discount_type: 'flat',
        discount_value: '',
        frequency: 'monthly',
        reason: 'Sibling Concession',
        applicable_months: ALL_MONTHS,
        notes: ''
    });

    // Global Academic Months Setting Modal State
    const [isGlobalMonthsModalOpen, setIsGlobalMonthsModalOpen] = useState(false);
    const [globalMonths, setGlobalMonths] = useState(ALL_MONTHS);
    const [targetClass, setTargetClass] = useState('');
    const [savingBatchMonths, setSavingBatchMonths] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchClasses();
        fetchStudentSetups();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/academic/classes`, { headers });
            setClasses(res.data.classes || []);
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const fetchSections = async (clsNum) => {
        if (!clsNum) {
            setSections([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/admin/academic/sections/${clsNum}`, { headers });
            setSections(res.data.sections || []);
        } catch (err) {
            console.error('Error fetching sections:', err);
        }
    };

    const fetchStudentSetups = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (classNumber) params.class_number = classNumber;
            if (section) params.section = section;

            const res = await axios.get(`${API_URL}/api/admin/fees/student-discounts`, { headers, params });
            if (res.data.success) {
                setStudents(res.data.students || []);
            }
        } catch (err) {
            console.error('Error fetching student fee setups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudentSetups();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, classNumber, section]);

    const handleOpenDiscountModal = (student) => {
        setSelectedStudent(student);
        let parsedMonths = ALL_MONTHS;
        if (student.applicable_months) {
            try {
                parsedMonths = typeof student.applicable_months === 'string' ? JSON.parse(student.applicable_months) : student.applicable_months;
                if (!Array.isArray(parsedMonths)) parsedMonths = ALL_MONTHS;
            } catch (e) {
                parsedMonths = ALL_MONTHS;
            }
        }

        setFormData({
            discount_type: student.discount_type || 'flat',
            discount_value: student.discount_value ? String(student.discount_value) : '',
            frequency: student.frequency || 'monthly',
            reason: student.reason || 'Sibling Concession',
            applicable_months: parsedMonths,
            notes: student.notes || ''
        });
    };

    const handleSaveDiscount = async () => {
        if (!selectedStudent) return;
        setSubmitting(true);
        try {
            const payload = {
                student_id: selectedStudent.student_id,
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value) || 0,
                frequency: formData.frequency,
                reason: formData.reason,
                applicable_months: formData.applicable_months,
                notes: formData.notes
            };

            const res = await axios.post(`${API_URL}/api/admin/fees/student-discounts`, payload, { headers });
            if (res.data.success) {
                alert('Student fee setup saved successfully!');
                setSelectedStudent(null);
                fetchStudentSetups();
            }
        } catch (err) {
            console.error('Error saving student discount:', err);
            alert('Failed to save student discount setup.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveDiscount = async (student) => {
        if (!window.confirm(`Are you sure you want to remove fee setup for "${student.student_name}"?`)) return;
        try {
            const res = await axios.delete(`${API_URL}/api/admin/fees/student-discounts/${student.student_id}`, { headers });
            if (res.data.success) {
                alert('Fee setup removed successfully.');
                fetchStudentSetups();
            }
        } catch (err) {
            console.error('Error removing discount:', err);
            alert('Failed to remove discount setup.');
        }
    };

    const toggleMonth = (month) => {
        setFormData(prev => {
            const months = [...prev.applicable_months];
            if (months.includes(month)) {
                return { ...prev, applicable_months: months.filter(m => m !== month) };
            } else {
                return { ...prev, applicable_months: [...months, month] };
            }
        });
    };

    const toggleAllMonths = () => {
        setFormData(prev => ({
            ...prev,
            applicable_months: prev.applicable_months.length === ALL_MONTHS.length ? [] : ALL_MONTHS
        }));
    };

    // Global Batch Months Handlers
    const updateGlobalMonthsForTargetClass = (clsNum) => {
        setTargetClass(clsNum);
        let matchingStudents = students;
        if (clsNum && String(clsNum).trim()) {
            const cleanCls = String(clsNum).replace(/^Class\s+/i, '').replace(/\s+Only$/i, '').trim();
            matchingStudents = students.filter(s => {
                const sCls = String(s.class || '').replace(/^Class\s+/i, '').trim();
                return sCls === cleanCls || sCls.startsWith(cleanCls);
            });
        }

        const studentWithMonths = matchingStudents.find(s => s.applicable_months);
        if (studentWithMonths) {
            try {
                const parsed = typeof studentWithMonths.applicable_months === 'string'
                    ? JSON.parse(studentWithMonths.applicable_months)
                    : studentWithMonths.applicable_months;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setGlobalMonths(parsed);
                    return;
                }
            } catch (e) {}
        }
        setGlobalMonths(ALL_MONTHS);
    };

    const handleOpenGlobalMonthsModal = (initialClass = '') => {
        const clsToUse = initialClass || classNumber || targetClass || '';
        updateGlobalMonthsForTargetClass(clsToUse);
        setIsGlobalMonthsModalOpen(true);
    };

    const toggleGlobalMonth = (month) => {
        setGlobalMonths(prev => {
            if (prev.includes(month)) {
                return prev.filter(m => m !== month);
            } else {
                return [...prev, month];
            }
        });
    };

    const toggleAllGlobalMonths = () => {
        setGlobalMonths(prev => (prev.length === ALL_MONTHS.length ? [] : ALL_MONTHS));
    };

    const handleSaveBatchMonths = async () => {
        setSavingBatchMonths(true);
        try {
            const payload = {
                class_number: targetClass || null,
                applicable_months: globalMonths
            };

            const res = await axios.post(`${API_URL}/api/admin/fees/student-discounts/batch-months`, payload, { headers });
            if (res.data.success) {
                alert(res.data.message || 'Applicable academic months updated successfully!');
                setIsGlobalMonthsModalOpen(false);
                fetchStudentSetups();
            }
        } catch (err) {
            console.error('Error saving batch months:', err);
            alert('Failed to update applicable academic months.');
        } finally {
            setSavingBatchMonths(false);
        }
    };

    const columns = [
        {
            header: 'Student Info',
            render: (row) => (
                <div>
                    <span className="font-bold text-slate-800 text-xs block">{row.student_name}</span>
                    <span className="text-[10px] text-indigo-600 font-medium block">
                        ID: {row.student_unique_id || 'N/A'} • Class {row.class}-{row.section} (Roll: {row.roll_no || 'N/A'})
                    </span>
                    {row.father_name && (
                        <span className="text-[10px] text-slate-400 block">Father: {row.father_name}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Monthly & Annual Fee',
            render: (row) => {
                const baseFee = parseFloat(row.base_monthly_fee || 0);
                const discountVal = parseFloat(row.discount_value || 0);
                const discountType = row.discount_type || 'flat';
                const concessionAmount = discountVal > 0 
                    ? (discountType === 'percentage' ? (baseFee * discountVal / 100) : discountVal)
                    : 0;
                const netMonthlyFee = Math.max(0, baseFee - concessionAmount);
                
                let monthsCount = 12;
                if (row.applicable_months) {
                    try {
                        const m = typeof row.applicable_months === 'string' ? JSON.parse(row.applicable_months) : row.applicable_months;
                        if (Array.isArray(m)) monthsCount = m.length;
                    } catch (e) {}
                }
                const totalAnnualFee = netMonthlyFee * monthsCount;

                return (
                    <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1">
                            <span className="text-slate-500 text-[11px]">Base:</span>
                            <span className="font-semibold text-slate-700">₹{baseFee.toLocaleString('en-IN')}/mo</span>
                        </div>
                        {concessionAmount > 0 ? (
                            <div className="flex items-center gap-1">
                                <span className="text-emerald-600 text-[11px]">Net:</span>
                                <span className="font-extrabold text-emerald-700">₹{netMonthlyFee.toLocaleString('en-IN')}/mo</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-[11px]">Net:</span>
                                <span className="font-extrabold text-slate-800">₹{baseFee.toLocaleString('en-IN')}/mo</span>
                            </div>
                        )}
                        <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                            Yearly: ₹{totalAnnualFee.toLocaleString('en-IN')} ({monthsCount} mos)
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Fee Concession Status',
            render: (row) => (
                row.discount_value && parseFloat(row.discount_value) > 0 ? (
                    <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        🏷️ {row.discount_type === 'percentage' ? `${row.discount_value}% Off` : `₹${parseFloat(row.discount_value).toLocaleString('en-IN')}/mo Off`}
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">
                        Standard Fee (No Discount)
                    </Badge>
                )
            )
        },
        {
            header: 'Reason / Category',
            render: (row) => (
                <span className="text-xs text-slate-700 font-medium">{row.reason || '-'}</span>
            )
        },
        {
            header: 'Frequency & Months',
            render: (row) => {
                let count = 12;
                let monthListStr = 'All 12 Months';
                if (row.applicable_months) {
                    try {
                        const m = typeof row.applicable_months === 'string' ? JSON.parse(row.applicable_months) : row.applicable_months;
                        if (Array.isArray(m)) {
                            count = m.length;
                            monthListStr = m.length === 12 ? 'All 12 Months' : (m.length === 0 ? 'No months selected' : m.join(', '));
                        }
                    } catch (e) {}
                }
                return (
                    <div className="text-xs space-y-0.5">
                        <span className="font-semibold text-slate-800 capitalize block">{row.frequency || 'Monthly'}</span>
                        <span className={`text-[10px] font-extrabold block ${count === 12 ? 'text-emerald-600' : (count === 0 ? 'text-rose-600' : 'text-amber-600')}`}>
                            {count} of 12 months active
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium block max-w-[140px] truncate" title={monthListStr}>
                            {monthListStr}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Notes / Remarks',
            render: (row) => <span className="text-xs text-slate-500 max-w-[150px] truncate block" title={row.notes}>{row.notes || '-'}</span>
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => handleOpenDiscountModal(row)}
                        className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                        ⚙️ Setup Discount
                    </button>
                    {row.discount_value && parseFloat(row.discount_value) > 0 && (
                        <button
                            onClick={() => handleRemoveDiscount(row)}
                            className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Remove Discount"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 sm:space-y-6 pb-8">
            {/* Top Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-4 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">🏷️ Student Fee Setup & Custom Discounts</h1>
                    <p className="mt-1 text-emerald-100 text-xs sm:text-sm">
                        Set up custom student fee concessions, flat monthly discounts (e.g. ₹500/month) or percentage waivers, scholarship reasons, and month-by-month applicability.
                    </p>
                </div>

                <button
                    onClick={() => handleOpenGlobalMonthsModal()}
                    className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-extrabold text-xs transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer border border-emerald-200"
                >
                    <span>⚙️</span> Applicable Academic Months
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-800">🔍 Select Student or Filter by Class</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold">Showing {students.length} students</span>
                        <button
                            onClick={() => handleOpenGlobalMonthsModal()}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>⚙️</span> Applicable Academic Months
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Student</label>
                        <input
                            type="text"
                            placeholder="Student Name, ID, Roll No..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class</label>
                        <select
                            value={classNumber}
                            onChange={(e) => {
                                setClassNumber(e.target.value);
                                setSection('');
                                fetchSections(e.target.value);
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.class_number}>Class {c.class_number}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                        <select
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            disabled={!classNumber}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.section_code}>{s.section_code}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Students Table */}
            <Card className="p-0 overflow-hidden">
                <Table
                    columns={columns}
                    data={students}
                    isLoading={loading}
                    emptyMessage="No students found."
                />
            </Card>

            {/* ─── GLOBAL APPLICABLE ACADEMIC MONTHS SETTING MODAL ─────────── */}
            {isGlobalMonthsModalOpen && (
                <Modal
                    isOpen={isGlobalMonthsModalOpen}
                    onClose={() => setIsGlobalMonthsModalOpen(false)}
                    title="🗓️ Fee Applicable Academic Months Setup"
                    size="lg"
                    footer={
                        <div className="flex justify-end items-center gap-2 w-full">
                            <Button variant="secondary" onClick={() => setIsGlobalMonthsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleSaveBatchMonths} disabled={savingBatchMonths}>
                                {savingBatchMonths ? 'Saving Settings...' : 'Save Applicable Months'}
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <h4 className="font-bold text-emerald-900 text-sm">Configure Academic Months for Fee Collection</h4>
                            <p className="text-xs text-emerald-700 mt-0.5">
                                Select which academic months students will be charged for monthly fees. Deselected months will be excluded from fee collection and annual totals.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Target Class</label>
                            <select
                                value={targetClass}
                                onChange={(e) => updateGlobalMonthsForTargetClass(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">All Classes (School-wide Setup)</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.class_number}>Class {c.class_number} Only</option>
                                ))}
                            </select>
                        </div>

                        {/* Screenshot-matching Applicable Academic Months Box */}
                        <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">Applicable Academic Months</h4>
                                <button
                                    type="button"
                                    onClick={toggleAllGlobalMonths}
                                    className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                >
                                    {globalMonths.length === ALL_MONTHS.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {ALL_MONTHS.map(m => {
                                    const isSelected = globalMonths.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => toggleGlobalMonth(m)}
                                            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#009669] text-white shadow-2xs hover:bg-emerald-700'
                                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Single Student Discount Setup Modal */}
            {selectedStudent && (
                <Modal
                    isOpen={Boolean(selectedStudent)}
                    onClose={() => setSelectedStudent(null)}
                    title="🏷️ Set Student Fee Discount & Concession"
                    size="lg"
                    footer={
                        <div className="flex justify-end items-center gap-2 w-full">
                            <Button variant="secondary" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                            <Button variant="primary" onClick={handleSaveDiscount} disabled={submitting}>
                                {submitting ? 'Saving Setup...' : 'Save Fee Setup'}
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {/* Student Summary Banner */}
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-emerald-900 text-sm">{selectedStudent.student_name}</h4>
                                <p className="text-xs text-emerald-700">
                                    ID: {selectedStudent.student_unique_id || 'N/A'} • Class {selectedStudent.class}-{selectedStudent.section} (Roll: {selectedStudent.roll_no || 'N/A'})
                                </p>
                            </div>
                            <span className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold shadow-xs">
                                Student Fee Concession
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Discount Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                                <select
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="flat">Flat Amount Discount (₹)</option>
                                    <option value="percentage">Percentage Concession (%)</option>
                                </select>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Discount Value ({formData.discount_type === 'percentage' ? '%' : '₹'})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={formData.discount_type === 'percentage' ? 'e.g. 15 for 15%' : 'e.g. 500 for ₹500/mo'}
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Frequency */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="monthly">Monthly Discount</option>
                                    <option value="yearly">Yearly Flat Discount</option>
                                    <option value="one_time">One-Time Concession</option>
                                </select>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Concession Reason / Category</label>
                                <select
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Sibling Concession">Sibling Concession</option>
                                    <option value="Staff Child Concession">Staff Child Concession</option>
                                    <option value="Merit / Sports Scholarship">Merit / Sports Scholarship</option>
                                    <option value="EWS / Financial Aid">EWS / Financial Aid</option>
                                    <option value="Custom Discount">Custom Discount</option>
                                </select>
                            </div>
                        </div>

                        {/* Applicable Months Selector (Screenshot-matching style) */}
                        <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">Applicable Academic Months</h4>
                                <button
                                    type="button"
                                    onClick={toggleAllMonths}
                                    className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                >
                                    {formData.applicable_months.length === ALL_MONTHS.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {ALL_MONTHS.map(m => {
                                    const isSelected = formData.applicable_months.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => toggleMonth(m)}
                                            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#009669] text-white shadow-2xs hover:bg-emerald-700'
                                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Remarks / Notes */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Approval Notes / Remarks</label>
                            <textarea
                                rows={2}
                                placeholder="Enter approval details, reference number, or special instructions..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminStudentFeeSetup;
