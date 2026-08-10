import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreGrievance = () => {
    const [grievances, setGrievances] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ store_id: '', subject: '', description: '', priority: 'medium' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [gRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/api/store/grievances`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/store/stores`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (gRes.data.success) setGrievances(gRes.data.grievances);
            if (sRes.data.success) setStores(sRes.data.stores);
        } catch (err) { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject) return toast.error('Subject is required');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/store/grievances`, form, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { toast.success('Grievance submitted'); setShowForm(false); setForm({ store_id: '', subject: '', description: '', priority: 'medium' }); fetchData(); }
        } catch (err) { toast.error('Failed to submit'); }
    };

    const getPriorityBadge = (p) => {
        const colors = { low: 'bg-gray-100 text-gray-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[p]}`}>{p.toUpperCase()}</span>;
    };

    const getStatusBadge = (s) => {
        const colors = { pending: 'bg-orange-100 text-orange-700', in_progress: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[s]}`}>{s.replace('_', ' ').toUpperCase()}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">📢 Grievances</h1>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    {showForm ? 'Cancel' : '+ Submit Grievance'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg mb-4">Submit New Grievance</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store (Optional)</label>
                                <select value={form.store_id} onChange={e => setForm({ ...form, store_id: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                                    <option value="">General</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Brief subject" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows="3" placeholder="Detailed description..." />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {grievances.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No grievances submitted yet</td></tr>
                        ) : grievances.map(g => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="font-medium text-gray-900">{g.subject}</div><div className="text-xs text-gray-400">{g.description?.substring(0, 50)}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-600">{g.store_name || 'General'}</td>
                                <td className="px-4 py-3 text-center">{getPriorityBadge(g.priority)}</td>
                                <td className="px-4 py-3 text-center">{getStatusBadge(g.status)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(g.created_at).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StoreGrievance;
