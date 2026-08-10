import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../productionLink/productionLink';
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    isSameDay,
    parseISO,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    addYears,
    subYears
} from 'date-fns';
/* ─────────────────────────────────────────────
   ANIMATED DONUT RING CHART
───────────────────────────────────────────── */
const AnimatedDonut = ({ present, absent, size = 140 }) => {
    const [animated, setAnimated] = useState(false);
    const total = present + absent;
    const pct = total > 0 ? (present / total) * 100 : 0;
    const r = 52;
    const circ = 2 * Math.PI * r;
    const presentDash = animated ? (pct / 100) * circ : 0;
    const absentDash = animated ? ((100 - pct) / 100) * circ : 0;

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 80);
        return () => clearTimeout(t);
    }, [present, absent]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {/* track */}
                <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* absent arc */}
                <circle
                    cx="60" cy="60" r={r} fill="none"
                    stroke="#fca5a5"
                    strokeWidth="12"
                    strokeDasharray={`${absentDash} ${circ}`}
                    strokeDashoffset={-presentDash}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '0.3s' }}
                />
                {/* present arc */}
                <circle
                    cx="60" cy="60" r={r} fill="none"
                    stroke="url(#presentGrad)"
                    strokeWidth="12"
                    strokeDasharray={`${presentDash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '0.1s' }}
                />
                <defs>
                    <linearGradient id="presentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 leading-none">{pct.toFixed(0)}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">present</span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   ANIMATED HORIZONTAL BAR (student performance)
───────────────────────────────────────────── */
const AnimatedBar = ({ pct, color }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 120);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full"
                style={{
                    width: `${width}%`,
                    background: color,
                    transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)'
                }}
            />
        </div>
    );
};

/* ─────────────────────────────────────────────
   MINI SPARKLINE (weekly/monthly trend)
───────────────────────────────────────────── */
const Sparkline = ({ points, color = '#6366f1', width = 120, height = 36 }) => {
    const [animated, setAnimated] = useState(false);
    const pathRef = useRef(null);
    const [pathLen, setPathLen] = useState(0);

    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const pad = 4;

    const coords = points.map((v, i) => {
        const x = pad + (i / (points.length - 1 || 1)) * (width - pad * 2);
        const y = height - pad - ((v - min) / range) * (height - pad * 2);
        return [x, y];
    });

    const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const fill = `${d} L${coords[coords.length - 1][0]},${height} L${coords[0][0]},${height} Z`;

    useEffect(() => {
        if (pathRef.current) {
            const len = pathRef.current.getTotalLength();
            setPathLen(len);
            setTimeout(() => setAnimated(true), 100);
        }
    }, [d]);

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {points.length > 1 && (
                <>
                    <path d={fill} fill={`url(#sg-${color.replace('#', '')})`} />
                    <path
                        ref={pathRef}
                        d={d}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={pathLen ? {
                            strokeDasharray: pathLen,
                            strokeDashoffset: animated ? 0 : pathLen,
                            transition: 'stroke-dashoffset 1.1s ease-out'
                        } : {}}
                    />
                    {coords.map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="2.5" fill={color}
                            style={{ opacity: animated ? 1 : 0, transition: `opacity 0.3s ${0.8 + i * 0.05}s` }}
                        />
                    ))}
                </>
            )}
        </svg>
    );
};

