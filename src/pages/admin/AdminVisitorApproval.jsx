import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';

const AdminVisitorApproval = () => {
    const [pendingVisitors, setPendingVisitors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isHistoryMode, setIsHistoryMode] = useState(false);

    const fetchPendingVisitors = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            // Use selected date for history or current date by default
            const res = await axios.get(`${API_URL}/api/visitors?date=${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setPendingVisitors(res.data.visitors);
                if (selectedDate === new Date().toISOString().split('T')[0]) {
                    localStorage.setItem('visitor_data', JSON.stringify(res.data.visitors));
                }
            } else {
                setError(res.data.message || 'Error fetching visitors');
            }
        } catch (err) {
            console.log('Backend API failed, trying localStorage backup...');
            const saved = localStorage.getItem('visitor_data');
            if (saved && selectedDate === new Date().toISOString().split('T')[0]) {
                setPendingVisitors(JSON.parse(saved));
            } else {
                setError('Failed to load visitors for this date.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchPendingVisitors();
    }, [fetchPendingVisitors]);

    const handleApproval = async (id, newStatus) => {
        const confirmMsg = newStatus === 'approved' 
            ? 'Are you sure you want to APPROVE this visitor entry?' 
            : 'Are you sure you want to REJECT this visitor entry?';
        
        if (!window.confirm(confirmMsg)) return;

        // Update local state immediately so they "stay here"
        const updatedList = pendingVisitors.map(v => v.id === id ? { ...v, status: newStatus } : v);
        setPendingVisitors(updatedList);

        // Update localStorage
        const saved = localStorage.getItem('visitor_data');
        if (saved) {
            const allData = JSON.parse(saved);
            const updated = allData.map(v => v.id === id ? { ...v, status: newStatus } : v);
            localStorage.setItem('visitor_data', JSON.stringify(updated));
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/visitors/${id}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (err) {
            console.log('Backend sync failed, but local state updated');
        }
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
        } catch (e) {
            return timeStr;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
        } catch (e) {
            return dateStr;
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '—';
        try {
            const date = new Date(dateTimeStr);
            const time = date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const d = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
            return `${d} ${time}`;
        } catch (e) {
            return dateTimeStr;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Visitor Management</h1>
                        <p className="mt-1 text-slate-200 text-xs md:text-sm">
                            {isHistoryMode ? `Records for ${formatDate(selectedDate)}` : "Today's walk-in visitor approvals"}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                        {isHistoryMode && (
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-2.5 py-1 border border-white/20 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-white/50 transition-all bg-white"
                            />
                        )}
                        <button
                            onClick={() => {
                                setIsHistoryMode(!isHistoryMode);
                                if (isHistoryMode) setSelectedDate(new Date().toISOString().split('T')[0]);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                isHistoryMode 
                                ? 'bg-white text-slate-850 border-white shadow-md' 
                                : 'bg-transparent text-white border-white/20 hover:bg-white/10'
                            }`}
                        >
                            {isHistoryMode ? 'Close History' : 'View History'}
                        </button>
                        <button
                            onClick={fetchPendingVisitors}
                            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all border border-white/20 active:scale-95 text-xs flex items-center justify-center"
                            title="Refresh"
                        >
                            <span>🔄</span>
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-slate-600 opacity-20 blur-3xl"></div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100 font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* List Section */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm font-medium">Fetching records...</p>
                    </div>
                ) : pendingVisitors.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No visitor records found for this date.</p>
                    </div>
                ) : (
                    pendingVisitors.map(visitor => (
                        <div key={visitor.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex flex-col md:flex-row items-stretch">
                                {/* Left Side: Info */}
                                <div className="flex-1 p-5">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                                            visitor.status === 'approved' ? 'bg-green-100 text-green-600' :
                                            visitor.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {visitor.visitor_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-[17px] tracking-tight">{visitor.visitor_name}</h3>
                                            <div className="flex gap-2 items-center mt-0.5">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                                    visitor.status === 'approved' ? 'text-green-600 bg-green-50 border-green-100' :
                                                    visitor.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-100' :
                                                    'text-blue-600 bg-blue-50 border-blue-100'
                                                }`}>
                                                    {visitor.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                                            <p className="text-slate-700 font-semibold flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                {visitor.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Meeting With</p>
                                            <p className="text-slate-700 font-semibold capitalize flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                {visitor.whom_to_meet}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time of arrival</p>
                                            <p className="text-slate-700 font-bold flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                {formatTime(visitor.visit_time)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold ml-3.5 mt-0.5">{formatDate(visitor.visit_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
                                            <p className="text-slate-600 font-medium italic truncate" title={visitor.purpose}>"{visitor.purpose}"</p>
                                        </div>
                                    </div>



                                    {visitor.notes && (
                                        <div className="mt-4 pt-3 border-t border-slate-50">
                                            <p className="text-[10px] text-slate-400 mb-1 font-medium">Notes</p>
                                            <p className="text-xs text-slate-600 italic">"{visitor.notes}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Actions */}
                                <div className="bg-slate-50 md:w-48 px-4 py-5 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-100">
                                    {(visitor.status === 'pending' || visitor.status === 'approved') ? (
                                        <div className="flex md:flex-col gap-2 w-full">
                                            {visitor.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApproval(visitor.id, 'approved')}
                                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApproval(visitor.id, 'rejected')}
                                                        className="flex-1 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {visitor.status === 'approved' && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                                        <span className="text-sm">✓</span> Approved
                                                    </span>
                                                    <p className="text-[9px] text-slate-400 text-center font-medium leading-tight">Awaiting check-in at security</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            {/* Status Badge */}
                                            <div className="flex items-center gap-1 text-slate-700">
                                                <span className="text-lg">
                                                    {visitor.status === 'checked_in' ? '✓' : 
                                                     visitor.status === 'checked_out' ? '🚪' : 
                                                     visitor.status === 'rejected' ? '✕' : '✓'}
                                                </span>
                                                <span className="uppercase tracking-widest text-[11px] font-black">
                                                    {visitor.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            
                                            {/* Times Display */}
                                            <div className="flex flex-col items-center gap-0.5 border-t border-slate-100 pt-2 w-full">
                                                {visitor.check_in_time && (
                                                    <p className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                                        Check In - <span className="text-green-600 font-black uppercase">{new Date(visitor.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                    </p>
                                                )}
                                                {visitor.check_out_time && (
                                                    <p className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                                        Check Out - <span className="text-slate-800 font-black uppercase">{new Date(visitor.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminVisitorApproval;
