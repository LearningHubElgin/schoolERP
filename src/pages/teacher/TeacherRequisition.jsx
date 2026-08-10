import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const CreateRequisition = () => {
    const [formData, setFormData] = useState({
        item: '',
        quantity: '',
        description: '',
        urgency: 'Medium',
        category: 'Educational Equipment',
    });

    const [teacherRequisitions, setTeacherRequisitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const isSameDayAsToday = (dateInput) => {
        if (!dateInput) return false;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (typeof dateInput === 'string') {
            const rawStr = dateInput.split('T')[0].split(' ')[0];
            if (rawStr === todayStr) return true;
        }

        const d = new Date(dateInput);
        if (!isNaN(d.getTime())) {
            const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (localStr === todayStr) return true;
        }

        return false;
    };

    const fetchRequisitions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/my-requisitions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeacherRequisitions(data);
            }
        } catch (error) {
            console.error('Error fetching requisitions:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStartEdit = (req) => {
        setEditingItem(req);
        setFormData({
            item: req.item || '',
            quantity: req.quantity || '',
            description: req.description || '',
            urgency: req.urgency || 'Medium',
            category: req.category || 'Educational Equipment',
        });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setFormData({
            item: '',
            quantity: '',
            description: '',
            urgency: 'Medium',
            category: 'Educational Equipment'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingItem
                ? `${API_URL}/api/teacher/requisitions/${editingItem.id}`
                : `${API_URL}/api/teacher/requisitions`;
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    item: formData.item,
                    quantity: parseInt(formData.quantity),
                    description: formData.description,
                    urgency: formData.urgency,
                    category: formData.category,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success !== false) {
                alert(editingItem ? 'Requisition updated successfully!' : 'Requisition submitted successfully!');
                handleCancelEdit();
                fetchRequisitions();
            } else {
                alert(data.message || 'Failed to submit requisition');
            }
        } catch (error) {
            console.error('Error submitting requisition:', error);
            alert('Failed to submit requisition');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (req) => {
        if (!isSameDayAsToday(req.submitted_date)) {
            alert('Requisitions can only be deleted on the day they were submitted.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${req.item}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/requisitions/${req.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success !== false) {
                alert('Requisition deleted successfully!');
                fetchRequisitions();
            } else {
                alert(data.message || 'Failed to delete requisition');
            }
        } catch (error) {
            console.error('Error deleting requisition:', error);
            alert('Failed to delete requisition');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        let str = String(dateString).split('T')[0].split(' ')[0];
        const parts = str.split('-');
        if (parts.length === 3) {
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-6">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-md">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold">Requisition Portal 📋</h1>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm max-w-2xl">
                        Request educational equipment, stationery, or supplies for your department and track their approval status.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
                <div className="absolute bottom-0 right-10 -mb-10 w-32 h-32 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 items-start">
                {/* Create/Edit Form */}
                <Card 
                    title={editingItem ? "Edit Request" : "New Request"} 
                    subtitle={editingItem ? `Editing Request #${editingItem.id}` : "Submit your requirements"} 
                    variant="elevated" 
                    className="!p-4"
                >
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Item Name</label>
                            <Input
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                placeholder="e.g., Scientific Calculator, Whiteboard Markers"
                                required
                                className="!mb-0"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none"
                                >
                                    <option value="Educational Equipment">Educational Equipment</option>
                                    <option value="Books">Books</option>
                                    <option value="Lab Supplies">Lab Supplies</option>
                                    <option value="Stationery">Stationery</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Urgency Level</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, urgency: level })}
                                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                                            formData.urgency === level
                                                ? level === 'High' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                                                    : level === 'Medium' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                                                    : 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Requirement Details</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Why is this item needed? Provide specific details."
                                required
                                rows="3"
                                className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-2">
                            {editingItem && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="w-1/3 h-10 rounded-lg font-bold"
                                >
                                    Cancel Edit
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                className={`${editingItem ? 'w-2/3' : 'w-full'} h-10 rounded-lg font-bold shadow-md shadow-indigo-100`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {editingItem ? 'Updating...' : 'Submitting Request...'}
                                    </span>
                                ) : (
                                    editingItem ? 'Update Requisition' : 'Send Requisition'
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* My Requisitions */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Requests</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{teacherRequisitions.length} Total</span>
                    </div>

                    <div className="space-y-2">
                        {teacherRequisitions.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-500 text-xs font-medium">No requisition history found.</p>
                            </div>
                        ) : (
                            teacherRequisitions.map((req) => {
                                const canDelete = isSameDayAsToday(req.submitted_date);
                                const isPending = req.status === 'Pending';

                                return (
                                    <div key={req.id} className="group bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-slate-800 text-xs md:text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {req.item}
                                                </h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold border border-indigo-100">
                                                        {req.category}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                                        req.urgency === 'High'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                            : req.urgency === 'Medium'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                        {req.urgency} Priority
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Badge
                                                    variant={
                                                        req.status === 'Approved' ? 'approved' :
                                                        req.status === 'Rejected' ? 'rejected' : 'pending'
                                                    }
                                                    className="!rounded text-[10px] font-bold px-1.5 py-0.5"
                                                >
                                                    {req.status}
                                                </Badge>
                                                {isPending && canDelete && (
                                                    <button
                                                        onClick={() => handleStartEdit(req)}
                                                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold border border-blue-200 transition-colors"
                                                        title="Edit Request (Same day only)"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(req)}
                                                        className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[10px] font-bold border border-rose-200 transition-colors"
                                                        title="Delete Request (Same day only)"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-[11px] leading-snug line-clamp-2 md:line-clamp-none mb-2">{req.description}</p>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                                            <div className="flex items-center gap-3">
                                                <span>Qty: {req.quantity}</span>
                                                <span>Date: {formatDate(req.submitted_date)}</span>
                                            </div>
                                            {req.status === 'Approved' && req.approved_date && (
                                                <span className="text-emerald-600">Approved: {req.approved_date}</span>
                                            )}
                                            {req.status === 'Rejected' && req.rejected_date && (
                                                <span className="text-rose-600">Rejected: {req.rejected_date}</span>
                                            )}
                                        </div>

                                        {req.rejection_reason && (
                                            <div className="mt-4 p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                                                <p className="text-xs font-bold text-rose-600 mb-1">Admin Feedback:</p>
                                                <p className="text-xs text-rose-700 italic">"{req.rejection_reason}"</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRequisition;