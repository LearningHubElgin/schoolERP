import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const RequisitionApproval = () => {
    const [requisitionList, setRequisitionList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterSource, setFilterSource] = useState('All');
    const [selectedRequisition, setSelectedRequisition] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch requisitions on component mount
    useEffect(() => {
        fetchRequisitions();
    }, []);

    const fetchRequisitions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/requisitions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRequisitionList(data.requisitions || []);
            }
        } catch (error) {
            console.error('Error fetching requisitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequisitions = requisitionList.filter(r => {
        const statusMatch = filterStatus === 'All' || r.status === filterStatus;
        const categoryMatch = filterCategory === 'All' || r.category === filterCategory;
        const sourceMatch = filterSource === 'All' || r.source === filterSource;
        return statusMatch && categoryMatch && sourceMatch;
    });

    const handleViewDetails = (requisition) => {
        setSelectedRequisition(requisition);
        setRejectionReason('');
        setIsModalOpen(true);
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/requisitions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (response.ok) {
                setIsModalOpen(false);
                alert('Requisition approved successfully!');
                fetchRequisitions(); // Refresh the list
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve requisition');
            }
        } catch (error) {
            console.error('Error approving requisition:', error);
            alert('Failed to approve requisition');
        }
    };

    const handleReject = async (id) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/requisitions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'Rejected',
                    rejectionReason: rejectionReason
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                alert('Requisition rejected');
                fetchRequisitions(); // Refresh the list
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to reject requisition');
            }
        } catch (error) {
            console.error('Error rejecting requisition:', error);
            alert('Failed to reject requisition');
        }
    };

    const pendingCount = requisitionList.filter(r => r.status === 'Pending').length;
    const approvedCount = requisitionList.filter(r => r.status === 'Approved').length;
    const rejectedCount = requisitionList.filter(r => r.status === 'Rejected').length;

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Requisition Approval 📝</h1>
                        <p className="mt-1 text-orange-100 text-xs md:text-sm">
                            Review and manage resource requests from staff and students.
                        </p>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-amber-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Requests"
                    value={requisitionList.length}
                    icon={<span className="text-2xl">📊</span>}
                    color="blue"
                />
                <StatCard
                    title="Pending Actions"
                    value={pendingCount}
                    icon={<span className="text-2xl">⏳</span>}
                    color="orange"
                    subValue={pendingCount > 0 ? "Needs Attention" : "All Clear"}
                />
                <StatCard
                    title="Approved"
                    value={approvedCount}
                    icon={<span className="text-2xl">✅</span>}
                    color="green"
                />
                <StatCard
                    title="Rejected"
                    value={rejectedCount}
                    icon={<span className="text-2xl">❌</span>}
                    color="red"
                />
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <h3 className="font-bold text-slate-700 whitespace-nowrap hidden md:block">Filter Requests:</h3>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Sources</option>
                        <option value="Teacher">Teachers</option>
                        <option value="Student">Students</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Categories</option>
                        <option value="Educational Equipment">Educational Equipment</option>
                        <option value="Books">Books</option>
                        <option value="Lab Supplies">Lab Supplies</option>
                        <option value="Lab Equipment">Lab Equipment</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Technology">Technology</option>
                        <option value="Computer/IT">Computer/IT</option>
                        <option value="Sports Equipment">Sports Equipment</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Requisitions Table */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200 shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Requester</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item & Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                                            <p className="text-slate-500">Loading requests...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-4xl opacity-50">📭</span>
                                            <p className="font-medium text-lg">No requisitions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequisitions.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">#{req.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{req.requesterName}</span>
                                                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                                                    {req.source === 'Teacher' ? '👨‍🏫' : '🎓'} {req.source}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-800">{req.item}</span>
                                                <span className="text-xs text-slate-500">Qty: {req.quantity} • {req.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={
                                                req.urgency === 'High' ? 'danger' :
                                                    req.urgency === 'Medium' ? 'warning' : 'default'
                                            } className="uppercase text-[10px] tracking-wider">
                                                {req.urgency}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                            <div>{req.submittedDate}</div>
                                            <div className="text-slate-400">{req.submittedTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={
                                                req.status === 'Approved' ? 'success' :
                                                    req.status === 'Rejected' ? 'danger' : 'warning'
                                            }>
                                                {req.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleViewDetails(req)}
                                                className="hover:border-blue-300 hover:text-blue-600"
                                            >
                                                View
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
            {isModalOpen && selectedRequisition && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-100 transition-all border border-slate-200">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Requisition Details</h2>
                                <p className="text-sm text-slate-500">Request #{selectedRequisition.id}</p>
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
                            <div className={`p-4 rounded-lg flex items-center justify-between ${selectedRequisition.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    selectedRequisition.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        'bg-orange-50 text-orange-700 border border-orange-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {selectedRequisition.status === 'Approved' ? '✅' :
                                            selectedRequisition.status === 'Rejected' ? '❌' : '⏳'}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm uppercase tracking-wide">Current Status</p>
                                        <p className="font-semibold text-lg">{selectedRequisition.status}</p>
                                    </div>
                                </div>
                                {selectedRequisition.status === 'Pending' && (
                                    <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded">Awaiting Action</span>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Requester</label>
                                    <p className="font-semibold text-slate-800">{selectedRequisition.requesterName}</p>
                                    <Badge variant="secondary" className="mt-1 text-[10px]">{selectedRequisition.source}</Badge>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Submission Date</label>
                                    <p className="font-semibold text-slate-800">{selectedRequisition.submittedDate}</p>
                                    <p className="text-xs text-slate-500">{selectedRequisition.submittedTime}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Item Category</label>
                                    <p className="font-semibold text-slate-800">{selectedRequisition.category}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Urgency</label>
                                    <Badge variant={
                                        selectedRequisition.urgency === 'High' ? 'danger' :
                                            selectedRequisition.urgency === 'Medium' ? 'warning' : 'default'
                                    } className="mt-1">
                                        {selectedRequisition.urgency}
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-bold text-slate-700">{selectedRequisition.item}</h3>
                                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded">Qty: {selectedRequisition.quantity}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                    "{selectedRequisition.description}"
                                </p>
                            </div>

                            {/* Action Area */}
                            {selectedRequisition.status === 'Pending' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Rejection Reason <span className="font-normal text-slate-400 text-xs">(Required only for rejection)</span>
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                            placeholder="Please explain why this request is being rejected..."
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="danger"
                                            onClick={() => handleReject(selectedRequisition.id)}
                                            className="flex-1 justify-center py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                        >
                                            ❌ Reject Request
                                        </Button>
                                        <Button
                                            variant="success"
                                            onClick={() => handleApprove(selectedRequisition.id)}
                                            className="flex-1 justify-center py-3 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                                        >
                                            ✅ Approve Request
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedRequisition.status === 'Rejected' && selectedRequisition.rejectionReason && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                    <p className="text-xs font-bold text-red-900 uppercase">Rejection Reason</p>
                                    <p className="text-sm text-red-700 mt-1">{selectedRequisition.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequisitionApproval;
