import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';

// ========== REGISTER CHARTJS ==========
ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement, PointElement,
    LineElement, Filler
);

// ========== SCROLL ANIMATION WRAPPER ==========
const AnimatedSection = ({ children, delay = 0 }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), 100 + delay);
                    observer.disconnect();
                }
            },
            { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div ref={ref}
            className={`h-full w-full transition-all duration-1000 transform 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
            {isVisible ? children : <div className="w-full h-full bg-slate-50 opacity-0" />}
        </div>
    );
};

// ========== COUNT UP ANIMATION ==========
const CountUpValue = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
    const [count, setCount] = React.useState(0);
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        if (!isVisible) return;
        const numericValue = typeof value === 'string'
            ? parseFloat(value.replace(/[^0-9.]/g, ''))
            : value;

        if (isNaN(numericValue)) {
            setCount(value);
            return;
        }

        let startTime = null;
        const duration = 2000;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(progress * numericValue);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isVisible, value]);

    const displayValue = typeof count === 'number'
        ? count.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
        : value;

    return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
};

// ========== MINI COMPONENTS ==========

const StatCard = ({ title, value, icon, color, borderColor, subtitle, trend, trendValue, onClick }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6', 'border-cyan-500': '#06b6d4', 'border-indigo-500': '#6366f1',
        'border-emerald-500': '#10b981', 'border-purple-500': '#a855f7', 'border-orange-500': '#f97316',
        'border-red-500': '#ef4444', 'border-amber-500': '#f59e0b', 'border-rose-500': '#f43f5e',
        'border-teal-500': '#14b8a6', 'border-pink-500': '#ec4899', 'border-violet-500': '#8b5cf6',
    };
    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer' : 'cursor-default'} group h-full border-l-4 ${borderColor} overflow-hidden relative p-0 rounded-xl`}
            style={{ borderLeftColor: borderColors[borderColor] }}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex items-center justify-between h-full gap-2 relative z-10 p-2.5 sm:p-3">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500 leading-tight mb-0.5 uppercase tracking-wider">{title}</p>
                    <div className="text-lg md:text-xl font-black text-slate-800 whitespace-nowrap">
                        <CountUpValue
                            value={value}
                            prefix={typeof value === 'string' && value.startsWith('₹') ? '₹' : ''}
                            suffix={typeof value === 'string' && (value.endsWith('L') || value.endsWith('Cr') || value.endsWith('K')) ? value.slice(-1) : ''}
                        />
                    </div>
                    {subtitle && <p className="text-[9px] text-slate-400 mt-0.5 leading-none">{subtitle}</p>}
                    {trend && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium mt-1 ${trend === 'up' ? 'bg-green-50 text-green-700' : trend === 'down' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '●'} {trendValue}
                        </span>
                    )}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${color} flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const ProgressRing = ({ percentage, label, color, size = 80, strokeWidth = 6 }) => {
    const [animatedPercentage, setAnimatedPercentage] = React.useState(0);
    const ref = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => setAnimatedPercentage(percentage), 100);
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [percentage]);

    const radius = (size / 2) - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(animatedPercentage, 100) / 100) * circumference;
    return (
        <div ref={ref} className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">{percentage}%</span>
                </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">{label}</p>
        </div>
    );
};

