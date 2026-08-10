import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { CalendarCheck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

const NonTeachingStaffSelfAttendance = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [todayStatus, setTodayStatus] = useState(null); // 'present' | 'absent' | null
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState('prompt');
    const [locationSettings, setLocationSettings] = useState(null);

    // ── NEW: distance & coords state (mirrors TeacherSelfAttendance) ──────────
    const [distance, setDistance] = useState(null);
    const [detectedCoords, setDetectedCoords] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        checkPermission();
    }, []);

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
        toast.loading('Requesting location access...', { id: 'loc-req' });
        navigator.geolocation.getCurrentPosition(
            () => { toast.dismiss('loc-req'); toast.success('Location access granted!'); setPermissionStatus('granted'); },
            (error) => {
                toast.dismiss('loc-req');
                console.error(error);
                if (error.code === 1) { setPermissionStatus('denied'); toast.error('Location permission denied. Please enable it in browser settings.'); }
            }
        );
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Monthly Data + Location Settings
    useEffect(() => {
        const fetchAttendanceData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                const [attendanceRes, settingsRes] = await Promise.all([
                    fetch(`${API_URL}/api/staff/attendance/monthly?month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/staff/settings/location`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const data = await attendanceRes.json();
                const settingsData = await settingsRes.json();

                if (settingsData.success) {
                    setLocationSettings(settingsData.settings);
                }

                if (data.success) {
                    const fetchedRecords = data.records || [];
                    const [year, month] = selectedMonth.split('-').map(Number);
                    const daysInMonth = new Date(year, month, 0).getDate();
                    const dNow = new Date();
                    const todayStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
                    const newData = [];

                    let checkedInToday = null;
                    let checkedOutToday = null;
                    let currentStatus = null;

                    for (let d = 1; d <= daysInMonth; d++) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const dayOfWeek = new Date(year, month - 1, d).getDay();

                        const record = fetchedRecords.find(r => {
                            const dObj = new Date(r.date);
                            const rDateStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
                            return rDateStr === dateStr;
                        });

                        if (dateStr === todayStr) {
                            if (record) {
                                currentStatus = record.status;
                                checkedInToday = record.check_in_time;
                                checkedOutToday = record.check_out_time;
                            } else {
                                currentStatus = null;
                                checkedInToday = null;
                                checkedOutToday = null;
                            }
                        }

                        if (record) {
                            newData.push({ date: dateStr, status: record.status });
                        } else if (dateStr > todayStr) {
                            continue;
                        } else if (dayOfWeek === 0) {
                            newData.push({ date: dateStr, status: 'holiday', label: 'Sunday' });
                        } else {
                            newData.push({ date: dateStr, status: 'absent' });
                        }
                    }

                    setMonthlyData(newData);
                    setCheckInTime(checkedInToday);
                    setCheckOutTime(checkedOutToday);
                    setTodayStatus(currentStatus);
                } else {
                    toast.error(data.message || 'Failed to load attendance records');
                }
            } catch (error) {
                console.error('Error fetching attendance', error);
                toast.error('Server connection failed');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendanceData();
    }, [selectedMonth]);

    const formatTime12 = (date) => {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    // Haversine distance (meters)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const dphi = (lat2 - lat1) * Math.PI / 180;
        const dlambda = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // ── SHARED geofence + API helper ─────────────────────────────────────────
    const verifyLocationAndCall = (apiCall) => {
        if (!locationSettings?.school_latitude || !locationSettings?.school_longitude) {
            toast.error('School location not set by admin. Please contact support.');
            return;
        }
        if (permissionStatus === 'denied') {
            toast.error('Please enable location access first');
            return;
        }
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setProcessing(true);
        const toastId = toast.loading('Verifying your location...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Store detected coords so the info panel shows up
                setDetectedCoords({ lat: latitude, lon: longitude });

                const schoolLat = parseFloat(locationSettings.school_latitude);
                const schoolLng = parseFloat(locationSettings.school_longitude);
                const allowedRadius = parseFloat(locationSettings.attendance_radius || 350);

                const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
                setDistance(dist); // always set — panel shows on both success & failure

                if (dist > allowedRadius) {
                    toast.dismiss(toastId);
                    const distDisplay = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${Math.round(dist)} m`;
                    const radiusDisplay = allowedRadius >= 1000 ? `${(allowedRadius / 1000).toFixed(2)} km` : `${Math.round(allowedRadius)} m`;
                    toast.error(
                        `📍 You are ${distDisplay} away from school.\nAllowed radius: ${radiusDisplay}.`,
                        { duration: 6000 }
                    );
                    setProcessing(false);
                    return; // block API call
                }

                // Within radius — run the actual API call
                await apiCall(latitude, longitude, toastId);
                setProcessing(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.dismiss(toastId);
                toast.error('Unable to retrieve location. Please allow location access.');
                setProcessing(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleCheckIn = () => {
        verifyLocationAndCall(async (latitude, longitude, toastId) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/staff/attendance/check-in`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude, longitude })
                });
                const data = await res.json();
                toast.dismiss(toastId);

                if (data.success) {
                    setCheckInTime(data.time);
                    setTodayStatus('present');
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    if (todayStr.startsWith(selectedMonth)) {
                        setMonthlyData(prev => prev.map(d => d.date === todayStr ? { ...d, status: 'present' } : d));
                    }
                    toast.success(data.message || '✅ Check-in recorded successfully!');
                } else {
                    toast.error(data.message || 'Failed to check in');
                }
            } catch (error) {
                console.error('Check in error', error);
                toast.dismiss(toastId);
                toast.error('Server connection failed');
            }
        });
    };

    const handleCheckOut = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/staff/attendance/check-out`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.success) {
                setCheckOutTime(data.time);
                toast.success(data.message || '👋 Check-out recorded!');
            } else {
                toast.error(data.message || 'Failed to check out');
            }
        } catch (error) {
            console.error('Check out error', error);
            toast.error('Server connection failed');
        }
    };

    // Stats
    const presentDays = monthlyData.filter(d => d.status === 'present').length;
    const halfDays = monthlyData.filter(d => d.status === 'half_day').length;
    const absentDays = monthlyData.filter(d => d.status === 'absent').length;
    const holidays = monthlyData.filter(d => d.status === 'holiday').length;
    const totalWorking = presentDays + halfDays + absentDays;
    const percentage = totalWorking > 0 ? (((presentDays + halfDays * 0.5) / totalWorking) * 100).toFixed(1) : 0;

    // Calendar
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

    return (
        <div className="space-y-4 md:space-y-8 pb-8">

            {/* ── HEADER ───────────────────────────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                            <CalendarCheck className="w-7 h-7" /> Self Attendance
                        </h1>
                        <p className="text-emerald-100 mt-1">Mark and track your daily attendance</p>
                    </div>
                    <div className="px-4 py-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg text-center">
                        <p className="text-2xl font-bold font-mono tracking-wider">{formatTime12(currentTime)}</p>
                        <p className="text-xs text-emerald-100 mt-1">
                            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── PERMISSION BANNERS ───────────────────────────────────────────── */}
            {permissionStatus === 'denied' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                    <span className="text-lg">⚠️</span>
                    <div>
                        <p className="font-bold text-sm">Location Access Denied</p>
                        <p className="text-xs mt-0.5 text-red-500">Please enable location access in your browser settings to mark attendance.</p>
                    </div>
                </div>
            )}
            {permissionStatus === 'prompt' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">ℹ️</span>
                        <div>
                            <p className="font-bold text-sm">Location Access Required</p>
                            <p className="text-xs mt-0.5 text-blue-500">Grant location permission to verify you are on campus.</p>
                        </div>
                    </div>
                    <button onClick={requestLocation} className="px-5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                        Allow Access
                    </button>
                </div>
            )}

            {/* ── CHECK IN / CHECK OUT ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                {/* CHECK IN */}
                <Card variant="elevated" className="border-t-4 border-t-emerald-500">
                    <div className="text-center py-4">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${checkInTime ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                            {checkInTime
                                ? <CheckCircle className="w-10 h-10 text-emerald-600" />
                                : <Clock className="w-10 h-10 text-gray-400" />
                            }
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Check In</h3>
                        {checkInTime ? (
                            <div>
                                <p className="text-emerald-600 font-semibold text-lg">{checkInTime}</p>
                                <Badge variant="success" className="mt-2">Checked In ✓</Badge>
                            </div>
                        ) : (
                            <button
                                onClick={handleCheckIn}
                                disabled={processing || permissionStatus === 'denied'}
                                className={`mt-3 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95
                                    ${permissionStatus === 'denied'
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {processing
                                    ? <span className="flex items-center justify-center gap-1.5">
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Verifying...
                                      </span>
                                    : 'Check In Now'}
                            </button>
                        )}
                    </div>
                </Card>

                {/* CHECK OUT */}
                <Card variant="elevated" className="border-t-4 border-t-rose-500">
                    <div className="text-center py-4">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${checkOutTime ? 'bg-rose-100' : 'bg-gray-100'}`}>
                            {checkOutTime
                                ? <XCircle className="w-10 h-10 text-rose-600" />
                                : <MapPin className="w-10 h-10 text-gray-400" />
                            }
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Check Out</h3>
                        {checkOutTime ? (
                            <div>
                                <p className="text-rose-600 font-semibold text-lg">{checkOutTime}</p>
                                <Badge variant="destructive" className="mt-2">Checked Out</Badge>
                            </div>
                        ) : (
                            <button
                                onClick={handleCheckOut}
                                disabled={!checkInTime}
                                className={`mt-3 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 ${checkInTime
                                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Check Out Now
                            </button>
                        )}
                    </div>
                </Card>
            </div>

            {/* ── GPS / DISTANCE INFO PANEL (shown after any check-in attempt) ─── */}
            {(detectedCoords || distance !== null) && (
                <div className="flex flex-wrap gap-3">
                    {detectedCoords && (
                        <div className="flex-1 min-w-[140px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detected Location</p>
                            <p className="text-xs text-slate-600 font-mono">Lat: {detectedCoords.lat.toFixed(6)}</p>
                            <p className="text-xs text-slate-600 font-mono">Lon: {detectedCoords.lon.toFixed(6)}</p>
                        </div>
                    )}
                    {distance !== null && (
                        <div className={`flex-1 min-w-[140px] rounded-xl px-4 py-3 border ${
                            distance <= parseFloat(locationSettings?.attendance_radius || 350)
                                ? 'bg-emerald-50 border-emerald-100'
                                : 'bg-red-50 border-red-100'
                        }`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                distance <= parseFloat(locationSettings?.attendance_radius || 350)
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                            }`}>
                                Distance from School
                            </p>
                            <p className={`text-lg font-bold font-mono ${
                                distance <= parseFloat(locationSettings?.attendance_radius || 350)
                                    ? 'text-emerald-700'
                                    : 'text-red-600'
                            }`}>
                                {distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                Allowed: {
                                    (() => {
                                        const r = parseFloat(locationSettings?.attendance_radius || 350);
                                        return r >= 1000 ? `${(r / 1000).toFixed(2)} km` : `${Math.round(r)} m`;
                                    })()
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── STATS ────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <Card variant="elevated" className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">{percentage}%</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1 uppercase">Attendance</p>
                </Card>
                <Card variant="elevated" className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{presentDays}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1 uppercase">Present</p>
                </Card>
                <Card variant="elevated" className="text-center">
                    <p className="text-3xl font-bold text-amber-600">{halfDays}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1 uppercase">Half Day</p>
                </Card>
                <Card variant="elevated" className="text-center">
                    <p className="text-3xl font-bold text-red-600">{absentDays}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1 uppercase">Absent</p>
                </Card>
                <Card variant="elevated" className="text-center">
                    <p className="text-3xl font-bold text-gray-600">{holidays}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1 uppercase">Holidays</p>
                </Card>
            </div>

            {/* ── MONTHLY CALENDAR ─────────────────────────────────────────────── */}
            <Card variant="elevated" className="border-t-4 border-t-teal-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">📅</span>
                        Monthly Overview
                    </h3>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-xs font-bold text-gray-400 pb-1">{d}</div>
                    ))}
                    {getCalendarData().map((item, index) => {
                        if (!item) return <div key={`blank-${index}`} />;

                        let bgColor = 'bg-gray-50 text-gray-300';
                        let icon = '';

                        if (item.isFuture) {
                            bgColor = 'bg-gray-50 text-gray-300';
                        } else if (item.record) {
                            if (item.record.status === 'present') {
                                bgColor = 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
                                icon = '✓';
                            } else if (item.record.status === 'half_day') {
                                bgColor = 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
                                icon = '½';
                            } else if (item.record.status === 'absent') {
                                bgColor = 'bg-red-100 text-red-700 ring-1 ring-red-200';
                                icon = '✗';
                            } else if (item.record.status === 'holiday') {
                                bgColor = 'bg-slate-100 text-slate-400';
                                icon = 'H';
                            }
                        }

                        return (
                            <div
                                key={item.date}
                                className={`relative rounded-lg p-2 text-center text-sm font-medium ${bgColor} transition-all hover:scale-105`}
                                title={`${item.date} - ${item.record?.status || 'No record'}`}
                            >
                                {item.day}
                                {icon && <span className="absolute bottom-0.5 right-1 text-xs">{icon}</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded bg-emerald-100 ring-1 ring-emerald-200"></div>
                        <span className="text-gray-600 font-medium">Present</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded bg-amber-100 ring-1 ring-amber-200"></div>
                        <span className="text-gray-600 font-medium">Half Day</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded bg-red-100 ring-1 ring-red-200"></div>
                        <span className="text-gray-600 font-medium">Absent</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded bg-slate-100"></div>
                        <span className="text-gray-600 font-medium">Holiday</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded bg-gray-50"></div>
                        <span className="text-gray-600 font-medium">No Record / Future</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NonTeachingStaffSelfAttendance;