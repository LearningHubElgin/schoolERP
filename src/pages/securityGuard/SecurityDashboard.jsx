import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';

const StatCard = ({ title, value, icon, color, trend, borderColor, onClick }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-cyan-500': '#06b6d4',
        'border-indigo-500': '#6366f1',
        'border-emerald-500': '#10b981',
        'border-purple-500': '#a855f7',
        'border-orange-500': '#f97316',
        'border-red-500': '#ef4444',
        'border-amber-500': '#f59e0b',
    };

    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 ${onClick ? 'cursor-pointer' : 'cursor-default'} group h-full border-l-4 ${borderColor}`}
            style={{ borderLeftColor: borderColors[borderColor] || '#3b82f6' }}
            onClick={onClick}
        >
            <div className="flex items-center justify-between h-full gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-tight mb-1">{title}</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 whitespace-nowrap">{value}</p>
                    {trend && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-green-50 text-green-700 mt-2">
                            {trend}
                        </span>
                    )}
                </div>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl ${color} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const SecurityDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [stats, setStats] = useState({
        todayTotal: 0,
        pending: 0,
        checkedIn: 0,
        expected: 0
    });
    const [pendingVisitors, setPendingVisitors] = useState([]);
    const [recentCheckedIn, setRecentCheckedIn] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/visitors/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setStats(res.data.stats);
                setPendingVisitors(res.data.pendingVisitors);
                setRecentCheckedIn(res.data.recentCheckedIn);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load security dashboard data. Please check your connection.' });
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Syncing Command Center...</p>
                </div>
            </div>
        );
    }

    const userName = localStorage.getItem('userName') || 'Security Officer';

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">Welcome Back, {userName}! 👋</h1>
                    <p className="mt-2 text-indigo-100 text-sm md:text-lg max-w-2xl">
                        {stats.pending > 0 ? (
                            <>You have <span className="font-semibold text-white">{stats.pending} visitors awaiting approval</span> at the gate.</>
                        ) : (
                            <>The entry gate is clear. Monitoring visitor flow for the premises.</>
                        )}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:flex md:gap-4">
                        <button
                            onClick={() => navigate('/security/appointments')}
                            className="w-full md:w-auto px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                        >
                            Manage Approvals
                        </button>
                        <button
                            onClick={() => navigate('/security/visitors-log')}
                            className="w-full md:w-auto px-4 py-2 bg-indigo-700 bg-opacity-40 text-white border border-white/20 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-50 transition-all active:scale-95"
                        >
                            View All Logs
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard
                    title="Today's Total"
                    value={stats.todayTotal}
                    icon="👥"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                />
                <StatCard
                    title="Awaiting Approval"
                    value={stats.pending}
                    icon="⏳"
                    color="bg-amber-100 text-amber-600"
                    borderColor="border-amber-500"
                    onClick={() => navigate('/security/appointments')}
                />
                <StatCard
                    title="Currently Inside"
                    value={stats.checkedIn}
                    icon="🏢"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                    onClick={() => navigate('/security/visitors-log')}
                />
                <StatCard
                    title="Expected Today"
                    value={stats.expected}
                    icon="📅"
                    color="bg-purple-100 text-purple-600"
                    borderColor="border-purple-500"
                />
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Awaiting Approval */}
                <Card title="Awaiting Approval" subtitle={`Recent visitors waiting for entry`} variant="elevated" onClick={() => navigate('/security/appointments')} className="cursor-pointer">
                    <div className="space-y-3">
                        {pendingVisitors.length === 0 ? (
                            <p className="text-center text-slate-400 py-8 italic">No visitors awaiting approval</p>
                        ) : (
                            pendingVisitors.slice(0, 5).map((v) => (
                                <div key={v.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                                {v.visitor_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{v.visitor_name}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                                                    Host: {v.host_role}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="pending" size="sm">Awaiting</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Recent Check-ins */}
                <Card title="Recent Check-ins" subtitle={`Visitors currently on premises`} variant="elevated" onClick={() => navigate('/security/visitors-log')} className="cursor-pointer">
                    <div className="space-y-3">
                        {recentCheckedIn.length === 0 ? (
                            <p className="text-center text-slate-400 py-8 italic">No recent check-ins today</p>
                        ) : (
                            recentCheckedIn.slice(0, 5).map((v) => (
                                <div key={v.id} className="border border-slate-100 rounded-xl p-4 hover:border-emerald-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                                {v.visitor_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{v.visitor_name}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium italic">
                                                    Checked in: {v.visit_time}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="success" size="sm">Inside</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>


            {/* School Updates */}
            <EventsNoticesSection />
        </div>
    );
};

export default SecurityDashboard;
