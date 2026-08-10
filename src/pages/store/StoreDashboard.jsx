import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreDashboard = () => {
    const { setGlobalError } = useOutletContext() || {};
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStores(res.data.stores);
        } catch (err) {
            console.error('Error loading store dashboard:', err);
            if (err.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load store dashboard. Please check your connection.' });
            }
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

    const totalRevenue = stores.reduce((acc, s) => acc + parseFloat(s.total_revenue || 0), 0);
    const todayRevenue = stores.reduce((acc, s) => acc + parseFloat(s.today_revenue || 0), 0);
    const totalItems = stores.reduce((acc, s) => acc + parseInt(s.total_items || 0), 0);
    const totalLowStock = stores.reduce((acc, s) => acc + parseInt(s.low_stock_items || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">🏪 Store Manager Dashboard</h1>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN')}</span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Total Stores</p>
                    <p className="text-3xl font-bold">{stores.length}</p>
                    <p className="text-xs opacity-70 mt-1">Active stores</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Today's Revenue</p>
                    <p className="text-3xl font-bold">₹{todayRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs opacity-70 mt-1">All stores combined</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Total Inventory Items</p>
                    <p className="text-3xl font-bold">{totalItems}</p>
                    <p className="text-xs opacity-70 mt-1">Across all stores</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Low Stock Alerts</p>
                    <p className="text-3xl font-bold">{totalLowStock}</p>
                    <p className="text-xs opacity-70 mt-1">Items below threshold</p>
                </div>
            </div>

            {/* Store Cards Grid */}
            <h2 className="text-xl font-semibold text-gray-800">All Stores Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                    <div key={store.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 text-white flex items-center gap-3">
                            <span className="text-3xl">{store.icon}</span>
                            <div>
                                <h3 className="font-bold text-lg">{store.name}</h3>
                                <p className="text-xs text-slate-300">{store.total_items} items in inventory</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Today Sales</p>
                                    <p className="font-bold text-green-700">₹{parseFloat(store.today_revenue || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total Revenue</p>
                                    <p className="font-bold text-blue-700">₹{parseFloat(store.total_revenue || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Stock Value</p>
                                    <p className="font-bold text-purple-700">₹{parseFloat(store.stock_value || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className={`rounded-lg p-3 text-center ${store.low_stock_items > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <p className="text-xs text-gray-500">Low Stock</p>
                                    <p className={`font-bold ${store.low_stock_items > 0 ? 'text-red-700' : 'text-gray-700'}`}>{store.low_stock_items}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                                {store.today_transactions} transactions today | {store.total_transactions} total
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreDashboard;
