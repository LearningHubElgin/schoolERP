import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';

const AccountsDashboard = () => {
    const { setGlobalError } = useOutletContext() || {};
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingFees: 0,
        collectedThisMonth: 0,
        totalStudents: 0,
        pendingStudents: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            // Fetch all dashboard data in parallel
            const [statsRes, transactionsRes, revenueRes] = await Promise.all([
                axios.get(`${API_URL}/api/accounts/dashboard/stats`, config),
                axios.get(`${API_URL}/api/accounts/dashboard/recent-transactions?limit=8`, config),
                axios.get(`${API_URL}/api/accounts/dashboard/monthly-revenue`, config)
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }

            if (transactionsRes.data.success) {
                setRecentTransactions(transactionsRes.data.transactions);
            }

            if (revenueRes.data.success) {
                setMonthlyRevenue(revenueRes.data.monthlyData);
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (error.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load accounts dashboard data. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        if (num >= 100000) {
            return `₹${(num / 100000).toFixed(2)}L`;
        } else if (num >= 1000) {
            return `₹${(num / 1000).toFixed(2)}K`;
        }
        return `₹${num.toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
                <h1 className="text-3xl font-bold">Accounts Dashboard</h1>
                <p className="mt-2 text-yellow-100">Financial overview and fee management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                All time collections
                            </p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </Card>

                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Expenses</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {formatCurrency(stats.totalExpenses || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Operational costs
                            </p>
                        </div>
                        <div className="text-4xl">💸</div>
                    </div>
                </Card>

                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Net Balance</p>
                            <p className={`text-3xl font-bold mt-2 ${stats.netBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                {formatCurrency(stats.netBalance || stats.totalRevenue)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Revenue - Expenses
                            </p>
                        </div>
                        <div className="text-4xl">⚖️</div>
                    </div>
                </Card>

                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Fees</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                {formatCurrency(stats.pendingFees)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Uncollected amount
                            </p>
                        </div>
                        <div className="text-4xl">⚠️</div>
                    </div>
                </Card>

                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Collected This Month</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {formatCurrency(stats.collectedThisMonth)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-4xl">📈</div>
                    </div>
                </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
                        <p className="text-xs text-gray-500 mt-1">With fee records</p>
                    </div>
                </Card>

                <Card variant="elevated">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Collection Rate</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            {stats.totalRevenue > 0
                                ? ((stats.totalRevenue / (stats.totalRevenue + stats.pendingFees)) * 100).toFixed(1)
                                : 0}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Payment success rate</p>
                    </div>
                </Card>

                <Card variant="elevated">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Average Fee</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                            {stats.totalStudents > 0
                                ? formatCurrency((stats.totalRevenue + stats.pendingFees) / stats.totalStudents)
                                : '₹0'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Per student</p>
                    </div>
                </Card>
            </div>

            {/* Events and Notices Section */}
            <EventsNoticesSection />

            {/* Monthly Revenue Chart */}
            <Card title="Revenue Overview" subtitle="Last 6 months collection trends" variant="elevated">
                {monthlyRevenue.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {monthlyRevenue.map((month, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg text-center"
                                >
                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                        {month.month_name}
                                    </p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatCurrency(month.revenue)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Simple Bar Chart Visualization */}
                        <div className="mt-6">
                            <div className="flex items-end justify-between gap-2 h-48">
                                {monthlyRevenue.map((month, index) => {
                                    const maxRevenue = Math.max(...monthlyRevenue.map(m => parseFloat(m.revenue)));
                                    const height = maxRevenue > 0
                                        ? (parseFloat(month.revenue) / maxRevenue) * 100
                                        : 0;

                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                                                <div
                                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                                                    style={{ height: `${height}%` }}
                                                    title={`${month.month_name}: ${formatCurrency(month.revenue)}`}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                                                {month.month_name.split(' ')[0]}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <p className="text-gray-600">No revenue data available</p>
                            <p className="text-sm text-gray-500 mt-2">Start collecting payments to see trends</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Recent Transactions */}
            <Card title="Recent Fee Transactions" subtitle="Latest fee records and payments" variant="elevated">
                {recentTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Roll No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Class
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paid
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pending
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentTransactions.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {record.roll_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {record.student_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>{record.class_name || `Class ${record.class}`}</div>
                                            <div className="text-xs text-gray-500">
                                                {record.section_name || `Section ${record.section}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{parseFloat(record.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            ₹{parseFloat(record.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                                            ₹{parseFloat(record.pending_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                variant={
                                                    record.status === 'paid' ? 'success' :
                                                        record.status === 'overdue' ? 'danger' :
                                                            'warning'
                                                }
                                            >
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-600">No transactions yet</p>
                        <p className="text-sm text-gray-500 mt-2">Fee records will appear here</p>
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions" variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        className="p-6 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all text-left group"
                        onClick={() => window.location.href = '/accounts/fees'}
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
                        <h4 className="font-semibold text-gray-900 text-lg">Record Payment</h4>
                        <p className="text-sm text-gray-600 mt-2">Process fee payments and collections</p>
                    </button>

                    <button
                        className="p-6 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left group"
                        onClick={() => alert('Report generation feature coming soon!')}
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                        <h4 className="font-semibold text-gray-900 text-lg">Generate Report</h4>
                        <p className="text-sm text-gray-600 mt-2">Download financial reports and analytics</p>
                    </button>

                    <button
                        className="p-6 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-left group"
                        onClick={() => alert('Reminder feature coming soon!')}
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔔</div>
                        <h4 className="font-semibold text-gray-900 text-lg">Send Reminders</h4>
                        <p className="text-sm text-gray-600 mt-2">Notify students about pending fees</p>
                    </button>
                </div>
            </Card>

        </div>
    );
};

export default AccountsDashboard;