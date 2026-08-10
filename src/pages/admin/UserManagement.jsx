import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';

const StatCard = ({ title, value, icon, color, borderColor, onClick }) => {
    // Map tailwind border classes to hex colors for inline style fallback
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-cyan-500': '#06b6d4',
        'border-indigo-500': '#6366f1',
        'border-emerald-500': '#10b981',
        'border-purple-500': '#a855f7',
        'border-orange-500': '#f97316',
        'border-red-500': '#ef4444',
        'border-teal-500': '#14b8a6',
    };

    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full border-l-4 ${borderColor}`}
            style={{ borderLeftColor: borderColors[borderColor] }}
            onClick={onClick}
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

const UserManagement = () => {
    const navigate = useNavigate();
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterRole, setFilterRole] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10
    });
    const [roleStats, setRoleStats] = useState([]);

    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Accountant',
        email: '',
        phone: '',
    });

    const fetchUsers = async (page = 1, role = filterRole, search = searchTerm) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/users`, {
                params: {
                    page,
                    limit: pagination.limit,
                    role,
                    search
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const formattedUsers = response.data.users.map(user => ({
                    ...user,
                    role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
                    status: (user.status || 'Active').charAt(0).toUpperCase() + (user.status || 'Active').slice(1),
                    joinedDate: user.created_at ? (() => {
                        const d = new Date(user.created_at);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                    })() : 'N/A'
                }));
                setUserList(formattedUsers);
                setPagination(response.data.pagination);
                setRoleStats(response.data.roleStats || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const isFirstRender = React.useRef(true);

    useEffect(() => {
        fetchUsers(1, filterRole, searchTerm);
    }, [filterRole]);

    // Debounced search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetchUsers(1, filterRole, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchUsers(newPage, filterRole, searchTerm);
        }
    };

    const getStat = (roleName) => {
        if (roleName === 'Total') {
            return roleStats.reduce((acc, current) => acc + current.count, 0);
        }
        const stat = roleStats.find(s => s.role.toLowerCase() === roleName.toLowerCase());
        return stat ? stat.count : 0;
    };

    const filteredUsers = filterRole === 'All'
        ? userList
        : userList.filter(u => u.role === filterRole);

    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            role: 'Accountant',
            email: '',
            phone: '',
        });
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            role: user.role,
            email: user.email,
            phone: user.phone,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const method = editingUser ? 'PUT' : 'POST';
            const url = editingUser ? `${API_URL}/api/admin/users/${editingUser.id}` : `${API_URL}/api/admin/users`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert(editingUser ? 'User updated successfully' : 'User created successfully');
                setIsModalOpen(false);
                fetchUsers();
                setFormData({
                    name: '',
                    role: 'Accountant',
                    email: '',
                    phone: '',
                });
                setEditingUser(null);
            } else {
                alert(data.message || 'Failed to process request');
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            alert('Error processing request');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'Active' ? 'inactive' : 'active';

            await axios.put(`${API_URL}/api/admin/users/${userId}`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setUserList(userList.map(u =>
                u.id === userId
                    ? { ...u, status: newStatus === 'active' ? 'Active' : 'Inactive' }
                    : u
            ));

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        {
            header: 'Role', accessor: 'role', render: (row) => (
                <Badge variant={
                    row.role === 'Admin' ? 'danger' :
                        row.role === 'Teacher' ? 'success' :
                            row.role === 'Accountant' ? 'warning' :
                                row.role === 'Storemanager' ? 'info' :
                                    row.role === 'Driver' ? 'success' :
                                        row.role === 'Security' ? 'danger' :
                                            row.role === 'Nonteachingstaff' ? 'success' :
                                                'info'
                }>
                    {row.role}
                </Badge>
            )
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Joined Date', accessor: 'joinedDate' },
        {
            header: 'Status', accessor: 'status', render: (row) => (
                <Badge variant={row.status === 'Active' ? 'active' : 'inactive'}>
                    {row.status}
                </Badge>
            )
        },
    ];

    const actions = (row) => (
        <>
            {/* Hide Edit button for Student and Teacher roles */}
            {row.role !== 'Student' && row.role !== 'Teacher' && (
                <Button variant="primary" size="sm" onClick={() => handleEditUser(row)}>
                    Edit
                </Button>
            )}
        </>
    );

    const Pagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (
                i === 1 ||
                i === pagination.totalPages ||
                (i >= pagination.page - 1 && i <= pagination.page + 1)
            ) {
                pages.push(i);
            } else if (
                i === pagination.page - 2 ||
                i === pagination.page + 2
            ) {
                pages.push('...');
            }
        }

        const uniquePages = [...new Set(pages)];

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
                <p className="text-sm text-slate-500 order-2 sm:order-1">
                    Showing <span className="font-semibold text-slate-700">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(pagination.page * pagination.limit, pagination.totalRecords)}</span> of <span className="font-semibold text-slate-700">{pagination.totalRecords}</span> users
                </p>
                <div className="flex items-center gap-1 order-1 sm:order-2">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {uniquePages.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof p === 'number' && handlePageChange(p)}
                            disabled={p === '...'}
                            className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${p === pagination.page
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                : p === '...'
                                    ? 'border-transparent text-slate-400 cursor-default'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">User Management 👥</h1>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                        Manage all system users including students, teachers, staff, and administrators.
                    </p>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                        (students and teachers data can not manage here, if you manage teachers details then you go to <a href="/admin/teachers" className="font-bold text-white hover:underline">Teacher Management</a> page and if you manage students details then you go to <a href="/admin/students" className="font-bold text-white hover:underline">Student Management</a> page)
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={handleAddUser}
                            className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                        >
                            + Add New User
                        </button>
                        <button
                            onClick={() => fetchUsers()}
                            className="px-3 py-1.5 bg-indigo-700 bg-opacity-40 text-white border border-white/20 rounded-lg text-xs md:text-sm font-semibold hover:bg-opacity-50 transition-all active:scale-95"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                <StatCard
                    title="Total Users"
                    value={getStat('Total')}
                    icon="📊"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                    onClick={() => setFilterRole('All')}
                />
                <StatCard
                    title="Students"
                    value={getStat('Student')}
                    icon="🎓"
                    color="bg-cyan-100 text-cyan-600"
                    borderColor="border-cyan-500"
                    onClick={() => navigate('/admin/students')}
                />
                <StatCard
                    title="Teachers"
                    value={getStat('Teacher')}
                    icon="👨‍🏫"
                    color="bg-indigo-100 text-indigo-600"
                    borderColor="border-indigo-500"
                    onClick={() => navigate('/admin/teachers')}
                />
                <StatCard
                    title="Non Teaching Staff"
                    value={getStat('Nonteachingstaff')}
                    icon="🧑‍🔧"
                    color="bg-pink-100 text-pink-600"
                    borderColor="border-pink-500"
                    onClick={() => navigate('/admin/nonteaching-staff-list')}
                />
                <StatCard
                    title="Accountants"
                    value={getStat('Accountant')}
                    icon="💼"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                    onClick={() => setFilterRole('Accountant')}
                />
                <StatCard
                    title="Librarians"
                    value={getStat('Librarian')}
                    icon="📚"
                    color="bg-purple-100 text-purple-600"
                    borderColor="border-purple-500"
                    onClick={() => setFilterRole('Librarian')}
                />
                <StatCard
                    title="Admission"
                    value={getStat('Admission')}
                    icon="📋"
                    color="bg-orange-100 text-orange-600"
                    borderColor="border-orange-500"
                    onClick={() => setFilterRole('Admission')}
                />
                <StatCard
                    title="Store Managers"
                    value={getStat('Storemanager')}
                    icon="🏪"
                    color="bg-teal-100 text-teal-600"
                    borderColor="border-teal-500"
                    onClick={() => setFilterRole('Storemanager')}
                />
                <StatCard
                    title="Drivers"
                    value={getStat('Driver')}
                    icon="🚌"
                    color="bg-teal-100 text-teal-600"
                    borderColor="border-teal-500"
                    onClick={() => navigate('/admin/drivers')}
                />
                <StatCard
                    title="Security Guards"
                    value={getStat('Security')}
                    icon="👮"
                    color="bg-red-100 text-red-600"
                    borderColor="border-red-500"
                    onClick={() => setFilterRole('Security')}
                />
                <StatCard
                    title="Admins"
                    value={getStat('Admin')}
                    icon="🔐"
                    color="bg-red-100 text-red-600"
                    borderColor="border-red-500"
                    onClick={() => setFilterRole('Admin')}
                />
            </div>

            {/* User Table */}
            <Card title="All Users" subtitle={`${pagination.totalRecords} total users found`} variant="elevated">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="w-full md:w-64">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Search Users</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role Filter</label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full md:w-auto px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700"
                            >
                                <option value="All">All Roles</option>
                                <option value="Student">Students</option>
                                <option value="Teacher">Teachers</option>
                                <option value="Nonteachingstaff">Non Teaching Staff</option>
                                <option value="Accountant">Accountants</option>
                                <option value="Librarian">Librarians</option>
                                <option value="Admission">Admission</option>
                                <option value="Storemanager">Store Managers</option>
                                <option value="Driver">Drivers</option>
                                <option value="Security">Security Guards</option>
                                <option value="Admin">Admins</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Table columns={columns} data={userList} actions={actions} isLoading={loading} />

                <Pagination />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Add New User'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingUser ? 'Update User' : 'Add User'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Accountant">Accountant</option>
                                <option value="Librarian">Librarian</option>
                                <option value="Admission">Admission</option>
                                <option value="Storemanager">Store Manager</option>
                                <option value="Driver">Driver</option>
                                <option value="Security">Security Guard</option>
                                <option value="Nonteachingstaff">Non Teaching Staff</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <Input
                            label={formData.role === 'Admission' ? "Email / Login ID" : "Email"}
                            type="text"
                            placeholder={formData.role === 'Admission' ? "e.g. admission" : "e.g. name@email.com"}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            label="Phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;