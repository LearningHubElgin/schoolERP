import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

const FeeManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedFeeRecordId, setSelectedFeeRecordId] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('offline');
    const [transactionId, setTransactionId] = useState('');

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
                    setStudents(response.data.students);
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

    // Open Payment Modal
    const handleOpenPayment = (student) => {
        setSelectedStudent(student);

        // ... existing fee selection logic ...
        let defaultFee = null;
        if (student.fee_records && student.fee_records.length > 0) {
            defaultFee = student.fee_records.find(r => r.status !== 'paid') || student.fee_records[0];
        }

        if (defaultFee) {
            setSelectedFeeRecordId(defaultFee.id);
            setPaymentAmount(defaultFee.pending || '');
        } else {
            setSelectedFeeRecordId(null);
            setPaymentAmount(student.pending_amount || '');
        }

        setPaymentMethod('offline');
        setTransactionId('');
        setIsPaymentModalOpen(true);
    };

    // Record Payment
    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // Validate against selected fee record pending amount
        let pendingAmountToCheck = selectedStudent.pending_amount;
        if (selectedFeeRecordId && selectedStudent.fee_records) {
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
    const columns = [
        {
            header: 'Roll No',
            accessor: 'roll_no',
            render: (row) => <span className="font-mono font-medium">{row.roll_no}</span>
        },
        {
            header: 'Student Name',
            accessor: 'student_name',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.student_name}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                </div>
            )
        },
        {
            header: 'Class',
            accessor: 'class_name',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.class_name}</div>
                    <div className="text-xs text-gray-500">Section {row.section_name}</div>
                </div>
            )
        },
        {
            header: 'Fee Types',
            render: (row) => (
                <div className="flex flex-col gap-1 items-start">
                    {row.fee_records && row.fee_records.length > 0 ? (
                        row.fee_records.map(r => (
                            <span key={r.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.type.includes('Fail') ? 'bg-red-100 text-red-700' : 
                                r.type.includes('Repeat') ? 'bg-orange-100 text-orange-700' : 
                                'bg-blue-50 text-blue-600'
                            }`}>
                                {r.type} {r.academic_year ? `(${r.academic_year})` : ''}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Standard</span>
                    )}
                </div>
            )
        },
        {
            header: 'Total Fee',
            accessor: 'total_amount',
            render: (row) => (
                row.total_amount !== null && row.total_amount !== undefined
                    ? <span className="font-bold text-gray-700">₹{parseFloat(row.total_amount).toFixed(2)}</span>
                    : <span className="text-gray-400 text-sm">Not Set</span>
            )
        },
        {
            header: 'Paid',
            accessor: 'paid_amount',
            render: (row) => (
                row.paid_amount
                    ? <span className="font-medium text-green-600">₹{parseFloat(row.paid_amount).toFixed(2)}</span>
                    : <span className="text-gray-400">₹0.00</span>
            )
        },
        {
            header: 'Pending',
            accessor: 'pending_amount',
            render: (row) => (
                row.pending_amount
                    ? <span className="font-medium text-orange-600">₹{parseFloat(row.pending_amount).toFixed(2)}</span>
                    : <span className="text-gray-400">₹0.00</span>
            )
        },
        {
            header: 'Status',
            accessor: 'fee_status',
            render: (row) => {
                if (row.needs_fee_record && (!row.fee_records || row.fee_records.length === 0)) {
                    return <Badge variant="secondary">No Fee Record</Badge>;
                }

                // Handle 'not_available' status (no fee structure set)
                if (row.fee_status === 'not_available') {
                    return <Badge variant="secondary">Not Available</Badge>;
                }

                return (
                    <Badge
                        variant={
                            row.fee_status === 'paid' ? 'success' :
                                row.fee_status === 'overdue' ? 'danger' :
                                    'warning'
                        }
                    >
                        {row.fee_status === 'pending' ? 'Pending' :
                            row.fee_status === 'paid' ? 'Paid' :
                                row.fee_status || 'Pending'}
                    </Badge>
                );
            }
        }
    ];

    const actions = (row) => (
        <div className="flex gap-2 flex-wrap">
            {row.fee_status !== 'paid' && row.total_amount && (
                <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleOpenPayment(row)}
                >
                    Collect Fee
                </Button>
            )}
            {row.fee_records && row.fee_records.length > 0 && (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewPaymentHistory(row)}
                >
                    History
                </Button>
            )}
            {!row.total_amount && (
                <span className="text-xs text-gray-500 italic">No fee structure set for this class</span>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Student Fee Management</h1>
                <div className="text-sm text-gray-600">
                    Total Students: <span className="font-bold">{students.length}</span>
                </div>
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className={`grid grid-cols-1 ${filters.class && isHigherSecondary(filters.class) ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-4`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Student
                        </label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Name or Roll No..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            name="class"
                            value={filters.class}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group/Stream</label>
                            <select
                                name="stream"
                                value={filters.stream}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select
                            name="section"
                            value={filters.section}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Sections</option>
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.code}>
                                    Section {sec.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="No Fee Record">No Fee Record</option>
                        </select>
                    </div>
                </div>

                <Table columns={columns} data={students} actions={actions} isLoading={loading} />
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

            {/* Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Collect Fee Payment"
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p><strong>Student:</strong> {selectedStudent.student_name}</p>
                            <p><strong>Roll No:</strong> {selectedStudent.roll_no}</p>
                            <p className="mt-2 text-sm text-gray-500 border-t pt-2">Total Outstanding: <span className="font-bold text-orange-600">₹{parseFloat(selectedStudent.pending_amount).toFixed(2)}</span></p>
                        </div>

                        {/* Fee Record Selection */}
                        {selectedStudent.fee_records && selectedStudent.fee_records.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Fee to Pay</label>
                                <select
                                    value={selectedFeeRecordId || ''}
                                    onChange={(e) => {
                                        const recordId = parseInt(e.target.value);
                                        setSelectedFeeRecordId(recordId);
                                        const record = selectedStudent.fee_records.find(r => r.id === recordId);
                                        if (record) {
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
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <option value="offline">Offline</option>
                                <option value="online">Online</option>
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
                )
                }
            </Modal >

            {/* Payment History Modal */}
            <Modal
                isOpen={isPaymentHistoryModalOpen}
                onClose={() => setIsPaymentHistoryModalOpen(false)}
                title="Payment History"
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p><strong>Student:</strong> {selectedStudent.student_name}</p>
                            <p><strong>Roll No:</strong> {selectedStudent.roll_no}</p>
                        </div>

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
                                                        Type
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
                                                    return (
                                                        <tr key={payment.id}>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {isBill ? (
                                                                    <Badge variant="secondary">Bill (Invoice)</Badge>
                                                                ) : (
                                                                    <Badge variant="success">Payment</Badge>
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
                )}
            </Modal>

            {/* Delete Confirmation Popup */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {isDeletingBill ? 'Delete Bill Record' : 'Delete Payment Record'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {isDeletingBill 
                                    ? 'Are you sure you want to delete this bill record? This will completely remove this fee obligation from the student.' 
                                    : 'Are you sure you want to delete this payment record? This action cannot be undone.'}
                            </p>
                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => { setIsDeleteConfirmOpen(false); setDeletingPaymentId(null); setIsDeletingBill(false); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1"
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