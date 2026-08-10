import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

import { API_URL } from '../../productionLink/productionLink';

const IssueBook = () => {
    const [formData, setFormData] = useState({
        studentId: '',
        rollNo: '',
        studentName: '',
        bookIsbn: '',
        bookTitle: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: ''
    });
    const [searchType, setSearchType] = useState('student'); // 'student' or 'book'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Calculate due date (14 days from issue date)
    const calculateDueDate = (issueDate) => {
        const date = new Date(issueDate);
        date.setDate(date.getDate() + 14);
        return date.toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-calculate due date when issue date changes
        if (name === 'issueDate') {
            setFormData(prev => ({
                ...prev,
                dueDate: calculateDueDate(value)
            }));
        }
    };

    const [studentSuggestions, setStudentSuggestions] = useState([]);
    const [bookSuggestions, setBookSuggestions] = useState([]);

    const searchStudent = async (query) => {
        if (query.length < 2) {
            setStudentSuggestions([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/students/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStudentSuggestions(data);
        } catch (err) {
            console.error('Student search error:', err);
        }
    };

    const searchBook = async (query) => {
        if (query.length < 2) {
            setBookSuggestions([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/books/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setBookSuggestions(data);
        } catch (err) {
            console.error('Book search error:', err);
        }
    };

    const selectStudent = (student) => {
        setFormData(prev => ({
            ...prev,
            studentId: student.id,
            rollNo: student.roll_no,
            studentName: student.name
        }));
        setStudentSuggestions([]);
    };

    const selectBook = (book) => {
        setFormData(prev => ({
            ...prev,
            bookId: book.id, // Ensure your form state has bookId
            bookIsbn: book.isbn,
            bookTitle: book.title
        }));
        setBookSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    student_id: formData.studentId,
                    book_id: formData.bookId,
                    issue_date: formData.issueDate,
                    due_date: formData.dueDate
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Book issued successfully!');
                setFormData({
                    studentId: '',
                    rollNo: '',
                    studentName: '',
                    bookId: '',
                    bookIsbn: '',
                    bookTitle: '',
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: calculateDueDate(new Date().toISOString().split('T')[0])
                });
            } else {
                throw new Error(data.message || 'Failed to issue book');
            }
        } catch (err) {
            setError('Failed to issue book. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📤 Issue Book</h1>
                <p className="text-gray-600 mt-1">Issue a book to a student by scanning or entering details</p>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Details */}
                <Card title="Student Details" variant="elevated" allowOverflow>
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Student (Name or Roll No) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Start typing name or roll number..."
                                onChange={(e) => searchStudent(e.target.value)}
                            />
                            {studentSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {studentSuggestions.map(student => (
                                        <div
                                            key={student.id}
                                            className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                                            onClick={() => selectStudent(student)}
                                        >
                                            <p className="font-medium text-gray-900">{student.name}</p>
                                            <p className="text-sm text-gray-500">{student.roll_no} • {student.class}-{student.section}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {formData.studentName && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Selected Student</p>
                                    <p className="text-lg font-semibold text-gray-900">{formData.studentName}</p>
                                    <p className="text-sm text-gray-500">Roll No: {formData.rollNo}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, studentId: '', studentName: '', rollNo: '' }))}
                                >
                                    Change
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Book Details */}
                <Card title="Book Details" variant="elevated" allowOverflow>
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Book (ISBN or Title) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Start typing title or ISBN..."
                                onChange={(e) => searchBook(e.target.value)}
                            />
                            {bookSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {bookSuggestions.map(book => (
                                        <div
                                            key={book.id}
                                            className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                                            onClick={() => selectBook(book)}
                                        >
                                            <p className="font-medium text-gray-900">{book.title}</p>
                                            <p className="text-sm text-gray-500">ISBN: {book.isbn} • Author: {book.author}</p>
                                            <p className={`text-xs ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {book.available_copies > 0 ? `${book.available_copies} copies available` : 'Out of Stock'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {formData.bookTitle && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Selected Book</p>
                                    <p className="text-lg font-semibold text-gray-900">{formData.bookTitle}</p>
                                    <p className="text-sm text-gray-500">ISBN: {formData.bookIsbn}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, bookId: '', bookTitle: '', bookIsbn: '' }))}
                                >
                                    Change
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Issue Details */}
                <Card title="Issue Details" variant="elevated">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Default: 14 days from issue date</p>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <Card variant="elevated">
                    <div className="flex gap-4 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setFormData({
                                    studentId: '',
                                    rollNo: '',
                                    studentName: '',
                                    bookIsbn: '',
                                    bookTitle: '',
                                    issueDate: new Date().toISOString().split('T')[0],
                                    dueDate: calculateDueDate(new Date().toISOString().split('T')[0])
                                });
                                setError('');
                                setSuccess('');
                            }}
                        >
                            Clear Form
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || !formData.studentName || !formData.bookTitle}
                        >
                            {loading ? 'Issuing...' : '✅ Issue Book'}
                        </Button>
                    </div>
                </Card>
            </form>

            {/* Quick Tips */}
            <Card variant="elevated">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Use a barcode scanner for faster book and student lookup</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Default loan period is 14 days, but you can adjust the due date</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Students will receive notifications about due dates and overdue books</span>
                    </li>
                </ul>
            </Card>
        </div>
    );
};

export default IssueBook;
