import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Sector
} from 'recharts';

const AccountsReports = () => {
    // Helper to safely convert any value to a number before calling .toFixed()
    const n = (val) => Number(val) || 0;
    const [activeTab, setActiveTab] = useState('summary'); // summary, gst, balanceSheet, incomeStatement, cashflow
    const [summaryData, setSummaryData] = useState(null);
    const [gstData, setGstData] = useState([]); // This will now hold detailed list for GST tab
    const [balanceSheet, setBalanceSheet] = useState(null);
    const [incomeStatement, setIncomeStatement] = useState(null);
    const [cashflow, setCashflow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activePieIndex, setActivePieIndex] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchData = async () => {
            if (activeTab === 'summary') fetchSummary();
            if (activeTab === 'gst') fetchGstReport();
            if (activeTab === 'balanceSheet') fetchReport('balance-sheet', setBalanceSheet);
            if (activeTab === 'incomeStatement') fetchReport('income-statement', setIncomeStatement);
            if (activeTab === 'cashflow') fetchReport('cashflow', setCashflow);
        };
        fetchData();
    }, [activeTab, filters]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            // Assuming existing summary endpoint works
            const response = await axios.get(`${API_URL}/api/accounts/reports/summary?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setSummaryData(response.data.summary);
            }
        } catch (error) {
            console.error("Error fetching summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGstReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            // Use new detailed endpoint
            const response = await axios.get(`${API_URL}/api/accounts/reports/gst-detailed?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setGstData(response.data.transactions);
            }
        } catch (error) {
            console.error("Error fetching GST report:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (endpoint, setter) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/api/accounts/reports/${endpoint}?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                if (endpoint === 'balance-sheet') setter(response.data.balanceSheet);
                if (endpoint === 'income-statement') setter(response.data.incomeStatement);
                if (endpoint === 'cashflow') setter(response.data.cashflow);
            }
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // ---- Build table data for the active tab ----
    const getTabExportData = () => {
        const tabLabel = activeTab === 'summary' ? 'Financial Summary'
            : activeTab === 'gst' ? 'GST Ledger'
                : activeTab === 'balanceSheet' ? 'Balance Sheet'
                    : activeTab === 'incomeStatement' ? 'Income Statement'
                        : 'Cashflow Statement';

        let headers = [];
        let rows = [];

        if (activeTab === 'summary' && summaryData) {
            headers = ['Metric', 'Value (₹)'];
            rows = [
                ['Total Revenue', n(summaryData.revenue.total).toFixed(2)],
                ['  Cash Revenue', n(summaryData.revenue.cash).toFixed(2)],
                ['  Online Revenue', n(summaryData.revenue.online).toFixed(2)],
                ['Total Expenses', n(summaryData.expenses.total).toFixed(2)],
                ['  Cash Expenses', n(summaryData.expenses.cash).toFixed(2)],
                ['Net Balance', n(summaryData.net_balance).toFixed(2)],
                ['Cash in Hand', n(summaryData.cash_in_hand).toFixed(2)],
            ];
        }

        if (activeTab === 'gst') {
            headers = ['Date', 'Type', 'Transaction ID', 'Details', 'Category', 'Net Amt (₹)', 'GST (₹)', 'Total (₹)'];
            rows = gstData.map(row => [
                new Date(row.payment_date).toLocaleDateString('en-GB'),
                row.entry_type === 'expense' ? 'Expense' : 'Income',
                row.entry_type === 'expense' ? 'EXPENSE' : (row.transaction_id || 'CASH'),
                row.student_name,
                row.class_name || '',
                parseFloat(row.net_amount).toFixed(2),
                parseFloat(row.gst_amount).toFixed(2),
                parseFloat(row.total_amount).toFixed(2),
            ]);
            // Totals row
            if (gstData.length > 0) {
                rows.push([
                    '', '', '', '', 'TOTAL',
                    gstData.reduce((s, r) => s + parseFloat(r.net_amount), 0).toFixed(2),
                    gstData.reduce((s, r) => s + parseFloat(r.gst_amount), 0).toFixed(2),
                    gstData.reduce((s, r) => s + parseFloat(r.total_amount), 0).toFixed(2),
                ]);
            }
        }

        if (activeTab === 'balanceSheet' && balanceSheet) {
            headers = ['Category', 'Item', 'Amount (₹)'];
            rows = [
                // Equity & Liabilities
                ['Equity & Liabilities', 'Shareholders\' Funds', ''],
                ['', 'Share Capital', n(balanceSheet.equity_and_liabilities.shareholders_funds.share_capital).toFixed(2)],
                ['', 'Reserves and Surplus', n(balanceSheet.equity_and_liabilities.shareholders_funds.reserves_and_surplus).toFixed(2)],
                ['', 'Non-Current Liabilities', ''],
                ['', 'Long-term Borrowings', n(balanceSheet.equity_and_liabilities.non_current_liabilities.long_term_borrowings).toFixed(2)],
                ['', 'Current Liabilities', ''],
                ['', 'Trade Payables', n(balanceSheet.equity_and_liabilities.current_liabilities.trade_payables).toFixed(2)],
                ['', 'Other Current Liabilities', n(balanceSheet.equity_and_liabilities.current_liabilities.other_current_liabilities).toFixed(2)],
                ['', 'Short-term Provisions', n(balanceSheet.equity_and_liabilities.current_liabilities.short_term_provisions).toFixed(2)],
                ['', 'TOTAL EQUITY & LIABILITIES', n(balanceSheet.equity_and_liabilities.total).toFixed(2)],
                ['', '', ''],
                // Assets
                ['Assets', 'Non-Current Assets', ''],
                ['', 'Fixed Assets', n(balanceSheet.assets.non_current_assets.fixed_assets).toFixed(2)],
                ['', 'Current Assets', ''],
                ['', 'Inventories', n(balanceSheet.assets.current_assets.inventories).toFixed(2)],
                ['', 'Trade Receivables', n(balanceSheet.assets.current_assets.trade_receivables).toFixed(2)],
                ['', 'Cash & Cash Equivalents', n(balanceSheet.assets.current_assets.cash_and_cash_equivalents).toFixed(2)],
                ['', 'TOTAL ASSETS', n(balanceSheet.assets.total).toFixed(2)],
            ];
        }

        if (activeTab === 'incomeStatement' && incomeStatement) {
            headers = ['Category', 'Item', 'Amount (₹)'];
            rows = [
                ['Revenue', 'Fee Collection', n(incomeStatement.revenue.fees).toFixed(2)],
                ['Revenue', 'Other Income', n(incomeStatement.revenue.other).toFixed(2)],
                ['Revenue', 'Total Revenue', n(incomeStatement.revenue.total).toFixed(2)],
                ['', '', ''],
            ];
            if (incomeStatement.expenses.breakdown) {
                incomeStatement.expenses.breakdown.forEach(exp => {
                    rows.push(['Expenses', exp.category, parseFloat(exp.amount).toFixed(2)]);
                });
            }
            rows.push(['Expenses', 'Total Expenses', n(incomeStatement.expenses.total).toFixed(2)]);
            rows.push(['', '', '']);
            rows.push(['', 'GROSS INCOME', n(incomeStatement.gross_income).toFixed(2)]);
            rows.push(['', 'Tax', n(incomeStatement.tax).toFixed(2)]);
            rows.push(['', 'NET INCOME', n(incomeStatement.net_income).toFixed(2)]);
        }

        if (activeTab === 'cashflow' && cashflow) {
            headers = ['Section', 'Item', 'Amount (₹)'];
            rows = [
                ['Operating', 'Cash Inflow (Collections)', n(cashflow.operating.inflow).toFixed(2)],
                ['Operating', 'Cash Outflow (Expenses)', n(cashflow.operating.outflow).toFixed(2)],
                ['Operating', 'Net Cash from Operating', n(cashflow.operating.net).toFixed(2)],
                ['', '', ''],
                ['Investing', 'Purchase of Assets', n(cashflow.investing.net).toFixed(2)],
                ['Investing', 'Net Cash from Investing', n(cashflow.investing.net).toFixed(2)],
                ['', '', ''],
                ['Financing', 'Net Cash from Financing', n(cashflow.financing.net).toFixed(2)],
                ['', '', ''],
                ['Summary', 'Net Change in Cash', n(cashflow.net_change).toFixed(2)],
                ['Summary', 'Opening Cash Balance', n(cashflow.opening_balance).toFixed(2)],
                ['Summary', 'Closing Cash Balance', n(cashflow.closing_balance).toFixed(2)],
            ];
        }

        return { tabLabel, headers, rows };
    };

    // ---- Export to Excel ----
    const exportToExcel = async () => {
        const XLSX = await import('xlsx');
        const { tabLabel, headers, rows } = getTabExportData();
        if (rows.length === 0) return;

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Auto-size columns
        ws['!cols'] = headers.map((_, i) => ({
            wch: Math.max(headers[i].length, ...rows.map(r => String(r[i] || '').length)) + 2
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tabLabel.substring(0, 31));
        XLSX.writeFile(wb, `${tabLabel.replace(/\s+/g, '_')}_${filters.startDate}_to_${filters.endDate}.xlsx`);
    };

    // ---- Export to PDF ----
    const exportToPDF = async () => {
        const { tabLabel, headers, rows } = getTabExportData();
        if (rows.length === 0) return;

        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(tabLabel, 14, 20);
        doc.setFontSize(10);
        doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 14, 28);

        const autoTable = (await import('jspdf-autotable')).default;
        autoTable({
            head: [headers],
            body: rows,
            startY: 35,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: (data) => {
                // Bold total rows
                const cellText = String(data.cell.raw || '');
                if (cellText.includes('TOTAL') || cellText.includes('NET')) {
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.save(`${tabLabel.replace(/\s+/g, '_')}_${filters.startDate}_to_${filters.endDate}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-900">📈 Financial Reports</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={exportToExcel}>📥 Export Excel</Button>
                    <Button variant="secondary" onClick={exportToPDF}>📄 Export PDF</Button>
                    <Button variant="secondary" onClick={handlePrint}>🖨️ Print</Button>
                </div>
            </div>

            {/* Date Filters */}
            <Card className="print:hidden">
                <div className="flex items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <Button onClick={() => {
                        if (activeTab === 'summary') fetchSummary();
                        else if (activeTab === 'gst') fetchGstReport();
                        else if (activeTab === 'balanceSheet') fetchReport('balance-sheet', setBalanceSheet);
                        else if (activeTab === 'incomeStatement') fetchReport('income-statement', setIncomeStatement);
                        else if (activeTab === 'cashflow') fetchReport('cashflow', setCashflow);
                    }}>
                        Apply Filter
                    </Button>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 print:hidden overflow-x-auto">
                {['summary', 'gst', 'balanceSheet', 'incomeStatement', 'cashflow'].map(tab => (
                    <button
                        key={tab}
                        className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'summary' ? 'Summary' : tab === 'gst' ? 'GST Ledger' : tab.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            <div className="print:block pt-4">

                {/* HEADER FOR PRINT */}
                <div className="hidden print:block mb-8 text-center border-b pb-4">
                    <h1 className="text-3xl font-bold">School Financial Report</h1>
                    <h2 className="text-xl text-gray-600 uppercase mt-2">{activeTab === 'summary' ? 'Financial Summary' : activeTab === 'gst' ? 'GST Ledger' : activeTab.replace(/([A-Z])/g, ' $1').trim()}</h2>
                    <p className="text-sm text-gray-500 mt-1">Period: {new Date(filters.startDate).toLocaleDateString()} to {new Date(filters.endDate).toLocaleDateString()}</p>
                </div>

                {loading && <p className="text-center py-10">Loading Report...</p>}

                {/* TAB: SUMMARY */}
                {activeTab === 'summary' && summaryData && !loading && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Existing Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-green-50 border-green-200">
                                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-700">₹{n(summaryData.revenue.total).toFixed(2)}</p>
                                <div className="text-xs text-gray-500 mt-2 flex justify-between">
                                    <span>Cash: ₹{n(summaryData.revenue.cash).toFixed(2)}</span>
                                    <span>Online: ₹{n(summaryData.revenue.online).toFixed(2)}</span>
                                </div>
                            </Card>
                            <Card className="bg-red-50 border-red-200">
                                <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-700">₹{n(summaryData.expenses.total).toFixed(2)}</p>
                                <div className="text-xs text-gray-500 mt-2 flex justify-between">
                                    <span>Cash: ₹{n(summaryData.expenses.cash).toFixed(2)}</span>
                                    <span>Other: ₹{(n(summaryData.expenses.total) - n(summaryData.expenses.cash)).toFixed(2)}</span>
                                </div>
                            </Card>
                            <Card className="bg-blue-50 border-blue-200">
                                <p className="text-sm text-gray-600 font-medium">Net Profit / Balance</p>
                                <p className={`text-2xl font-bold ${summaryData.net_balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                                    ₹{n(summaryData.net_balance).toFixed(2)}
                                </p>
                            </Card>
                            <Card className="bg-yellow-50 border-yellow-200">
                                <p className="text-sm text-gray-600 font-medium">Cash in Hand</p>
                                <p className="text-2xl font-bold text-yellow-700">₹{n(summaryData.cash_in_hand).toFixed(2)}</p>
                            </Card>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bar Chart - Revenue vs Expenses */}
                            <Card>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Revenue vs Expenses</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={[
                                        {
                                            name: 'Cash',
                                            Revenue: n(summaryData.revenue.cash),
                                            Expenses: n(summaryData.expenses.cash),
                                        },
                                        {
                                            name: 'Online',
                                            Revenue: n(summaryData.revenue.online),
                                            Expenses: n(summaryData.expenses.total) - n(summaryData.expenses.cash),
                                        },
                                        {
                                            name: 'Total',
                                            Revenue: n(summaryData.revenue.total),
                                            Expenses: n(summaryData.expenses.total),
                                        }
                                    ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
                                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip
                                            formatter={(value) => [`₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, undefined]}
                                            contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                                        <Bar dataKey="Revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} barSize={45} />
                                        <Bar dataKey="Expenses" fill="url(#expenseGradient)" radius={[8, 8, 0, 0]} barSize={45} />
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#4338ca" stopOpacity={0.8} />
                                            </linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            {/* 3D Pie Chart - Financial Distribution */}
                            <Card>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">🧩 Financial Distribution</h3>
                                {(() => {
                                    const pieData = [
                                        { name: 'Cash Revenue', value: n(summaryData.revenue.cash), color: '#6366f1' },
                                        { name: 'Online Revenue', value: n(summaryData.revenue.online), color: '#14b8a6' },
                                        { name: 'Cash Expenses', value: n(summaryData.expenses.cash), color: '#f59e0b' },
                                        { name: 'Other Expenses', value: n(summaryData.expenses.total) - n(summaryData.expenses.cash), color: '#8b5cf6' },
                                        { name: 'GST Collected', value: n(summaryData.revenue.gst), color: '#10b981' },
                                    ].filter(d => d.value > 0);
                                    const SHADOW_COLORS = {
                                        '#6366f1': '#3730a3', '#14b8a6': '#0f766e',
                                        '#f59e0b': '#b45309', '#8b5cf6': '#6d28d9', '#10b981': '#047857'
                                    };
                                    const renderActiveShape = (props) => {
                                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
                                        return (
                                            <g>
                                                <text x={cx} y={cy - 10} textAnchor="middle" fill="#333" fontSize={14} fontWeight="bold">
                                                    {payload.name}
                                                </text>
                                                <text x={cx} y={cy + 12} textAnchor="middle" fill="#666" fontSize={12}>
                                                    ₹{value.toLocaleString('en-IN')} ({(percent * 100).toFixed(1)}%)
                                                </text>
                                                <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                                                    startAngle={startAngle} endAngle={endAngle} fill={fill} />
                                                <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
                                                    innerRadius={outerRadius + 10} outerRadius={outerRadius + 14} fill={fill} opacity={0.3} />
                                            </g>
                                        );
                                    };
                                    return (
                                        <div>
                                            <ResponsiveContainer width="100%" height={350}>
                                                <PieChart>
                                                    {/* 3D shadow layer */}
                                                    <Pie data={pieData} cx="50%" cy="52%" outerRadius={105} innerRadius={55}
                                                        dataKey="value" isAnimationActive={false}>
                                                        {pieData.map((entry, i) => (
                                                            <Cell key={`shadow-${i}`} fill={SHADOW_COLORS[entry.color] || '#555'} opacity={0.35} />
                                                        ))}
                                                    </Pie>
                                                    {/* Main pie */}
                                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={105} innerRadius={55}
                                                        dataKey="value" activeIndex={activePieIndex}
                                                        activeShape={renderActiveShape}
                                                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                                                        paddingAngle={3} stroke="none">
                                                        {pieData.map((entry, i) => (
                                                            <Cell key={`cell-${i}`} fill={entry.color}
                                                                style={{ filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.2))' }} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => [`₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, undefined]}
                                                        contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Legend */}
                                            <div className="flex flex-wrap justify-center gap-3 mt-2">
                                                {pieData.map((entry, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:opacity-80"
                                                        onMouseEnter={() => setActivePieIndex(i)}>
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 2px 4px ${entry.color}50` }} />
                                                        {entry.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB: GST LEDGER (Detailed List) */}
                {activeTab === 'gst' && !loading && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b uppercase text-xs text-gray-600">
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Transaction ID</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3 text-right">Net Amt</th>
                                        <th className="px-4 py-3 text-right">GST</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gstData.map((row, idx) => (
                                        <tr key={`${row.entry_type || 'income'}-${row.id}-${idx}`} className={row.entry_type === 'expense' ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-2">{new Date(row.payment_date).toLocaleDateString('en-GB')}</td>
                                            <td className="px-4 py-2">
                                                {row.entry_type === 'expense'
                                                    ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Expense</span>
                                                    : <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Income</span>
                                                }
                                            </td>
                                            <td className="px-4 py-2 font-mono text-xs">{row.entry_type === 'expense' ? 'EXPENSE' : (row.transaction_id || 'CASH')}</td>
                                            <td className="px-4 py-2">
                                                <div>{row.student_name}</div>
                                                <div className="text-xs text-gray-500">{row.class_name}</div>
                                            </td>
                                            <td className="px-4 py-2 text-right">₹{parseFloat(row.net_amount).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right font-medium text-purple-600">₹{parseFloat(row.gst_amount).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right font-bold">₹{parseFloat(row.total_amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Totals */}
                                    {gstData.length > 0 && (
                                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                            <td colSpan="4" className="px-4 py-3 text-right text-gray-700">TOTAL:</td>
                                            <td className="px-4 py-3 text-right">₹{gstData.reduce((s, r) => s + parseFloat(r.net_amount), 0).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right">₹{gstData.reduce((s, r) => s + parseFloat(r.gst_amount), 0).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right">₹{gstData.reduce((s, r) => s + parseFloat(r.total_amount), 0).toFixed(2)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {gstData.length === 0 && <p className="text-center py-6 text-gray-500">No GST transactions found.</p>}
                        </div>
                    </Card>
                )}

                {/* TAB: BALANCE SHEET */}
                {activeTab === 'balanceSheet' && balanceSheet && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Equity and Liabilities */}
                        <Card title="Equity and Liabilities">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Shareholders' Funds</h4>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Share Capital</span> <span>₹{n(balanceSheet.equity_and_liabilities.shareholders_funds.share_capital).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Reserves and Surplus</span> <span>₹{n(balanceSheet.equity_and_liabilities.shareholders_funds.reserves_and_surplus).toFixed(2)}</span></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Non-Current Liabilities</h4>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Long-term Borrowings</span> <span>₹{n(balanceSheet.equity_and_liabilities.non_current_liabilities.long_term_borrowings).toFixed(2)}</span></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Current Liabilities</h4>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Trade Payables</span> <span>₹{n(balanceSheet.equity_and_liabilities.current_liabilities.trade_payables).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Other Current Liabilities</span> <span>₹{n(balanceSheet.equity_and_liabilities.current_liabilities.other_current_liabilities).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Short-term Provisions</span> <span>₹{n(balanceSheet.equity_and_liabilities.current_liabilities.short_term_provisions).toFixed(2)}</span></div>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-300 text-blue-800">
                                    <span>TOTAL</span> <span>₹{n(balanceSheet.equity_and_liabilities.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Assets */}
                        <Card title="Assets">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Non-Current Assets</h4>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Fixed Assets</span> <span>₹{n(balanceSheet.assets.non_current_assets.fixed_assets).toFixed(2)}</span></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Current Assets</h4>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Inventories</span> <span>₹{n(balanceSheet.assets.current_assets.inventories).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Trade Receivables</span> <span>₹{n(balanceSheet.assets.current_assets.trade_receivables).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm pl-2 mb-1"><span>Cash & Cash Equivalents</span> <span>₹{n(balanceSheet.assets.current_assets.cash_and_cash_equivalents).toFixed(2)}</span></div>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-300 text-green-800">
                                    <span>TOTAL</span> <span>₹{n(balanceSheet.assets.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* TAB: INCOME STATEMENT */}
                {activeTab === 'incomeStatement' && incomeStatement && !loading && (
                    <Card title="Income Statement">
                        <div className="space-y-4 max-w-3xl mx-auto">
                            <div className="border-b-2 border-gray-300 pb-2 mb-2">
                                <h3 className="font-bold text-gray-700 mb-2">REVENUE</h3>
                                <div className="flex justify-between pl-4"><span>Fee Collection</span> <span>₹{n(incomeStatement.revenue.fees).toFixed(2)}</span></div>
                                <div className="flex justify-between pl-4"><span>Other Income</span> <span>₹{n(incomeStatement.revenue.other).toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold pt-2 text-right"><span>Total Revenue</span> <span>₹{n(incomeStatement.revenue.total).toFixed(2)}</span></div>
                            </div>

                            <div className="border-b-2 border-gray-300 pb-2 mb-2">
                                <h3 className="font-bold text-gray-700 mb-2">EXPENSES</h3>
                                {incomeStatement.expenses.breakdown.map((exp, i) => (
                                    <div key={i} className="flex justify-between pl-4 mb-1">
                                        <span>{exp.category}</span> <span>₹{parseFloat(exp.amount).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold pt-2 text-right"><span>Total Expenses</span> <span>(₹{n(incomeStatement.expenses.total).toFixed(2)})</span></div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                                <div className="flex justify-between items-center px-4">
                                    <span className="font-bold text-gray-700">GROSS INCOME</span>
                                    <span className="font-bold">₹{n(incomeStatement.gross_income).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-gray-600">Tax</span>
                                    <span>(-) ₹{n(incomeStatement.tax).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-2">
                                <h3 className="text-xl font-bold">NET INCOME</h3>
                                <span className={`text-2xl font-bold ${incomeStatement.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹{n(incomeStatement.net_income).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* TAB: CASHFLOW */}
                {activeTab === 'cashflow' && cashflow && !loading && (
                    <Card title="Statement of Cash Flows">
                        <div className="space-y-6 max-w-4xl mx-auto">

                            {/* Operating */}
                            <div>
                                <h3 className="font-bold text-lg text-blue-800 border-b pb-1 mb-2">Operating Activities</h3>
                                <div className="flex justify-between pl-4 mb-1"><span>Cash Inflow (Collections)</span> <span className="text-green-600">+ ₹{n(cashflow.operating.inflow).toFixed(2)}</span></div>
                                <div className="flex justify-between pl-4 mb-1"><span>Cash Outflow (Expenses)</span> <span className="text-red-600">- ₹{n(cashflow.operating.outflow).toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold bg-blue-50 p-2 mt-1 rounded"><span>Net Cash from Operating</span> <span>₹{n(cashflow.operating.net).toFixed(2)}</span></div>
                            </div>

                            {/* Investing */}
                            <div>
                                <h3 className="font-bold text-lg text-purple-800 border-b pb-1 mb-2">Investing Activities</h3>
                                <div className="flex justify-between pl-4 mb-1"><span>Purchase of Assets (Equip/Furniture)</span> <span className="text-red-600">₹{n(cashflow.investing.net).toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold bg-purple-50 p-2 mt-1 rounded"><span>Net Cash from Investing</span> <span>₹{n(cashflow.investing.net).toFixed(2)}</span></div>
                            </div>

                            {/* Financing */}
                            <div>
                                <h3 className="font-bold text-lg text-orange-800 border-b pb-1 mb-2">Financing Activities</h3>
                                <div className="flex justify-between font-bold bg-orange-50 p-2 mt-1 rounded"><span>Net Cash from Financing</span> <span>₹{n(cashflow.financing.net).toFixed(2)}</span></div>
                            </div>

                            {/* Summary */}
                            <div className="border-t-4 border-gray- double pt-4 mt-4">
                                <div className="flex justify-between text-lg font-medium"><span>Net Change in Cash</span> <span>₹{n(cashflow.net_change).toFixed(2)}</span></div>
                                <div className="flex justify-between text-gray-500"><span>Opening Cash Balance</span> <span>₹{n(cashflow.opening_balance).toFixed(2)}</span></div>
                                <div className="flex justify-between text-xl font-bold mt-2"><span>Closing Cash Balance</span> <span>₹{n(cashflow.closing_balance).toFixed(2)}</span></div>
                            </div>
                        </div>
                    </Card>
                )}

            </div>
        </div>
    );
};

export default AccountsReports;
