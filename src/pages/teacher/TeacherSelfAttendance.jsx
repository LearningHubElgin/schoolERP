import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import { toast } from 'react-hot-toast';
import { Clock, MapPin } from 'lucide-react';

const API_BASE = API_URL;

const TeacherSelfAttendance = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState(null);
    const [locationSettings, setLocationSettings] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [distance, setDistance] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState('prompt');
    const [detectedCoords, setDetectedCoords] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [monthlyData, setMonthlyData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null); // { type, time }
    const [successModal, setSuccessModal] = useState(null); // { message, type, time, lat, lon, distance }
    const [errorModal, setErrorModal] = useState(null); // { message, lat, lon, distance, radius }

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        checkPermission();
        fetchInitialData();
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/holidays`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHolidays(data.holidays || []);
                setWeeklySchedule(data.weekly_schedule || []);
            }
        } catch (err) { console.error('Fetch holidays error:', err); }
    };

    // Check if a date falls within any holiday range, considering weekly_schedule
    const isHolidayDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return false;
            const dayOfWeek = d.getDay(); // 0 for Sunday, 1 for Monday, etc.

            // 1. First check weekly schedule
            const scheduleItem = weeklySchedule.find(s => Number(s.day_of_week) === dayOfWeek);
            if (scheduleItem) {
                const isWorking = scheduleItem.is_working === 1 || scheduleItem.is_working === true || String(scheduleItem.is_working) === '1' || String(scheduleItem.is_working) === 'true';
                if (!isWorking) return true;
            } else {
                // Default fallback: Sunday is a holiday
                if (dayOfWeek === 0) return true;
            }

            // 2. Then check custom holidays
            return holidays.some(h => {
                const start = new Date(h.start_date);
                start.setHours(0, 0, 0, 0);
                const end = h.end_date ? new Date(h.end_date) : new Date(h.start_date);
                end.setHours(23, 59, 59, 999);
                const check = new Date(dateStr);
                check.setHours(12, 0, 0, 0);
                return check >= start && check <= end;
            });
        } catch (e) {
            console.error("isHolidayDate error:", e);
            return false;
        }
    };

    // Get holiday name for a date
    const getHolidayName = (dateStr) => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        
        const defaultWorking = dayOfWeek !== 0;
        const scheduleItem = weeklySchedule.find(s => Number(s.day_of_week) === dayOfWeek);
        const isWorkingDay = scheduleItem ? (scheduleItem.is_working === 1 || scheduleItem.is_working === true || scheduleItem.is_working === '1' || scheduleItem.is_working === 'true') : defaultWorking;
        
        if (!isWorkingDay) return 'Weekly Holiday';

        const match = holidays.find(h => {
            const start = new Date(h.start_date);
            start.setHours(0,0,0,0);
            const end = h.end_date ? new Date(h.end_date) : new Date(h.start_date);
            end.setHours(23,59,59,999);
            const check = new Date(dateStr);
            check.setHours(12,0,0,0);
            return check >= start && check <= end;
        });
        return match ? match.title : null;
    };

    // ─── ALL ORIGINAL APIs UNCHANGED ────────────────────────────────────────────

    const checkPermission = async () => {
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                setPermissionStatus(result.state);
                result.onchange = () => setPermissionStatus(result.state);
            } catch (error) {
                console.error('Permission query error:', error);
            }
        }
    };

    const requestLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation is not supported'); return; }
        toast.loading('Requesting location access...');
        navigator.geolocation.getCurrentPosition(
            () => { toast.dismiss(); toast.success('Location access granted!'); setPermissionStatus('granted'); },
            (error) => {
                toast.dismiss(); console.error(error);
                if (error.code === 1) { setPermissionStatus('denied'); toast.error('Location permission denied. Please enable it in browser settings.'); }
            }
        );
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [attendanceRes, settingsRes] = await Promise.all([
                fetch(`${API_BASE}/api/teacher/self-attendance/today`, { headers }),
                fetch(`${API_BASE}/api/teacher/settings/location`, { headers })
            ]);
            const attendanceData = await attendanceRes.json();
            const settingsData = await settingsRes.json();
            if (attendanceData.success) setAttendance(attendanceData.attendance);
            if (settingsData.success) setLocationSettings(settingsData.settings);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const phi1 = lat1 * Math.PI / 180, phi2 = lat2 * Math.PI / 180;
        const dphi = (lat2 - lat1) * Math.PI / 180, dlambda = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const handleAttendance = async (type) => {
        setConfirmModal({ type, time: formatClock(new Date()) });
    };

    const processAttendance = async () => {
        const type = confirmModal.type;
        setConfirmModal(null);
        
        if (!locationSettings?.school_latitude || !locationSettings?.school_longitude) {
            toast.error('School location not set by admin. Contact support.'); return;
        }
        if (!navigator.geolocation) { toast.error('Geolocation is not supported by your browser'); return; }
        setProcessing(true);
        toast.loading(`Verifying location for ${type === 'check_in' ? 'Check In' : 'Check Out'}...`);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setDetectedCoords({ lat: latitude, lon: longitude });
                const schoolLat = parseFloat(locationSettings.school_latitude);
                const schoolLng = parseFloat(locationSettings.school_longitude);
                const allowedRadius = parseFloat(locationSettings.attendance_radius || 500);
                const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
                setDistance(dist);
                if (dist > allowedRadius) {
                    toast.dismiss();
                    const distDisplay = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${Math.round(dist)}m`;
                    const radiusDisplay = allowedRadius >= 1000 ? `${(allowedRadius / 1000).toFixed(2)} km` : `${Math.round(allowedRadius)}m`;
                    setErrorModal({
                        message: `You are outside the school campus.`,
                        lat: latitude,
                        lon: longitude,
                        distance: distDisplay,
                        radius: radiusDisplay
                    });
                    setProcessing(false); return;
                }
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/api/teacher/self-attendance`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ type, latitude, longitude })
                    });
                    const data = await res.json();
                    toast.dismiss();
                    if (data.success) {
                        setSuccessModal({ 
                            message: data.message, 
                            type: type, 
                            time: formatClock(new Date()),
                            lat: latitude,
                            lon: longitude,
                            distance: dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${Math.round(dist)}m`,
                            dutyTime: type === 'check_out' ? calculateDutyTime(attendance?.check_in_time, formatClock(new Date())) : null
                        });
                        fetchInitialData();
                    } else {
                        toast.error(data.message || 'Failed');
                    }
                } catch (err) { toast.dismiss(); toast.error('Server error'); console.error(err); }
                setProcessing(false);
            },
            (error) => {
                toast.dismiss();
                toast.error('Unable to retrieve location. Please allow location access.');
                console.error(error); setProcessing(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // ─── MONTHLY DATA FETCHING ───────────────────────────────────────────────────
    const fetchMonthlyData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/self-attendance/monthly?month=${selectedMonth}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataRes = await res.json();
            
            if (dataRes.success) {
                const fetchedRecords = dataRes.records;
                const [year, month] = selectedMonth.split('-').map(Number);
                const daysInMonth = new Date(year, month, 0).getDate();
                
                const dNow = new Date();
                const today = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
                
                const data = [];
                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const dayOfWeek = new Date(year, month - 1, d).getDay();
                    
                    if (dateStr > today) continue;
                    
                    const record = fetchedRecords.find(r => {
                        let rDateStr = '';
                        if (typeof r.date === 'string') {
                            rDateStr = r.date.split('T')[0];
                        } else if (r.date instanceof Date) {
                            rDateStr = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}-${String(r.date.getDate()).padStart(2, '0')}`;
                        } else {
                            rDateStr = String(r.date).split('T')[0];
                        }
                        return rDateStr === dateStr;
                    });

                    if (record) {
                        data.push({ date: dateStr, status: record.status.toLowerCase() });
                    } else if (isHolidayDate(dateStr)) {
                        data.push({ date: dateStr, status: 'holiday', holidayName: getHolidayName(dateStr) });
                    } else {
                        data.push({ date: dateStr, status: 'absent' });
                    }
                }
                setMonthlyData(data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load monthly attendance');
        }
    };

    useEffect(() => {
        fetchMonthlyData();
    }, [selectedMonth]);

    // ─── HELPERS ─────────────────────────────────────────────────────────────────

    const formatClock = (date) => {
        const h = date.getHours();
        const m = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        const ampm = h >= 12 ? 'pm' : 'am';
        const displayH = String(h % 12 || 12).padStart(2, '0');
        return `${displayH}:${m}:${s} ${ampm}`;
    };

    const calculateDutyTime = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return null;
        try {
            const parseTime = (str) => {
                const [time, period] = str.split(' ');
                let [h, m, s] = time.split(':').map(Number);
                if (period === 'pm' && h !== 12) h += 12;
                if (period === 'am' && h === 12) h = 0;
                const d = new Date();
                d.setHours(h, m, s, 0);
                return d.getTime();
            };
            const diff = parseTime(checkOut) - parseTime(checkIn);
            if (diff < 0) return null;
            const totalSeconds = Math.floor(diff / 1000);
            const hrs = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;
            return `${hrs}h ${mins}m ${secs}s`;
        } catch (e) { return null; }
    };

    const formatTimeString = (timeStr) => {
        if (!timeStr) return null;
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
        try {
            const parts = timeStr.split(':');
            let h = parseInt(parts[0], 10);
            const m = parts[1] || '00';
            const s = parts[2] || '00';
            const ampm = h >= 12 ? 'pm' : 'am';
            h = h % 12 || 12;
            return `${String(h).padStart(2, '0')}:${m}:${s} ${ampm}`;
        } catch (e) { return timeStr; }
    };

    const presentDays = monthlyData.filter(d => d.status === 'present').length;
    const halfDays = monthlyData.filter(d => d.status === 'half day').length;
    const absentDays = monthlyData.filter(d => d.status === 'absent').length;
    const totalWorking = presentDays + halfDays + absentDays;
    const percentage = totalWorking > 0 ? (((presentDays + halfDays * 0.5) / totalWorking) * 100).toFixed(1) : '0.0';

    const getCalendarData = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
        const dNow = new Date();
        const today = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const record = monthlyData.find(r => r.date === dateStr);
            days.push({ day: d, date: dateStr, record, isFuture: dateStr > today });
        }
        return days;
    };

    const calendarDays = getCalendarData();
    const holidayCount = calendarDays.filter(d => {
        if (!d || d.isFuture) return false;
        const s = d.record?.status?.toLowerCase();
        const isHolidayDay = isHolidayDate(d.date);
        return s === 'holiday' || (isHolidayDay && s !== 'present' && s !== 'half day');
    }).length;

    const checkInTime = attendance?.check_in_time || null;
    const checkOutTime = attendance?.check_out_time || null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-3 text-slate-500 text-sm">Loading attendance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-8">
            {/* ── CONFIRMATION MODAL ── */}
            {confirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className={`h-2 bg-gradient-to-r ${confirmModal.type === 'check_in' ? 'from-emerald-500 to-teal-400' : 'from-rose-500 to-pink-400'}`}></div>
                        <div className="p-8 text-center">
                            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${confirmModal.type === 'check_in' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                {confirmModal.type === 'check_in' ? <Clock className="w-10 h-10" /> : <MapPin className="w-10 h-10" />}
                            </div>
                            <h3 className="text-2xl font-medium text-slate-800 mb-2">Confirm {confirmModal.type === 'check_in' ? 'check in' : 'check out'}</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Are you sure you want to {confirmModal.type === 'check_in' ? 'check in' : 'check out'} now? <br/>
                                Current time: <span className="font-medium text-slate-800">{confirmModal.time}</span>
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                                <button onClick={processAttendance} className={`flex-1 py-3.5 rounded-2xl text-sm font-medium text-white shadow-lg transition-all active:scale-95 ${confirmModal.type === 'check_in' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-rose-500 shadow-rose-200 hover:bg-rose-600'}`}>
                                    Yes, {confirmModal.type === 'check_in' ? 'check in' : 'check out'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUCCESS MODAL ── */}
            {successModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner animate-bounce">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-2xl font-medium text-slate-800 mb-2">Success!</h3>
                            <p className="text-emerald-600 font-medium mb-3 text-lg leading-tight">
                                {successModal.message?.toLowerCase()}
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-4 my-6 border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                                    <span className="text-[11px] font-medium text-slate-400">Recorded time</span>
                                    <span className="text-sm font-medium text-slate-800">{successModal.time}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div>
                                        <p className="text-[11px] font-medium text-slate-400 mb-0.5">Latitude</p>
                                        <p className="text-sm font-mono font-medium text-slate-600">{successModal.lat.toFixed(6)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-slate-400 mb-0.5">Longitude</p>
                                        <p className="text-sm font-mono font-medium text-slate-600">{successModal.lon.toFixed(6)}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                                    <span className="text-[11px] font-medium text-slate-400">Distance</span>
                                    <span className="text-sm font-medium text-blue-600 font-mono">{successModal.distance} from school</span>
                                </div>
                                {successModal.dutyTime && (
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 bg-emerald-50 rounded-xl px-3 py-2.5 mt-2">
                                        <span className="text-[11px] font-medium text-emerald-600">Total duty time</span>
                                        <span className="text-base font-medium text-emerald-700">{successModal.dutyTime}</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setSuccessModal(null)} className="w-full py-4 bg-slate-800 text-white rounded-2xl text-sm font-medium shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all active:scale-95">Great!</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ERROR MODAL (Distance Failure) ── */}
            {errorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="h-2 bg-rose-500"></div>
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center mb-6">
                                <MapPin className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-800 mb-2">Oops! Too far</h3>
                            <p className="text-rose-500 font-medium mb-4 text-sm">{errorModal.message}</p>
                            
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400">Your distance</span>
                                    <span className="text-sm font-medium text-rose-600 font-mono">{errorModal.distance}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400">Allowed radius</span>
                                    <span className="text-sm font-medium text-slate-700 font-mono">{errorModal.radius}</span>
                                </div>
                <div className="pt-2 border-t border-slate-200/50 text-left">
                                    <p className="text-[11px] font-medium text-slate-400 mb-1">Detected coords</p>
                                    <p className="text-sm font-mono font-medium text-slate-500">{errorModal.lat.toFixed(6)}, {errorModal.lon.toFixed(6)}</p>
                                </div>
                            </div>
                            
                            <button onClick={() => setErrorModal(null)} className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all">Understood</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── HEADER ─────────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-3 sm:p-5 text-white shadow-md sm:shadow-xl flex items-center justify-between gap-3">
                <div className="relative z-10">
                    <h1 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-1.5">
                        {/* calendar-check icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/>
                        </svg>
                        Self attendance 📍
                    </h1>
                    <p className="text-emerald-100 text-[11px] sm:text-xs mt-0.5">Mark and track your daily attendance</p>
                </div>
                <div className="relative z-10 bg-white/15 backdrop-blur-xs border border-white/20 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-right shrink-0">
                    <p className="text-xs sm:text-base font-bold font-mono leading-tight">{formatClock(currentTime)}</p>
                    <p className="text-[10px] sm:text-[11px] text-emerald-100 mt-0.5">
                        {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
            </div>

            {/* ── PERMISSION BANNERS ─────────────────────────────────────────────── */}
            {permissionStatus === 'denied' && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 text-xs">
                    <span className="text-base shrink-0">⚠️</span>
                    <div>
                        <p className="font-bold text-xs">Location access denied</p>
                        <p className="text-[11px] mt-0.5 text-red-500">Please enable location access in your browser settings to mark attendance.</p>
                    </div>
                </div>
            )}
            {permissionStatus === 'prompt' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-2.5 sm:p-3 rounded-xl flex flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">ℹ️</span>
                        <div className="min-w-0">
                            <p className="font-bold text-xs truncate">Location access required</p>
                            <p className="text-[10px] sm:text-xs text-blue-500 truncate">Grant location permission to verify you are on campus.</p>
                        </div>
                    </div>
                    <button onClick={requestLocation} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs active:scale-95">
                        Allow Access
                    </button>
                </div>
            )}

            {/* ── CHECK IN / CHECK OUT ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">

                {/* CHECK IN */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xs border-t-4 border-emerald-500 border border-gray-100 p-3 sm:p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${checkInTime ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                        <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${checkInTime ? 'text-emerald-500' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Check in</p>

                    {checkInTime ? (
                        <div className="space-y-0.5">
                            <p className="text-sm sm:text-lg font-bold text-emerald-600">{formatTimeString(checkInTime)}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-semibold rounded-full border border-emerald-100">
                                ✓ Checked in
                            </span>
                            {attendance?.location_verified && (
                                <p className="text-[10px] font-medium text-emerald-500 flex items-center justify-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> Location verified
                                </p>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => handleAttendance('check_in')}
                            disabled={processing || permissionStatus === 'denied'}
                            className={`w-full py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer
                                ${permissionStatus === 'denied'
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {processing
                                ? <span className="flex items-center justify-center gap-1"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Verifying...</span>
                                : 'CHECK IN NOW'}
                        </button>
                    )}
                </div>

                {/* CHECK OUT */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xs border-t-4 border-rose-500 border border-gray-100 p-3 sm:p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${checkOutTime ? 'bg-rose-50' : 'bg-gray-50'}`}>
                        <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${checkOutTime ? 'text-rose-500' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Check out</p>

                    {checkOutTime ? (
                        <div className="space-y-0.5">
                            <p className="text-sm sm:text-lg font-bold text-rose-600">{formatTimeString(checkOutTime)}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] sm:text-xs font-semibold rounded-full border border-rose-100">
                                Checked out
                            </span>
                        </div>
                    ) : checkInTime ? (
                        <button
                            onClick={() => handleAttendance('check_out')}
                            disabled={processing}
                            className="w-full py-1.5 sm:py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing
                                ? <span className="flex items-center justify-center gap-1"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Verifying...</span>
                                : 'CHECK OUT NOW'}
                        </button>
                    ) : (
                        <button disabled className="w-full py-1.5 sm:py-2 bg-gray-100 text-gray-400 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                            CHECK OUT NOW
                        </button>
                    )}
                </div>
            </div>

            {/* TOTAL DUTY TIME DISPLAY */}
            {checkInTime && (
                <div className={`rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 ${checkOutTime ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Clock className={`w-5 h-5 text-white ${!checkOutTime ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                            <p className="text-xs text-white/80 font-medium">{checkOutTime ? 'Total Duty Duration' : 'Current Shift Elapsed Time'}</p>
                            <p className="text-2xl font-bold font-mono tracking-wider">{checkOutTime ? calculateDutyTime(checkInTime, checkOutTime) : calculateDutyTime(checkInTime, formatClock(currentTime))}</p>
                        </div>
                    </div>
                    {!checkOutTime && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-300"></span> Active Duty Shift
                        </span>
                    )}
                </div>
            )}

            {/* DETAILS ACCORDION */}
            {attendance && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Status</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${attendance.status === 'present' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                <span className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{attendance.status || 'Marked'}</span>
                            </div>
                        </div>

                        {attendance.work_hours && (
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Recorded Work Hours</p>
                                <p className="text-sm font-semibold text-gray-800 font-mono mt-0.5">{attendance.work_hours} hrs</p>
                            </div>
                        )}

                        {distance !== null && (
                            <div className="flex-1 min-w-[140px] bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                <p className="text-[11px] font-medium text-blue-400 mb-1">Distance from school</p>
                                <p className="text-lg font-medium text-blue-700 font-mono">
                                    {distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
                {[
                    { value: `${percentage}%`, label: 'Attendance', bg: 'bg-indigo-50/50', border: 'border-l-indigo-500', text: 'text-indigo-700', icon: '📊' },
                    { value: presentDays, label: 'Present', bg: 'bg-emerald-50/50', border: 'border-l-emerald-500', text: 'text-emerald-700', icon: '✅' },
                    { value: halfDays, label: 'Half Day', bg: 'bg-amber-50/50', border: 'border-l-amber-500', text: 'text-amber-700', icon: '⏳' },
                    { value: absentDays, label: 'Absent', bg: 'bg-rose-50/50', border: 'border-l-rose-500', text: 'text-rose-700', icon: '✗' },
                    { value: holidayCount, label: 'Holidays', bg: 'bg-slate-50/50', border: 'border-l-slate-400', text: 'text-slate-700', icon: '🌴' },
                ].map(({ value, label, bg, border, text, icon }) => (
                    <div key={label} className={`${bg} rounded-xl shadow-2xs border border-slate-100 border-l-4 ${border} p-2 sm:p-2.5 transition-all hover:shadow-xs flex items-center justify-between gap-1`}>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">{label}</p>
                            <p className={`text-xs sm:text-base font-bold ${text} whitespace-nowrap`}>{value}</p>
                        </div>
                        <span className="text-xs shrink-0 opacity-60">{icon}</span>
                    </div>
                ))}
            </div>

            {/* ── MONTHLY CALENDAR ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
                        📅 Monthly overview
                    </h3>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] md:text-xs font-semibold text-gray-400 py-1">{d}</div>
                    ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((item, index) => {
                        if (!item) return <div key={`b-${index}`} />;

                        const s = item.record?.status?.toLowerCase();
                        const isHolidayDay = isHolidayDate(item.date);
                        const isPresent = !item.isFuture && s === 'present';
                        const isHalfDay = !item.isFuture && s === 'half day';
                        const isHoliday = !item.isFuture && !isPresent && !isHalfDay && (s === 'holiday' || isHolidayDay);
                        const isAbsent = !item.isFuture && !isHoliday && !isPresent && !isHalfDay && (s === 'absent' || !item.record);
                        const isBlank = item.isFuture;

                        return (
                            <div
                                key={item.date}
                                title={`${item.date} — ${isHoliday ? (getHolidayName(item.date) || 'Holiday') : (item.record ? s : (item.isFuture ? 'Future Date' : 'Absent (No Record)'))}`}
                                className={`relative rounded-md py-1.5 flex items-center justify-center text-xs font-semibold
                                    ${isPresent ? 'bg-emerald-100 text-emerald-700' : ''}
                                    ${isHalfDay ? 'bg-amber-100 text-amber-700' : ''}
                                    ${isAbsent ? 'bg-red-100 text-red-500' : ''}
                                    ${isHoliday ? 'bg-gray-100 text-gray-500' : ''}
                                    ${isBlank ? 'text-gray-300' : ''}
                                `}
                            >
                                <span>{item.day}</span>
                                {isPresent && <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold text-emerald-500">✓</span>}
                                {isHalfDay && <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold text-amber-500">½</span>}
                                {isAbsent && <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold text-red-400">✗</span>}
                                {isHoliday && <span className="absolute top-0 right-0.5 text-[7px] font-bold text-gray-400">H</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                    {[
                        { color: 'bg-emerald-100', label: 'Present' },
                        { color: 'bg-amber-100', label: 'Half Day' },
                        { color: 'bg-red-100', label: 'Absent' },
                        { color: 'bg-gray-100', label: 'Holiday' },
                        { color: 'bg-white border border-gray-200', label: 'No Record / Future' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${color}`}></div>
                            <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default TeacherSelfAttendance;