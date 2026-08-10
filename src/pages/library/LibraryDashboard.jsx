import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EventsNoticesSection from '../../components/ui/EventsNoticesSection';
import { API_URL } from '../../productionLink/productionLink';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card variant="elevated" className="hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl`}>
                {icon}
            </div>
        </div>
    </Card>
);

const LibraryDashboard = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [stats, setStats] = useState({
        totalBooks: 0,
        availableBooks: 0,
        issuedBooks: 0,
        overdueBooks: 0,
        totalFine: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const timeAgo = (dateInfo) => {
        if (!dateInfo) return '';
        const date = new Date(dateInfo);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setStats(data.stats);

                // Format recent activities with relative time
                const activities = data.recentActivities.map(act => ({
                    ...act,
                    time: timeAgo(act.time)
                }));
                setRecentActivities(activities);
                setPopularBooks(data.popularBooks);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            const errMsg = 'Failed to load library data. Please check your connection.';
            
            // Check for 401/Unauthorized 
            const token = localStorage.getItem('token');
            if (!token) {
                 setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                 setGlobalError?.({ type: 'LOAD_ERROR', message: errMsg });
            }
        } finally {
            setLoading(false);
        }
    };

    const getActivityBadge = (type) => {
        switch (type) {
            case 'issue':
                return 'info';
            case 'return':
                return 'success';
            case 'add':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading library data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight">📚 Library Management</h1>
                    <p className="mt-3 text-purple-100 text-lg max-w-2xl">
                        Welcome to the digital library system. Manage books, track issues, and monitor reading activities.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={() => navigate('/library/issue')}
                            className="px-6 py-2.5 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
                        >
                            Issue Book
                        </button>
                        <button
                            onClick={() => navigate('/library/return')}
                            className="px-6 py-2.5 bg-purple-700 bg-opacity-40 text-white border border-white/20 rounded-lg font-semibold hover:bg-opacity-50 transition-all"
                        >
                            Return Book
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/10 rounded-full -mb-32"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Books"
                    value={stats.totalBooks.toLocaleString()}
                    icon="📚"
                    color="bg-blue-100 text-blue-600"
                    subtitle="In library collection"
                />
                <StatCard
                    title="Available Books"
                    value={stats.availableBooks.toLocaleString()}
                    icon="✅"
                    color="bg-green-100 text-green-600"
                    subtitle="Ready for issue"
                />
                <StatCard
                    title="Issued Books"
                    value={stats.issuedBooks.toLocaleString()}
                    icon="📤"
                    color="bg-yellow-100 text-yellow-600"
                    subtitle="Currently borrowed"
                />
                <StatCard
                    title="Overdue Books"
                    value={stats.overdueBooks}
                    icon="⏰"
                    color="bg-red-100 text-red-600"
                    subtitle="Pending return"
                />
                <StatCard
                    title="Total Fine"
                    value={`₹${stats.totalFine.toLocaleString()}`}
                    icon="💰"
                    color="bg-pink-100 text-pink-600"
                    subtitle="Collected fines"
                />
            </div>

            {/* Events and Notices Section */}
            <EventsNoticesSection />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2">
                    <Card title="Recent Activities" variant="elevated">
                        <div className="space-y-3">
                            {recentActivities.map((activity) => (
                                <div
                                    key={`${activity.id}-${activity.type}`}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <Badge variant={getActivityBadge(activity.type)} size="sm">
                                            {activity.action}
                                        </Badge>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{activity.book}</p>
                                            <p className="text-sm text-gray-500">{activity.student}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                View All Activities →
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Popular Books */}
                <div className="lg:col-span-1">
                    <Card title="Most Popular Books" variant="elevated">
                        <div className="space-y-4">
                            {popularBooks.map((book, index) => (
                                <div key={book.id} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{book.title}</p>
                                        <p className="text-sm text-gray-500">{book.author}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-400">
                                                {book.issued} issued
                                            </span>
                                            <span className="text-xs text-green-600 font-medium">
                                                {book.available} available
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions" variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/library/catalog')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📖
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Browse Catalog</p>
                            <p className="text-xs text-gray-500">View all books</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/library/add-book')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            ➕
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Add New Book</p>
                            <p className="text-xs text-gray-500">Expand collection</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/library/issued')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 group text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Issued Books</p>
                            <p className="text-xs text-gray-500">Track borrowings</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/library/return')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 group text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            ⚠️
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Overdue List</p>
                            <p className="text-xs text-gray-500">Send reminders</p>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default LibraryDashboard;
