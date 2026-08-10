import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
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
            // Get school_id from localStorage (set during login as 'schoolId')
            const schoolId = localStorage.getItem('schoolId');
            console.log('🔍 schoolId from localStorage:', schoolId);

            const queryParam = schoolId ? `?school_id=${schoolId}` : '';
            console.log('🔍 Query param to send:', queryParam);

            // Fetch stats
            const statsUrl = `${API_URL}/api/admission/dashboard${queryParam}`;
            console.log('🔍 Fetching stats from:', statsUrl);

            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();

            if (statsData.success) {
                setStats(statsData.stats);
            }

            // Fetch recent applications
            const appsUrl = `${API_URL}/api/admission/recent-applications${queryParam}`;
            console.log('🔍 Fetching apps from:', appsUrl);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Helper Stat Card
    const StatCard = ({ title, value, icon, color, subValue }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${color}-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
            <div className={`p-4 bg-${color}-50 rounded-full text-${color}-600 mb-3`}>
                {icon}
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            {subValue && <p className={`text-xs mt-1 font-medium text-${color}-600`}>{subValue}</p>}
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-4 md:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Admission Portal 🎓</h1>
                        <p className="mt-2 text-cyan-100 text-sm md:text-lg">
                            Manage student applications, admissions, and enrollment processes.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
                            onClick={() => navigate('/admission/new-application')}
                        >
                            + New Application
                        </Button>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Global Error is handled by Layout context overlay */}


            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={<span className="text-2xl">📋</span>}
                    color="blue"
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pendingReview}
                    icon={<span className="text-2xl">⏳</span>}
                    color="orange"
                    subValue={stats.pendingReview > 0 ? "Needs Action" : "All Clear"}
                />
                <StatCard
                    title="Admitted Today"
                    value={stats.admittedToday}
                    icon={<span className="text-2xl">🎉</span>}
                    color="green"
                />
                <StatCard
                    title="Rejected (Week)"
                    value={stats.rejectedThisWeek}
                    icon={<span className="text-2xl">❌</span>}
                    color="red"
                />
            </div>

            {/* Events and Notices Section */}
            <EventsNoticesSection />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <button
                    onClick={() => navigate('/admission/new-application')}
                    className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        ➕
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">New Application</h4>
                    <p className="text-slate-500 text-sm mt-1">Start a new student enrollment process</p>
                </button>
                <button
                    onClick={() => navigate('/admission/applications')}
                    className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        📂
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">All Applications</h4>
                    <p className="text-slate-500 text-sm mt-1">View and manage all received applications</p>
                </button>
                <button
                    onClick={() => navigate('/admission/reports')}
                    className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        📊
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">Reports</h4>
                    <p className="text-slate-500 text-sm mt-1">Analyze admission trends and statistics</p>
                </button>
            </div>

            {/* Recent Applications */}
            <Card title="Recent Applications" subtitle="Latest student applications received" variant="elevated" className="p-0 overflow-hidden border border-slate-200 shadow-md">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">App No</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Applied</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {recentApplications.length > 0 ? (
                                recentApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">#{app.application_no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-slate-800">{app.student_name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            Class {app.class}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div>{new Date(app.applied_date).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400">
                                                {app.created_at ? new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={getStatusBadge(app.status)}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => navigate(`/admission/applications/${app.id}`)}
                                                className="hover:border-blue-300 hover:text-blue-600"
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No recent applications found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {recentApplications.length > 0 ? (
                        recentApplications.map((app) => (
                            <div
                                key={app.id}
                                className="p-4 bg-white active:bg-slate-50 transition-colors"
                                onClick={() => navigate(`/admission/applications/${app.id}`)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-slate-400">APP #{app.application_no}</span>
                                    <Badge variant={getStatusBadge(app.status)} size="sm">
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </Badge>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg mb-1">{app.student_name}</h4>
                                <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
                                    <span>Class {app.class}</span>
                                    <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full mt-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admission/applications/${app.id}`);
                                    }}
                                >
                                    View Application
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            No applications available
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdmissionDashboard;