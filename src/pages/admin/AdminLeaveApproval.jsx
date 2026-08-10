import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const AdminLeaveApproval = () => {
    const [activeTab, setActiveTab] = useState('student'); // 'student' | 'teacher'
    const [studentLeaves, setStudentLeaves] = useState([]);
    const [teacherLeaves, setTeacherLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (activeTab === 'student') {
            fetchStudentLeaves();
        } else {
            fetchTeacherLeaves();
        }
    }, [activeTab]);

    const fetchStudentLeaves = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/leaves`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStudentLeaves(data.leaves);
            } else {
                toast.error(data.message || 'Failed to fetch student leaves');
            }
        } catch (error) {
            console.error('Fetch student leaves error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeacherLeaves = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/teacher-leaves`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTeacherLeaves(data.leaves);
            } else {
                toast.error(data.message || 'Failed to fetch teacher leaves');
            }
        } catch (error) {
            console.error('Fetch teacher leaves error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, type) => {
        setActionLoading(id);
        const endpoint = type === 'student' ? '/api/admin/leaves' : '/api/admin/teacher-leaves';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Leave ${status} successfully`);
                if (type === 'student') {
                    setStudentLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
                } else {
                    setTeacherLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
                }
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Update leave error:', error);
            toast.error('Server error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-4 md:p-5 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">✅ Leave Approvals</h1>
                    <p className="mt-1 text-blue-100 text-xs md:text-sm">Manage student and teacher leave requests</p>
                </div>

                {/* Tabs */}
                <div className="relative z-10 flex p-1 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('student')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'student'
                                ? 'bg-white text-slate-800 shadow-md'
                                : 'text-white/85 hover:text-white'
                            }`}
                    >
                        Student Leaves
                    </button>
                    <button
                        onClick={() => setActiveTab('teacher')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'teacher'
                                ? 'bg-white text-slate-800 shadow-md'
                                : 'text-white/85 hover:text-white'
                            }`}
                    >
                        Teacher Leaves
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">{activeTab === 'student' ? 'Student' : 'Teacher'}</th>
                                <th className="px-6 py-4">{activeTab === 'student' ? 'Class' : 'Email'}</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : (activeTab === 'student' ? studentLeaves : teacherLeaves).length > 0 ? (
                                (activeTab === 'student' ? studentLeaves : teacherLeaves).map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">
                                                {activeTab === 'student' ? leave.student_name : leave.teacher_name}
                                            </div>
                                            <div className="text-xs text-gray-400">Applied: {new Date(leave.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {activeTab === 'student'
                                                ? `${leave.class} - ${leave.section}`
                                                : leave.email
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-800">
                                                {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                                                {leave.reason}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                leave.status === 'Approved' ? 'success' :
                                                    leave.status === 'Rejected' ? 'danger' : 'warning'
                                            }>
                                                {leave.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {leave.status === 'Pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(leave.id, 'Approved', activeTab)}
                                                        disabled={actionLoading === leave.id}
                                                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all font-medium text-xs flex items-center gap-1"
                                                        title="Approve"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(leave.id, 'Rejected', activeTab)}
                                                        disabled={actionLoading === leave.id}
                                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all font-medium text-xs flex items-center gap-1"
                                                        title="Reject"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminLeaveApproval;
