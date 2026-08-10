import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreReportsOverview = () => {
    const [stores, setStores] = useState([]);
    const [period, setPeriod] = useState('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [period]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/reports-overview?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStores(res.data.stores);
        } catch (err) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = stores.reduce((a, s) => a + parseFloat(s.total_revenue || 0), 0);
    const totalSales = stores.reduce((a, s) => a + parseInt(s.total_sales || 0), 0);
    const totalItemsSold = stores.reduce((a, s) => a + parseInt(s.items_sold || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-gray-900">📊 Reports Overview</h1>
                <div className="flex gap-2">
                    {['today', 'week', 'month', 'year'].map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Total Transactions</p>
                    <p className="text-3xl font-bold">{totalSales}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">Items Sold</p>
                    <p className="text-3xl font-bold">{totalItemsSold}</p>
                </div>
            </div>

            {/* Store-wise Table */}
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sales Count</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Share</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stores.map(store => (
                                <tr key={store.store_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{store.icon}</span>
                                            <span className="font-medium">{store.store_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">{store.total_sales}</td>
                                    <td className="px-6 py-4 text-center">{store.items_sold}</td>
                                    <td className="px-6 py-4 text-center text-green-600 font-semibold">₹{parseFloat(store.total_revenue || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-center">
                                        {totalRevenue > 0 ? `${((parseFloat(store.total_revenue || 0) / totalRevenue) * 100).toFixed(1)}%` : '0%'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StoreReportsOverview;
