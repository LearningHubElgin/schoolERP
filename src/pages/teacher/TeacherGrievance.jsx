import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const API_BASE = API_URL;

const TeacherGrievance = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Salary',
        description: '',
        priority: 'Medium'
    });

    const [submittedGrievances, setSubmittedGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingGrievance, setEditingGrievance] = useState(null);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const isSameDayAsToday = (dateInput) => {
        if (!dateInput) return false;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (typeof dateInput === 'string') {
            const rawStr = dateInput.split('T')[0].split(' ')[0];
            if (rawStr === todayStr) return true;
        }

        const d = new Date(dateInput);
        if (!isNaN(d.getTime())) {
            const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (localStr === todayStr) return true;
        }

        return false;
    };

    const fetchGrievances = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/teacher/grievances`, {
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

    const handleStartEdit = (grievance) => {
        setEditingGrievance(grievance);
        setFormData({
            subject: grievance.subject || '',
            category: grievance.category || 'Salary',
            description: grievance.description || '',
            priority: grievance.priority || 'Medium'
        });
    };

    const handleCancelEdit = () => {
        setEditingGrievance(null);
        setFormData({ subject: '', category: 'Salary', description: '', priority: 'Medium' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const url = editingGrievance
                ? `${API_BASE}/api/teacher/grievances/${editingGrievance.id}`
                : `${API_BASE}/api/teacher/grievances`;
            const method = editingGrievance ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success !== false) {
                alert(editingGrievance ? 'Grievance updated successfully!' : 'Grievance submitted successfully!');
                handleCancelEdit();
                fetchGrievances();
            } else {
                alert(data.message || 'Failed to submit grievance');
            }
        } catch (error) {
            console.error('Error submitting grievance:', error);
            alert('Error submitting grievance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (grievance) => {
        if (!isSameDayAsToday(grievance.submitted_date)) {
            alert('Grievances can only be deleted on the day they were submitted.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete grievance "${grievance.subject}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/teacher/grievances/${grievance.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success !== false) {
                alert('Grievance deleted successfully!');
                fetchGrievances();
            } else {
                alert(data.message || 'Failed to delete grievance');
            }
        } catch (error) {
            console.error('Error deleting grievance:', error);
            alert('Failed to delete grievance');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        let str = String(dateString).split('T')[0].split(' ')[0];
        const parts = str.split('-');
        if (parts.length === 3) {
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    return (
        <div className="space-y-3 pb-6">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-3.5 md:p-4 text-white shadow-sm">
                <div className="relative z-10">
                    <h1 className="text-base md:text-xl font-bold">Grievance Portal 📝</h1>
                    <p className="mt-0.5 text-indigo-100 text-xs max-w-2xl opacity-90">
                        Have a concern or suggestion? We're listening. Submit your grievances here and track their resolution status.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 items-start">
                {/* Submit / Edit Form */}
                <Card 
                    title={editingGrievance ? "Edit Submission" : "New Submission"} 
                    subtitle={editingGrievance ? `Editing Case #${editingGrievance.id}` : "Tell us what's on your mind"} 
                    variant="elevated" 
                    className="!p-3.5"
                >
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                            <Input
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Brief description of the issue"
                                required
                                className="!mb-0 !text-xs !px-2.5 !py-1.5 !rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none"
                                >
                                    <option value="Salary">Salary</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Workload">Workload</option>
                                    <option value="Management">Management</option>
                                    <option value="Facilities">Facilities</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Level</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Explain the issue in detail..."
                                required
                                rows="3"
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-2">
                            {editingGrievance && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancelEdit}
                                    className="w-1/3 h-8 md:h-9 text-xs rounded-lg font-bold"
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                className={`${editingGrievance ? 'w-2/3' : 'w-full'} h-8 md:h-9 text-xs rounded-lg font-bold shadow-xs shadow-indigo-100`}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {editingGrievance ? 'Updating...' : 'Submitting...'}
                                    </span>
                                ) : (
                                    editingGrievance ? 'Update Grievance' : 'Submit Grievance'
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Submitted Grievances */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs md:text-sm font-bold text-slate-800 tracking-tight">Support History</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">{submittedGrievances.length} Active</span>
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 opacity-40">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
                                <p className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Syncing Cases...</p>
                            </div>
                        ) : submittedGrievances.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium italic text-xs">No grievance history found.</p>
                            </div>
                        ) : (
                            submittedGrievances.map((grievance) => {
                                const canDelete = isSameDayAsToday(grievance.submitted_date);
                                const isPending = grievance.status === 'Pending';

                                return (
                                    <div key={grievance.id} className="group bg-white rounded-xl p-2.5 md:p-3 border border-slate-100 shadow-xs hover:border-indigo-100 transition-all duration-200">
                                        <div className="flex justify-between items-start gap-2 mb-1.5">
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-slate-800 truncate text-xs md:text-sm tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{grievance.subject}</h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase tracking-wider border border-indigo-100">{grievance.category}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${grievance.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            grievance.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                        {grievance.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Badge
                                                    variant={
                                                        grievance.status === 'Resolved' ? 'success' :
                                                            grievance.status === 'In Progress' ? 'warning' :
                                                                'pending'
                                                    }
                                                    className="!rounded text-[9px] font-bold uppercase tracking-wider !px-1.5 !py-0.5"
                                                >
                                                    {grievance.status}
                                                </Badge>
                                                {isPending && canDelete && (
                                                    <button
                                                        onClick={() => handleStartEdit(grievance)}
                                                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold border border-blue-200 transition-colors"
                                                        title="Edit Grievance (Same day only)"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(grievance)}
                                                        className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[10px] font-bold border border-rose-200 transition-colors"
                                                        title="Delete Grievance (Same day only)"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-slate-700 text-xs leading-snug mb-2">{grievance.description}</p>

                                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600 tracking-wide uppercase">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">Case: #{grievance.id}</span>
                                                <span className="text-slate-600 font-bold">{formatDate(grievance.submitted_date)}</span>
                                            </div>
                                            {grievance.assigned_to && <span className="text-indigo-600 font-bold">Rep: {grievance.assigned_to}</span>}
                                        </div>

                                        {grievance.resolution && (
                                            <div className="mt-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                                <p className="text-[9px] font-bold text-emerald-400 uppercase mb-0.5">Resolution Summary:</p>
                                                <p className="text-[10px] font-semibold text-emerald-700 italic">"{grievance.resolution}"</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherGrievance;
