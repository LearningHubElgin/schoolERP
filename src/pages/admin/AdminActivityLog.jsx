import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const StatCard = ({ title, value, icon, color, borderColor }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-emerald-500': '#10b981',
        'border-orange-500': '#f97316',
        'border-red-500': '#ef4444',
    };

    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 cursor-default group h-full border-l-4 ${borderColor}`}
            style={{ borderLeftColor: borderColors[borderColor] }}
        >
            <div className="flex items-center justify-between h-full gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-tight mb-1">{title}</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 whitespace-nowrap">{value || 0}</p>
                </div>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl ${color} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const AdminActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayTotal: 0,
        todayLogins: 0,
        todayDeletions: 0,
        failedLogins: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        actionType: '',
        userRole: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalRecords: 0
    });

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/activity/logs`, {
                params: {
                    page,
                    limit: pagination.limit,
                    ...filters
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setLogs(response.data.logs);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/activity/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching activity stats:', error);
        }
    };

    useEffect(() => {
        fetchLogs(1);
        fetchStats();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        fetchLogs(1);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            search: '',
            actionType: '',
            userRole: '',
            startDate: '',
            endDate: ''
        };
        setFilters(clearedFilters);
        // We need to pass the cleared filters directly because state update is async
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/api/activity/logs`, {
            params: {
                page: 1,
                limit: pagination.limit,
                ...clearedFilters
            },
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(response => {
            if (response.data.success) {
                setLogs(response.data.logs);
                setPagination(response.data.pagination);
            }
        }).finally(() => setLoading(false));
    };

    const handleExportCSV = () => {
        if (logs.length === 0) return;

        const headers = ['User', 'Email', 'Role', 'Action', 'Details', 'IP Address', 'Status', 'Date Time'];
        const csvRows = logs.map(log => [
            log.user_name,
            log.user_email,
            log.user_role,
            log.action,
            `"${log.details.replace(/"/g, '""')}"`,
            log.ip_address,
            log.status,
            new Date(log.created_at).toLocaleString()
        ]);

        const csvContent = [headers, ...csvRows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getActionBadgeVariant = (action) => {
        const a = action.toLowerCase();
        if (a.includes('login') || a.includes('create')) return 'success';
        if (a.includes('update') || a.includes('edit')) return 'warning';
        if (a.includes('delete') || a.includes('failed')) return 'danger';
        if (a.includes('logout') || a.includes('view')) return 'primary';
        return 'secondary';
    };

    const columns = [
        {
            header: '#',
            render: (row, idx) => ((pagination.page || 1) - 1) * (pagination.limit || 10) + idx + 1
        },
        {
            header: 'User',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {row.user_name ? row.user_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium text-slate-700">{row.user_name}</span>
                </div>
            )
        },
        { header: 'Email', accessor: 'user_email' },
        {
            header: 'Action',
            render: (row) => (
                <Badge variant={getActionBadgeVariant(row.action)}>
                    {row.action}
                </Badge>
            )
        },
        { 
            header: 'Details', 
            accessor: 'details',
            render: (row) => (
                <div className="max-w-xs truncate" title={row.details}>
                    {row.details}
                </div>
            )
        },
        { header: 'IP Address', accessor: 'ip_address' },
        {
            header: 'Status',
            render: (row) => (
                <Badge variant={row.status === 'Success' ? 'success' : row.status === 'Failed' ? 'danger' : 'warning'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Date & Time',
            render: (row) => {
                const date = new Date(row.created_at);
                return (
                    <div className="text-xs text-slate-500">
                        <div className="font-medium text-slate-700">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div>
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            }
        }
    ];

    const Pagination = () => {
        if (pagination.totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-500">
                    Showing {Math.min(pagination.totalRecords || 0, ((pagination.page || 1) - 1) * (pagination.limit || 10) + 1)} to {Math.min(pagination.totalRecords || 0, (pagination.page || 1) * (pagination.limit || 10))} of {pagination.totalRecords || 0} entries
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => fetchLogs(pagination.page - 1)}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center px-4 bg-slate-50 rounded-lg text-sm font-medium text-slate-600 border border-slate-200">
                        Page {pagination.page || 1} of {pagination.totalPages || 1}
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => fetchLogs(pagination.page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 p-4 md:p-5 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                        📋 Activity Log
                    </h1>
                    <p className="mt-1 text-slate-200 text-xs md:text-sm">Monitor all system activities and user actions</p>
                </div>
                <div className="relative z-10 flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-all border border-white shadow-md active:scale-95"
                    >
                        📥 Export CSV
                    </button>
                    <button
                        onClick={() => { fetchLogs(1); fetchStats(); }}
                        className="px-3 py-1.5 bg-white/25 hover:bg-white/35 text-white text-xs font-bold rounded-lg transition-all border border-white/20 active:scale-95"
                    >
                        🔄 Refresh
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-slate-600 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Activities Today"
                    value={stats.todayTotal}
                    icon="📊"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                />
                <StatCard
                    title="Total Logins Today"
                    value={stats.todayLogins}
                    icon="🔐"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                />
                <StatCard
                    title="Total Deletions Today"
                    value={stats.todayDeletions}
                    icon="🗑️"
                    color="bg-orange-100 text-orange-600"
                    borderColor="border-orange-500"
                />
                <StatCard
                    title="Failed Login Attempts"
                    value={stats.failedLogins}
                    icon="⚠️"
                    color="bg-red-100 text-red-600"
                    borderColor="border-red-500"
                />
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Input
                        placeholder="Search user, email, details..."
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                    <select
                        name="actionType"
                        value={filters.actionType}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    >
                        <option value="">All Actions</option>
                        <option value="Login">Login</option>
                        <option value="Logout">Logout</option>
                        <option value="Create">Create</option>
                        <option value="Update">Update</option>
                        <option value="Delete">Delete</option>
                    </select>
                    <select
                        name="userRole"
                        value={filters.userRole}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Student">Student</option>
                        <option value="Accountant">Accountant</option>
                    </select>
                    <Input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        label="From Date"
                    />
                    <Input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        label="To Date"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="secondary" onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                    <Button variant="primary" onClick={handleApplyFilters}>
                        Apply Filters
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card title="Activity Logs" variant="elevated">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-slate-500">Loading activity logs...</p>
                    </div>
                ) : logs.length > 0 ? (
                    <>
                        <Table columns={columns} data={logs} />
                        <Pagination />
                    </>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        No activity logs found matching your criteria.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminActivityLog;
