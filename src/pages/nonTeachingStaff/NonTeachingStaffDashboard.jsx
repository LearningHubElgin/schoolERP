import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { LayoutDashboard, Clock, UserCircle, ClipboardList, CalendarCheck, Users, BookOpen, Bell } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }) => (
    <Card variant="elevated" className="hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 cursor-default group h-full">
        <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
                </div>
                {trend && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-green-50 text-green-700">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs md:text-sm font-medium text-slate-500 truncate">{title}</p>
                <p className="text-lg md:text-2xl lg:text-3xl font-bold text-slate-800 mt-1 truncate">{value}</p>
            </div>
        </div>
    </Card>
);

const NonTeachingStaffDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [currentTime, setCurrentTime] = useState(new Date());
    const [staffName] = useState('Staff Member');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Placeholder data
    const stats = {
        totalWorkingDays: 24,
        presentDays: 22,
        attendancePercent: '91.7',
        pendingTasks: 3,
        dutyShifts: 2,
        assignedAreas: 4,
    };

    const recentNotices = [
        { id: 1, title: 'Monthly cleaning audit on Friday', date: '28 Mar 2026', priority: 'High' },
        { id: 2, title: 'Submit uniform request by month end', date: '31 Mar 2026', priority: 'Medium' },
        { id: 3, title: 'Annual day preparation — extra duty', date: '01 Apr 2026', priority: 'Low' },
    ];

    const todaySchedule = [
        { time: '07:00 AM', task: 'Campus Gate Opening', area: 'Main Gate' },
        { time: '08:00 AM', task: 'Classroom Cleaning', area: 'Block A (Ground Floor)' },
        { time: '10:00 AM', task: 'Tea Break', area: '—' },
        { time: '10:30 AM', task: 'Office Assistance', area: 'Admin Office' },
        { time: '12:30 PM', task: 'Lunch Distribution', area: 'Canteen Area' },
        { time: '02:00 PM', task: 'Garden Maintenance', area: 'School Garden' },
    ];

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Welcome Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-4 md:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Welcome Back, {staffName}! 👋</h1>
                            <p className="mt-2 text-teal-100 text-sm md:text-lg max-w-2xl">
                                You have <span className="font-semibold text-white">{stats.pendingTasks} pending tasks</span> and <span className="font-semibold text-white">{stats.dutyShifts} duty shifts</span> assigned today.
                            </p>
                        </div>
                        <div className="px-4 py-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg text-center min-w-[180px]">
                            <p className="text-2xl font-bold font-mono tracking-wider">{formatTime(currentTime)}</p>
                            <p className="text-xs text-teal-100 mt-1">{formatDate(currentTime)}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:flex md:gap-4">
                        <button
                            onClick={() => navigate('/nonTeachingStaff/attendance')}
                            className="w-full md:w-auto px-4 py-2 bg-white text-teal-600 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                        >
                            Mark Attendance
                        </button>
                        <button
                            onClick={() => navigate('/nonTeachingStaff/assigned-work')}
                            className="w-full md:w-auto px-4 py-2 bg-teal-700 bg-opacity-40 text-white border border-white/20 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-50 transition-all active:scale-95"
                        >
                            View Tasks
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-teal-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard title="Attendance %" value={`${stats.attendancePercent}%`} icon={CalendarCheck} color="text-emerald-600" bgColor="bg-emerald-100" trend={`${stats.presentDays}/${stats.totalWorkingDays}`} />
                <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={ClipboardList} color="text-amber-600" bgColor="bg-amber-100" />
                <StatCard title="Duty Shifts" value={stats.dutyShifts} icon={Clock} color="text-blue-600" bgColor="bg-blue-100" />
                <StatCard title="Assigned Areas" value={stats.assignedAreas} icon={Users} color="text-violet-600" bgColor="bg-violet-100" />
            </div>

            {/* Main Grid: Schedule + Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Today's Duty Schedule */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" /> Today's Duty Schedule
                    </h2>
                    <Card variant="elevated" className="h-fit border-t-4 border-t-teal-500">
                        {todaySchedule.length > 0 ? (
                            <div className="space-y-2">
                                {todaySchedule.map((slot, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-md ${slot.task === 'Tea Break'
                                            ? 'bg-gray-50 border-gray-100'
                                            : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${slot.task === 'Tea Break'
                                            ? 'bg-gray-200 text-gray-500'
                                            : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                                        }`}>
                                            {slot.time.split(' ')[0]}
                                            <br />
                                            <span className="text-[9px]">{slot.time.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{slot.task}</h3>
                                            <p className="text-sm text-gray-500">{slot.area}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <span className="text-4xl mb-2 block">📅</span>
                                <p className="text-gray-500">No duties scheduled for today.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Notices */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600" /> Recent Notices
                    </h2>
                    <Card variant="elevated" className="h-fit border-t-4 border-t-amber-500">
                        {recentNotices.length > 0 ? (
                            <div className="space-y-3">
                                {recentNotices.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800 text-sm">{notice.title}</h3>
                                            <Badge
                                                variant={notice.priority === 'High' ? 'destructive' : notice.priority === 'Medium' ? 'warning' : 'default'}
                                                className="flex-shrink-0 text-xs"
                                            >
                                                {notice.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">📆 {notice.date}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <span className="text-4xl mb-2 block">📋</span>
                                <p className="text-gray-500">No notices available.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions" variant="elevated" className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => navigate('/nonTeachingStaff/attendance')} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all duration-300 group text-left">
                        <div className="w-12 h-12 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Self Attendance</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Mark your daily attendance</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/nonTeachingStaff/profile')} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all duration-300 group text-left">
                        <div className="w-12 h-12 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">My Profile</h4>
                            <p className="text-xs text-slate-500 mt-0.5">View personal details</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/nonTeachingStaff/assigned-work')} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all duration-300 group text-left">
                        <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Assigned Work</h4>
                            <p className="text-xs text-slate-500 mt-0.5">View tasks & assignments</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/nonTeachingStaff/dashboard')} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group text-left">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Dashboard</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Overview & analytics</p>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default NonTeachingStaffDashboard;
