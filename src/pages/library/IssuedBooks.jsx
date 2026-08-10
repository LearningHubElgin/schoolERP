import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { API_URL } from '../../productionLink/productionLink';

const IssuedBooks = () => {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [originalIssuedBooks, setOriginalIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [editForm, setEditForm] = useState({
        student_id: '',
        book_id: '',
        student_name: '',
        book_title: '',
        issue_date: '',
        due_date: ''
    });

    // Search Helpers for Edit Modal
    const [studentSearch, setStudentSearch] = useState('');
    const [studentResults, setStudentResults] = useState([]);
    const [bookSearch, setBookSearch] = useState('');
    const [bookResults, setBookResults] = useState([]);

    useEffect(() => {
        fetchIssuedBooks();
    }, []);

    const fetchIssuedBooks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/issued`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setIssuedBooks(data);
                setOriginalIssuedBooks(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to normalize date to midnight for comparison
    const normalizeDate = (dateString) => {
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const getTodayNormalized = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // Filter Logic
    useEffect(() => {
        let filtered = originalIssuedBooks;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(book =>
                book.student_name.toLowerCase().includes(lower) ||
                book.book_title.toLowerCase().includes(lower) ||
                book.roll_no.toLowerCase().includes(lower) ||
                book.isbn.toLowerCase().includes(lower)
            );
        }

        if (statusFilter !== 'all') {
            const today = getTodayNormalized();
            filtered = filtered.filter(book => {
                const dueDate = normalizeDate(book.due_date);
                const isOverdue = today > dueDate;
                return statusFilter === 'overdue' ? isOverdue : !isOverdue;
            });
        }

        setIssuedBooks(filtered);
    }, [searchTerm, statusFilter, originalIssuedBooks]);

    // Stats Calculation
    const today = getTodayNormalized();
    const activeCount = originalIssuedBooks.filter(book => today <= normalizeDate(book.due_date)).length;
    const overdueCount = originalIssuedBooks.filter(book => today > normalizeDate(book.due_date)).length;

    // --- Edit Modal Logic (Same as before) ---
    const handleEditClick = (issue) => {
        setSelectedIssue(issue);
        setEditForm({
            student_id: issue.student_id,
            book_id: issue.book_id,
            student_name: issue.student_name,
            book_title: issue.book_title,
            issue_date: issue.issue_date.split('T')[0],
            due_date: issue.due_date.split('T')[0]
        });
        setStudentSearch('');
        setBookSearch('');
        setStudentResults([]);
        setBookResults([]);
        setShowEditModal(true);
    };

    const searchStudents = async (query) => {
        setStudentSearch(query);
        if (query.length < 2) { setStudentResults([]); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/students/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStudentResults(data);
        } catch (err) { console.error(err); }
    };

    const searchBooks = async (query) => {
        setBookSearch(query);
        if (query.length < 2) { setBookResults([]); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/books/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setBookResults(data);
        } catch (err) { console.error(err); }
    };

    const selectStudent = (student) => {
        setEditForm({ ...editForm, student_id: student.id, student_name: student.name });
        setStudentSearch('');
        setStudentResults([]);
    };

    const selectBook = (book) => {
        setEditForm({ ...editForm, book_id: book.id, book_title: book.title });
        setBookSearch('');
        setBookResults([]);
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/issued/${selectedIssue.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    student_id: editForm.student_id,
                    book_id: editForm.book_id,
                    issue_date: editForm.issue_date,
                    due_date: editForm.due_date
                })
            });
            if (response.ok) {
                setShowEditModal(false);
                fetchIssuedBooks();
            } else {
                alert('Update failed');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (issueId) => {
        if (!window.confirm('Are you sure you want to delete this issue record? This action cannot be undone and will restore the book inventory.')) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/issued/${issueId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // If we deleted the selected issue, close modal
                if (selectedIssue && selectedIssue.id === issueId) {
                    setShowEditModal(false);
                }
                fetchIssuedBooks();
            } else {
                alert(data.message || 'Delete failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting record');
        } finally {
            setLoading(false);
        }
    };

    const getDaysLeft = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📋 Issued Books</h1>
                <p className="text-gray-600 mt-1">Track all currently issued books and their status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Issued</p>
                            <p className="text-3xl font-bold text-gray-900">{originalIssuedBooks.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl">📚</div>
                    </div>
                </Card>
                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Issues</p>
                            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl">✅</div>
                    </div>
                </Card>
                <Card variant="elevated">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Overdue</p>
                            <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-2xl">⚠️</div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <Input
                            placeholder="Search by book, student, or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card variant="elevated">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Book Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Issue Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Due Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {issuedBooks.map((book) => {
                                const daysLeft = getDaysLeft(book.due_date);
                                const isOverdue = daysLeft < 0;
                                return (
                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-blue-600">{book.book_title}</span>
                                                <span className="text-xs text-gray-400">{book.author || 'Unknown Author'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{book.student_name}</span>
                                                <span className="text-xs text-gray-400">{book.roll_no}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{new Date(book.issue_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-indigo-600 text-center">
                                            {new Date(book.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{new Date(book.due_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleEditClick(book)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit Details"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete Record"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {issuedBooks.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No issued books found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Modal (Reused) */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Issue Record</h3>
                        <div className="space-y-4">
                            {/* Student Field */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-2 bg-gray-100 rounded border border-gray-200 text-gray-700">{editForm.student_name}</div>
                                    <div className="relative flex-1">
                                        <Input placeholder="Change Student..." value={studentSearch} onChange={(e) => searchStudents(e.target.value)} />
                                        {studentResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded mt-1 z-10 max-h-40 overflow-y-auto">
                                                {studentResults.map(s => (
                                                    <div key={s.id} className="p-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => selectStudent(s)}>
                                                        {s.name} ({s.roll_no})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Book Field */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-2 bg-gray-100 rounded border border-gray-200 text-gray-700 truncate">{editForm.book_title}</div>
                                    <div className="relative flex-1">
                                        <Input placeholder="Change Book..." value={bookSearch} onChange={(e) => searchBooks(e.target.value)} />
                                        {bookResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded mt-1 z-10 max-h-40 overflow-y-auto">
                                                {bookResults.map(b => (
                                                    <div key={b.id} className="p-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => selectBook(b)}>
                                                        {b.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                    <Input type="date" value={editForm.issue_date} onChange={(e) => setEditForm({ ...editForm, issue_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <Input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button onClick={handleUpdate} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssuedBooks;
