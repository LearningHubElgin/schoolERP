import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreRequisition = () => {
    const [requisitions, setRequisitions] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ store_id: '', item_name: '', quantity: 1, description: '', urgency: 'medium' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [rRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/api/store/requisitions`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/store/stores`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (rRes.data.success) setRequisitions(rRes.data.requisitions);
            if (sRes.data.success) setStores(sRes.data.stores);
        } catch (err) { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.item_name) return toast.error('Item name is required');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/store/requisitions`, form, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { toast.success('Requisition submitted'); setShowForm(false); setForm({ store_id: '', item_name: '', quantity: 1, description: '', urgency: 'medium' }); fetchData(); }
        } catch (err) { toast.error('Failed to submit'); }
    };

    const getStatusBadge = (s) => {
        const colors = { Pending: 'bg-yellow-100 text-yellow-700', Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[s]}`}>{s}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">📋 Requisitions</h1>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    {showForm ? 'Cancel' : '+ New Requisition'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg mb-4">Submit New Requisition</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
                                <select value={form.store_id} onChange={e => setForm({ ...form, store_id: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                                    <option value="">Select Store</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                <input value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Item name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows="2" placeholder="Why is this needed?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                                <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Urgency</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {requisitions.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No requisitions yet</td></tr>
                        ) : requisitions.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="font-medium text-gray-900">{r.item_name}</div><div className="text-xs text-gray-400">{r.description?.substring(0, 40)}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-600">{r.store_name || 'General'}</td>
                                <td className="px-4 py-3 text-center font-semibold">{r.quantity}</td>
                                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.urgency === 'high' ? 'bg-red-100 text-red-700' : r.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{r.urgency?.toUpperCase()}</span></td>
                                <td className="px-4 py-3 text-center">{getStatusBadge(r.status)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StoreRequisition;
