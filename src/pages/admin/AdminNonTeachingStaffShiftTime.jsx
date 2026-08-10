import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

const SHIFT_PRESETS = [
    { name: 'Morning', start: '06:00', end: '14:00' },
    { name: 'Day', start: '09:00', end: '17:00' },
    { name: 'Evening', start: '14:00', end: '22:00' },
    { name: 'Night', start: '22:00', end: '06:00' },
];

const formatTime12 = (time24) => {
    if (!time24) return '—';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};

const AdminNonTeachingStaffShiftTime = () => {
    const [staffList, setStaffList] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        user_id: '',
        shift_name: 'Day',
        start_time: '09:00',
        end_time: '17:00',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [staffRes, shiftRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/non-teaching-staff`, { headers }),
                fetch(`${API_URL}/api/admin/non-teaching-staff-shifts`, { headers }),
            ]);

            const staffData = await staffRes.json();
            const shiftData = await shiftRes.json();

            if (staffData.success) setStaffList(staffData.staff);
            if (shiftData.success) setShifts(shiftData.shifts);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handlePreset = (preset) => {
        setForm(prev => ({ ...prev, shift_name: preset.name, start_time: preset.start, end_time: preset.end }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.user_id || !form.start_time || !form.end_time || !form.effective_from) {
            toast.error('Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${API_URL}/api/admin/non-teaching-staff-shifts/${editingId}`
                : `${API_URL}/api/admin/non-teaching-staff-shifts`;

            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? 'Shift updated!' : 'Shift assigned!');
                resetForm();
                fetchData();
            } else {
                toast.error(data.message || 'Failed');
            }
        } catch (err) {
            toast.error('Server error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (shift) => {
        setEditingId(shift.id);
        setForm({
            user_id: shift.user_id,
            shift_name: shift.shift_name,
            start_time: shift.start_time?.substring(0, 5),
            end_time: shift.end_time?.substring(0, 5),
            effective_from: shift.effective_from?.split('T')[0],
            effective_to: shift.effective_to?.split('T')[0] || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shift?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/non-teaching-staff-shifts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) { toast.success('Shift deleted'); fetchData(); }
            else toast.error(data.message);
        } catch (err) {
            toast.error('Server error');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ user_id: '', shift_name: 'Day', start_time: '09:00', end_time: '17:00', effective_from: new Date().toISOString().split('T')[0], effective_to: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 w-full space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-700 to-indigo-800 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative flex items-center gap-4 md:gap-6">
                    <div className="text-3xl md:text-4xl">⏰</div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight">Shift Time Management</h1>
                        <p className="text-violet-100 text-xs md:text-sm font-medium mt-1">Assign and manage shifts for non-teaching staff</p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-800 uppercase tracking-tight">
                            {editingId ? '✏️ Edit Shift' : '➕ Assign New Shift'}
                        </h2>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {/* Presets */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Quick Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {SHIFT_PRESETS.map(p => (
                                <button key={p.name} type="button" onClick={() => handlePreset(p)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                                        form.shift_name === p.name
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                    }`}
                                >
                                    {p.name} ({formatTime12(p.start)} – {formatTime12(p.end)})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Staff Select */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Staff Member *</label>
                            <select value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700 text-sm" required>
                                <option value="">— Select Staff —</option>
                                {staffList.map(s => <option key={s.user_id} value={s.user_id}>{s.name} ({s.designation})</option>)}
                            </select>
                        </div>

                        {/* Shift Name */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Shift Name</label>
                            <input type="text" value={form.shift_name} onChange={e => setForm(p => ({ ...p, shift_name: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700 text-sm"
                                placeholder="e.g. Morning, Evening" />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Start Time *</label>
                            <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700 text-sm" required />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">End Time *</label>
                            <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700 text-sm" required />
                        </div>

                        {/* Effective From */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Effective From *</label>
                            <input type="date" value={form.effective_from} onChange={e => setForm(p => ({ ...p, effective_from: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700 text-sm" required />
                        </div>

                        {/* Effective To */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Effective To <span className="text-gray-400">(optional)</span></label>
                            <input type="date" value={form.effective_to} onChange={e => setForm(p => ({ ...p, effective_to: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700 text-sm" />
                        </div>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                        {submitting ? 'Saving...' : editingId ? '💾 Update Shift' : '⏰ Assign Shift'}
                    </button>
                </form>
            </Card>

            {/* Shifts List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">📋 Assigned Shifts</h2>
                <Card className="p-0 rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white">
                    {shifts.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">
                            <div className="text-4xl mb-3">⏰</div>
                            <p className="font-semibold">No shifts assigned yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {shifts.map(shift => (
                                    <div key={shift.id} className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-indigo-50 flex items-center justify-center shrink-0">
                                                    {shift.photo
                                                        ? <img src={`${API_URL}${shift.photo}`} className="w-full h-full object-cover" alt="" />
                                                        : <span className="text-xs font-bold text-indigo-400">{shift.staff_name?.charAt(0)}</span>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{shift.staff_name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{shift.designation}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-lg shrink-0">
                                                {shift.shift_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <span>🕐 {formatTime12(shift.start_time?.substring(0,5))} – {formatTime12(shift.end_time?.substring(0,5))}</span>
                                            <span>📅 {shift.effective_from?.split('T')[0]}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(shift)} className="flex-1 text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-lg border border-indigo-100">Edit</button>
                                            <button onClick={() => handleDelete(shift.id)} className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
                                        <tr>
                                            <th className="px-6 py-4">Staff</th>
                                            <th className="px-6 py-4">Shift</th>
                                            <th className="px-6 py-4">Timing</th>
                                            <th className="px-6 py-4">Effective From</th>
                                            <th className="px-6 py-4">Effective To</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {shifts.map(shift => (
                                            <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 bg-indigo-50 flex items-center justify-center shrink-0">
                                                            {shift.photo
                                                                ? <img src={`${API_URL}${shift.photo}`} className="w-full h-full object-cover" alt="" />
                                                                : <span className="text-xs font-bold text-indigo-400">{shift.staff_name?.charAt(0)}</span>}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{shift.staff_name}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{shift.designation}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg">{shift.shift_name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                                                    {formatTime12(shift.start_time?.substring(0,5))} – {formatTime12(shift.end_time?.substring(0,5))}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{shift.effective_from?.split('T')[0]}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{shift.effective_to?.split('T')[0] || <span className="text-green-600 font-semibold">Ongoing</span>}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button onClick={() => handleEdit(shift)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">Edit</button>
                                                    <button onClick={() => handleDelete(shift.id)} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminNonTeachingStaffShiftTime;
