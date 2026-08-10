import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreReports = () => {
    const { storeSlug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchReports(); }, [storeSlug]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/stores/${storeSlug}/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setData(res.data);
        } catch (err) { toast.error('Failed to load reports'); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!data) return <div className="text-center py-10 text-gray-500">Store not found</div>;

    const { store, dailySales, topItems, categoryData } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">📊 {store.name} — Reports</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Items */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-5 py-4 border-b bg-blue-50">
                        <h3 className="font-semibold text-blue-800">🏆 Top Selling Items</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {topItems.length === 0 ? (
                            <p className="p-5 text-center text-gray-400 text-sm">No sales data yet</p>
                        ) : topItems.map((item, i) => (
                            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                                        {i + 1}
                                    </span>
                                    <span className="font-medium text-sm">{item.item_name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-sm text-green-600">₹{parseFloat(item.total_revenue || 0).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-gray-400">{item.total_qty} units sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-5 py-4 border-b bg-purple-50">
                        <h3 className="font-semibold text-purple-800">📂 Category Breakdown</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {categoryData.length === 0 ? (
                            <p className="p-5 text-center text-gray-400 text-sm">No category data yet</p>
                        ) : categoryData.map((cat, i) => {
                            const maxRevenue = Math.max(...categoryData.map(c => parseFloat(c.revenue || 0)));
                            const pct = maxRevenue > 0 ? (parseFloat(cat.revenue || 0) / maxRevenue) * 100 : 0;
                            return (
                                <div key={i} className="px-5 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">{cat.category || 'Uncategorized'}</span>
                                        <span className="text-sm text-green-600 font-semibold">₹{parseFloat(cat.revenue || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{cat.qty_sold} qty sold</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Daily Sales (Last 30 Days) */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b bg-green-50">
                    <h3 className="font-semibold text-green-800">📅 Daily Sales — Last 30 Days</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dailySales.length === 0 ? (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No sales data</td></tr>
                            ) : dailySales.map((d, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                    <td className="px-4 py-3 text-center text-sm">{d.transactions}</td>
                                    <td className="px-4 py-3 text-center text-sm">{d.items_sold}</td>
                                    <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">₹{parseFloat(d.revenue || 0).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StoreReports;
