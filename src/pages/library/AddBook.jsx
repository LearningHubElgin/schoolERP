import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import { API_URL } from '../../productionLink/productionLink';

const AddBook = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publisher: '',
        year: '',
        total_copies: '',
        shelf_location: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Book added successfully!');
                navigate('/library/catalog');
            } else {
                alert(data.message || 'Failed to add book');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
        'Biography', 'Philosophy', 'Psychology', 'Business', 'Other'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Book</h1>
                    <p className="text-gray-600 mt-1">Enter the details of the new book to add to the library catalog.</p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/library/catalog')}>
                    &larr; Back to Catalog
                </Button>
            </div>

            <div className="max-w-3xl mx-auto">
                <Card variant="elevated">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Book Title *</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. The Great Gatsby"
                                    required
                                />
                            </div>

                            {/* Author */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                                <Input
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="e.g. F. Scott Fitzgerald"
                                    required
                                />
                            </div>

                            {/* ISBN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ISBN *</label>
                                <Input
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    placeholder="e.g. 978-0-7432-7356-5"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Publisher */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                                <Input
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                    placeholder="e.g. Scribner"
                                />
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Publication Year</label>
                                <Input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="e.g. 1925"
                                />
                            </div>

                            {/* Shelf Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Location</label>
                                <Input
                                    name="shelf_location"
                                    value={formData.shelf_location}
                                    onChange={handleChange}
                                    placeholder="e.g. A-12"
                                />
                            </div>

                            {/* Total Copies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Copies *</label>
                                <Input
                                    type="number"
                                    name="total_copies"
                                    value={formData.total_copies}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => navigate('/library/catalog')}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Book'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AddBook;
