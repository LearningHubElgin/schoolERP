import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const formatTime12 = (time24) => {
    if (!time24) return '—';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};

const NonTeachingStaffShiftTime = () => {
    const [shift, setShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchShift();
    }, []);

    const fetchShift = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/staff/my-shift`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setShift(data.shift);
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading shift data...</p>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-8 w-full space-y-6 md:space-y-10">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 p-5 md:p-10 rounded-2xl md:rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative flex items-center gap-4 md:gap-6">
                    <span className="text-3xl md:text-5xl">🕒</span>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">My Shift Schedule</h1>
                        <p className="text-slate-400 mt-1 font-medium italic text-xs md:text-base">Your currently assigned duty timing</p>
                    </div>
                </div>
            </div>

            {!shift || error ? (
                <Card className="p-8 md:p-16 rounded-2xl md:rounded-[40px] shadow-2xl border-none bg-white text-center flex flex-col items-center gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-amber-50 rounded-full flex items-center justify-center shadow-inner mb-2 animate-bounce">
                        <span className="text-4xl md:text-6xl">⏳</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">No Shift Assigned</h2>
                    <p className="text-slate-500 max-w-sm font-bold leading-relaxed text-xs md:text-sm">
                        Your duty shift hasn't been assigned by the administrative department yet. Please contact admin for shift allocation.
                    </p>
                    <div className="mt-2 md:mt-4 px-6 md:px-8 py-2.5 md:py-3 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-200">
                        Status: Pending Assignment
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col items-center gap-6 md:gap-10">
                    {/* Main Shift Card */}
                    <Card className="w-full max-w-xl p-0 rounded-2xl md:rounded-[32px] shadow-2xl border-none overflow-hidden bg-white">
                        {/* Card Banner */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 md:p-8 text-center">
                            <span className="inline-block px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-black uppercase tracking-[0.15em] text-xs md:text-sm border border-white/30">
                                {shift.shift_name} Shift
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 md:p-10 space-y-6">
                            {/* Timing Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 md:p-6 rounded-2xl text-center border border-green-100">
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Starts At</p>
                                    <p className="text-2xl md:text-3xl font-black text-green-800">{formatTime12(shift.start_time?.substring(0, 5))}</p>
                                </div>
                                <div className="bg-red-50 p-4 md:p-6 rounded-2xl text-center border border-red-100">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Ends At</p>
                                    <p className="text-2xl md:text-3xl font-black text-red-800">{formatTime12(shift.end_time?.substring(0, 5))}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Effective From</span>
                                    <span className="text-sm font-bold text-gray-800">{shift.effective_from?.split('T')[0]}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Effective Until</span>
                                    <span className="text-sm font-bold text-gray-800">{shift.effective_to?.split('T')[0] || <span className="text-green-600">Ongoing</span>}</span>
                                </div>
                                {shift.staff_name && (
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Name</span>
                                        <span className="text-sm font-bold text-gray-800">{shift.staff_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-xl">
                        <div className="bg-violet-50/70 p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-violet-100 flex items-center gap-4 md:gap-6 text-left shadow-sm">
                            <span className="text-2xl md:text-4xl">📋</span>
                            <div>
                                <div className="text-[10px] font-black text-violet-800 uppercase tracking-widest mb-1">Duty Bound</div>
                                <p className="text-xs text-violet-600/70 font-bold italic leading-relaxed">Please report on time as per your assigned shift schedule.</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50/70 p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-indigo-100 flex items-center gap-4 md:gap-6 text-left shadow-sm">
                            <span className="text-2xl md:text-4xl">🔔</span>
                            <div>
                                <div className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Shift Updates</div>
                                <p className="text-xs text-indigo-600/70 font-bold italic leading-relaxed">Contact admin if you need changes to your shift timing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NonTeachingStaffShiftTime;
