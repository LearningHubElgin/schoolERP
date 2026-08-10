import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';

const NewVisitor = () => {
    const [formData, setFormData] = useState({
        visitor_name: '',
        phone: '',
        purpose: '',
        host_role: 'principal',
        appointment_type: 'random',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [recentVisitors, setRecentVisitors] = useState([]);

    const fetchRecentVisitors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/visitors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                // Show only the last 5 for a clean UI
                setRecentVisitors(res.data.visitors.slice(0, 5));
            }
        } catch (err) {
            console.error('Error fetching recent visitors:', err);
        }
    };

    React.useEffect(() => {
        fetchRecentVisitors();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/visitors`,
                {
                    ...formData,
                    whom_to_meet: formData.host_role,
                    visit_date: new Date().toISOString().split('T')[0],
                    visit_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Visitor registered successfully! Pending approval from Admin.' });
                setFormData({
                    visitor_name: '',
                    phone: '',
                    purpose: '',
                    host_role: 'principal',
                    appointment_type: 'random',
                    notes: ''
                });
                fetchRecentVisitors(); // Refresh the list
            } else {
                setMessage({ type: 'error', text: res.data.message || 'Failed to register visitor' });
            }
        } catch (err) {
            console.error('Registration error:', err);
            setMessage({ type: 'error', text: 'Server error. Please check if the database table exists.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        try {
            const [hours, minutes] = timeStr.split(':');
            let h = parseInt(hours);
            const m = minutes.substring(0, 2);
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h}:${m} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Register New Visitor</h2>
                    <p className="text-sm text-slate-500 mt-1">Random visitors must be approved by the Principal or Admin.</p>
                </div>

                {message.text && (
                    <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} border-b`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Visitor Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Visitor Name *</label>
                            <input
                                type="text"
                                name="visitor_name"
                                value={formData.visitor_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter full name"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="10-digit mobile number"
                            />
                        </div>
                    </div>

                    {/* Whom to meet */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Whom to Meet? *</label>
                        <select
                            name="host_role"
                            value={formData.host_role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="principal">Principal</option>
                            <option value="admin">Admin Area</option>
                            <option value="teacher">Teacher</option>
                            <option value="staff">Other Staff</option>
                        </select>
                    </div>

                    {/* Purpose of Visit */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Visit *</label>
                        <input
                            type="text"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Reason for meeting"
                        />
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Any extra details like company name, items carrying, etc."
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Register Visitor'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Visitors Table */}
            {recentVisitors.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recently Registered</h3>
                        <span className="text-xs text-slate-500">Last 5 entries</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Visitor</th>
                                    <th className="px-6 py-3">Whom to Meet</th>
                                    <th className="px-6 py-3">Purpose</th>
                                    <th className="px-6 py-3">Notes</th>
                                    <th className="px-6 py-3 text-center">Date & Time</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentVisitors.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{visitor.visitor_name}</div>
                                            <div className="text-xs text-slate-500">{visitor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-700">{visitor.whom_to_meet}</td>
                                        <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{visitor.purpose}</td>
                                        <td className="px-6 py-4 text-slate-500 italic text-xs max-w-[200px] truncate">
                                            {visitor.notes || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-slate-800 font-bold text-xs">{formatTime(visitor.visit_time)}</div>
                                            <div className="text-[10px] text-blue-600 font-medium mt-0.5">{formatDate(visitor.visit_date)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${visitor.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    visitor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {visitor.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewVisitor;
