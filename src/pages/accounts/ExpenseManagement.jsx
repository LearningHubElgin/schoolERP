import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [gstMode, setGstMode] = useState('none'); // 'none', 'including', 'excluding'
    const [gstPercent, setGstPercent] = useState(18);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        gst_amount: '',
        category: 'Maintenance',
        payment_method: 'cash',
        expense_date: new Date().toISOString().split('T')[0],
        expense_time: new Date().toTimeString().slice(0, 5),
        description: ''
    });

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'All'
    });

    useEffect(() => {
        fetchExpenses();
    }, [filters]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/api/accounts/expenses?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setExpenses(response.data.expenses);
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveExpense = async () => {
        try {
            const token = localStorage.getItem('token');
            let response;

            if (modalMode === 'add') {
                response = await axios.post(`${API_URL}/api/accounts/expenses`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (modalMode === 'edit') {
                response = await axios.put(`${API_URL}/api/accounts/expenses/${selectedExpenseId}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                toast.success(modalMode === 'add' ? "Expense added successfully" : "Expense updated successfully");
                setIsAddModalOpen(false);
                resetForm();
                fetchExpenses();
            }
        } catch (error) {
            console.error("Error saving expense:", error);
            toast.error("Failed to save expense");
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            amount: '',
            gst_amount: '',
            category: 'Maintenance',
            payment_method: 'cash',
            expense_date: new Date().toISOString().split('T')[0],
            expense_time: new Date().toTimeString().slice(0, 5),
            description: ''
        });
        setGstMode('none');
        setGstPercent(18);
        setSelectedExpenseId(null);
        setModalMode('add');
    };

    const handleEditClick = (expense) => {
        setFormData({
            title: expense.title,
            amount: expense.amount,
            gst_amount: expense.gst_amount,
            category: expense.category,
            payment_method: expense.payment_method,
            expense_date: new Date(expense.expense_date).toISOString().split('T')[0],
            expense_time: expense.expense_time || '10:00',
            description: expense.description || ''
        });
        // Determine GST mode based on data (simplified logic as we don't store the mode explicitly)
        if (parseFloat(expense.gst_amount) > 0) {
            setGstMode('excluding'); // Defaulting to excluding for edit if GST exists, user can adjust
        } else {
            setGstMode('none');
        }
        setSelectedExpenseId(expense.id);
        setModalMode('edit');
        setIsAddModalOpen(true);
    };

    const handleViewClick = (expense) => {
        handleEditClick(expense);
        setModalMode('view');
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/api/accounts/expenses/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Expense deleted");
                fetchExpenses();
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
            toast.error("Failed to delete expense");
        }
    };

    const columns = [
        {
            header: 'Date',
            accessor: 'expense_date',
            render: (row) => {
                if (!row.expense_date) return '-';
                const date = new Date(row.expense_date);
                if (isNaN(date.getTime())) return '-';
                // Show all dates including 1899 etc if present
                return date.toLocaleDateString('en-GB');
            }
        },
        {
            header: 'Time',
            accessor: 'expense_time',
            render: (row) => {
                if (!row.expense_time) return '-';
                // Assuming format HH:MM:SS
                const [hours, minutes] = row.expense_time.split(':');
                const date = new Date();
                date.setHours(hours);
                date.setMinutes(minutes);
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
        },
        { header: 'Title', accessor: 'title', render: (row) => <div className="font-medium">{row.title}</div> },
        { header: 'Category', accessor: 'category', render: (row) => <span className="px-2 py-1 bg-gray-100 rounded text-xs">{row.category}</span> },
        {
            header: 'Amount',
            accessor: 'amount',
            render: (row) => <span className="font-bold text-red-600">-₹{parseFloat(row.amount).toFixed(2)}</span>
        },
        {
            header: 'GST',
            accessor: 'gst_amount',
            render: (row) => parseFloat(row.gst_amount) > 0 ? <span className="text-gray-600">₹{parseFloat(row.gst_amount).toFixed(2)}</span> : '-'
        },
        {
            header: 'Total',
            accessor: 'total',
            render: (row) => {
                const total = parseFloat(row.amount || 0) + parseFloat(row.gst_amount || 0);
                return <span className="font-bold text-red-700">-₹{total.toFixed(2)}</span>;
            }
        },
        { header: 'Method', accessor: 'payment_method', render: (row) => row.payment_method.toUpperCase() },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleViewClick(row)} className="text-blue-500 hover:text-blue-700" title="View">
                        👁️
                    </button>
                    <button onClick={() => handleEditClick(row)} className="text-yellow-500 hover:text-yellow-700" title="Edit">
                        ✏️
                    </button>
                    <button onClick={() => handleDeleteExpense(row.id)} className="text-red-500 hover:text-red-700" title="Delete">
                        🗑️
                    </button>
                </div>
            )
        }
    ];

    const totalExpense = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">💸 Expense Management</h1>
                <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>+ Add Expense</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <p className="text-sm text-gray-600">Total Expenses (Visible)</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">₹{totalExpense.toFixed(2)}</p>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="border rounded px-3 py-2"
                        >
                            <option value="All">All Categories</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Salary">Salary</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Events">Events</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Expense Records">
                <Table columns={columns} data={expenses} isLoading={loading} />
            </Card>

            {/* Add/Edit/View Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={modalMode === 'add' ? "Add New Expense" : (modalMode === 'edit' ? "Edit Expense" : "Expense Details")}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            placeholder="e.g. Electricity Bill"
                            disabled={modalMode === 'view'}
                        />
                    </div>

                    {modalMode === 'view' && gstMode !== 'none' && (
                        <div className="mt-2 text-sm text-gray-600">
                            GST Mode: <span className="font-medium uppercase">{gstMode}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => {
                                    const amt = parseFloat(e.target.value) || 0;
                                    let gst = 0;
                                    if (gstMode === 'including') {
                                        gst = (amt * gstPercent / (100 + gstPercent)).toFixed(2);
                                    } else if (gstMode === 'excluding') {
                                        gst = (amt * gstPercent / 100).toFixed(2);
                                    }
                                    setFormData({ ...formData, amount: e.target.value, gst_amount: gst.toString() });
                                }}
                                className="w-full border rounded px-3 py-2"
                                placeholder="0.00"
                                disabled={modalMode === 'view'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.expense_date}
                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                disabled={modalMode === 'view'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input
                                type="time"
                                value={formData.expense_time}
                                onChange={(e) => setFormData({ ...formData, expense_time: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                disabled={modalMode === 'view'}
                            />
                        </div>
                    </div>

                    {/* GST Mode Toggle */}
                    <div>
                        <label className="block text-sm font-medium mb-2">GST Option</label>
                        <div className="flex gap-4 flex-wrap">
                            <label className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm ${gstMode === 'none' ? 'bg-gray-100 border-gray-400 font-medium' : 'border-gray-200'}`}>
                                <input type="radio" name="gstMode" value="none" checked={gstMode === 'none'}
                                    onChange={() => { setGstMode('none'); setFormData(f => ({ ...f, gst_amount: '0' })); }} />
                                No GST
                            </label>
                            <label className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm ${gstMode === 'including' ? 'bg-blue-50 border-blue-400 font-medium' : 'border-gray-200'}`}>
                                <input type="radio" name="gstMode" value="including" checked={gstMode === 'including'}
                                    onChange={() => {
                                        setGstMode('including');
                                        const amt = parseFloat(formData.amount) || 0;
                                        setFormData(f => ({ ...f, gst_amount: (amt * gstPercent / (100 + gstPercent)).toFixed(2) }));
                                    }} />
                                Including GST
                            </label>
                            <label className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm ${gstMode === 'excluding' ? 'bg-green-50 border-green-400 font-medium' : 'border-gray-200'}`}>
                                <input type="radio" name="gstMode" value="excluding" checked={gstMode === 'excluding'}
                                    onChange={() => {
                                        setGstMode('excluding');
                                        const amt = parseFloat(formData.amount) || 0;
                                        setFormData(f => ({ ...f, gst_amount: (amt * gstPercent / 100).toFixed(2) }));
                                    }} />
                                Excluding GST
                            </label>
                        </div>
                    </div>

                    {/* GST Percentage Chooser */}
                    {gstMode !== 'none' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">GST Rate (%)</label>
                            <div className="flex gap-2 flex-wrap">
                                {[5, 12, 18, 28].map(pct => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => {
                                            setGstPercent(pct);
                                            const amt = parseFloat(formData.amount) || 0;
                                            let gst = 0;
                                            if (gstMode === 'including') {
                                                gst = (amt * pct / (100 + pct)).toFixed(2);
                                            } else {
                                                gst = (amt * pct / 100).toFixed(2);
                                            }
                                            setFormData(f => ({ ...f, gst_amount: gst }));
                                        }}
                                        className={`px-4 py-2 rounded border text-sm font-medium transition-all ${gstPercent === pct
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        placeholder="Custom"
                                        className={`w-20 px-2 py-2 border rounded text-sm ${![5, 12, 18, 28].includes(gstPercent) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                                            }`}
                                        value={![5, 12, 18, 28].includes(gstPercent) ? gstPercent : ''}
                                        onChange={(e) => {
                                            const pct = parseFloat(e.target.value) || 0;
                                            setGstPercent(pct);
                                            const amt = parseFloat(formData.amount) || 0;
                                            let gst = 0;
                                            if (gstMode === 'including') {
                                                gst = (amt * pct / (100 + pct)).toFixed(2);
                                            } else {
                                                gst = (amt * pct / 100).toFixed(2);
                                            }
                                            setFormData(f => ({ ...f, gst_amount: gst }));
                                        }}
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GST Calculation Display */}
                    {gstMode !== 'none' && formData.amount && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Base Amount:</span>
                                    <p className="font-bold">₹{gstMode === 'including'
                                        ? (parseFloat(formData.amount) - parseFloat(formData.gst_amount || 0)).toFixed(2)
                                        : parseFloat(formData.amount || 0).toFixed(2)
                                    }</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">GST ({gstPercent}%):</span>
                                    <p className="font-bold text-purple-600">₹{parseFloat(formData.gst_amount || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total:</span>
                                    <p className="font-bold text-green-700">₹{gstMode === 'including'
                                        ? parseFloat(formData.amount || 0).toFixed(2)
                                        : (parseFloat(formData.amount || 0) + parseFloat(formData.gst_amount || 0)).toFixed(2)
                                    }</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                disabled={modalMode === 'view'}
                            >
                                <option value="Maintenance">Maintenance</option>
                                <option value="Salary">Salary</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Events">Events</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Method</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                disabled={modalMode === 'view'}
                            >
                                <option value="cash">Cash</option>
                                <option value="online">Online / Bank</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows="3"
                            disabled={modalMode === 'view'}
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                            {modalMode === 'view' ? "Close" : "Cancel"}
                        </Button>
                        {modalMode !== 'view' && (
                            <Button variant="primary" onClick={handleSaveExpense}>
                                {modalMode === 'add' ? "Save Expense" : "Update Expense"}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ExpenseManagement;
