import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const API_BASE = API_URL;

const SubmitGrievance = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Academic',
        description: '',
        priority: 'Medium'
    });

    const [submittedGrievances, setSubmittedGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/grievances`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSubmittedGrievances(data.grievances || []);
            }
        } catch (error) {
            console.error('Error fetching grievances:', error);
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
            const response = await fetch(`${API_BASE}/api/student/grievances`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Grievance submitted successfully!');
                setFormData({ subject: '', category: 'Academic', description: '', priority: 'Medium' });
                fetchGrievances(); // Refresh the list
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to submit grievance');
            }
        } catch (error) {
            console.error('Error submitting grievance:', error);
            alert('Error submitting grievance');
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'border-l-green-500';
            case 'in progress': return 'border-l-yellow-500';
            case 'rejected': return 'border-l-red-500';
            default: return 'border-l-rose-500';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header - Gradient Hero */}
            <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <span>🛡️</span> Grievance Redressal
                        </h1>
                        <p className="text-rose-100 mt-1 max-w-xl">We value your feedback. Report issues confidentially for prompt resolution.</p>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Form */}
                <div className="lg:col-span-1">
                    <Card className="border-t-4 border-t-rose-500 shadow-lg" title="Report Issue">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Brief title of the issue"
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
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
                                    >
                                        <option value="Academic">Academic</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Facilities">Facilities</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Priority
                                </label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <Input
                                label="Description"
                                name="description"
                                type="textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide detailed information..."
                                rows="4"
                                required
                            />

                            <div className="bg-rose-50 p-3 rounded-lg text-xs text-rose-700 border border-rose-100 flex gap-2">
                                <span className="text-lg">🔒</span>
                                <p>Your grievance will be handled with strict confidentiality by the administration.</p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 transition-all active:scale-95"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Grievance'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Submitted Grievances List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-1">
                        Submitted Grievances
                    </h3>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : submittedGrievances.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                🛡️
                            </div>
                            <p className="text-gray-900 font-semibold">No grievances reported</p>
                            <p className="text-sm text-gray-500 mt-1">If you face any issues, please report them here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submittedGrievances.map((grievance) => (
                                <div key={grievance.id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden border-l-4 ${getStatusColor(grievance.status)}`}>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                                    {grievance.category}
                                                </Badge>
                                                <Badge variant="default" size="sm" className={grievance.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}>
                                                    {grievance.priority} Priority
                                                </Badge>
                                            </div>
                                            <Badge
                                                variant={
                                                    grievance.status === 'Resolved' ? 'success' :
                                                        grievance.status === 'In Progress' ? 'warning' :
                                                            'pending'
                                                }
                                                className="shadow-sm"
                                            >
                                                {grievance.status}
                                            </Badge>
                                        </div>

                                        <h4 className="font-bold text-gray-900 text-lg mb-2">{grievance.subject}</h4>
                                        <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{grievance.description}</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                📅 Submitted: {formatDate(grievance.submitted_date)}
                                            </span>
                                            {grievance.assigned_to && <span>Assigned to: <span className="font-medium text-gray-700">{grievance.assigned_to}</span></span>}
                                        </div>

                                        {grievance.resolution && (
                                            <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                                                <p className="text-xs font-bold text-green-900 mb-0.5">Resolution:</p>
                                                <p className="text-xs text-green-700 leading-relaxed">{grievance.resolution}</p>
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

export default SubmitGrievance;
