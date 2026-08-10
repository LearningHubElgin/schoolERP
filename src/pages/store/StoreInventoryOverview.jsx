import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreInventoryOverview = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, []);
    
    const fetchOverview = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/inventory-overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStores(res.data.stores);
        } catch (err) {
            toast.error('Failed to load inventory overview');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">📦 Inventory Overview</h1>
            <p className="text-gray-500">Store-wise inventory summary across all stores.</p>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Items</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Stock</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock Value</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Low Stock</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stores.map(store => (
                            <tr key={store.store_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{store.icon}</span>
                                        <span className="font-medium text-gray-900">{store.store_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold">{store.total_items}</td>
                                <td className="px-6 py-4 text-center">{parseInt(store.total_stock).toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-center text-green-600 font-semibold">₹{parseFloat(store.stock_value || 0).toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-center">
                                    {store.low_stock_items > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {store.low_stock_items} items
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            All Good
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${store.total_items > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {store.total_items > 0 ? 'Active' : 'Empty'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-700">{stores.reduce((a, s) => a + parseInt(s.total_items || 0), 0)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Total Stock Value</p>
                    <p className="text-2xl font-bold text-green-700">₹{stores.reduce((a, s) => a + parseFloat(s.stock_value || 0), 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-red-700">{stores.reduce((a, s) => a + parseInt(s.low_stock_items || 0), 0)}</p>
                </div>
            </div>
        </div>
    );
};

export default StoreInventoryOverview;