const AttendanceMiniCard = ({ label, present, absent, late, total, percentage, color, icon, hideLate, onArrowClick }) => {
    const [animatedPercentage, setAnimatedPercentage] = React.useState(0);
    const ref = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => setAnimatedPercentage(percentage), 100);
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [percentage]);

    return (
        <div ref={ref} className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h4 className="text-sm font-bold text-slate-700">{label}</h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-2xl font-extrabold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {percentage}%
                    </span>
                    {onArrowClick && (
                        <button
                            onClick={onArrowClick}
                            title="View full report"
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <div className={`grid ${hideLate ? 'grid-cols-2' : 'grid-cols-3'} gap-2 text-center`}>
                <div className="bg-emerald-50 rounded-lg py-1.5">
                    <p className="text-lg font-bold text-emerald-600">{present}</p>
                    <p className="text-[9px] font-medium text-emerald-500 uppercase">Present</p>
                </div>
                <div className="bg-red-50 rounded-lg py-1.5">
                    <p className="text-lg font-bold text-red-600">{absent}</p>
                    <p className="text-[9px] font-medium text-red-500 uppercase">Absent</p>
                </div>
                {!hideLate && (
                    <div className="bg-amber-50 rounded-lg py-1.5">
                        <p className="text-lg font-bold text-amber-600">{late}</p>
                        <p className="text-[9px] font-medium text-amber-500 uppercase">Late</p>
                    </div>
                )}
            </div>
            <div className="mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedPercentage}%`, backgroundColor: color }} />
            </div>
        </div>
    );
};

// ========== CHART OPTIONS ==========
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 2500,
        easing: 'easeOutQuart',
        delay: (context) => {
            if (context.type !== 'data' || context.mode !== 'default') return 0;
            return context.dataIndex * 120 + context.datasetIndex * 300;
        }
    },
    plugins: {
        legend: { position: 'top', labels: { font: { size: 11, family: "'Inter', sans-serif" }, usePointStyle: true, padding: 15 } },
        tooltip: { backgroundColor: '#1e293b', titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8, displayColors: true }
    }
};



const numericalBarOptions = {
    ...chartDefaults,
    scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 10 }, precision: 0 } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8
};

const lineOptions = {
    ...chartDefaults,
    plugins: {
        ...chartDefaults.plugins,
        tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
                label: (context) => {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        const val = context.parsed.y;
                        label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: { 
            grid: { color: '#f1f5f9' }, 
            suggestedMin: 0,
            suggestedMax: 10000,
            ticks: { 
                font: { size: 10 }, 
                precision: 0,
                callback: v => {
                    if (v === 0) return '₹0';
                    const absV = Math.abs(v);
                    const sign = v < 0 ? '-' : '';
                    if (absV >= 100000) return `${sign}₹${(absV / 100000).toFixed(1)}L`;
                    if (absV >= 1000) return `${sign}₹${(absV / 1000).toFixed(0)}K`;
                    return `${sign}₹${absV}`;
                }
            } 
        },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
};

const doughnutOptions = {
    ...chartDefaults,
    cutout: '65%',
    plugins: { ...chartDefaults.plugins, legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true, padding: 12 } } }
};

const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
};

