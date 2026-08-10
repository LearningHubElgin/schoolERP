import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    parseISO,
    isSunday
} from 'date-fns';
const API_BASE = API_URL;

/* ─────────────────────────────────────────────
   ANIMATED DONUT (for report tab)
───────────────────────────────────────────── */
const AnimatedDonut = ({ present, absent, late, size = 120 }) => {
    const [animated, setAnimated] = useState(false);
    const total = present + absent + late;
    const pctPresent = total > 0 ? (present / total) * 100 : 0;
    const pctLate = total > 0 ? (late / total) * 100 : 0;
    const r = 52;
    const circ = 2 * Math.PI * r;

    useEffect(() => {
        setAnimated(false);
        const t = setTimeout(() => setAnimated(true), 80);
        return () => clearTimeout(t);
    }, [present, absent, late]);

    const presentDash = animated ? (pctPresent / 100) * circ : 0;
    const lateDash = animated ? (pctLate / 100) * circ : 0;
    const absentDash = animated ? ((100 - pctPresent - pctLate) / 100) * circ : 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="60" cy="60" r={r} fill="none" stroke="#fca5a5" strokeWidth="12"
                    strokeDasharray={`${absentDash} ${circ}`} strokeDashoffset={-(presentDash + lateDash)}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '0.5s' }} />
                <circle cx="60" cy="60" r={r} fill="none" stroke="#fbbf24" strokeWidth="12"
                    strokeDasharray={`${lateDash} ${circ}`} strokeDashoffset={-presentDash}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '0.3s' }} />
                <circle cx="60" cy="60" r={r} fill="none" stroke="url(#drvPG)" strokeWidth="12"
                    strokeDasharray={`${presentDash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '0.1s' }} />
                <defs><linearGradient id="drvPG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#2563eb" />
                </linearGradient></defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 leading-none">{pctPresent.toFixed(0)}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">present</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const DriverAttendance = () => {
    // ── Main Tab: "attendance" (daily view + manual) or "report" (daily/weekly/monthly + export)
    const [activeTab, setActiveTab] = useState('attendance');

    // ══════ ATTENDANCE TAB STATE ══════
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);
    const [allDrivers, setAllDrivers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        driver_id: '', date: '', status: 'Present', check_in: '', check_out: ''
    });

    // ══════ REPORT TAB STATE ══════
    const [reportView, setReportView] = useState('daily'); // daily | weekly | monthly
    const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reportPeriodStart, setReportPeriodStart] = useState(new Date());
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // ══════ ATTENDANCE TAB LOGIC ══════
    useEffect(() => {
        if (activeTab === 'attendance') fetchAttendanceData();
    }, [selectedDate, activeTab]);

    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/driver/attendance?date=${selectedDate}`, { headers });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setAttendanceList(data.attendance);
                setAllDrivers(data.attendance.map(r => ({ id: r.driver_id, name: r.name })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const handleManualEntry = (record = null) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                driver_id: record.driver_id, date: selectedDate, status: record.status,
                check_in: (record.check_in && record.check_in !== '-') ? record.check_in : '',
                check_out: (record.check_out && record.check_out !== '-') ? record.check_out : ''
            });
        } else {
            setEditingRecord(null);
            setFormData({ driver_id: '', date: selectedDate, status: 'Present', check_in: '', check_out: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/admin/driver/attendance/manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Attendance updated');
                setShowModal(false);
                fetchAttendanceData();
            } else { toast.error(data.message); }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to save');
        }
    };

    // ══════ REPORT TAB LOGIC ══════
    const fetchReport = async () => {
        setReportLoading(true);
        try {
            let start, end;
            if (reportView === 'daily') { start = parseISO(reportDate); end = parseISO(reportDate); }
            else if (reportView === 'weekly') { start = startOfWeek(reportPeriodStart, { weekStartsOn: 1 }); end = endOfWeek(reportPeriodStart, { weekStartsOn: 1 }); }
            else { start = startOfMonth(reportPeriodStart); end = endOfMonth(reportPeriodStart); }

            const res = await fetch(`${API_BASE}/api/admin/driver/attendance-report?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`, { headers });
            const data = await res.json();
            if (data.success) setReportData(data.report || []);
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to fetch report data');
        } finally { setReportLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'report') fetchReport();
    }, [reportDate, reportView, reportPeriodStart, activeTab]);

    const reportDays = useMemo(() => {
        if (reportView === 'daily') return [parseISO(reportDate)];
        let start, end;
        if (reportView === 'weekly') { start = startOfWeek(reportPeriodStart, { weekStartsOn: 1 }); end = endOfWeek(reportPeriodStart, { weekStartsOn: 1 }); }
        else { start = startOfMonth(reportPeriodStart); end = endOfMonth(reportPeriodStart); }
        return eachDayOfInterval({ start, end });
    }, [reportView, reportPeriodStart, reportDate]);

    const filteredReport = useMemo(() => {
        if (!searchTerm) return reportData;
        const s = searchTerm.toLowerCase();
        return reportData.filter(r => r.name.toLowerCase().includes(s) || (r.employee_id && r.employee_id.toLowerCase().includes(s)));
    }, [reportData, searchTerm]);

    const reportStats = useMemo(() => {
        let present = 0, absent = 0, late = 0;
        filteredReport.forEach(driver => {
            reportDays.forEach(day => {
                if (isSunday(day)) return;
                const key = format(day, 'yyyy-MM-dd');
                const entry = driver.attendance[key];
                if (entry) {
                    if (entry.status === 'Late') { late++; present++; }
                    else if (entry.status === 'Present') present++;
                    else absent++;
                } else { absent++; }
            });
        });
        return { present, absent, late, totalStaff: filteredReport.length };
    }, [filteredReport, reportDays]);

    const navigateReportPeriod = (dir) => {
        if (reportView === 'weekly') setReportPeriodStart(prev => dir === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
        else if (reportView === 'monthly') setReportPeriodStart(prev => dir === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const getReportPeriodLabel = () => {
        if (reportView === 'daily') return format(parseISO(reportDate), 'dd MMMM yyyy');
        if (reportView === 'weekly') {
            const s = startOfWeek(reportPeriodStart, { weekStartsOn: 1 });
            const e = endOfWeek(reportPeriodStart, { weekStartsOn: 1 });
            return `${format(s, 'dd MMM')} – ${format(e, 'dd MMM yyyy')}`;
        }
        return format(reportPeriodStart, 'MMMM yyyy');
    };

    const formatTime12h = (timeStr) => {
        if (!timeStr || timeStr === '-') return '-';
        try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return timeStr;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h = hours % 12 || 12;
            const m = String(minutes).padStart(2, '0');
            return `${h}:${m} ${ampm}`;
        } catch { return timeStr; }
    };

    const getStaffSummary = (driver) => {
        let p = 0, a = 0;
        reportDays.forEach(day => {
            if (isSunday(day)) return;
            const key = format(day, 'yyyy-MM-dd');
            const entry = driver.attendance[key];
            if (entry && (entry.status === 'Present' || entry.status === 'Late')) p++;
            else a++;
        });
        return { present: p, absent: a, pct: (p + a) > 0 ? Math.round((p / (p + a)) * 100) : 0 };
    };

    // ── Export PDF ──
    const exportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Driver Attendance Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Period: ${getReportPeriodLabel()}`, 14, 22);

        const hdr = ['#', 'Name', 'Employee ID', 'Phone'];
        reportDays.forEach(d => hdr.push(format(d, 'dd/MM')));
        hdr.push('Present', 'Absent', '%');

        const rows = filteredReport.map((driver, idx) => {
            let p = 0, a = 0;
            const row = [idx + 1, driver.name, driver.employee_id || '-', driver.phone || '-'];
            reportDays.forEach(day => {
                const key = format(day, 'yyyy-MM-dd');
                const entry = driver.attendance[key];
                if (isSunday(day)) { row.push('S'); return; }
                if (entry && (entry.status === 'Present' || entry.status === 'Late')) { row.push('P'); p++; }
                else { row.push('A'); a++; }
            });
            const total = p + a;
            row.push(p, a, total > 0 ? `${Math.round((p / total) * 100)}%` : '-');
            return row;
        });

        const { default: autoTable } = await import('jspdf-autotable');
        autoTable(doc, {
            head: [hdr], body: rows, startY: 28,
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [239, 246, 255] },
        });
        doc.save(`Driver_Attendance_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast.success('PDF exported!');
    };

    // ── Export Excel ──
    const exportExcel = async () => {
        const XLSX = await import('xlsx');
        const hdr = ['#', 'Name', 'Employee ID', 'Phone'];
        reportDays.forEach(d => hdr.push(format(d, 'dd/MM/yy')));
        hdr.push('Present', 'Absent', 'Attendance %');

        const rows = filteredReport.map((driver, idx) => {
            let p = 0, a = 0;
            const row = [idx + 1, driver.name, driver.employee_id || '-', driver.phone || '-'];
            reportDays.forEach(day => {
                const key = format(day, 'yyyy-MM-dd');
                const entry = driver.attendance[key];
                if (isSunday(day)) { row.push('Sunday'); return; }
                if (entry && (entry.status === 'Present' || entry.status === 'Late')) { row.push('P'); p++; }
                else { row.push('A'); a++; }
            });
            const total = p + a;
            row.push(p, a, total > 0 ? `${Math.round((p / total) * 100)}%` : '-');
            return row;
        });

        const ws = XLSX.utils.aoa_to_sheet([hdr, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        XLSX.writeFile(wb, `Driver_Attendance_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        toast.success('Excel exported!');
    };

    // ── Render status cell for report grid ──
    const renderStatusCell = (driver, day) => {
        const key = format(day, 'yyyy-MM-dd');
        const entry = driver.attendance[key];

        if (isSunday(day)) return (
            <td key={key} className="px-1 py-2 text-center border-r border-slate-100">
                <span className="inline-block w-7 h-7 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-bold leading-7">S</span>
            </td>
        );
        if (!entry) return (
            <td key={key} className="px-1 py-2 text-center border-r border-slate-100">
                <span className="inline-block w-7 h-7 rounded-lg bg-red-50 text-red-400 text-[10px] font-bold leading-7">A</span>
            </td>
        );

        const cfg = {
            Present: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'P' },
            Late: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'L' },
            Absent: { bg: 'bg-red-100', text: 'text-red-600', label: 'A' },
        }[entry.status] || { bg: 'bg-red-100', text: 'text-red-600', label: 'A' };

        return (
            <td key={key} className="px-1 py-2 text-center group relative border-r border-slate-100">
                <span className={`inline-block w-7 h-7 rounded-lg ${cfg.bg} ${cfg.text} text-[10px] font-bold leading-7 cursor-default`}>{cfg.label}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-slate-800 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-slate-700">
                        <div className="font-bold">{entry.status}</div>
                        {entry.check_in && <div>In: {formatTime12h(entry.check_in)}</div>}
                        {entry.check_out && <div>Out: {formatTime12h(entry.check_out)}</div>}
                        {entry.working_hours && <div>Hours: {entry.working_hours}</div>}
                        {entry.day_type && entry.day_type !== '-' && <div>Type: {entry.day_type}</div>}
                    </div>
                </div>
            </td>
        );
    };

    return (
        <div className="space-y-6">
            {/* ── Header Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">📊 Driver Attendance dashboard</h1>
                        <p className="mt-1 text-blue-100 text-xs md:text-sm">
                            Track daily attendance and generate exportable driver reports.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleManualEntry()}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md border border-white/20 hover:scale-105 active:scale-95 flex items-center gap-2">
                            <span>📝</span> Manual Entry
                        </button>
                        <button onClick={() => window.location.href = '/admin/school-settings'}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md border border-white/20 hover:scale-105 active:scale-95 flex items-center gap-2">
                            <span>⚙️</span> Settings
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            </div>

            {/* ── Main Tab Switcher ── */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-fit">
                <button onClick={() => setActiveTab('attendance')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-200'}`}>
                    ✅ Daily Attendance
                </button>
                <button onClick={() => setActiveTab('report')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'report' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-200'}`}>
                    📊 Attendance Report
                </button>
            </div>

            {/* ════════════════════════════════════════
                ATTENDANCE TAB (Daily View)
            ════════════════════════════════════════ */}
            {activeTab === 'attendance' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Date Picker */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm font-bold text-slate-600">Select Date:</span>
                        <input type="date" value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm font-medium"
                            max={new Date().toISOString().split('T')[0]} />
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            {[
                                { label: 'Total Drivers', value: stats.total, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
                                { label: 'Present', value: stats.present, bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700' },
                                { label: 'Late', value: stats.late, bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700' },
                                { label: 'Half Day', value: stats.half_day, bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700' },
                                { label: 'Absent', value: stats.absent, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700' },
                            ].map((c, i) => (
                                <Card key={i} className={`${c.bg} ${c.border} cursor-default`}>
                                    <div className="text-gray-500 text-sm font-medium">{c.label}</div>
                                    <div className={`text-2xl font-bold ${c.text}`}>{c.value}</div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Analytics */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card className="shadow-sm border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span> Status Distribution
                                </h2>
                                <div className="flex items-end gap-4 h-64 w-full bg-white p-4 rounded-lg">
                                    {[
                                        { label: 'Present', value: stats.present, color: 'bg-green-500', text: 'text-green-600' },
                                        { label: 'Late', value: stats.late, color: 'bg-yellow-500', text: 'text-yellow-600' },
                                        { label: 'Half Day', value: stats.half_day, color: 'bg-orange-500', text: 'text-orange-600' },
                                        { label: 'Absent', value: stats.absent, color: 'bg-red-500', text: 'text-red-600' }
                                    ].map(item => (
                                        <div key={item.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                            <div className="relative w-full flex justify-center items-end h-[85%]">
                                                <div className={`w-full max-w-[50px] rounded-t-lg transition-all duration-700 ${item.color} opacity-80 group-hover:opacity-100 shadow-sm`}
                                                    style={{ height: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%`, minHeight: item.value > 0 ? '6px' : '0' }}>
                                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-[10px] py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 shadow-xl">
                                                        {item.value} Drivers
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">{item.label}</span>
                                            <span className={`text-sm font-extrabold ${item.text}`}>{((item.value / (stats.total || 1)) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="shadow-sm border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-600 rounded-full"></span> Attendance Overview
                                </h2>
                                <div className="flex flex-col sm:flex-row items-center justify-around h-64 gap-6">
                                    <div className="relative w-48 h-48 rounded-full shadow-inner ring-8 ring-slate-50"
                                        style={{
                                            background: `conic-gradient(
                                                #22c55e 0% ${((stats.present / (stats.total || 1)) * 100)}%, 
                                                #eab308 ${((stats.present / (stats.total || 1)) * 100)}% ${((stats.present + stats.late) / (stats.total || 1)) * 100}%,
                                                #f97316 ${((stats.present + stats.late) / (stats.total || 1)) * 100}% ${((stats.present + stats.late + stats.half_day) / (stats.total || 1)) * 100}%,
                                                #ef4444 ${((stats.present + stats.late + stats.half_day) / (stats.total || 1)) * 100}% 100%
                                            )`
                                        }}>
                                        <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-lg ring-1 ring-slate-100">
                                            <span className="text-4xl font-black text-slate-800 tracking-tight">{stats.total}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">TOTAL</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { color: 'bg-green-500', label: 'Present', val: stats.present, sub: 'On Time' },
                                            { color: 'bg-yellow-500', label: 'Late', val: stats.late, sub: 'After Buffer' },
                                            { color: 'bg-orange-500', label: 'Half Day', val: stats.half_day, sub: 'Short Hours' },
                                            { color: 'bg-red-500', label: 'Absent', val: stats.absent, sub: 'No Entry' },
                                        ].map(l => (
                                            <div key={l.label} className="flex items-center gap-4 group cursor-default">
                                                <div className={`w-3.5 h-3.5 ${l.color} rounded-full ring-4 ring-slate-50 transition-all group-hover:scale-125`}></div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-700 leading-none mb-0.5">{l.label} ({l.val})</div>
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{l.sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Attendance Table */}
                    <Card className="p-0 overflow-hidden border-gray-100 shadow-sm">
                        <div className="p-4 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Detailed Report</h2>
                        </div>
                        <div className="overflow-x-auto p-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b text-[10px] uppercase text-gray-500 font-black tracking-[0.1em]">
                                        <th className="px-5 py-4">Driver Name</th>
                                        <th className="px-5 py-4 text-center">Employee ID</th>
                                        <th className="px-5 py-4 text-center">Attendance Status</th>
                                        <th className="px-5 py-4 text-center">Work Type</th>
                                        <th className="px-5 py-4 text-center">Working Hrs</th>
                                        <th className="px-5 py-4 text-center">Check In</th>
                                        <th className="px-5 py-4 text-center">Check Out</th>
                                        <th className="px-5 py-4 text-center">Loc</th>
                                        <th className="px-5 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="9" className="text-center py-16 text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Official Records...</td></tr>
                                    ) : attendanceList.length === 0 ? (
                                        <tr><td colSpan="9" className="text-center py-16 text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">📭 No Drivers Registered</td></tr>
                                    ) : attendanceList.map(record => (
                                        <tr key={record.driver_id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                            <td className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap border-l-4 border-transparent group-hover:border-blue-600 pl-4">{record.name}</td>
                                            <td className="px-5 py-4 text-[11px] text-gray-500 font-bold text-center tracking-wider">{record.employee_id}</td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge variant={record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'danger' : record.status === 'Late' ? 'warning' : 'info'}>
                                                    {record.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block border border-slate-200 shadow-sm">
                                                    {record.day_type || 'Unverified'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center text-xs font-black text-slate-800">{record.working_hours || '-'}</td>
                                            <td className="px-5 py-4 text-center text-[11px] font-bold text-slate-600">{formatTime12h(record.check_in)}</td>
                                            <td className="px-5 py-4 text-center text-[11px] font-bold text-slate-600">{formatTime12h(record.check_out)}</td>
                                            <td className="px-5 py-4 text-center">
                                                {record.location_verified ? (
                                                    <div className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[10px] shadow-lg shadow-green-100 ring-2 ring-white">✓</div>
                                                ) : <span className="text-slate-200 font-black">-</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => handleManualEntry(record)} className="px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-md text-[11px] font-black uppercase tracking-wider transition-all">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ════════════════════════════════════════
                REPORT TAB (Daily / Weekly / Monthly + Export)
            ════════════════════════════════════════ */}
            {activeTab === 'report' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                    {/* Controls */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/40 p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* View Mode */}
                            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                {['daily', 'weekly', 'monthly'].map(m => (
                                    <button key={m} onClick={() => setReportView(m)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${reportView === m ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-200'}`}>
                                        {m === 'daily' ? '📅 Daily' : m === 'weekly' ? '📆 Weekly' : '🗓️ Monthly'}
                                    </button>
                                ))}
                            </div>

                            {/* Period Navigation */}
                            <div className="flex items-center gap-3">
                                {reportView === 'daily' ? (
                                    <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                        className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm font-medium" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => navigateReportPeriod('prev')} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-all text-lg font-bold">←</button>
                                        <span className="text-sm font-bold text-slate-700 min-w-[180px] text-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">{getReportPeriodLabel()}</span>
                                        <button onClick={() => navigateReportPeriod('next')} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-all text-lg font-bold">→</button>
                                    </div>
                                )}
                            </div>

                            {/* Search + Export */}
                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                <div className="relative flex-1 lg:w-48">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                    <input type="text" placeholder="Search ID or Name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                                </div>
                                <button onClick={exportPDF} disabled={filteredReport.length === 0}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                    📄 PDF
                                </button>
                                <button onClick={exportExcel} disabled={filteredReport.length === 0}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                    📊 Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Staff', value: reportStats.totalStaff, icon: '👥', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
                                { label: 'Present', value: reportStats.present, icon: '✅', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                                { label: 'Late', value: reportStats.late, icon: '⏰', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                                { label: 'Absent', value: reportStats.absent, icon: '❌', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
                            ].map((c, i) => (
                                <div key={i} className={`${c.bg} ${c.border} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{c.icon}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.label}</span>
                                    </div>
                                    <div className={`text-2xl font-black ${c.text}`}>{c.value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-center gap-8">
                            <AnimatedDonut present={reportStats.present} absent={reportStats.absent} late={reportStats.late} size={120} />
                            <div className="space-y-3">
                                {[
                                    { w: 'bg-blue-500', l: 'Present', v: reportStats.present },
                                    { w: 'bg-amber-400', l: 'Late', v: reportStats.late },
                                    { w: 'bg-red-400', l: 'Absent', v: reportStats.absent },
                                ].map(e => (
                                    <div key={e.l} className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${e.w} flex-shrink-0`}></span>
                                        <span className="text-xs text-slate-500">{e.l}</span>
                                        <span className="ml-auto text-xs font-bold text-slate-700">{e.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/40 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📋</span>
                                Driver Attendance Grid
                            </h2>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 text-center leading-4">P</span> Present</span>
                                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-100 text-amber-700 text-center leading-4">L</span> Late</span>
                                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-100 text-red-600 text-center leading-4">A</span> Absent</span>
                                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-slate-100 text-slate-500 text-center leading-4">H</span> Holiday</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {reportLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-3 text-sm text-slate-500 font-medium">Loading report data...</p>
                                    </div>
                                </div>
                            ) : filteredReport.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center">
                                    <span className="text-6xl mb-4">📭</span>
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Staff Records Found</h3>
                                    <p className="text-sm text-slate-400">Try adjusting your date range or search filters.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-3 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 border-r border-slate-200">#</th>
                                            <th className="px-3 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky left-8 bg-slate-50 z-10 min-w-[140px] border-r border-slate-200">Staff Member</th>
                                            <th className="px-3 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[80px] border-r border-slate-200">ID</th>
                                            {reportDays.map(day => (
                                                <th key={format(day, 'yyyy-MM-dd')} className={`px-1 py-3 text-[9px] font-bold text-center min-w-[32px] border-r border-slate-200 ${isSunday(day) ? 'text-red-400 bg-red-50/50' : 'text-slate-500'}`}>
                                                    <div>{format(day, 'EEE').slice(0, 2)}</div>
                                                    <div className="text-[10px] font-black">{format(day, 'dd')}</div>
                                                </th>
                                            ))}
                                            <th className="px-3 py-3 text-[10px] font-bold text-emerald-600 uppercase tracking-wider text-center bg-emerald-50/50 border-r border-emerald-100">P</th>
                                            <th className="px-3 py-3 text-[10px] font-bold text-red-600 uppercase tracking-wider text-center bg-red-50/50 border-r border-red-100">A</th>
                                            <th className="px-3 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-center bg-blue-50/50 border-r border-blue-100">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredReport.map((driver, idx) => {
                                            const summary = getStaffSummary(driver);
                                            return (
                                                <tr key={driver.driver_id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-3 py-2 text-xs font-bold text-slate-400 sticky left-0 bg-white z-10 border-r border-slate-100">{idx + 1}</td>
                                                    <td className="px-3 py-2 sticky left-8 bg-white z-10 border-r border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                {driver.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{driver.name}</div>
                                                                <div className="text-[10px] text-slate-400">{driver.phone || 'Driver'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 border-r border-slate-100">
                                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{driver.employee_id || '-'}</span>
                                                    </td>
                                                    {reportDays.map(day => renderStatusCell(driver, day))}
                                                    <td className="px-3 py-2 text-center bg-emerald-50/30 border-r border-emerald-100/50">
                                                        <span className="text-xs font-black text-emerald-700">{summary.present}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center bg-red-50/30 border-r border-red-100/50">
                                                        <span className="text-xs font-black text-red-600">{summary.absent}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center bg-blue-50/30 border-r border-blue-100/50">
                                                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${summary.pct >= 75 ? 'bg-emerald-100 text-emerald-700' : summary.pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                                                            {summary.pct}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Manual Entry Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingRecord ? 'Edit Attendance' : 'Manual Entry'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                                <select value={formData.driver_id} onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700"
                                    required disabled={!!editingRecord}>
                                    <option value="">Select Driver</option>
                                    {allDrivers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700">
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Half Day">Half Day</option>
                                        <option value="Late">Late</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                                    <input type="time" value={formData.check_in} onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                                    <input type="time" value={formData.check_out} onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition-all">Cancel</button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverAttendance;
