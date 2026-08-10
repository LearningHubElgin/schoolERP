import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay, 
    parseISO, 
    isToday,
    startOfWeek,
    endOfWeek
} from 'date-fns';

const DriverSelfAttendance = () => {
    const [status, setStatus] = useState(null); // 'checking', 'marked', 'ready', 'not_in_range', 'error'
    const [loading, setLoading] = useState(true);
    const [currentPos, setCurrentPos] = useState(null);
    const [distanceInfo, setDistanceInfo] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        checkAttendanceStatus();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [currentMonth]);

    const checkAttendanceStatus = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/transport/driver/attendance-today`, { headers });
            if (res.data.isMarked) {
                setStatus('marked');
            } else {
                setStatus('ready');
                startLocationTracking();
            }
        } catch (error) {
            console.error('Error checking attendance:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/transport/driver/attendance-history`, { 
                params: {
                    month: currentMonth.getMonth() + 1,
                    year: currentMonth.getFullYear()
                },
                headers 
            });
            if (res.data.success) {
                setHistory(res.data.history || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const prevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentPos({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.error('Location error:', error);
                toast.error('Please enable location access to mark attendance');
            },
            { enableHighAccuracy: true }
        );
    };

    const markAttendance = async () => {
        try {
            setLoading(true);
            
            // 1. Get fresh location at the moment of click
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { 
                    enableHighAccuracy: true,
                    timeout: 10000 
                });
            });

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Update UI with the detected location
            setCurrentPos({ lat, lng });

            // 2. Submit to backend
            const res = await axios.post(`${API_URL}/api/transport/driver/self-attendance`, {
                latitude: lat,
                longitude: lng
            }, { headers });

            if (res.data.success) {
                toast.success('Attendance marked successfully! 🚌');
                setStatus('marked');
                setDistanceInfo(null); // Clear any previous distance errors
                fetchHistory(); // Refresh history
            } else {
                const msg = res.data.message || 'Failed to mark attendance';
                toast.error(msg);
                if (msg.includes('outside the attendance radius')) {
                    setDistanceInfo(msg);
                }
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            
            // Handle Geolocation errors
            if (error.code === 1) { // PERMISSION_DENIED
                toast.error('Please allow location access to mark attendance');
            } else if (error.code === 2 || error.code === 3) { // POSITION_UNAVAILABLE or TIMEOUT
                toast.error('Could not detect location. Please try again or check your GPS.');
            } else {
                // Handle actual API errors (like server 500 crashes)
                const msg = error.response?.data?.message || 'Failed to mark attendance';
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // Calendar logic
    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const getDayStatus = (day) => {
        const record = history.find(h => isSameDay(parseISO(h.date), day));
        return record ? record.status : null;
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    📍 Self Attendance
                </h1>
                <p className="text-white/80 mt-1">Mark your daily attendance and check your history</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mark Attendance Section */}
                <Card title="Mark Today's Attendance">
                    <div className="p-4 text-center space-y-6">
                        {status === 'marked' ? (
                            <div className="py-6 space-y-4 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                                    ✅
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Attendance Marked!</h2>
                                <p className="text-slate-500">Your attendance for today has been recorded.</p>
                            </div>
                        ) : status === 'ready' ? (
                            <div className="space-y-6 py-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-pulse shadow-inner">
                                    📍
                                </div>
                                
                                {currentPos ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                                        <p className="font-semibold text-slate-800 mb-1">Location Detected</p>
                                        <div className="flex justify-center gap-4 text-xs">
                                            <span>Lat: {currentPos.lat.toFixed(4)}</span>
                                            <span>Lng: {currentPos.lng.toFixed(4)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic text-sm">
                                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                        Detecting your location...
                                    </div>
                                )}

                                {distanceInfo && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                                        ⚠️ {distanceInfo}
                                    </div>
                                )}

                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-200"
                                    onClick={markAttendance}
                                    disabled={loading || !currentPos}
                                >
                                    {loading ? 'Processing...' : 'Mark Attendance'}
                                </Button>
                            </div>
                        ) : status === 'checking' ? (
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500">Checking status...</p>
                            </div>
                        ) : (
                            <div className="py-8 space-y-4">
                                <div className="text-5xl">⚠️</div>
                                <h2 className="text-xl font-bold text-slate-800">Connection Error</h2>
                                <Button variant="secondary" onClick={checkAttendanceStatus}>Retry</Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Calendar History Section */}
                <Card 
                    title={
                        <div className="flex items-center justify-between w-full pr-4">
                            <span>{format(currentMonth, 'MMMM yyyy')}</span>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">⬅️</button>
                                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">➡️</button>
                            </div>
                        </div>
                    }
                >
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, index) => (
                                <div key={`${d}-${index}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, idx) => {
                                const status = getDayStatus(day);
                                const isMonthUnderView = day.getMonth() === currentMonth.getMonth();
                                const today = isToday(day);

                                return (
                                    <div 
                                        key={idx} 
                                        className={`
                                            relative h-14 flex items-center justify-center rounded-2xl text-lg font-black transition-all shadow-sm border-2
                                            ${!isMonthUnderView ? 'bg-slate-50 text-slate-300 border-slate-50' : 'bg-white text-slate-900 border-slate-200'}
                                            ${today ? 'ring-4 ring-blue-600 ring-offset-2 z-10 scale-105 border-blue-200' : ''}
                                            ${status === 'Present' ? '!bg-emerald-600 !text-white !border-emerald-700' : 
                                              status === 'Absent' ? '!bg-red-600 !text-white !border-red-700' : ''}
                                        `}
                                    >
                                        {format(day, 'd')}
                                        {status && (
                                            <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white shadow-md ${
                                                status === 'Present' ? 'bg-emerald-400' : 'bg-red-400'
                                            }`}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-8 flex justify-center gap-8 p-4 rounded-2xl bg-slate-100/50 border border-slate-200">
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-200"></div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Present</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm shadow-red-200"></div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Absent</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 shadow-sm shadow-slate-100"></div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">No Info</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Instruction Card */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4 text-amber-800 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">💡</div>
                <div className="text-sm">
                    <p className="font-bold text-amber-900">Attendance Rules:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-amber-700/90 leading-relaxed">
                        <li>Mark attendance upon reaching the school gate.</li>
                        <li>Location access is required for automatic distance verification.</li>
                        <li>History is updated instantly after marking.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DriverSelfAttendance;
