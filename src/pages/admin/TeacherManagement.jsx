import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import jsPDF from 'jspdf';
import { compressImage } from '../../utils/imageCompressor';
const StatCard = ({ title, value, icon, color, borderColor }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-cyan-500': '#06b6d4',
        'border-indigo-500': '#6366f1',
        'border-emerald-500': '#10b981',
        'border-purple-500': '#a855f7',
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
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 whitespace-nowrap">{value}</p>
                </div>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl ${color} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const TeacherDetailCard = ({ icon, iconColor, label, value, fullWidth = false }) => (
    <div className={`flex items-center p-2.5 sm:p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs hover:border-blue-200 transition-all ${fullWidth ? 'col-span-full w-full' : 'h-full'}`}>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-xs ${iconColor}`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0 pl-2.5">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block mb-0.5 tracking-wider leading-none">{label}</span>
            <span className="text-xs font-bold text-slate-800 break-words block leading-tight" title={value}>{value}</span>
        </div>
    </div>
);

const TeacherManagement = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('list'); // 'list' or 'add'
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [registerFormData, setRegisterFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        qualification: '',
        experience: '',
        joiningDate: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        emergencyContact: '',
        can_manage_students: false
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
    const [previewDoc, setPreviewDoc] = useState({ isOpen: false, url: null, title: null });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const downloadMenuRef = useRef(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    // Close download menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
                setShowDownloadMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTeachers(data.teachers);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete the teacher and their login account.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                alert('Teacher deleted successfully');
                fetchTeachers(); // Refresh list
            } else {
                alert('Failed to delete teacher');
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
        }
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setEditFormData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            subject: teacher.subject,
            qualification: teacher.qualification,
            experience: teacher.experience,
            joiningDate: teacher.joining_date ? new Date(teacher.joining_date).toISOString().split('T')[0] : '',
            address: teacher.address || '',
            status: teacher.status,
            dateOfBirth: teacher.date_of_birth ? new Date(teacher.date_of_birth).toISOString().split('T')[0] : '',
            gender: teacher.gender || '',
            emergencyContact: teacher.emergency_contact || '',
            can_manage_students: !!teacher.can_manage_students
        });
        setPhotoPreview(teacher.photo_path ? `${API_URL}${teacher.photo_path}` : null);
        setSelectedPhoto(null);
        setIsPhotoRemoved(false);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers/${selectedTeacher.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();
            if (data.success) {
                // Delete photo if user clicked Remove Photo and clicked Save Changes
                if (isPhotoRemoved && selectedTeacher.id) {
                    try {
                        await fetch(`${API_URL}/api/admin/teachers/${selectedTeacher.id}/photo`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                    } catch (err) {
                        console.error('Error deleting teacher photo on save:', err);
                    }
                }
                // Upload photo if selected
                else if (selectedPhoto) {
                    await handlePhotoUpload(selectedTeacher.id);
                }
                alert('Teacher updated successfully');
                setIsEditModalOpen(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
                setIsPhotoRemoved(false);
                fetchTeachers();
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('Server error');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(registerFormData)
            });

            const data = await response.json();

            if (data.success) {
                alert(`Teacher registered successfully! Employee ID: ${data.employeeId}`);
                // Reset form and go back to list
                setRegisterFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    qualification: '',
                    experience: '',
                    joiningDate: '',
                    address: '',
                    dateOfBirth: '',
                    gender: '',
                    emergencyContact: '',
                    can_manage_students: false
                });
                setView('list');
                fetchTeachers();
            } else {
                alert(data.message || 'Failed to register teacher');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Failed to connect to the server');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleView = (teacher) => {
        setSelectedTeacher(teacher);
        setIsViewModalOpen(true);
    };

    const handlePhotoSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, or WebP)');
                return;
            }
            try {
                const compressed = await compressImage(file);
                setSelectedPhoto(compressed);
                setPhotoPreview(URL.createObjectURL(compressed));
                setIsPhotoRemoved(false);
            } catch (error) {
                console.error('Error compressing image:', error);
                setSelectedPhoto(file);
                setPhotoPreview(URL.createObjectURL(file));
                setIsPhotoRemoved(false);
            }
        }
    };

    const handleRemovePhoto = () => {
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setIsPhotoRemoved(true);
    };

    const handlePhotoUpload = async (teacherId) => {
        if (!selectedPhoto) return;

        setUploadingPhoto(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('photo', selectedPhoto);

            const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Photo upload failed:', data.message);
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'employee_id' },
        {
            header: 'Name',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div
                        className={`w-9 h-9 rounded-full overflow-hidden bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center justify-center text-xs shrink-0 shadow-xs ${row.photo_path ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-indigo-400 transition-all' : ''}`}
                        onClick={() => row.photo_path && setPreviewDoc({ isOpen: true, url: `${API_URL}${row.photo_path}`, title: `${row.name}'s Photo` })}
                        title={row.photo_path ? "Click to view photo" : ""}
                    >
                        {row.photo_path ? (
                            <img
                                src={`${API_URL}${row.photo_path}`}
                                alt={row.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            row.name?.charAt(0)?.toUpperCase() || 'T'
                        )}
                    </div>
                    <span className="font-semibold text-slate-800">{row.name}</span>
                </div>
            )
        },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Phone', accessor: 'phone' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
                    {row.status ? row.status.toUpperCase() : 'N/A'}
                </Badge>
            )
        },
    ];

    const actions = (row) => (
        <div className="flex items-center gap-2 min-w-max">
            <Button size="sm" variant="secondary" onClick={() => handleView(row)}>View</Button>
            <Button size="sm" variant="primary" onClick={() => handleEdit(row)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
    );

    // Stats Calculations
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'active').length;
    const totalSubjects = new Set(teachers.map(t => t.subject)).size;

    const filteredTeachers = teachers.filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            (t.name && t.name.toLowerCase().includes(q)) ||
            (t.phone && String(t.phone).toLowerCase().includes(q)) ||
            (t.emergency_contact && String(t.emergency_contact).toLowerCase().includes(q)) ||
            (t.email && t.email.toLowerCase().includes(q)) ||
            (t.subject && t.subject.toLowerCase().includes(q)) ||
            (t.employee_id && t.employee_id.toLowerCase().includes(q)) ||
            (t.qualification && t.qualification.toLowerCase().includes(q))
        );
    });

    // Pagination calculations
    const totalItems = filteredTeachers.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);



    // Download Handlers
    const handleDownloadPDF = async () => {
        setShowDownloadMenu(false);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('l', 'mm', 'a4');
            const schoolName = localStorage.getItem('schoolName') || 'School';

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`${schoolName} - Teacher List`, 14, 15);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total: ${filteredTeachers.length} teachers`, 14, 22);

            const tableData = filteredTeachers.map(t => [
                t.employee_id || '',
                t.name || '',
                t.subject || '',
                t.phone || '',
                t.email || '',
                t.qualification || '',
                t.experience || '',
                t.status || ''
            ]);

            const { default: autoTable } = await import('jspdf-autotable');
            autoTable(doc, {
                head: [['ID', 'Name', 'Subject', 'Phone', 'Email', 'Qualification', 'Experience', 'Status']],
                body: tableData,
                startY: 28,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 255] },
            });

            doc.save(`Teachers_List_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('PDF download error:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handleDownloadExcel = async () => {
        setShowDownloadMenu(false);
        try {
            const XLSX = await import('xlsx');
            const data = filteredTeachers.map(t => ({
                'Employee ID': t.employee_id || '',
                'Name': t.name || '',
                'Email': t.email || '',
                'Phone': t.phone || '',
                'Subject': t.subject || '',
                'Qualification': t.qualification || '',
                'Experience': t.experience || '',
                'Gender': t.gender || '',
                'Date of Birth': t.date_of_birth ? new Date(t.date_of_birth).toLocaleDateString() : '',
                'Joining Date': t.joining_date ? new Date(t.joining_date).toLocaleDateString() : '',
                'Emergency Contact': t.emergency_contact || '',
                'Address': t.address || '',
                'Status': t.status || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            worksheet['!cols'] = [
                { wch: 12 }, { wch: 22 }, { wch: 24 }, { wch: 14 },
                { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 10 },
                { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 10 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
            XLSX.writeFile(workbook, `Teachers_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error('Excel download error:', error);
            alert('Failed to download Excel. Please try again.');
        }
    };

    if (view === 'add') {
        return (
            <div className="space-y-4 md:space-y-8 pb-8">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight">Register New Teacher 👨‍🏫</h1>
                            <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                                Create a new teacher account with full profile details.
                            </p>
                        </div>
                        <button
                            onClick={() => setView('list')}
                            className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-white/20 transition-all active:scale-95"
                        >
                            ⬅ Back to Teachers
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    <Card variant="elevated" title="Teacher Registration">
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            {/* Section 1: Personal Details */}
                            <div>
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                                    <span>👤</span> Personal Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <Input
                                        small
                                        label="Full Name*"
                                        value={registerFormData.name}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                                        required
                                    />
                                    <Input
                                        small
                                        label="Email*"
                                        type="email"
                                        value={registerFormData.email}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                                        required
                                    />
                                    <Input
                                        small
                                        label="Phone Number*"
                                        type="tel"
                                        value={registerFormData.phone}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, phone: e.target.value })}
                                        required
                                    />
                                    <Input
                                        small
                                        label="Emergency Contact"
                                        type="tel"
                                        value={registerFormData.emergencyContact}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, emergencyContact: e.target.value })}
                                    />
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            value={registerFormData.dateOfBirth}
                                            onChange={(e) => setRegisterFormData({ ...registerFormData, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                                        <select
                                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            value={registerFormData.gender}
                                            onChange={(e) => setRegisterFormData({ ...registerFormData, gender: e.target.value })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Academic & Professional Details */}
                            <div>
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                                    <span>🎓</span> Academic & Professional
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <Input
                                        small
                                        label="Subject Specialization*"
                                        value={registerFormData.subject}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, subject: e.target.value })}
                                        required
                                    />
                                    <Input
                                        small
                                        label="Qualification*"
                                        value={registerFormData.qualification}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, qualification: e.target.value })}
                                        required
                                    />
                                    <Input
                                        small
                                        label="Experience (e.g. 5 years)"
                                        value={registerFormData.experience}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, experience: e.target.value })}
                                    />
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Joining Date*</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            value={registerFormData.joiningDate}
                                            onChange={(e) => setRegisterFormData({ ...registerFormData, joiningDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Address & Permissions */}
                            <div>
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                                    <span>📍</span> Address & Permissions
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                                        <textarea
                                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            rows="2"
                                            value={registerFormData.address}
                                            onChange={(e) => setRegisterFormData({ ...registerFormData, address: e.target.value })}
                                            placeholder="Enter full address"
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                                        <div>
                                            <h4 className="text-xs font-bold text-indigo-900">Student Management Permission</h4>
                                            <p className="text-[11px] text-indigo-600">Allow this teacher to manage students (Add, Edit, Delete)</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={registerFormData.can_manage_students}
                                                onChange={(e) => setRegisterFormData({ ...registerFormData, can_manage_students: e.target.checked })}
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <Button type="button" variant="secondary" size="sm" onClick={() => setView('list')} disabled={registerLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={registerLoading}>
                                    {registerLoading ? 'Registering...' : 'Register Teacher'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">Teacher Management 👨‍🏫</h1>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm max-w-2xl">
                        Manage teaching staff, subjects, and schedules.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 md:flex md:gap-4">
                        <button
                            onClick={() => setView('add')}
                            className="w-full md:w-auto px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                        >
                            + Add New Teacher
                        </button>
                        <button
                            onClick={fetchTeachers}
                            className="w-full md:w-auto px-3 py-1.5 bg-indigo-700 bg-opacity-40 text-white border border-white/20 rounded-lg text-xs md:text-sm font-semibold hover:bg-opacity-50 transition-all active:scale-95"
                        >
                            🔄 Refresh List
                        </button>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 md:gap-4">
                <StatCard
                    title="Total Teachers"
                    value={totalTeachers}
                    icon="👨‍🏫"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                />
                <StatCard
                    title="Active Teachers"
                    value={activeTeachers}
                    icon="✅"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                />
                <StatCard
                    title="Total Subjects"
                    value={totalSubjects}
                    icon="📚"
                    color="bg-purple-100 text-purple-600"
                    borderColor="border-purple-500"
                />
                <StatCard
                    title="On Leave"
                    value="0"
                    icon="📅"
                    color="bg-orange-100 text-orange-600"
                    borderColor="border-orange-500"
                />
            </div>

            {/* Teacher Directory */}
            <Card variant="elevated">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Teacher Directory</h3>
                        <p className="text-sm text-slate-500 mt-1">Showing {filteredTeachers.length} teachers</p>
                    </div>
                    <div className="relative" ref={downloadMenuRef}>
                        <button
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                            📥 Download
                            <svg className={`w-4 h-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showDownloadMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[180px]">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-lg">📄</span> Download as PDF
                                </button>
                                <button
                                    onClick={handleDownloadExcel}
                                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3 border-t border-gray-100"
                                >
                                    <span className="text-lg">📊</span> Download as Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mb-6 max-w-md">
                    <Input
                        placeholder="🔍 Search by teacher name, mobile number, subject, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-2xl border border-slate-100/80 mt-4">
                        <div className="relative flex items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-indigo-600"></div>
                            <span className="absolute text-xl">⏳</span>
                        </div>
                        <p className="text-slate-500 font-black text-sm tracking-widest uppercase mt-6 animate-pulse">
                            Loading Teacher Records...
                        </p>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Please wait while we retrieve the latest active directory</p>
                    </div>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={currentTeachers}
                            actions={actions}
                        />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
                                <p className="text-sm font-semibold text-slate-500">
                                    Showing <span className="text-slate-800">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> to{' '}
                                    <span className="text-slate-800">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                                    <span className="text-slate-800">{totalItems}</span> teachers
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Prev
                                    </button>

                                    {Array.from({ length: totalPages }, (_, idx) => {
                                        const pageNum = idx + 1;
                                        if (
                                            totalPages > 5 &&
                                            pageNum !== 1 &&
                                            pageNum !== totalPages &&
                                            Math.abs(pageNum - currentPage) > 1
                                        ) {
                                            if (pageNum === 2 && currentPage > 3) {
                                                return <span key={pageNum} className="px-2 text-slate-400 font-bold">...</span>;
                                            }
                                            if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                                                return <span key={pageNum} className="px-2 text-slate-400 font-bold">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${
                                                    currentPage === pageNum
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Teacher Details"
                size="lg"
                footer={
                    <div className="flex justify-end w-full">
                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                }
            >
                {selectedTeacher && (
                    <div className="space-y-3 pb-2">
                        {/* Dark Banner */}
                        <div className="-mx-6 -mt-4 bg-[#2a2b4b] px-6 py-6 text-white flex items-center gap-5">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#5c7cfa] border-4 border-[#3e3f61] shadow-lg flex-shrink-0 flex items-center justify-center text-3xl font-bold">
                                {selectedTeacher.photo_path ? (
                                    <img
                                        src={`${API_URL}${selectedTeacher.photo_path}`}
                                        alt={selectedTeacher.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    selectedTeacher.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-bold truncate">{selectedTeacher.name}</h2>
                                <p className="text-[#a5b4fc] text-xs font-medium mt-0.5">
                                    Teacher • {selectedTeacher.subject || 'Staff'}
                                </p>
                                <div className="mt-2">
                                    <span className={`text-[10px] px-3 py-0.5 rounded-full inline-block font-semibold capitalize border ${
                                        selectedTeacher.status === 'active'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                                    }`}>
                                        {selectedTeacher.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Responsive Grid: 2 cols on Mobile, 3 cols on Desktop */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                                iconColor="bg-blue-500"
                                label="EMPLOYEE ID"
                                value={selectedTeacher.employee_id || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4.5 1.253" /></svg>}
                                iconColor="bg-purple-500"
                                label="SUBJECT"
                                value={selectedTeacher.subject || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                                iconColor="bg-indigo-500"
                                label="EMAIL"
                                value={selectedTeacher.email || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>}
                                iconColor="bg-emerald-500"
                                label="PHONE"
                                value={selectedTeacher.phone || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
                                iconColor="bg-violet-500"
                                label="QUALIFICATION"
                                value={selectedTeacher.qualification || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                                iconColor="bg-rose-500"
                                label="EXPERIENCE"
                                value={selectedTeacher.experience || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                                iconColor="bg-pink-500"
                                label="JOINING DATE"
                                value={selectedTeacher.joining_date ? new Date(selectedTeacher.joining_date).toLocaleDateString('en-GB') : 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>}
                                iconColor="bg-amber-500"
                                label="DATE OF BIRTH"
                                value={selectedTeacher.date_of_birth ? new Date(selectedTeacher.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                                iconColor="bg-cyan-500"
                                label="GENDER"
                                value={selectedTeacher.gender || 'N/A'}
                            />

                            <TeacherDetailCard
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}
                                iconColor="bg-orange-500"
                                label="EMERGENCY CONTACT"
                                value={selectedTeacher.emergency_contact || 'N/A'}
                            />

                            {/* Full Width Residential Address */}
                            <TeacherDetailCard
                                fullWidth
                                icon={<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
                                iconColor="bg-pink-500"
                                label="RESIDENTIAL ADDRESS"
                                value={selectedTeacher.address || 'N/A'}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Teacher"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-200 border-2 sm:border-4 border-indigo-200 shadow-xs">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-400">
                                    {editFormData.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                            <label className="cursor-pointer px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs">
                                📁 {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </label>
                            <label className="cursor-pointer px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs">
                                📸 Take Photo (Camera)
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </label>
                            {(photoPreview || selectedPhoto || (selectedTeacher?.photo_path && !isPhotoRemoved)) && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95"
                                >
                                    🗑️ Remove Photo
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500">Auto-compressed (JPEG, PNG, WebP)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                        <Input label="Email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                        <Input label="Phone" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                        <Input label="Emergency Contact" value={editFormData.emergencyContact || ''} onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                value={editFormData.dateOfBirth || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                value={editFormData.gender || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <Input label="Subject" value={editFormData.subject} onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })} />
                        <Input label="Qualification" value={editFormData.qualification} onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })} />
                        <Input label="Experience" value={editFormData.experience} onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                value={editFormData.joiningDate}
                                onChange={(e) => setEditFormData({ ...editFormData, joiningDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="2"
                                value={editFormData.address || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="col-span-2 mt-2">
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-indigo-900">Student Management Permission</h4>
                                    <p className="text-xs text-indigo-600">Allow this teacher to manage students (Add, Edit, Delete)</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={editFormData.can_manage_students || false}
                                        onChange={(e) => setEditFormData({ ...editFormData, can_manage_students: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                isOpen={previewDoc.isOpen}
                onClose={() => setPreviewDoc({ isOpen: false, url: null, title: null })}
                title={previewDoc.title || 'Photo Preview'}
                size="md"
            >
                <div className="flex flex-col items-center justify-center p-2">
                    {previewDoc.url && (
                        <img
                            src={previewDoc.url}
                            alt="Photo Preview"
                            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default TeacherManagement;