import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AdminEventsNotices = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'event' or 'notice'
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [eventsRes, noticesRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/events`, { headers }),
                fetch(`${API_URL}/api/admin/notices`, { headers })
            ]);

            const eventsData = await eventsRes.json();
            const noticesData = await noticesRes.json();

            if (eventsData.success) setEvents(eventsData.events);
            if (noticesData.success) setNotices(noticesData.notices);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setFormData(type === 'event' ? {
            title: '',
            description: '',
            event_date: '',
            event_time: '',
            location: '',
            priority: 'medium',
            status: 'active'
        } : {
            title: '',
            description: '',
            publish_date: new Date().toISOString().split('T')[0],
            expiry_date: '',
            priority: 'medium',
            target_audience: 'all',
            is_active: true
        });
        setShowModal(true);
    };

    const openEditModal = (type, item) => {
        setModalType(type);
        setEditingItem(item);
        if (type === 'event') {
            setFormData({
                title: item.title,
                description: item.description || '',
                event_date: item.event_date ? item.event_date.split('T')[0] : '',
                event_time: item.event_time || '',
                location: item.location || '',
                priority: item.priority || 'medium',
                status: item.status || 'active'
            });
        } else {
            setFormData({
                title: item.title,
                description: item.description || '',
                publish_date: item.publish_date ? item.publish_date.split('T')[0] : '',
                expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
                priority: item.priority || 'medium',
                target_audience: item.target_audience || 'all',
                is_active: item.is_active
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const isEdit = !!editingItem;
            const endpoint = modalType === 'event'
                ? `/api/admin/events${isEdit ? `/${editingItem.id}` : ''}`
                : `/api/admin/notices${isEdit ? `/${editingItem.id}` : ''}`;

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setShowModal(false);
                fetchData();
            } else {
                setError(data.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to save. Please try again.');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'event'
                ? `/api/admin/events/${id}`
                : `/api/admin/notices/${id}`;

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                fetchData();
            } else {
                setError(data.message || 'Delete failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to delete. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPriorityBadge = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'destructive';
            case 'medium': return 'warning';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">📢 Events & Notices Management</h1>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                        Create and manage school events and notices. All content is school-specific.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/10 rounded-full -mb-32"></div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                    <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>✅</span> {success}
                    <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">✕</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'events'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('events')}
                >
                    🎉 Events ({events.length})
                </button>
                <button
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'notices'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('notices')}
                >
                    📌 Notices ({notices.length})
                </button>
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
                        <button
                            onClick={() => openCreateModal('event')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                        >
                            ➕ Add Event
                        </button>
                    </div>

                    {events.length === 0 ? (
                        <Card variant="elevated">
                            <div className="text-center py-12">
                                <span className="text-5xl mb-4 block">📅</span>
                                <p className="text-gray-500">No events created yet.</p>
                                <button
                                    onClick={() => openCreateModal('event')}
                                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Create your first event
                                </button>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {events.map((event) => (
                                <Card key={event.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
                                            <Badge variant={getPriorityBadge(event.priority)}>
                                                {event.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p className="flex items-center gap-2">
                                                <span>📅</span> {formatDate(event.event_date)}
                                            </p>
                                            {event.event_time && (
                                                <p className="flex items-center gap-2">
                                                    <span>⏰</span> {event.event_time}
                                                </p>
                                            )}
                                            {event.location && (
                                                <p className="flex items-center gap-2">
                                                    <span>📍</span> {event.location}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <Badge variant={event.status === 'active' ? 'success' : 'secondary'}>
                                                {event.status}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal('event', event)}
                                                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('event', event.id)}
                                                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Notices</h2>
                        <button
                            onClick={() => openCreateModal('notice')}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-md flex items-center gap-2"
                        >
                            ➕ Add Notice
                        </button>
                    </div>

                    {notices.length === 0 ? (
                        <Card variant="elevated">
                            <div className="text-center py-12">
                                <span className="text-5xl mb-4 block">📋</span>
                                <p className="text-gray-500">No notices created yet.</p>
                                <button
                                    onClick={() => openCreateModal('notice')}
                                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    Create your first notice
                                </button>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notices.map((notice) => (
                                <Card key={notice.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-gray-800 text-lg">{notice.title}</h3>
                                            <Badge variant={getPriorityBadge(notice.priority)}>
                                                {notice.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2">{notice.description}</p>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p className="flex items-center gap-2">
                                                <span>📆</span> Published: {formatDate(notice.publish_date)}
                                            </p>
                                            {notice.expiry_date && (
                                                <p className="flex items-center gap-2">
                                                    <span>⏳</span> Expires: {formatDate(notice.expiry_date)}
                                                </p>
                                            )}
                                            <p className="flex items-center gap-2">
                                                <span>👥</span> Target: {notice.target_audience || 'All'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <Badge variant={notice.is_active ? 'success' : 'secondary'}>
                                                {notice.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal('notice', notice)}
                                                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('notice', notice.id)}
                                                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Edit' : 'Create'} {modalType === 'event' ? 'Event' : 'Notice'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {modalType === 'event' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                                            <input
                                                type="date"
                                                value={formData.event_date}
                                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                                            <input
                                                type="time"
                                                value={formData.event_time}
                                                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="e.g., Main Auditorium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                                            <input
                                                type="date"
                                                value={formData.publish_date}
                                                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={formData.expiry_date}
                                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                            <select
                                                value={formData.target_audience}
                                                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="all">All</option>
                                                <option value="students">Students</option>
                                                <option value="teachers">Teachers</option>
                                                <option value="parents">Parents</option>
                                                <option value="staff">Staff</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Active (visible to users)
                                        </label>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    {editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventsNotices;
