import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const StatCard = ({ title, value, icon, color, borderColor, onClick }) => {
    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full border-l-4 ${borderColor}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between h-full gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 leading-tight mb-1">{title}</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 whitespace-nowrap">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

// Local cache to persist dashboard metrics for instant loading
let cachedStats = null;
let cachedRecentSchools = [];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(cachedStats || {
        totalSchools: 0,
        activeSchools: 0,
        totalStudents: 0,
        totalTeachers: 0,
        activeUsers: 0,
        plansDistribution: []
    });
    const [recentSchools, setRecentSchools] = useState(cachedRecentSchools);
    const [loading, setLoading] = useState(!cachedStats);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!cachedStats) {
                setLoading(true);
            }
            try {
                const token = localStorage.getItem('token');
                
                // Fetch stats
                const statsRes = await axios.get(`${API_URL}/api/superadmin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                    cachedStats = statsRes.data.stats;
                }

                // Fetch recent schools (slice first 5)
                const schoolsRes = await axios.get(`${API_URL}/api/superadmin/schools`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (schoolsRes.data.success) {
                    const slicedSchools = schoolsRes.data.schools.slice(0, 5);
                    setRecentSchools(slicedSchools);
                    cachedRecentSchools = slicedSchools;
                }

            } catch (error) {
                console.error('Error fetching super admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin text-indigo-600 mb-4 mx-auto w-12 h-12 border-4 border-indigo-600/20 border-b-indigo-600 rounded-full"></div>
                    <p className="text-slate-500 font-medium">Loading metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800">Super Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Global branch directory, diagnostic monitoring, and license provisions.</p>
                </div>
                <div className="flex gap-2.5">
                    <button
                        onClick={() => navigate('/superadmin/reports')}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        📈 Reports & Logs
                    </button>
                    <button
                        onClick={() => navigate('/superadmin/add-school')}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                    >
                        ➕ Create School Branch
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Schools"
                    value={stats.totalSchools}
                    icon="🏫"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                    onClick={() => navigate('/superadmin/view-schools')}
                />
                <StatCard
                    title="Active Branches"
                    value={stats.activeSchools}
                    icon="🟢"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                    onClick={() => navigate('/superadmin/view-schools')}
                />
                <StatCard
                    title="System Students"
                    value={stats.totalStudents}
                    icon="🎓"
                    color="bg-indigo-100 text-indigo-600"
                    borderColor="border-indigo-500"
                />
                <StatCard
                    title="System Teachers"
                    value={stats.totalTeachers}
                    icon="👨‍🏫"
                    color="bg-teal-100 text-teal-600"
                    borderColor="border-teal-500"
                />
            </div>

            {/* Secondary Row: License breakdown & Recent Additions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* License and Tier Breakdown */}
                <Card title="License Provision Tiers" subtitle="Branch Distribution" variant="elevated" className="lg:col-span-1">
                    <div className="space-y-3">
                        {stats.plansDistribution.map((tier) => {
                            const colors = {
                                premium: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
                                basic: 'bg-teal-50 text-teal-600 border border-teal-100',
                                standard: 'bg-blue-50 text-blue-600 border border-blue-100',
                                free: 'bg-slate-50 text-slate-600 border border-slate-200'
                            };
                            const tierName = (tier.subscription_plan || 'basic').toLowerCase();
                            return (
                                <div key={tier.subscription_plan} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colors[tierName] || 'bg-slate-100 text-slate-600'}`}>
                                        {tier.subscription_plan}
                                    </span>
                                    <span className="text-base font-bold text-slate-800">{tier.count} school{tier.count > 1 ? 's' : ''}</span>
                                </div>
                            );
                        })}
                        {stats.plansDistribution.length === 0 && (
                            <div className="text-center py-6 text-slate-400 italic text-sm">No plans provisioned yet.</div>
                        )}
                    </div>
                </Card>

                {/* Recent Schools Table/Card */}
                <Card title="Recent Branch Additions" subtitle="Latest Registrations" variant="elevated" className="lg:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-xs font-semibold text-slate-500">Branch Code</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500">School Name</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500">Board</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 text-center">Teachers</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 text-center">Students</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentSchools.map((school) => (
                                    <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-sm font-semibold text-slate-800">{school.code}</td>
                                        <td className="py-3 text-sm font-medium text-slate-700">{school.name}</td>
                                        <td className="py-3 text-sm font-medium text-slate-500">{school.board || 'N/A'}</td>
                                        <td className="py-3 text-sm font-semibold text-slate-600 text-center">
                                            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-xs">
                                                👨‍🏫 {school.teacher_count || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm font-semibold text-slate-600 text-center">
                                            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-xs">
                                                🎓 {school.student_count || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                school.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                    : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {school.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentSchools.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-slate-400 italic text-sm">No school branches registered.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