// ========== SKELETON LOADER ==========
const DashboardSkeleton = () => (
    <div className="space-y-6 pb-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 bg-slate-200 rounded-3xl w-full shadow-sm"></div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-slate-200 rounded-2xl w-full shadow-sm"></div>
            ))}
        </div>

        {/* Attendance Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
                <div key={i} className="h-36 bg-slate-200 rounded-2xl w-full shadow-sm"></div>
            ))}
        </div>

        {/* Chart Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-80 bg-slate-200 rounded-[32px] w-full shadow-sm"></div>
            <div className="h-80 bg-slate-200 rounded-[32px] w-full shadow-sm"></div>
            <div className="h-80 bg-slate-200 rounded-[32px] w-full shadow-sm"></div>
        </div>
    </div>
);

// ========== MAIN COMPONENT ==========
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [stats, setStats] = useState(null);
    const [todayStudentAtt, setTodayStudentAtt] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 });
    const [todayTeacherAtt, setTodayTeacherAtt] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 });
    const [weeklyAttendance, setWeeklyAttendance] = useState([]);
    const [feeStats, setFeeStats] = useState({ totalCollected: 0, totalPending: 0, monthlyCollection: 0 });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyExpenses, setMonthlyExpenses] = useState([]);
    const [classDistribution, setClassDistribution] = useState([]);
    const [genderDistribution, setGenderDistribution] = useState({ male: 0, female: 0, other: 0 });
    const [pendingRequisitions, setPendingRequisitions] = useState([]);
    const [activeGrievances, setActiveGrievances] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboardData = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setRefreshing(true);

            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            const [enhancedRes, reqRes, grievRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/dashboard-enhanced`, config),
                axios.get(`${API_URL}/api/admin/requisitions?status=pending`, config),
                axios.get(`${API_URL}/api/admin/grievances`, config)
            ]);

            if (enhancedRes.data.success) {
                const d = enhancedRes.data;
                setStats(d.stats);
                setTodayStudentAtt(d.todayStudentAttendance);
                setTodayTeacherAtt(d.todayTeacherAttendance);
                setWeeklyAttendance(d.weeklyAttendance || []);
                setFeeStats(d.feeStats);
                setMonthlyRevenue(d.monthlyRevenue || []);
                setMonthlyExpenses(d.monthlyExpenses || []);
                setClassDistribution(d.classDistribution || []);
                setGenderDistribution(d.genderDistribution || { male: 0, female: 0, other: 0 });
            }

            if (reqRes.data.success) setPendingRequisitions(reqRes.data.requisitions);

            if (grievRes.data.success) {
                const active = grievRes.data.grievances.filter(g => g.status === 'pending' || g.status === 'in_progress');
                setActiveGrievances(active);
            }

            // Build activity feed
            const combinedActivity = [
                ...reqRes.data.requisitions.slice(0, 4).map(r => ({
                    type: 'requisition', title: 'New Requisition', desc: `${r.item} by ${r.requesterName}`,
                    time: new Date(r.created_at), icon: '📦', color: 'bg-blue-50'
                })),
                ...grievRes.data.grievances.slice(0, 4).map(g => ({
                    type: 'grievance', title: 'Grievance Filed', desc: `${g.category} issue reported`,
                    time: new Date(g.created_at), icon: '⚠️', color: 'bg-red-50'
                }))
            ];
            combinedActivity.sort((a, b) => b.time - a.time);
            setRecentActivity(combinedActivity.slice(0, 5));

            setLoading(false);
            setRefreshing(false);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            const errMsg = "Failed to load dashboard data. Please check your connection.";

            if (err.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                setGlobalError?.({ type: 'LOAD_ERROR', message: errMsg });
            }

            setError(errMsg);
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffMins = Math.floor((now - date) / (1000 * 60));
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    // --- Chart Data for Attendance ---
    const dailyTeacherAttendanceData = {
        labels: weeklyAttendance.length > 0 ? weeklyAttendance.map(d => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'Present Teachers',
                data: weeklyAttendance.length > 0 ? weeklyAttendance.map(d => d.teacherPresent) : [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald/Green
                borderRadius: 8,
            },
            {
                label: 'Absent Teachers',
                data: weeklyAttendance.length > 0 ? weeklyAttendance.map(d => d.teacherAbsent) : [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(239, 68, 68, 0.8)', // Vibrant Red
                borderRadius: 8,
            }
        ]
    };

    const studentNumericalData = {
        labels: weeklyAttendance.length > 0 ? weeklyAttendance.map(d => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'Present Students',
                data: weeklyAttendance.length > 0 ? weeklyAttendance.map(d => d.studentPresent) : [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
                borderRadius: 8,
            },
            {
                label: 'Absent Students',
                data: weeklyAttendance.length > 0 ? weeklyAttendance.map(d => d.studentAbsent) : [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber
                borderRadius: 8,
            }
        ]
    };



    const generateLast6Months = () => {
        const months = [];
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
            const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
            months.push(m.toLocaleDateString('en-US', { month: 'short' }));
        }
        return months;
    };
    const last6Months = generateLast6Months();

    const revenueMap = {};
    monthlyRevenue.forEach(r => { revenueMap[r.month] = parseFloat(r.revenue); });

    const expenseMap = {};
    monthlyExpenses.forEach(e => { expenseMap[e.month] = parseFloat(e.expense); });

    const revenueExpenseData = {
        labels: last6Months,
        datasets: [
            {
                label: 'Revenue',
                data: last6Months.map(m => revenueMap[m] || 0),
                borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointBorderColor: '#fff',
                pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6
            },
            {
                label: 'Expenses',
                data: last6Months.map(m => expenseMap[m] || 0),
                borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)',
                fill: true, tension: 0.4, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff',
                pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, borderDash: [5, 5]
            }
        ]
    };

    const classColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#ef4444', '#84cc16', '#d946ef'];

    const getClassOrderRank = (className) => {
        if (!className) return 999;
        const str = String(className).trim();
        const cleanStr = str.replace(/^class\s+/i, '').trim().toUpperCase();

        const prePrimaryOrder = {
            'PLAYGROUP': -10, 'PG': -10,
            'NURSERY': -9, 'NUR': -9,
            'LN': -8, 'LOWER NURSERY': -8,
            'LKG': -7, 'KG': -6,
            'UN': -5, 'UPPER NURSERY': -5, 'UKG': -4
        };

        if (prePrimaryOrder[cleanStr] !== undefined) {
            return prePrimaryOrder[cleanStr];
        }

        const num = parseInt(cleanStr, 10);
        if (!isNaN(num)) {
            return num;
        }

        return 1000;
    };

    const sortedClassDistribution = [...classDistribution].sort((a, b) => {
        const rankA = getClassOrderRank(a.class_name);
        const rankB = getClassOrderRank(b.class_name);
        if (rankA !== rankB) return rankA - rankB;
        return String(a.class_name).localeCompare(String(b.class_name), undefined, { numeric: true });
    });

    const classChartData = {
        labels: sortedClassDistribution.map(c => {
            const name = String(c.class_name || '').trim();
            return name.toLowerCase().startsWith('class') ? name : `Class ${name}`;
        }),
        datasets: [{
            label: 'Students',
            data: sortedClassDistribution.map(c => c.count),
            backgroundColor: sortedClassDistribution.map((_, i) => classColors[i % classColors.length]),
            borderWidth: 0, borderRadius: 6, barPercentage: 0.7
        }]
    };
    const classBarOptions = {
        ...chartDefaults,
        plugins: { ...chartDefaults.plugins, legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, stepSize: 1 } },
            x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
    };

    const genderChartData = {
        labels: ['Boys', 'Girls', 'Other'],
        datasets: [{
            data: [genderDistribution.male, genderDistribution.female, genderDistribution.other],
            backgroundColor: ['#3b82f6', '#ec4899', '#8b5cf6'],
            borderWidth: 0, hoverOffset: 8
        }]
    };

    // Local fallbacks removed in favor of global PortalErrorState handled by Layout context


    const adminName = localStorage.getItem('userName') || 'Admin';

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-6 pb-8">
            {/* ==================== WELCOME BANNER ==================== */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-3 text-white shadow-md">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-12 -mb-12"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="text-md md:text-lg font-bold tracking-tight">Welcome Back, {adminName}! 👋</h1>
                                    <button
                                        onClick={() => fetchDashboardData(true)}
                                        disabled={refreshing}
                                        className={`p-1 bg-white/20 hover:bg-white/30 rounded-full transition-all flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}
                                        title="Refresh Dashboard Data"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-indigo-100 text-[11px] md:text-xs max-w-xl">
                                    {stats?.pendingRequisitions > 0 ? (
                                        <>You have <span className="font-bold text-white">{stats.pendingRequisitions} pending approvals</span> and <span className="font-bold text-white">{stats.activeGrievances} active grievances</span> to review.</>
                                    ) : 'System is running smoothly. Great job managing the school!'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => navigate('/admin/requisitions')}
                                className="px-2.5 py-1 bg-white text-indigo-600 rounded-md text-[11px] font-bold hover:bg-opacity-90 transition-all shadow flex items-center gap-1">
                                📋 Approve Requests
                            </button>
                            <button onClick={() => navigate('/admin/student-attendance-report')}
                                className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-md text-[11px] font-bold hover:bg-white/30 transition-all flex items-center gap-1">
                                📊 Attendance
                            </button>
                            <button onClick={() => navigate('/admin/users')}
                                className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-md text-[11px] font-bold hover:bg-white/30 transition-all flex items-center gap-1">
                                👥 Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== STAT CARDS ROW 1 ==================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title="Students" value={stats?.totalStudents || 0} icon="🎓" color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500" subtitle={`${stats?.totalClasses || 0} Classes`} onClick={() => navigate('/admin/students')} />
                <StatCard title="Teachers" value={stats?.totalTeachers || 0} icon="👨‍🏫" color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500" subtitle="Teaching Faculty" onClick={() => navigate('/admin/teachers')} />
                <StatCard title="Pending Approvals" value={stats?.pendingRequisitions || 0} icon="⏳" color="bg-amber-100 text-amber-600"
                    borderColor="border-amber-500" subtitle="Require Action" onClick={() => navigate('/admin/requisitions')} />
                <StatCard title="Active Grievances" value={stats?.activeGrievances || 0} icon="💬" color="bg-rose-100 text-rose-600"
                    borderColor="border-rose-500" subtitle="Grievance Tickets" onClick={() => navigate('/admin/grievances')} />
            </div>

            {/* ==================== TODAY'S ATTENDANCE ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AttendanceMiniCard label="Student Attendance Today" icon="🎓"
                    present={todayStudentAtt.present} absent={todayStudentAtt.absent}
                    late={todayStudentAtt.late} total={todayStudentAtt.total}
                    percentage={todayStudentAtt.percentage} color="#3b82f6" hideLate={true}
                    onArrowClick={() => navigate('/admin/student-attendance-report')} />
                <AttendanceMiniCard label="Teacher Attendance Today" icon="👨‍🏫"
                    present={todayTeacherAtt.present} absent={todayTeacherAtt.absent}
                    late={todayTeacherAtt.late} total={todayTeacherAtt.total}
                    percentage={todayTeacherAtt.percentage} color="#10b981"
                    onArrowClick={() => navigate('/admin/attendance-dashboard')} />
            </div>



            {/* ==================== CHARTS ROW 2: Distribution + Gender + Attendance Rings ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Class-wise Distribution */}
                <Card title="🎓 Students by Class" variant="elevated">
                    <div className="h-64">
                        {classDistribution.length > 0 ? (
                            <AnimatedSection>
                                <Bar key={JSON.stringify(classDistribution)} data={classChartData} options={classBarOptions} />
                            </AnimatedSection>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 italic">No class data available</div>
                        )}
                    </div>
                    <div className="mt-2 text-center text-xs text-slate-500">
                        Total: {stats?.totalStudents} students across {stats?.totalClasses} classes
                    </div>
                </Card>

                {/* Gender Distribution */}
                <Card title="👦👧 Gender Distribution" variant="elevated">
                    <div className="h-64">
                        <AnimatedSection>
                            <Doughnut key={JSON.stringify(genderDistribution)} data={genderChartData} options={doughnutOptions} />
                        </AnimatedSection>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-blue-50 rounded-lg py-1.5">
                            <span className="font-bold text-blue-600">{genderDistribution.male}</span>
                            <p className="text-blue-500">Boys</p>
                        </div>
                        <div className="bg-pink-50 rounded-lg py-1.5">
                            <span className="font-bold text-pink-600">{genderDistribution.female}</span>
                            <p className="text-pink-500">Girls</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg py-1.5">
                            <span className="font-bold text-purple-600">{genderDistribution.other}</span>
                            <p className="text-purple-500">Other</p>
                        </div>
                    </div>
                </Card>

                {/* Attendance Progress Rings */}
                <Card title="📈 Attendance Overview" variant="elevated">
                    <div className="flex justify-around items-center py-6">
                        <ProgressRing percentage={todayStudentAtt.percentage} label="Students" color="#3b82f6" />
                        <ProgressRing percentage={todayTeacherAtt.percentage} label="Teachers" color="#10b981" />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-center">
                        <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Students Present</p>
                            <p className="text-2xl font-bold text-blue-600">{todayStudentAtt.present}<span className="text-sm text-slate-400">/{todayStudentAtt.total}</span></p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3">
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Teachers Present</p>
                            <p className="text-2xl font-bold text-emerald-600">{todayTeacherAtt.present}<span className="text-sm text-slate-400">/{todayTeacherAtt.total}</span></p>
                        </div>
                    </div>
                </Card>
            </div>


            {/* ==================== CHARTS ROW 1: Attendance Trends ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Teacher Attendance Bar Chart */}
                <Card title="📊 Daily Teacher Attendance" subtitle="Trend of staff presence vs absence" variant="elevated">
                    <div className="h-72">
                        {weeklyAttendance.length > 0 ? (
                            <AnimatedSection>
                                <Bar key={JSON.stringify(weeklyAttendance)} data={dailyTeacherAttendanceData} options={numericalBarOptions} />
                            </AnimatedSection>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 italic">No attendance data available</div>
                        )}
                    </div>
                    <div className="w-full mt-4">
                        <button onClick={() => navigate('/admin/attendance-dashboard')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg py-2.5 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
                            📊 View Full Teacher Attendance
                        </button>
                    </div>
                </Card>

                {/* Student Attendance Summary (Numbers) */}
                <Card title="🎓 Student Attendance Summary" subtitle="Daily present vs absent counts" variant="elevated">
                    <div className="h-72">
                        {weeklyAttendance.length > 0 ? (
                            <AnimatedSection>
                                <Bar key={JSON.stringify(weeklyAttendance)} data={studentNumericalData} options={numericalBarOptions} />
                            </AnimatedSection>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 italic">No attendance data available</div>
                        )}
                    </div>
                    <div className="w-full mt-4">
                        <button onClick={() => navigate('/admin/student-attendance-report')} className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg py-2.5 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
                            📊 View Full Student Attendance
                        </button>
                    </div>
                </Card>
            </div>

            {/* ==================== CHARTS ROW 2: Financial ==================== */}
            <div className="grid grid-cols-1 gap-6">
                {/* Revenue vs Expenses Line */}
                <Card title="💰 Revenue vs Expenses (6 Months)" variant="elevated">
                    <div className="h-72">
                        <AnimatedSection>
                            <Line key={JSON.stringify(monthlyRevenue)} data={revenueExpenseData} options={lineOptions} />
                        </AnimatedSection>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap justify-between gap-2">
                        <div className="text-sm">
                            <span className="text-slate-500">Collected:</span>{' '}
                            <span className="font-bold text-emerald-600">{formatCurrency(feeStats.totalCollected)}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">Pending:</span>{' '}
                            <span className="font-bold text-amber-600">{formatCurrency(feeStats.totalPending)}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">This Month:</span>{' '}
                            <span className="font-bold text-blue-600">{formatCurrency(feeStats.monthlyCollection)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ==================== FEE STAT CARDS ==================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Fee Collected" value={formatCurrency(feeStats.totalCollected)} icon="💰" color="bg-teal-100 text-teal-600"
                    borderColor="border-teal-500" subtitle="Total Collection" onClick={() => navigate('/admin/fees')} />
                <StatCard title="Fee Pending" value={formatCurrency(feeStats.totalPending)} icon="📋" color="bg-rose-100 text-rose-600"
                    borderColor="border-rose-500" subtitle="Outstanding Dues" onClick={() => navigate('/admin/fees')} />
                <StatCard title="This Month" value={formatCurrency(feeStats.monthlyCollection)} icon="📅" color="bg-indigo-100 text-indigo-600"
                    borderColor="border-indigo-500" subtitle="Monthly Revenue" />
                <StatCard title="Vehicles" value={stats?.totalVehicles || 0} icon="🚌" color="bg-orange-100 text-orange-600"
                    borderColor="border-orange-500" subtitle="Active Fleet" onClick={() => navigate('/admin/transport')} />
            </div>

            {/* ==================== EVENTS & NOTICES ==================== */}
            <EventsNoticesSection />

            {/* ==================== APPROVALS + GRIEVANCES + ACTIVITY ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Requisitions */}
                <Card title="📋 Pending Requisitions" subtitle={`${pendingRequisitions.length} awaiting approval`} variant="elevated"
                    onClick={() => navigate('/admin/requisitions')} className="cursor-pointer">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {pendingRequisitions.length === 0 ? (
                            <p className="text-center text-slate-400 py-8 italic">No pending requisitions ✨</p>
                        ) : (
                            pendingRequisitions.slice(0, 4).map((req) => (
                                <div key={req.id} className="border border-slate-100 rounded-xl p-3 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">{req.item}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">By: {req.requesterName}</p>
                                            <div className="flex gap-1.5 mt-1.5">
                                                <Badge variant="info" size="sm">Qty: {req.quantity}</Badge>
                                                <Badge variant={req.urgency === 'High' ? 'danger' : 'warning'} size="sm">{req.urgency}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {pendingRequisitions.length > 4 && (
                            <button onClick={() => navigate('/admin/requisitions')}
                                className="w-full text-sm text-indigo-600 text-center py-2 hover:underline font-semibold">
                                View all {pendingRequisitions.length} →
                            </button>
                        )}
                    </div>
                </Card>

                {/* Active Grievances */}
                <Card title="⚠️ Active Grievances" subtitle={`${activeGrievances.length} need attention`} variant="elevated"
                    onClick={() => navigate('/admin/grievances')} className="cursor-pointer">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {activeGrievances.length === 0 ? (
                            <p className="text-center text-slate-400 py-8 italic">No active grievances ✨</p>
                        ) : (
                            activeGrievances.slice(0, 4).map((g) => (
                                <div key={g.id} className="border border-slate-100 rounded-xl p-3 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">{g.subject}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Category: {g.category}</p>
                                            <Badge variant="info" size="sm" className="mt-1.5">{g.category}</Badge>
                                        </div>
                                        <Badge variant={g.status === 'in_progress' ? 'warning' : 'pending'} size="sm">
                                            {g.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                        {activeGrievances.length > 4 && (
                            <button onClick={() => navigate('/admin/grievances')}
                                className="w-full text-sm text-indigo-600 text-center py-2 hover:underline font-semibold">
                                View all {activeGrievances.length} →
                            </button>
                        )}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card title="🔄 Recent Activity" variant="elevated">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <div key={index} className={`flex items-start gap-3 p-3 rounded-xl ${activity.color} transition-all hover:shadow-sm`}>
                                    <div className="text-xl mt-0.5">{activity.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                                        <p className="text-xs text-gray-600 mt-0.5 truncate">{activity.desc}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.time)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-8 italic">No recent activity</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* ==================== QUICK ACTIONS ==================== */}
            <Card title="🚀 Quick Actions" variant="elevated">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[
                        { name: 'Class & Subjects', path: '/admin/academic', icon: '📚', bg: 'bg-indigo-50 hover:bg-indigo-100', iconBg: 'bg-indigo-100' },
                        { name: 'Manage Users', path: '/admin/users', icon: '👥', bg: 'bg-blue-50 hover:bg-blue-100', iconBg: 'bg-blue-100' },
                        { name: 'Approve Requests', path: '/admin/requisitions', icon: '✅', bg: 'bg-emerald-50 hover:bg-emerald-100', iconBg: 'bg-emerald-100' },
                        { name: 'Grievances', path: '/admin/grievances', icon: '📢', bg: 'bg-violet-50 hover:bg-violet-100', iconBg: 'bg-violet-100' },
                        { name: 'View Students', path: '/admin/students', icon: '🎓', bg: 'bg-amber-50 hover:bg-amber-100', iconBg: 'bg-amber-100' },
                        { name: 'Attendance', path: '/admin/attendance-dashboard', icon: '📊', bg: 'bg-cyan-50 hover:bg-cyan-100', iconBg: 'bg-cyan-100' },
                        { name: 'Fee Management', path: '/admin/fees', icon: '💰', bg: 'bg-teal-50 hover:bg-teal-100', iconBg: 'bg-teal-100' },
                        { name: 'Transport', path: '/admin/transport', icon: '🚌', bg: 'bg-orange-50 hover:bg-orange-100', iconBg: 'bg-orange-100' },
                        { name: 'Certificates', path: '/admin/bonafide-certificate', icon: '📜', bg: 'bg-rose-50 hover:bg-rose-100', iconBg: 'bg-rose-100' },
                        { name: 'Holidays', path: '/admin/holidays', icon: '🎄', bg: 'bg-green-50 hover:bg-green-100', iconBg: 'bg-green-100' },
                    ].map((action) => (
                        <button key={action.path} onClick={() => navigate(action.path)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 ${action.bg} transition-all duration-300 group text-center`}>
                            <div className={`w-11 h-11 rounded-xl ${action.iconBg} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{action.name}</span>
                        </button>
                    ))}
                </div>
            </Card>

            {/* ==================== FOOTER STATUS BAR ==================== */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">System Status: Operational</span>
                    </div>
                    <div className="text-slate-400 text-xs">Last Updated: {new Date().toLocaleString()}</div>
                    <div className="flex gap-4 text-xs">
                        <span>📊 Student Attendance: {todayStudentAtt.percentage}%</span>
                        <span>👨‍🏫 Teacher Attendance: {todayTeacherAtt.percentage}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;