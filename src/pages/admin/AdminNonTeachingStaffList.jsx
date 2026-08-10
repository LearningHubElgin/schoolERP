import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const AdminNonTeachingStaffList = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [viewStaff, setViewStaff] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);
    const [existingPhoto, setExistingPhoto] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        designation: '',
        joining_date: '',
        address: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        emergency_contact: '',
        department: 'General',
        status: 'Active',
        photo: null
    });

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/non-teaching-staff`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setStaffList(data.staff);
            } else {
                toast.error(data.message || 'Failed to fetch staff list');
            }
        } catch (error) {
            console.error('Fetch staff error:', error);
            toast.error('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.designation || !formData.gender) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        toast.loading('Adding staff member...');

        try {
            const token = localStorage.getItem('token');
            const url = editId ? `${API_URL}/api/admin/non-teaching-staff/${editId}` : `${API_URL}/api/admin/non-teaching-staff`;
            const method = editId ? 'PUT' : 'POST';

            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const data = await response.json();
            toast.dismiss();

            if (data.success) {
                toast.success(editId ? 'Staff updated successfully!' : 'Staff added successfully!');
                setFormData({
                    name: '', email: '', phone: '', designation: '',
                    joining_date: '', address: '', date_of_birth: '',
                    gender: '', blood_group: '', emergency_contact: '', 
                    department: 'General', status: 'Active', photo: null
                });
                setExistingPhoto(null);
                setShowAddForm(false);
                setEditId(null);
                fetchStaff();
            } else {
                toast.error(data.message || 'Failed to save staff');
            }
        } catch (error) {
            console.error('Add staff error:', error);
            toast.dismiss();
            toast.error('Server connection failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewClick = (staff) => {
        setViewStaff(staff);
    };

    const handleEditClick = (staff) => {
        setFormData({
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            designation: staff.designation,
            joining_date: staff.joining_date ? staff.joining_date.split('T')[0] : '',
            address: staff.address || '',
            date_of_birth: staff.date_of_birth ? staff.date_of_birth.split('T')[0] : '',
            gender: staff.gender,
            blood_group: staff.blood_group || '',
            emergency_contact: staff.emergency_contact || '',
            department: staff.department || 'General',
            status: staff.status || 'Active',
            photo: null
        });
        setExistingPhoto(staff.photo || null);
        setEditId(staff.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;

        toast.loading('Deleting staff member...');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/non-teaching-staff/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            toast.dismiss();

            if (data.success) {
                toast.success('Staff member deleted successfully');
                fetchStaff();
            } else {
                toast.error(data.message || 'Failed to delete staff member');
            }
        } catch (error) {
            console.error('Delete staff error:', error);
            toast.dismiss();
            toast.error('Server connection failed');
        }
    };

    return (
        <div className="space-y-6 relative">
            
            {/* --- VIEW STAFF MODAL --- */}
            {viewStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setViewStaff(null)}></div>
                    <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 flex justify-between items-start relative overflow-hidden">
                            {/* Decorative bubbles */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
                            <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
                            
                            <div className="flex items-center gap-6 relative z-10 w-full">
                                <div className="w-24 h-24 bg-white shadow-xl text-blue-600 rounded-2xl flex items-center justify-center text-4xl font-bold border-2 border-white/20 overflow-hidden">
                                    {viewStaff.photo ? (
                                        <img src={`${API_URL}${viewStaff.photo}`} alt={viewStaff.name} className="w-full h-full object-cover" />
                                    ) : (
                                        viewStaff.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{viewStaff.name}</h3>
                                    <div className="flex items-center flex-wrap gap-4 mt-2 text-lg">
                                        <p className="text-blue-100 font-medium flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                            {viewStaff.designation}
                                        </p>
                                        <span className="shadow-sm py-1 px-3 text-sm flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold border border-white/20">
                                            <div className={`w-2 h-2 rounded-full ${viewStaff.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            {viewStaff.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setViewStaff(null)} className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all relative z-10 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Details Body */}
                        <div className="overflow-y-auto p-8 flex-1 space-y-6 bg-gray-50/50">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 tracking-wide mb-5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                        Contact Information
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Employee ID</span>
                                            <span className="font-mono text-gray-800 font-bold text-sm mt-1 bg-gray-100 self-start px-2 py-1 rounded inline-block">{viewStaff.employee_id}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Phone Number</span>
                                            <span className="text-gray-800 font-semibold mt-1">{viewStaff.phone}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Email Address</span>
                                            <span className="text-gray-800 font-semibold mt-1">{viewStaff.email}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Emergency Contact</span>
                                            <span className="text-gray-800 font-semibold mt-1">{viewStaff.emergency_contact || 'None Provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Personal Info Card */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 tracking-wide mb-5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                        Personal & Employment
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Gender</span>
                                            <span className="text-gray-800 font-semibold mt-1">{viewStaff.gender}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Blood Group</span>
                                            {viewStaff.blood_group ? (
                                                <span className="text-red-700 font-bold mt-1 bg-red-50 border border-red-100 self-start px-2 py-0.5 rounded shadow-sm">{viewStaff.blood_group}</span>
                                            ) : (
                                                <span className="text-gray-500 font-medium mt-1 italic">Not Specified</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Date of Birth</span>
                                            <span className="text-gray-800 font-semibold mt-1 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                                {viewStaff.date_of_birth ? new Date(viewStaff.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not Provided'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Joined Date</span>
                                            <span className="text-gray-800 font-semibold mt-1 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                                {viewStaff.joining_date ? new Date(viewStaff.joining_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Address Card */}
                                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 tracking-wide mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        Residential Address
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100">
                                        {viewStaff.address || <span className="text-gray-400 italic">No address information provided.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white z-20 px-8 py-5 border-t border-gray-100 flex justify-end gap-4 rounded-b-3xl">
                            <button onClick={() => setViewStaff(null)} className="px-8 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all shadow-sm">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADD/EDIT STAFF MODAL --- */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => { setShowAddForm(false); setEditId(null); setExistingPhoto(null); }}></div>
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                        
                        {/* Modal Header (Sticky) */}
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-6 py-4 border-b flex justify-between items-center rounded-t-2xl shadow-sm">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-800">
                                <span className="text-3xl bg-blue-100 p-2 rounded-xl">🧑‍🔧</span> 
                                {editId ? 'Edit Support Staff' : 'Add New Support Staff'}
                            </h2>
                            <button 
                                onClick={() => { setShowAddForm(false); setEditId(null); setExistingPhoto(null); }} 
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="addStaffForm" onSubmit={handleSubmit} className="space-y-8">
                                {/* Personal Information */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (Optional)</label>
                                            <div className="flex items-center gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                {/* Preview Avatar */}
                                                <div className="w-20 h-20 shrink-0 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shadow-inner">
                                                    {formData.photo && formData.photo instanceof File ? (
                                                        <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : existingPhoto ? (
                                                        <img src={`${API_URL}${existingPhoto}`} alt="Existing" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-3xl">📸</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors focus:outline-none" />
                                                    <p className="mt-2 text-xs text-gray-500 font-medium">PNG, JPG or JPEG. Square images recommended.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Enter full name" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="staff@school.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Contact number" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                            <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors">
                                                <option value="">Select Blood Group</option>
                                                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Enter complete residential address"></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Information */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">Employment Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                                            <input type="text" name="designation" value={formData.designation} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="e.g., Peon, Clerk, Security Guard" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="e.g., Administration, Maintenance" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                                            <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                            <input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Emergency phone number" />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Information (Only for Edit) */}
                                {editId && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">Account Status</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors">
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                        
                        {/* Modal Footer (Sticky) */}
                        <div className="sticky bottom-0 bg-gray-50 z-20 px-6 py-4 border-t flex justify-end gap-4 rounded-b-2xl shadow-sm">
                            <button 
                                type="button" 
                                onClick={() => { setShowAddForm(false); setEditId(null); setExistingPhoto(null); }} 
                                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="addStaffForm"
                                disabled={submitting} 
                                className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 shadow-md"
                            >
                                {submitting ? 'Saving...' : 'Save Staff Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LIST VIEW HEADER --- */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-800 p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-4">
                    <span className="text-4xl translate-y-1">🧑‍🔧</span>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Non Teaching Staff</h1>
                        <p className="text-blue-100 mt-1 font-medium">Manage and view all support staff details</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            name: '', email: '', phone: '', designation: '',
                            joining_date: '', address: '', date_of_birth: '',
                            gender: '', blood_group: '', emergency_contact: '', status: 'Active', photo: null
                        });
                        setExistingPhoto(null);
                        setEditId(null);
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-800 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-md transform hover:-translate-y-1"
                >
                    <span className="text-xl">➕</span> Add New Staff
                </button>
            </div>

            {/* --- LIST TABLE --- */}
            <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading staff list...</div>
                ) : staffList.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <span className="text-7xl mb-4 drop-shadow-sm">📭</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Non-Teaching Staff Found</h2>
                        <p className="text-gray-500 max-w-sm">You haven't added any support staff records yet. Click the button above to register your first staff member.</p>
                        <button onClick={() => setShowAddForm(true)} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md font-bold hover:-translate-y-0.5 transform">
                            + Add Your First Staff Member
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4 font-bold text-gray-700">Employee ID</th>
                                    <th className="px-6 py-4 font-bold text-gray-700">Name</th>
                                    <th className="px-6 py-4 font-bold text-gray-700">Designation/Dept</th>
                                    <th className="px-6 py-4 font-bold text-gray-700">Contact</th>
                                    <th className="px-6 py-4 font-bold text-gray-700">Joined</th>
                                    <th className="px-6 py-4 font-bold text-gray-700 text-center">Status</th>
                                    <th className="px-6 py-4 font-bold text-gray-700 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {staffList.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200 group-hover:bg-white transition-colors">
                                                {staff.employee_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 shrink-0 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                    {staff.photo ? (
                                                        <img src={`${API_URL}${staff.photo}`} alt={staff.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 font-bold text-sm shadow-sm">{staff.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-[15px]">{staff.name}</div>
                                                    {staff.gender && <div className="text-xs text-gray-500 mt-0.5">{staff.gender}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100 inline-block">
                                                {staff.designation}
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-wider">
                                                {staff.department || 'General'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800">{staff.phone}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{staff.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                                            {staff.joining_date ? new Date(staff.joining_date).toLocaleDateString('en-GB') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={staff.status === 'Active' ? 'success' : 'danger'} className="shadow-sm">
                                                {staff.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewClick(staff)}
                                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                                                    title="View"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleEditClick(staff)}
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(staff.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminNonTeachingStaffList;
