import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminPayslips = () => {
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [teachers, setTeachers] = useState([]);
    const [payslips, setPayslips] = useState([]);

    const [formData, setFormData] = useState({
        teacher_id: '',
        month: MONTHS[new Date().getMonth()],
        year: new Date().getFullYear(),
        title: '',
    });
    const [file, setFile] = useState(null);

    // Edit Modal
    const [editModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState({ id: '', month: '', year: '', title: '' });
    const [editFile, setEditFile] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [teachersRes, payslipsRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/teachers`, { headers }),
                fetch(`${API_BASE}/api/admin/payslips`, { headers })
            ]);

            const teachersData = await teachersRes.json();
            const payslipsData = await payslipsRes.json();

            if (teachersData.success) setTeachers(teachersData.teachers);
            if (payslipsData.success) setPayslips(payslipsData.payslips);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.teacher_id || !file) {
            toast.error('Please select a teacher and upload a file');
            return;
        }

        setSubmitLoading(true);
        const data = new FormData();
        data.append('teacher_id', formData.teacher_id);
        data.append('month', formData.month);
        data.append('year', formData.year);
        data.append('title', formData.title || `Payslip ${formData.month} ${formData.year}`);
        data.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/payslips`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Payslip uploaded successfully');
                setFormData(prev => ({ ...prev, teacher_id: '', title: '' }));
                setFile(null);
                const fileInput = document.getElementById('payslip-file-input');
                if (fileInput) fileInput.value = '';
                fetchPayslips();
            } else {
                toast.error(result.message || 'Failed to upload');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Server error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const fetchPayslips = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/payslips`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setPayslips(data.payslips);
        } catch (error) {
            console.error('Fetch payslips error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payslip?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/payslips/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Payslip deleted');
                setPayslips(prev => prev.filter(p => p.id !== id));
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Server error');
        }
    };

    const openEditModal = (p) => {
        setEditData({ id: p.id, month: p.month, year: p.year, title: p.title });
        setEditFile(null);
        setEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);

        const data = new FormData();
        data.append('month', editData.month);
        data.append('year', editData.year);
        data.append('title', editData.title);
        if (editFile) data.append('file', editFile);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/payslips/${editData.id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Payslip updated');
                setEditModal(false);
                fetchPayslips();
            } else {
                toast.error(result.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Edit error:', error);
            toast.error('Server error');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">💰 Manage Teacher Payslips</h1>
                    <p className="mt-1 text-emerald-100 text-xs md:text-sm">Upload, edit, and delete payslips for teaching staff</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-emerald-500 opacity-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Upload Payslip</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.teacher_id}
                                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.employee_id})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.month}
                                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        min="2020"
                                        max="2030"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. January 2026 Salary"
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Payslip (Image/PDF)</label>
                                <input
                                    id="payslip-file-input"
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    accept="image/*,application/pdf"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className={`w-full py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all ${submitLoading ? 'opacity-70' : ''}`}
                            >
                                {submitLoading ? 'Uploading...' : 'Upload Payslip'}
                            </button>
                        </form>
                    </Card>
                </div>

                {/* Payslips List */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Uploaded Payslips</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                                        <th className="px-4 py-3">Teacher</th>
                                        <th className="px-4 py-3">Month / Year</th>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Uploaded</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
                                    ) : payslips.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">No payslips uploaded yet.</td></tr>
                                    ) : (
                                        payslips.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800">{p.teacher_name}</div>
                                                    <div className="text-xs text-gray-500">ID: {p.employee_id} | {p.subject}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="info">{p.month} {p.year}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{p.title}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-2">
                                                    <button
                                                        onClick={() => window.open(`${API_BASE}${p.file_path}`, '_blank')}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(p)}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Edit Payslip</h3>
                            <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editData.month}
                                        onChange={(e) => setEditData({ ...editData, month: e.target.value })}
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        min="2020"
                                        max="2030"
                                        value={editData.year}
                                        onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Replace File (Optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setEditFile(e.target.files[0])}
                                    accept="image/*,application/pdf"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current file.</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditModal(false)}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editLoading}
                                    className={`flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all ${editLoading ? 'opacity-70' : ''}`}>
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayslips;
