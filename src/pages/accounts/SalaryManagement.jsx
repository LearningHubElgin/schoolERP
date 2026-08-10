import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { toast } from 'react-hot-toast';

const SalaryManagement = () => {
    const [activeTab, setActiveTab] = useState('payslips'); // 'payslips' or 'manage'
    const [payslips, setPayslips] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Upload Form State
    const [formData, setFormData] = useState({
        teacher_id: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        title: ''
    });
    const [file, setFile] = useState(null);

    // Editing State for Salary
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [salaryData, setSalaryData] = useState({
        basic_salary: 0,
        allowance: 0,
        deduction: 0
    });

    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [teachersRes, payslipsRes] = await Promise.all([
                axios.get(`${API_URL}/api/accounts/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/accounts/payslips`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (teachersRes.data.success) {
                setTeachers(teachersRes.data.teachers);
            }
            if (payslipsRes.data.success) setPayslips(payslipsRes.data.payslips);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.teacher_id || !file) {
            toast.error("Please select a teacher and file");
            return;
        }

        const data = new FormData();
        data.append('teacher_id', formData.teacher_id);
        data.append('month', formData.month);
        data.append('year', formData.year);
        data.append('title', formData.title || `Payslip ${formData.month} ${formData.year}`);
        data.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/accounts/payslips`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success("Payslip uploaded successfully");
                setFormData({ ...formData, teacher_id: '', title: '' });
                setFile(null);
                document.getElementById('fileInput').value = '';
                fetchInitialData();
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload payslip");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payslip?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/accounts/payslips/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Payslip deleted");
            fetchInitialData();
        } catch (error) {
            toast.error("Failed to delete payslip");
        }
    };

    const handleEditSalary = (teacher) => {
        setEditingTeacher(teacher.id);
        setSalaryData({
            basic_salary: teacher.basic_salary || 0,
            allowance: teacher.allowance || 0,
            deduction: teacher.deduction || 0
        });
    };

    const handleUpdateSalary = async (teacherId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/accounts/teachers/${teacherId}/salary`, salaryData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Salary updated successfully");
            setEditingTeacher(null);
            fetchInitialData();
        } catch (error) {
            console.error("Update salary error:", error);
            toast.error("Failed to update salary");
        }
    };

    const payslipColumns = [
        { header: 'Date', accessor: 'created_at', render: (row) => new Date(row.created_at).toLocaleDateString() },
        { header: 'Teacher', accessor: 'teacher_name', render: (row) => <span className="font-medium">{row.teacher_name}</span> },
        { header: 'Month/Year', accessor: 'month', render: (row) => `${row.month} ${row.year}` },
        { header: 'Title', accessor: 'title' },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-3">
                    <a
                        href={`${API_URL}${row.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        View
                    </a>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700">
                        Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">🧾 Salary Management</h1>

            {/* Tabs */}
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'payslips' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('payslips')}
                >
                    Upload Payslips
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('manage')}
                >
                    Manage Teachers Salary
                </button>
            </div>

            {activeTab === 'payslips' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Form */}
                    <div className="lg:col-span-1">
                        <Card title="Upload Salary Slip">
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Teacher</label>
                                    <select
                                        value={formData.teacher_id}
                                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">-- Select Teacher --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.employee_id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Month</label>
                                        <select
                                            value={formData.month}
                                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                        >
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="e.g. Salary Slip Jan 2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Payslip File (PDF/Image)</label>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="w-full border rounded px-3 py-2"
                                        accept=".pdf,image/*"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">Upload Payslip</Button>
                            </form>
                        </Card>
                    </div>

                    {/* Payslip List */}
                    <div className="lg:col-span-2">
                        <Card title="Recent Payslips">
                            <Table columns={payslipColumns} data={payslips} isLoading={loading} />
                            {payslips.length === 0 && !loading && (
                                <p className="text-center text-gray-500 py-4">No payslips found.</p>
                            )}
                        </Card>
                    </div>
                </div>
            ) : (
                <Card title="Manage Teachers Salary Structure">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary (₹)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowance (₹)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction (₹)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary (₹)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.employee_id}</td>
                                        {editingTeacher === teacher.id ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={salaryData.basic_salary}
                                                        onChange={(e) => setSalaryData({ ...salaryData, basic_salary: e.target.value })}
                                                        className="w-24 border rounded px-2 py-1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={salaryData.allowance}
                                                        onChange={(e) => setSalaryData({ ...salaryData, allowance: e.target.value })}
                                                        className="w-24 border rounded px-2 py-1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={salaryData.deduction}
                                                        onChange={(e) => setSalaryData({ ...salaryData, deduction: e.target.value })}
                                                        className="w-24 border rounded px-2 py-1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                    {(parseFloat(salaryData.basic_salary || 0) + parseFloat(salaryData.allowance || 0) - parseFloat(salaryData.deduction || 0)).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleUpdateSalary(teacher.id)} className="text-green-600 hover:text-green-900">Save</button>
                                                        <button onClick={() => setEditingTeacher(null)} className="text-gray-600 hover:text-gray-900">Cancel</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(teacher.basic_salary).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(teacher.allowance).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-{Number(teacher.deduction).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                    {(Number(teacher.basic_salary) + Number(teacher.allowance) - Number(teacher.deduction)).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button onClick={() => handleEditSalary(teacher)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default SalaryManagement;
