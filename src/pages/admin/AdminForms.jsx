import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const AdminForms = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    // Form State
    const [editingId, setEditingId] = useState(null); // ID of form being edited
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Seasonal', // Seasonal | All-time
        type: 'File', // File | Link
        link_url: ''
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/forms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setForms(data.forms);
            } else {
                toast.error(data.message || 'Failed to fetch forms');
            }
        } catch (error) {
            console.error('Fetch forms error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleEdit = (form) => {
        setEditingId(form.id);
        setFormData({
            title: form.title,
            description: form.description || '',
            category: form.category,
            type: form.type,
            link_url: form.link_url || ''
        });
        setFile(null); // Reset file input
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            category: 'Seasonal',
            type: 'File',
            link_url: ''
        });
        setFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('type', formData.type);
        if (formData.type === 'Link') {
            data.append('link_url', formData.link_url);
        } else if (file) {
            data.append('file', file);
        }

        const url = editingId
            ? `${API_BASE}/api/admin/forms/${editingId}`
            : `${API_BASE}/api/admin/forms`;

        const method = editingId ? 'PUT' : 'POST';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });
            const result = await res.json();

            if (result.success) {
                toast.success(editingId ? 'Form updated successfully' : 'Form added successfully');
                handleCancelEdit(); // Reset form
                fetchForms(); // Refresh list
            } else {
                toast.error(result.message || 'Failed to save form');
            }
        } catch (error) {
            console.error('Save form error:', error);
            toast.error('Server error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this form?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/forms/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Form deleted');
                setForms(forms.filter(f => f.id !== id));
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete form error:', error);
            toast.error('Server error');
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">📄 Manage Forms</h1>
                    <p className="mt-1 text-blue-100 text-xs md:text-sm">Upload and manage seasonal or all-time school forms</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add/Edit Form Section */}
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            {editingId ? 'Edit Form' : 'Add New Form'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Seasonal">Seasonal</option>
                                        <option value="All-time">All-time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="File">File Upload</option>
                                        <option value="Link">External Link</option>
                                    </select>
                                </div>
                            </div>

                            {formData.type === 'File' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editingId ? 'Replace File (Optional)' : 'Upload File'}
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        required={!editingId} // Required only for new forms
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                    <input
                                        type="url"
                                        name="link_url"
                                        value={formData.link_url}
                                        onChange={handleChange}
                                        placeholder="https://forms.google.com/..."
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="w-1/3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className={`flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all ${submitLoading ? 'opacity-70' : ''}`}
                                >
                                    {submitLoading ? 'Saving...' : (editingId ? 'Update Form' : 'Add Form')}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* List Forms Section */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Forms</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading...</td></tr>
                                    ) : forms.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">No forms found.</td></tr>
                                    ) : (
                                        forms.map(form => (
                                            <tr key={form.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800">{form.title}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">{form.description}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={form.category === 'Seasonal' ? 'warning' : 'info'}>
                                                        {form.category}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${form.type === 'Link' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {form.type === 'Link' ? '🔗 Link' : '📁 File'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleEdit(form)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(form.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminForms;
