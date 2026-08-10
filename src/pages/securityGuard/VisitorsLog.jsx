import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';

const VisitorsLog = () => {
    const [visitors, setVisitors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'all'
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVisitor, setEditingVisitor] = useState(null);

    const fetchVisitors = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/visitors?date=${filters.date}${filters.status !== 'all' ? `&status=${filters.status}` : ''}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setVisitors(res.data.visitors);
            } else {
                setError(res.data.message || 'Error fetching visitors');
            }
        } catch (err) {
            setError('Failed to load visitor log.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchVisitors();
    }, [fetchVisitors]);

    const handleAction = async (id, action, formData = null) => {
        const endpoint = action === 'check_in' ? 'check-in' : action === 'check_out' ? 'check-out' : '';
        const confirmMsg = action === 'check_in' ? 'Check in this visitor?' : 'Check out this visitor?';

        try {
            const token = localStorage.getItem('token');

            if (action === 'edit') {
                const res = await axios.put(`${API_URL}/api/visitors/${id}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    setIsEditModalOpen(false);
                    fetchVisitors();
                }
                return;
            }

            if (!window.confirm(confirmMsg)) return;

            const res = await axios.put(`${API_URL}/api/visitors/${id}/${endpoint}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                fetchVisitors();
            }
        } catch (err) {
            console.error(`Error during ${action}:`, err);
            alert(`Failed to ${action.replace('_', ' ')}. Please try again.`);
        }
    };

    const canEdit = (createdAt) => {
        if (!createdAt) return false;
        const created = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffInMinutes = (now - created) / (1000 * 60);
        return diffInMinutes <= 10;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        try {
            const [hours, minutes] = timeStr.split(':');
            let h = parseInt(hours);
            const m = minutes.substring(0, 2);
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h}:${m} ${ampm}`;
        } catch (e) { return timeStr; }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '—';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { return dateTimeStr; }
    };

    const getStatusBadge = (visitor) => {
        const { status, check_in_time, check_out_time } = visitor;

        let displayStatus = status;
        if (check_in_time && !check_out_time) displayStatus = 'checked_in';
        if (check_out_time) displayStatus = 'checked_out';

        const labels = {
            pending: { text: 'Awaiting Approval', class: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
            approved: { text: 'Ready for Entry', class: 'bg-green-50 text-green-600 border-green-100' },
            rejected: { text: 'Rejected', class: 'bg-red-50 text-red-600 border-red-100' },
            checked_in: { text: 'Inside', class: 'bg-blue-50 text-blue-600 border-blue-100' },
            checked_out: { text: 'Completed', class: 'bg-slate-50 text-slate-400 border-slate-100' }
        };
        const style = labels[displayStatus] || labels.pending;
        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border tracking-widest ${style.class}`}>
                {style.text}
            </span>
        );
    };

    const EditVisitorModal = ({ visitor, onClose, onSave }) => {
        const [formData, setFormData] = useState({
            visitor_name: visitor.visitor_name,
            phone: visitor.phone,
            whom_to_meet: visitor.whom_to_meet,
            purpose: visitor.purpose
        });

        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Edit Visitor Details</h3>
                            <p className="text-xs text-slate-500 font-medium">Corrections allowed within 10 minutes</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">✕</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visitor Name</label>
                            <input
                                type="text"
                                value={formData.visitor_name}
                                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Whom to Meet</label>
                                <input
                                    type="text"
                                    value={formData.whom_to_meet}
                                    onChange={(e) => setFormData({ ...formData, whom_to_meet: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purpose</label>
                                <input
                                    type="text"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                        <button onClick={() => onSave(formData)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">Save Changes</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">VisitorsLog</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage entries and exits for approved visitors</p>
                </div>

                <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                    <select
                        name="status"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="checked_in">Inside</option>
                        <option value="checked_out">Completed</option>
                    </select>
                    <button onClick={fetchVisitors} className="p-2.5 bg-white hover:bg-slate-50 text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95">
                        🔄
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-8">Visitor info</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Host / Purpose</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Appointment</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Log</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center">
                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synchronizing Log...</p>
                                    </td>
                                </tr>
                            ) : visitors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center">
                                        <p className="text-slate-400 font-bold text-lg">No visitor records found</p>
                                        <p className="text-slate-300 text-sm">Records for {new Date(filters.date).toLocaleDateString()} will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                visitors.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    {visitor.visitor_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-[15px]">{visitor.visitor_name}</p>
                                                    <p className="text-xs text-slate-400 font-medium"># {visitor.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-sm text-slate-700 font-bold italic mb-1">@{visitor.whom_to_meet}</p>
                                            <p className="text-[11px] text-slate-400 max-w-[200px] font-medium leading-tight">"{visitor.purpose}"</p>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="bg-slate-50 border border-slate-100 rounded-lg py-1 px-3 w-fit mx-auto">
                                                <p className="text-xs font-bold text-slate-600 tracking-tight">{formatTime(visitor.visit_time)}</p>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-2">
                                                {visitor.check_in_time && (
                                                    <div className="flex items-center gap-2 group/row">
                                                        <span className="text-[8px] font-black text-blue-600 uppercase border border-blue-100 bg-blue-50 px-2 py-0.5 rounded-md tracking-tighter">Enter</span>
                                                        <span className="text-xs font-bold text-slate-600">{formatDateTime(visitor.check_in_time)}</span>
                                                    </div>
                                                )}
                                                {visitor.check_out_time && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase border border-slate-100 bg-slate-50 px-2 py-0.5 rounded-md tracking-tighter">Exit</span>
                                                        <span className="text-xs font-bold text-slate-600">{formatDateTime(visitor.check_out_time)}</span>
                                                    </div>
                                                )}
                                                {!visitor.check_in_time && (
                                                    <span className="text-[10px] text-slate-300 font-bold italic uppercase tracking-widest pl-2">Pending entry</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            {getStatusBadge(visitor)}
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <div className="flex justify-end items-center gap-3">
                                                {/* Show Edit button if created within 10 minutes */}
                                                {canEdit(visitor.created_at) && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingVisitor(visitor);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-2.5 bg-slate-50 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                                                        title="Edit details (Only for 10 min)"
                                                    >
                                                        <span className="text-lg">✏️</span>
                                                    </button>
                                                )}

                                                {/* Show Check In button if approved but not checked in */}
                                                {visitor.status === 'approved' && !visitor.check_in_time && (
                                                    <button
                                                        onClick={() => handleAction(visitor.id, 'check_in')}
                                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95"
                                                    >
                                                        Check In
                                                    </button>
                                                )}
                                                {/* Show Check Out button if checked in but not checked out */}
                                                {visitor.check_in_time && !visitor.check_out_time && (
                                                    <button
                                                        onClick={() => handleAction(visitor.id, 'check_out')}
                                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95"
                                                    >
                                                        Check Out
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditModalOpen && editingVisitor && (
                <EditVisitorModal
                    visitor={editingVisitor}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingVisitor(null);
                    }}
                    onSave={(formData) => handleAction(editingVisitor.id, 'edit', formData)}
                />
            )}
        </div>
    );
};

export default VisitorsLog;
