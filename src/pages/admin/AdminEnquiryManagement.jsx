import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';

const AdminEnquiryManagement = () => {
    const [loading, setLoading] = useState(true);
    const [enquiries, setEnquiries] = useState([]);
    const [filteredEnquiries, setFilteredEnquiries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        source: '',
        assignedTo: '',
        search: ''
    });
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [formData, setFormData] = useState({
        student_name: '',
        date_of_birth: '',
        gender: '',
        class_applied: '',
        stream_id: '',
        father_name: '',
        mother_name: '',
        phone: '',
        alternate_phone: '',
        email: '',
        address: '',
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        assigned_to: '',
        remarks: ''
    });
    const [followUpData, setFollowUpData] = useState({
        follow_up_date: '',
        follow_up_notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [enquiries, filters]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch enquiries
            const enquiriesRes = await axios.get(`${API_URL}/api/admin/enquiries`, { headers });
            if (enquiriesRes.data.success) {
                setEnquiries(enquiriesRes.data.enquiries);
                setFilteredEnquiries(enquiriesRes.data.enquiries);
            }

            // Fetch classes
            const classesRes = await axios.get(`${API_URL}/api/admin/classes`, { headers });
            if (classesRes.data.success) setClasses(classesRes.data.classes);

            // Fetch streams
            const streamsRes = await axios.get(`${API_URL}/api/admin/streams`, { headers });
            if (streamsRes.data.success) setStreams(streamsRes.data.streams);

            // Fetch admission/ admin staff for assignment
            const staffRes = await axios.get(`${API_URL}/api/admin/users?role=admission,admin`, { headers });
            if (staffRes.data.success) setStaffList(staffRes.data.users);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...enquiries];
        if (filters.status) filtered = filtered.filter(e => e.status === filters.status);
        if (filters.source) filtered = filtered.filter(e => e.source === filters.source);
        if (filters.assignedTo) filtered = filtered.filter(e => e.assigned_to === parseInt(filters.assignedTo));
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(e =>
                e.student_name?.toLowerCase().includes(searchLower) ||
                e.phone?.includes(searchLower) ||
                e.father_name?.toLowerCase().includes(searchLower)
            );
        }
        setFilteredEnquiries(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormData({
            student_name: '',
            date_of_birth: '',
            gender: '',
            class_applied: '',
            stream_id: '',
            father_name: '',
            mother_name: '',
            phone: '',
            alternate_phone: '',
            email: '',
            address: '',
            source: 'Website',
            status: 'New',
            priority: 'Medium',
            assigned_to: '',
            remarks: ''
        });
        setEditingEnquiry(null);
    };

    const handleOpenModal = (enquiry = null) => {
        if (enquiry) {
            setEditingEnquiry(enquiry);
            setFormData({
                student_name: enquiry.student_name || '',
                date_of_birth: enquiry.date_of_birth?.split('T')[0] || '',
                gender: enquiry.gender || '',
                class_applied: enquiry.class_applied || '',
                stream_id: enquiry.stream_id || '',
                father_name: enquiry.father_name || '',
                mother_name: enquiry.mother_name || '',
                phone: enquiry.phone || '',
                alternate_phone: enquiry.alternate_phone || '',
                email: enquiry.email || '',
                address: enquiry.address || '',
                source: enquiry.source || 'Website',
                status: enquiry.status || 'New',
                priority: enquiry.priority || 'Medium',
                assigned_to: enquiry.assigned_to || '',
                remarks: enquiry.remarks || ''
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingEnquiry
                ? `${API_URL}/api/admin/enquiries/${editingEnquiry.id}`
                : `${API_URL}/api/admin/enquiries`;
            const method = editingEnquiry ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(editingEnquiry ? 'Enquiry updated!' : 'Enquiry created!');
                setShowModal(false);
                fetchInitialData();
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to save enquiry');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/enquiries/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Enquiry deleted');
            fetchInitialData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete');
        }
    };

    const handleOpenFollowUp = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setFollowUpData({
            follow_up_date: enquiry.follow_up_date?.split('T')[0] || '',
            follow_up_notes: enquiry.follow_up_notes || ''
        });
        setShowFollowUpModal(true);
    };

    const handleSaveFollowUp = async () => {
        if (!followUpData.follow_up_date) {
            toast.error('Please select follow-up date');
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/api/admin/enquiries/${selectedEnquiry.id}/follow-up`,
                followUpData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success('Follow-up scheduled');
                setShowFollowUpModal(false);
                fetchInitialData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Follow-up error:', error);
            toast.error('Failed to save follow-up');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConvertToApplication = async (enquiry) => {
        if (!window.confirm('Convert this enquiry to an admission application?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/admin/enquiries/${enquiry.id}/convert`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success('Converted to application!');
                fetchInitialData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Conversion error:', error);
            toast.error('Failed to convert');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'New': 'info',
            'Contacted': 'warning',
            'Follow-up Scheduled': 'primary',
            'Converted': 'success',
            'Dropped': 'danger'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const variants = { 'High': 'danger', 'Medium': 'warning', 'Low': 'default' };
        return <Badge variant={variants[priority]}>{priority}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading enquiries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">
                            📞 Enquiry Management
                        </h1>
                        <p className="mt-1 text-purple-100 text-xs md:text-sm">
                            Track and manage student enquiries, follow-ups, and conversions
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                    >
                        + New Enquiry
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-pink-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select className="w-full px-4 py-2 border rounded-lg" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                            <option value="">All</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                            <option value="Converted">Converted</option>
                            <option value="Dropped">Dropped</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                        <select className="w-full px-4 py-2 border rounded-lg" value={filters.source} onChange={(e) => handleFilterChange('source', e.target.value)}>
                            <option value="">All</option>
                            <option value="Website">Website</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Referral">Referral</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Phone Call">Phone Call</option>
                            <option value="Advertisement">Advertisement</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                        <select className="w-full px-4 py-2 border rounded-lg" value={filters.assignedTo} onChange={(e) => handleFilterChange('assignedTo', e.target.value)}>
                            <option value="">All</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input type="text" placeholder="Name, Phone, Father's name" className="w-full px-4 py-2 border rounded-lg" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                    </div>
                </div>
            </Card>

            {/* Enquiries Table */}
            <Card title="Enquiries List" subtitle={`${filteredEnquiries.length} record(s)`} variant="elevated">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Enquiry No</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Follow-up</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEnquiries.map((enq) => (
                                <tr key={enq.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-mono">{enq.enquiry_number}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{enq.student_name}</div>
                                        <div className="text-xs text-gray-500">{enq.father_name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{enq.class_applied}</td>
                                    <td className="px-4 py-3 text-sm">{enq.phone}</td>
                                    <td className="px-4 py-3 text-sm">{enq.source}</td>
                                    <td className="px-4 py-3">{getStatusBadge(enq.status)}</td>
                                    <td className="px-4 py-3">{getPriorityBadge(enq.priority)}</td>
                                    <td className="px-4 py-3 text-sm">{enq.assigned_to_name || 'Unassigned'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {enq.follow_up_date ? new Date(enq.follow_up_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <button 
                                                onClick={() => handleOpenModal(enq)} 
                                                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                onClick={() => handleOpenFollowUp(enq)} 
                                                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
                                            >
                                                📅 Follow-up
                                            </button>
                                            {enq.status !== 'Converted' && (
                                                <button 
                                                    onClick={() => handleConvertToApplication(enq)} 
                                                    className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
                                                >
                                                    🔄 Convert
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(enq.id)} 
                                                className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEnquiries.length === 0 && (
                                <tr><td colSpan="10" className="text-center py-8 text-gray-500">No enquiries found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEnquiry ? 'Edit Enquiry' : 'New Enquiry'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">Student Name *</label><input type="text" className="w-full border rounded-lg p-2" value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} required /></div>
                        <div><label className="block text-sm font-medium">Date of Birth</label><input type="date" className="w-full border rounded-lg p-2" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium">Gender</label><select className="w-full border rounded-lg p-2" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                        <div><label className="block text-sm font-medium">Class Applied</label><select className="w-full border rounded-lg p-2" value={formData.class_applied} onChange={(e) => setFormData({ ...formData, class_applied: e.target.value })}><option value="">Select</option>{classes.map(c => <option key={c.id} value={c.class_number}>{c.name}</option>)}</select></div>
                        {formData.class_applied && (formData.class_applied === '11' || formData.class_applied === '12') && (
                            <div><label className="block text-sm font-medium">Stream</label><select className="w-full border rounded-lg p-2" value={formData.stream_id} onChange={(e) => setFormData({ ...formData, stream_id: e.target.value })}><option value="">Select</option>{streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        )}
                        <div><label className="block text-sm font-medium">Father's Name</label><input type="text" className="w-full border rounded-lg p-2" value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium">Mother's Name</label><input type="text" className="w-full border rounded-lg p-2" value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium">Phone *</label><input type="tel" className="w-full border rounded-lg p-2" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
                        <div><label className="block text-sm font-medium">Alternate Phone</label><input type="tel" className="w-full border rounded-lg p-2" value={formData.alternate_phone} onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium">Email</label><input type="email" className="w-full border rounded-lg p-2" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium">Address</label><textarea className="w-full border rounded-lg p-2" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium">Source</label><select className="w-full border rounded-lg p-2" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}><option value="Website">Website</option><option value="Social Media">Social Media</option><option value="Referral">Referral</option><option value="Walk-in">Walk-in</option><option value="Phone Call">Phone Call</option><option value="Advertisement">Advertisement</option><option value="Other">Other</option></select></div>
                        <div><label className="block text-sm font-medium">Status</label><select className="w-full border rounded-lg p-2" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Follow-up Scheduled">Follow-up Scheduled</option><option value="Converted">Converted</option><option value="Dropped">Dropped</option></select></div>
                        <div><label className="block text-sm font-medium">Priority</label><select className="w-full border rounded-lg p-2" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
                        <div><label className="block text-sm font-medium">Assign To</label><select className="w-full border rounded-lg p-2" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}><option value="">Unassigned</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium">Remarks</label><textarea className="w-full border rounded-lg p-2" rows="2" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editingEnquiry ? 'Update' : 'Create')}</Button>
                    </div>
                </form>
            </Modal>

            {/* Follow-up Modal */}
            <Modal isOpen={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} title="Schedule Follow-up" size="md">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">Follow-up Date *</label><input type="date" className="w-full border rounded-lg p-2" value={followUpData.follow_up_date} onChange={(e) => setFollowUpData({ ...followUpData, follow_up_date: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium">Notes</label><textarea className="w-full border rounded-lg p-2" rows="3" value={followUpData.follow_up_notes} onChange={(e) => setFollowUpData({ ...followUpData, follow_up_notes: e.target.value })} placeholder="What was discussed? Next steps?" /></div>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowFollowUpModal(false)}>Cancel</Button>
                        <Button onClick={handleSaveFollowUp} disabled={submitting}>Save Follow-up</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminEnquiryManagement;