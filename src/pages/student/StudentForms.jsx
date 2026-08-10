import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const StudentForms = () => {
    const [activeTab, setActiveTab] = useState('Seasonal'); // Seasonal | All-time
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/student/forms`, {
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

    const filteredForms = forms.filter(f => f.category === activeTab);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📄 Forms Center</h1>
                    <p className="text-gray-500">Access and download important forms</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => setActiveTab('Seasonal')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'Seasonal'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Seasonal Forms
                    </button>
                    <button
                        onClick={() => setActiveTab('All-time')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'All-time'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        All-time Forms
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading forms...</div>
            ) : filteredForms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredForms.map(form => (
                        <Card key={form.id} className="hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${form.type === 'Link' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {form.type === 'Link' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    {new Date(form.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-2">{form.title}</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
                                {form.description || 'No description provided.'}
                            </p>

                            {form.type === 'Link' ? (
                                <a
                                    href={form.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Open Link ↗
                                </a>
                            ) : (
                                <a
                                    href={`${API_BASE}${form.file_path}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Download File ⬇
                                </a>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-medium text-gray-900">No forms available</h3>
                    <p className="text-gray-500 mt-1">There are no {activeTab.toLowerCase()} forms at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default StudentForms;
