import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const StudentStorePurchases = () => {
    const [bills, setBills] = useState([]);
    const [summary, setSummary] = useState({ totalBills: 0, totalSpent: '0.00', pendingAmount: '0.00', paidAmount: '0.00' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedBill, setSelectedBill] = useState(null);
    const billRef = useRef(null);

    useEffect(() => { fetchPurchases(); }, []);

    const fetchPurchases = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/student/store-purchases`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBills(data.bills);
                setSummary(data.summary);
            } else {
                setError(data.message || 'Failed to fetch purchases');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to fetch store purchases');
        } finally {
            setLoading(false);
        }
    };

    const viewBill = async (billNumber) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/student/store-bills/${billNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSelectedBill(data.bill);
        } catch (err) { console.error(err); }
    };

    const handlePrintBill = () => {
        const content = billRef.current;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Bill - ${selectedBill.bill_number}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
                .header h2 { margin: 0; font-size: 20px; }
                .header p { margin: 3px 0; font-size: 12px; color: #666; }
                .info-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #ddd; font-size: 13px; }
                th { background: #f5f5f5; font-weight: 600; }
                .total-row { font-size: 16px; font-weight: bold; border-top: 2px solid #333; }
                .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                .paid { background: #d4edda; color: #155724; }
                .pending { background: #fff3cd; color: #856404; }
                .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; border-top: 1px dashed #ccc; padding-top: 10px; }
                @media print { body { padding: 10px; } }
            </style></head><body>
            ${content.innerHTML}
            <script>window.print(); window.close();</script>
            </body></html>
        `);
        win.document.close();
    };

    const formatCurrency = (amt) => `₹${parseFloat(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const filteredBills = activeTab === 'all' ? bills : bills.filter(b => b.payment_status === activeTab);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading purchases...</p>
            </div>
        </div>
    );

    if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">🏪 Store Purchases</h1>
                        <p className="text-amber-100 mt-1">View your store purchases and download bills</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/10">
                            <span className="text-amber-50 text-xs uppercase tracking-wider font-bold">Total Bills</span>
                            <p className="text-xl font-bold text-white">{summary.totalBills}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-b-4 border-b-blue-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <div className="p-2 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Spent</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800">{formatCurrency(summary.totalSpent)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl shadow-sm">🛍️</div>
                    </div>
                </Card>
                <Card className="border-b-4 border-b-emerald-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <div className="p-2 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Paid Amount</p>
                            <p className="text-2xl md:text-3xl font-bold text-emerald-600">{formatCurrency(summary.paidAmount)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl shadow-sm">✅</div>
                    </div>
                </Card>
                <Card className="border-b-4 border-b-rose-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <div className="p-2 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Pending Amount</p>
                            <p className="text-2xl md:text-3xl font-bold text-rose-600">{formatCurrency(summary.pendingAmount)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl shadow-sm">⚠️</div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl w-full md:w-fit font-semibold shadow-inner">
                {[
                    { key: 'all', label: 'All Purchases', count: bills.length },
                    { key: 'paid', label: 'Paid', count: bills.filter(b => b.payment_status === 'paid').length },
                    { key: 'pending', label: 'Pending', count: bills.filter(b => b.payment_status === 'pending').length }
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-all duration-300 ${activeTab === tab.key
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs transition-colors ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bills List */}
            <Card variant="elevated" className="overflow-hidden border-t-4 border-t-amber-500">
                {filteredBills.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Date', 'Bill No.', 'Store', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBills.map(bill => (
                                        <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{formatDate(bill.created_at)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{bill.bill_number}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <span className="mr-1">{bill.store_icon}</span>{bill.store_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                                                <span className="text-gray-400 ml-1 text-xs">
                                                    ({bill.items.map(i => i.item_name).join(', ').slice(0, 40)}{bill.items.map(i => i.item_name).join(', ').length > 40 ? '…' : ''})
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(bill.subtotal)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bill.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {bill.payment_status === 'paid' ? '✅ Paid' : '🕐 Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button onClick={() => viewBill(bill.bill_number)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-all">
                                                    📄 View Bill
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🏪</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-500">No {activeTab !== 'all' ? activeTab : ''} purchases found</p>
                        <p className="text-sm text-gray-400 mt-1">Your store purchases will appear here</p>
                    </div>
                )}
            </Card>

            {/* Bill Detail Modal */}
            {selectedBill && createPortal(
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setSelectedBill(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">📄 Bill Details</h2>
                                <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>

                            {/* Printable Content */}
                            <div ref={billRef} className="border-2 border-gray-200 rounded-xl p-5 bg-white">
                                <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
                                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedBill.school_name || 'School Store'}</h2>
                                    <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>{selectedBill.school_address || ''}</p>
                                    {selectedBill.school_phone && <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>📞 {selectedBill.school_phone}</p>}
                                    <p style={{ margin: '8px 0 0', fontSize: '14px', fontWeight: '600' }}>{selectedBill.store_icon} {selectedBill.store_name} — Purchase Receipt</p>
                                </div>

                                <div style={{ fontSize: '13px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                        <span>Bill No:</span><strong>{selectedBill.bill_number}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                        <span>Date:</span><span>{formatDate(selectedBill.created_at)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                        <span>Student:</span><strong>{selectedBill.student_name}</strong>
                                    </div>
                                    {selectedBill.class_name && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                            <span>Class:</span><span>{selectedBill.class_name}</span>
                                        </div>
                                    )}
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
                                    <thead>
                                        <tr style={{ background: '#f5f5f5' }}>
                                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '12px' }}>Item</th>
                                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #ddd', fontSize: '12px' }}>Qty</th>
                                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '12px' }}>Rate</th>
                                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '12px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedBill.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', fontSize: '13px' }}>{item.item_name}</td>
                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', fontSize: '13px', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', fontSize: '13px', textAlign: 'right' }}>₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', fontSize: '13px', textAlign: 'right', fontWeight: '600' }}>
                                                    ₹{(item.total_amount || item.quantity * item.unit_price).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid #eee' }}>
                                            <td colSpan="3" style={{ padding: '8px', textAlign: 'right', fontSize: '13px', color: '#666' }}>Subtotal</td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                                                ₹{parseFloat(selectedBill.subtotal).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                        {selectedBill.gst_type && selectedBill.gst_type !== 'none' && (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '4px 8px', textAlign: 'right', fontSize: '12px', color: '#666' }}>
                                                    GST {selectedBill.gst_percentage}% ({selectedBill.gst_type === 'inclusive' ? 'Inc.' : 'Exc.'})
                                                </td>
                                                <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                                                    ₹{parseFloat(selectedBill.gst_amount).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        )}
                                        <tr style={{ borderTop: '2px solid #333' }}>
                                            <td colSpan="3" style={{ padding: '10px 8px', fontWeight: 'bold', fontSize: '15px' }}>Grand Total</td>
                                            <td style={{ padding: '10px 8px', fontWeight: 'bold', fontSize: '15px', textAlign: 'right' }}>
                                                ₹{parseFloat(selectedBill.total_amount).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                    <span>Payment: {(selectedBill.payment_method || 'cash').toUpperCase()}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedBill.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                                        style={{ padding: '2px 10px', borderRadius: '12px', fontWeight: '600' }}>
                                        {selectedBill.payment_status === 'paid' ? '✅ PAID' : '🕐 PENDING'}
                                    </span>
                                </div>

                                <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '15px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                                    Thank you for your purchase! • This is a computer-generated receipt.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                <button onClick={handlePrintBill}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md">
                                    🖨️ Print / Download
                                </button>
                                <button onClick={() => setSelectedBill(null)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                    ✓ Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default StudentStorePurchases;
