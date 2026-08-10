import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const StatCard = ({ title, value, icon, color, trend }) => (
    <Card variant="elevated" className="hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 cursor-default group h-full">
        <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl ${color}`}>
                    {icon}
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

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState(null);
    
    // Passout state
    const [isPassedOut, setIsPassedOut] = useState(false);
    const [passedOutYear, setPassedOutYear] = useState(null);
    const [passedOutClass, setPassedOutClass] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/student/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Dashboard Data:', data);

            if (data.success) {
                setDashboardData(data);
                // Set passout state from response
                setIsPassedOut(data.isPassedOut || false);
                setPassedOutYear(data.passedOutYear);
                setPassedOutClass(data.passedOutClass);
                
                // Store in localStorage for sidebar filtering
                localStorage.setItem('isPassedOut', data.isPassedOut ? 'true' : 'false');
                localStorage.setItem('passedOutYear', data.passedOutYear || '');
                localStorage.setItem('passedOutClass', data.passedOutClass || '');
            } else {
                if (response.status === 401 || data.message?.toLowerCase().includes('token')) {
                    setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
                } else if (data.message === 'Student not found') {
                    setGlobalError?.({ type: 'NOT_FOUND', message: 'Student record not found. Please contact the administrator.' });
                } else {
                    setError(data.message || 'Failed to fetch dashboard data');
                }
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            const errMsg = 'Failed to fetch dashboard data. Please check your connection.';
            setGlobalError?.({ type: 'LOAD_ERROR', message: errMsg });
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Don't render if student not found (error already shown in Layout)
    if (!dashboardData && error) {
        return null;
    }

    const { studentName, stats, announcements, subjects, events, notices } = dashboardData || {};

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            
            {/* ========== PASSOUT BANNER ========== */}
            {isPassedOut && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-6 text-white shadow-xl animate-pulse">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🎓</div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold">Congratulations! You've Passed Out!</h2>
                                <p className="text-purple-100 text-sm mt-1">
                                    You successfully completed Class {passedOutClass} in the year {passedOutYear}.
                                    Your academic records are archived below for future reference.
                                </p>
                            </div>
                        </div>
                        <Badge variant="success" className="bg-white/20 text-white border border-white/30 px-4 py-2">
                            Passout Batch {passedOutYear}
                        </Badge>
                    </div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-20 -mb-20 w-60 h-60 rounded-full bg-pink-400 opacity-20 blur-3xl"></div>
                </div>
            )}
            {/* ========== END PASSOUT BANNER ========== */}

            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">Welcome Back, {studentName}! 👋</h1>
                    <p className="mt-2 text-indigo-100 text-sm md:text-lg max-w-2xl">
                        {isPassedOut ? (
                            <>🎓 Congratulations on your graduation! Your journey with us has been remarkable.</>
                        ) : stats?.upcomingEvents > 0 ? (
                            <>You have <span className="font-semibold text-white">{stats.upcomingEvents} upcoming events</span>. Stay focused!</>
                        ) : (
                            <>Stay focused and keep up the great work!</>
                        )}
                    </p>
                    {!isPassedOut && (
                        <div className="mt-4 grid grid-cols-2 gap-3 md:flex md:gap-4">
                            <button
                                onClick={() => navigate('/student/attendance')}
                                className="w-full md:w-auto px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                            >
                                View Attendance
                            </button>
                            <button
                                onClick={() => navigate('/student/timetable')}
                                className="w-full md:w-auto px-4 py-2 bg-indigo-700 bg-opacity-40 text-white border border-white/20 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-50 transition-all active:scale-95"
                            >
                                View Schedule
                            </button>
                        </div>
                    )}
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid - For passout students, show only archive-related stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                {!isPassedOut && !stats?.isHigherSecondary && (
                    <StatCard
                        title="Day Attendance"
                        value={`${stats?.attendancePercentage || 0}%`}
                        icon="📊"
                        color="bg-emerald-100 text-emerald-600"
                        trend={stats?.totalAttendanceDays > 0 ? `${stats.presentDays}/${stats.totalAttendanceDays} days` : undefined}
                    />
                )}
                {!isPassedOut && stats?.isHigherSecondary && (
                    <StatCard
                        title="Overall Attendance"
                        value={`${stats?.attendancePercentage || 0}%`}
                        icon="📊"
                        color="bg-emerald-100 text-emerald-600"
                        trend={stats?.totalAttendanceDays > 0 ? `${stats.presentDays}/${stats.totalAttendanceDays} classes` : undefined}
                    />
                )}
                <StatCard
                    title="Total Dues"
                    value={`₹${parseFloat(stats?.totalPendingAmount || stats?.pendingFees || 0).toLocaleString('en-IN')}`}
                    icon="💰"
                    color="bg-amber-100 text-amber-600"
                />
                <StatCard
                    title="Grievances"
                    value={stats?.submittedGrievances || 0}
                    icon="📝"
                    color="bg-violet-100 text-violet-600"
                />
                <StatCard
                    title="Class Strength"
                    value={stats?.totalStudentsInClass || 0}
                    icon="👥"
                    color="bg-pink-100 text-pink-600"
                />
                {isPassedOut && (
                    <StatCard
                        title="Passout Year"
                        value={passedOutYear || '-'}
                        icon="🎓"
                        color="bg-purple-100 text-purple-600"
                    />
                )}
            </div>

            {/* Subject-wise Attendance for Class 11/12 - Hide for passout */}
            {!isPassedOut && stats?.isHigherSecondary && stats?.subjectAttendance && stats.subjectAttendance.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">📊</span> Subject-wise Attendance
                    </h2>
                    <Card variant="elevated">
                        <div className="space-y-4">
                            {stats.subjectAttendance.map((subj, index) => {
                                const pct = subj.percentage;
                                const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                                const bgColor = pct >= 75 ? 'bg-emerald-50' : pct >= 50 ? 'bg-amber-50' : 'bg-red-50';
                                const textColor = pct >= 75 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-700' : 'text-red-700';
                                return (
                                    <div key={index} className={`p-3 rounded-xl ${bgColor} border border-gray-100`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-gray-800">{subj.subject}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{subj.present}/{subj.total} classes</span>
                                                <span className={`font-bold text-lg ${textColor}`}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${barColor} transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Events and Notices Grid - Show for all students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Upcoming Events Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">🎉</span> Upcoming Events
                    </h2>
                    <Card variant="elevated" className="h-fit">
                        {events && events.length > 0 ? (
                            <div className="space-y-3">
                                {events.map((event, index) => (
                                    <div
                                        key={event.id || index}
                                        className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg">
                                            <span className="text-xs font-medium opacity-90">
                                                {event.date.split(' ')[1]}
                                            </span>
                                            <span className="text-lg font-bold leading-tight">
                                                {event.date.split(' ')[0]}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-gray-800 truncate">{event.title}</h3>
                                                <Badge
                                                    variant={event.priority === 'High' ? 'destructive' : event.priority === 'Medium' ? 'warning' : 'default'}
                                                    className="flex-shrink-0 text-xs"
                                                >
                                                    {event.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <span className="text-4xl mb-2 block">📅</span>
                                <p className="text-gray-500">No upcoming events at the moment.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Notices Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">📌</span> Notices
                    </h2>
                    <Card variant="elevated" className="h-fit">
                        {notices && notices.length > 0 ? (
                            <div className="space-y-3">
                                {notices.map((notice, index) => (
                                    <div
                                        key={notice.id || index}
                                        className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-800 truncate flex-1">{notice.title}</h3>
                                            <Badge
                                                variant={notice.priority === 'High' ? 'destructive' : notice.priority === 'Medium' ? 'warning' : 'default'}
                                                className="flex-shrink-0 text-xs"
                                            >
                                                {notice.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{notice.description}</p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <span>📆</span>
                                            <span>{notice.date}</span>
                                        </div>
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

            {/* My Subjects Section - Show for all students */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📚</span> My Subjects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects && subjects.length > 0 ? (
                        subjects.map((subject, index) => (
                            <Card key={index} variant="elevated" className="hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                        {subject.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono">{subject.code}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No subjects assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions - Hide for passout students (they cannot submit new actions) */}
            {!isPassedOut && (
                <div className="md:col-span-3">
                    <Card title="Quick Actions" variant="elevated" className="h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => navigate('/student/attendance')}
                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    📅
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">View Attendance</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Check your daily records</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/student/grievance')}
                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all duration-300 group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    📝
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Submit Grievance</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Report an issue</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/student/profile')}
                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    👤
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">View Profile</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Personal details</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/student/fees')}
                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all duration-300 group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    💳
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Pay Fees</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Clear pending dues</p>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;