/* ─────────────────────────────────────────────
   PERFORMANCE CHART SECTION
───────────────────────────────────────────── */
const PerformanceCharts = ({ processedReport, stats, days, months, viewMode, currentPeriodStart, isHolidayDate }) => {
    const [tab, setTab] = useState('classwise'); // 'classwise' | 'leaderboard' | 'trend' | 'distribution'
    const [mounted, setMounted] = useState(false);
    const [selectedClassPopup, setSelectedClassPopup] = useState(null);

    useEffect(() => {
        setMounted(false);
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, [processedReport, tab]);

    useEffect(() => {
        // Only auto-switch when viewMode changes
        if (viewMode !== 'daily' && tab === 'classwise') {
            setTab('leaderboard');
        } else if (viewMode === 'daily' && tab !== 'classwise' && tab !== 'leaderboard' && tab !== 'trend' && tab !== 'distribution') {
            // This is just a safety catch, though unlikely to be needed
            setTab('classwise');
        }
    }, [viewMode]);

    /* per-student attendance % */
    const studentStats = useMemo(() => {
        return processedReport.map(s => {
            const entries = Object.keys(s.attendance);
            let p = 0, h = 0, a = 0;
            entries.forEach(d => {
                const e = s.attendance[d];
                if (e?.status === 'Present') p++;
                else if (e?.status === 'Absent') {
                    if (isHolidayDate(d)) h++;
                    else a++;
                } else if (isHolidayDate(d)) h++;
            });
            const total = p + a;
            return { ...s, present: p, holiday: h, absent: a, total, pct: total > 0 ? Math.round((p / total) * 100) : 0 };
        }).sort((a, b) => b.pct - a.pct);
    }, [processedReport, isHolidayDate]);

    /* daily trend (for weekly/monthly) */
    const trendPoints = useMemo(() => {
        const cols = viewMode === 'yearly' ? months : days;
        return cols.map(col => {
            const key = viewMode === 'yearly' ? format(col, 'yyyy-MM') : format(col, 'yyyy-MM-dd');
            let p = 0, total = 0;
            processedReport.forEach(s => {
                if (viewMode === 'yearly') {
                    Object.keys(s.attendance).filter(d => d.startsWith(key)).forEach(d => {
                        const e = s.attendance[d];
                        if (e?.status === 'Present') p++;
                        if (!isHolidayDate(d)) {
                            if (e?.status === 'Present' || e?.status === 'Absent') total++;
                        }
                    });
                } else {
                    const e = s.attendance[key];
                    if (e?.status === 'Present') p++;
                    if (!isHolidayDate(key)) {
                        if (e?.status === 'Present' || e?.status === 'Absent') total++;
                    }
                }
            });
            return total > 0 ? Math.round((p / total) * 100) : 0;
        });
    }, [processedReport, days, months, viewMode, isHolidayDate]);

    /* distribution buckets: 0-25, 26-50, 51-75, 76-100 */
    const distribution = useMemo(() => {
        const buckets = [0, 0, 0, 0];
        studentStats.forEach(s => {
            if (s.pct <= 25) buckets[0]++;
            else if (s.pct <= 50) buckets[1]++;
            else if (s.pct <= 75) buckets[2]++;
            else buckets[3]++;
        });
        return buckets;
    }, [studentStats]);

    const barColor = (pct) => {
        if (pct >= 75) return 'linear-gradient(90deg,#34d399,#059669)';
        if (pct >= 50) return 'linear-gradient(90deg,#fbbf24,#d97706)';
        return 'linear-gradient(90deg,#f87171,#dc2626)';
    };

    const getClassOrderRank = (className) => {
        if (!className) return 999;
        const str = String(className).trim();
        const cleanStr = str.replace(/^class\s+/i, '').replace(/[-_].*$/, '').trim().toUpperCase();

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

    /* class-wise group (averaged for period length) */
    const classStats = useMemo(() => {
        const groups = {};
        studentStats.forEach(s => {
            const key = s.section ? `Class ${s.class}-${s.section}` : `Class ${s.class}`;
            if (!groups[key]) groups[key] = { name: key, presentAvg: 0, absentAvg: 0, studentCount: 0, teachers: new Set() };
            
            // Check teacher/marker from student attendance records
            if (s.attendance) {
                Object.values(s.attendance).forEach(att => {
                    if (att?.marker_name && att.marker_name !== 'Unknown' && att.marker_name !== 'Not Marked') {
                        groups[key].teachers.add(att.marker_name);
                    }
                });
            }

            // Calculate average daily present/absent for this student over the selected period
            const avgDailyPresent = s.total > 0 ? (s.present / s.total) : 0;
            const avgDailyAbsent = s.total > 0 ? ((s.total - s.present) / s.total) : 0;
            
            groups[key].presentAvg += avgDailyPresent;
            groups[key].absentAvg += avgDailyAbsent;
            groups[key].studentCount += 1;
        });

        return Object.values(groups).map(g => {
            const teachersList = Array.from(g.teachers);
            return {
                name: g.name,
                total: g.studentCount,
                present: Math.round(g.presentAvg),
                absent: Math.round(g.absentAvg),
                teacherName: teachersList.length > 0 ? teachersList.join(', ') : 'Not Marked',
                pct: g.studentCount > 0 ? Math.round((g.presentAvg / g.studentCount) * 100) : 0
            };
        }).sort((a, b) => {
            const rankA = getClassOrderRank(a.name);
            const rankB = getClassOrderRank(b.name);
            if (rankA !== rankB) return rankA - rankB;
            return a.name.localeCompare(b.name, undefined, { numeric: true });
        });
    }, [studentStats]);

    const tabs = [
        ...(viewMode === 'daily' ? [{ id: 'classwise', label: '🏫 Class-wise' }] : []),
        { id: 'leaderboard', label: '🏆 Leaderboard', },
        { id: 'trend', label: '📈 Trend', },
        { id: 'distribution', label: '🎯 Distribution', },
    ];

    return (
        <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200 shadow-md sm:shadow-xl shadow-slate-100/40 overflow-hidden">
            {/* Header */}
            <div className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
                <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs sm:text-sm">📊</span>
                        Performance Analytics
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Live insights from current report data</p>
                </div>
                {/* Mini donut summary */}
                <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-6 bg-slate-50 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-slate-100 w-full sm:w-auto">
                    <AnimatedDonut present={stats.present} absent={stats.absent} size={70} />
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            <span className="text-[11px] sm:text-xs text-slate-500">Present</span>
                            <span className="ml-auto text-[11px] sm:text-xs font-bold text-slate-700">{stats.present}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
                            <span className="text-[11px] sm:text-xs text-slate-500">Absent</span>
                            <span className="ml-auto text-[11px] sm:text-xs font-bold text-slate-700">{stats.absent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                            <span className="text-[11px] sm:text-xs text-slate-500">Students</span>
                            <span className="ml-auto text-[11px] sm:text-xs font-bold text-slate-700">{stats.totalStudents}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-1 px-3 sm:px-6 pt-3 sm:pt-4 pb-0">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 ${tab === t.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="p-2.5 sm:p-6 pt-2 sm:pt-4">
                {/* ── LEADERBOARD TAB ── */}
                {tab === 'leaderboard' && (
                    <div className="space-y-1">
                        {studentStats.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">No data available</div>
                        ) : (
                            <>
                                {/* Top 3 podium */}
                                {studentStats.length >= 3 && (
                                    <div className="flex items-end justify-center gap-3 mb-6 pt-2">
                                        {[1, 0, 2].map((rank) => {
                                            const s = studentStats[rank];
                                            if (!s) return null;
                                            const heights = [72, 96, 56];
                                            const medals = ['🥈', '🥇', '🥉'];
                                            const colors = ['from-slate-200 to-slate-300', 'from-amber-300 to-yellow-400', 'from-orange-200 to-orange-300'];
                                            return (
                                                <div key={rank} className="flex flex-col items-center gap-1"
                                                    style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${rank * 0.1}s` }}>
                                                    <span className="text-lg">{medals[rank === 0 ? 1 : rank === 1 ? 0 : 2]}</span>
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-slate-700 max-w-[72px] truncate">{s.name.split(' ')[0]}</div>
                                                        <div className="text-[10px] font-black text-indigo-600">{s.pct}%</div>
                                                    </div>
                                                    <div
                                                        className={`w-16 rounded-t-xl bg-gradient-to-b ${colors[rank === 0 ? 1 : rank === 1 ? 0 : 2]} flex items-start justify-center pt-1`}
                                                        style={{ height: heights[rank === 0 ? 1 : rank === 1 ? 0 : 2] }}
                                                    >
                                                        <span className="text-xs font-black text-white/80">#{rank + 1}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* All students ranked */}
                                <div className="max-h-56 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-200">
                                    {studentStats.map((s, i) => (
                                        <div
                                            key={`${s.student_id}_${s.subjectName || i}`}
                                            className="flex items-center gap-3 group"
                                            style={{
                                                opacity: mounted ? 1 : 0,
                                                transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
                                                transition: `all 0.5s ease ${i * 0.04}s`
                                            }}
                                        >
                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-500' : i === 2 ? 'bg-orange-100 text-orange-500' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="text-xs font-semibold text-slate-700 truncate">{s.name}</span>
                                                    <span className={`text-[10px] font-black ml-2 flex-shrink-0 ${s.pct >= 75 ? 'text-emerald-600' : s.pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                        {s.pct}%
                                                    </span>
                                                </div>
                                                <AnimatedBar pct={mounted ? s.pct : 0} color={barColor(s.pct)} />
                                            </div>
                                            <span className="text-[9px] text-slate-400 flex-shrink-0 w-10 text-right">{s.present}/{s.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── CLASS-WISE TAB ── */}
                {tab === 'classwise' && (
                    <div className="w-full pb-3 sm:pb-6 pt-1 space-y-4 sm:space-y-8">
                        {classStats.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">No data available</div>
                        ) : (
                            <>
                                {/* Chart Header & Wing Badges */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 bg-slate-50/80 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-100">
                                    {/* Legend */}
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                                            <span className="text-[11px] sm:text-xs text-slate-600 font-medium">Present Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                                            <span className="text-[11px] sm:text-xs text-slate-600 font-medium">Absent Students</span>
                                        </div>
                                    </div>
                                    {/* Category Structure Pills */}
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <span className="text-[9px] sm:text-[10px] uppercase font-medium text-slate-400 tracking-wider mr-1">Wings:</span>
                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200">Pre-Primary (LN, KG, UN)</span>
                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200">Primary (1-5)</span>
                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">Middle (6-8)</span>
                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">Secondary (9-10)</span>
                                    </div>
                                </div>

                                {/* Structured Bar Chart Area */}
                                <div className="flex flex-col w-full h-[270px] sm:h-[310px] bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-2 sm:p-4 relative shadow-sm">
                                    <div className="flex-1 flex items-end justify-around border-b border-slate-200 relative pt-6 sm:pt-8 pb-1 sm:pb-2 px-1 sm:px-2 overflow-x-auto gap-1.5 sm:gap-3">
                                        {/* Horizontal Grid Lines */}
                                        {[0, 25, 50, 75, 100].map(pct => (
                                            <div key={pct} className="absolute left-0 w-full border-t border-slate-100 pointer-events-none flex items-center justify-between" style={{ bottom: `${pct}%`, zIndex: 0 }}>
                                                <span className="text-[8px] sm:text-[9px] font-medium text-slate-300 ml-0.5 sm:ml-1">{pct}%</span>
                                            </div>
                                        ))}

                                        {(() => {
                                            const maxCount = Math.max(...classStats.map(c => Math.max(c.present, c.absent))) || 1;
                                            const colorsList = [
                                                { bg: 'bg-purple-500', pill: 'bg-purple-100 text-purple-700 border-purple-200' },
                                                { bg: 'bg-teal-500', pill: 'bg-teal-100 text-teal-700 border-teal-200' },
                                                { bg: 'bg-cyan-500', pill: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
                                                { bg: 'bg-blue-500', pill: 'bg-blue-100 text-blue-700 border-blue-200' },
                                                { bg: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                                                { bg: 'bg-indigo-500', pill: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                                                { bg: 'bg-violet-500', pill: 'bg-violet-100 text-violet-700 border-violet-200' },
                                                { bg: 'bg-amber-500', pill: 'bg-amber-100 text-amber-700 border-amber-200' },
                                                { bg: 'bg-rose-500', pill: 'bg-rose-100 text-rose-700 border-rose-200' },
                                                { bg: 'bg-sky-500', pill: 'bg-sky-100 text-sky-700 border-sky-200' },
                                                { bg: 'bg-pink-500', pill: 'bg-pink-100 text-pink-700 border-pink-200' },
                                                { bg: 'bg-orange-500', pill: 'bg-orange-100 text-orange-700 border-orange-200' },
                                                { bg: 'bg-lime-500', pill: 'bg-lime-100 text-lime-700 border-lime-200' }
                                            ];

                                            return classStats.map((c, i) => {
                                                const pHeight = (c.present / maxCount) * 100;
                                                const aHeight = (c.absent / maxCount) * 100;
                                                const theme = colorsList[i % colorsList.length];
                                                const cleanLabel = c.name.replace('Class ', '');

                                                return (
                                                    <div 
                                                        key={i} 
                                                        className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end group cursor-pointer flex-1 min-w-[36px] sm:min-w-[40px] max-w-[64px]" 
                                                        onClick={() => setSelectedClassPopup(c.name)}
                                                    >
                                                        {/* Pillar Track Background */}
                                                        <div className="w-full bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 hover:border-slate-200 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 flex justify-center items-end h-full transition-all relative">
                                                            {/* Bars Container */}
                                                            <div className="flex items-end justify-center gap-0.5 sm:gap-1 h-full w-full">
                                                                {/* Present Bar */}
                                                                <div 
                                                                    className="w-1/2 bg-blue-500 hover:bg-blue-600 rounded-t-md sm:rounded-t-lg relative flex justify-center shadow-sm transition-all"
                                                                    style={{ height: mounted ? `${Math.max(pHeight, c.present > 0 ? 8 : 0)}%` : '0%', transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.04}s` }}
                                                                >
                                                                    {c.present > 0 && (
                                                                        <span className="absolute -top-4 sm:-top-5 text-[9px] sm:text-[10px] font-semibold text-blue-600 bg-white shadow-sm border border-blue-100 px-0.5 sm:px-1 rounded-md">
                                                                            {c.present}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {/* Absent Bar */}
                                                                <div 
                                                                    className="w-1/2 bg-amber-500 hover:bg-amber-600 rounded-t-md sm:rounded-t-lg relative flex justify-center shadow-sm transition-all"
                                                                    style={{ height: mounted ? `${Math.max(aHeight, c.absent > 0 ? 8 : 0)}%` : '0%', transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.04}s` }}
                                                                >
                                                                    {c.absent > 0 && (
                                                                        <span className="absolute -top-4 sm:-top-5 text-[9px] sm:text-[10px] font-semibold text-amber-600 bg-white shadow-sm border border-amber-100 px-0.5 sm:px-1 rounded-md">
                                                                            {c.absent}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {c.present === 0 && c.absent === 0 && (
                                                                <span className="absolute bottom-1.5 text-[8px] sm:text-[9px] font-medium text-slate-300">0</span>
                                                            )}
                                                        </div>
                                                        {/* Styled Class Badge Label */}
                                                        <div className={`px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-semibold border shadow-sm text-center whitespace-nowrap transition-transform group-hover:scale-105 ${theme.pill}`}>
                                                            {cleanLabel}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Separate Structured Individual Class Breakdown Grid */}
                                <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                                            <span>🧱</span> Individual Class Structure
                                        </h3>
                                        <span className="text-[11px] sm:text-xs text-slate-400 font-medium">{classStats.length} Classes Registered</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                        {classStats.map((c, i) => {
                                            const colorsList = [
                                                { border: 'border-purple-300', bg: 'bg-purple-500' },
                                                { border: 'border-teal-300', bg: 'bg-teal-500' },
                                                { border: 'border-cyan-300', bg: 'bg-cyan-500' },
                                                { border: 'border-blue-300', bg: 'bg-blue-500' },
                                                { border: 'border-emerald-300', bg: 'bg-emerald-500' },
                                                { border: 'border-indigo-300', bg: 'bg-indigo-500' },
                                                { border: 'border-violet-300', bg: 'bg-violet-500' },
                                                { border: 'border-amber-300', bg: 'bg-amber-500' },
                                                { border: 'border-rose-300', bg: 'bg-rose-500' },
                                                { border: 'border-sky-300', bg: 'bg-sky-500' },
                                                { border: 'border-pink-300', bg: 'bg-pink-500' },
                                                { border: 'border-orange-300', bg: 'bg-orange-500' },
                                            ];
                                            const theme = colorsList[i % colorsList.length];
                                            const totalAttended = c.present + c.absent;
                                            const pct = totalAttended > 0 ? Math.round((c.present / totalAttended) * 100) : 0;

                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setSelectedClassPopup(c.name)}
                                                    className={`bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border-l-4 ${theme.border} border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5 relative overflow-hidden`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                                                            {c.name}
                                                        </span>
                                                        <span className={`text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full flex-shrink-0 ${totalAttended > 0 ? (pct >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600') : 'bg-slate-100 text-slate-400'}`}>
                                                            {totalAttended > 0 ? `${pct}%` : 'No Data'}
                                                        </span>
                                                    </div>

                                                    {/* Teacher Info */}
                                                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 mb-1.5 truncate">
                                                        <span className="text-slate-400 flex-shrink-0">👨‍🏫</span>
                                                        <span className="truncate font-medium text-slate-600">
                                                            {c.teacherName && c.teacherName !== 'Not Marked' ? c.teacherName : <span className="italic text-slate-400">Not Marked</span>}
                                                        </span>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="w-full bg-slate-100 h-1 sm:h-1.5 rounded-full overflow-hidden mb-2">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-700 ${theme.bg}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>

                                                    {/* Counts */}
                                                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium">
                                                        <span className="text-blue-600 bg-blue-50 px-1 sm:px-1.5 py-0.5 rounded-md">
                                                            {c.present} Present
                                                        </span>
                                                        <span className="text-amber-600 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded-md">
                                                            {c.absent} Absent
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── TREND TAB ── */}
                {tab === 'trend' && (
                    <div>
                        {trendPoints.filter(v => v > 0).length < 2 ? (
                            <div className="text-center text-slate-400 text-sm py-8">Not enough data for trend. Switch to Weekly, Monthly, or Yearly view.</div>
                        ) : (
                            <>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-black text-slate-800">
                                        {trendPoints.length ? Math.round(trendPoints.reduce((a, b) => a + b, 0) / trendPoints.length) : 0}%
                                    </span>
                                    <span className="text-xs text-slate-400 mb-1.5">avg attendance</span>
                                    {trendPoints.length >= 2 && (
                                        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 ${trendPoints[trendPoints.length - 1] >= trendPoints[0]
                                                ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {trendPoints[trendPoints.length - 1] >= trendPoints[0] ? '▲' : '▼'} Trend
                                        </span>
                                    )}
                                </div>

                                {/* Full-width sparkline */}
                                <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <svg viewBox={`0 0 400 100`} width="100%" height="100" preserveAspectRatio="none"
                                        className="overflow-visible">
                                        {/* Grid lines */}
                                        {[25, 50, 75, 100].map(y => (
                                            <g key={y}>
                                                <line x1="0" y1={100 - y} x2="400" y2={100 - y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
                                                <text x="2" y={100 - y - 2} fontSize="8" fill="#94a3b8">{y}%</text>
                                            </g>
                                        ))}
                                        {/* Sparkline inline (full width version) */}
                                        {(() => {
                                            const pts = trendPoints;
                                            const w = 400, h = 90, pad = 20;
                                            const coords = pts.map((v, i) => [
                                                pad + (i / (pts.length - 1 || 1)) * (w - pad * 2),
                                                h - (v / 100) * (h - 10)
                                            ]);
                                            const pathD = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
                                            const fillD = `${pathD} L${coords[coords.length - 1][0]},${h} L${coords[0][0]},${h} Z`;
                                            const cols = viewMode === 'yearly' ? months : days;
                                            return (
                                                <>
                                                    <defs>
                                                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d={fillD} fill="url(#trendFill)" />
                                                    <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    {coords.map(([x, y], i) => (
                                                        <g key={i}>
                                                            <circle cx={x} cy={y} r="4" fill="#6366f1" opacity="0.9" />
                                                            <circle cx={x} cy={y} r="7" fill="#6366f1" opacity="0.15" />
                                                            {cols[i] && (
                                                                <text x={x} y={h + 12} textAnchor="middle" fontSize="7" fill="#94a3b8">
                                                                    {viewMode === 'yearly' ? format(cols[i], 'MMM') : format(cols[i], 'dd')}
                                                                </text>
                                                            )}
                                                        </g>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </svg>
                                </div>

                                {/* Peak & Low */}
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                        <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Peak</div>
                                        <div className="text-xl font-black text-emerald-700">{Math.max(...trendPoints)}%</div>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                                        <div className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Lowest</div>
                                        <div className="text-xl font-black text-red-600">{Math.min(...trendPoints.filter(v => v > 0))}%</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── DISTRIBUTION TAB ── */}
                {tab === 'distribution' && (
                    <div>
                        {studentStats.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">No data available</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    {[
                                        { label: 'Critical (0–25%)', count: distribution[0], color: '#ef4444', bg: 'bg-red-50', border: 'border-red-100', icon: '🔴' },
                                        { label: 'At Risk (26–50%)', count: distribution[1], color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-100', icon: '🟡' },
                                        { label: 'Moderate (51–75%)', count: distribution[2], color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-100', icon: '🔵' },
                                        { label: 'Good (76–100%)', count: distribution[3], color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: '🟢' },
                                    ].map((b, i) => (
                                        <div
                                            key={i}
                                            className={`${b.bg} rounded-2xl p-4 border ${b.border}`}
                                            style={{
                                                opacity: mounted ? 1 : 0,
                                                transform: mounted ? 'scale(1)' : 'scale(0.9)',
                                                transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`
                                            }}
                                        >
                                            <div className="text-lg">{b.icon}</div>
                                            <div className="text-2xl font-black mt-1" style={{ color: b.color }}>{b.count}</div>
                                            <div className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-tight">{b.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stacked bar chart */}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Student Distribution</div>
                                    {[
                                        { label: 'Good (76–100%)', count: distribution[3], color: '#10b981' },
                                        { label: 'Moderate (51–75%)', count: distribution[2], color: '#3b82f6' },
                                        { label: 'At Risk (26–50%)', count: distribution[1], color: '#f59e0b' },
                                        { label: 'Critical (0–25%)', count: distribution[0], color: '#ef4444' },
                                    ].map((b, i) => {
                                        const pct = studentStats.length > 0 ? Math.round((b.count / studentStats.length) * 100) : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-3 mb-2">
                                                <div className="w-[100px] text-[10px] text-slate-500 text-right flex-shrink-0 truncate">{b.label}</div>
                                                <div className="flex-1 h-5 bg-white rounded-full overflow-hidden border border-slate-200">
                                                    <div
                                                        className="h-full rounded-full flex items-center pl-2"
                                                        style={{
                                                            width: mounted ? `${pct}%` : '0%',
                                                            background: b.color,
                                                            transition: `width 0.9s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s`,
                                                            minWidth: b.count > 0 ? '24px' : '0px'
                                                        }}
                                                    >
                                                        {b.count > 0 && <span className="text-[9px] font-black text-white">{b.count}</span>}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 w-8 text-right flex-shrink-0">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Alert section */}
                                {distribution[0] > 0 && (
                                    <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                        <span className="text-base flex-shrink-0">⚠️</span>
                                        <p className="text-[11px] text-red-700 font-medium leading-snug">
                                            <strong>{distribution[0]} student{distribution[0] > 1 ? 's' : ''}</strong> {distribution[0] > 1 ? 'have' : 'has'} critical attendance below 25%. Immediate intervention recommended.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Popup Modal for Class-wise Click */}
            {(() => {
                if (!selectedClassPopup || days.length === 0) return null;
                const dateKey = format(days[0], 'yyyy-MM-dd');
                const studentsInClass = processedReport.filter(s => {
                    const className = s.section ? `Class ${s.class}-${s.section}` : `Class ${s.class}`;
                    return className === selectedClassPopup;
                });
                const present = [];
                const absent = [];
                let markedBy = 'Not Marked';
                studentsInClass.forEach(s => {
                    const att = s.attendance[dateKey];
                    if (att) {
                        if (att.marker_name && att.marker_name !== 'Unknown') markedBy = att.marker_name;
                        if (att.status === 'Present') present.push(s);
                        else if (att.status === 'Absent') absent.push(s);
                    }
                });

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all" onClick={() => setSelectedClassPopup(null)}>
                        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-900/20" style={{ animation: 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🏫</span>
                                        {selectedClassPopup}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] border border-slate-300">👤</span>
                                        Marked by: <span className="font-semibold text-slate-700">{markedBy}</span>
                                    </p>
                                </div>
                                <button onClick={() => setSelectedClassPopup(null)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all">✕</button>
                            </div>
                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Present List */}
                                    <div>
                                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2 bg-emerald-50/50 p-2 border border-emerald-100/50 rounded-lg">
                                            <div className="w-2.5 h-2.5 rounded bg-emerald-500"></div>
                                            Present ({present.length})
                                        </h4>
                                        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                                            {present.length === 0 ? <p className="text-xs text-slate-400 italic px-2">No present students.</p> : 
                                                present.map(s => (
                                                    <div key={s.student_id} className="bg-white px-3 py-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2 hover:border-emerald-300 transition-colors">
                                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">{s.roll_no || '-'}</div>
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{s.name}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    {/* Absent List */}
                                    <div>
                                        <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2 bg-red-50/50 p-2 border border-red-100/50 rounded-lg">
                                            <div className="w-2.5 h-2.5 rounded bg-red-500"></div>
                                            Absent ({absent.length})
                                        </h4>
                                        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                                            {absent.length === 0 ? <p className="text-xs text-slate-400 italic px-2">No absent students.</p> : 
                                                absent.map(s => (
                                                    <div key={s.student_id} className="bg-white px-3 py-2.5 rounded-xl border border-red-100 shadow-sm flex items-center gap-2 hover:border-red-300 transition-colors">
                                                        <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-[10px] font-bold shrink-0">{s.roll_no || '-'}</div>
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{s.name}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT  (all original logic preserved)
═══════════════════════════════════════════════════ */
const StudentAttendanceReport = () => {
    const [attendanceType, setAttendanceType] = useState('day_wise');
    const [viewMode, setViewMode] = useState('daily');
    const [reportData, setReportData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPeriodStart, setCurrentPeriodStart] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [editPopup, setEditPopup] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [streams, setStreams] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const isHigherSecondary = (cls) => {
        if (!cls) return false;
        const name = (cls.name || '').toUpperCase();
        const num = String(cls.class_number || '');
        return name.includes('XI') || name.includes('11') || name.includes('XII') || name.includes('12') || num === '11' || num === '12';
    };

    const selectedClassObj = useMemo(() => classes.find(c => (c.class_number || c.name) === selectedClass), [selectedClass, classes]);
    const isHS = useMemo(() => isHigherSecondary(selectedClassObj), [selectedClassObj]);

    const filteredClasses = useMemo(() => classes.filter(c => {
        const hs = isHigherSecondary(c);
        return attendanceType === 'subject_wise' ? hs : !hs;
    }), [classes, attendanceType]);

    const handleTabSwitch = (type) => {
        setAttendanceType(type);
        setSelectedClass('');
        setSelectedSection('');
        setSelectedStream('');
        setSelectedSubject('');
        setReportData([]);
        setSearchTerm('');
    };

    useEffect(() => { fetchClasses(); fetchGeneralSubjects(); }, []);

    useEffect(() => {
        setSelectedSection('');
        setSelectedStream('');
        setSelectedSubject('');
        if (selectedClassObj) {
            if (isHigherSecondary(selectedClassObj)) {
                fetchStreams(selectedClassObj.id);
                setSections([]);
                setSubjectsList([]);
            } else {
                fetchSections(selectedClassObj.id);
                fetchSubjectsForClass(selectedClassObj.id);
                setStreams([]);
            }
        } else {
            setSections([]);
            setStreams([]);
            fetchGeneralSubjects();
        }
    }, [selectedClassObj]);

    useEffect(() => {
        if (isHS) {
            setSelectedSection('');
            setSelectedSubject('');
            if (selectedStream) {
                fetchSections(selectedClassObj.id, selectedStream);
                fetchSubjectsForClass(selectedClassObj.id, selectedStream);
            } else {
                setSections([]);
                setSubjectsList([]);
            }
        }
    }, [selectedStream, isHS, selectedClassObj]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/classes`, { headers });
            const sortedClasses = (res.data.classes || []).sort((a, b) => {
                const getRank = (className) => {
                    if (!className) return 999;
                    const cleanStr = String(className).trim().replace(/^class\s+/i, '').replace(/[-_].*$/, '').trim().toUpperCase();
                    const prePrimaryOrder = {
                        'PLAYGROUP': -10, 'PG': -10, 'NURSERY': -9, 'NUR': -9,
                        'LN': -8, 'LOWER NURSERY': -8, 'LKG': -7, 'KG': -6,
                        'UN': -5, 'UPPER NURSERY': -5, 'UKG': -4
                    };
                    if (prePrimaryOrder[cleanStr] !== undefined) return prePrimaryOrder[cleanStr];
                    const num = parseInt(cleanStr, 10);
                    return !isNaN(num) ? num : 1000;
                };
                const rankA = getRank(a.name);
                const rankB = getRank(b.name);
                if (rankA !== rankB) return rankA - rankB;
                return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
            });
            setClasses(sortedClasses);
        } catch (error) { console.error('Error fetching classes:', error); }
    };

    const fetchStreams = async (classId) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/class-streams/${classId}`, { headers });
            const sorted = (res.data.streams || []).sort((a, b) =>
                (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setStreams(sorted);
        } catch (error) { console.error('Error fetching streams:', error); }
    };

    const fetchSections = async (classId, streamId = null) => {
        try {
            let url = `${API_URL}/api/admin/class-sections/${classId}`;
            if (streamId) url += `?stream_id=${streamId}`;
            const res = await axios.get(url, { headers });
            const sorted = (res.data.sections || []).sort((a, b) =>
                (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setSections(sorted);
        } catch (error) { console.error('Error fetching sections:', error); }
    };

    const fetchSubjectsForClass = async (classId, streamId = null) => {
        try {
            let url = `${API_URL}/api/admin/class-subjects/${classId}`;
            if (streamId) url += `?stream_id=${streamId}`;
            const res = await axios.get(url, { headers });
            const sorted = (res.data.subjects || []).sort((a, b) =>
                (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setSubjectsList(sorted);
        } catch (error) { console.error('Error fetching class subjects:', error); setSubjectsList([]); }
    };

    const fetchGeneralSubjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/subjects`, { headers });
            const sorted = (res.data.subjects || []).sort((a, b) =>
                (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setSubjectsList(sorted);
        } catch (error) { console.error('Error fetching general subjects:', error); }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            let start, end;
            if (viewMode === 'daily') { start = parseISO(date); end = parseISO(date); }
            else if (viewMode === 'weekly') { start = startOfWeek(currentPeriodStart, { weekStartsOn: 1 }); end = endOfWeek(currentPeriodStart, { weekStartsOn: 1 }); }
            else if (viewMode === 'monthly') { start = startOfMonth(currentPeriodStart); end = endOfMonth(currentPeriodStart); }
            else if (viewMode === 'yearly') { start = startOfYear(currentPeriodStart); end = endOfYear(currentPeriodStart); }

            const res = await axios.get(`${API_URL}/api/admin/student-attendance-report`, {
                params: {
                    startDate: format(start, 'yyyy-MM-dd'),
                    endDate: format(end, 'yyyy-MM-dd'),
                    class: selectedClass,
                    section: selectedSection,
                    streamId: selectedStream,
                    subject: attendanceType === 'day_wise' ? 'day_wise' : (selectedSubject || ''),
                    attendanceType
                },
                headers
            });

            if (res.data.success) {
                setReportData(res.data.report || []);
                setHolidays(res.data.holidays || []);
                setWeeklySchedule(res.data.weekly_schedule || []);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to fetch attendance data');
        } finally { setLoading(false); }
    };

    const toggleAttendance = async (studentId, dateStr, currentStatus, desiredStatus, recordSubject) => {
        let newStatus;
        if (desiredStatus) { newStatus = desiredStatus; }
        else if (!currentStatus) { newStatus = 'Present'; }
        else if (currentStatus === 'Present') { newStatus = 'Absent'; }
        else { newStatus = null; }

        if (!newStatus) { toast.error('Cannot remove attendance from here. Use the teacher panel.'); return; }

        let effectiveSubject = 'day_wise';
        if (attendanceType === 'subject_wise') effectiveSubject = selectedSubject || recordSubject || 'day_wise';

        try {
            const res = await axios.put(`${API_URL}/api/admin/student-attendance`, {
                studentId, date: dateStr, status: newStatus, subject: effectiveSubject
            }, { headers });

            if (res.data.success) {
                setReportData(prev => {
                    const updated = [...prev];
                    const existingIdx = updated.findIndex(e =>
                        e.student_id === studentId &&
                        e.date && format(parseISO(e.date), 'yyyy-MM-dd') === dateStr &&
                        (e.subject || 'day_wise').trim().toLowerCase() === effectiveSubject.trim().toLowerCase()
                    );
                    if (existingIdx >= 0) {
                        updated[existingIdx] = { ...updated[existingIdx], status: newStatus, subject: effectiveSubject };
                    } else {
                        const studentEntry = updated.find(e => e.student_id === studentId);
                        if (studentEntry) updated.push({ ...studentEntry, date: dateStr, status: newStatus, subject: effectiveSubject });
                    }
                    return updated;
                });
                toast.success(`Marked ${newStatus}`);
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance');
        }
    };

    useEffect(() => { fetchReport(); }, [date, viewMode, currentPeriodStart, selectedClass, selectedSection, selectedStream, selectedSubject, attendanceType]);

    useEffect(() => {
        setCurrentPage(1);
    }, [date, viewMode, currentPeriodStart, selectedClass, selectedSection, selectedStream, selectedSubject, attendanceType, searchTerm]);

    const isHolidayDate = React.useCallback((dateVal) => {
        try {
            const dateStr = typeof dateVal === 'string' ? dateVal : format(dateVal, 'yyyy-MM-dd');
            const dateObj = parseISO(dateStr);
            if (isNaN(dateObj.getTime())) return false;

            // 1. Check custom holidays table (range check)
            if (holidays && holidays.length > 0) {
                const match = holidays.find(h => {
                    const start = new Date(h.start_date); start.setHours(0, 0, 0, 0);
                    const end = h.end_date ? new Date(h.end_date) : new Date(h.start_date);
                    end.setHours(23, 59, 59, 999);
                    return dateObj >= start && dateObj <= end;
                });
                if (match) return true;
            }

            // 2. Check weekly schedule
            const dayIndex = dateObj.getDay(); // 0=Sun, 1=Mon, etc.
            const schedule = (weeklySchedule || []).find(s => Number(s.day_of_week) === dayIndex);
            if (schedule) {
                const isWorking = schedule.is_working === 1 || schedule.is_working === true || String(schedule.is_working) === '1' || String(schedule.is_working) === 'true';
                if (!isWorking) return true;
            } else {
                if (dayIndex === 0) return true; // Default Sunday
            }
        } catch (e) {
            console.error("isHolidayDate error:", e);
        }
        return false;
    }, [holidays, weeklySchedule]);

    const days = useMemo(() => {
        if (viewMode === 'daily') return [parseISO(date)];
        let start, end;
        if (viewMode === 'weekly') { start = startOfWeek(currentPeriodStart, { weekStartsOn: 1 }); end = endOfWeek(currentPeriodStart, { weekStartsOn: 1 }); }
        else if (viewMode === 'monthly') { start = startOfMonth(currentPeriodStart); end = endOfMonth(currentPeriodStart); }
        else if (viewMode === 'yearly') { start = startOfYear(currentPeriodStart); end = endOfYear(currentPeriodStart); }
        else return [];
        return eachDayOfInterval({ start, end });
    }, [viewMode, currentPeriodStart, date]);

    const months = useMemo(() => {
        if (viewMode !== 'yearly') return [];
        return eachMonthOfInterval({ start: startOfYear(currentPeriodStart), end: endOfYear(currentPeriodStart) });
    }, [viewMode, currentPeriodStart]);

    const processedReport = useMemo(() => {
        if (attendanceType === 'subject_wise' && !selectedSubject) {
            const studentSubjectGroups = {};
            reportData.forEach(entry => {
                const subj = entry.subject || 'Unknown';
                if (subj === 'day_wise') return;
                const groupKey = `${entry.student_id}_${subj}`;
                if (!studentSubjectGroups[groupKey]) {
                    studentSubjectGroups[groupKey] = { student_id: entry.student_id, name: entry.name, roll_no: entry.roll_no, class: entry.class, section: entry.section, stream_id: entry.stream_id, subjectName: subj, attendance: {} };
                }
                if (entry.date) {
                    const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
                    studentSubjectGroups[groupKey].attendance[dateKey] = { status: entry.status, subject: subj, marker_name: entry.marker_name || 'Unknown' };
                }
            });
            const result = Object.values(studentSubjectGroups);
            const filteredResult = searchTerm 
                ? result.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.roll_no && s.roll_no.toString().includes(searchTerm.toLowerCase())) || s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
                : result;

            // Sort by class, section, then roll number numerically
            const sorted = filteredResult.sort((a, b) => {
                const classA = String(a.class || '');
                const classB = String(b.class || '');
                const classComp = classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
                if (classComp !== 0) return classComp;

                const secA = String(a.section || '');
                const secB = String(b.section || '');
                const secComp = secA.localeCompare(secB);
                if (secComp !== 0) return secComp;

                return (parseInt(a.roll_no) || 0) - (parseInt(b.roll_no) || 0);
            });

            // Palette of deeper light colors for full row emphasis
            const classPalette = [
                'bg-blue-100',
                'bg-rose-100',
                'bg-emerald-100',
                'bg-amber-100',
                'bg-purple-100',
                'bg-cyan-100',
                'bg-orange-100',
                'bg-indigo-100'
            ];

            let colorIdx = -1;
            let lastGroup = null;
            return sorted.map(s => {
                const group = `${s.class}-${s.section}`;
                if (group !== lastGroup) {
                    colorIdx = (colorIdx + 1) % classPalette.length;
                    lastGroup = group;
                }
                return { ...s, classColorClass: classPalette[colorIdx] };
            });
        }

        const studentGroups = {};
        reportData.forEach(entry => {
            if (!studentGroups[entry.student_id]) {
                studentGroups[entry.student_id] = {
                    student_id: entry.student_id,
                    name: entry.name,
                    roll_no: entry.roll_no,
                    class: entry.class,
                    section: entry.section,
                    stream_id: entry.stream_id,
                    subjectName: attendanceType === 'subject_wise' ? (selectedSubject || 'Multiple') : null,
                    attendance: {}
                };
            }
            if (entry.date) {
                const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
                if (!studentGroups[entry.student_id].attendance[dateKey] || entry.status === 'Present') {
                    studentGroups[entry.student_id].attendance[dateKey] = { status: entry.status, subject: entry.subject || null, marker_name: entry.marker_name || 'Unknown' };
                }
            }
        });

        const result = Object.values(studentGroups);
        const filteredResult = searchTerm 
            ? result.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.roll_no && s.roll_no.toString().includes(searchTerm.toLowerCase())))
            : result;

        // Sort by class, section, then roll number numerically
        const sorted = filteredResult.sort((a, b) => {
            const classA = String(a.class || '');
            const classB = String(b.class || '');
            const classComp = classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
            if (classComp !== 0) return classComp;

            const secA = String(a.section || '');
            const secB = String(b.section || '');
            const secComp = secA.localeCompare(secB);
            if (secComp !== 0) return secComp;

            return (parseInt(a.roll_no) || 0) - (parseInt(b.roll_no) || 0);
        });

        // Palette of deeper light colors for full row emphasis
        const classPalette = [
            'bg-blue-100',
            'bg-rose-100',
            'bg-emerald-100',
            'bg-amber-100',
            'bg-purple-100',
            'bg-cyan-100',
            'bg-orange-100',
            'bg-indigo-100'
        ];

        let colorIdx = -1;
        let lastGroup = null;
        return sorted.map(s => {
            const group = `${s.class}-${s.section}`;
            if (group !== lastGroup) {
                colorIdx = (colorIdx + 1) % classPalette.length;
                lastGroup = group;
            }
            return { ...s, classColorClass: classPalette[colorIdx] };
        });
    }, [reportData, searchTerm, attendanceType, selectedSubject]);

    const navigatePeriod = (direction) => {
        if (viewMode === 'weekly') setCurrentPeriodStart(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
        else if (viewMode === 'monthly') setCurrentPeriodStart(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
        else if (viewMode === 'yearly') setCurrentPeriodStart(prev => direction === 'next' ? addYears(prev, 1) : subYears(prev, 1));
    };

    const stats = useMemo(() => {
        let p = 0, a = 0, h = 0;
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        processedReport.forEach(s => {
            days.forEach(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const entry = s.attendance[dateKey];
                const isHoliday = isHolidayDate(dateKey);

                if (entry && entry.status === 'Present') {
                    p++;
                } else if (isHoliday) {
                    h++;
                } else if (dateKey <= todayStr) {
                    // Not holiday, not future, no present record -> Count as Absent
                    a++;
                }
            });
        });
        return { totalStudents: processedReport.length, present: p, absent: a, holiday: h };
    }, [processedReport, days, isHolidayDate]);

    const totalPages = Math.ceil(processedReport.length / itemsPerPage);
    const paginatedReport = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedReport.slice(start, start + itemsPerPage);
    }, [processedReport, currentPage, itemsPerPage]);

    const exportToPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF(viewMode === 'daily' ? 'p' : 'l');
        const title = `${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Student Attendance Report`;
        doc.setFontSize(20);
        doc.text(title, 14, 22);
        doc.setFontSize(12);
        let periodText = '';
        if (viewMode === 'daily') periodText = `Date: ${format(new Date(date), 'dd MMM yyyy')}`;
        else if (viewMode === 'weekly') periodText = `Week: ${format(days[0], 'dd MMM')} - ${format(days[days.length - 1], 'dd MMM yyyy')}`;
        else if (viewMode === 'monthly') periodText = `Month: ${format(currentPeriodStart, 'MMMM yyyy')}`;
        else periodText = `Year: ${format(currentPeriodStart, 'yyyy')}`;
        doc.text(periodText, 14, 30);
        let filterText = '';
        if (selectedClass) filterText += `Class: ${selectedClass} `;
        if (selectedStream) filterText += `Group: ${streams.find(s => String(s.id) === String(selectedStream))?.name || ''} `;
        if (selectedSection) filterText += `Section: ${selectedSection} `;
        if (selectedSubject) filterText += `Subject: ${selectedSubject}`;
        if (filterText) doc.text(filterText, 14, 37);

        let tableColumn, tableRows;
        if (viewMode === 'yearly') {
            tableColumn = ["Roll No", "Name", ...months.map(m => format(m, 'MMM'))];
            tableRows = processedReport.map(s => [
                s.roll_no || '-', s.name,
                ...months.map(m => {
                    const monthStr = format(m, 'yyyy-MM');
                    const monthDays = Object.keys(s.attendance).filter(d => d.startsWith(monthStr));
                    const presentCount = monthDays.filter(d => s.attendance[d] && s.attendance[d].status === 'Present').length;
                    return presentCount > 0 ? presentCount : '-';
                })
            ]);
        } else {
            tableColumn = ["Roll No", "Name", ...days.map(d => format(d, 'dd/MM'))];
            tableRows = processedReport.map(s => [
                s.roll_no || '-', s.name,
                ...days.map(d => {
                    const dateKey = format(d, 'yyyy-MM-dd');
                    const entry = s.attendance[dateKey];
                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                    if (entry?.status) return entry.status.charAt(0);
                    if (isHolidayDate(dateKey)) return 'H';
                    if (dateKey <= todayStr) return 'A';
                    return '-';
                })
            ]);
        }


        autoTable(doc, { head: [tableColumn], body: tableRows, startY: selectedClass ? 45 : 40, theme: 'grid', styles: { fontSize: (viewMode === 'monthly' || viewMode === 'yearly') ? 7 : 9 }, headStyles: { fillColor: [79, 70, 229] } });
        doc.save(`Student_Attendance_${viewMode}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    };

    const exportToExcel = async () => {
        const XLSX = await import('xlsx');
        const data = processedReport.map(s => {
            const studentData = { 'Roll No': s.roll_no || '-', 'Name': s.name };
            if (viewMode === 'yearly') {
                months.forEach(m => {
                    const monthStr = format(m, 'yyyy-MM');
                    const monthDays = Object.keys(s.attendance).filter(d => d.startsWith(monthStr));
                    const presentCount = monthDays.filter(d => s.attendance[d] && s.attendance[d].status === 'Present').length;
                    studentData[format(m, 'MMM yyyy')] = presentCount;
                });
            } else {
                days.forEach(d => {
                    const dateKey = format(d, 'yyyy-MM-dd');
                    const entry = s.attendance[dateKey];
                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                    studentData[format(d, 'dd MMM')] = entry ? entry.status : (isHolidayDate(dateKey) ? 'Holiday' : (dateKey <= todayStr ? 'Absent' : '-'));
                });
            }
            return studentData;
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Student_Attendance_${viewMode}.xlsx`);
    };

    return (
        <div className="p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Student Attendance Report
                </h1>
                <p className="text-slate-500 mt-0.5 text-xs">Check and download student attendance records</p>
            </div>

            {/* Sticky Period Selector and Search Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md py-2 -mx-2 px-2 sm:-mx-3 sm:px-3 lg:-mx-4 lg:px-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-all">
                <div className="flex bg-slate-100 p-0.5 rounded-lg md:rounded-xl border border-slate-300">
                    {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((mode) => (
                        <button key={mode} onClick={() => setViewMode(mode.toLowerCase())}
                            className={`px-2 md:px-4 py-1 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${viewMode === mode.toLowerCase() ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {mode}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-sm border border-slate-300 w-full sm:w-64">
                    <span className="text-slate-400 text-xs md:text-sm">🔍</span>
                    <input type="text" placeholder="Search name or roll no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs md:text-sm text-slate-700 w-full p-0" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto sm:inline-flex">
                <button onClick={() => handleTabSwitch('day_wise')}
                    className={`flex-1 sm:flex-none px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${attendanceType === 'day_wise' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                    📅 Day-wise <span className="hidden sm:inline">(Class 1-10)</span>
                </button>
                <button onClick={() => handleTabSwitch('subject_wise')}
                    className={`flex-1 sm:flex-none px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${attendanceType === 'subject_wise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                    📚 Subject-wise <span className="hidden sm:inline">(Class 11-12)</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1 bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-sm border border-slate-300">
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-medium text-slate-700 outline-none p-0 pr-6">
                        <option value="">All Classes</option>
                        {filteredClasses.map(c => (<option key={c.id} value={c.class_number || c.name}>{c.name || `Class ${c.class_number}`}</option>))}
                    </select>
                </div>
                {attendanceType === 'subject_wise' && isHS && (
                    <div className="flex items-center gap-1 bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-sm border border-slate-300">
                        <select value={selectedStream} onChange={(e) => setSelectedStream(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-medium text-slate-700 outline-none p-0 pr-6">
                            <option value="">All Groups</option>
                            {streams.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </select>
                    </div>
                )}
                <div className="flex items-center gap-1 bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-sm border border-slate-300">
                    <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-medium text-slate-700 outline-none p-0 pr-6"
                        disabled={!selectedClass || (attendanceType === 'subject_wise' && isHS && !selectedStream)}>
                        <option value="">All Sections</option>
                        {sections.map((s, i) => (<option key={`sec-${s.id || i}`} value={s.code}>{s.section_name || s.name || s.code}</option>))}
                    </select>
                </div>
                {attendanceType === 'subject_wise' && (
                    <div className="flex items-center gap-1 bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-sm border border-purple-300">
                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-medium text-slate-700 outline-none p-0 pr-6" disabled={!selectedClass}>
                            <option value="">Select Subject</option>
                            {subjectsList.map((s, i) => (<option key={`sub-${s.id || i}`} value={s.name}>{s.name}</option>))}
                        </select>
                    </div>
                )}
                <div className="flex items-center gap-1 bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-sm border border-slate-300">
                    {viewMode === 'daily' ? (
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-slate-700 font-medium text-xs md:text-sm p-0 px-2 outline-none"
                            max={format(new Date(), 'yyyy-MM-dd')} />
                    ) : (
                        <div className="flex items-center gap-2 md:gap-4 px-1 md:px-2 min-w-[150px] md:min-w-[200px] justify-between">
                            <button onClick={() => navigatePeriod('prev')} className="p-0.5 hover:bg-slate-100 rounded-lg text-xs md:text-sm">⬅️</button>
                            <span className="text-xs md:text-sm font-bold text-slate-700 whitespace-nowrap">
                                {viewMode === 'weekly' ? `${format(days[0], 'dd MMM')} - ${format(days[days.length - 1], 'dd MMM')}`
                                    : viewMode === 'monthly' ? format(currentPeriodStart, 'MMMM yyyy')
                                        : format(currentPeriodStart, 'yyyy')}
                            </span>
                            <button onClick={() => navigatePeriod('next')} className="p-0.5 hover:bg-slate-100 rounded-lg text-xs md:text-sm">➡️</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stat Cards - Only shown in Daily view as requested */}
            {viewMode === 'daily' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    <StatCard title="Total Students" value={stats.totalStudents} icon="👥" color="bg-blue-50 text-blue-600" borderColor="border-slate-300" />
                    <StatCard title="Total Present" value={stats.present} icon="✅" color="bg-emerald-500 text-white" borderColor="border-emerald-100" isStatus />
                    <StatCard title="Total Absent" value={stats.absent} icon="❌" color="bg-red-500 text-white" borderColor="border-red-100" isStatus />
                    <StatCard title="Holidays" value={stats.holiday || 0} icon="🌴" color="bg-slate-500 text-white" borderColor="border-slate-200" isStatus />
                </div>
            )}


            {!searchTerm && (
                <>
                    {/* ── PERFORMANCE CHART (NEW) ── */}
                    <PerformanceCharts
                        processedReport={processedReport}
                        stats={stats}
                        days={days}
                        months={months}
                        viewMode={viewMode}
                        currentPeriodStart={currentPeriodStart}
                        isHolidayDate={isHolidayDate}
                    />

                    {/* Attendance Distribution Bar */}
                    {(stats.present > 0 || stats.absent > 0) && (
                        <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-6 rounded-xl sm:rounded-3xl border border-slate-300/60 shadow-md sm:shadow-lg shadow-slate-200/10 mb-3 sm:mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">📊 Attendance Distribution</h3>
                                <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">H Holiday</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Present</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Absent</span></div>
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
                                <div style={{ width: `${(stats.present / (stats.present + stats.absent)) * 100}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out" />
                                <div style={{ width: `${(stats.absent / (stats.present + stats.absent)) * 100}%` }} className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out" />
                            </div>
                            <div className="flex justify-between mt-2.5 px-1">
                                <span className="text-[10px] font-bold text-emerald-600">{((stats.present / (stats.present + stats.absent)) * 100).toFixed(1)}% Present</span>
                                <span className="text-[10px] font-bold text-red-600">{((stats.absent / (stats.present + stats.absent)) * 100).toFixed(1)}% Absent</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Report Table */}
            <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-300/60 shadow-md sm:shadow-xl shadow-slate-200/20">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-3xl overflow-hidden">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-slate-800">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Report</h2>
                        {viewMode !== 'yearly' && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-[11px] font-medium tracking-wide">
                                <span>💡</span> Click any cell to edit attendance
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all">
                            <span>📄 PDF</span>
                        </button>
                        <button onClick={exportToExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all">
                            <span>📊 Excel</span>
                        </button>
                    </div>
                </div>

                <div className="rounded-b-3xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            Loading attendance data...
                        </div>
                    ) : (
                        <ReportGridView processedReport={paginatedReport} days={days} months={months} viewMode={viewMode} onToggle={toggleAttendance} editPopup={editPopup} setEditPopup={setEditPopup} attendanceType={attendanceType} selectedSubject={selectedSubject} isHolidayDate={isHolidayDate} />
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="px-4 py-3 sm:px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-b-3xl">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">
                            Showing <span className="font-semibold text-slate-800">{Math.min(processedReport.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
                            <span className="font-semibold text-slate-800">{Math.min(processedReport.length, currentPage * itemsPerPage)}</span> of{' '}
                            <span className="font-semibold text-slate-800">{processedReport.length}</span> students
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                            >
                                ◀ Prev
                            </button>
                            {(() => {
                                const pages = [];
                                const maxVisible = 5;
                                if (totalPages <= maxVisible) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    if (currentPage <= 3) {
                                        for (let i = 1; i <= 4; i++) pages.push(i);
                                        pages.push('...');
                                        pages.push(totalPages);
                                    } else if (currentPage >= totalPages - 2) {
                                        pages.push(1);
                                        pages.push('...');
                                        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        pages.push('...');
                                        pages.push(currentPage - 1);
                                        pages.push(currentPage);
                                        pages.push(currentPage + 1);
                                        pages.push('...');
                                        pages.push(totalPages);
                                    }
                                }
                                return pages.map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs font-bold">...</span>
                                    ) : (
                                        <button
                                            key={`page-${p}`}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                                currentPage === p
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                                    : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ));
                            })()}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   STAT CARD (unchanged)
───────────────────────────────────────────── */
const StatCard = ({ title, value, icon, color, borderColor, isStatus }) => (
    <div className={`bg-white/80 backdrop-blur-xl p-3 sm:p-5 rounded-xl sm:rounded-2xl border ${borderColor} shadow-sm flex items-center justify-between relative overflow-hidden group`}>
        {isStatus && <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 ${color.split(' ')[0]} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>}
        <div className="relative z-10 min-w-0 flex-1">
            <p className={`text-[10px] sm:text-sm font-medium mb-0.5 truncate ${isStatus ? color.replace('bg-', 'text-').split(' ')[0] : 'text-slate-500'}`}>{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800 leading-none">{value}</p>
        </div>
        <div className={`relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-xl shrink-0 ml-2 ${color} ${isStatus ? 'shadow-lg' : 'shadow-inner border border-blue-100/50'}`}>{icon}</div>
    </div>
);

/* ─────────────────────────────────────────────
   REPORT GRID VIEW (unchanged)
───────────────────────────────────────────── */
const ReportGridView = ({ processedReport, days, months, viewMode, onToggle, editPopup, setEditPopup, attendanceType, selectedSubject, isHolidayDate }) => {
    const getStatusMarker = (status) => {
        switch (status) {
            case 'Present': return <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-[10px] flex items-center justify-center">P</span>;
            case 'Absent': return <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-red-100 text-red-700 font-bold text-xs sm:text-[10px] flex items-center justify-center">A</span>;
            case 'Half Day': return <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-amber-100 text-amber-700 font-bold text-xs sm:text-[10px] flex items-center justify-center">HD</span>;
            case 'Late': return <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-orange-100 text-orange-700 font-bold text-xs sm:text-[10px] flex items-center justify-center">L</span>;
            case 'Holiday': return <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-slate-100 text-slate-500 font-bold text-xs sm:text-[10px] flex items-center justify-center">H</span>;
            default: return <span className="text-slate-300 text-xs">-</span>;
        }
    };

    const columns = viewMode === 'yearly' ? months : days;

    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const headerScrollRef = React.useRef(null);
    const bodyScrollRef = React.useRef(null);

    const handleBodyScroll = (e) => {
        if (headerScrollRef.current) {
            headerScrollRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    const AttendancePopup = ({ studentId, studentName, dateStr, currentStatus, recordSubject, onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-[280px] mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">{studentName}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{dateStr}</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 text-xs">✕</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { onToggle(studentId, dateStr, currentStatus, 'Present', recordSubject); onClose(); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${currentStatus === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}>
                        ✓ Present
                    </button>
                    <button onClick={() => { onToggle(studentId, dateStr, currentStatus, 'Absent', recordSubject); onClose(); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${currentStatus === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}`}>
                        ✗ Absent
                    </button>
                </div>
            </div>
        </div>
    );

    if (viewMode === 'daily' && columns.length === 1) {
        const dateStr = format(columns[0], 'yyyy-MM-dd');
        return (
            <div>
                {editPopup && <AttendancePopup {...editPopup} onClose={() => setEditPopup(null)} />}
                <div className="px-4 sm:px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold uppercase leading-none">{format(columns[0], 'EEE')}</span>
                        <span className="text-sm font-bold leading-none">{format(columns[0], 'dd')}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{format(columns[0], 'dd MMMM yyyy')}</span>
                </div>
                <div className="flex bg-slate-100/50 border-b border-slate-200 px-4 sm:px-6 py-2 sticky top-[98px] sm:top-[54px] z-30 shadow-sm">
                    <div className="flex-1 text-xs font-bold text-slate-500 uppercase">Student Info</div>
                    {attendanceType === 'subject_wise' && <div className="w-28 text-center text-xs font-bold text-purple-500 uppercase border-l border-slate-200">Subject</div>}
                    <div className="w-16 text-center text-xs font-bold text-slate-500 uppercase border-l border-slate-200">Status</div>
                    <div className="w-16 text-center text-xs font-bold text-slate-500 uppercase border-l border-slate-200 ml-2">Action</div>
                </div>
                <div className="divide-y divide-slate-200 bg-white">
                    {processedReport.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No students found</div>
                    ) : (
                        processedReport.map(student => {
                            const entry = student.attendance[dateStr];
                            const isHoliday = isHolidayDate(dateStr);
                            const todayStr = format(new Date(), 'yyyy-MM-dd');
                            const status = entry ? entry.status : (isHoliday ? 'Holiday' : (dateStr <= todayStr ? 'Absent' : null));
                            const subjectName = entry ? entry.subject : null;
                            return (
                                <div key={`${student.student_id}_${student.subjectName || ''}`} className={`flex px-4 sm:px-6 py-2.5 ${student.classColorClass || 'bg-white'} hover:bg-slate-50 transition-colors group`}>
                                    <div className="flex-1 min-w-0 self-center">
                                        <div className="text-sm font-bold text-slate-800 truncate">{student.name}</div>
                                        <div className="text-[11px] text-slate-500">Roll: {student.roll_no || '-'} | Class: {student.class}-{student.section}</div>
                                    </div>
                                    {attendanceType === 'subject_wise' && (
                                        <div className="w-28 flex justify-center items-center border-l border-slate-200 group-hover:border-slate-300 transition-colors">
                                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[11px] font-bold border border-purple-200 truncate max-w-[100px]">
                                                {student.subjectName || (subjectName && subjectName !== 'day_wise' ? subjectName : '-')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="w-16 flex justify-center items-center border-l border-slate-200 group-hover:border-slate-300 transition-colors">{getStatusMarker(status)}</div>
                                    <div className="w-16 flex justify-center items-center border-l border-slate-200 group-hover:border-slate-300 transition-colors ml-2">
                                        {!isHoliday ? (
                                            <button onClick={() => setEditPopup({ studentId: student.student_id, studentName: student.name, dateStr, currentStatus: status, recordSubject: student.subjectName || subjectName })}
                                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 border border-blue-200 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all text-sm shadow-sm">✏️</button>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 font-bold">Holiday</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    const colCount = columns.length;
    const tableMinWidth = (isMobile ? 120 : 180) + (colCount * (isMobile ? 42 : 50)) + (attendanceType === 'subject_wise' ? 80 : 0) + (isMobile ? 90 : 110);

    const renderColGroup = () => (
        <colgroup>
            <col style={{ width: isMobile ? '120px' : '180px' }} />
            {attendanceType === 'subject_wise' && <col style={{ width: '80px' }} />}
            {columns.map(col => (
                <col key={col.toISOString()} style={{ width: isMobile ? '42px' : '50px' }} />
            ))}
            <col style={{ width: isMobile ? '90px' : '110px' }} />
        </colgroup>
    );

    return (
        <div className="flex flex-col w-full">
            {editPopup && <AttendancePopup {...editPopup} onClose={() => setEditPopup(null)} />}
            
            {/* Header Table Container - vertically sticky, horizontally scroll-synchronized */}
            <div 
                ref={headerScrollRef}
                className="overflow-hidden sticky top-[98px] sm:top-[54px] z-30 bg-slate-50 border-b border-slate-300 shadow-sm w-full"
            >
                <table className="w-full text-left border-separate border-spacing-0" style={{ minWidth: `${tableMinWidth}px`, tableLayout: 'fixed' }}>
                    {renderColGroup()}
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="py-3 px-3 sm:px-6 font-semibold text-slate-600 text-xs sm:text-sm sticky left-0 top-0 bg-slate-50 z-30 border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[120px] sm:min-w-[180px]">Student Info</th>
                            {attendanceType === 'subject_wise' && <th className="py-3 px-3 sm:px-4 font-semibold text-slate-600 text-[10px] sm:text-xs text-center border-b border-r border-slate-300 min-w-[80px] sticky top-0 bg-slate-50 z-20">Subject</th>}
                            {columns.map(col => (
                                <th key={col.toISOString()} className="py-2 px-1 text-center min-w-[42px] sm:min-w-[50px] border-b border-r border-slate-300 sticky top-0 bg-slate-50 z-20">
                                    {viewMode === 'yearly' ? (
                                        <div className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase">{format(col, 'MMM')}</div>
                                    ) : (
                                        <>
                                            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">{format(col, 'EEE')}</div>
                                            <div className={`text-xs sm:text-sm font-bold ${format(col, 'EEE') === 'Sun' ? 'text-red-500' : 'text-slate-700'}`}>{format(col, 'dd')}</div>
                                        </>
                                    )}
                                </th>
                            ))}
                            <th className="py-3 px-3 sm:px-4 font-semibold text-slate-600 text-xs sm:text-sm text-center border-b border-l border-slate-300 sticky right-0 top-0 bg-slate-50 z-30 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[90px] sm:min-w-[110px]">Summary (P/A)</th>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Body Table Container - horizontally scrollable, vertically normal page scroll */}
            <div 
                ref={bodyScrollRef}
                onScroll={handleBodyScroll}
                className="overflow-x-auto visible-scrollbar w-full"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <table className="w-full text-left border-separate border-spacing-0" style={{ minWidth: `${tableMinWidth}px`, tableLayout: 'fixed' }}>
                    {renderColGroup()}
                    <tbody>
                        {processedReport.length === 0 ? (
                            <tr><td colSpan={colCount + (attendanceType === 'subject_wise' ? 3 : 2)} className="p-8 text-center text-slate-400 text-sm">No students found</td></tr>
                        ) : (
                            processedReport.map(student => (
                                <tr key={`${student.student_id}_${student.subjectName || ''}`} className={`${student.classColorClass || 'bg-white'} hover:brightness-90 transition-all`}>
                                    <td className={`py-2.5 px-3 sm:px-6 font-medium text-slate-800 sticky left-0 ${student.classColorClass || 'bg-white'} z-10 border-r border-b border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[120px] sm:min-w-[180px]`}>
                                        <div className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-none">{student.name}</div>
                                        <div className="text-[9px] sm:text-[10px] text-slate-500 truncate max-w-[100px] sm:max-w-none">Roll: {student.roll_no || '-'} | {student.class}-{student.section}</div>
                                    </td>
                                    {attendanceType === 'subject_wise' && (
                                        <td className="py-2.5 px-2 font-medium text-center border-r border-b border-slate-300 min-w-[80px]">
                                            <span className="px-2 py-1 bg-white/60 text-purple-700 rounded-md text-[10px] sm:text-[11px] font-bold border border-purple-200 truncate max-w-[100px] inline-block">{student.subjectName || '-'}</span>
                                        </td>
                                    )}
                                    {columns.map(col => {
                                        if (viewMode === 'yearly') {
                                            const monthStr = format(col, 'yyyy-MM');
                                            const monthDays = Object.keys(student.attendance).filter(d => d.startsWith(monthStr));
                                            const presentCount = monthDays.filter(d => student.attendance[d] && student.attendance[d].status === 'Present').length;
                                            const totDays = monthDays.length;
                                            return (
                                                <td key={col.toISOString()} className="p-1 text-center border-r border-b border-slate-300 min-w-[42px] sm:min-w-[50px]">
                                                    {totDays > 0 ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] sm:text-xs font-bold text-emerald-600">{presentCount}/{totDays}</span>
                                                            <span className="text-[8px] sm:text-[9px] text-slate-400">{Math.round((presentCount / totDays) * 100)}%</span>
                                                        </div>
                                                    ) : <span className="text-slate-200 text-xs">-</span>}
                                                </td>
                                            );
                                        } else {
                                            const dateStr = format(col, 'yyyy-MM-dd');
                                            const entry = student.attendance[dateStr];
                                            const isHoliday = isHolidayDate(dateStr);
                                            const todayStr = format(new Date(), 'yyyy-MM-dd');
                                            const status = entry ? entry.status : (isHoliday ? 'Holiday' : (dateStr <= todayStr ? 'Absent' : null));
                                            return (
                                                <td key={dateStr} 
                                                    className={`p-1 text-center border-r border-b border-slate-300 transition-colors min-w-[42px] sm:min-w-[50px] ${!isHoliday ? 'cursor-pointer hover:bg-black/5' : 'bg-slate-400/10'}`}
                                                    onClick={() => {
                                                        if (!isHoliday) {
                                                            setEditPopup({ studentId: student.student_id, studentName: student.name, dateStr, currentStatus: status, recordSubject: student.subjectName || (entry ? entry.subject : null) });
                                                        }
                                                    }}>
                                                    <div className="flex items-center justify-center">{getStatusMarker(status)}</div>
                                                </td>
                                            );
                                        }
                                    })}
                                    {(() => {
                                        let presentCount = 0;
                                        let absentCount = 0;
                                        
                                        if (viewMode === 'yearly') {
                                            Object.keys(student.attendance).forEach(dateStr => {
                                                const entry = student.attendance[dateStr];
                                                if (entry) {
                                                    if (entry.status === 'Present' || entry.status === 'Late') {
                                                        presentCount++;
                                                    } else if (entry.status === 'Absent') {
                                                        absentCount++;
                                                    } else if (entry.status === 'Half Day') {
                                                        presentCount += 0.5;
                                                        absentCount += 0.5;
                                                    }
                                                }
                                            });
                                        } else {
                                            columns.forEach(col => {
                                                const dateStr = format(col, 'yyyy-MM-dd');
                                                const entry = student.attendance[dateStr];
                                                const isHoliday = isHolidayDate(dateStr);
                                                const todayStr = format(new Date(), 'yyyy-MM-dd');
                                                const status = entry ? entry.status : (isHoliday ? 'Holiday' : (dateStr <= todayStr ? 'Absent' : null));
                                                
                                                if (status === 'Present' || status === 'Late') {
                                                    presentCount++;
                                                } else if (status === 'Absent') {
                                                    absentCount++;
                                                } else if (status === 'Half Day') {
                                                    presentCount += 0.5;
                                                    absentCount += 0.5;
                                                }
                                            });
                                        }

                                        return (
                                            <td className={`py-2.5 px-2 font-semibold text-center border-l border-b border-slate-300 sticky right-0 ${student.classColorClass || 'bg-white'} z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[90px] sm:min-w-[110px]`}>
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] sm:text-xs">
                                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200" title="Total Present">
                                                        P: <span className="font-bold">{presentCount}</span>
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-200" title="Total Absent">
                                                        A: <span className="font-bold">{absentCount}</span>
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    })()}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentAttendanceReport;

