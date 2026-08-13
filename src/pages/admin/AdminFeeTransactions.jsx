import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminFeeTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ total_paid: 0, total_pending: 0, total_transactions: 0 });
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Filters
    const [search, setSearch] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal state for receipt preview
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchClasses();
        fetchTransactions();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/academic/classes`, { headers });
            setClasses(res.data.classes || []);
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const fetchSections = async (classNum) => {
        if (!classNum) {
            setSections([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/admin/academic/sections/${classNum}`, { headers });
            setSections(res.data.sections || []);
        } catch (err) {
            console.error('Error fetching sections:', err);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (className) params.class_name = className;
            if (section) params.section = section;
            if (paymentMode) params.payment_mode = paymentMode;
            if (statusFilter) params.status = statusFilter;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await axios.get(`${API_URL}/api/admin/fees/transactions`, { headers, params });
            if (res.data.success) {
                setTransactions(res.data.transactions || []);
                setStats(res.data.stats || { total_paid: 0, total_pending: 0, total_transactions: 0 });
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setClassName('');
        setSection('');
        setPaymentMode('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setSections([]);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, className, section, paymentMode, statusFilter, dateFrom, dateTo]);

    const getPaymentModeBadge = (mode) => {
        const m = String(mode || '').toLowerCase();
        if (m.includes('cash')) return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">💵 Cash</Badge>;
        if (m.includes('upi')) return <Badge variant="info" className="bg-purple-50 text-purple-700 border-purple-200">📱 UPI</Badge>;
        if (m.includes('online')) return <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">💻 Online</Badge>;
        if (m.includes('card')) return <Badge variant="warning" className="bg-indigo-50 text-indigo-700 border-indigo-200">💳 Card</Badge>;
        if (m.includes('cheque')) return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">🧾 Cheque</Badge>;
        return <Badge variant="secondary">{mode || 'N/A'}</Badge>;
    };

    const getStatusBadge = (status) => {
        const s = String(status || '').toLowerCase();
        if (s === 'paid') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">✅ Paid</span>;
        if (s === 'partial') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">⏳ Partial</span>;
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">❌ Unpaid</span>;
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Fee Transaction History Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const tableColumn = ['Receipt No', 'Date', 'Student Name', 'Unique ID', 'Class-Sec', 'Fee Type', 'Total (₹)', 'Paid (₹)', 'Pending (₹)', 'Mode', 'Status'];
        const tableRows = transactions.map(t => [
            t.receipt_no || '-',
            t.payment_date ? new Date(t.payment_date).toLocaleDateString('en-GB') : '-',
            t.student_name || '-',
            t.student_unique_id || '-',
            `${t.student_class || t.class_name || ''}-${t.student_section || ''}`,
            t.fee_type || '-',
            t.total_amount ? parseFloat(t.total_amount).toFixed(2) : '0.00',
            t.paid_amount ? parseFloat(t.paid_amount).toFixed(2) : '0.00',
            t.pending_amount ? parseFloat(t.pending_amount).toFixed(2) : '0.00',
            t.payment_mode || '-',
            t.status || '-'
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [30, 27, 75] }
        });

        doc.save(`Fee-Transactions-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const handleDownloadExcel = () => {
        const data = transactions.map(t => ({
            'Receipt No': t.receipt_no || '-',
            'Payment Date': t.payment_date ? new Date(t.payment_date).toLocaleString('en-GB') : '-',
            'Student Name': t.student_name || '-',
            'Student Unique ID': t.student_unique_id || '-',
            'Roll No': t.roll_no || '-',
            'Class': t.student_class || t.class_name || '-',
            'Section': t.student_section || '-',
            'Father Name': t.father_name || '-',
            'Fee Type': t.fee_type || '-',
            'Total Billed Amount (Rs)': parseFloat(t.total_amount || 0),
            'Paid Amount (Rs)': parseFloat(t.paid_amount || 0),
            'Pending Amount (Rs)': parseFloat(t.pending_amount || 0),
            'Payment Mode': t.payment_mode || '-',
            'Status': t.status || '-',
            'Received By': t.received_by_name || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Transactions');
        XLSX.writeFile(workbook, `Fee-Transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            header: 'Receipt No / Date',
            render: (row) => (
                <div>
                    <span className="font-bold text-slate-800 text-xs block">{row.receipt_no || `REC-${row.id}`}</span>
                    <span className="text-[10px] text-slate-400">
                        {row.payment_date ? new Date(row.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Student Info',
            render: (row) => (
                <div>
                    <span className="font-semibold text-slate-800 text-xs block">{row.student_name}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">
                        ID: {row.student_unique_id || 'N/A'} • Class {row.student_class || row.class_name}-{row.student_section} (Roll: {row.roll_no || 'N/A'})
                    </span>
                </div>
            )
        },
        {
            header: 'Fee Type / Description',
            render: (row) => <span className="text-xs text-slate-700 font-medium">{row.fee_type}</span>
        },
        {
            header: 'Amount Paid',
            render: (row) => (
                <div>
                    <span className="text-xs font-extrabold text-emerald-600 block">₹{parseFloat(row.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    {parseFloat(row.pending_amount || 0) > 0 && (
                        <span className="text-[10px] text-rose-500 font-medium">
                            Due: ₹{parseFloat(row.pending_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Payment Mode',
            render: (row) => getPaymentModeBadge(row.payment_mode)
        },
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status)
        },
        {
            header: 'Received By',
            render: (row) => <span className="text-xs text-slate-600 font-medium">{row.received_by_name || 'System Admin'}</span>
        },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => setSelectedReceipt(row)}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                    🧾 View Receipt
                </button>
            )
        }
    ];

    return (
        <div className="space-y-4 sm:space-y-6 pb-8">
            {/* Top Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-4 sm:p-6 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">🧾 Fee Transaction History</h1>
                    <p className="mt-1 text-indigo-100 text-xs sm:text-sm">
                        View, search, filter, and audit all student fee payment transaction records across the institution.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Collected Revenue</p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">
                                ₹{parseFloat(stats.total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center text-xl shadow-xs">
                            💰
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Pending Due Amount</p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-rose-900 mt-1">
                                ₹{parseFloat(stats.total_pending || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center text-xl shadow-xs">
                            ⏳
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total Transactions</p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-900 mt-1">
                                {stats.total_transactions || transactions.length} Records
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-200 text-indigo-800 flex items-center justify-center text-xl shadow-xs">
                            🧾
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter & Search Bar */}
            <Card className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <span>🔍 Filter & Search Records</span>
                        <span className="text-xs font-normal text-slate-500">({transactions.length} results)</span>
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={handleDownloadExcel} className="!text-xs !py-1.5 !px-3 flex items-center gap-1">
                            📊 Export Excel
                        </Button>
                        <Button variant="secondary" onClick={handleDownloadPDF} className="!text-xs !py-1.5 !px-3 flex items-center gap-1">
                            📄 Export PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* Search */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Student Name, ID, Receipt..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Class */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class</label>
                        <select
                            value={className}
                            onChange={(e) => {
                                setClassName(e.target.value);
                                setSection('');
                                fetchSections(e.target.value);
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.class_number}>Class {c.class_number}</option>
                            ))}
                        </select>
                    </div>

                    {/* Section */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                        <select
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            disabled={!className}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.section_code}>{s.section_code}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Mode */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Mode</label>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Modes</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Online">Online / Net Banking</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>

                    {/* Clear Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleClearFilters}
                            className="w-full py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                            ❌ Reset Filters
                        </button>
                    </div>
                </div>
            </Card>

            {/* Transactions Table */}
            <Card className="p-0 overflow-hidden">
                <Table
                    columns={columns}
                    data={transactions}
                    isLoading={loading}
                    emptyMessage="No fee transactions found matching the selected filters."
                />
            </Card>

            {/* Receipt Modal */}
            {selectedReceipt && (
                <Modal
                    isOpen={Boolean(selectedReceipt)}
                    onClose={() => setSelectedReceipt(null)}
                    title="🧾 Fee Payment Receipt"
                    size="md"
                    footer={
                        <div className="flex justify-between items-center w-full">
                            <Button variant="secondary" onClick={() => setSelectedReceipt(null)}>Close</Button>
                            <Button variant="primary" onClick={() => window.print()}>🖨️ Print Receipt</Button>
                        </div>
                    }
                >
                    <div className="p-4 border-2 border-indigo-100 rounded-xl bg-slate-50 space-y-4">
                        <div className="text-center border-b pb-3">
                            <h2 className="text-lg font-bold text-indigo-900">SCHOOL FEE PAYMENT RECEIPT</h2>
                            <p className="text-xs text-slate-500">Receipt No: <span className="font-mono font-bold text-slate-800">{selectedReceipt.receipt_no || `REC-${selectedReceipt.id}`}</span></p>
                            <p className="text-xs text-slate-500">Date: {selectedReceipt.payment_date ? new Date(selectedReceipt.payment_date).toLocaleString('en-IN') : 'N/A'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="font-semibold text-slate-500">Student Name:</span> <p className="font-bold text-slate-800">{selectedReceipt.student_name}</p></div>
                            <div><span className="font-semibold text-slate-500">Unique ID:</span> <p className="font-bold text-slate-800">{selectedReceipt.student_unique_id || 'N/A'}</p></div>
                            <div><span className="font-semibold text-slate-500">Class & Section:</span> <p className="font-bold text-slate-800">Class {selectedReceipt.student_class || selectedReceipt.class_name}-{selectedReceipt.student_section}</p></div>
                            <div><span className="font-semibold text-slate-500">Roll Number:</span> <p className="font-bold text-slate-800">{selectedReceipt.roll_no || 'N/A'}</p></div>
                            <div><span className="font-semibold text-slate-500">Father Name:</span> <p className="font-bold text-slate-800">{selectedReceipt.father_name || 'N/A'}</p></div>
                            <div><span className="font-semibold text-slate-500">Phone:</span> <p className="font-bold text-slate-800">{selectedReceipt.father_phone || 'N/A'}</p></div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-600">Fee Category:</span>
                                <span className="font-bold text-slate-800">{selectedReceipt.fee_type}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-600">Billed Total:</span>
                                <span className="font-bold text-slate-800">₹{parseFloat(selectedReceipt.total_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t">
                                <span className="font-bold text-emerald-700">Paid Amount:</span>
                                <span className="font-extrabold text-emerald-700 text-sm">₹{parseFloat(selectedReceipt.paid_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold text-rose-600">Remaining Balance:</span>
                                <span className="font-bold text-rose-600">₹{parseFloat(selectedReceipt.pending_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t">
                                <span className="font-semibold text-slate-600">Payment Mode:</span>
                                <span className="font-bold text-indigo-600">{selectedReceipt.payment_mode || 'Cash'}</span>
                            </div>
                        </div>

                        <div className="text-[10px] text-center text-slate-400 italic">
                            This is a system generated fee payment receipt. Received by: {selectedReceipt.received_by_name || 'School Admin'}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminFeeTransactions;
