import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';

const ApplicationsList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const schoolId = localStorage.getItem('schoolId');
            const queryParam = schoolId ? `?school_id=${schoolId}` : '';
            const response = await fetch(`${API_URL}/api/admission/applications${queryParam}`);
            const data = await response.json();

            if (data.success) {
                setApplications(data.applications);
            } else {
                setError(data.message || 'Failed to fetch applications');
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to fetch applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this application?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admission/applications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setApplications(prev => prev.filter(app => app.id !== id));
            } else {
                alert(data.message || 'Failed to delete application');
            }
        } catch (err) {
            console.error('Error deleting application:', err);
            alert('Failed to connect to server');
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

    // Filter applications
    const filteredApplications = applications.filter((app) => {
        const matchesSearch = (app.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.application_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.class ? String(app.class) : '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || (app.status || '').toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        All: applications.length,
        Pending: applications.filter(a => (a.status || '').toLowerCase() === 'pending').length,
        Admitted: applications.filter(a => (a.status || '').toLowerCase() === 'admitted').length,
        Rejected: applications.filter(a => (a.status || '').toLowerCase() === 'rejected').length,
    };

    const columns = [
        {
            header: 'App No',
            render: (row) => (
                <span className="font-bold text-slate-700 text-xs">#{row.application_no}</span>
            )
        },
        {
            header: 'Candidate Info',
            render: (row) => (
                <div>
                    <span className="font-bold text-slate-900 text-xs block">{row.student_name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                        {row.father_name && `F: ${row.father_name}`} {row.phone && `• 📞 ${row.phone}`}
                    </span>
                </div>
            )
        },
        {
            header: 'Class',
            render: (row) => (
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-700">Class {row.class}</span>
            )
        },
        {
            header: 'Applied Date',
            render: (row) => (
                <div>
                    <span className="text-xs font-medium text-slate-700 block">{new Date(row.applied_date).toLocaleDateString('en-GB')}</span>
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
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => navigate(`/admission/applications/${row.id}`)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                        View Details
                    </button>
                    <button
                        onClick={(e) => handleDelete(row.id, e)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Application"
                    >
                        ❌
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-2.5 sm:space-y-3.5 pb-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-2.5 sm:p-5 text-white shadow-md sm:shadow-lg flex flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="relative z-10">
                    <h1 className="text-xs sm:text-xl font-bold tracking-tight flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-xl">📂</span> Student Applications
                    </h1>
                    <p className="mt-0.5 text-blue-100 text-[9px] sm:text-xs font-medium hidden xs:block">
                        Review and manage incoming student entries and admissions
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admission/new-application')}
                    className="px-2 py-1 sm:px-4 sm:py-2 bg-white text-indigo-700 hover:bg-blue-50 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer border border-white/40"
                >
                    <span>➕</span> <span className="hidden xs:inline">New Application</span><span className="xs:hidden">New App</span>
                </button>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Stats Filter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Card
                    onClick={() => setFilterStatus('All')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filterStatus === 'All'
                        ? '!bg-gradient-to-r !from-indigo-100/90 !to-white !border-indigo-400 !border-l-[4px] !border-l-indigo-600 ring-2 ring-indigo-200'
                        : '!bg-gradient-to-r !from-indigo-50/90 !via-indigo-50/40 !to-white !border-indigo-200/90 !border-l-[4px] !border-l-indigo-600 hover:!border-indigo-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-indigo-950 tracking-tight leading-tight">All Applications</p>
                            <p className="text-lg sm:text-2xl font-bold text-indigo-700 mt-1 leading-none">
                                {statusCounts.All}
                            </p>
                            <p className="text-[10px] sm:text-xs text-indigo-700/80 font-medium mt-1">Total submitted</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-100/90 border border-indigo-300 text-indigo-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">📄</div>
                    </div>
                </Card>

                <Card
                    onClick={() => setFilterStatus('Pending')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filterStatus === 'Pending'
                        ? '!bg-gradient-to-r !from-amber-100/90 !to-white !border-amber-400 !border-l-[4px] !border-l-amber-500 ring-2 ring-amber-200'
                        : '!bg-gradient-to-r !from-amber-50/90 !via-amber-50/40 !to-white !border-amber-200/90 !border-l-[4px] !border-l-amber-500 hover:!border-amber-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-amber-950 tracking-tight leading-tight">Pending Review</p>
                            <p className="text-lg sm:text-2xl font-bold text-amber-700 mt-1 leading-none">
                                {statusCounts.Pending}
                            </p>
                            <p className="text-[10px] sm:text-xs text-amber-700/80 font-medium mt-1">
                                {statusCounts.Pending > 0 ? "Needs Action" : "All Clear"}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100/90 border border-amber-300 text-amber-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">⏳</div>
                    </div>
                </Card>

                <Card
                    onClick={() => setFilterStatus('Admitted')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filterStatus === 'Admitted'
                        ? '!bg-gradient-to-r !from-emerald-100/90 !to-white !border-emerald-400 !border-l-[4px] !border-l-emerald-600 ring-2 ring-emerald-200'
                        : '!bg-gradient-to-r !from-emerald-50/90 !via-emerald-50/40 !to-white !border-emerald-200/90 !border-l-[4px] !border-l-emerald-600 hover:!border-emerald-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-emerald-950 tracking-tight leading-tight">Admitted</p>
                            <p className="text-lg sm:text-2xl font-bold text-emerald-700 mt-1 leading-none">
                                {statusCounts.Admitted}
                            </p>
                            <p className="text-[10px] sm:text-xs text-emerald-700/80 font-medium mt-1">Approved entries</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">🎉</div>
                    </div>
                </Card>

                <Card
                    onClick={() => setFilterStatus('Rejected')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filterStatus === 'Rejected'
                        ? '!bg-gradient-to-r !from-rose-100/90 !to-white !border-rose-400 !border-l-[4px] !border-l-rose-500 ring-2 ring-rose-200'
                        : '!bg-gradient-to-r !from-rose-50/90 !via-rose-50/40 !to-white !border-rose-200/90 !border-l-[4px] !border-l-rose-500 hover:!border-rose-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs sm:text-xs font-bold text-rose-950 tracking-tight leading-tight">Rejected</p>
                            <p className="text-lg sm:text-2xl font-bold text-rose-700 mt-1 leading-none">
                                {statusCounts.Rejected}
                            </p>
                            <p className="text-[10px] sm:text-xs text-rose-700/80 font-medium mt-1">Declined entries</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-100/90 border border-rose-300 text-rose-700 font-bold text-sm sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">❌</div>
                    </div>
                </Card>
            </div>

            {/* Applications Table Card */}
            <Card variant="elevated">
                {/* Search Bar */}
                <div className="mb-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by student name, App No, or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredApplications}
                    isLoading={loading}
                    compact={true}
                    headerBg="bg-slate-100/90 text-slate-700 font-extrabold"
                    emptyMessage="No applications found matching criteria."
                />
            </Card>
        </div>
    );
};

export default ApplicationsList;