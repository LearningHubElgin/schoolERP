import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const StudentAssignments = () => {
    const [activeTab, setActiveTab] = useState('assignments'); // assignments, class-notes
    const [assignments, setAssignments] = useState([]);
    const [classNotes, setClassNotes] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAssignments();
        fetchClassNotes();
    }, []);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/student/assignments`, {
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
            const res = await fetch(`${API_BASE}/api/student/class-notes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setClassNotes(data.notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile || !selectedAssignment) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', submissionFile);

            const res = await fetch(`${API_BASE}/api/student/assignments/${selectedAssignment.id}/submit`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const result = await res.json();
            if (result.success) {
                toast.success('Assignment submitted successfully!');
                setSubmissionFile(null);
                setSelectedAssignment(null);
                fetchAssignments(); // Refresh status
            } else {
                toast.error(result.message || 'Failed to submit');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📝 Assignments & Notes</h1>
                    <p className="text-gray-500">View your class assignments and study notes</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => { setActiveTab('assignments'); setSelectedAssignment(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'assignments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        Assignments
                    </button>
                    <button
                        onClick={() => { setActiveTab('class-notes'); setSelectedAssignment(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'class-notes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        Class Notes
                    </button>
                </div>
            </div>

            {/* Assignments List */}
            {activeTab === 'assignments' && !selectedAssignment && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="primary">{item.subject_name}</Badge>
                                {item.is_submitted > 0 ? (
                                    <Badge variant="success">Submitted</Badge>
                                ) : (
                                    <Badge variant="warning">Pending</Badge>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{item.description}</p>

                            <div className="space-y-2 mb-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span>📅 Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No Deadline'}</span>
                                </div>
                                {item.grade && (
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <span>🌟 Grade: {item.grade}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-auto">
                                <button
                                    onClick={() => setSelectedAssignment(item)}
                                    className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                >
                                    {item.is_submitted > 0 ? 'View / Update Submission' : 'Submit Assignment'}
                                </button>
                                {item.file_path && (
                                    <a
                                        href={`${API_BASE}${item.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2 px-4 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                        title="Download Attachment"
                                    >
                                        📎
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">No assignments assigned yet.</div>
                    )}
                </div>
            )}

            {/* Assignment Detail & Submission */}
            {activeTab === 'assignments' && selectedAssignment && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <button onClick={() => setSelectedAssignment(null)} className="text-gray-500 hover:text-gray-700 mb-4">← Back to Assignments</button>

                    <Card variant="elevated">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h1>
                                <Badge variant="primary">{selectedAssignment.subject_name}</Badge>
                            </div>
                            <span className="text-sm text-gray-500">Due: {selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : 'None'}</span>
                        </div>

                        <div className="prose max-w-none text-gray-600 mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                            <p className="whitespace-pre-wrap">{selectedAssignment.description}</p>
                        </div>

                        {selectedAssignment.file_path && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Attachment</h3>
                                <a
                                    href={`${API_BASE}${selectedAssignment.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    📎 Download Attached File
                                </a>
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Submission</h3>

                            {selectedAssignment.is_submitted > 0 && (
                                <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-6 flex items-center justify-between">
                                    <span>✅ You have submitted this assignment.</span>
                                    {selectedAssignment.grade && <span className="font-bold">Grade: {selectedAssignment.grade}</span>}
                                </div>
                            )}

                            {selectedAssignment.feedback && (
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6">
                                    <span className="font-bold block mb-1">Teacher Feedback:</span>
                                    <p>{selectedAssignment.feedback}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Solution (PDF/Doc/Image)</label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500">PDF, DOC, JPG (MAX. 10MB)</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    {submissionFile && (
                                        <p className="mt-2 text-sm text-gray-600">Selected: {submissionFile.name}</p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading || !submissionFile}
                                        className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {loading ? 'Uploading...' : (selectedAssignment.is_submitted > 0 ? 'Update Submission' : 'Submit Assignment')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {/* Class Notes List */}
            {activeTab === 'class-notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {classNotes.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="warning">{item.subject_name}</Badge>
                                <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{item.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                <span>👨‍🏫 Uploaded by: {item.teacher_name}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                {item.file_path && (
                                    <a
                                        href={`${API_BASE}${item.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-2 text-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                    >
                                        📄 Download Note
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {classNotes.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">No notes available for your class.</div>
                    )}
                </div>
            )}

        </div>
    );
};

export default StudentAssignments;
