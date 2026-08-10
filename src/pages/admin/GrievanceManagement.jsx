import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const GrievanceManagement = () => {
    const [grievanceList, setGrievanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterSource, setFilterSource] = useState('All');
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/grievances`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setGrievanceList(data.grievances || []);
            }
        } catch (error) {
            console.error('Error fetching grievances:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGrievances = grievanceList.filter(g => {
        const statusMatch = filterStatus === 'All' || g.status === filterStatus;
        const categoryMatch = filterCategory === 'All' || g.category === filterCategory;
        const sourceMatch = filterSource === 'All' || g.source === filterSource;
        return statusMatch && categoryMatch && sourceMatch;
    });

    const handleViewDetails = (grievance) => {
        setSelectedGrievance(grievance);
        setComment('');
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/grievances/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    resolution: comment || null
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                alert(`Grievance status updated to ${newStatus}`);
                fetchGrievances(); // Refresh the list
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update grievance');
            }
        } catch (error) {
            console.error('Error updating grievance:', error);
            alert('Failed to update grievance');
        }
    };

    const pendingCount = grievanceList.filter(g => g.status === 'Pending').length;
    const inProgressCount = grievanceList.filter(g => g.status === 'In Progress').length;
    const resolvedCount = grievanceList.filter(g => g.status === 'Resolved').length;

    // Helper Card for Stats
    const StatCard = ({ title, value, icon, color, subValue }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${color}-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
            <div className={`p-4 bg-${color}-50 rounded-full text-${color}-600 mb-3`}>
                {icon}
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            {subValue && <p className={`text-xs mt-1 font-medium text-${color}-600`}>{subValue}</p>}
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 to-rose-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Grievance Management 📢</h1>
                        <p className="mt-1 text-red-100 text-xs md:text-sm">
                            Track and resolve issues reported by students and staff.
                        </p>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-rose-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Reports"
                    value={grievanceList.length}
                    icon={<span className="text-2xl">📋</span>}
                    color="blue"
                />
                <StatCard
                    title="Pending"
                    value={pendingCount}
                    icon={<span className="text-2xl">⚠️</span>}
                    color="orange"
                    subValue={pendingCount > 0 ? "Urgent Attention" : "All Clear"}
                />
                <StatCard
                    title="In Progress"
                    value={inProgressCount}
                    icon={<span className="text-2xl">🔄</span>}
                    color="yellow"
                />
                <StatCard
                    title="Resolved"
                    value={resolvedCount}
                    icon={<span className="text-2xl">✅</span>}
                    color="green"
                />
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <h3 className="font-bold text-slate-700 whitespace-nowrap hidden md:block">Filter Issues:</h3>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="All">All Sources</option>
                        <option value="Student">Students</option>
                        <option value="Teacher">Teachers</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="All">All Categories</option>
                        <option value="Academic">Academic</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Facilities">Facilities</option>
                        <option value="Salary">Salary</option>
                        <option value="Workload">Workload</option>
                        <option value="Management">Management</option>
                        <option value="Fee Related">Fee Related</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Grievances Table */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200 shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted By</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
                                            <p className="text-slate-500">Loading grievances...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredGrievances.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-4xl opacity-50">👍</span>
                                            <p className="font-medium text-lg">No grievances found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredGrievances.map((grievance) => (
                                    <tr key={grievance.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">#{grievance.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{grievance.submitterName}</span>
                                                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                                                    {grievance.source === 'Teacher' ? '👨‍🏫' : '🎓'} {grievance.source} • {grievance.class}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-800">{grievance.subject}</span>
                                                <span className="text-xs text-slate-500">{grievance.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={
                                                grievance.priority === 'High' ? 'danger' :
                                                    grievance.priority === 'Medium' ? 'warning' : 'default'
                                            } className="uppercase text-[10px] tracking-wider">
                                                {grievance.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                            <div>{grievance.submittedDate}</div>
                                            <div className="text-slate-400">{grievance.submittedTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={
                                                grievance.status === 'Resolved' ? 'success' :
                                                    grievance.status === 'In Progress' ? 'warning' : 'danger'
                                            }>
                                                {grievance.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleViewDetails(grievance)}
                                                className="hover:border-rose-300 hover:text-rose-600"
                                            >
                                                Manage
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Details Modal */}
            {isModalOpen && selectedGrievance && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-100 transition-all border border-slate-200">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Grievance Details</h2>
                                <p className="text-sm text-slate-500">Case #{selectedGrievance.id}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg flex items-center justify-between ${selectedGrievance.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    selectedGrievance.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                        'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {selectedGrievance.status === 'Resolved' ? '✅' :
                                            selectedGrievance.status === 'In Progress' ? '🚧' : '🚨'}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm uppercase tracking-wide">Current Status</p>
                                        <p className="font-semibold text-lg">{selectedGrievance.status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Submitted By</label>
                                    <p className="font-semibold text-slate-800">{selectedGrievance.submitterName}</p>
                                    <Badge variant="secondary" className="mt-1 text-[10px]">{selectedGrievance.source}</Badge>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Submission Date</label>
                                    <p className="font-semibold text-slate-800">{selectedGrievance.submittedDate}</p>
                                    <p className="text-xs text-slate-500">{selectedGrievance.submittedTime}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
                                    <p className="font-semibold text-slate-800">{selectedGrievance.category}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Priority</label>
                                    <Badge variant={
                                        selectedGrievance.priority === 'High' ? 'danger' :
                                            selectedGrievance.priority === 'Medium' ? 'warning' : 'default'
                                    } className="mt-1">
                                        {selectedGrievance.priority}
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-2">{selectedGrievance.subject}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                    "{selectedGrievance.description}"
                                </p>
                            </div>

                            {/* Action Area */}
                            {selectedGrievance.status !== 'Resolved' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Resolution Notes / Comments
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                                            placeholder="Details about resolution or progress update..."
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        {selectedGrievance.status === 'Pending' && (
                                            <Button
                                                variant="warning"
                                                onClick={() => handleUpdateStatus(selectedGrievance.id, 'In Progress')}
                                                className="flex-1 justify-center py-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                                🚧 Mark In Progress
                                            </Button>
                                        )}
                                        <Button
                                            variant="success"
                                            onClick={() => handleUpdateStatus(selectedGrievance.id, 'Resolved')}
                                            className="flex-1 justify-center py-3 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                                        >
                                            ✅ Resolve Case
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedGrievance.resolution && (
                                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                                    <p className="text-xs font-bold text-green-900 uppercase">Resolution Details</p>
                                    <p className="text-sm text-green-700 mt-1">{selectedGrievance.resolution}</p>
                                    {selectedGrievance.resolvedDate && (
                                        <p className="text-xs text-green-600 mt-2">Resolved on: {selectedGrievance.resolvedDate}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrievanceManagement;
