import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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
            // Get school_id from localStorage (set during login as 'schoolId')
            const schoolId = localStorage.getItem('schoolId');

            const queryParam = schoolId ? `?school_id=${schoolId}` : '';

            // Fetch applications with school filter
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

    const handleDelete = async (id) => {
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
                alert('Application deleted successfully');
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
        const matchesSearch = app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.application_no.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || app.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        All: applications.length,
        Pending: applications.filter(a => a.status.toLowerCase() === 'pending').length,
        Admitted: applications.filter(a => a.status.toLowerCase() === 'admitted').length,
        Rejected: applications.filter(a => a.status.toLowerCase() === 'rejected').length,
    };

    // Helper Stat Card
    const StatCard = ({ title, value, icon, color, active, onClick }) => (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${active
                ? `bg-${color}-100 border-${color}-300 ring-2 ring-${color}-100`
                : `bg-${color}-50/60 border-${color}-100 hover:bg-${color}-50 hover:border-${color}-200`
                }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${active ? `text-${color}-700` : `text-${color}-600/70`}`}>
                        {title}
                    </p>
                    <h3 className={`text-2xl font-bold mt-1 ${active ? `text-${color}-900` : `text-${color}-800`}`}>
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-full transition-all duration-300 ${active ? `bg-${color}-600 text-white` : `bg-${color}-100 text-${color}-600`}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-4 md:p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Student Applications 📂</h1>
                        <p className="mt-2 text-cyan-100 text-sm md:text-lg">
                            Review and manage incoming student entries and admissions.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm shadow-lg"
                        onClick={() => navigate('/admission/new-application')}
                    >
                        + Create New Application
                    </Button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Stats Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    title="All Applications"
                    value={statusCounts.All}
                    icon={<span className="text-xl">📄</span>}
                    color="blue"
                    active={filterStatus === 'All'}
                    onClick={() => setFilterStatus('All')}
                />
                <StatCard
                    title="Pending"
                    value={statusCounts.Pending}
                    icon={<span className="text-xl">⏳</span>}
                    color="orange"
                    active={filterStatus === 'Pending'}
                    onClick={() => setFilterStatus('Pending')}
                />
                <StatCard
                    title="Admitted"
                    value={statusCounts.Admitted}
                    icon={<span className="text-xl">🎉</span>}
                    color="green"
                    active={filterStatus === 'Admitted'}
                    onClick={() => setFilterStatus('Admitted')}
                />
                <StatCard
                    title="Rejected"
                    value={statusCounts.Rejected}
                    icon={<span className="text-xl">❌</span>}
                    color="red"
                    active={filterStatus === 'Rejected'}
                    onClick={() => setFilterStatus('Rejected')}
                />
            </div>

            {/* Filters & Content */}
            <Card variant="elevated" className="border-slate-200 shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, ID, or class..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Additional View Options (Could go here) */}
                </div>

                {/* Applications List */}
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">App Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Info</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-cyan-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-700 block">#{app.application_no}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{app.student_name}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">F: {app.father_name} • 📞 {app.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">Class {app.class}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div>{new Date(app.applied_date).toLocaleDateString('en-GB')}</div>
                                            <div className="text-xs text-slate-400">
                                                {app.created_at ? new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={getStatusBadge(app.status)}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => navigate(`/admission/applications/${app.id}`)}
                                                    className="hover:border-blue-300 hover:text-blue-600"
                                                >
                                                    View
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete(app.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Application"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        {applications.length === 0 ? 'No applications yet. Create your first application!' : 'No applications found matching your criteria'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                            <div
                                key={app.id}
                                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:scale-[0.99] transition-transform"
                                onClick={() => navigate(`/admission/applications/${app.id}`)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">#{app.application_no}</span>
                                    <Badge variant={getStatusBadge(app.status)} size="sm">
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="space-y-1 mb-3">
                                    <h3 className="text-lg font-bold text-slate-800">{app.student_name}</h3>
                                    <p className="text-sm text-slate-600">
                                        Class {app.class} • {new Date(app.applied_date).toLocaleDateString('en-GB')}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg mb-4">
                                    <div>
                                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Father</span>
                                        {app.father_name}
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Contact</span>
                                        {app.phone}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1 justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admission/applications/${app.id}`);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    <button
                                        className="px-4 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(app.id);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            No applications found
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ApplicationsList;