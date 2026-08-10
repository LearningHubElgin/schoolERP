import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const TeacherAssignments = () => {
    const [activeTab, setActiveTab] = useState('assignments'); // assignments, class-notes
    const [viewMode, setViewMode] = useState('list'); // list, create, view-submissions
    const [assignments, setAssignments] = useState([]);
    const [classNotes, setClassNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [editId, setEditId] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        classNumber: '',
        section: '',
        subject_id: '',
        title: '',
        description: '',
        due_date: '',
        file: null
    });

    useEffect(() => {
        fetchInitialData();
        fetchAssignments();
        fetchClassNotes();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch assigned classes
            const classRes = await fetch(`${API_BASE}/api/teacher/assigned-classes`, { headers });
            const classData = await classRes.json();
            if (classData.success) setClasses(classData.classes);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchSubjects = async (classNum, section) => {
        if (!classNum || !section) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/subjects?classNumber=${classNum}&section=${section}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSubjects(data.subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/assignments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setAssignments(data.assignments);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchClassNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/class-notes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setClassNotes(data.notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/assignments/${assignmentId}/submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSubmissions(data.submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = type === 'assignment'
                ? `${API_BASE}/api/teacher/assignments/${id}`
                : `${API_BASE}/api/teacher/class-notes/${id}`;

            const res = await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Deleted successfully');
                type === 'assignment' ? fetchAssignments() : fetchClassNotes();
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item, type) => {
        setEditId(item.id);
        setFormData({
            classNumber: item.class,
            section: item.section,
            subject_id: item.subject_id,
            title: item.title,
            description: item.description,
            due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '', // Format date for input
            file: null // File input cannot be pre-populated
        });
        setViewMode('create');
        // Fetch subjects for this class so they populate
        fetchSubjects(item.class, item.section);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('classNumber', formData.classNumber);
            data.append('section', formData.section);
            data.append('subject_id', formData.subject_id);
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.file) data.append('file', formData.file);

            let url = '';
            let method = editId ? 'PUT' : 'POST';

            if (activeTab === 'assignments') {
                url = editId ? `${API_BASE}/api/teacher/assignments/${editId}` : `${API_BASE}/api/teacher/assignments`;
                data.append('due_date', formData.due_date);
            } else {
                url = editId ? `${API_BASE}/api/teacher/class-notes/${editId}` : `${API_BASE}/api/teacher/class-notes`;
            }

            const res = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            const result = await res.json();
            if (result.success) {
                toast.success(`${activeTab === 'assignments' ? 'Assignment' : 'Class Note'} ${editId ? 'updated' : 'created'}!`);
                setFormData({
                    classNumber: '', section: '', subject_id: '', title: '', description: '', due_date: '', file: null
                });
                setEditId(null);
                setViewMode('list');
                activeTab === 'assignments' ? fetchAssignments() : fetchClassNotes();
            } else {
                toast.error(result.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (e) => {
        const [cls, sec] = e.target.value.split('-');
        setFormData({ ...formData, classNumber: cls, section: sec, subject_id: '' });
        fetchSubjects(cls, sec);
    };

    // Helper: determine due date status
    const getDueStatus = (dueDate) => {
        if (!dueDate) return { label: 'No Deadline', color: 'bg-gray-100 text-gray-600' };
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700' };
        if (diffDays === 0) return { label: 'Due Today', color: 'bg-orange-100 text-orange-700' };
        if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'bg-amber-100 text-amber-700' };
        return { label: `${diffDays}d left`, color: 'bg-emerald-100 text-emerald-700' };
    };

    // Helper: subject color gradient
    const getSubjectGradient = (name) => {
        if (!name) return 'from-blue-500 to-indigo-600';
        const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const gradients = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-purple-500 to-violet-600',
            'from-orange-500 to-red-500',
            'from-cyan-500 to-blue-600',
            'from-pink-500 to-rose-600',
            'from-amber-500 to-orange-600',
        ];
        return gradients[hash % gradients.length];
    };

    return (
        <div className="p-3 md:p-4 max-w-7xl mx-auto space-y-4">

            {/* Header */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-5 text-white shadow-md">
                <div className="relative z-10">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">📚 Learning Management</h1>
                    <p className="mt-1 text-blue-100 text-xs md:text-sm max-w-2xl">
                        Manage assignments and class notes for your students
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 right-10 w-32 h-32 bg-white/10 rounded-full -mb-16"></div>
            </div>

            {/* Tab Toggle + Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-1.5 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                    <button
                        onClick={() => { setActiveTab('assignments'); setViewMode('list'); setEditId(null); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        📝 Assignments
                    </button>
                    <button
                        onClick={() => { setActiveTab('class-notes'); setViewMode('list'); setEditId(null); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'class-notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        📒 Class Notes
                    </button>
                </div>

                {viewMode === 'list' && (
                    <button
                        onClick={() => { setViewMode('create'); setEditId(null); setFormData({ classNumber: '', section: '', subject_id: '', title: '', description: '', due_date: '', file: null }); }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow flex items-center gap-1.5"
                    >
                        ➕ Create {activeTab === 'assignments' ? 'Assignment' : 'Note'}
                    </button>
                )}
            </div>

            {/* View Mode: Create / Edit */}
            {viewMode === 'create' && (
                <Card variant="elevated" className="!p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">{editId ? '✏️ Edit' : '➕ Create'} {activeTab === 'assignments' ? 'Assignment' : 'Class Note'}</h2>
                        <button onClick={() => { setViewMode('list'); setEditId(null); }} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition font-bold">✕ Cancel</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700 mb-1">Class & Section</label>
                                <select
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={formData.classNumber && formData.section ? `${formData.classNumber}-${formData.section}` : ''}
                                    onChange={handleClassChange}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c, i) => (
                                        <option key={i} value={`${c.class_number}-${c.section}`}>{c.class_name || `Class ${c.class_number}`} - {c.section_name || `Section ${c.section}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700 mb-1">Subject</label>
                                <select
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTab === 'assignments' && (
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700 mb-1">Attachment (PDF/Doc/Image) {editId && '(Leave empty to keep existing)'}</label>
                                <input
                                    type="file"
                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => { setViewMode('list'); setEditId(null); }}
                                className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-bold">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white text-sm px-6 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 font-bold"
                            >
                                {loading ? 'Saving...' : (editId ? 'Update' : `Create ${activeTab === 'assignments' ? 'Assignment' : 'Note'}`)}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {/* View Mode: List Assignments */}
            {viewMode === 'list' && activeTab === 'assignments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {assignments.map(item => {
                        const dueStatus = getDueStatus(item.due_date);
                        return (
                            <Card key={item.id} variant="elevated" className="hover:shadow-md transition-all duration-300 overflow-hidden group !p-4">
                                {/* Gradient top bar */}
                                <div className={`h-1 bg-gradient-to-r ${getSubjectGradient(item.subject_name)} -mx-4 -mt-4 mb-3`}></div>

                                <div className="space-y-2">
                                    {/* Subject + Date */}
                                    <div className="flex items-start justify-between gap-1">
                                        <Badge variant="primary" className="!text-[9px] !px-1.5 !py-0.5">{item.subject_name}</Badge>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                    </div>

                                    {/* Title + Description */}
                                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.title}</h3>
                                    {item.description && <p className="text-gray-500 text-[11px] line-clamp-2 leading-snug">{item.description}</p>}

                                    {/* Due Date + Class */}
                                    <div className="flex items-center flex-wrap gap-1.5 text-xs">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${dueStatus.color}`}>
                                            📅 {item.due_date ? `Due: ${new Date(item.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : 'No Deadline'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700">
                                            👥 {item.class}-{item.section}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => { setSelectedAssignment(item); fetchSubmissions(item.id); setViewMode('view-submissions'); }}
                                            className="flex-1 py-1 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors font-bold text-[11px]"
                                        >
                                            View Submissions
                                        </button>
                                        {item.file_path && (
                                            <a
                                                href={`${API_BASE}${item.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-1 px-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-[11px] font-bold"
                                            >
                                                📎 View
                                            </a>
                                        )}
                                    </div>

                                    {/* Edit/Delete (visible on hover) */}
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                                        <button onClick={() => handleEdit(item, 'assignment')} className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-bold">✏️ Edit</button>
                                        <button onClick={() => handleDelete(item.id, 'assignment')} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded hover:bg-red-100 transition font-bold">🗑️ Delete</button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {assignments.length === 0 && (
                        <div className="col-span-full">
                            <Card variant="elevated" className="!p-6">
                                <div className="text-center py-6">
                                    <span className="text-4xl mb-2 block">📝</span>
                                    <p className="text-gray-500 text-sm">No assignments created yet.</p>
                                    <button onClick={() => { setViewMode('create'); setEditId(null); setFormData({ classNumber: '', section: '', subject_id: '', title: '', description: '', due_date: '', file: null }); }}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-bold">Create your first assignment</button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* View Mode: List Notes */}
            {viewMode === 'list' && activeTab === 'class-notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classNotes.map(item => (
                        <Card key={item.id} variant="elevated" className="hover:shadow-md transition-all duration-300 overflow-hidden group !p-4">
                            {/* Gradient top bar */}
                            <div className={`h-1 bg-gradient-to-r ${getSubjectGradient(item.subject_name)} -mx-4 -mt-4 mb-3`}></div>

                            <div className="space-y-2">
                                {/* Subject + Date */}
                                <div className="flex items-start justify-between gap-1">
                                    <Badge variant="warning" className="!text-[9px] !px-1.5 !py-0.5">{item.subject_name}</Badge>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                </div>

                                {/* Title + Description */}
                                <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.title}</h3>
                                {item.description && <p className="text-gray-500 text-[11px] line-clamp-2 leading-snug">{item.description}</p>}

                                {/* Class */}
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700">
                                        👥 {item.class}-{item.section}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    {item.file_path && (
                                        <a
                                            href={`${API_BASE}${item.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-1 text-center text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors font-bold text-[11px]"
                                        >
                                            📄 View Note
                                        </a>
                                    )}
                                </div>

                                {/* Edit/Delete (visible on hover) */}
                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                                    <button onClick={() => handleEdit(item, 'note')} className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-bold">✏️ Edit</button>
                                    <button onClick={() => handleDelete(item.id, 'note')} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded hover:bg-red-100 transition font-bold">🗑️ Delete</button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {classNotes.length === 0 && (
                        <div className="col-span-full">
                            <Card variant="elevated" className="!p-6">
                                <div className="text-center py-6">
                                    <span className="text-4xl mb-2 block">📒</span>
                                    <p className="text-gray-500 text-sm">No notes uploaded yet.</p>
                                    <button onClick={() => { setViewMode('create'); setEditId(null); setFormData({ classNumber: '', section: '', subject_id: '', title: '', description: '', due_date: '', file: null }); }}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-bold">Upload your first note</button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* View Mode: View Submissions */}
            {viewMode === 'view-submissions' && selectedAssignment && (
                <div className="space-y-4">
                    <button onClick={() => setViewMode('list')} className="text-gray-500 hover:text-gray-700 flex items-center gap-1.5 text-sm font-bold">
                        <span>←</span> Back to Assignments
                    </button>

                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <h2 className="text-lg font-bold text-blue-900">{selectedAssignment.title}</h2>
                        <p className="text-blue-700 text-xs mt-1 font-semibold">{selectedAssignment.subject_name} • {selectedAssignment.class}-{selectedAssignment.section}</p>
                    </div>

                    <Card variant="elevated" className="!p-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-3">Student Submissions ({submissions.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                                        <th className="py-2 px-3">Roll No</th>
                                        <th className="py-2 px-3">Student Name</th>
                                        <th className="py-2 px-3">Submitted At</th>
                                        <th className="py-2 px-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors text-xs">
                                            <td className="py-2 px-3 font-semibold text-gray-900">{sub.roll_no}</td>
                                            <td className="py-2 px-3 font-semibold text-gray-900">{sub.student_name}</td>
                                            <td className="py-2 px-3 font-semibold text-gray-500">{new Date(sub.submitted_at).toLocaleString()}</td>
                                            <td className="py-2 px-3">
                                                <a
                                                    href={`${API_BASE}${sub.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 text-[11px] font-bold px-2.5 py-1 bg-blue-50 rounded hover:bg-blue-100 transition inline-block"
                                                >
                                                    📄 View
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {submissions.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-400">
                                                <span className="text-3xl block mb-1">📭</span>
                                                <span className="text-xs font-semibold">No submissions yet</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default TeacherAssignments;
