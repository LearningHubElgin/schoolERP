import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Sector,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#f97316'];
const SHADOW_COLORS = ['#4338ca', '#0f766e', '#b45309', '#6d28d9', '#047857', '#b91c1c', '#1d4ed8', '#c2410c'];

const FILTER_MODES = [
    { key: 'day', label: 'Today', icon: '📅' },
    { key: 'weekly', label: 'This Week', icon: '📆' },
    { key: 'monthly', label: 'This Month', icon: '🗓️' },
    { key: 'yearly', label: 'This Year', icon: '📊' },
    { key: 'total', label: 'All Time', icon: '🌐' },
];

// Helper: format date to YYYY-MM-DD
const fmt = (d) => d.toISOString().split('T')[0];

const AccountsAnalytics = () => {
    const n = (val) => Number(val) || 0;
    const [loading, setLoading] = useState(false);
    const [filterMode, setFilterMode] = useState('day');
    const [trendData, setTrendData] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [totals, setTotals] = useState({ revenue: 0, expenses: 0, profit: 0, gst: 0, gstPaid: 0 });
    const [activePieIndex, setActivePieIndex] = useState(0);
    const [dateRangeLabel, setDateRangeLabel] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [filterMode]);

    // Compute date ranges based on filter mode
    const getDateRanges = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filterMode) {
            case 'day': {
                // Show hourly-like breakdown: compare today with past 6 days
                const ranges = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday'
                        : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
                    ranges.push({ label, start: fmt(d), end: fmt(d) });
                }
                return { ranges, periodLabel: 'Last 7 Days' };
            }
            case 'weekly': {
                // Show this week + past 3 weeks (4 weeks total)
                const ranges = [];
                for (let i = 3; i >= 0; i--) {
                    const weekStart = new Date(today);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    const label = i === 0 ? 'This Week'
                        : `${weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
                    ranges.push({ label, start: fmt(weekStart), end: fmt(weekEnd) });
                }
                return { ranges, periodLabel: 'Last 4 Weeks' };
            }
            case 'monthly': {
                // Show all 12 months of the current year
                const year = now.getFullYear();
                const ranges = [];
                for (let m = 0; m < 12; m++) {
                    const start = new Date(year, m, 1);
                    const end = new Date(year, m + 1, 0);
                    ranges.push({
                        label: start.toLocaleString('default', { month: 'short' }),
                        start: fmt(start),
                        end: fmt(end),
                    });
                }
                return { ranges, periodLabel: `Monthly (${year})` };
            }
            case 'yearly': {
                // Show last 5 years
                const currentYear = now.getFullYear();
                const ranges = [];
                for (let y = currentYear - 4; y <= currentYear; y++) {
                    ranges.push({
                        label: String(y),
                        start: `${y}-01-01`,
                        end: `${y}-12-31`,
                    });
                }
                return { ranges, periodLabel: 'Last 5 Years' };
            }
            case 'total': {
                // From 2020 to now, yearly breakdown
                const currentYear = now.getFullYear();
                const ranges = [];
                for (let y = 2020; y <= currentYear; y++) {
                    ranges.push({
                        label: String(y),
                        start: `${y}-01-01`,
                        end: y === currentYear ? fmt(now) : `${y}-12-31`,
                    });
                }
                return { ranges, periodLabel: 'All Time (2020 - Present)' };
            }
            default:
                return { ranges: [], periodLabel: '' };
        }
    };

    // Compute single start/end for the filter period (for pie/payment data)
    const getOverallDateRange = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filterMode) {
            case 'day':
                return { start: fmt(today), end: fmt(today) };
            case 'weekly': {
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return { start: fmt(weekStart), end: fmt(weekEnd) };
            }
            case 'monthly': {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return { start: fmt(monthStart), end: fmt(monthEnd) };
            }
            case 'yearly':
                return { start: `${now.getFullYear()}-01-01`, end: `${now.getFullYear()}-12-31` };
            case 'total':
                return { start: '2020-01-01', end: fmt(now) };
            default:
                return { start: fmt(today), end: fmt(today) };
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            if (filterMode === 'day') {
                // Special handling for Today: Hourly breakdown
                setDateRangeLabel('Today (Hourly)');
                try {
                    const res = await axios.get(`${API_URL}/api/accounts/reports/hourly-today`, { headers });
                    if (res.data.success) {
                        const data = res.data.hourlyData.map(d => ({
                            ...d,
                            Profit: Math.max(0, d.Profit) // Clamp negative profit to 0 for chart
                        }));
                        setTrendData(data);

                        // Calculate totals from hourly data (using original values for accurate totals)
                        const originalData = res.data.hourlyData;
                        const totalRevenue = originalData.reduce((s, d) => s + d.Revenue, 0);
                        const totalExpenses = originalData.reduce((s, d) => s + d.Expenses, 0);
                        const totalGST = originalData.reduce((s, d) => s + d.GST, 0);
                        const totalGSTPaid = originalData.reduce((s, d) => s + d.GST_Expenses || 0, 0);
                        const totalCash = originalData.reduce((s, d) => s + d.CashRevenue, 0);
                        const totalOnline = originalData.reduce((s, d) => s + d.OnlineRevenue, 0);

                        setTotals({
                            revenue: totalRevenue,
                            expenses: totalExpenses,
                            profit: totalRevenue - totalExpenses,
                            gst: totalGST,
                            gstPaid: totalGSTPaid,
                        });

                        setPaymentMethods([
                            { name: 'Cash', value: totalCash },
                            { name: 'Online', value: totalOnline },
                        ].filter(d => d.value > 0));
                    }
                } catch (err) {
                    console.error('Hourly fetch error:', err);
                    setTrendData([]);
                }
            } else {
                // Existing logic for Weekly, Monthly, Yearly, Total
                const { ranges, periodLabel } = getDateRanges();
                setDateRangeLabel(periodLabel);

                // Fetch trend data for each range
                const dataPoints = [];
                for (const range of ranges) {
                    try {
                        const res = await axios.get(
                            `${API_URL}/api/accounts/reports/summary?startDate=${range.start}&endDate=${range.end}`,
                            { headers }
                        );
                        if (res.data.success) {
                            const s = res.data.summary;
                            const profit = n(s.revenue.total) - n(s.expenses.total);
                            dataPoints.push({
                                label: range.label,
                                Revenue: n(s.revenue.total),
                                Expenses: n(s.expenses.total),
                                Profit: Math.max(0, profit), // Clamp negative profit to 0
                                GST: n(s.revenue.gst),
                                GST_Expenses: n(s.expenses.gst),
                                CashRevenue: n(s.revenue.cash),
                                OnlineRevenue: n(s.revenue.online),
                            });
                        } else {
                            dataPoints.push({ label: range.label, Revenue: 0, Expenses: 0, Profit: 0, GST: 0, GST_Expenses: 0, CashRevenue: 0, OnlineRevenue: 0 });
                        }
                    } catch {
                        dataPoints.push({ label: range.label, Revenue: 0, Expenses: 0, Profit: 0, GST: 0, GST_Expenses: 0, CashRevenue: 0, OnlineRevenue: 0 });
                    }
                }
                setTrendData(dataPoints);

                // Calculate totals
                const totalRevenue = dataPoints.reduce((s, d) => s + d.Revenue, 0);
                const totalExpenses = dataPoints.reduce((s, d) => s + d.Expenses, 0);
                const totalGST = dataPoints.reduce((s, d) => s + d.GST, 0);
                const totalGSTPaid = dataPoints.reduce((s, d) => s + d.GST_Expenses, 0);
                setTotals({
                    revenue: totalRevenue,
                    expenses: totalExpenses,
                    profit: totalRevenue - totalExpenses,
                    gst: totalGST,
                    gstPaid: totalGSTPaid,
                });

                // Payment method breakdown
                const totalCash = dataPoints.reduce((s, d) => s + d.CashRevenue, 0);
                const totalOnline = dataPoints.reduce((s, d) => s + d.OnlineRevenue, 0);
                setPaymentMethods([
                    { name: 'Cash', value: totalCash },
                    { name: 'Online', value: totalOnline },
                ].filter(d => d.value > 0));
            }

            // Fetch expenses for category breakdown (overall range)
            const overall = getOverallDateRange();
            try {
                const expRes = await axios.get(
                    `${API_URL}/api/accounts/expenses?startDate=${overall.start}&endDate=${overall.end}`,
                    { headers }
                );
                if (expRes.data.success && expRes.data.expenses) {
                    const catMap = {};
                    expRes.data.expenses.forEach(exp => {
                        const cat = exp.category || 'Other';
                        const total = n(exp.amount) + n(exp.gst_amount);
                        catMap[cat] = (catMap[cat] || 0) + total;
                    });
                    setExpenseCategories(
                        Object.entries(catMap).map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value)
                    );
                } else {
                    setExpenseCategories([]);
                }
            } catch {
                setExpenseCategories([]);
            }

        } catch (error) {
            console.error('Analytics fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        return (
            <g>
                <text x={cx} y={cy - 10} textAnchor="middle" fill="#333" fontSize={14} fontWeight="bold">
                    {payload.name}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#666" fontSize={12}>
                    ₹{value.toLocaleString('en-IN')} ({(percent * 100).toFixed(1)}%)
                </text>
                <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                    startAngle={startAngle} endAngle={endAngle} fill={fill} />
                <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
                    innerRadius={outerRadius + 10} outerRadius={outerRadius + 14} fill={fill} opacity={0.3} />
            </g>
        );
    };

    const formatCurrency = (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

    // Dynamic KPI labels
    const kpiLabel = filterMode === 'day' ? "Today's"
        : filterMode === 'weekly' ? 'This Week'
            : filterMode === 'monthly' ? 'This Month'
                : filterMode === 'yearly' ? 'This Year'
                    : 'All Time';

    const periodCount = trendData.length || 1;

    return (
        <div className="space-y-6">
            {/* Header + Filter Buttons */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">📊 Financial Analytics</h1>
                    {dateRangeLabel && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                            {dateRangeLabel}
                        </span>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {FILTER_MODES.map((mode) => (
                        <button
                            key={mode.key}
                            onClick={() => setFilterMode(mode.key)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                ${filterMode === mode.key
                                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
                                }
                            `}
                        >
                            <span>{mode.icon}</span>
                            <span>{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="text-center py-16">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 mt-3">Loading analytics...</p>
                </div>
            )}

            {!loading && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                            <p className="text-sm text-indigo-600 font-medium">{kpiLabel} Revenue</p>
                            <p className="text-2xl font-bold text-indigo-700 mt-1">₹{totals.revenue.toLocaleString('en-IN')}</p>

                        </Card>
                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                            <p className="text-sm text-amber-600 font-medium">{kpiLabel} Expenses</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">₹{totals.expenses.toLocaleString('en-IN')}</p>

                        </Card>
                        <Card className={`bg-gradient-to-br ${totals.profit >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-red-50 to-red-100 border-red-200'}`}>
                            <p className={`text-sm font-medium ${totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net Profit</p>
                            <p className={`text-2xl font-bold mt-1 ${totals.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                ₹{totals.profit.toLocaleString('en-IN')}
                            </p>

                        </Card>
                        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
                            <p className="text-sm text-rose-600 font-medium">GST Paid</p>
                            <p className="text-2xl font-bold text-rose-700 mt-1">₹{totals.gstPaid.toLocaleString('en-IN')}</p>

                        </Card>
                    </div>

                    {/* Trends Area Chart */}
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Revenue & Expense Trends</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600 }} />
                                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value, name) => [`₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, name]}
                                    contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={3}
                                    fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, fill: '#6366f1' }} />
                                <Area type="monotone" dataKey="Expenses" stroke="#f59e0b" strokeWidth={3}
                                    fillOpacity={1} fill="url(#colorExpenses)" dot={{ r: 4, fill: '#f59e0b' }} />
                                <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2}
                                    fillOpacity={1} fill="url(#colorProfit)" dot={{ r: 3, fill: '#10b981' }} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Row: Expense Category Pie + Payment Method Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expense Category Pie */}
                        <Card>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">🧩 Expense Breakdown by Category</h3>
                            {expenseCategories.length > 0 ? (
                                <div>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            {/* 3D Shadow */}
                                            <Pie data={expenseCategories} cx="50%" cy="52%" outerRadius={105} innerRadius={55}
                                                dataKey="value" isAnimationActive={false}>
                                                {expenseCategories.map((_, i) => (
                                                    <Cell key={`shadow-${i}`} fill={SHADOW_COLORS[i % SHADOW_COLORS.length]} opacity={0.35} />
                                                ))}
                                            </Pie>
                                            {/* Main Pie */}
                                            <Pie data={expenseCategories} cx="50%" cy="50%" outerRadius={105} innerRadius={55}
                                                dataKey="value" activeIndex={activePieIndex}
                                                activeShape={renderActiveShape}
                                                onMouseEnter={(_, index) => setActivePieIndex(index)}
                                                paddingAngle={3} stroke="none">
                                                {expenseCategories.map((_, i) => (
                                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}
                                                        style={{ filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.2))' }} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, undefined]}
                                                contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                                        {expenseCategories.map((entry, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:opacity-80"
                                                onMouseEnter={() => setActivePieIndex(i)}>
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                {entry.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-16">No expense data for this period</p>
                            )}
                        </Card>

                        {/* Payment Method Distribution */}
                        <Card>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Revenue by Payment Method</h3>
                            {paymentMethods.length > 0 ? (
                                <ResponsiveContainer width="100%" height={380}>
                                    <BarChart data={paymentMethods} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 14, fontWeight: 600 }} width={60} />
                                        <Tooltip
                                            formatter={(value) => [`₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Amount']}
                                            contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                            {paymentMethods.map((_, i) => (
                                                <Cell key={`bar-${i}`} fill={COLORS[i]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-400 text-center py-16">No payment data for this period</p>
                            )}
                        </Card>
                    </div>

                    {/* Summary Table */}
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Period Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-xs uppercase text-gray-600">
                                        <th className="px-4 py-3">Period</th>
                                        <th className="px-4 py-3 text-right">Revenue</th>
                                        <th className="px-4 py-3 text-right">Expenses</th>
                                        <th className="px-4 py-3 text-right">GST (Paid)</th>
                                        <th className="px-4 py-3 text-right">Profit</th>
                                        <th className="px-4 py-3 text-right">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trendData.map((d, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium">{d.label}</td>
                                            <td className="px-4 py-3 text-right text-indigo-600 font-medium">₹{d.Revenue.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 text-right text-amber-600 font-medium">₹{d.Expenses.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 text-right text-rose-600">₹{d.GST_Expenses.toLocaleString('en-IN')}</td>

                                            <td className={`px-4 py-3 text-right font-bold ${d.Profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                ₹{d.Profit.toLocaleString('en-IN')}
                                            </td>
                                            <td className={`px-4 py-3 text-right text-xs font-medium ${d.Revenue > 0 ? (d.Profit >= 0 ? 'text-emerald-500' : 'text-red-500') : 'text-gray-400'}`}>
                                                {d.Revenue > 0 ? `${((d.Profit / d.Revenue) * 100).toFixed(1)}%` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr className="bg-gray-100 font-bold border-t-2">
                                        <td className="px-4 py-3">TOTAL</td>
                                        <td className="px-4 py-3 text-right text-indigo-700">₹{totals.revenue.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 text-right text-amber-700">₹{totals.expenses.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 text-right text-rose-700">₹{totals.gstPaid.toLocaleString('en-IN')}</td>
                                        <td className={`px-4 py-3 text-right ${totals.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                            ₹{totals.profit.toLocaleString('en-IN')}
                                        </td>
                                        <td className={`px-4 py-3 text-right ${totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {totals.revenue > 0 ? `${((totals.profit / totals.revenue) * 100).toFixed(1)}%` : '—'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default AccountsAnalytics;
