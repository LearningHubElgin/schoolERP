import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const API_BASE = API_URL;

const StudentRequisition = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Stationery',
        description: '',
        quantity: 1,
        urgency: 'Normal'
    });

    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const fetchRequisitions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/requisitions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRequisitions(data.requisitions || []);
            }
        } catch (error) {
            console.error('Error fetching requisitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/requisitions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Requisition submitted successfully!');
                setFormData({ title: '', category: 'Stationery', description: '', quantity: 1, urgency: 'Normal' });
                fetchRequisitions();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to submit requisition');
            }
        } catch (error) {
            console.error('Error submitting requisition:', error);
            alert('Error submitting requisition');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'in progress': return 'warning';
            default: return 'pending';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'border-l-green-500';
            case 'rejected': return 'border-l-red-500';
            case 'in progress': return 'border-l-yellow-500';
            default: return 'border-l-blue-500';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header - Gradient Hero */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <span>📋</span> Requisition
                        </h1>
                        <p className="text-blue-100 mt-1 max-w-xl">Request resources, stationeries, or equipment needed for your academic activities.</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                        <p className="text-xs text-blue-50 uppercase font-bold tracking-wider">My Requests</p>
                        <p className="text-2xl font-bold">{requisitions.length}</p>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Form */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 border-t-4 border-t-blue-500 shadow-lg" title="New Request">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g., Lab Coat, Graph Paper"
                                required
                            />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="Stationery">Stationery</option>
                                        <option value="Books">Books</option>
                                        <option value="Lab Equipment">Lab Equipment</option>
                                        <option value="Sports Equipment">Sports Equipment</option>
                                        <option value="Computer/IT">Computer/IT</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Urgency
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="urgency"
                                            value={formData.urgency}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Normal">Normal</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Input
                                label="Description"
                                name="description"
                                type="textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Why do you need this?"
                                rows="3"
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Submitted Requisitions List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Recent History
                    </h3>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : requisitions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                📝
                            </div>
                            <p className="text-gray-900 font-semibold">No requisitions yet</p>
                            <p className="text-sm text-gray-500 mt-1">Submit your first request using the form.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {requisitions.map((req) => (
                                <div key={req.id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden border-l-4 ${getStatusColor(req.status)}`}>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                                {req.category}
                                            </Badge>
                                            <Badge variant={getStatusVariant(req.status)} className="shadow-sm">
                                                {req.status}
                                            </Badge>
                                        </div>

                                        <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{req.title}</h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{req.description}</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                📅 {formatDate(req.submitted_date)}
                                            </span>
                                            <span className={`font-semibold ${req.urgency === 'Urgent' ? 'text-red-600' : 'text-gray-500'}`}>
                                                {req.urgency} Priority
                                            </span>
                                        </div>

                                        {req.remarks && (
                                            <div className="mt-3 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                                                <p className="text-xs font-bold text-blue-800 mb-0.5">Admin Remarks:</p>
                                                <p className="text-xs text-blue-700 leading-relaxed">{req.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRequisition;
