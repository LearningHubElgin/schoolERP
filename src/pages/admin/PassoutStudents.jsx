import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { GraduationCap, Calendar, Download, Eye, RotateCcw, Filter } from 'lucide-react';

const PassoutStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, years: [], classes: [], yearWise: [] });
    const [filters, setFilters] = useState({ year: 'all', class: 'all', search: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewStudent, setViewStudent] = useState(null);

    useEffect(() => {
        fetchPassoutStudents();
        fetchStats();
    }, [filters]);

    const fetchPassoutStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.year !== 'all') params.append('year', filters.year);
            if (filters.class !== 'all') params.append('class', filters.class);
            if (filters.search) params.append('search', filters.search);
            
            const res = await axios.get(`${API_URL}/api/admin/passed-out-students?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStudents(res.data.students);
        } catch (error) {
            console.error('Error fetching passout students:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/passed-out-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStats(res.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleRestore = async (student) => {
        setSelectedStudent(student);
        setShowRestoreModal(true);
    };

    const confirmRestore = async () => {
        if (!selectedStudent) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/students/${selectedStudent.id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success(`${selectedStudent.student_name} restored successfully!`);
                setShowRestoreModal(false);
                fetchPassoutStudents();
                fetchStats();
            } else {
                toast.error(res.data.message || 'Restore failed');
            }
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Failed to restore student');
        }
    };

    const downloadReport = async () => {
        // Export to CSV
        const csvHeaders = ['Roll No', 'Name', 'Class', 'Section', 'Passout Year', 'Passout Date', 'Remarks'];
        const csvRows = students.map(s => [
            s.roll_no,
            s.student_name,
            s.passed_out_class,
            s.section,
            s.passed_out_year,
            new Date(s.passed_out_date).toLocaleDateString('en-IN'),
            s.remarks || ''
        ]);
        const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Passout_Students_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" /> Passout Students
                        </h1>
                        <p className="mt-1 text-purple-100 text-xs md:text-sm">
                            View and manage students who have completed their education
                        </p>
                    </div>
                    <Button onClick={downloadReport} disabled={students.length === 0} className="bg-white/20 hover:bg-white/30 text-white text-xs md:text-sm px-3 py-1.5">
                        <Download className="w-4 h-4 mr-1.5" /> Export Report
                    </Button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 left-20 -mb-20 w-60 h-60 rounded-full bg-pink-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold">Total Passout</p>
                    <p className="text-3xl font-bold text-purple-800">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Passout Years</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.years.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600 font-semibold">Classes</p>
                    <p className="text-2xl font-bold text-green-800">{stats.classes.length}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-600 font-semibold">Year-wise Avg</p>
                    <p className="text-2xl font-bold text-amber-800">{stats.yearWise.length > 0 ? Math.round(stats.yearWise.reduce((a,b) => a + b.count, 0) / stats.yearWise.length) : 0}</p>
                </div>
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                        <select className="w-full border rounded-lg p-2" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                            <option value="all">All Years</option>
                            {stats.years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                        <select className="w-full border rounded-lg p-2" value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
                            <option value="all">All Classes</option>
                            {stats.classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Search</label>
                        <input type="text" placeholder="Search by name or roll no..." className="w-full border rounded-lg p-2" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    </div>
                </div>
            </Card>

            {/* Students Table */}
            <Card title="Passout Student Records" variant="elevated">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Passout Class</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Passout Year</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Passout Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-8">Loading...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-400">No passout students found</td></tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-mono">{student.roll_no}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{student.student_name}</div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                        </td>
                                        <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Class {student.passed_out_class}</span></td>
                                        <td className="px-4 py-3"><Badge variant="info">{student.passed_out_year}</Badge></td>
                                        <td className="px-4 py-3 text-sm">{new Date(student.passed_out_date).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[150px]">{student.remarks || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => { setViewStudent(student); setShowViewModal(true); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> View
                                                </button>
                                                <button onClick={() => handleRestore(student)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition flex items-center gap-1">
                                                    <RotateCcw className="w-3 h-3" /> Restore
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Year-wise Chart */}
            {stats.yearWise.length > 0 && (
                <Card title="Year-wise Passout Statistics" variant="elevated">
                    <div className="flex flex-wrap gap-4">
                        {stats.yearWise.map(item => (
                            <div key={item.year} className="flex-1 min-w-[80px] text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                <p className="text-2xl font-bold text-purple-700">{item.count}</p>
                                <p className="text-xs text-purple-500 font-semibold">Year {item.year}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Restore Confirmation Modal */}
            <Modal isOpen={showRestoreModal} onClose={() => setShowRestoreModal(false)} title="Restore Student" size="sm">
                <div className="text-center py-4">
                    <div className="text-5xl mb-4">🔄</div>
                    <p className="text-gray-700 mb-2">Are you sure you want to restore <strong>{selectedStudent?.student_name}</strong>?</p>
                    <p className="text-sm text-gray-500">The student will be moved back to the active students list and their login will be reactivated.</p>
                    <div className="flex justify-center gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={confirmRestore} className="bg-green-600 hover:bg-green-700">Restore Student</Button>
                    </div>
                </div>
            </Modal>

            {/* View Student Details Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={`🎓 ${viewStudent?.student_name || viewStudent?.name || 'Student'} — Details`} size="md">
                {viewStudent && (
                    <div className="space-y-4 py-2">
                        {/* Student Photo */}
                        {viewStudent.photo_path && (
                            <div className="flex justify-center mb-2">
                                <img src={`${API_URL}${viewStudent.photo_path}`} alt="Student" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow" />
                            </div>
                        )}
                        <div className="text-center mb-3">
                            <h3 className="text-lg font-bold text-gray-900">{viewStudent.student_name || viewStudent.name}</h3>
                            <p className="text-sm text-gray-500">{viewStudent.student_unique_id}</p>
                        </div>

                        {/* Passout Info */}
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-purple-700 mb-2 uppercase">Passout Information</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-gray-500">Passout Class:</span> <span className="font-semibold">Class {viewStudent.passed_out_class}</span></div>
                                <div><span className="text-gray-500">Passout Year:</span> <span className="font-semibold">{viewStudent.passed_out_year}</span></div>
                                <div><span className="text-gray-500">Passout Date:</span> <span className="font-semibold">{viewStudent.passed_out_date ? new Date(viewStudent.passed_out_date).toLocaleDateString('en-IN') : '-'}</span></div>
                                <div><span className="text-gray-500">Section:</span> <span className="font-semibold">{viewStudent.section || '-'}</span></div>
                                {viewStudent.stream_name && <div><span className="text-gray-500">Group:</span> <span className="font-semibold">{viewStudent.stream_name}</span></div>}
                                <div className="col-span-2"><span className="text-gray-500">Remarks:</span> <span className="font-semibold">{viewStudent.remarks || '-'}</span></div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-blue-700 mb-2 uppercase">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-gray-500">Roll No:</span> <span className="font-semibold">{viewStudent.roll_no || '-'}</span></div>
                                <div><span className="text-gray-500">Gender:</span> <span className="font-semibold">{viewStudent.gender || '-'}</span></div>
                                <div><span className="text-gray-500">Date of Birth:</span> <span className="font-semibold">{viewStudent.date_of_birth ? new Date(viewStudent.date_of_birth).toLocaleDateString('en-IN') : '-'}</span></div>
                                <div><span className="text-gray-500">Blood Group:</span> <span className="font-semibold">{viewStudent.blood_group || '-'}</span></div>
                                <div><span className="text-gray-500">Email:</span> <span className="font-semibold">{viewStudent.email || '-'}</span></div>
                                <div><span className="text-gray-500">Phone:</span> <span className="font-semibold">{viewStudent.phone || '-'}</span></div>
                            </div>
                        </div>

                        {/* Parent Info */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-green-700 mb-2 uppercase">Parent / Guardian</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-gray-500">Father:</span> <span className="font-semibold">{viewStudent.father_name || '-'}</span></div>
                                <div><span className="text-gray-500">Father Phone:</span> <span className="font-semibold">{viewStudent.father_phone || viewStudent.guardian_phone || '-'}</span></div>
                                <div><span className="text-gray-500">Mother:</span> <span className="font-semibold">{viewStudent.mother_name || '-'}</span></div>
                                <div><span className="text-gray-500">Mother Phone:</span> <span className="font-semibold">{viewStudent.mother_phone || viewStudent.motherPhone || '-'}</span></div>
                                <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-semibold">{viewStudent.address || '-'}</span></div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PassoutStudents;