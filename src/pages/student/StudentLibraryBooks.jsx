import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const StudentLibraryBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/student/library/books`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setBooks(data.books);
            } else {
                setError(data.message || 'Failed to fetch books');
            }
        } catch (err) {
            console.error('Error fetching library books:', err);
            setError('Failed to load library books');
        } finally {
            setLoading(false);
        }
    };

    const calculateStatus = (dueDate, status) => {
        if (status === 'returned') return { label: 'Returned', type: 'success' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (today > due) {
            const diffTime = Math.abs(today - due);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { label: `Overdue by ${diffDays} days`, type: 'danger', days: diffDays };
        } else {
            const diffTime = Math.abs(due - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { label: `${diffDays} days left`, type: 'success', days: diffDays };
        }
    };

    const calculateFine = (dueDate, status, existingFine) => {
        if (status === 'returned') return parseFloat(existingFine) || 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (today > due) {
            const diffTime = Math.abs(today - due);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays * 2; // Assuming 2 Rs per day fine
        }
        return 0;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    // Calculate Summary Stats
    const totalIssued = books.filter(b => b.status === 'issued').length;
    const totalReturned = books.filter(b => b.status === 'returned').length;
    const totalFine = books.reduce((sum, b) => sum + (calculateFine(b.due_date, b.status, b.fine_amount) || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header - Gradient Hero */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Library</h1>
                        <p className="text-amber-100 mt-1">"Reading is to the mind what exercise is to the body."</p>
                    </div>
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/10 shadow-lg flex items-center gap-2">
                        <span className="text-2xl">📚</span>
                        <div className="text-right">
                            <p className="text-xs text-amber-50 uppercase font-bold tracking-wider">Total Books</p>
                            <p className="text-xl font-bold">{books.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-b-4 border-b-blue-500 hover:shadow-lg transition-transform hover:-translate-y-1">
                    <div className="p-2 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Currently Issued</p>
                            <p className="text-3xl font-bold text-gray-800">{totalIssued}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
                            📖
                        </div>
                    </div>
                </Card>
                <Card className="border-b-4 border-b-emerald-500 hover:shadow-lg transition-transform hover:-translate-y-1">
                    <div className="p-2 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Returned</p>
                            <p className="text-3xl font-bold text-gray-800">{totalReturned}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-sm">
                            ✅
                        </div>
                    </div>
                </Card>
                <Card className={`border-b-4 ${totalFine > 0 ? 'border-b-red-500' : 'border-b-gray-300'} hover:shadow-lg transition-transform hover:-translate-y-1`}>
                    <div className="p-2 flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${totalFine > 0 ? 'text-red-600' : 'text-gray-500'}`}>Current Fines</p>
                            <p className={`text-3xl font-bold ${totalFine > 0 ? 'text-red-600' : 'text-gray-400'}`}>₹{totalFine.toFixed(2)}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${totalFine > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                            ⚠️
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-t-4 border-t-amber-500 p-0" variant="elevated">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-lg">🔖</span>
                        Book History
                    </h3>
                </div>

                {books.length > 0 ? (
                    <>
                        {/* Mobile Grid View */}
                        <div className="block md:hidden p-4 space-y-4">
                            {books.map((book) => {
                                const statusInfo = calculateStatus(book.due_date, book.status);
                                const currentFine = calculateFine(book.due_date, book.status, book.fine_amount);

                                return (
                                    <div key={book.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="p-4 flex gap-4">
                                            {/* Book Icon/Cover Placeholder */}
                                            <div className="w-16 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-200">
                                                <span className="text-3xl">📘</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-base font-bold text-gray-900 truncate pr-2">{book.title}</h4>
                                                    <Badge variant={statusInfo.type} className="flex-shrink-0 text-xs">
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">{book.author}</p>
                                                <p className="text-xs text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1">ISBN: {book.isbn}</p>

                                                <div className="mt-3 flex items-center justify-between text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Due Date</p>
                                                        <p className="font-medium text-gray-700">{new Date(book.due_date).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                    {currentFine > 0 && (
                                                        <div className="text-right">
                                                            <p className="text-xs text-red-500 uppercase tracking-wide font-bold">Fine</p>
                                                            <p className="font-bold text-red-600">₹{currentFine}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                            <span>Issued: {new Date(book.issue_date).toLocaleDateString('en-IN')}</span>
                                            {book.return_date && <span>Returned: {new Date(book.return_date).toLocaleDateString('en-IN')}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Book Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {books.map((book) => {
                                        const statusInfo = calculateStatus(book.due_date, book.status);
                                        const currentFine = calculateFine(book.due_date, book.status, book.fine_amount);

                                        return (
                                            <tr key={book.id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-12 bg-amber-100 rounded flex items-center justify-center text-xl flex-shrink-0">
                                                            📘
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{book.title}</p>
                                                            <p className="text-sm text-gray-500">{book.author}</p>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                                                                {book.isbn}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-16 text-gray-500 text-xs uppercase">Issued:</span>
                                                            <span className="font-medium text-gray-900">{new Date(book.issue_date).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-16 text-gray-500 text-xs uppercase">Due:</span>
                                                            <span className="font-medium text-gray-900">{new Date(book.due_date).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        {book.return_date && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-16 text-green-600 text-xs uppercase font-bold">Returned:</span>
                                                                <span className="font-medium text-green-700">{new Date(book.return_date).toLocaleDateString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={statusInfo.type}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {currentFine > 0 ? (
                                                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-sm">₹{currentFine}</span>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-gray-50/50">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl mb-4 grayscale opacity-50">📚</span>
                            <p className="text-xl font-bold text-gray-400">No books issued yet.</p>
                            <p className="text-sm text-gray-400 mt-2">Visit the library to explore a world of knowledge!</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StudentLibraryBooks;
