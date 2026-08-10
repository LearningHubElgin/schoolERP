import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

import { API_URL } from '../../productionLink/productionLink';

const BookCatalog = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const navigate = useNavigate();

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [editForm, setEditForm] = useState({
        isbn: '',
        title: '',
        author: '',
        category: '',
        publisher: '',
        year: '',
        total_copies: 0,
        shelf_location: ''
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        filterBooks();
    }, [searchTerm, categoryFilter, availabilityFilter, books]);

    const handleEditClick = (book) => {
        setSelectedBook(book);
        setEditForm({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            category: book.category,
            publisher: book.publisher !== 'N/A' ? book.publisher : '',
            year: book.year !== 'N/A' ? book.year : '',
            total_copies: book.copies,
            shelf_location: book.shelf !== 'N/A' ? book.shelf : ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/books/${selectedBook.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                setShowEditModal(false);
                fetchBooks();
            } else {
                const data = await response.json();
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update book');
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/books`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }

            const data = await response.json();
            // Map backend data to frontend structure if necessary, or ensure backend sends matching structure
            const formattedBooks = data.map(book => ({
                id: book.id,
                isbn: book.isbn,
                title: book.title,
                author: book.author,
                category: book.category,
                publisher: book.publisher || 'N/A',
                year: book.year || 'N/A',
                copies: book.total_copies,
                available: book.available_copies,
                shelf: book.shelf_location || 'N/A'
            }));

            setBooks(formattedBooks);
            setFilteredBooks(formattedBooks);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterBooks = () => {
        let filtered = books;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.isbn.includes(searchTerm)
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(book => book.category === categoryFilter);
        }

        // Availability filter
        if (availabilityFilter === 'available') {
            filtered = filtered.filter(book => book.available > 0);
        } else if (availabilityFilter === 'unavailable') {
            filtered = filtered.filter(book => book.available === 0);
        }

        setFilteredBooks(filtered);
    };

    const categories = ['all', ...new Set(books.map(book => book.category))];

    const getAvailabilityBadge = (available) => {
        if (available > 5) return 'success';
        if (available > 0) return 'warning';
        return 'danger';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading books...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📖 Book Catalog</h1>
                <p className="text-gray-600 mt-1">Browse and search through {books.length} books in our collection</p>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Library</label>
                        <div className="flex relative shadow-sm rounded-xl overflow-hidden bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-purple-400 transition-all duration-300">
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                                placeholder="ISBN, Title, Author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="px-3 flex items-center justify-center bg-gray-50 border-l border-gray-100 text-gray-400">
                                🔍
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none text-sm font-medium text-gray-700 shadow-sm"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                ▼
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Availability</label>
                        <div className="relative">
                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none text-sm font-medium text-gray-700 shadow-sm"
                            >
                                <option value="all">All Books</option>
                                <option value="available">Available Only</option>
                                <option value="unavailable">Currently Unavailable</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500 font-medium">
                    Showing <span className="text-gray-900">{filteredBooks.length}</span> results
                </p>
                <button
                    onClick={() => navigate('/library/add-book')}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:to-blue-700 transition-all font-semibold text-sm flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <span>➕</span> Add Book
                </button>
            </div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => {
                        const availabilityPercentage = (book.available / book.copies) * 100;
                        const isLowStock = availabilityPercentage < 20 && book.available > 0;

                        return (
                            <div key={book.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                                {/* Decorative gradient blob */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-gradient-to-br from-purple-50 to-blue-50 rounded-full opacity-50 blur-2xl group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 pr-3">
                                            <h3 className="font-bold text-lg text-gray-900 leading-snug group-hover:text-purple-700 transition-colors">{book.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">{book.author}</p>
                                        </div>
                                        <Badge variant={getAvailabilityBadge(book.available)} size="sm" className="shadow-sm">
                                            {book.available > 0 ? 'In Stock' : 'Out of Stock'}
                                        </Badge>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-6 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                        <div className="col-span-2 flex justify-between items-center pb-2 border-b border-gray-100 mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">ISBN</span>
                                            <span className="font-mono text-gray-700">{book.isbn}</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">Category</span>
                                            <span className="font-medium text-gray-800 truncate">{book.category}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-gray-400">Shelf</span>
                                            <span className="font-medium text-gray-800">{book.shelf}</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">Publisher</span>
                                            <span className="font-medium text-gray-800 truncate">{book.publisher}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-gray-400">Year</span>
                                            <span className="font-medium text-gray-800">{book.year}</span>
                                        </div>
                                    </div>

                                    {/* Availability Bar */}
                                    <div className="mt-auto mb-4">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-xs font-semibold text-gray-500">Availability</span>
                                            <span className={`text-sm font-bold ${book.available === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {book.available} <span className="text-gray-400 text-xs font-normal">/ {book.copies}</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${book.available === 0 ? 'bg-red-500' :
                                                    isLowStock ? 'bg-amber-400' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${availabilityPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEditClick(book)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
                                                    setLoading(true);
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const response = await fetch(`${API_URL}/api/library/books/${book.id}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        const data = await response.json();
                                                        if (response.ok) {
                                                            fetchBooks(); // Refresh list
                                                        } else {
                                                            alert(data.message || 'Failed to delete book');
                                                        }
                                                    } catch (error) {
                                                        console.error('Delete error:', error);
                                                        alert('Failed to delete book');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-sm transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl grayscale">📚</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No books found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or checks the filters.</p>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Edit Book Details</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                <Input value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <Input value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                                <Input value={editForm.publisher} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <Input value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                                <Input type="number" value={editForm.total_copies} onChange={(e) => setEditForm({ ...editForm, total_copies: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Location</label>
                                <Input value={editForm.shelf_location} onChange={(e) => setEditForm({ ...editForm, shelf_location: e.target.value })} />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookCatalog;
