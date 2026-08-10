import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AppointmentsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showHistory, setShowHistory] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleCheckIn = async (id) => {
        if (!window.confirm("Confirm check-in for this scheduled visitor?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/visitors/${id}/check-in`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                alert('Visitor checked in successfully!');
                fetchAppointments(); 
            }
        } catch (err) {
            console.error('Error during check-in:', err);
            alert('Failed to check in visitor. Please try again.');
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'approved': return 'info';
            case 'checked_in': return 'success';
            case 'checked_out': return 'neutral';
            case 'cancelled': return 'danger';
            default: return 'pending';
        }
    };

    const getStatusText = (status) => {
        if (status === 'approved') return '⭐ Scheduled';
        return status.replace('_', ' ').toUpperCase();
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.whom_to_meet && app.whom_to_meet.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Section - Perfectly Matched to Dashboard */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                            {showHistory ? "Appointment History 📜" : "Visitor Appointments 📅"}
                        </h1>
                        <p className="mt-2 text-indigo-100 text-sm md:text-lg max-w-2xl">
                            {showHistory 
                                ? "Displaying records of past visitor movements for the school premises." 
                                : `Managing ${filteredAppointments.length} upcoming visitors scheduled for today's entry.`}
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full md:w-auto px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>{showHistory ? "📅" : "📜"}</span>
                        {showHistory ? "Show Upcoming" : "Show History"}
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by visitor or host name..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 w-full md:w-56 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all group">
                        <span className="text-lg">🎭</span>
                        <select
                            className="w-full bg-transparent border-none outline-none font-bold text-slate-700 text-sm cursor-pointer appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">View All Status</option>
                            <option value="approved">⭐ Scheduled</option>
                            <option value="checked_in">🏢 Inside Premises</option>
                            <option value="cancelled">❌ Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : filteredAppointments.length > 0 ? (
                    filteredAppointments.map((app) => (
                        <Card 
                            key={app.id} 
                            variant="elevated"
                            className="hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Time Column */}
                                <div className="flex lg:flex-col items-center lg:items-start justify-center lg:justify-start lg:min-w-[140px] lg:border-r border-slate-100 pr-0 lg:pr-6 gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        📅
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <p className="text-lg font-bold text-slate-800">
                                            {new Date(app.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-indigo-600 font-bold tracking-tight mt-0.5 uppercase">
                                            ⏰ {new Date(`2000-01-01T${app.visit_time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </p>
                                    </div>
                                </div>

                                {/* Main Column */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                                                {app.visitor_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg md:text-xl">{app.visitor_name}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                                                    📞 {app.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusVariant(app.status)} size="sm">
                                            {getStatusText(app.status)}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Host & Purpose</p>
                                            <p className="text-slate-700 font-bold leading-tight">
                                                👤 Meeting With: <span className="text-indigo-600 italic">"{app.whom_to_meet}"</span>
                                            </p>
                                            <p className="text-slate-600 text-sm mt-1 font-medium">
                                                📝 {app.purpose}
                                            </p>
                                        </div>
                                        {app.notes && (
                                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Security Note</p>
                                                <p className="text-amber-800 text-sm italic font-medium">
                                                    💡 {app.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex lg:flex-col justify-center items-center gap-3 lg:min-w-[180px] lg:border-l border-slate-100 pl-0 lg:pl-6 pt-2 lg:pt-0">
                                    {app.status === 'approved' ? (
                                        <button 
                                            onClick={() => handleCheckIn(app.id)}
                                            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Confirm Entry ✅
                                        </button>
                                    ) : app.status === 'checked_in' ? (
                                        <div className="text-emerald-600 font-bold text-sm flex flex-col items-center gap-1 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-full">
                                            <span className="text-2xl">🛡️</span>
                                            <span>Already Inside</span>
                                        </div>
                                    ) : (
                                        <div className="text-slate-300 italic font-medium text-xs">
                                            No Actions Available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center">
                        <p className="text-slate-400 italic">No appointments found matching filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsList;
