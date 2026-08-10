import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreInventory = () => {
    const { storeSlug } = useParams();
    const [items, setItems] = useState([]);
    const [storeName, setStoreName] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ item_name: '', category: '', sku: '', quantity: 0, unit_price: 0, selling_price: 0, low_stock_threshold: 5, description: '' });

    useEffect(() => { fetchItems(); }, [storeSlug]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/stores/${storeSlug}/inventory`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { setItems(res.data.items); setStoreName(res.data.store.name); }
        } catch (err) { toast.error('Failed to load inventory'); }
        finally { setLoading(false); }
    };

    const resetForm = () => { setForm({ item_name: '', category: '', sku: '', quantity: 0, unit_price: 0, selling_price: 0, low_stock_threshold: 5, description: '' }); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.item_name) return toast.error('Item name is required');
        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(`${API_URL}/api/store/stores/${storeSlug}/inventory/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Item updated');
            } else {
                await axios.post(`${API_URL}/api/store/stores/${storeSlug}/inventory`, form, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Item added');
            }
            resetForm();
            fetchItems();
        } catch (err) { toast.error('Operation failed'); }
    };

    const handleEdit = (item) => {
        setForm({ item_name: item.item_name, category: item.category || '', sku: item.sku || '', quantity: item.quantity, unit_price: item.unit_price, selling_price: item.selling_price, low_stock_threshold: item.low_stock_threshold, description: item.description || '' });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/store/stores/${storeSlug}/inventory/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Item deleted');
            fetchItems();
        } catch (err) { toast.error('Delete failed'); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">📦 {storeName} — Inventory</h1>
                <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    {showForm ? 'Cancel' : '+ Add Item'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                <input value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Equipment, Books" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                                <input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                                <input type="number" min="0" step="0.01" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                                <input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2" /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows="2" /></div>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? 'Update Item' : 'Add Item'}</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cost</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No items yet. Click "+ Add Item" to start.</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{item.item_name}</div>
                                    <div className="text-xs text-gray-400">SKU: {item.sku || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.category || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.quantity <= 0 ? 'bg-red-100 text-red-700' : item.quantity <= item.low_stock_threshold ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {item.quantity}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-sm">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">₹{parseFloat(item.selling_price).toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-center text-sm text-green-600">₹{(item.quantity * parseFloat(item.selling_price)).toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-2">✏️</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm">🗑</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StoreInventory;
