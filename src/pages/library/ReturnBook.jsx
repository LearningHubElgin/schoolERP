import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { API_URL } from '../../productionLink/productionLink';

const ReturnBook = () => {
    const [bookQuery, setBookQuery] = useState('');
    const [studentQuery, setStudentQuery] = useState('');
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state for return confirmation
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [fineAmount, setFineAmount] = useState(0);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchAllIssuedBooks();
    }, []);

    const fetchAllIssuedBooks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/issued`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setIssuedBooks(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load issued books.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e, query, type) => {
        e.preventDefault();

        // If query is empty, reload all books
        if (!query) {
            fetchAllIssuedBooks();
            return;
        }

        if (query.length < 2) {
            setError('Please enter at least 2 characters');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/issued/search?query=${query}&type=${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.length === 0) {
                setError('No issued books found matching your search.');
            }
            setIssuedBooks(data);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search issued books.');
        } finally {
            setLoading(false);
        }
    };

    const initiateReturn = (book) => {
        setSelectedBook(book);

        // Calculate fine
        // Assuming fine is 2 rupees per day overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(book.due_date);
        due.setHours(0, 0, 0, 0);

        let calculatedFine = 0;

        if (today > due) {
            const diffTime = Math.abs(today - due);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            calculatedFine = diffDays * 2; // 2 Rs per day fine
        }

        setFineAmount(calculatedFine);
        setShowModal(true);
    };

    const confirmReturn = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    issue_id: selectedBook.id,
                    return_date: returnDate,
                    fine_amount: fineAmount,
                    remarks: remarks
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Book returned successfully!');
                setShowModal(false);
                setSelectedBook(null);
                // Refresh list
                const updatedBooks = issuedBooks.filter(b => b.id !== selectedBook.id);
                setIssuedBooks(updatedBooks);
                // Clear search terms
                setBookQuery('');
                setStudentQuery('');
            } else {
                throw new Error(data.message || 'Failed to return book');
            }
        } catch (err) {
            setError(err.message || 'Failed to return book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📥 Return Book</h1>
                <p className="text-gray-600 mt-1">Process book returns and collect fines</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Book Search Section */}
                <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
                    <form onSubmit={(e) => handleSearch(e, bookQuery, 'book')} className="space-y-4 p-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📚 Search by Book
                            </label>
                            <div className="flex relative shadow-sm rounded-xl overflow-hidden group focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 border border-gray-300 transition-all duration-300">
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 bg-white border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 text-base"
                                    placeholder="Enter ISBN or Title..."
                                    value={bookQuery}
                                    onChange={(e) => setBookQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center border-l border-blue-700"
                                >
                                    🔍
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 pl-1">Type at least 2 characters to search</p>
                        </div>
                    </form>
                </Card>

                {/* Student Search Section */}
                <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50">
                    <form onSubmit={(e) => handleSearch(e, studentQuery, 'student')} className="space-y-4 p-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                👨‍🎓 Search by Student
                            </label>
                            <div className="flex relative shadow-sm rounded-xl overflow-hidden group focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-purple-400 border border-gray-300 transition-all duration-300">
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 bg-white border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 text-base"
                                    placeholder="Enter Name or Roll No..."
                                    value={studentQuery}
                                    onChange={(e) => setStudentQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center border-l border-purple-700"
                                >
                                    🔍
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 pl-1">Search active students in the library system</p>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Results Section */}
            {issuedBooks.length > 0 && (
                <Card variant="elevated">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Book Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Days Kept</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fine / Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {issuedBooks.map((book) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const due = new Date(book.due_date);
                                    due.setHours(0, 0, 0, 0);

                                    const isOverdue = today > due;
                                    let overdueDays = 0;
                                    let fine = 0;
                                    let daysLeft = 0;

                                    if (isOverdue) {
                                        const diffTime = Math.abs(today - due);
                                        overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        fine = overdueDays * 2;
                                    } else {
                                        const diffTime = Math.abs(due - today);
                                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    }

                                    // Calculate days kept (midnight to midnight)
                                    const issueDateMidnight = new Date(book.issue_date);
                                    issueDateMidnight.setHours(0, 0, 0, 0);
                                    const daysKept = Math.floor((today - issueDateMidnight) / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{book.book_title}</span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">ISBN: {book.isbn}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                                                        {book.student_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{book.student_name}</span>
                                                        <span className="text-xs text-gray-400">Roll: {book.roll_no}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-gray-500">Issued: <span className="text-gray-900">{new Date(book.issue_date).toLocaleDateString()}</span></span>
                                                    <span className="text-gray-500">Due: <span className={`${isOverdue ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{new Date(book.due_date).toLocaleDateString()}</span></span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-blue-600">{daysKept} Days</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isOverdue ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-red-600">₹ {fine}</span>
                                                        <span className="text-xs text-red-500">Overdue by {overdueDays} days</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                                            On Time
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1">{daysLeft} days left</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    size="sm"
                                                    className={`${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white text-xs px-3 py-1.5`}
                                                    onClick={() => initiateReturn(book)}
                                                >
                                                    {isOverdue ? 'Collect Fine' : 'Return'}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Return Modal */}
            {showModal && selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Return</h3>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm text-gray-600">Book: <span className="font-medium text-gray-900">{selectedBook.book_title}</span></p>
                                <p className="text-sm text-gray-600">Student: <span className="font-medium text-gray-900">{selectedBook.student_name}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                                <Input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fine Amount (₹)</label>
                                <Input
                                    type="number"
                                    value={fineAmount}
                                    onChange={(e) => setFineAmount(e.target.value)}
                                />
                                {fineAmount > 0 && <p className="text-xs text-amber-600 mt-1">Calculated fine based on overdue days.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <Input
                                    type="text"
                                    placeholder="Any damage or notes"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={confirmReturn} disabled={loading}>
                                {loading ? 'Processing...' : 'Confirm Return'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnBook;
