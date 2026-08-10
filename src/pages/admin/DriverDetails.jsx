import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import { User, Mail, Phone, Shield, Bus, Search, Trash2, Edit } from 'lucide-react';

const DriverDetails = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNo: '',
        experience: '',
        status: 'active'
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/transport/drivers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setDrivers(response.data.drivers.map(d => ({
                    ...d,
                    status: d.user_status,
                    driver_status: d.driver_status
                })));
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = { ...formData };
            
            let response;
            if (isEditMode) {
                response = await axios.put(`${API_URL}/api/transport/drivers/${selectedId}`, data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                response = await axios.post(`${API_URL}/api/transport/drivers`, data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                alert(isEditMode ? 'Driver updated successfully' : 'Driver registered successfully. Credentials: Email as ID, Phone as Password');
                closeModal();
                fetchDrivers();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving driver');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this driver? All associated tracking and travel history will be removed.')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/api/transport/drivers/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                alert('Driver deleted successfully');
                fetchDrivers();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting driver');
        }
    };

    const openEditModal = (driver) => {
        setFormData({
            name: driver.name,
            email: driver.email || '',
            phone: driver.phone,
            licenseNo: driver.license_no || '',
            experience: driver.experience_years || '',
            status: driver.status
        });
        setSelectedId(driver.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setSelectedId(null);
        setFormData({ name: '', email: '', phone: '', licenseNo: '', experience: '', status: 'active' });
    };

    const columns = [
        { 
            header: 'Driver Name', 
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{row.name}</p>
                        <p className="text-xs text-slate-500">ID: #{row.id}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Contact Info', 
            accessor: 'email',
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3 h-3 text-indigo-400" />
                        {row.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3 h-3 text-indigo-400" />
                        {row.phone}
                    </div>
                </div>
            )
        },
        {
            header: 'License Details',
            accessor: 'license_no',
            render: (row) => (
                <div className="space-y-1">
                    <p className="font-bold text-slate-800">{row.license_no || 'Not Set'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{row.experience_years ? `${row.experience_years} YRS EXP` : 'No Exp Listed'}</p>
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
                    {row.status.toUpperCase()}
                </Badge>
            )
        },
        { 
            header: 'Credentials', 
            accessor: 'loginId',
            render: (row) => (
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Login Details</p>
                    <p className="text-xs text-indigo-600 font-mono">ID: {row.email}</p>
                    <p className="text-xs text-indigo-600 font-mono">PW: {row.phone}</p>
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => openEditModal(row)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                        title="Edit Driver"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                        title="Delete Driver"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Driver Registry 🚌</h1>
                            <p className="mt-2 text-indigo-100 text-sm md:text-lg max-w-2xl">
                                Manage and monitor fleet operators across various routes.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-black/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Bus className="w-5 h-5" />
                            Enroll Driver
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
            </div>

            {/* Main Content */}
            <Card variant="elevated">
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search by name, email or phone..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="info">{filteredDrivers.length} Total Drivers</Badge>
                    </div>
                </div>

                <Table columns={columns} data={filteredDrivers} />
            </Card>

            {/* Registration Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? "Modify Driver Profile" : "Register Fleet Operator"}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit}>{isEditMode ? "Save Changes" : "Create Driver Account"}</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            <Shield className="w-4 h-4 inline mr-1 -mt-0.5" />
                            Account security: Login ID will be the <b>Email</b> and default Password will be the <b>Mobile Number</b>.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Input 
                            label="Operator Full Name" 
                            placeholder="e.g. Sunil Singh"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        <Input 
                            label="Email Address (Login ID)" 
                            type="email"
                            placeholder="driver@school.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <Input 
                            label="Mobile Number (Login Password)" 
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="License Number" 
                                placeholder="DL-XXXXXXXX"
                                value={formData.licenseNo}
                                onChange={e => setFormData({...formData, licenseNo: e.target.value})}
                            />
                            <Input 
                                label="Exp. (Years)" 
                                type="number"
                                placeholder="5"
                                value={formData.experience}
                                onChange={e => setFormData({...formData, experience: e.target.value})}
                            />
                        </div>
                        {isEditMode && (
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Account Status</label>
                                <div className="flex gap-3">
                                    {['active', 'inactive'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData({...formData, status: s})}
                                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold border transition-all ${
                                                formData.status === s 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            {s.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DriverDetails;
