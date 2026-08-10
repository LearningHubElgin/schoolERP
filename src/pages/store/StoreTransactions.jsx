import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StoreTransactions = () => {
    const { storeSlug } = useParams();
    const [activeTab, setActiveTab] = useState('items'); // 'items' | 'bills'
    const [transactions, setTransactions] = useState([]);
    const [bills, setBills] = useState([]);
    const [storeName, setStoreName] = useState('');
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (activeTab === 'items') fetchTransactions();
        else fetchBills();
    }, [storeSlug, activeTab]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/store/stores/${storeSlug}/transactions`;
            if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { setTransactions(res.data.transactions); setStoreName(res.data.store.name); }
        } catch (err) { toast.error('Failed to load transactions'); }
        finally { setLoading(false); }
    };

    const fetchBills = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/store/stores/${storeSlug}/bills`;
            if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { setBills(res.data.bills); setStoreName(res.data.store.name); }
        } catch (err) { toast.error('Failed to load bills'); }
        finally { setLoading(false); }
    };

    const downloadBillPdf = async (bill) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/store/bills/${bill.bill_number}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${bill.bill_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Bill PDF downloaded!');
        } catch (e) {
            console.error('Download error:', e);
            toast.error('Failed to download PDF');
        }
    };

    const handleFilter = () => {
        if (activeTab === 'items') fetchTransactions();
        else fetchBills();
    };

    // Summaries
    const totalAmount = activeTab === 'items'
        ? transactions.reduce((a, t) => a + parseFloat(t.total_amount || 0), 0)
        : bills.reduce((a, b) => a + parseFloat(b.total_amount || 0), 0);

    const countLabel = activeTab === 'items' ? 'Transactions' : 'Bills';
    const countValue = activeTab === 'items' ? transactions.length : bills.length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">📋 {storeName} — History</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('items')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'items' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Item Wise</button>
                    <button onClick={() => setActiveTab('bills')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'bills' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Bill Wise</button>
                </div>
            </div>

            {/* Date Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                </div>
                <button onClick={handleFilter} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Filter</button>
                <button onClick={() => { setStartDate(''); setEndDate(''); setTimeout(() => activeTab === 'items' ? fetchTransactions() : fetchBills(), 100); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm">Clear</button>
                <div className="ml-auto flex gap-4 text-sm">
                    <span className="text-gray-500">Total: <strong className="text-green-600">₹{totalAmount.toLocaleString('en-IN')}</strong></span>
                    <span className="text-gray-500">{countLabel}: <strong>{countValue}</strong></span>
                </div>
            </div>

            {/* Table Content */}
            {loading ? (
                <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {activeTab === 'items' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No transactions found</td></tr>
                                ) : transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                                            <div className="text-xs text-gray-400">{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">{t.item_name}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div>{t.student_name || 'Walk-in'}</div>
                                            {t.class_name && <div className="text-xs text-gray-400">{t.class_name}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-semibold">{t.quantity}</td>
                                        <td className="px-4 py-3 text-center text-sm">₹{parseFloat(t.unit_price || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">₹{parseFloat(t.total_amount || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{t.payment_method?.toUpperCase()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.transaction_type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {t.transaction_type?.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bills.length === 0 ? (
                                    <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No bills found</td></tr>
                                ) : bills.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            <div>{new Date(b.date).toLocaleDateString('en-IN')}</div>
                                            <div className="text-xs text-gray-400">{new Date(b.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{b.bill_number}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div>{b.student_name || 'Walk-in'}</div>
                                            {b.class_name && <div className="text-xs text-gray-400">{b.class_name}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">{b.item_count}</td>
                                        <td className="px-4 py-3 text-center text-sm font-bold text-green-600">₹{parseFloat(b.total_amount || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 text-center text-sm capitalize">{b.payment_method}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {b.payment_status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => downloadBillPdf(b)} className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center justify-center gap-1">
                                                <span>📥</span> PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoreTransactions;
