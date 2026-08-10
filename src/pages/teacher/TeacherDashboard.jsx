import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';

const StatCard = ({ title, value, icon, color, borderColor, onClick }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-emerald-500': '#10b981',
        'border-purple-500': '#a855f7',
        'border-amber-500': '#f59e0b',
    };

    return (
        <div
            className={`bg-white rounded-xl border border-slate-100 border-l-4 shadow-2xs hover:shadow-md transition-all duration-200 p-2 sm:p-2.5 flex items-center justify-between gap-1.5 h-full cursor-pointer ${borderColor}`}
            style={{ borderLeftColor: borderColors[borderColor] || '#6366f1' }}
            onClick={onClick}
        >
            <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight mb-0.5 truncate">{title}</p>
                <p className="text-xs sm:text-base font-bold text-slate-800 whitespace-nowrap">{value}</p>
            </div>
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs sm:text-sm ${color} shrink-0`}>
                {icon}
            </div>
        </div>
    );
};

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        teacherName: '',
        stats: {
            classesToday: 0,
            attendanceRate: 0,
            totalStudents: 0,
            pendingRequisitions: 0,
            pendingGrievances: 0
        },
        schedule: [],
        pendingRequisitions: [],
        pendingGrievances: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setDashboardData(data);
                } else {
                    if (response.status === 401) {
                        setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
                    }
                }
            } else {
                if (response.status === 401) {
                    setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
                } else {
                    setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to fetch dashboard data' });
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to fetch dashboard data. Please check your connection.' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const { teacherName, stats, schedule: todaySchedule, pendingRequisitions, pendingGrievances = [] } = dashboardData;

    return (
        <div className="space-y-3 sm:space-y-6 pb-6 sm:pb-8">
            {/* Welcome Section - compact on mobile */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-3 sm:p-5 text-white shadow-md sm:shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight">Welcome Back, {teacherName || 'Teacher'}! 👋</h1>
                    <p className="mt-0.5 text-indigo-100 text-xs max-w-2xl">
                        You have <span className="font-semibold text-white">{stats.classesToday} classes</span> scheduled for today. Have a productive day!
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                        <button
                            onClick={() => navigate('/teacher/attendance')}
                            className="px-2.5 py-1 bg-white text-indigo-700 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            Mark Attendance
                        </button>
                        <button
                            onClick={() => navigate('/teacher/self-attendance')}
                            className="px-2.5 py-1 bg-indigo-900/60 text-white rounded-lg text-xs font-semibold border border-indigo-400/40 hover:bg-indigo-900 transition-all active:scale-95 cursor-pointer"
                        >
                            📍 Check In / Out
                        </button>
                        <button
                            onClick={() => navigate('/teacher/timetable')}
                            className="px-2.5 py-1 bg-indigo-700/40 text-white border border-white/20 rounded-lg text-xs font-semibold hover:bg-indigo-700/60 transition-all active:scale-95 cursor-pointer"
                        >
                            View Schedule
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
            </div>

            {/* Stats Grid - smaller cards on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard
                    title="Classes Today"
                    value={stats.classesToday}
                    icon="📚"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                    onClick={() => navigate('/teacher/timetable')}
                />
                <StatCard
                    title="Attendance Rate"
                    value={`${stats.attendanceRate}%`}
                    icon="✅"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                    onClick={() => navigate('/teacher/attendance')}
                />
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon="👥"
                    color="bg-purple-100 text-purple-600"
                    borderColor="border-purple-500"
                    onClick={() => navigate('/teacher/students')}
                />
                <StatCard
                    title="Requisitions"
                    value={stats.pendingRequisitions}
                    icon="📋"
                    color="bg-amber-100 text-amber-600"
                    borderColor="border-amber-500"
                    onClick={() => navigate('/teacher/requisition')}
                />
            </div>

            {/* Events and Notices Section */}
            <EventsNoticesSection />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Today's Schedule - compact items */}
                <Card title="Today's Schedule" subtitle="Your classes for today" variant="elevated">
                    {todaySchedule.length === 0 ? (
                        <p className="text-center text-gray-500 py-6 text-sm">No classes scheduled for today.</p>
                    ) : (
                        <div className="space-y-2">
                            {todaySchedule.map((schedule, index) => (
                                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                        <div className="text-center min-w-[60px] sm:min-w-[70px]">
                                            <p className="text-xs sm:text-sm font-bold text-slate-700">{schedule.time.split(' - ')[0]}</p>
                                            <p className="text-[10px] sm:text-xs text-slate-500">{schedule.time.split(' - ')[1]}</p>
                                        </div>
                                        <div className="h-6 w-px bg-slate-200"></div>
                                        <div className="flex-1">
                                            <p className="text-sm sm:text-base font-bold text-slate-800">{schedule.subject}</p>
                                            <p className="text-[10px] sm:text-xs text-slate-500">Class {schedule.class} • Room {schedule.room}</p>
                                        </div>
                                    </div>
                                    <Badge variant="info" size="sm">Upcoming</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Actions - smaller buttons */}
                <Card title="Quick Actions" variant="elevated">
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        <button
                            onClick={() => navigate('/teacher/attendance')}
                            className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group text-left"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform">
                                ✅
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Take Attendance</h4>
                                <p className="text-[10px] sm:text-xs text-slate-500">Mark attendance for your classes</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/teacher/requisition')}
                            className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-left"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform">
                                📋
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">New Requisition</h4>
                                <p className="text-[10px] sm:text-xs text-slate-500">Request supplies or equipment</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/teacher/self-attendance')}
                            className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all group text-left"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform">
                                📍
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Check In / Out</h4>
                                <p className="text-[10px] sm:text-xs text-slate-500">Mark your daily attendance</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/teacher/grievance')}
                            className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all group text-left"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform">
                                📝
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Submit Grievance</h4>
                                <p className="text-[10px] sm:text-xs text-slate-500">Report issues or concerns</p>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Pending Requisitions */}
                <Card title="Recent Requisitions" variant="elevated">
                    {pendingRequisitions.length === 0 ? (
                        <p className="text-center text-slate-400 py-6 text-sm italic">No recent requisitions</p>
                    ) : (
                        <div className="space-y-2">
                            {pendingRequisitions.map((req) => (
                                <div key={req.id} className="border border-slate-100 rounded-lg p-2 sm:p-3 hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{req.item}</h4>
                                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{req.description}</p>
                                            <div className="flex gap-1 mt-1">
                                                <Badge variant="info" size="sm">Qty: {req.quantity}</Badge>
                                                <Badge variant={req.urgency === 'High' ? 'danger' : req.urgency === 'Medium' ? 'warning' : 'default'} size="sm">
                                                    {req.urgency}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Badge variant="pending">{req.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Pending Grievances */}
                <Card title="Recent Grievances" variant="elevated">
                    {pendingGrievances.length === 0 ? (
                        <p className="text-center text-slate-400 py-6 text-sm italic">No recent grievances</p>
                    ) : (
                        <div className="space-y-2">
                            {pendingGrievances.map((grievance) => (
                                <div key={grievance.id} className="border border-slate-100 rounded-lg p-2 sm:p-3 hover:border-violet-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{grievance.subject}</h4>
                                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{grievance.description}</p>
                                            <div className="flex gap-1 mt-1">
                                                <Badge variant="info" size="sm">{grievance.category}</Badge>
                                                <Badge variant={grievance.priority === 'High' ? 'danger' : grievance.priority === 'Medium' ? 'warning' : 'default'} size="sm">
                                                    {grievance.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Badge variant="pending">{grievance.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default TeacherDashboard;