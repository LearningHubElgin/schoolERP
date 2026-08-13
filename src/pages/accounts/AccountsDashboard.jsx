import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';

const AVATAR_COLORS = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-teal-100 text-teal-700 border-teal-200'
];

const getAvatarStyle = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatSectionName = (name) => {
    if (!name) return '';
    const clean = String(name).replace(/^section\s+/i, '').trim();
    return `Section ${clean}`;
};

const AccountsDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingFees: 0,
        collectedThisMonth: 0,
        totalStudents: 0,
        pendingStudents: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            const [statsRes, transactionsRes, revenueRes] = await Promise.all([
                axios.get(`${API_URL}/api/accounts/dashboard/stats`, config),
                axios.get(`${API_URL}/api/accounts/dashboard/recent-transactions?limit=8`, config),
                axios.get(`${API_URL}/api/accounts/dashboard/monthly-revenue`, config)
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }

            if (transactionsRes.data.success) {
                setRecentTransactions(transactionsRes.data.transactions);
            }

            if (revenueRes.data.success) {
                setMonthlyRevenue(revenueRes.data.monthlyData);
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (error.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load accounts dashboard data. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const columns = [
        {
            header: 'Student',
            accessor: 'student_name',
            render: (row) => {
                const initial = (row.student_name || 'S').charAt(0).toUpperCase();
                const avatarStyle = getAvatarStyle(row.student_name);

                return (
                    <div className="flex items-center gap-2.5 py-0.5">
                        <div className={`w-7 h-7 rounded-lg ${avatarStyle} border font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                            {initial}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 text-xs leading-snug">{row.student_name}</div>
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 flex-wrap">
                                <span>{row.class_name || `Class ${row.class}`}</span>
                                <span>•</span>
                                <span>{formatSectionName(row.section_name || row.section)}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-400 font-semibold">#{row.roll_no}</span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Total Fee',
            accessor: 'total_amount',
            render: (row) => (
                <span className="font-extrabold text-slate-900 text-xs">
                    ₹{parseFloat(row.total_amount || 0).toLocaleString('en-IN')}
                </span>
            )
        },
        {
            header: 'Paid',
            accessor: 'paid_amount',
            render: (row) => {
                const paidVal = parseFloat(row.paid_amount || 0);
                return (
                    <span className={`font-extrabold text-xs ${paidVal > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                        ₹{paidVal.toLocaleString('en-IN')}
                    </span>
                );
            }
        },
        {
            header: 'Pending',
            accessor: 'pending_amount',
            render: (row) => {
                const pendingVal = parseFloat(row.pending_amount || 0);
                return (
                    <span className={`font-extrabold text-xs ${pendingVal > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                        ₹{pendingVal.toLocaleString('en-IN')}
                    </span>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const isPaid = row.status === 'paid' || (parseFloat(row.pending_amount || 0) <= 0 && parseFloat(row.paid_amount || 0) > 0);

                return isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-semibold border border-emerald-100 shadow-2xs">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        Paid
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-semibold border border-rose-100 shadow-2xs">
                        <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                        Pending
                    </span>
                );
            }
        }
    ];

    const actions = (row) => (
        <button
            onClick={() => navigate('/accounts/fees')}
            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50/60 border border-emerald-300 rounded-lg hover:bg-emerald-100/70 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
        >
            Collect
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="text-center">
                    <div className="text-3xl mb-3 animate-bounce">⏳</div>
                    <p className="text-xs font-semibold text-slate-500">Loading accounts dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3.5">
            {/* Header Title */}
            <div className="flex flex-row items-center justify-between gap-2">
                <div>
                    <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">Accounts Dashboard</h1>
                    <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">Financial overview and fee management</p>
                </div>
                <button
                    onClick={() => navigate('/accounts/fees')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
                >
                    <span>💰</span> <span className="hidden xs:inline">Fee Collect</span><span className="xs:hidden">Collect</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                <Card className="!bg-emerald-50/60 !border-emerald-200/80 hover:!border-emerald-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Total Revenue</p>
                            <p className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-0.5 sm:mt-1">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-emerald-600/80 font-medium mt-0.5">All time collections</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">💰</div>
                    </div>
                </Card>

                <Card className="!bg-rose-50/60 !border-rose-200/80 hover:!border-rose-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">Total Expenses</p>
                            <p className="text-lg sm:text-xl font-extrabold text-rose-600 mt-0.5 sm:mt-1">
                                {formatCurrency(stats.totalExpenses || 0)}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-rose-600/80 font-medium mt-0.5">Operational costs</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-100 border border-rose-300 text-rose-700 font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">💸</div>
                    </div>
                </Card>

                <Card className="!bg-indigo-50/60 !border-indigo-200/80 hover:!border-indigo-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-extrabold text-indigo-800 uppercase tracking-wider">Net Balance</p>
                            <p className={`text-lg sm:text-xl font-extrabold mt-0.5 sm:mt-1 ${stats.netBalance < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                                {formatCurrency(stats.netBalance || stats.totalRevenue)}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-indigo-600/80 font-medium mt-0.5">Revenue − Expenses</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-700 font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">⚖️</div>
                    </div>
                </Card>

                <Card className="!bg-amber-50/60 !border-amber-200/80 hover:!border-amber-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">Pending Fees</p>
                            <p className="text-lg sm:text-xl font-extrabold text-amber-600 mt-0.5 sm:mt-1">
                                {formatCurrency(stats.pendingFees)}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-amber-600/80 font-medium mt-0.5">Uncollected amount</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-100 border border-amber-300 text-amber-700 font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">⚠️</div>
                    </div>
                </Card>

                <Card className="col-span-2 lg:col-span-1 !bg-blue-50/60 !border-blue-200/80 hover:!border-blue-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-extrabold text-blue-800 uppercase tracking-wider">This Month</p>
                            <p className="text-lg sm:text-xl font-extrabold text-blue-600 mt-0.5 sm:mt-1">
                                {formatCurrency(stats.collectedThisMonth)}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-blue-600/80 font-medium mt-0.5">Current month total</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-100 border border-blue-300 text-blue-700 font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">📈</div>
                    </div>
                </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                <Card className="!bg-slate-50/80 !border-slate-200/90 shadow-2xs px-2 py-2">
                    <div className="text-center py-0.5">
                        <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-700 uppercase tracking-wider truncate">Students</p>
                        <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalStudents}</p>
                        <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium truncate">With records</p>
                    </div>
                </Card>

                <Card className="!bg-emerald-50/40 !border-emerald-200/70 shadow-2xs px-2 py-2">
                    <div className="text-center py-0.5">
                        <p className="text-[9px] sm:text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider truncate">Collection</p>
                        <p className="text-base sm:text-xl font-extrabold text-emerald-600 mt-0.5">
                            {stats.totalRevenue > 0
                                ? ((stats.totalRevenue / (stats.totalRevenue + stats.pendingFees)) * 100).toFixed(1)
                                : 0}%
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-emerald-600/80 font-medium truncate">Success rate</p>
                    </div>
                </Card>

                <Card className="!bg-blue-50/40 !border-blue-200/70 shadow-2xs px-2 py-2">
                    <div className="text-center py-0.5">
                        <p className="text-[9px] sm:text-[11px] font-extrabold text-blue-800 uppercase tracking-wider truncate">Average Fee</p>
                        <p className="text-base sm:text-xl font-extrabold text-blue-600 mt-0.5">
                            {stats.totalStudents > 0
                                ? formatCurrency((stats.totalRevenue + stats.pendingFees) / stats.totalStudents)
                                : '₹0'}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-blue-600/80 font-medium truncate">Per student</p>
                    </div>
                </Card>
            </div>

            {/* Events and Notices Section */}
            <EventsNoticesSection />

            {/* Monthly Revenue Chart */}
            <Card title="Revenue Overview" subtitle="Last 6 months collection trends" variant="elevated">
                {monthlyRevenue.length > 0 ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                            {monthlyRevenue.map((month, index) => (
                                <div
                                    key={index}
                                    className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center"
                                >
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">
                                        {month.month_name}
                                    </p>
                                    <p className="text-sm font-extrabold text-indigo-700 mt-1">
                                        {formatCurrency(month.revenue)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Bar Chart Visualization */}
                        <div className="mt-4 pt-2 border-t border-slate-100">
                            <div className="flex items-end justify-between gap-2 h-40">
                                {monthlyRevenue.map((month, index) => {
                                    const maxRevenue = Math.max(...monthlyRevenue.map(m => parseFloat(m.revenue)));
                                    const height = maxRevenue > 0
                                        ? (parseFloat(month.revenue) / maxRevenue) * 100
                                        : 0;

                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                                                <div
                                                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-700 hover:to-indigo-500 cursor-pointer shadow-2xs"
                                                    style={{ height: `${Math.max( height, 6)}%` }}
                                                    title={`${month.month_name}: ${formatCurrency(month.revenue)}`}
                                                />
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-500 mt-1.5 truncate max-w-[60px]">
                                                {month.month_name.split(' ')[0]}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-44 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-xs font-semibold text-slate-600">No revenue data available</p>
                            <p className="text-[10px] text-slate-400 mt-1">Start collecting payments to see trends</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Recent Fee Transactions */}
            <Card title="Recent Fee Transactions" subtitle="Latest student fee records & payments" variant="elevated">
                <Table
                    columns={columns}
                    data={recentTransactions}
                    actions={actions}
                    isLoading={false}
                    compact={true}
                    headerBg="bg-slate-100/90 text-slate-700 font-extrabold"
                />
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions" variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        className="p-4 border border-emerald-200 bg-emerald-50/40 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group shadow-2xs cursor-pointer"
                        onClick={() => navigate('/accounts/fees')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">💰</div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Fee Collection</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Collect student fees & view monthwise breakdowns</p>
                            </div>
                        </div>
                    </button>

                    <button
                        className="p-4 border border-indigo-200 bg-indigo-50/40 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left group shadow-2xs cursor-pointer"
                        onClick={() => navigate('/accounts/reports')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">📊</div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Financial Reports</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Download financial statements and analytics</p>
                            </div>
                        </div>
                    </button>

                    <button
                        className="p-4 border border-purple-200 bg-purple-50/40 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all text-left group shadow-2xs cursor-pointer"
                        onClick={() => navigate('/accounts/expenses')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold text-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">💸</div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Expense Tracker</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Log operational costs and school expenses</p>
                            </div>
                        </div>
                    </button>
                </div>
            </Card>

        </div>
    );
};

export default AccountsDashboard;