import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const StudentLeave = () => {
    const [activeTab, setActiveTab] = useState('apply'); // apply | history
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        reason: ''
    });

    useEffect(() => {
        if (activeTab === 'history') {
            fetchLeaves();
        }
    }, [activeTab]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/student/leaves`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLeaves(data.leaves);
            } else {
                toast.error(data.message || 'Failed to fetch leave history');
            }
        } catch (error) {
            console.error('Fetch leaves error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            toast.error('End date cannot be before start date');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/student/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Leave application submitted successfully');
                setFormData({ start_date: '', end_date: '', reason: '' });
                setActiveTab('history');
            } else {
                toast.error(data.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Submit leave error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📝 Leave Application</h1>
                    <p className="text-gray-500">Apply for leave and track status</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => setActiveTab('apply')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'apply'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Apply New
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Application History
                    </button>
                </div>
            </div>

            {activeTab === 'apply' ? (
                <Card className="max-w-2xl mx-auto">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
                        New Leave Request
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                    min={formData.start_date}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Please explain the reason for your leave request..."
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30
                                    hover:bg-blue-700 active:scale-95 transition-all
                                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </Card>
            ) : (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading history...</div>
                    ) : leaves.length > 0 ? (
                        <div className="grid gap-4">
                            {leaves.map((leave) => (
                                <Card key={leave.id} className="hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant={
                                                    leave.status === 'Approved' ? 'success' :
                                                        leave.status === 'Rejected' ? 'danger' : 'warning'
                                                }>
                                                    {leave.status}
                                                </Badge>
                                                <span className="text-xs text-gray-400">
                                                    Applied on {new Date(leave.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-800 font-semibold mb-1">
                                                <span>📅 {new Date(leave.start_date).toLocaleDateString()}</span>
                                                <span className="text-gray-400">to</span>
                                                <span>{new Date(leave.end_date).toLocaleDateString()}</span>
                                                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                                                    {Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                {leave.reason}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <div className="text-4xl mb-4">📭</div>
                            <h3 className="text-lg font-medium text-gray-900">No Leave History</h3>
                            <p className="text-gray-500 mt-1">You haven't applied for any leaves yet.</p>
                            <button
                                onClick={() => setActiveTab('apply')}
                                className="mt-4 text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                            >
                                Apply for one now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentLeave;
