import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

const ACADEMIC_MONTHS = [
    { id: 'apr', name: 'April', index: 1, full: 'April 2025' },
    { id: 'may', name: 'May', index: 2, full: 'May 2025' },
    { id: 'jun', name: 'June', index: 3, full: 'June 2025' },
    { id: 'jul', name: 'July', index: 4, full: 'July 2025' },
    { id: 'aug', name: 'August', index: 5, full: 'August 2025' },
    { id: 'sep', name: 'September', index: 6, full: 'September 2025' },
    { id: 'oct', name: 'October', index: 7, full: 'October 2025' },
    { id: 'nov', name: 'November', index: 8, full: 'November 2025' },
    { id: 'dec', name: 'December', index: 9, full: 'December 2025' },
    { id: 'jan', name: 'January', index: 10, full: 'January 2026' },
    { id: 'feb', name: 'February', index: 11, full: 'February 2026' },
    { id: 'mar', name: 'March', index: 12, full: 'March 2026' }
];

const formatSectionName = (name) => {
    if (!name) return '';
    const clean = String(name).replace(/^section\s+/i, '').trim();
    return `Section ${clean}`;
};

const FeeManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feeCollectionCycle, setFeeCollectionCycle] = useState('monthly');

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        class: '',
        section: '',
        stream: '',
        status: 'All'
    });

    // Modal States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCreateFeeModalOpen, setIsCreateFeeModalOpen] = useState(false);
    const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
    const [isMonthBreakdownModalOpen, setIsMonthBreakdownModalOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedFeeRecordId, setSelectedFeeRecordId] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('offline');
    const [transactionId, setTransactionId] = useState('');
    const [selectedMonths, setSelectedMonths] = useState(['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar']);

    // Create Fee Form State
    const [feeFormData, setFeeFormData] = useState({
        total_amount: '',
        academic_year: '2025-2026'
    });

    // Payment History State
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingPaymentId, setDeletingPaymentId] = useState(null);
    const [isDeletingBill, setIsDeletingBill] = useState(false);

    // Fetch Classes and Sections on Mount
    useEffect(() => {
        fetchClasses();
        fetchSections();
    }, []);

    // Fetch Students Data on Load & When Filters Change
    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const queryParams = new URLSearchParams(filters).toString();

                const response = await axios.get(
                    `${API_URL}/api/accounts/students?${queryParams}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const cycle = response.data.feeCollectionCycle || 'monthly';
                    setFeeCollectionCycle(cycle);

                    const processed = (response.data.students || []).map(s => {
                        const rates = getStudentMonthlyRates(s);
                        s.total_amount = rates.annualNet;
                        s.effective_total = rates.annualNet - (parseFloat(s.discount_amount || 0));
                        s.pending_amount = Math.max(0, s.effective_total - parseFloat(s.paid_amount || 0));
                        if (s.pending_amount > 0) {
                            s.fee_status = 'pending';
                        } else if (parseFloat(s.paid_amount || 0) > 0) {
                            s.fee_status = 'paid';
                        }
                        return s;
                    });

                    setStudents(processed);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchStudents, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/accounts/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                const sortedClasses = [...response.data.classes].sort((a, b) => 
                    (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
                );
                setClasses(sortedClasses);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchSections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/accounts/sections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setSections(response.data.sections);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
        }
    };

    const isHigherSecondary = (classNum) => {
        const cn = String(classNum);
        return cn === '11' || cn === '12';
    };

    const fetchStreams = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/accounts/streams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setStreams(response.data.streams);
            }
        } catch (error) {
            console.error('Error fetching streams:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'class') {
            // When class changes, reset stream and fetch streams if needed
            const newFilters = { ...filters, class: value, stream: '' };
            setFilters(newFilters);
            if (isHigherSecondary(value)) {
                fetchStreams();
            } else {
                setStreams([]);
            }
        } else {
            setFilters({ ...filters, [name]: value });
        }
    };

    // Open Create Fee Modal
    const handleOpenCreateFee = (student) => {
        setSelectedStudent(student);
        setFeeFormData({
            total_amount: '',
            academic_year: '2025-2026'
        });
        setIsCreateFeeModalOpen(true);
    };

    // Create Fee Record
    const handleCreateFee = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/accounts/fees`,
                {
                    student_id: selectedStudent.student_id,
                    total_amount: feeFormData.total_amount,
                    academic_year: feeFormData.academic_year
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Fee record created successfully!');
                setIsCreateFeeModalOpen(false);
                // Refresh students list
                setFilters({ ...filters });
            }
        } catch (error) {
            console.error('Error creating fee:', error);
            alert('Failed to create fee record');
        }
    };

    // Helper to parse applicable months for a student
    const parseApplicableMonths = (raw) => {
        if (!raw) return ACADEMIC_MONTHS.map(m => m.name);
        try {
            let arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (typeof arr === 'string' && arr === 'All') return ACADEMIC_MONTHS.map(m => m.name);
            if (Array.isArray(arr) && arr.length > 0) {
                return arr.map(mStr => {
                    const lower = String(mStr).trim().toLowerCase();
                    const matched = ACADEMIC_MONTHS.find(m => m.id === lower || m.name.toLowerCase() === lower || m.full.toLowerCase().includes(lower));
                    return matched ? matched.name : mStr;
                });
            }
        } catch (e) {}
        return ACADEMIC_MONTHS.map(m => m.name);
    };

    // Calculate Monthly Fee Rates for a Student
    const getStudentMonthlyRates = (student) => {
        if (!student) return { monthlyBase: 0, monthlyDiscount: 0, monthlyNet: 0, paidMonthsCount: 0, annualBase: 0, annualNet: 0, admissionFee: 0, activeMonthsCount: 12, applicableMonthsList: ACADEMIC_MONTHS.map(m => m.name) };

        const totalPaid = parseFloat(student.paid_amount || 0);
        const rawDiscount = parseFloat(student.discount_amount || 0);

        // Check for One-Time Admission Fee in fee_records
        let admissionFee = 0;
        if (student.fee_records && Array.isArray(student.fee_records)) {
            const admRecord = student.fee_records.find(f => f.type && f.type.toLowerCase().includes('admission'));
            if (admRecord) {
                admissionFee = parseFloat(admRecord.total || 0);
            }
        }

        const applicableMonthsList = parseApplicableMonths(student.applicable_months);
        const activeMonthsCount = applicableMonthsList.length > 0 ? applicableMonthsList.length : 12;

        // Monthly Rate: structure_total_fee is the primary source for monthly tuition rate per month
        let monthlyNet = parseFloat(student.structure_total_fee || 0);

        if (monthlyNet <= 0 && student.fee_records && Array.isArray(student.fee_records)) {
            const academicRecords = student.fee_records.filter(f => !f.type || !f.type.toLowerCase().includes('admission'));
            const academicTotal = academicRecords.reduce((sum, f) => sum + parseFloat(f.total || 0), 0);
            if (academicTotal > 0) {
                monthlyNet = academicTotal >= 500 ? Math.round(academicTotal / activeMonthsCount) : academicTotal;
            }
        }

        if (monthlyNet <= 0 && student.total_amount > 0) {
            const netNoAdm = Math.max(0, parseFloat(student.total_amount) - admissionFee);
            if (netNoAdm > 0) {
                monthlyNet = netNoAdm >= 500 ? Math.round(netNoAdm / activeMonthsCount) : netNoAdm;
            }
        }

        const monthlyBase = monthlyNet;
        const monthlyDiscount = rawDiscount > 0 ? Math.round(rawDiscount / activeMonthsCount) : 0;

        const annualTuition = monthlyNet * activeMonthsCount;
        const annualNet = admissionFee + annualTuition;
        const annualBase = admissionFee + (monthlyBase * activeMonthsCount);

        const paidForTuition = Math.max(0, totalPaid - admissionFee);
        const paidMonthsCount = monthlyNet > 0 ? Math.min(activeMonthsCount, Math.floor((paidForTuition + 0.01) / monthlyNet)) : (student.fee_status === 'paid' ? activeMonthsCount : 0);

        return { monthlyBase, monthlyDiscount, monthlyNet, paidMonthsCount, annualBase, annualNet, admissionFee, activeMonthsCount, applicableMonthsList };
    };

    // Derive covered months for a payment transaction in history
    const getPaymentCoveredMonths = (payment, allPayments, student) => {
        if (feeCollectionCycle !== 'monthly' || !student) return null;
        const { monthlyNet } = getStudentMonthlyRates(student);
        if (monthlyNet <= 0) return null;

        const pAmount = parseFloat(payment.amount || payment.paid_amount || 0);
        if (pAmount <= 0) return null;

        // Sort payments by date ascending
        const validPayments = [...allPayments]
            .filter(p => parseFloat(p.amount || p.paid_amount || 0) > 0)
            .sort((a, b) => new Date(a.payment_date || a.created_at || 0) - new Date(b.payment_date || b.created_at || 0));

        let accumulatedBefore = 0;
        for (const p of validPayments) {
            if (p.id === payment.id) break;
            accumulatedBefore += parseFloat(p.amount || p.paid_amount || 0);
        }

        const startMonthIdx = Math.floor((accumulatedBefore + 0.01) / monthlyNet);
        const countMonths = Math.max(1, Math.round(pAmount / monthlyNet));

        const covered = ACADEMIC_MONTHS.slice(startMonthIdx, startMonthIdx + countMonths).map(m => m.name);
        return covered.length > 0 ? covered.join(', ') : null;
    };

    // Open Payment Modal
    const handleOpenPayment = (student, overrideMonthIds = null) => {
        setSelectedStudent(student);

        const { monthlyNet, paidMonthsCount } = getStudentMonthlyRates(student);
        const pendingMonthIds = ACADEMIC_MONTHS.slice(paidMonthsCount).map(m => m.id);

        // Default to selecting ONLY the next 1 unpaid month (e.g. April = ₹50.00) unless explicitly overridden
        let initialSelected;
        if (overrideMonthIds) {
            initialSelected = overrideMonthIds;
        } else if (pendingMonthIds.length > 0) {
            initialSelected = [pendingMonthIds[0]];
        } else {
            initialSelected = [ACADEMIC_MONTHS[0].id];
        }
        setSelectedMonths(initialSelected);

        let defaultFee = null;
        if (student.fee_records && student.fee_records.length > 0) {
            defaultFee = student.fee_records.find(r => r.status !== 'paid') || student.fee_records[0];
        }

        if (defaultFee) {
            setSelectedFeeRecordId(defaultFee.id);
        } else {
            setSelectedFeeRecordId(null);
        }

        if (feeCollectionCycle === 'monthly' && monthlyNet > 0) {
            const calculatedAmount = (monthlyNet * initialSelected.length).toFixed(2);
            setPaymentAmount(calculatedAmount);
        } else if (defaultFee) {
            setPaymentAmount(defaultFee.pending || '');
        } else {
            setPaymentAmount(student.pending_amount || '');
        }

        setPaymentMethod('offline');
        setTransactionId('');
        setIsPaymentModalOpen(true);
    };

    // Helper to get applicable ACADEMIC_MONTHS objects for a student
    const getApplicableAcademicMonths = (student) => {
        const { applicableMonthsList } = getStudentMonthlyRates(student);
        return ACADEMIC_MONTHS.filter(m => applicableMonthsList.includes(m.name));
    };

    // Open Monthwise Fee Structure Breakdown Modal
    const handleOpenMonthBreakdown = (student) => {
        setSelectedStudent(student);
        const { paidMonthsCount } = getStudentMonthlyRates(student);
        const applicableMonths = getApplicableAcademicMonths(student);
        const pendingMonths = applicableMonths.slice(paidMonthsCount);
        const initialSelected = pendingMonths.length > 0 ? pendingMonths.map(m => m.id) : applicableMonths.map(m => m.id);
        setSelectedMonths(initialSelected);
        setIsMonthBreakdownModalOpen(true);
    };

    // Toggle single month selection
    const handleToggleMonth = (monthId, student = selectedStudent) => {
        const { applicableMonthsList } = getStudentMonthlyRates(student);
        const monthObj = ACADEMIC_MONTHS.find(m => m.id === monthId);
        if (monthObj && !applicableMonthsList.includes(monthObj.name)) return; // Prevent selection of non-applicable months

        let updated;
        if (selectedMonths.includes(monthId)) {
            updated = selectedMonths.filter(id => id !== monthId);
        } else {
            updated = [...selectedMonths, monthId];
        }
        setSelectedMonths(updated);

        if (student && feeCollectionCycle === 'monthly') {
            const { monthlyNet } = getStudentMonthlyRates(student);
            if (monthlyNet > 0) {
                setPaymentAmount((monthlyNet * updated.length).toFixed(2));
            }
        }
    };

    // Select all applicable months
    const handleSelectAllMonths = (student = selectedStudent) => {
        const applicableMonths = getApplicableAcademicMonths(student);
        const allIds = applicableMonths.map(m => m.id);
        setSelectedMonths(allIds);
        if (student && feeCollectionCycle === 'monthly') {
            const { monthlyNet } = getStudentMonthlyRates(student);
            setPaymentAmount((monthlyNet * allIds.length).toFixed(2));
        }
    };

    // Select only 1 next pending month
    const handleSelectOneMonth = (student = selectedStudent) => {
        const { paidMonthsCount } = getStudentMonthlyRates(student);
        const applicableMonths = getApplicableAcademicMonths(student);
        const pendingMonths = applicableMonths.slice(paidMonthsCount);
        const nextOne = pendingMonths.length > 0 ? [pendingMonths[0].id] : (applicableMonths.length > 0 ? [applicableMonths[0].id] : []);
        setSelectedMonths(nextOne);
        if (student && feeCollectionCycle === 'monthly') {
            const { monthlyNet } = getStudentMonthlyRates(student);
            setPaymentAmount((monthlyNet * nextOne.length).toFixed(2));
        }
    };

    // Select all pending applicable months
    const handleSelectPendingMonths = (student = selectedStudent) => {
        const { paidMonthsCount } = getStudentMonthlyRates(student);
        const applicableMonths = getApplicableAcademicMonths(student);
        const pendingIds = applicableMonths.slice(paidMonthsCount).map(m => m.id);
        setSelectedMonths(pendingIds);
        if (student && feeCollectionCycle === 'monthly') {
            const { monthlyNet } = getStudentMonthlyRates(student);
            setPaymentAmount((monthlyNet * pendingIds.length).toFixed(2));
        }
    };

    // Clear all selected months
    const handleClearMonths = () => {
        setSelectedMonths([]);
        setPaymentAmount('0.00');
    };

    // Record Payment
    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // Validate against selected fee record pending amount
        let pendingAmountToCheck = selectedStudent.pending_amount || 999999;
        if (feeCollectionCycle === 'monthly') {
            pendingAmountToCheck = parseFloat(selectedStudent.pending_amount || 0);
        } else if (selectedFeeRecordId && selectedStudent.fee_records) {
            const record = selectedStudent.fee_records.find(r => r.id === selectedFeeRecordId);
            if (record) pendingAmountToCheck = record.pending;
        }

        if (parseFloat(paymentAmount) > parseFloat(pendingAmountToCheck)) {
            alert('Payment amount cannot exceed pending amount for this fee');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            let feeRecordId = selectedFeeRecordId || selectedStudent.fee_record_id;

            // If no fee record exists, create one first (Legacy/Fallback logic)
            if (!feeRecordId && selectedStudent.needs_fee_record) {
                const createResponse = await axios.post(
                    `${API_URL}/api/accounts/fees`,
                    {
                        student_id: selectedStudent.student_id,
                        total_amount: selectedStudent.total_amount,
                        due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                        academic_year: '2025-2026'
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (createResponse.data.success) {
                    feeRecordId = createResponse.data.fee_record_id;
                } else {
                    alert('Failed to create fee record');
                    return;
                }
            }

            if (!feeRecordId) {
                alert('No fee record selected to pay against.');
                return;
            }

            const response = await axios.put(
                `${API_URL}/api/accounts/fees/${feeRecordId}/pay`,
                {
                    amount: paymentAmount,
                    paymentMethod,
                    transactionId
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Payment recorded successfully!');
                setIsPaymentModalOpen(false);
                // Refresh students list
                setFilters({ ...filters }); // Trigger re-fetch
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        }
    };

    // View Payment History
    const handleViewPaymentHistory = async (student) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/accounts/fees/${student.student_id}/history`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setPaymentHistory(response.data.payments);
                setSelectedStudent(student);
                setIsPaymentHistoryModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            alert('Failed to load payment history');
        }
    };

    const handleEditPayment = (payment) => {
        setEditingPayment({
            id: payment.id,
            amount: payment.amount || payment.paid_amount || '',
            method: ['upi', 'card', 'online', 'bank_transfer'].includes(payment.payment_method) ? 'online' : 'offline',
            date: new Date(payment.payment_date).toISOString().split('T')[0],
            transactionId: payment.transaction_id || ''
        });
        setIsEditPaymentModalOpen(true);
    };

    const handleUpdatePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/api/accounts/fees/transaction/${editingPayment.id}`,
                {
                    amount: editingPayment.amount,
                    paymentMethod: editingPayment.method,
                    transactionId: editingPayment.transactionId,
                    paymentDate: editingPayment.date
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Transaction updated successfully');
                setIsEditPaymentModalOpen(false);
                // Refresh history
                handleViewPaymentHistory(selectedStudent);
                // Refresh main table too
                const queryParams = new URLSearchParams(filters).toString();
                const res = await axios.get(`${API_URL}/api/accounts/students?${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.data.success) setStudents(res.data.students);
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Failed to update transaction');
        }
    };

    // Delete Payment
    const handleDeletePayment = async (paymentId, isBill) => {
        setDeletingPaymentId(paymentId);
        setIsDeletingBill(!!isBill);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeletePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_URL}/api/accounts/fees/transaction/${deletingPaymentId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.data.success) {
                setIsDeleteConfirmOpen(false);
                setDeletingPaymentId(null);
                setIsDeletingBill(false);
                handleViewPaymentHistory(selectedStudent);
                // Refresh main table too
                const queryParams = new URLSearchParams(filters).toString();
                const res = await axios.get(`${API_URL}/api/accounts/students?${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.data.success) setStudents(res.data.students);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            alert(isDeletingBill ? 'Failed to delete bill record' : 'Failed to delete payment record');
        }
    };

    // Table Columns Configuration
    const AVATAR_COLORS = [
        'bg-indigo-100 text-indigo-700 border-indigo-200',
        'bg-purple-100 text-purple-700 border-purple-200',
        'bg-blue-100 text-blue-700 border-blue-200',
        'bg-emerald-100 text-emerald-700 border-emerald-200',
        'bg-amber-100 text-amber-700 border-amber-200',
        'bg-rose-100 text-rose-700 border-rose-200',
        'bg-teal-100 text-teal-700 border-teal-200'
    ];

    const getAvatarStyle = (name) => {
        if (!name) return AVATAR_COLORS[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    };

    const columns = [
        {
            header: 'Student',
            accessor: 'student_name',
            render: (row) => {
                const initial = (row.student_name || 'S').charAt(0).toUpperCase();
                const avatarStyle = getAvatarStyle(row.student_name);

                return (
                    <div className="flex items-center gap-2.5 py-0.5">
                        <div className={`w-7 h-7 rounded-lg ${avatarStyle} border font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                            {initial}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 text-xs leading-snug">{row.student_name}</div>
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 flex-wrap">
                                <span>{row.class_name || `Class ${row.class_number}`}</span>
                                <span>•</span>
                                <span>{formatSectionName(row.section_name)}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-400 font-semibold">#{row.roll_no}</span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Fee Types',
            render: (row) => (
                <div className="flex flex-col gap-0.5 items-start">
                    {row.fee_records && row.fee_records.length > 0 ? (
                        row.fee_records.map(r => (
                            <span key={r.id} className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                r.type.includes('Fail') ? 'bg-red-100 text-red-700' : 
                                r.type.includes('Repeat') ? 'bg-orange-100 text-orange-700' : 
                                'bg-blue-50 text-blue-600'
                            }`}>
                                {r.type} {r.academic_year ? `(${r.academic_year})` : ''}
                            </span>
                        ))
                    ) : (
                        <span className="text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.2 rounded-md border border-slate-200/50">Standard</span>
                    )}
                </div>
            )
        },
        {
            header: feeCollectionCycle === 'monthly' ? 'Total Fee' : 'Total Fee',
            accessor: 'total_amount',
            render: (row) => {
                if (row.total_amount === null || row.total_amount === undefined) {
                    return <span className="text-slate-400 text-[11px] font-medium">Not Set</span>;
                }
                const hasDiscount = row.discount_amount && row.discount_amount > 0;
                const baseAmount = parseFloat(row.total_amount);
                const effectiveAmount = parseFloat(row.effective_total || row.total_amount);

                if (feeCollectionCycle === 'monthly') {
                    const { monthlyBase, monthlyNet, annualNet, admissionFee, activeMonthsCount } = getStudentMonthlyRates(row);

                    return (
                        <div className="flex flex-col items-start leading-tight">
                            {hasDiscount ? (
                                <>
                                    <span className="text-[9px] text-slate-400 line-through leading-none">
                                        ₹{monthlyBase.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / mo
                                    </span>
                                    <span className="font-extrabold text-slate-900 text-xs leading-tight">
                                        ₹{monthlyNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-[9px] font-semibold text-slate-500">/ mo</span>
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium">
                                        Total Billed: ₹{annualNet.toLocaleString('en-IN')} {activeMonthsCount < 12 ? `(${activeMonthsCount} mos)` : ''}
                                    </span>
                                </>
                            ) : (
                                <>
                                    {monthlyNet > 0 ? (
                                        <span className="font-extrabold text-slate-900 text-xs leading-tight">
                                            ₹{monthlyNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-[9px] font-semibold text-slate-500">/ mo</span>
                                        </span>
                                    ) : (
                                        <span className="font-extrabold text-slate-900 text-xs leading-tight">
                                            One-Time Fee
                                        </span>
                                    )}
                                    <span className="text-[9px] text-slate-400 font-medium">
                                        Total: ₹{annualNet.toLocaleString('en-IN')} {admissionFee > 0 ? '(incl. Admission)' : (activeMonthsCount < 12 ? `(${activeMonthsCount} mos)` : '/ yr')}
                                    </span>
                                </>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="flex flex-col">
                        {hasDiscount ? (
                            <>
                                <span className="text-[9px] text-slate-400 line-through">₹{baseAmount.toLocaleString('en-IN')}</span>
                                <span className="font-extrabold text-slate-900 text-xs">₹{effectiveAmount.toLocaleString('en-IN')}</span>
                            </>
                        ) : (
                            <span className="font-extrabold text-slate-900 text-xs">₹{baseAmount.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Paid',
            accessor: 'paid_amount',
            render: (row) => {
                const paidVal = parseFloat(row.paid_amount || 0);
                return (
                    <span className={`font-extrabold text-xs ${paidVal > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                        ₹{paidVal.toLocaleString('en-IN')}
                    </span>
                );
            }
        },
        {
            header: 'Pending',
            accessor: 'pending_amount',
            render: (row) => {
                const pendingVal = parseFloat(row.pending_amount || 0);
                return (
                    <span className={`font-extrabold text-xs ${pendingVal > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                        ₹{pendingVal.toLocaleString('en-IN')}
                    </span>
                );
            }
        },
        {
            header: 'Discount',
            render: (row) => {
                if (!row.discount_id || !row.discount_value) {
                    return <span className="text-slate-300 text-xs font-medium">—</span>;
                }
                return (
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-semibold border border-indigo-100/60 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {row.discount_type === 'percentage'
                                ? `${row.discount_value}%`
                                : `₹${parseFloat(row.discount_value).toLocaleString('en-IN')}`}
                        </span>
                        {row.discount_amount > 0 && (
                            <span className="text-[9px] text-indigo-500 font-bold ml-1">
                                −₹{parseFloat(row.discount_amount).toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'fee_status',
            render: (row) => {
                if (row.needs_fee_record && (!row.fee_records || row.fee_records.length === 0)) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                            No Fee Record
                        </span>
                    );
                }

                if (row.fee_status === 'not_available') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                            Not Available
                        </span>
                    );
                }

                const isPaid = row.fee_status === 'paid' || (row.pending_amount <= 0 && parseFloat(row.paid_amount || 0) > 0);

                return isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-semibold border border-emerald-100 shadow-2xs">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        Paid
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-semibold border border-rose-100 shadow-2xs">
                        <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                        Pending
                    </span>
                );
            }
        }
    ];

    const actions = (row) => (
        <div className="flex gap-1 flex-wrap items-center">
            {feeCollectionCycle === 'monthly' && row.total_amount && (
                <button
                    onClick={() => handleOpenMonthBreakdown(row)}
                    className="px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1 shadow-2xs"
                    title="View Month-wise Breakdown"
                >
                    📅 Months
                </button>
            )}
            {(row.pending_amount > 0 || row.fee_status !== 'paid') && row.total_amount && (
                <button
                    onClick={() => handleOpenPayment(row)}
                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50/60 border border-emerald-300 rounded-lg hover:bg-emerald-100/70 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                    Collect
                </button>
            )}
            {row.fee_records && row.fee_records.length > 0 && (
                <button
                    onClick={() => handleViewPaymentHistory(row)}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer text-xs"
                    title="View Payment History"
                >
                    👁️
                </button>
            )}
            {!row.total_amount && (
                <span className="text-[10px] text-slate-400 italic">No fee structure set</span>
            )}
        </div>
    );

    return (
        <div className="space-y-3.5">
            <div className="flex justify-between items-center">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">Student Fee Management</h1>
                <div className="text-xs text-slate-600">
                    Total Students: <span className="font-bold text-slate-900">{students.length}</span>
                </div>
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className={`grid grid-cols-2 ${filters.class && isHigherSecondary(filters.class) ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-2 md:grid-cols-3'} gap-2 sm:gap-3 mb-3`}>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Search Student
                        </label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Name or Roll No..."
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                        <select
                            name="class"
                            value={filters.class}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.class_number}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Group/Stream - Only for Class 11/12 */}
                    {filters.class && isHigherSecondary(filters.class) && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Group/Stream</label>
                            <select
                                name="stream"
                                value={filters.stream}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">All Groups</option>
                                {streams.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                        <select
                            name="section"
                            value={filters.section}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Sections</option>
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.code}>
                                    {formatSectionName(sec.name)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ─── STATUS TABS ─────────────── */}
                <div className="flex gap-1.5 p-1 bg-slate-100/90 rounded-xl mb-3 border border-slate-200/60">
                    {[
                        { key: 'All', label: 'All Students', icon: '👥' },
                        { key: 'paid', label: 'Paid', icon: '✅' },
                        { key: 'pending', label: 'Pending', icon: '⏳' }
                    ].map(tab => {
                        const count = tab.key === 'All'
                            ? students.length
                            : students.filter(s => s.fee_status === tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilters({ ...filters, status: tab.key })}
                                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                    filters.status === tab.key
                                        ? tab.key === 'paid'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : tab.key === 'pending'
                                                ? 'bg-amber-500 text-white shadow-xs'
                                                : 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.key === 'All' ? 'All' : tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    filters.status === tab.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <Table columns={columns} data={students} actions={actions} isLoading={loading} compact={true} headerBg="bg-slate-100/90 text-slate-700 font-extrabold" />
            </Card>

            {/* Create Fee Modal */}
            <Modal
                isOpen={isCreateFeeModalOpen}
                onClose={() => setIsCreateFeeModalOpen(false)}
                title="Create Fee Record"
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p><strong>Student:</strong> {selectedStudent.student_name}</p>
                            <p><strong>Roll No:</strong> {selectedStudent.roll_no}</p>
                            <p><strong>Class:</strong> {selectedStudent.class_name} - {selectedStudent.section_name}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Total Fee Amount</label>
                            <input
                                type="number"
                                value={feeFormData.total_amount}
                                onChange={(e) => setFeeFormData({ ...feeFormData, total_amount: e.target.value })}
                                placeholder="Enter amount"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Academic Year</label>
                            <input
                                type="text"
                                value={feeFormData.academic_year}
                                onChange={(e) => setFeeFormData({ ...feeFormData, academic_year: e.target.value })}
                                placeholder="e.g., 2025-2026"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="secondary" onClick={() => setIsCreateFeeModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleCreateFee}>
                                Create Fee Record
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Monthwise Fee Breakdown Modal */}
            <Modal
                isOpen={isMonthBreakdownModalOpen}
                onClose={() => setIsMonthBreakdownModalOpen(false)}
                title="📅 Month-wise Fee Breakdown"
                size="lg"
            >
                {selectedStudent && (() => {
                    const { monthlyBase, monthlyDiscount, monthlyNet, paidMonthsCount, admissionFee, activeMonthsCount, applicableMonthsList } = getStudentMonthlyRates(selectedStudent);
                    const selectedCount = selectedMonths.length;
                    const calcBaseTotal = monthlyBase * selectedCount;
                    const calcDiscountTotal = monthlyDiscount * selectedCount;
                    const calcNetTotal = monthlyNet * selectedCount;
                    const selectedNames = ACADEMIC_MONTHS.filter(m => selectedMonths.includes(m.id)).map(m => m.name);
                    const pendingApplicableCount = Math.max(0, activeMonthsCount - paidMonthsCount);

                    return (
                        <div className="space-y-4">
                            {/* Student Info Box */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{selectedStudent.student_name}</p>
                                    <p className="text-slate-500">Roll No: <strong>{selectedStudent.roll_no}</strong> • Class: <strong>{selectedStudent.class_name || selectedStudent.class_number} ({formatSectionName(selectedStudent.section_name || selectedStudent.section_code)})</strong></p>
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-extrabold uppercase">
                                        📅 Monthly Fee Collection
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Monthly Rate: <strong className="text-slate-800">₹{monthlyNet.toFixed(2)}/mo</strong>
                                        {monthlyDiscount > 0 && <span className="text-emerald-600 font-semibold ml-1">(Saved ₹{monthlyDiscount.toFixed(2)}/mo)</span>}
                                    </p>
                                    {activeMonthsCount < 12 && (
                                        <p className="text-[10px] font-bold text-amber-600 mt-0.5">
                                            ⚡ Active Months: {activeMonthsCount} of 12 ({applicableMonthsList.join(', ')})
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Selection Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-700">Select Applicable Academic Months:</span>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handleSelectPendingMonths(selectedStudent)}
                                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                                    >
                                        Pending Months ({pendingApplicableCount})
                                    </button>
                                    <button
                                        onClick={() => handleSelectAllMonths(selectedStudent)}
                                        className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                                    >
                                        Select All ({activeMonthsCount})
                                    </button>
                                    <button
                                        onClick={handleClearMonths}
                                        className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* 12 Academic Months Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                                {ACADEMIC_MONTHS.map((month) => {
                                    const isApplicable = applicableMonthsList.includes(month.name);
                                    const applicableIndex = applicableMonthsList.indexOf(month.name);
                                    const isPaid = isApplicable && applicableIndex !== -1 && applicableIndex < paidMonthsCount;
                                    const isSelected = selectedMonths.includes(month.id);

                                    return (
                                        <div
                                            key={month.id}
                                            onClick={() => isApplicable && !isPaid && handleToggleMonth(month.id, selectedStudent)}
                                            className={`p-2.5 rounded-xl border transition-all select-none relative ${
                                                !isApplicable
                                                    ? 'bg-slate-100/70 border-slate-200 opacity-50 cursor-not-allowed'
                                                    : isPaid
                                                        ? 'bg-emerald-50/60 border-emerald-200 opacity-75 cursor-default'
                                                        : isSelected
                                                            ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-400/30 shadow-xs cursor-pointer'
                                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold ${!isApplicable ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                    {month.name}
                                                </span>
                                                {!isApplicable ? (
                                                    <span className="text-[8px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-500 rounded">
                                                        Not Applicable
                                                    </span>
                                                ) : isPaid ? (
                                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded">
                                                        Paid ✅
                                                    </span>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        disabled={!isApplicable}
                                                        onChange={() => {}}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                )}
                                            </div>
                                            <div className="mt-1.5 text-right">
                                                {!isApplicable ? (
                                                    <span className="text-xs text-slate-400 font-medium block">—</span>
                                                ) : monthlyDiscount > 0 ? (
                                                    <>
                                                        <span className="text-[9px] text-slate-400 line-through block leading-none">
                                                            ₹{monthlyBase.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-900 leading-tight block">
                                                            ₹{monthlyNet.toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-900 block">
                                                        ₹{monthlyBase.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Calculation Summary Box */}
                            <div className="p-3 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl shadow-sm">
                                <div className="flex items-center justify-between mb-1.5 text-xs border-b border-white/10 pb-1.5">
                                    <span className="font-bold text-indigo-200">
                                        Selected {selectedCount} Month{selectedCount !== 1 ? 's' : ''}:
                                    </span>
                                    <span className="font-medium text-white truncate max-w-[220px]">
                                        {selectedNames.length > 0 ? selectedNames.join(', ') : 'None'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-1.5 bg-white/10 rounded-lg">
                                        <span className="text-[9px] text-indigo-200 uppercase font-bold block">Base Fee</span>
                                        <span className="font-bold text-sm">₹{calcBaseTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="p-1.5 bg-white/10 rounded-lg">
                                        <span className="text-[9px] text-emerald-300 uppercase font-bold block">Discount</span>
                                        <span className="font-bold text-sm text-emerald-300">−₹{calcDiscountTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="p-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-lg">
                                        <span className="text-[9px] text-emerald-200 uppercase font-extrabold block">Net Amount</span>
                                        <span className="font-extrabold text-sm text-emerald-300">₹{calcNetTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button variant="secondary" onClick={() => setIsMonthBreakdownModalOpen(false)}>
                                    Close
                                </Button>
                                {selectedCount > 0 && selectedStudent.fee_status !== 'paid' && (
                                    <Button
                                        variant="success"
                                        onClick={() => {
                                            setIsMonthBreakdownModalOpen(false);
                                            handleOpenPayment(selectedStudent, selectedMonths);
                                        }}
                                    >
                                        Collect ₹{calcNetTotal.toFixed(2)} for Selected Months
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Collect Fee Payment"
                size={feeCollectionCycle === 'monthly' ? 'lg' : 'md'}
            >
                {selectedStudent && (() => {
                    const { monthlyBase, monthlyDiscount, monthlyNet, paidMonthsCount } = getStudentMonthlyRates(selectedStudent);
                    const selectedCount = selectedMonths.length;
                    const calcNetTotal = monthlyNet * selectedCount;
                    const selectedNames = ACADEMIC_MONTHS.filter(m => selectedMonths.includes(m.id)).map(m => m.name);

                    return (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p><strong>Student:</strong> {selectedStudent.student_name}</p>
                                        <p className="text-xs text-gray-500">Roll No: {selectedStudent.roll_no} • Class: {selectedStudent.class_name || selectedStudent.class_number} ({formatSectionName(selectedStudent.section_name || selectedStudent.section_code)})</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 block">Total Outstanding</span>
                                        <span className="font-bold text-orange-600 text-sm">₹{parseFloat(selectedStudent.pending_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Applicable Academic Months Selector */}
                            {feeCollectionCycle === 'monthly' && (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                            📅 Applicable Academic Months Selection
                                        </label>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectOneMonth(selectedStudent)}
                                                className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                                            >
                                                1 Month (₹{monthlyNet.toFixed(0)})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectPendingMonths(selectedStudent)}
                                                className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
                                            >
                                                All Pending ({12 - paidMonthsCount})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClearMonths}
                                                className="px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {/* Month Checkbox Pills */}
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                                        {ACADEMIC_MONTHS.map((month, idx) => {
                                            const isPaid = idx < paidMonthsCount;
                                            const isSelected = selectedMonths.includes(month.id);

                                            return (
                                                <button
                                                    key={month.id}
                                                    type="button"
                                                    disabled={isPaid}
                                                    onClick={() => handleToggleMonth(month.id, selectedStudent)}
                                                    className={`p-1.5 rounded-lg border text-center transition-all text-xs font-semibold ${
                                                        isPaid
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-60 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-bold'
                                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="truncate text-[11px]">{month.name}</div>
                                                    <div className="text-[9px] opacity-80">
                                                        {isPaid ? 'Paid ✅' : `₹${monthlyNet.toFixed(0)}`}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Month Selection Summary */}
                                    <div className="p-2 bg-indigo-900 text-white rounded-lg flex items-center justify-between text-xs">
                                        <span className="truncate max-w-[240px]">
                                            Selected ({selectedCount}): <strong>{selectedNames.join(', ') || 'None'}</strong>
                                        </span>
                                        <span className="font-extrabold text-emerald-300 shrink-0 ml-2">
                                            Calculated: ₹{calcNetTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Fee Record Selection */}
                            {selectedStudent.fee_records && selectedStudent.fee_records.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Fee Record</label>
                                    <select
                                        value={selectedFeeRecordId || ''}
                                        onChange={(e) => {
                                            const recordId = parseInt(e.target.value);
                                            setSelectedFeeRecordId(recordId);
                                            const record = selectedStudent.fee_records.find(r => r.id === recordId);
                                            if (record && feeCollectionCycle !== 'monthly') {
                                                setPaymentAmount(record.pending);
                                            }
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {selectedStudent.fee_records.map(record => (
                                            <option key={record.id} value={record.id}>
                                                {record.type} {record.academic_year ? `(${record.academic_year})` : ''} (Pending: ₹{parseFloat(record.pending).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Amount</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter payment amount"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800"
                                />
                                {selectedFeeRecordId && selectedStudent.fee_records && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Pending for selected fee: ₹{
                                            parseFloat(selectedStudent.fee_records.find(r => r.id === selectedFeeRecordId)?.pending || 0).toFixed(2)
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="offline">Offline (Cash/Cheque)</option>
                                    <option value="online">Online (UPI/Card/Bank)</option>
                                </select>
                            </div>

                            {paymentMethod === 'online' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter transaction ID"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="success" onClick={handleRecordPayment}>
                                    Record Payment
                                </Button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* Payment History Modal */}
            <Modal
                isOpen={isPaymentHistoryModalOpen}
                onClose={() => setIsPaymentHistoryModalOpen(false)}
                title="Payment History"
                size={feeCollectionCycle === 'monthly' ? 'lg' : 'md'}
            >
                {selectedStudent && (() => {
                    const { paidMonthsCount, monthlyNet } = getStudentMonthlyRates(selectedStudent);

                    return (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap justify-between items-center gap-2">
                                <div>
                                    <p className="font-bold text-gray-900">{selectedStudent.student_name}</p>
                                    <p className="text-xs text-gray-500">Roll No: {selectedStudent.roll_no} • Class: {selectedStudent.class_name || selectedStudent.class_number} ({formatSectionName(selectedStudent.section_name || selectedStudent.section_code)})</p>
                                </div>
                                {feeCollectionCycle === 'monthly' && (
                                    <div className="text-right">
                                        <span className="text-xs text-slate-500 block">Monthly Paid Status</span>
                                        <span className="font-extrabold text-emerald-600 text-sm">{paidMonthsCount} / 12 Months Paid ✅</span>
                                    </div>
                                )}
                            </div>

                            {/* Monthly Paid Status Grid Banner */}
                            {feeCollectionCycle === 'monthly' && (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-800 flex items-center gap-1">
                                            📅 Month-wise Fee Paid Status
                                        </span>
                                        <span className="text-slate-500 text-[11px]">
                                            Paid: <strong className="text-emerald-600 font-extrabold">{paidMonthsCount} Months</strong> • Pending: <strong className="text-amber-600 font-bold">{12 - paidMonthsCount} Months</strong>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                                        {ACADEMIC_MONTHS.map((month, idx) => {
                                            const isPaid = idx < paidMonthsCount;
                                            return (
                                                <div
                                                    key={month.id}
                                                    className={`p-1.5 rounded-lg text-center border text-xs font-semibold ${
                                                        isPaid
                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs'
                                                            : 'bg-white border-slate-200 text-slate-400'
                                                    }`}
                                                >
                                                    <div className="truncate text-[11px]">{month.name}</div>
                                                    <div className="text-[9px] mt-0.5">
                                                        {isPaid ? 'Paid ✅' : 'Pending ⏳'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {paymentHistory.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No payment history found</p>
                            ) : (
                                <div className="overflow-auto max-h-96 space-y-5">
                                    {/* Group payments by class_name */}
                                    {Object.entries(
                                        paymentHistory.reduce((groups, payment) => {
                                            const className = payment.class_name || 'Other';
                                            const feeType = payment.remarks || 'Annual Fee';
                                            const year = payment.academic_year ? ` (${payment.academic_year})` : '';
                                            const groupKey = `${className} — ${feeType}${year}`;
                                            if (!groups[groupKey]) groups[groupKey] = [];
                                            groups[groupKey].push(payment);
                                            return groups;
                                        }, {})
                                    ).map(([groupKey, payments]) => (
                                        <div key={groupKey}>
                                            <div className="bg-indigo-50 border-l-4 border-indigo-500 px-4 py-2 mb-2 rounded-r">
                                                <h4 className="text-sm font-bold text-indigo-800">
                                                    {groupKey}
                                                </h4>
                                            </div>
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Type / Covered Month
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Date
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Amount
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Method
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Received By
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {payments.map((payment) => {
                                                        const isBill = parseFloat(payment.amount || payment.paid_amount || 0) === 0;
                                                        const coveredMonth = getPaymentCoveredMonths(payment, paymentHistory, selectedStudent);

                                                        return (
                                                            <tr key={payment.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {isBill ? (
                                                                        <Badge variant="secondary">Bill (Invoice)</Badge>
                                                                    ) : (
                                                                        <div className="flex flex-col items-start gap-1">
                                                                            <Badge variant="success">Payment</Badge>
                                                                            {feeCollectionCycle === 'monthly' && coveredMonth && (
                                                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full shadow-2xs">
                                                                                    📅 {coveredMonth}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {new Date(isBill ? (payment.created_at || payment.payment_date) : payment.payment_date).toLocaleDateString()}
                                                                </td>
                                                                <td className={`px-4 py-3 text-sm font-medium ${isBill ? 'text-slate-800 font-bold' : 'text-green-600'}`}>
                                                                    ₹{parseFloat(isBill ? (payment.total_amount || 0) : (payment.amount || payment.paid_amount || 0)).toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {isBill ? (
                                                                        <span className="text-gray-400 text-xs italic">N/A</span>
                                                                    ) : (
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {['upi', 'card', 'online', 'bank_transfer'].includes(payment.payment_method) ? 'Online' : 'Cash'}
                                                                            </div>
                                                                            {payment.transaction_id && (
                                                                                <div className="text-xs text-gray-500 font-mono mt-1">
                                                                                    TID: {payment.transaction_id}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                                    {payment.received_by_name || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                                    <div className="flex gap-2">
                                                                        {!isBill && (
                                                                            <Button size="sm" variant="secondary" onClick={() => handleEditPayment(payment)}>
                                                                                Edit
                                                                            </Button>
                                                                        )}
                                                                        <Button size="sm" variant="danger" onClick={() => handleDeletePayment(payment.id, isBill)}>
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end mt-4">
                                <Button variant="secondary" onClick={() => setIsPaymentHistoryModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* Delete Confirmation Popup */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 transform transition-all animate-in zoom-in-95 duration-150">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-3">
                                <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                                {isDeletingBill ? 'Delete Bill Record' : 'Delete Payment Record'}
                            </h3>
                            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                                {isDeletingBill 
                                    ? 'Are you sure you want to delete this bill record? This will completely remove this fee obligation from the student.' 
                                    : 'Are you sure you want to delete this payment record? This action cannot be undone.'}
                            </p>
                            <div className="flex gap-2.5 w-full">
                                <Button
                                    variant="secondary"
                                    className="flex-1 text-xs font-bold py-2"
                                    onClick={() => { setIsDeleteConfirmOpen(false); setDeletingPaymentId(null); setIsDeletingBill(false); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1 text-xs font-bold py-2"
                                    onClick={confirmDeletePayment}
                                >
                                    Yes, Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Payment Modal */}
            <Modal
                isOpen={isEditPaymentModalOpen}
                onClose={() => setIsEditPaymentModalOpen(false)}
                title="Edit Payment Transaction"
                zIndex="z-[999999]"
            >
                {editingPayment && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Date</label>
                            <input
                                type="date"
                                value={editingPayment.date}
                                onChange={(e) => setEditingPayment({ ...editingPayment, date: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Amount</label>
                            <input
                                type="number"
                                value={editingPayment.amount}
                                onChange={(e) => setEditingPayment({ ...editingPayment, amount: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Method</label>
                            <select
                                value={editingPayment.method}
                                onChange={(e) => setEditingPayment({ ...editingPayment, method: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="offline">Offline / Cash</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        {editingPayment.method === 'online' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                                <input
                                    type="text"
                                    value={editingPayment.transactionId}
                                    onChange={(e) => setEditingPayment({ ...editingPayment, transactionId: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="secondary" onClick={() => setIsEditPaymentModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleUpdatePayment}>
                                Update Transaction
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FeeManagement;