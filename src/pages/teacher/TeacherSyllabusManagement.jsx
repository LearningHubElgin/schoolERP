import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

// SVG Icons (unchanged)
const FiUpload = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const FiTrash2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const FiEdit = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const FiDownload = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const FiBook = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

const FiFilter = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

const FiEye = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const TeacherSyllabusManagement = () => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [syllabusList, setSyllabusList] = useState([]);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, url: '', title: '', content: '' });

    // Filter State
    const [selectedClassFilter, setSelectedClassFilter] = useState('');

    // Form State
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        class: '',
        stream_id: '',
        subject_id: '',
        title: '',
        content: '',
        file: null
    });

    // Streams / Groups State
    const [streams, setStreams] = useState([]);

    // Helper: check if a class_number is higher secondary
    const isHigherSecondaryClass = (classNumber) => {
        const cn = String(classNumber);
        return cn === '11' || cn === '12';
    };

    useEffect(() => {
        fetchClasses();
        fetchSyllabus(); // Fetch all relevant syllabus on load
    }, []);

    useEffect(() => {
        fetchSyllabus(selectedClassFilter);
    }, [selectedClassFilter]);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/syllabus-classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const sortedClasses = [...data.classes].sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                );
                setClasses(sortedClasses);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchClassStreams = async (classNumber) => {
        try {
            const token = localStorage.getItem('token');
            const selectedCls = classes.find(c => String(c.class_number) === String(classNumber));
            if (!selectedCls) return [];
            const response = await fetch(`${API_URL}/api/teacher/syllabus-streams/${selectedCls.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStreams(data.streams || []);
            } else {
                setStreams([]);
            }
        } catch (error) {
            console.error('Error fetching class streams:', error);
            setStreams([]);
        }
    };

    const fetchClassSubjects = async (classId, streamId = null) => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/teacher/syllabus-subjects/${classId}`;
            if (streamId) {
                url += `?stream_id=${streamId}`;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSubjects(data.subjects);
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        }
    };

    const fetchSyllabus = async (classId = null) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = classId
                ? `${API_URL}/api/teacher/syllabus/${classId}`
                : `${API_URL}/api/teacher/syllabus`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSyllabusList(data.syllabus);
            }
        } catch (error) {
            console.error('Error fetching syllabus:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleClassChange = (e) => {
        const classNumber = e.target.value;
        setFormData(prev => ({ ...prev, class: classNumber, stream_id: '', subject_id: '' }));

        if (classNumber) {
            const selectedClass = classes.find(c => String(c.class_number) === String(classNumber));
            if (selectedClass) {
                if (isHigherSecondaryClass(classNumber)) {
                    fetchClassStreams(selectedClass.id);
                    setSubjects([]);
                } else {
                    setStreams([]);
                    fetchClassSubjects(selectedClass.id);
                }
            } else {
                setSubjects([]);
                setStreams([]);
            }
        } else {
            setSubjects([]);
            setStreams([]);
        }
    };

    const handleStreamChange = (e) => {
        const streamId = e.target.value;
        setFormData(prev => ({ ...prev, stream_id: streamId, subject_id: '' }));
        const selectedClass = classes.find(c => String(c.class_number) === String(formData.class));
        if (selectedClass && streamId) {
            fetchClassSubjects(selectedClass.id, streamId);
        } else {
            setSubjects([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.class || !formData.subject_id || !formData.title) {
            alert('Please fill all required fields');
            return;
        }

        if (!formData.file && !formData.content.trim()) {
            alert('Please upload a PDF file or provide syllabus content text');
            return;
        }

        const data = new FormData();
        data.append('class', formData.class);
        if (formData.stream_id) data.append('stream_id', formData.stream_id);
        data.append('subject_id', formData.subject_id);
        data.append('title', formData.title);
        data.append('content', formData.content || '');
        if (formData.file) {
            data.append('file', formData.file);
        }
        if (editId && formData.remove_file) {
            data.append('remove_file', 'true');
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = editId ? `${API_URL}/api/teacher/syllabus/${editId}` : `${API_URL}/api/teacher/syllabus`;
            const method = editId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            const result = await response.json();
            if (result.success) {
                alert(editId ? 'Syllabus updated successfully' : 'Syllabus uploaded successfully');
                setFormData({ class: '', stream_id: '', subject_id: '', title: '', content: '', file: null, existing_file: null, remove_file: false });
                setEditId(null);
                if (document.getElementById('fileInput')) document.getElementById('fileInput').value = '';

                fetchSyllabus(selectedClassFilter || null);
            } else {
                alert(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({
            class: item.class,
            stream_id: item.stream_id || '',
            subject_id: item.subject_id,
            title: item.title,
            content: item.content || '',
            file: null,
            existing_file: item.file_path,
            remove_file: false
        });
        
        // Trigger subject loading
        const selectedClass = classes.find(c => String(c.class_number) === String(item.class));
        if (selectedClass) {
            if (isHigherSecondaryClass(item.class)) {
                fetchClassStreams(selectedClass.id).then(() => {
                    if (item.stream_id) fetchClassSubjects(selectedClass.id, item.stream_id);
                });
            } else {
                fetchClassSubjects(selectedClass.id);
            }
        }
        
        // Scroll to form after render cycle
        setTimeout(() => {
            const formElement = document.getElementById('upload-form-card');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this syllabus?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/syllabus/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                alert('Syllabus deleted');
                fetchSyllabus(selectedClassFilter);
            } else {
                alert(result.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 md:p-5 text-white shadow-md mb-2">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold">Syllabus Management 📚</h1>
                    <p className="mt-1 text-emerald-100 text-xs md:text-sm">Upload and manage class-wise syllabus for your students.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-48 h-48 rounded-full bg-teal-400 opacity-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form Card */}
                <Card className="border-t-4 border-t-emerald-500 border-2 border-gray-200 shadow-md h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        {editId ? <FiEdit className="text-emerald-600" /> : <FiUpload className="text-emerald-600" />} 
                        {editId ? 'Edit Syllabus' : 'Upload Syllabus'}
                    </h2>
                    <form id="upload-form-card" onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Class *</label>
                            <select
                                value={formData.class}
                                onChange={handleClassChange}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.class_number}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        {formData.class && isHigherSecondaryClass(formData.class) && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Group *</label>
                                <select
                                    value={formData.stream_id}
                                    onChange={handleStreamChange}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                    required
                                >
                                    <option value="">Select Group</option>
                                    {streams.map(stream => (
                                        <option key={stream.id} value={stream.id}>{stream.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Subject *</label>
                            <select
                                value={formData.subject_id}
                                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(sub => (
                                    <option key={sub.subject_id || sub.id} value={sub.subject_id || sub.id}>{sub.name || sub.subject_name} ({sub.code || sub.subject_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Title / Description *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Maths Term 1 Syllabus"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Syllabus Content (Optional)</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write syllabus content here if you don't have a PDF..."
                                rows="3"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white resize-y"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Syllabus File (PDF/Image, Optional)</label>
                            <div className="flex items-center justify-center w-full">
                                {editId && formData.existing_file && !formData.remove_file ? (
                                    <div className="flex flex-col items-center justify-center w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                                        <p className="mb-2 text-sm text-gray-700 font-medium truncate w-full text-center">
                                            Current File: {formData.existing_file.split('/').pop()}
                                        </p>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({ ...formData, remove_file: true })}
                                            className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 font-medium">Click to upload PDF or Image</p>
                                            <p className="text-xs text-gray-500">Max. 10mb</p>
                                        </div>
                                        <input
                                            id="fileInput"
                                            type="file"
                                            className="hidden"
                                            accept="application/pdf,image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                )}
                            </div>
                            {formData.file && (
                                <p className="mt-2 text-sm text-green-600 font-medium truncate flex justify-between items-center">
                                    <span>Selected: {formData.file.name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, file: null });
                                            document.getElementById('fileInput').value = '';
                                        }}
                                        className="text-red-500 hover:text-red-700 font-semibold"
                                    >
                                        Clear
                                    </button>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading} className="w-full py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
                                {loading ? (editId ? 'Updating...' : 'Uploading...') : (editId ? 'Update Syllabus' : 'Upload Syllabus')}
                            </Button>
                            {editId && (
                                <Button 
                                    type="button" 
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ class: '', stream_id: '', subject_id: '', title: '', content: '', file: null, existing_file: null, remove_file: false });
                                        if (document.getElementById('fileInput')) document.getElementById('fileInput').value = '';
                                    }} 
                                    className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-md"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Syllabus List Card */}
                <Card className="lg:col-span-2 border-t-4 border-t-emerald-500 border-2 border-gray-200 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FiBook className="text-emerald-600" /> Syllabus Repository
                        </h2>
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-gray-400" />
                            <select
                                value={selectedClassFilter}
                                onChange={(e) => setSelectedClassFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
                            >
                                <option value="">Select Class to View</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.class_number}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500">Loading syllabus...</p>
                        </div>
                    ) : syllabusList.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <FiBook className="w-12 h-12 mx-auto mb-3 text-gray-300 opacity-50" />
                            <p>No syllabus found for the selected class.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Class</th>
                                        <th className="px-4 py-3 font-semibold">Subject</th>
                                        <th className="px-4 py-3 font-semibold">Title</th>
                                        <th className="px-4 py-3 font-semibold">Uploaded by</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {syllabusList.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-emerald-700">
                                                {item.class}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {item.subject_name}
                                                <span className="block text-xs text-gray-400">{item.subject_code}</span>
                                            </td>
                                            <td className="px-4 py-3">{item.title}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {item.uploader_role === 'admin' ? 'School Admin' : (item.uploader_name || 'Teacher')}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {item.uploader_role === 'admin' ? 'Administrator' : (item.uploader_role || 'Staff')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(item.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setPreviewModal({ isOpen: true, url: item.file_path ? `${API_URL}${item.file_path}` : '', title: item.title, content: item.content || '' })}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shadow-sm"
                                                        title="Preview"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    {item.file_path && (
                                                        <a
                                                            href={`${API_URL}${item.file_path}`}
                                                            download
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
                                                            title="Download"
                                                        >
                                                            <FiDownload className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shadow-sm"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
                title={`Preview: ${previewModal.title}`}
                size="xl"
                footer={<Button onClick={() => setPreviewModal({ ...previewModal, isOpen: false })}>Close</Button>}
            >
                <div className={`w-full flex flex-col ${previewModal.content && previewModal.url ? 'lg:flex-row' : ''} gap-6`}>
                    {previewModal.content && (
                        <div className={`w-full p-6 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm text-gray-800 font-medium ${previewModal.url ? 'lg:w-1/3' : ''}`}>
                            {previewModal.content}
                        </div>
                    )}
                    
                    {previewModal.url && (
                        <div className={`w-full ${previewModal.content ? 'lg:w-2/3' : ''}`}>
                            {previewModal.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img
                                    src={previewModal.url}
                                    alt="Syllabus Preview"
                                    className="w-full h-auto max-h-[65vh] object-contain rounded-lg border border-gray-200 shadow-sm bg-white"
                                />
                            ) : (
                                <iframe
                                    src={previewModal.url}
                                    className="w-full h-[65vh] rounded-lg border border-gray-200 shadow-sm"
                                    title="Syllabus Preview"
                                />
                            )}
                        </div>
                    )}

                    {!previewModal.url && !previewModal.content && (
                        <div className="w-full p-6 text-center text-gray-500">
                            No content or PDF provided.
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default TeacherSyllabusManagement;