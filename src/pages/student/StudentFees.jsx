import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const StudentFees = () => {
    const [activeTab, setActiveTab] = useState('academic');
    const [academicSubTab, setAcademicSubTab] = useState('structure');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fee data
    const [feeStructure, setFeeStructure] = useState(null);
    const [feeRecords, setFeeRecords] = useState([]);
    const [feeRecord, setFeeRecord] = useState({ total_amount: 0, paid_amount: 0, pending_amount: 0 });
    const [payments, setPayments] = useState([]);
    const [studentClass, setStudentClass] = useState('');
    const [storePendingAmount, setStorePendingAmount] = useState(0);

    // Store data
    const [storeBills, setStoreBills] = useState([]);
    const [storeSummary, setStoreSummary] = useState({ totalBills: 0, totalSpent: '0.00', pendingAmount: '0.00', paidAmount: '0.00' });
    const [storeFilter, setStoreFilter] = useState('all');

    // Modals
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedStoreBill, setSelectedStoreBill] = useState(null);
    const receiptRef = useRef(null);
    const storeBillRef = useRef(null);

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [feeRes, storeRes] = await Promise.all([
                fetch(`${API_URL}/api/student/fees`, { headers }),
                fetch(`${API_URL}/api/student/store-purchases`, { headers }).catch(() => null)
            ]);

            const feeData = await feeRes.json();
            if (feeData.success) {
                setFeeStructure(feeData.feeStructure);
                setFeeRecords(feeData.feeRecords || []);
                setFeeRecord(feeData.feeRecord || { total_amount: 0, paid_amount: 0, pending_amount: 0 });
                setPayments(feeData.payments || []);
                setStudentClass(feeData.studentClass || '');
                setStorePendingAmount(feeData.storePendingAmount || 0);
            } else {
                setError(feeData.message || 'Failed to fetch fee data');
            }

            if (storeRes) {
                const storeData = await storeRes.json();
                if (storeData.success) {
                    setStoreBills(storeData.bills || []);
                    setStoreSummary(storeData.summary || storeSummary);
                }
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load fee data');
        } finally {
            setLoading(false);
        }
    };

    const viewStoreBill = async (billNumber) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/student/store-bills/${billNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSelectedStoreBill(data.bill);
        } catch (err) { console.error(err); }
    };

    const handlePrint = (ref, title) => {
        const content = ref.current;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>${title}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; max-width: 550px; margin: 0 auto; padding: 20px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 10px; }
                .header h2 { margin: 0; font-size: 16px; }
                .header p { margin: 2px 0; font-size: 11px; color: #666; }
                .info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 11px; }
                th { background: #f5f5f5; font-weight: 600; }
                .total-row { font-size: 14px; font-weight: bold; border-top: 2px solid #333; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
                .paid { background: #d4edda; color: #155724; }
                .pending { background: #fff3cd; color: #856404; }
                .footer { text-align: center; margin-top: 15px; font-size: 10px; color: #999; border-top: 1px dashed #ccc; padding-top: 8px; }
                @media print { body { padding: 5px; } }
            </style></head><body>
            ${content.innerHTML}
            <script>window.print(); window.close();<\/script>
            </body></html>
        `);
        win.document.close();
    };

    const formatCurrency = (amt) => `₹${parseFloat(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const formatDate = (d) => {
        if (!d) return '—';
        let str = String(d).split('T')[0].split(' ')[0];
        const parts = str.split('-');
        if (parts.length === 3) {
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const totalPending = parseFloat(feeRecord.pending_amount || 0) + parseFloat(storePendingAmount || 0);
    const totalPaid = parseFloat(feeRecord.paid_amount || 0) + parseFloat(storeSummary.paidAmount || 0);
    const filteredStoreBills = storeFilter === 'all' ? storeBills : storeBills.filter(b => b.payment_status === storeFilter);

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 text-xs font-medium">Loading fee details...</p>
            </div>
        </div>
    );

    if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>;

    const tabs = [
        { key: 'academic', label: '🎓 Academic Fees', icon: '' },
        { key: 'store', label: '🏪 Store Fees', icon: '', count: storeBills.length }
    ];

    // ─── FEE STRUCTURE BREAKDOWN ─────────────────────────────
    const iconMap = { tuition: '📚', admission: '🎓', exam: '📝', lab: '🔬', library: '📖', transport: '🚌', hostel: '🏠', misc: '📦', sports: '⚽' };
    const getIcon = (key) => {
        const k = (key || '').toLowerCase();
        for (const [word, icon] of Object.entries(iconMap)) {
            if (k.includes(word)) return icon;
        }
        return '💰';
    };

    const feeBreakdown = feeStructure ? (() => {
        const items = (feeStructure.fee_columns || [])
            .map(col => ({
                label: col.display_name + ' Fee',
                amount: feeStructure.column_values?.[col.id] || 0,
                icon: getIcon(col.column_key)
            }))
            .filter(f => parseFloat(f.amount || 0) > 0);

        if (parseFloat(feeStructure.admission_fee || 0) > 0) {
            items.push({ label: 'Admission Fee', amount: feeStructure.admission_fee, icon: '🎓' });
        }
        return items;
    })() : [];

    return (
        <div className="space-y-3 pb-4">
            {/* ─── COMPACT GRADIENT HEADER ─────────────────────────────── */}
            <div className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-3.5 md:p-4 text-white shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-base md:text-lg font-bold tracking-tight">💰 Fee & Payments</h1>
                        <p className="text-indigo-100 text-xs mt-0.5 opacity-90">View your fees, payment history, and store purchases</p>
                        {studentClass && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-white/15 backdrop-blur-md rounded-md text-[11px] font-semibold border border-white/20">
                                🎓 Class {studentClass}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {totalPending > 0 && (
                            <div className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-500/90 backdrop-blur-md rounded-lg border border-white/10 shadow-sm">
                                <span className="text-rose-100 text-[9px] uppercase tracking-wider font-bold block">Total Pending</span>
                                <p className="text-sm md:text-base font-bold text-white leading-tight">{formatCurrency(totalPending)}</p>
                            </div>
                        )}
                        <div className="flex-1 sm:flex-none px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/10">
                            <span className="text-indigo-100 text-[9px] uppercase tracking-wider font-bold block">Total Paid</span>
                            <p className="text-sm md:text-base font-bold text-white leading-tight">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── MAIN TABS ──────────────────────────────────────── */}
            <div className="flex p-1 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl w-full font-semibold shadow-inner border border-slate-200/60">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 min-w-fit px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap text-xs font-bold flex items-center justify-center gap-1.5 ${activeTab === tab.key
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'}`}>
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-colors ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── SUMMARY CARDS ────────────── */}
            {activeTab === 'academic' && (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                    <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-blue-500 shadow-2xs hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                            <div className="min-w-0 w-full">
                                <p className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">Total Billed</p>
                                <p className="text-xs sm:text-base md:text-lg font-bold text-slate-800 truncate">{formatCurrency(feeRecord.total_amount)}</p>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">📑</div>
                        </div>
                    </Card>
                    <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-emerald-500 shadow-2xs hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                            <div className="min-w-0 w-full">
                                <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate">Total Paid</p>
                                <p className="text-xs sm:text-base md:text-lg font-bold text-emerald-600 truncate">{formatCurrency(feeRecord.paid_amount)}</p>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">✅</div>
                        </div>
                    </Card>
                    <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-amber-500 shadow-2xs hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                            <div className="min-w-0 w-full">
                                <p className="text-[8px] sm:text-[10px] font-bold text-amber-600 uppercase tracking-wider truncate">Fee Pending</p>
                                <p className="text-xs sm:text-base md:text-lg font-bold text-amber-600 truncate">{formatCurrency(feeRecord.pending_amount)}</p>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-amber-50 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">⏳</div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'store' && (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                    <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-blue-500 shadow-2xs hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                            <div className="min-w-0 w-full">
                                <p className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">Total Spent</p>
                                <p className="text-xs sm:text-base md:text-lg font-bold text-slate-800 truncate">{formatCurrency(storeSummary.totalSpent)}</p>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">🛍️</div>
                        </div>
                    </Card>
                    <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-emerald-500 shadow-2xs hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                            <div className="min-w-0 w-full">
                                <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate">Store Paid</p>
                                <p className="text-xs sm:text-base md:text-lg font-bold text-emerald-600 truncate">{formatCurrency(storeSummary.paidAmount)}</p>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">✅</div>
                        </div>
                    </Card>
                    <Card className="!p-1.5 sm:!p-2.5 border-b-2 border-b-rose-500 shadow-2xs hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-hidden">
                            <div className="min-w-0 w-full">
                                <p className="text-[8px] sm:text-[10px] font-bold text-rose-600 uppercase tracking-wider truncate">Store Pending</p>
                                <p className="text-xs sm:text-base md:text-lg font-bold text-rose-600 truncate">{formatCurrency(storeSummary.pendingAmount)}</p>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-rose-50 flex items-center justify-center text-xs sm:text-sm shrink-0 self-end sm:self-center">⚠️</div>
                        </div>
                    </Card>
                </div>
            )}

            {/* ─── TAB: ACADEMIC FEES ──────────────────────────────────────── */}
            {activeTab === 'academic' && (
                <div className="space-y-3">
                    {/* Sub-tabs */}
                    <div className="flex gap-1.5 w-full sm:w-fit">
                        <button onClick={() => setAcademicSubTab('structure')}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${academicSubTab === 'structure'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            📋 Fee Structure
                        </button>
                        <button onClick={() => setAcademicSubTab('history')}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${academicSubTab === 'history'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            💳 Payment History
                        </button>
                    </div>

                    {/* Sub-tab: Fee Structure */}
                    {academicSubTab === 'structure' && (
                        <Card variant="elevated" className="!p-3 border-t-2 border-t-indigo-500">
                            <h2 className="text-xs md:text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                                📋 Fee Structure {studentClass && <span className="text-xs font-normal text-slate-500">— Class {studentClass}</span>}
                            </h2>
                            {feeBreakdown.length > 0 ? (
                                <div className="space-y-1.5">
                                    {feeBreakdown.filter(f => f.label !== 'Admission Fee').map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50 rounded-lg hover:bg-indigo-50/50 transition-colors text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{item.icon}</span>
                                                <span className="font-medium text-slate-700">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                                        </div>
                                    ))}

                                    {feeBreakdown.find(f => f.label === 'Admission Fee') && (
                                        <div className="flex items-center justify-between py-1.5 px-2.5 bg-slate-100 rounded-lg text-slate-600 text-xs">
                                            <span className="font-semibold uppercase tracking-wider text-[10px]">Academic Fees Total</span>
                                            <span className="font-bold">
                                                {formatCurrency(feeBreakdown.filter(f => f.label !== 'Admission Fee').reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))}
                                            </span>
                                        </div>
                                    )}

                                    {feeBreakdown.find(f => f.label === 'Admission Fee') && (
                                        <div className="flex items-center justify-between py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg mt-2 mb-1 shadow-2xs relative overflow-hidden text-xs">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">🎓</span>
                                                <div>
                                                    <span className="font-bold text-amber-900 text-xs block leading-none">Admission Fee</span>
                                                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest bg-amber-200/50 px-1.5 py-0.2 rounded inline-block mt-0.5">One-Time Fee</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-amber-900">
                                                {formatCurrency(feeBreakdown.find(f => f.label === 'Admission Fee').amount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg mt-2 shadow-sm text-xs">
                                        <span className="font-bold uppercase tracking-wider text-xs">{feeBreakdown.find(f => f.label === 'Admission Fee') ? 'Grand Total' : 'Total Fee'}</span>
                                        <span className="font-bold text-sm md:text-base">{formatCurrency(feeStructure.total_fee)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400">
                                    <span className="text-2xl block mb-1">📋</span>
                                    <p className="font-medium text-xs">No fee structure found for your class</p>
                                    <p className="text-[10px] mt-0.5">Contact administration for details</p>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Sub-tab: Payment History */}
                    {academicSubTab === 'history' && (
                        <div className="space-y-3">
                            {payments.length > 0 ? (
                                Object.entries(
                                    payments.reduce((acc, payment) => {
                                        const className = payment.class_name || 'Unknown Class';
                                        if (!acc[className]) acc[className] = [];
                                        acc[className].push(payment);
                                        return acc;
                                    }, {})
                                ).map(([className, classPayments], groupIdx) => (
                                    <Card key={groupIdx} variant="elevated" className={`!p-3 overflow-hidden border-t-2 ${groupIdx % 2 === 0 ? 'border-t-emerald-500' : 'border-t-blue-500'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                <span>💳</span> Payment History <span className="text-xs font-normal text-slate-500">— {className}</span>
                                            </h2>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                                                {classPayments.length} Record{classPayments.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="overflow-hidden rounded-lg border border-slate-200 shadow-2xs">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-slate-200">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            {['Date', 'Fee Type', 'Amount', 'Method', 'Transaction ID', 'Received By', 'Action'].map(h => (
                                                                <th key={h} className="px-2.5 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-slate-100 text-xs">
                                                        {classPayments.map((payment, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap font-medium text-slate-900">{formatDate(payment.payment_date)}</td>
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${groupIdx % 2 === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                                                        {payment.remarks || 'Fee Payment'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap font-bold text-slate-900">{formatCurrency(payment.amount)}</td>
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-600 capitalize">{payment.payment_method || '—'}</td>
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-600 font-mono text-[10px]">{payment.transaction_id || '—'}</td>
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-600">{payment.received_by_name || '—'}</td>
                                                                <td className="px-2.5 py-1.5 whitespace-nowrap">
                                                                    <button onClick={() => setSelectedPayment(payment)}
                                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${groupIdx % 2 === 0 ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
                                                                        📄 Receipt
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card variant="elevated" className="!p-3 border-t-2 border-t-emerald-500">
                                    <h2 className="text-xs md:text-sm font-bold text-slate-800 mb-2">💳 Payment History</h2>
                                    <div className="text-center py-8 bg-slate-50 rounded-lg border-dashed border border-slate-200">
                                        <p className="text-xs font-semibold text-slate-500">No payment history found</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Your payment records will appear here once payments are made</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── TAB: STORE PURCHASES ──────────────────────────────────────── */}
            {activeTab === 'store' && (
                <div className="space-y-3">
                    <div className="flex p-0.5 bg-slate-100 rounded-lg w-full sm:w-fit font-semibold shadow-inner text-xs">
                        {[
                            { key: 'all', label: 'All', count: storeBills.length },
                            { key: 'paid', label: 'Paid', count: storeBills.filter(b => b.payment_status === 'paid').length },
                            { key: 'pending', label: 'Pending', count: storeBills.filter(b => b.payment_status === 'pending').length }
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setStoreFilter(tab.key)}
                                className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all duration-200 ${storeFilter === tab.key
                                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                                {tab.label}
                                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] ${storeFilter === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <Card variant="elevated" className="!p-3 overflow-hidden border-t-2 border-t-amber-500">
                        {filteredStoreBills.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-2xs">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {['Date', 'Bill No.', 'Store', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                                                    <th key={h} className="px-2.5 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100 text-xs">
                                            {filteredStoreBills.map(bill => (
                                                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-900 font-medium">{formatDate(bill.created_at)}</td>
                                                    <td className="px-2.5 py-1.5 whitespace-nowrap font-mono text-slate-600 text-[10px]">{bill.bill_number}</td>
                                                    <td className="px-2.5 py-1.5 whitespace-nowrap">
                                                        <span className="mr-1">{bill.store_icon}</span>{bill.store_name}
                                                    </td>
                                                    <td className="px-2.5 py-1.5 text-slate-600">
                                                        {bill.items?.length || 0} item{(bill.items?.length || 0) !== 1 ? 's' : ''}
                                                        <span className="text-slate-400 ml-1 text-[10px]">
                                                            ({bill.items?.map(i => i.item_name).join(', ').slice(0, 30)}{(bill.items?.map(i => i.item_name).join(', ') || '').length > 30 ? '…' : ''})
                                                        </span>
                                                    </td>
                                                    <td className="px-2.5 py-1.5 whitespace-nowrap font-bold text-slate-900">{formatCurrency(bill.subtotal)}</td>
                                                    <td className="px-2.5 py-1.5 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bill.payment_status === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                            {bill.payment_status === 'paid' ? '✅ Paid' : '🕐 Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2.5 py-1.5 whitespace-nowrap">
                                                        <button onClick={() => viewStoreBill(bill.bill_number)}
                                                            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-100 border border-blue-200 transition-all">
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
                            <div className="text-center py-8 bg-slate-50 rounded-lg border-dashed border border-slate-200">
                                <p className="text-xs font-semibold text-slate-500">No {storeFilter !== 'all' ? storeFilter : ''} store purchases found</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Your store purchases will appear here</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* ─── MODAL: FEE RECEIPT ──────────────────────────────────────── */}
            {selectedPayment && createPortal(
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-[99999] p-3 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setSelectedPayment(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-sm font-bold text-slate-900">📄 Fee Receipt</h2>
                                <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
                            </div>

                            <div ref={receiptRef} className="border border-slate-200 rounded-lg p-3 bg-white text-xs">
                                <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Fee Payment Receipt</h2>
                                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#666' }}>Official Receipt</p>
                                </div>

                                <div style={{ fontSize: '11px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Receipt ID:</span><strong>#{selectedPayment.id}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Date:</span><span>{formatDate(selectedPayment.payment_date)}</span>
                                    </div>
                                    {studentClass && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                            <span>Class:</span><span>{studentClass}</span>
                                        </div>
                                    )}
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0' }}>
                                    <thead>
                                        <tr style={{ background: '#f5f5f5' }}>
                                            <th style={{ padding: '6px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '11px' }}>Description</th>
                                            <th style={{ padding: '6px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '11px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '6px', borderBottom: '1px solid #eee', fontSize: '11px' }}>
                                                {selectedPayment.fee_type || 'Fee Payment'}
                                            </td>
                                            <td style={{ padding: '6px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>
                                                {formatCurrency(selectedPayment.total_amount || selectedPayment.amount)}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        {selectedPayment.total_amount && parseFloat(selectedPayment.total_amount) !== parseFloat(selectedPayment.paid_amount) && (
                                            <>
                                                <tr>
                                                    <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: '11px', color: '#666' }}>Total Billed</td>
                                                    <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>
                                                        {formatCurrency(selectedPayment.total_amount)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: '11px', color: '#666' }}>Amount Paid</td>
                                                    <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>
                                                        {formatCurrency(selectedPayment.paid_amount)}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                        <tr style={{ borderTop: '2px solid #333' }}>
                                            <td style={{ padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>Amount Paid</td>
                                            <td style={{ padding: '6px', fontWeight: 'bold', fontSize: '13px', textAlign: 'right', color: '#16a34a' }}>
                                                {formatCurrency(selectedPayment.paid_amount || selectedPayment.amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Payment Method:</span>
                                        <span style={{ textTransform: 'capitalize' }}>{selectedPayment.payment_method || 'Offline'}</span>
                                    </div>
                                    {selectedPayment.transaction_id && selectedPayment.transaction_id !== '-' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                            <span>Transaction ID:</span>
                                            <span>{selectedPayment.transaction_id}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Received By:</span>
                                        <span>{selectedPayment.receiver_name || selectedPayment.received_by_name || 'System'}</span>
                                    </div>
                                </div>

                                <p style={{ textAlign: 'center', fontSize: '10px', color: '#999', marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
                                    This is a computer-generated receipt • No signature required
                                </p>
                            </div>

                            <div className="flex gap-2 mt-3 text-xs font-bold">
                                <button onClick={() => handlePrint(receiptRef, `Fee Receipt #${selectedPayment.id}`)}
                                    className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-xs">
                                    🖨️ Print / Download
                                </button>
                                <button onClick={() => setSelectedPayment(null)}
                                    className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                                    ✓ Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ─── MODAL: STORE BILL ──────────────────────────────────────── */}
            {selectedStoreBill && createPortal(
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-[99999] p-3 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setSelectedStoreBill(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-sm font-bold text-slate-900">📄 Store Bill</h2>
                                <button onClick={() => setSelectedStoreBill(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
                            </div>

                            <div ref={storeBillRef} className="border border-slate-200 rounded-lg p-3 bg-white text-xs">
                                <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{selectedStoreBill.school_name || 'School Store'}</h2>
                                    <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{selectedStoreBill.school_address || ''}</p>
                                    {selectedStoreBill.school_phone && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>📞 {selectedStoreBill.school_phone}</p>}
                                    <p style={{ margin: '6px 0 0', fontSize: '12px', fontWeight: '600' }}>{selectedStoreBill.store_icon} {selectedStoreBill.store_name} — Purchase Receipt</p>
                                </div>

                                <div style={{ fontSize: '11px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Bill No:</span><strong>{selectedStoreBill.bill_number}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Date:</span><span>{formatDate(selectedStoreBill.created_at)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                        <span>Student:</span><strong>{selectedStoreBill.student_name}</strong>
                                    </div>
                                    {selectedStoreBill.class_name && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                            <span>Class:</span><span>{selectedStoreBill.class_name}</span>
                                        </div>
                                    )}
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0' }}>
                                    <thead>
                                        <tr style={{ background: '#f5f5f5' }}>
                                            <th style={{ padding: '6px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '11px' }}>Item</th>
                                            <th style={{ padding: '6px', textAlign: 'center', borderBottom: '2px solid #ddd', fontSize: '11px' }}>Qty</th>
                                            <th style={{ padding: '6px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '11px' }}>Rate</th>
                                            <th style={{ padding: '6px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '11px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedStoreBill.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '5px 6px', borderBottom: '1px solid #eee', fontSize: '11px' }}>{item.item_name}</td>
                                                <td style={{ padding: '5px 6px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ padding: '5px 6px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'right' }}>₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '5px 6px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>
                                                    ₹{(item.total_amount || item.quantity * item.unit_price).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid #eee' }}>
                                            <td colSpan="3" style={{ padding: '6px', textAlign: 'right', fontSize: '11px', color: '#666' }}>Subtotal</td>
                                            <td style={{ padding: '6px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>
                                                ₹{parseFloat(selectedStoreBill.subtotal).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                        {selectedStoreBill.gst_type && selectedStoreBill.gst_type !== 'none' && (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '3px 6px', textAlign: 'right', fontSize: '11px', color: '#666' }}>
                                                    GST {selectedStoreBill.gst_percentage}% ({selectedStoreBill.gst_type === 'inclusive' ? 'Inc.' : 'Exc.'})
                                                </td>
                                                <td style={{ padding: '3px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>
                                                    ₹{parseFloat(selectedStoreBill.gst_amount).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        )}
                                        <tr style={{ borderTop: '2px solid #333' }}>
                                            <td colSpan="3" style={{ padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>Grand Total</td>
                                            <td style={{ padding: '6px', fontWeight: 'bold', fontSize: '13px', textAlign: 'right' }}>
                                                ₹{parseFloat(selectedStoreBill.total_amount).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginTop: '6px' }}>
                                    <span>Payment: {(selectedStoreBill.payment_method || 'cash').toUpperCase()}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: selectedStoreBill.payment_status === 'paid' ? '#d4edda' : '#fff3cd', color: selectedStoreBill.payment_status === 'paid' ? '#155724' : '#856404' }}>
                                        {selectedStoreBill.payment_status === 'paid' ? '✅ PAID' : '🕐 PENDING'}
                                    </span>
                                </div>

                                <p style={{ textAlign: 'center', fontSize: '10px', color: '#999', marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
                                    Thank you for your purchase! • This is a computer-generated receipt.
                                </p>
                            </div>

                            <div className="flex gap-2 mt-3 text-xs font-bold">
                                <button onClick={() => handlePrint(storeBillRef, `Bill - ${selectedStoreBill.bill_number}`)}
                                    className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-xs">
                                    🖨️ Print / Download
                                </button>
                                <button onClick={() => setSelectedStoreBill(null)}
                                    className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
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

export default StudentFees;
