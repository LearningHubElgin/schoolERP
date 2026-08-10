import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const StudentAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('month'); // 'month' or 'date' or 'total'
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Current month YYYY-MM
    const [selectedDate, setSelectedDate] = useState('');
    const [attendanceMode, setAttendanceMode] = useState('subject_wise'); // 'subject_wise' or 'day_wise'
    const [holidays, setHolidays] = useState([]);
    const [weeklySchedule, setWeeklySchedule] = useState([]);

    useEffect(() => {
        fetchAttendance();
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/student/holidays`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setHolidays(res.data.holidays || []);
                setWeeklySchedule(res.data.weekly_schedule || []);
            }
        } catch (err) { console.error('Fetch holidays error:', err); }
    };

    const isHolidayDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return false;
            const dayOfWeek = d.getDay();

            const scheduleItem = weeklySchedule.find(s => Number(s.day_of_week) === dayOfWeek);
            if (scheduleItem) {
                const isWorking = scheduleItem.is_working === 1 || scheduleItem.is_working === true || String(scheduleItem.is_working) === '1' || String(scheduleItem.is_working) === 'true';
                if (!isWorking) return true;
            } else {
                if (dayOfWeek === 0) return true;
            }

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

    const getHolidayName = (dateStr) => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();

        const defaultWorking = dayOfWeek !== 0;
        const scheduleItem = weeklySchedule.find(s => Number(s.day_of_week) === dayOfWeek);
        const isWorkingDay = scheduleItem ? (scheduleItem.is_working === 1 || scheduleItem.is_working === true || scheduleItem.is_working === '1' || scheduleItem.is_working === 'true') : defaultWorking;

        if (!isWorkingDay) return 'Weekly Holiday';

        const match = holidays.find(h => {
            const start = new Date(h.start_date); start.setHours(0, 0, 0, 0);
            const end = h.end_date ? new Date(h.end_date) : new Date(h.start_date); end.setHours(23, 59, 59, 999);
            const check = new Date(dateStr); check.setHours(12, 0, 0, 0);
            return check >= start && check <= end;
        });
        return match ? match.title : null;
    };

    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/student/attendance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setAttendanceData(response.data.attendance);
                if (response.data.attendanceMode) {
                    setAttendanceMode(response.data.attendanceMode);
                }
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const isDayWise = attendanceMode === 'day_wise';

    const filteredAttendance = attendanceData.filter(record => {
        if (isDayWise && record.subject !== 'day_wise') return false;

        if (filterType === 'total') {
            return true;
        } else if (filterType === 'month') {
            return record.date_str && record.date_str.startsWith(selectedMonth);
        } else {
            return selectedDate ? record.date_str === selectedDate : true;
        }
    });

    const dayWiseFiltered = isDayWise
        ? Object.values(filteredAttendance.reduce((acc, record) => {
            if (!acc[record.date_str]) acc[record.date_str] = record;
            return acc;
        }, {}))
        : filteredAttendance;

    const subjects = isDayWise ? [] : [...new Set(attendanceData.filter(r => r.subject !== 'day_wise').map(r => r.subject))];

    const formatDate = (dateString) => {
        if (!dateString) return '';
        let str = String(dateString).split('T')[0].split(' ')[0];
        const parts = str.split('-');
        if (parts.length === 3) {
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDayName = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
    };

    const getMonthCalendarData = () => {
        if (!isDayWise) return [];
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const record = attendanceData.find(r => r.date_str === dateStr && r.subject === 'day_wise');
            days.push({ date: dateStr, day: d, record });
        }
        return days;
    };

    const displayRecords = isDayWise ? dayWiseFiltered : filteredAttendance;
    const displayStats = (() => {
        if (isDayWise && filterType === 'month') {
            const calData = getMonthCalendarData();
            let total = 0;
            let present = 0;
            let absent = 0;
            let holiday = 0;
            calData.forEach(d => {
                const today = new Date().toISOString().split('T')[0];
                const isFuture = d.date > today;
                if (isFuture) return;

                const stat = d.record ? d.record.status?.toLowerCase() : null;
                const isHolidayDay = isHolidayDate(d.date);

                if (stat === 'present' || stat === 'half day') {
                    total++;
                    present++;
                } else if (stat === 'holiday' || isHolidayDay) {
                    total++;
                    holiday++;
                } else {
                    total++;
                    absent++;
                }
            });
            return { total, present, absent, holiday };
        } else {
            const records = isDayWise ? dayWiseFiltered : filteredAttendance;
            let present = 0, absent = 0, holiday = 0;
            
            records.forEach(r => {
                const stat = r.status?.toLowerCase();
                if (stat === 'present' || stat === 'late') present++;
                else if (stat === 'holiday' || isHolidayDate(r.date_str || r.date)) holiday++;
                else absent++;
            });

            return { 
                total: records.length, 
                present, 
                absent, 
                holiday 
            };
        }
    })();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 text-xs font-medium">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-4">
            {/* Header - Gradient Hero */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 md:p-4 text-white shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-base md:text-lg font-bold tracking-tight">My Attendance 📅</h1>
                        <p className="text-emerald-100 text-xs mt-0.5 opacity-90">Track your daily presence and performance</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/20 text-white border border-white/30">
                            {isDayWise ? '📅 Day-wise Attendance' : '📚 Subject-wise Attendance'}
                        </span>
                    </div>
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/10 shadow-sm flex items-center gap-2 text-xs">
                        <span className="text-base">📅</span>
                        <div className="text-right">
                            <p className="text-[9px] text-emerald-100 uppercase font-bold tracking-wider">Today</p>
                            <p className="text-xs font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall Summary Stats - 4 Column Grid on Mobile */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                {/* Total Days */}
                <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-blue-500 shadow-2xs hover:shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                        <div className="min-w-0 w-full">
                            <p className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">
                                {isDayWise ? 'Total Days' : 'Classes'}
                            </p>
                            <p className="text-xs sm:text-base md:text-lg font-bold text-slate-800 truncate">{displayStats.total}</p>
                        </div>
                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">
                            {isDayWise ? '📅' : '📚'}
                        </div>
                    </div>
                </Card>

                {/* Present */}
                <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-emerald-500 shadow-2xs hover:shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                        <div className="min-w-0 w-full">
                            <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate">Present</p>
                            <p className="text-xs sm:text-base md:text-lg font-bold text-emerald-600 truncate">{displayStats.present}</p>
                        </div>
                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">
                            ✅
                        </div>
                    </div>
                </Card>

                {/* Absent */}
                <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-rose-500 shadow-2xs hover:shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                        <div className="min-w-0 w-full">
                            <p className="text-[8px] sm:text-[10px] font-bold text-rose-600 uppercase tracking-wider truncate">Absent</p>
                            <p className="text-xs sm:text-base md:text-lg font-bold text-rose-600 truncate">{displayStats.absent}</p>
                        </div>
                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">
                            ✗
                        </div>
                    </div>
                </Card>

                {/* Holiday */}
                <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-slate-400 shadow-2xs hover:shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                        <div className="min-w-0 w-full">
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Holiday</p>
                            <p className="text-xs sm:text-base md:text-lg font-bold text-slate-800 truncate">{displayStats.holiday}</p>
                        </div>
                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">
                            🏖️
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Attendance List */}
                <div className={isDayWise ? 'lg:col-span-3' : 'lg:col-span-2'}>
                    <Card className="!p-3 overflow-hidden border-t-2 border-t-emerald-500" variant="elevated">
                        <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <h3 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs">📝</span>
                                Attendance Log
                            </h3>

                            {/* Filter Section */}
                            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                                <div className="flex bg-slate-100 p-0.5 rounded-lg w-full sm:w-auto text-xs">
                                    <button
                                        onClick={() => setFilterType('total')}
                                        className={`flex-1 sm:flex-none px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${filterType === 'total'
                                            ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        Total
                                    </button>
                                    <button
                                        onClick={() => setFilterType('month')}
                                        className={`flex-1 sm:flex-none px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${filterType === 'month'
                                            ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        Month
                                    </button>
                                    <button
                                        onClick={() => setFilterType('date')}
                                        className={`flex-1 sm:flex-none px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${filterType === 'date'
                                            ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        Date
                                    </button>
                                </div>

                                {filterType === 'month' && (
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full sm:w-auto px-2 py-1 border border-slate-200 bg-slate-50 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                )}
                                {filterType === 'date' && (
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full sm:w-auto px-2 py-1 border border-slate-200 bg-slate-50 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Day-wise Calendar View */}
                        {isDayWise && filterType === 'month' && (
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                    📅 Monthly Overview
                                </h4>
                                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 pb-0.5">{d}</div>
                                    ))}
                                    {(() => {
                                        const calData = getMonthCalendarData();
                                        if (calData.length === 0) return null;
                                        const [year, month] = selectedMonth.split('-').map(Number);
                                        const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
                                        const blanks = Array(firstDayOfWeek).fill(null);
                                        return [
                                            ...blanks.map((_, i) => <div key={`blank-${i}`} />),
                                            ...calData.map(d => {
                                                const today = new Date().toISOString().split('T')[0];
                                                const isFuture = d.date > today;
                                                let icon = '';
                                                let bgColor = 'bg-white text-slate-700';

                                                const stat = d.record ? d.record.status?.toLowerCase() : null;
                                                const isHolidayDay = isHolidayDate(d.date);

                                                if (!isFuture && stat === 'present') {
                                                    icon = '✅'; bgColor = 'bg-emerald-100 text-emerald-700 font-bold border-emerald-200';
                                                }
                                                else if (!isFuture && stat === 'half day') {
                                                    icon = '⏳'; bgColor = 'bg-amber-100 text-amber-700 font-bold border-amber-200';
                                                }
                                                else if (!isFuture && (stat === 'holiday' || isHolidayDay)) {
                                                    icon = 'H'; bgColor = 'bg-slate-100 text-slate-400';
                                                }
                                                else if (isFuture) {
                                                    bgColor = 'bg-slate-50 text-slate-300';
                                                }
                                                else {
                                                    icon = '✗';
                                                    bgColor = 'bg-rose-100 text-rose-700 font-bold border-rose-200 opacity-80';
                                                }
                                                return (
                                                    <div key={d.date}
                                                        className={`relative rounded-md p-1 text-center text-xs font-medium ${bgColor} transition-all`}
                                                        title={`${formatDate(d.date)} - ${d.record ? d.record.status : (isHolidayDate(d.date) ? (getHolidayName(d.date) || 'Holiday') : (isFuture ? 'Future Date' : 'Absent (No Record)'))}`}
                                                    >
                                                        {d.day}
                                                        {icon && <span className="absolute bottom-0.5 right-0.5 text-[9px]">{icon}</span>}
                                                    </div>
                                                );
                                            })
                                        ];
                                    })()}
                                </div>
                            </div>
                        )}

                        {displayRecords.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                <p className="text-slate-800 font-semibold text-xs">No attendance records found</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    {filterType === 'month'
                                        ? `No records for ${new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}`
                                        : filterType === 'date'
                                            ? (selectedDate ? `No records for ${new Date(selectedDate).toLocaleDateString()}` : 'Select a date to view records')
                                            : 'No attendance history available'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            {isDayWise && (
                                                <th className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Day</th>
                                            )}
                                            {!isDayWise && (
                                                <th className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                                            )}
                                            <th className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100 text-xs">
                                        {displayRecords.map((record, index) => (
                                            <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-3 py-1.5 whitespace-nowrap font-medium text-slate-900">
                                                    {formatDate(record.date_str)}
                                                </td>
                                                {isDayWise && (
                                                    <td className="px-3 py-1.5 whitespace-nowrap text-slate-600">
                                                        {getDayName(record.date_str)}
                                                    </td>
                                                )}
                                                {!isDayWise && (
                                                    <td className="px-3 py-1.5 whitespace-nowrap text-slate-600">
                                                        {record.subject}
                                                    </td>
                                                )}
                                                <td className="px-3 py-1.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${record.status === 'present'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                        }`}>
                                                        {record.status === 'present' ? '● Present' : '● Absent'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Subject Performance */}
                {!isDayWise && (
                    <div className="lg:col-span-1">
                        <Card title="Subject Performance" className="!p-3 border-t-2 border-t-orange-500 h-full" variant="elevated">
                            <div className="space-y-3">
                                {subjects.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        <p>No subject data available</p>
                                    </div>
                                ) : subjects.map((subject) => {
                                    const subjectRecords = attendanceData.filter(r => r.subject === subject);
                                    const subjectPresent = subjectRecords.filter(r => r.status === 'present').length;
                                    const subjectTotal = subjectRecords.length;
                                    const subjectPercentage = subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : 0;

                                    const colorClass = subjectPercentage >= 75 ? 'bg-emerald-500' : subjectPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                    const textClass = subjectPercentage >= 75 ? 'text-emerald-700' : subjectPercentage >= 50 ? 'text-amber-700' : 'text-rose-700';

                                    return (
                                        <div key={subject} className="group">
                                            <div className="flex justify-between items-end mb-1 text-xs">
                                                <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{subject}</span>
                                                <div className="text-right">
                                                    <span className={`font-bold ${textClass}`}>{subjectPercentage}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${colorClass}`}
                                                    style={{ width: `${subjectPercentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-0.5 text-right">
                                                {subjectPresent}/{subjectTotal} sessions
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
