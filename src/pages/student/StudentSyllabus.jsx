import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
// SVG Icons
const FiBook = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

const FiDownload = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const FiCalendar = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const StudentSyllabus = () => {
    const [loading, setLoading] = useState(true);
    const [syllabusList, setSyllabusList] = useState([]);
    const [previewItem, setPreviewItem] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/student/syllabus`, {
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

    const handleDownload = async (filePath, originalName) => {
        try {
            const response = await fetch(`${API_URL}${filePath}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const ext = filePath.split('.').pop() || 'pdf';
            const cleanName = (originalName || 'syllabus').replace(/[^a-zA-Z0-9]/g, '_');
            a.download = `${cleanName}_syllabus.${ext}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download the file. Please try again later.');
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Syllabus 📚</h1>
                    <p className="mt-1 sm:mt-2 text-violet-100 text-sm sm:text-lg">Check and download your class syllabus and course materials.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-violet-400 opacity-20 blur-3xl"></div>
            </div>

            {/* PDF Preview Modal */}
            {previewItem && createPortal(
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-[99999] p-4 md:p-8 animate-in fade-in duration-200" onClick={() => setPreviewItem(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-violet-100 rounded-lg flex-shrink-0">
                                    <FiBook className="w-5 h-5 text-violet-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{previewItem.subject_name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{previewItem.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {previewItem.file_path && (
                                    <button
                                        onClick={() => handleDownload(previewItem.file_path, previewItem.subject_name)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-xs"
                                    >
                                        <FiDownload /> Download
                                    </button>
                                )}
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Media and Content Embed */}
                        <div className={`flex-1 bg-gray-100 overflow-y-auto flex flex-col ${previewItem.content && previewItem.file_path ? 'lg:flex-row' : ''}`}>
                            {previewItem.content && (
                                <div className={`p-6 whitespace-pre-wrap text-sm text-gray-800 bg-white border-r border-gray-200 font-medium ${previewItem.file_path ? 'lg:w-1/3' : 'w-full'}`}>
                                    {previewItem.content}
                                </div>
                            )}
                            
                            {previewItem.file_path && (
                                <div className={`h-full ${previewItem.content ? 'lg:w-2/3 h-[50vh] lg:h-full' : 'w-full h-full'}`}>
                                    {previewItem.file_path.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-100">
                                            <img
                                                src={`${API_URL}${previewItem.file_path}`}
                                                alt="Syllabus Preview"
                                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                            />
                                        </div>
                                    ) : (
                                        <iframe
                                            src={`${API_URL}${previewItem.file_path}`}
                                            className="w-full h-full border-0"
                                            title={`Preview - ${previewItem.subject_name}`}
                                        />
                                    )}
                                </div>
                            )}

                            {!previewItem.file_path && !previewItem.content && (
                                <div className="flex items-center justify-center h-full w-full p-6 text-gray-500">
                                    No content or file provided.
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
            ) : syllabusList.length === 0 ? (
                <Card className="text-center py-16 bg-gray-50 border-dashed border-2 border-gray-200">
                    <FiBook className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">No Syllabus Found</h3>
                    <p className="text-gray-500 mt-1">Syllabus for your class hasn't been uploaded yet.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {syllabusList.map((item, index) => (
                        <Card key={item.id || `subject-${item.subject_id}-${index}`} variant="elevated" className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border-t-4 border-violet-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-violet-50 rounded-xl">
                                    <FiBook className="w-6 h-6 text-violet-600" />
                                </div>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase">
                                    {item.subject_code}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={item.subject_name}>
                                {item.subject_name}
                            </h3>

                            {item.file_path || item.content ? (
                                <>
                                    <div className="mb-4 flex-grow">
                                        <p className="text-gray-800 font-medium text-sm sm:text-base mb-1 line-clamp-2" title={item.title}>
                                            {item.title}
                                        </p>
                                        {item.content && (
                                            <div className="mt-2">
                                                <p className={`text-gray-500 text-sm whitespace-pre-wrap ${expandedCards[item.id] ? '' : 'line-clamp-3'}`} title={!expandedCards[item.id] ? item.content : ''}>
                                                    {item.content}
                                                </p>
                                                {item.content.length > 120 && (
                                                    <button 
                                                        onClick={() => setExpandedCards(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                        className="text-violet-600 text-sm font-semibold hover:underline mt-1 inline-block"
                                                    >
                                                        {expandedCards[item.id] ? 'See less' : 'See more...'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                                        <div className="flex items-center text-gray-500 text-sm" title={`Uploaded on ${new Date(item.created_at).toLocaleDateString('en-GB')}`}>
                                            <FiCalendar className="mr-1.5" />
                                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => setPreviewItem(item)}
                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                View
                                            </button>
                                            {item.file_path && (
                                                <button
                                                    onClick={() => handleDownload(item.file_path, item.subject_name)}
                                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-sm"
                                                >
                                                    <FiDownload /> Download
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-grow flex items-center justify-center text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-2">
                                    <p className="text-sm text-gray-400 italic">No syllabus uploaded yet</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentSyllabus;
