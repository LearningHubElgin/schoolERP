import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../productionLink/productionLink';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const ActivityLogs = () => {
  // ── State ──
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [moduleDist, setModuleDist] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    school_id: '',
    module_name: '',
    action: '',
    status: '',
    severity: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'id',
    sortOrder: 'DESC'
  });

  // Modal inspection
  const [selectedLog, setSelectedLog] = useState(null);
  const [inspectTab, setInspectTab] = useState('overview'); // 'overview' | 'diff'
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);
  const [cleaning, setCleaning] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const userRole = localStorage.getItem('role') || 'admin';

  // Expandable Row Diff State
  const [expandedLogIds, setExpandedLogIds] = useState(new Set());

  const toggleExpandRow = (id) => {
    setExpandedLogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasChanges = (log) => {
    if (!log) return false;
    const hasChangedArr = Array.isArray(log.changed_fields) && log.changed_fields.length > 0;
    if (hasChangedArr) return true;

    if (log.old_value && log.new_value) {
      return JSON.stringify(log.old_value) !== JSON.stringify(log.new_value);
    }
    return false;
  };

  // Format date parts separately for display
  const formatDateParts = (dateVal) => {
    if (!dateVal) return { date: '-', time: '' };
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return { date: String(dateVal), time: '' };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hStr = String(hours).padStart(2, '0');
      return {
        date: `${day}-${month}-${year}`,
        time: `${hStr}:${minutes}:${seconds} ${ampm}`
      };
    } catch (e) {
      return { date: String(dateVal), time: '' };
    }
  };

  // Legacy single-string format (used elsewhere)
  const formatDateDDMMYYYY = (dateVal) => {
    const { date, time } = formatDateParts(dateVal);
    return time ? `${date} ${time}` : date;
  };

  const formatDayDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // ── Fetch Initial Data ──
  useEffect(() => {
    fetchLogs(1);
    fetchSummary();
    fetchFilterOptions();
  }, []);

  // Fetch Logs when filters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchLogs = async (targetPage = pagination.page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: targetPage,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.school_id && { school_id: filters.school_id }),
        ...(filters.module_name && { module_name: filters.module_name }),
        ...(filters.action && { action: filters.action }),
        ...(filters.status && { status: filters.status }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search.trim() })
      });

      const res = await fetch(`${API_BASE}/api/activity-logs?${queryParams.toString()}`, { headers });
      const data = await res.json();

      if (data.success) {
        setLogs(data.data || []);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/activity-logs/summary`, { headers });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setTimeline(data.timeline || []);
        setModuleDist(data.moduleDistribution || []);
      }
    } catch (err) {
      console.error('Fetch summary error:', err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [modRes, actRes] = await Promise.all([
        fetch(`${API_BASE}/api/activity-logs/modules`, { headers }),
        fetch(`${API_BASE}/api/activity-logs/actions`, { headers })
      ]);
      const modData = await modRes.json();
      const actData = await actRes.json();
      if (modData.success) setAvailableModules(modData.modules || []);
      if (actData.success) setAvailableActions(actData.actions || []);

      if (userRole === 'superadmin') {
        try {
          const sRes = await fetch(`${API_BASE}/api/superadmin/schools`, { headers });
          const sData = await sRes.json();
          if (sData.success) setSchoolsList(sData.schools || sData.data || []);
        } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Filter options fetch error:', err);
    }
  };

  // ── Reset Filters ──
  const resetFilters = () => {
    setFilters({
      module_name: '',
      action: '',
      status: '',
      severity: '',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'id',
      sortOrder: 'DESC'
    });
  };

  // ── Handle Export ──
  const handleExportCSV = async () => {
    try {
      toast.loading('Exporting Audit Trail to CSV...');
      const res = await fetch(`${API_BASE}/api/activity-logs/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          format: 'csv',
          module_name: filters.module_name,
          action: filters.action,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate
        })
      });
      const blob = await res.blob();
      toast.dismiss();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Trail_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV Export downloaded!');
    } catch (err) {
      toast.dismiss();
      toast.error('Export failed');
    }
  };

  // ── Handle Retention Cleanup ──
  const handleCleanup = async () => {
    setCleaning(true);
    try {
      const res = await fetch(`${API_BASE}/api/activity-logs/cleanup`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days: cleanupDays })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowCleanupModal(false);
        fetchLogs(1);
        fetchSummary();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Cleanup error');
    } finally {
      setCleaning(false);
    }
  };

  // ── Severity Badge Helper ──
  const renderSeverityBadge = (severity) => {
    const s = (severity || 'info').toLowerCase();
    const cfg = {
      info: 'bg-blue-50 text-blue-700 border-blue-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      error: 'bg-red-50 text-red-700 border-red-200',
      critical: 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg[s] || cfg.info}`}>
        {s.toUpperCase()}
      </span>
    );
  };

  // ── Status Badge Helper ──
  const renderStatusBadge = (status) => {
    const isSuccess = status === 'success';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 w-fit ${isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
        {isSuccess ? 'Success' : 'Failed'}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* ── Page Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-500/20 backdrop-blur-md rounded-2xl border border-indigo-400/30 text-indigo-300 text-xl">
                🛡️
              </span>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  System Audit Trail & Activity Logs
                </h1>
                <p className="text-slate-300 text-xs md:text-sm mt-0.5 font-medium">
                  Centralized real-time audit logging across all modules, transactions, and security actions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-emerald-900/30 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
            >
              📊 Export CSV
            </button>
            {userRole === 'superadmin' && (
              <button
                onClick={() => setShowCleanupModal(true)}
                className="px-4 py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-rose-900/30 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
              >
                🧹 Retention & Cleanup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Stats Grid ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Today's Logs", value: summary.todayActivities, icon: '⚡', bg: 'bg-indigo-50/70', border: 'border-indigo-100', text: 'text-indigo-700' },
            { label: 'Total Records', value: summary.totalActivities, icon: '📋', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' },
            { label: 'Successful', value: summary.successfulActions, icon: '✅', bg: 'bg-emerald-50/70', border: 'border-emerald-100', text: 'text-emerald-700' },
            { label: 'Failed Actions', value: summary.failedActions, icon: '❌', bg: 'bg-rose-50/70', border: 'border-rose-100', text: 'text-rose-700' },
            { label: 'Top Active User', value: summary.mostActiveUser, icon: '👤', bg: 'bg-violet-50/70', border: 'border-violet-100', text: 'text-violet-700', isText: true },
            { label: 'Top Module', value: summary.mostActiveModule, icon: '📦', bg: 'bg-amber-50/70', border: 'border-amber-100', text: 'text-amber-700', isText: true }
          ].map((item, idx) => (
            <div key={idx} className={`${item.bg} ${item.border} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{item.icon}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
              </div>
              <div className={`font-black ${item.isText ? 'text-xs truncate' : 'text-xl'} ${item.text}`} title={String(item.value)}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Visual Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Distribution Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Module Activity Breakdown
          </h2>
          <div className="space-y-3">
            {moduleDist.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No module breakdown data yet</p>
            ) : (
              moduleDist.slice(0, 6).map((m) => {
                const total = summary?.totalActivities || 1;
                const pct = Math.round((m.count / total) * 100);
                return (
                  <div key={m.module_name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{m.module_name}</span>
                      <span className="text-slate-500">{m.count} logs ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Timeline Quick Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              7-Day Activity Trend
            </h2>
            <div className="space-y-2.5">
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No timeline records</p>
              ) : (
                timeline.map(t => (
                  <div key={t.date} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-600">{formatDayDDMMYYYY(t.date)}</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{t.count} logs</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
            🔒 Logs are immutable & system indexed
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Global Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by entity name, user, description, IP, URL..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm font-medium transition-all"
            />
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex-shrink-0"
          >
            🔄 Reset Filters
          </button>
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {userRole === 'superadmin' && (
            <div>
              <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">School</label>
              <select
                value={filters.school_id}
                onChange={e => setFilters({ ...filters, school_id: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-xl bg-indigo-50/50 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Schools</option>
                {schoolsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.school_name || `School #${s.id}`}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Module</label>
            <select
              value={filters.module_name}
              onChange={e => setFilters({ ...filters, module_name: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Modules</option>
              {availableModules.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Action</label>
            <select
              value={filters.action}
              onChange={e => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Actions</option>
              {availableActions.map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={e => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Severities</option>
              <option value="info">INFO</option>
              <option value="warning">WARNING</option>
              <option value="error">ERROR</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-xs font-semibold text-slate-500">Loading audit trail records...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">📭</span>
            <h3 className="mt-3 text-sm font-bold text-slate-700">No Activity Logs Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[56px_110px_1fr_1fr_1.8fr_1fr_80px_80px_90px] gap-x-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div># ID</div>
              <div>Timestamp</div>
              <div>Module / Action</div>
              <div>Performed By</div>
              <div>Description / Target</div>
              <div>IP &amp; OS</div>
              <div className="text-center">Status</div>
              <div className="text-center">Severity</div>
              <div className="text-center">Inspect</div>
            </div>

            {logs.map((log) => {
              const logHasChanges = hasChanges(log);
              const isExpanded = expandedLogIds.has(log.id);
              const { date, time } = formatDateParts(log.created_at);

              return (
                <React.Fragment key={log.id}>
                  {/* ── Desktop Row ── */}
                  <div className={`hidden md:grid grid-cols-[56px_110px_1fr_1fr_1.8fr_1fr_80px_80px_90px] gap-x-3 px-4 py-3 items-start hover:bg-slate-50/70 transition-colors text-xs ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                    {/* ID + Diff */}
                    <div className="flex flex-col items-start gap-1 pt-0.5">
                      {logHasChanges && (
                        <button
                          onClick={() => toggleExpandRow(log.id)}
                          className={`px-1.5 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-0.5 transition-all active:scale-95 ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'}`}
                          title={isExpanded ? "Collapse diff" : "View changes diff"}
                        >
                          <span className={`transition-transform duration-200 inline-block ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                          Diff
                        </button>
                      )}
                      <span className="font-mono font-bold text-slate-400 text-[11px]">#{log.id}</span>
                    </div>
                    {/* Timestamp */}
                    <div>
                      <div className="font-semibold text-slate-700">{date}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{time}</div>
                    </div>
                    {/* Module / Action */}
                    <div>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 text-[10px] inline-block mb-1">{log.module_name}</span>
                      <div className="font-bold text-slate-800 text-[11px]">{log.action}</div>
                    </div>
                    {/* Performed By */}
                    <div>
                      <div className="font-bold text-slate-800 break-words">{log.performed_by_name || 'System'}</div>
                      <div className="text-[10px] text-slate-400 capitalize mt-0.5">{log.performed_by_role || 'system'}</div>
                    </div>
                    {/* Description / Target */}
                    <div className="break-words leading-relaxed">
                      <div className="font-medium text-slate-700">{log.description || log.entity_name || '-'}</div>
                      {log.entity_name && log.description && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Target: {log.entity_name}</div>
                      )}
                    </div>
                    {/* IP & OS */}
                    <div>
                      <div className="font-mono font-bold text-slate-700 text-[11px]">{log.ip_address || '-'}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5 flex-wrap">
                        <span>{log.device === 'Mobile' ? '📱' : log.device === 'Tablet' ? '📟' : '💻'}</span>
                        <span className="font-semibold">{log.browser || 'Browser'}</span>
                        <span className="text-slate-300">•</span>
                        <span>{log.operating_system || log.device || 'Desktop'}</span>
                      </div>
                    </div>
                    {/* Status */}
                    <div className="flex justify-center pt-0.5">{renderStatusBadge(log.status)}</div>
                    {/* Severity */}
                    <div className="flex justify-center pt-0.5">{renderSeverityBadge(log.severity)}</div>
                    {/* Inspect */}
                    <div className="flex justify-center pt-0.5">
                      <button
                        onClick={() => { setSelectedLog(log); setInspectTab('overview'); }}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-lg font-bold text-[10px] transition-all border border-slate-200 active:scale-95 whitespace-nowrap"
                      >
                        🔍 Details
                      </button>
                    </div>
                  </div>

                  {/* ── Mobile Card ── */}
                  <div className={`md:hidden p-4 space-y-2.5 ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-400 text-xs">#{log.id}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 text-[10px]">{log.module_name}</span>
                        {renderStatusBadge(log.status)}
                        {renderSeverityBadge(log.severity)}
                      </div>
                      <button
                        onClick={() => { setSelectedLog(log); setInspectTab('overview'); }}
                        className="flex-shrink-0 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition-all active:scale-95"
                      >
                        🔍 Details
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{date}</span>
                      <span className="font-mono text-slate-400">{time}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs">{log.action}</span>
                      <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{log.description || log.entity_name || '-'}</div>
                      {log.entity_name && log.description && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Target: {log.entity_name}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span><span className="font-bold text-slate-700">{log.performed_by_name || 'System'}</span> · {log.performed_by_role || 'system'}</span>
                      <span className="font-mono">{log.ip_address || '-'}</span>
                    </div>
                    {logHasChanges && (
                      <button
                        onClick={() => toggleExpandRow(log.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
                      >
                        {isExpanded ? '▼ Hide Diff' : '▶ View Diff'}
                      </button>
                    )}
                  </div>

                  {/* ── Expandable Diff Panel ── */}
                  {isExpanded && (
                    <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/30 to-indigo-50/80 border-b border-indigo-200 px-4 pb-4">
                      <div className="space-y-3 bg-white/95 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 bg-indigo-100 text-indigo-700 rounded-md text-xs">🔄</span>
                            <h4 className="font-bold text-slate-800 text-xs">Data Changes (Log #{log.id} • {log.action})</h4>
                          </div>
                          {log.changed_fields && log.changed_fields.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Changed:</span>
                              {log.changed_fields.map((field) => (
                                <span key={field} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-md text-[10px] border border-indigo-200">✏️ {field}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3.5">
                            <div className="font-bold text-rose-800 text-[11px] pb-1.5 mb-1.5 border-b border-rose-200/60">🔴 Before (Old Data)</div>
                            <pre className="text-rose-950 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed">
                              {log.old_value && Object.keys(log.old_value).length > 0 ? JSON.stringify(log.old_value, null, 2) : '// No previous data'}
                            </pre>
                          </div>
                          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3.5">
                            <div className="font-bold text-emerald-800 text-[11px] pb-1.5 mb-1.5 border-b border-emerald-200/60">🟢 After (New Data)</div>
                            <pre className="text-emerald-950 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed">
                              {log.new_value && Object.keys(log.new_value).length > 0 ? JSON.stringify(log.new_value, null, 2) : '// No new data'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ── Pagination Footer ── */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-800">{pagination.page}</span> of <span className="font-bold text-slate-800">{pagination.totalPages}</span> ({pagination.totalRecords} total activity logs)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-xs font-bold px-2 text-slate-700">{pagination.page}</span>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── Inspection Details Modal ── */}
      {selectedLog && createPortal(
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                    Log #{selectedLog.id}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedLog.action}</h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{selectedLog.module_name} Module • {formatDateDDMMYYYY(selectedLog.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-4">
              <button
                onClick={() => setInspectTab('overview')}
                className={`py-3 text-xs font-bold border-b-2 transition-all ${inspectTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                📋 Overview & Request Metadata
              </button>
              <button
                onClick={() => setInspectTab('diff')}
                className={`py-3 text-xs font-bold border-b-2 transition-all ${inspectTab === 'diff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                🔄 Before / After JSON Diff
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {inspectTab === 'overview' ? (
                <div className="space-y-4">
                  {/* Grid details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Performed By</span>
                      <p className="font-bold text-slate-800">{selectedLog.performed_by_name || 'System'}</p>
                      <p className="text-[10px] text-slate-500">ID: {selectedLog.performed_by_user_id} • Role: {selectedLog.performed_by_role}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Status & Severity</span>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStatusBadge(selectedLog.status)}
                        {renderSeverityBadge(selectedLog.severity)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Device & Browser Details</span>
                      <p className="font-mono font-semibold text-slate-800">{selectedLog.ip_address || '-'}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                          {selectedLog.device === 'Mobile' ? '📱 Mobile' : selectedLog.device === 'Tablet' ? '📟 Tablet' : '💻 Desktop'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                          🌐 {selectedLog.browser || 'Web Browser'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-100">
                          ⚙️ {selectedLog.operating_system || 'OS'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Target Entity</span>
                      <p className="font-bold text-slate-800">{selectedLog.entity_name || selectedLog.entity_type || '-'}</p>
                      <p className="text-[10px] text-slate-500">Type: {selectedLog.entity_type || '-'} | ID: {selectedLog.entity_id || '-'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">HTTP Request</span>
                      <p className="font-mono font-semibold text-slate-700">{selectedLog.request_method || 'GET'} {selectedLog.request_url || '-'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Execution Time</span>
                      <p className="font-semibold text-slate-700">{selectedLog.execution_time ? `${selectedLog.execution_time} ms` : '-'}</p>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">Description</h4>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium leading-relaxed">
                      {selectedLog.description || 'No description provided.'}
                    </div>
                  </div>

                  {/* Failure reason if present */}
                  {selectedLog.failure_reason && (
                    <div>
                      <h4 className="font-bold text-rose-700 mb-1">Failure Reason</h4>
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 font-medium">
                        {selectedLog.failure_reason}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Changed Fields Tags */}
                  {selectedLog.changed_fields && selectedLog.changed_fields.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1.5">Fields Changed ({selectedLog.changed_fields.length})</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLog.changed_fields.map((f) => (
                          <span key={f} className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg text-[11px]">
                            ✏️ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Before vs After JSON display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-rose-700 mb-1">Before Update (Old Value)</h4>
                      <pre className="bg-slate-900 text-rose-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60">
                        {selectedLog.old_value ? JSON.stringify(selectedLog.old_value, null, 2) : '// No old data'}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-bold text-emerald-700 mb-1">After Update (New Value)</h4>
                      <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60">
                        {selectedLog.new_value ? JSON.stringify(selectedLog.new_value, null, 2) : '// No new data'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-all text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Retention Cleanup Modal (Super Admin) ── */}
      {showCleanupModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>🧹</span> Audit Log Retention & Cleanup
              </h3>
              <button onClick={() => setShowCleanupModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Super Admin Control: Delete audit log records older than the selected retention period to maintain database performance.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Retention Period</label>
              <select
                value={cleanupDays}
                onChange={e => setCleanupDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value={30}>Delete logs older than 30 Days</option>
                <option value={90}>Delete logs older than 90 Days</option>
                <option value={180}>Delete logs older than 180 Days</option>
                <option value={365}>Delete logs older than 365 Days (1 Year)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCleanupModal(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanup}
                disabled={cleaning}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all text-xs disabled:opacity-50"
              >
                {cleaning ? 'Cleaning...' : 'Confirm Cleanup'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ActivityLogs;
