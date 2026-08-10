import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { toast } from 'react-hot-toast';

const AccountsRequisition = () => {
    const [activeTab, setActiveTab] = useState('requisitions');
    const [pendingSubTab, setPendingSubTab] = useState('teacher'); // 'teacher' or 'student'
    const [loading, setLoading] = useState(false);

    // Data States
    const [requisitions, setRequisitions] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [vendors, setVendors] = useState([]);

    // Selection States
    const [selectedRequisition, setSelectedRequisition] = useState(null);
    const [selectedTender, setSelectedTender] = useState(null);

    // Modals
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [vendorForm, setVendorForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });
    const [publishForm, setPublishForm] = useState({ min_bid_amount: '', closing_date: '' });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            if (activeTab === 'requisitions' || activeTab === 'history') {
                const status = activeTab === 'requisitions' ? 'pending' : '';
                const res = await axios.get(`${API_URL}/api/accounts/requisitions${status ? `?status=${status}` : ''}`, { headers });
                if (res.data.success) {
                    setRequisitions(res.data.requisitions.filter(r => activeTab === 'history' ? r.status !== 'pending' : true));
                }
            }
            else if (activeTab === 'tenders') {
                const res = await axios.get(`${API_URL}/api/accounts/tenders`, { headers });
                if (res.data.success) setTenders(res.data.tenders);
            }
            else if (activeTab === 'quotations') {
                // Fetch tenders first to let user select one
                const res = await axios.get(`${API_URL}/api/accounts/tenders`, { headers });
                if (res.data.success) setTenders(res.data.tenders);
            }
            else if (activeTab === 'vendors') {
                const res = await axios.get(`${API_URL}/api/accounts/vendors`, { headers });
                if (res.data.success) setVendors(res.data.vendors);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // --- REQUISITION ACTIONS ---
    // --- REQUISITION ACTIONS ---
    const handleRequisitionStatus = async (id, status, user_role) => {
        if (!window.confirm(`Are you sure you want to ${status} this requisition?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/accounts/requisitions/${id}/status`,
                { status, user_role },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success(`Requisition ${status}`);
            fetchData();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    // --- VENDOR ACTIONS ---
    const handleAddVendor = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/accounts/vendors`, vendorForm, { headers: { 'Authorization': `Bearer ${token}` } });
            toast.success("Vendor added");
            setIsVendorModalOpen(false);
            setVendorForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
            fetchData();
        } catch (error) {
            toast.error("Failed to add vendor");
        }
    };

    // --- TENDER ACTIONS ---
    const handlePublishTender = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/accounts/tenders/${selectedTender.id}/publish`, publishForm, { headers: { 'Authorization': `Bearer ${token}` } });
            toast.success("Tender published");
            setIsPublishModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to publish tender");
        }
    };

    const openPublishModal = (tender) => {
        setSelectedTender(tender);
        setPublishForm({ min_bid_amount: tender.min_bid_amount || '', closing_date: tender.closing_date ? tender.closing_date.split('T')[0] : '' });
        setIsPublishModalOpen(true);
    };

    // --- QUOTATION ACTIONS ---
    const fetchQuotations = async (tenderId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/accounts/tenders/${tenderId}/quotations`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.data.success) setQuotations(res.data.quotations);
        } catch (error) {
            toast.error("Failed to load quotations");
        }
    };

    const handleQuotationStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/accounts/quotations/${id}/status`, { status }, { headers: { 'Authorization': `Bearer ${token}` } });
            toast.success(`Quotation ${status}`);
            fetchQuotations(selectedTender.id); // Refresh
        } catch (error) {
            toast.error("Action failed");
        }
    };

    // Filtered Requisitions for Pending View
    const filteredPendingRequisitions = requisitions.filter(r =>
        pendingSubTab === 'teacher' ? r.user_role === 'teacher' : r.user_role === 'student'
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">📋 Requisition & Tender Management</h1>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto">
                {['requisitions', 'history', 'tenders', 'quotations', 'vendors'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedTender(null); setQuotations([]); }}
                        className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'requisitions' ? 'Pending Requests' : tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="py-4">
                {loading && <p className="text-center">Loading...</p>}

                {/* TAB: REQUISITIONS */}
                {activeTab === 'requisitions' && (
                    <Card>
                        {/* Sub-Tabs for Pending Requests */}
                        <div className="flex gap-4 mb-4 border-b pb-2">
                            <button
                                onClick={() => setPendingSubTab('teacher')}
                                className={`px-4 py-2 rounded-md transition-colors ${pendingSubTab === 'teacher' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                👨‍🏫 Teachers
                            </button>
                            <button
                                onClick={() => setPendingSubTab('student')}
                                className={`px-4 py-2 rounded-md transition-colors ${pendingSubTab === 'student' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                👨‍🎓 Students
                            </button>
                        </div>

                        <h3 className="text-lg font-bold mb-3">{pendingSubTab === 'teacher' ? 'Teacher' : 'Student'} Requisitions</h3>

                        <Table
                            columns={[
                                { header: 'Date', accessor: 'created_at', render: r => new Date(r.created_at).toLocaleDateString() },
                                { header: 'Title', accessor: 'title' },
                                { header: 'Requested By', accessor: 'requester_name', render: r => <div>{r.requester_name}</div> },
                                { header: 'Description', accessor: 'description', render: r => <span className="text-sm text-gray-600 truncate max-w-xs block" title={r.description}>{r.description}</span> },
                                {
                                    header: 'Actions', accessor: 'actions', render: r => (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="success" onClick={() => handleRequisitionStatus(r.id, 'approved', r.user_role)}>Approve & Create Tender</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleRequisitionStatus(r.id, 'rejected', r.user_role)}>Reject</Button>
                                        </div>
                                    )
                                }
                            ]}
                            data={filteredPendingRequisitions}
                        />
                        {filteredPendingRequisitions.length === 0 && !loading && <p className="text-center text-gray-500 mt-4">No pending {pendingSubTab} requisitions.</p>}
                    </Card>
                )}

                {/* TAB: HISTORY */}
                {activeTab === 'history' && (
                    <Card title="Requisition History">
                        <Table
                            columns={[
                                { header: 'Date', accessor: 'created_at', render: r => new Date(r.created_at).toLocaleDateString() },
                                { header: 'Title', accessor: 'title' },
                                { header: 'Requested By', accessor: 'requester_name' },
                                { header: 'Status', accessor: 'status', render: r => <Badge variant={r.status === 'approved' ? 'success' : 'danger'}>{r.status}</Badge> }
                            ]}
                            data={requisitions}
                        />
                    </Card>
                )}

                {/* TAB: TENDERS */}
                {activeTab === 'tenders' && (
                    <Card title="Current Tenders">
                        <Table
                            columns={[
                                { header: 'Title', accessor: 'title' },
                                { header: 'Status', accessor: 'status', render: r => <Badge variant={r.status === 'published' ? 'success' : 'warning'}>{r.status.toUpperCase()}</Badge> },
                                { header: 'Opening Date', accessor: 'opening_date', render: r => new Date(r.opening_date).toLocaleDateString() },
                                { header: 'Closing Date', accessor: 'closing_date', render: r => new Date(r.closing_date).toLocaleDateString() },
                                {
                                    header: 'Actions', accessor: 'actions', render: r => (
                                        r.status === 'draft' && <Button size="sm" onClick={() => openPublishModal(r)}>Publish</Button>
                                    )
                                }
                            ]}
                            data={tenders}
                        />
                        {tenders.length === 0 && !loading && <p className="text-center text-gray-500 mt-4">No tenders found.</p>}
                    </Card>
                )}

                {/* TAB: QUOTATIONS */}
                {activeTab === 'quotations' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <Card title="Select Tender">
                                {tenders.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => { setSelectedTender(t); fetchQuotations(t.id); }}
                                        className={`p-3 border rounded mb-2 cursor-pointer ${selectedTender?.id === t.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                                    >
                                        <p className="font-medium">{t.title}</p>
                                        <p className="text-xs text-gray-500">{t.status}</p>
                                    </div>
                                ))}
                            </Card>
                        </div>
                        <div className="md:col-span-2">
                            <Card title={selectedTender ? `Quotations for: ${selectedTender.title}` : "Quotations"}>
                                {!selectedTender ? (
                                    <p className="text-center text-gray-500 py-10">Select a tender to view quotations.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {quotations.map(q => (
                                            <div key={q.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
                                                <div>
                                                    <p className="font-bold text-lg">{q.vendor_name}</p>
                                                    <p className="text-sm text-gray-600">{q.proposal_details || 'No details'}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Status: <Badge variant={q.status === 'accepted' ? 'success' : q.status === 'rejected' ? 'danger' : 'warning'}>{q.status}</Badge></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-green-700">₹{parseFloat(q.quoted_amount).toLocaleString()}</p>
                                                    {q.status === 'pending' && (
                                                        <div className="mt-2 flex gap-2 justify-end">
                                                            <Button size="sm" variant="success" onClick={() => handleQuotationStatus(q.id, 'accepted')}>Accept</Button>
                                                            <Button size="sm" variant="danger" onClick={() => handleQuotationStatus(q.id, 'rejected')}>Reject</Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {quotations.length === 0 && <p className="text-center text-gray-500">No quotations received yet.</p>}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB: VENDORS */}
                {activeTab === 'vendors' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setIsVendorModalOpen(true)}>+ Add Vendor</Button>
                        </div>
                        <Card title="Registered Vendors">
                            <Table
                                columns={[
                                    { header: 'Name', accessor: 'name' },
                                    { header: 'Contact Person', accessor: 'contact_person' },
                                    { header: 'Phone', accessor: 'phone' },
                                    { header: 'Email', accessor: 'email' },
                                    { header: 'Address', accessor: 'address' }
                                ]}
                                data={vendors}
                            />
                            {vendors.length === 0 && !loading && <p className="text-center text-gray-500 mt-4">No vendors registered.</p>}
                        </Card>
                    </div>
                )}
            </div>

            {/* Vendor Modal */}
            <Modal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title="Add New Vendor">
                <div className="space-y-4">
                    <input type="text" placeholder="Company Name" className="w-full border p-2 rounded" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} />
                    <input type="text" placeholder="Contact Person" className="w-full border p-2 rounded" value={vendorForm.contact_person} onChange={e => setVendorForm({ ...vendorForm, contact_person: e.target.value })} />
                    <input type="text" placeholder="Phone" className="w-full border p-2 rounded" value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
                    <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
                    <textarea placeholder="Address" className="w-full border p-2 rounded" value={vendorForm.address} onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })} />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsVendorModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddVendor}>Save Vendor</Button>
                    </div>
                </div>
            </Modal>

            {/* Publish Tender Modal */}
            <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title="Publish Tender">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Publishing this tender will make it visible to vendors. Set the minimum bid and closing date.</p>
                    <div>
                        <label className="block text-sm font-medium mb-1">Minimum Bid Amount</label>
                        <input type="number" className="w-full border p-2 rounded" value={publishForm.min_bid_amount} onChange={e => setPublishForm({ ...publishForm, min_bid_amount: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Closing Date</label>
                        <input type="date" className="w-full border p-2 rounded" value={publishForm.closing_date} onChange={e => setPublishForm({ ...publishForm, closing_date: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>Cancel</Button>
                        <Button onClick={handlePublishTender}>Publish Tender</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AccountsRequisition;
