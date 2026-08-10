import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import { 
    Calendar, 
    User, 
    Phone, 
    MessageSquare, 
    Clock, 
    Plus,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    Edit,
    Trash2,
    XCircle
} from 'lucide-react';

const AdminVisitorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        visitor_name: '',
        phone: '',
        whom_to_meet: '',
        purpose: '',
        visit_date: '',
        visit_time: '',
        notes: ''
    });

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/visitors/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setAppointments(res.data.appointments);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            if (editingId) {
                // Edit existing appointment
                const res = await axios.put(`${API_URL}/api/visitors/${editingId}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({
                        visitor_name: '', phone: '', whom_to_meet: '', purpose: '', visit_date: '', visit_time: '', notes: ''
                    });
                    fetchAppointments();
                }
            } else {
                // Create new appointment
                const res = await axios.post(`${API_URL}/api/visitors/appointment`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    setIsModalOpen(false);
                    setFormData({
                        visitor_name: '', phone: '', whom_to_meet: '', purpose: '', visit_date: '', visit_time: '', notes: ''
                    });
                    fetchAppointments();
                }
            }
        } catch (err) {
            alert(editingId ? 'Failed to update appointment' : 'Failed to schedule appointment');
        }
    };

    const handleEdit = (app) => {
        setEditingId(app.id);
        setFormData({
            visitor_name: app.visitor_name,
            phone: app.phone,
            whom_to_meet: app.whom_to_meet,
            purpose: app.purpose,
            visit_date: app.visit_date ? app.visit_date.split('T')[0] : '',
            visit_time: app.visit_time,
            notes: app.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently DELETE this appointment?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_URL}/api/visitors/appointment/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                fetchAppointments();
            }
        } catch (err) {
            alert('Failed to delete appointment');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to CANCEL this appointment?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/visitors/${id}/status`, 
                { status: 'rejected' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.data.success) {
                fetchAppointments();
            }
        } catch (err) {
            alert('Failed to cancel appointment');
        }
    };

    const filteredAppointments = appointments.filter(app => 
        app.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.whom_to_meet.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                            <Calendar className="w-5 h-5 md:w-6 md:h-6" /> Visitor Appointments
                        </h1>
                        <p className="mt-1 text-blue-100 text-xs md:text-sm">Pre-schedule and manage visitor entry requests</p>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                visitor_name: '', phone: '', whom_to_meet: '', purpose: '', visit_date: '', visit_time: '', notes: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-white text-blue-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Appointment
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search visitors or host..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-8">Visitor Details</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Host/Meeting With</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                                        <p className="font-bold text-slate-400 uppercase tracking-widest">Loading records...</p>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">No Appointments Found</h3>
                                        <p className="text-slate-500 mt-1 max-w-xs mx-auto">Schedule a new appointment to see it listed here.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((app) => (
                                    <tr key={app.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                                                    {app.visitor_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800 text-[15px]">{app.visitor_name}</p>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                                            app.status === 'approved' 
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                            : 'bg-red-50 text-red-600 border-red-100'
                                                        }`}>
                                                            {app.status === 'approved' ? 'Scheduled' : 'Cancelled'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                        <Phone className="w-3.5 h-3.5 text-slate-300" /> {app.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2.5 text-slate-700 font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl w-fit">
                                                <User className="w-4 h-4 text-blue-500" />
                                                {app.whom_to_meet}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className={app.status === 'rejected' ? 'opacity-50' : ''}>
                                                <p className="font-bold text-slate-800">{new Date(app.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1.5 mt-0.5 uppercase tracking-wide">
                                                    <Clock className="w-3.5 h-3.5" /> 
                                                    {new Date(`2000-01-01T${app.visit_time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-5 max-w-[200px]">
                                            <p className={`text-sm font-medium italic ${app.status === 'rejected' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                                "{app.purpose}"
                                            </p>
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <div className="flex justify-end items-center gap-2">
                                                {app.status === 'approved' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEdit(app)}
                                                            className="p-2.5 bg-white hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                                                            title="Edit Appointment"
                                                        >
                                                            <Edit className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCancel(app.id)}
                                                            className="p-2.5 bg-white hover:bg-slate-50 text-slate-400 hover:text-orange-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                                                            title="Cancel Appointment"
                                                        >
                                                            <XCircle className="w-4.5 h-4.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleEdit(app)}
                                                        className="p-2.5 bg-white hover:bg-slate-50 text-slate-400 hover:text-green-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                                                        title="Re-schedule / Edit"
                                                    >
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(app.id)}
                                                    className="p-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {editingId ? 'Update Appointment' : 'Schedule Appointment'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {editingId ? 'Modify existing appointment details' : 'Pre-approve a visitor for future entry'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 pl-1">Visitor Name</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        value={formData.visitor_name}
                                        onChange={(e) => setFormData({...formData, visitor_name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 pl-1">Phone Number</label>
                                    <input 
                                        required
                                        type="tel"
                                        placeholder="+91 Mobile number"
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 pl-1">Whom to Meet</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="e.g. Principal"
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        value={formData.whom_to_meet}
                                        onChange={(e) => setFormData({...formData, whom_to_meet: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 pl-1">Purpose</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="Reason for visit"
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 pl-1">Visit Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                                        value={formData.visit_date}
                                        onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 pl-1">Visit Time</label>
                                    <input 
                                        required
                                        type="time"
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                                        value={formData.visit_time}
                                        onChange={(e) => setFormData({...formData, visit_time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 pl-1">Additional Notes (Optional)</label>
                                <textarea 
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 min-h-[100px]"
                                    placeholder="Any special instructions..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95"
                                    >
                                        {editingId ? 'Save Changes' : 'Confirm Appointment'}
                                    </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVisitorAppointments;
