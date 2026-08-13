import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';

const AdmissionDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};

    // State for stats and applications
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingReview: 0,
        admittedToday: 0,
        rejectedThisWeek: 0,
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const schoolId = localStorage.getItem('schoolId');
            const queryParam = schoolId ? `?school_id=${schoolId}` : '';

            // Fetch stats
            const statsUrl = `${API_URL}/api/admission/dashboard${queryParam}`;
            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();

            if (statsData.success) {
                setStats(statsData.stats);
            }

            // Fetch recent applications
            const appsUrl = `${API_URL}/api/admission/recent-applications${queryParam}`;
            const appsResponse = await fetch(appsUrl);
            const appsData = await appsResponse.json();

            if (appsData.success) {
                setRecentApplications(appsData.applications);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load admission dashboard data. Please check your connection.' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || '';
        switch (statusLower) {
            case 'pending':
                return 'warning';
            case 'admitted':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'info';
        }
    };

    const columns = [
        {
            header: 'App No',
            render: (row) => (
                <span className="font-bold text-slate-700 text-xs">#{row.application_no}</span>
            )
        },
        {
            header: 'Student Name',
            render: (row) => (
                <div>
                    <span className="font-bold text-slate-900 text-xs block">{row.student_name}</span>
                    {row.phone && <span className="text-[10px] text-slate-400 block">{row.phone}</span>}
                </div>
            )
        },
        {
            header: 'Class',
            render: (row) => (
                <span className="text-xs font-semibold text-slate-700">Class {row.class}</span>
            )
        },
        {
            header: 'Date Applied',
            render: (row) => (
                <div>
                    <span className="text-xs font-medium text-slate-700 block">{new Date(row.applied_date).toLocaleDateString()}</span>
                    <span className="text-[10px] text-slate-400 block">
                        {row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <Badge variant={getStatusBadge(row.status)} size="sm">
                    {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending'}
                </Badge>
            )
        },
        {
            header: 'Action',
            render: (row) => (
                <button
                    onClick={() => navigate(`/admission/applications/${row.id}`)}
                    className="px-2 py-1 sm:px-2.5 sm:py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                    View Details
                </button>
            )
        }
    ];

    return (
        <div className="space-y-2.5 sm:space-y-3.5 pb-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-2.5 sm:p-5 text-white shadow-md sm:shadow-lg flex flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="relative z-10">
                    <h1 className="text-xs sm:text-xl font-bold tracking-tight flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-xl">🎓</span> Admission Dashboard
                    </h1>
                    <p className="mt-0.5 text-blue-100 text-[9px] sm:text-xs font-medium hidden xs:block">
                        Manage student applications, admissions, and enrollment processes
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admission/new-application')}
                    className="px-2 py-1 sm:px-4 sm:py-2 bg-white text-indigo-700 hover:bg-blue-50 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer border border-white/40"
                >
                    <span>➕</span> <span className="hidden xs:inline">New Application</span><span className="xs:hidden">New App</span>
                </button>
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Card className="!p-0 !bg-gradient-to-r !from-indigo-50/90 !via-indigo-50/40 !to-white !border-indigo-200/90 !border-l-[4px] !border-l-indigo-600 hover:!border-indigo-400 transition-all shadow-2xs">
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-indigo-950 tracking-tight leading-tight">Total Applications</p>
                            <p className="text-lg sm:text-2xl font-bold text-indigo-700 mt-1 leading-none">
                                {stats.totalApplications}
                            </p>
                            <p className="text-[10px] sm:text-xs text-indigo-700/80 font-medium mt-1">All time submissions</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-100/90 border border-indigo-300 text-indigo-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">📋</div>
                    </div>
                </Card>

                <Card className="!p-0 !bg-gradient-to-r !from-amber-50/90 !via-amber-50/40 !to-white !border-amber-200/90 !border-l-[4px] !border-l-amber-500 hover:!border-amber-400 transition-all shadow-2xs">
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-amber-950 tracking-tight leading-tight">Pending Review</p>
                            <p className="text-lg sm:text-2xl font-bold text-amber-700 mt-1 leading-none">
                                {stats.pendingReview}
                            </p>
                            <p className="text-[10px] sm:text-xs text-amber-700/80 font-medium mt-1">
                                {stats.pendingReview > 0 ? "Needs Action" : "All Clear"}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100/90 border border-amber-300 text-amber-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">⏳</div>
                    </div>
                </Card>

                <Card className="!p-0 !bg-gradient-to-r !from-emerald-50/90 !via-emerald-50/40 !to-white !border-emerald-200/90 !border-l-[4px] !border-l-emerald-600 hover:!border-emerald-400 transition-all shadow-2xs">
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-emerald-950 tracking-tight leading-tight">Admitted Today</p>
                            <p className="text-lg sm:text-2xl font-bold text-emerald-700 mt-1 leading-none">
                                {stats.admittedToday}
                            </p>
                            <p className="text-[10px] sm:text-xs text-emerald-700/80 font-medium mt-1">Today's admissions</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">🎉</div>
                    </div>
                </Card>

                <Card className="!p-0 !bg-gradient-to-r !from-rose-50/90 !via-rose-50/40 !to-white !border-rose-200/90 !border-l-[4px] !border-l-rose-500 hover:!border-rose-400 transition-all shadow-2xs">
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-rose-950 tracking-tight leading-tight">Rejected (Week)</p>
                            <p className="text-lg sm:text-2xl font-bold text-rose-700 mt-1 leading-none">
                                {stats.rejectedThisWeek}
                            </p>
                            <p className="text-[10px] sm:text-xs text-rose-700/80 font-medium mt-1">This week total</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-100/90 border border-rose-300 text-rose-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">❌</div>
                    </div>
                </Card>
            </div>

            {/* Events and Notices Section */}
            <EventsNoticesSection />

            {/* Quick Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                    onClick={() => navigate('/admission/new-application')}
                    className="p-2 sm:p-3.5 bg-gradient-to-r from-indigo-50/70 to-white rounded-xl shadow-2xs border border-indigo-200/90 border-l-[4px] border-l-indigo-600 hover:border-indigo-400 transition-all group text-left cursor-pointer"
                >
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-indigo-100/90 border border-indigo-300 rounded-lg flex items-center justify-center text-xs sm:text-lg mb-1.5 sm:mb-2 group-hover:scale-105 transition-transform">
                        ➕
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        <span className="hidden sm:inline">New Application</span>
                        <span className="sm:hidden">New App</span>
                    </h4>
                    <p className="text-slate-600 text-[10px] sm:text-xs mt-0.5 font-medium line-clamp-2">Start a new student enrollment process</p>
                </button>
                <button
                    onClick={() => navigate('/admission/applications')}
                    className="p-2 sm:p-3.5 bg-gradient-to-r from-emerald-50/70 to-white rounded-xl shadow-2xs border border-emerald-200/90 border-l-[4px] border-l-emerald-600 hover:border-emerald-400 transition-all group text-left cursor-pointer"
                >
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-emerald-100/90 border border-emerald-300 rounded-lg flex items-center justify-center text-xs sm:text-lg mb-1.5 sm:mb-2 group-hover:scale-105 transition-transform">
                        📂
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        <span className="hidden sm:inline">All Applications</span>
                        <span className="sm:hidden">All Apps</span>
                    </h4>
                    <p className="text-slate-600 text-[10px] sm:text-xs mt-0.5 font-medium line-clamp-2">View and manage all received applications</p>
                </button>
                <button
                    onClick={() => navigate('/admission/reports')}
                    className="p-2 sm:p-3.5 bg-gradient-to-r from-amber-50/70 to-white rounded-xl shadow-2xs border border-amber-200/90 border-l-[4px] border-l-amber-500 hover:border-amber-400 transition-all group text-left cursor-pointer"
                >
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-amber-100/90 border border-amber-300 rounded-lg flex items-center justify-center text-xs sm:text-lg mb-1.5 sm:mb-2 group-hover:scale-105 transition-transform">
                        📊
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Admission Reports</span>
                        <span className="sm:hidden">Reports</span>
                    </h4>
                    <p className="text-slate-600 text-[10px] sm:text-xs mt-0.5 font-medium line-clamp-2">Analyze admission trends and statistics</p>
                </button>
            </div>

            {/* Recent Applications Table */}
            <Card title="Recent Applications" subtitle="Latest student applications received" variant="elevated">
                <Table
                    columns={columns}
                    data={recentApplications}
                    isLoading={loading}
                    compact={true}
                    headerBg="bg-slate-100/90 text-slate-700 font-extrabold"
                    emptyMessage="No recent applications found."
                />
            </Card>
        </div>
    );
};

export default AdmissionDashboard;