import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const IndividualStoreDashboard = () => {
    const { setGlobalError } = useOutletContext() || {};
    const { storeSlug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboard(); }, [storeSlug]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/stores/${storeSlug}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setData(res.data);
        } catch (err) { 
            console.error('Error loading individual store dashboard:', err);
            if (err.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load store dashboard. Please check your connection.' });
            }
        }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!data) return <div className="text-center py-10 text-gray-500">Store not found</div>;

    const { store, stats, recentTransactions, lowStockItems } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-4xl">{store.icon}</span>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{store.name} — Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview and quick stats</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Total Items</p>
                    <p className="text-3xl font-bold">{stats.total_items}</p>
                    <p className="text-xs opacity-70 mt-1">{stats.total_stock} units in stock</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Today's Revenue</p>
                    <p className="text-3xl font-bold">₹{parseFloat(stats.today_revenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs opacity-70 mt-1">{stats.today_count} transactions</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">This Month</p>
                    <p className="text-3xl font-bold">₹{parseFloat(stats.month_revenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs opacity-70 mt-1">{stats.month_count} transactions</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Stock Value</p>
                    <p className="text-3xl font-bold">₹{parseFloat(stats.stock_value || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs opacity-70 mt-1">{stats.low_stock_items} low stock alerts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-5 py-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-800">📋 Recent Transactions</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentTransactions.length === 0 ? (
                            <p className="p-5 text-center text-gray-400 text-sm">No transactions yet</p>
                        ) : recentTransactions.slice(0, 7).map(t => (
                            <div key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{t.item_name}</p>
                                    <p className="text-xs text-gray-400">{t.student_name || 'Walk-in'} • Qty: {t.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-600 text-sm">₹{parseFloat(t.total_amount || 0).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-5 py-4 border-b bg-red-50">
                        <h3 className="font-semibold text-red-800">⚠️ Low Stock Items</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {lowStockItems.length === 0 ? (
                            <p className="p-5 text-center text-green-600 text-sm">✅ All items are well-stocked</p>
                        ) : lowStockItems.map(item => (
                            <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{item.item_name}</p>
                                    <p className="text-xs text-gray-400">{item.category || 'Uncategorized'} • SKU: {item.sku || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${item.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>{item.quantity}</p>
                                    <p className="text-xs text-gray-400">Threshold: {item.low_stock_threshold}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndividualStoreDashboard;
