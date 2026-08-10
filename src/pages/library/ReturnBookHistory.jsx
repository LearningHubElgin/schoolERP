import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import { API_URL } from '../../productionLink/productionLink';

const ReturnBookHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'book_wise', 'student_wise'

    // Aggregation States
    const [expandedRows, setExpandedRows] = useState({}); // For expandable details

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/library/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setHistory(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Analytics Aggregation using raw history since search is removed
    const bookAnalytics = useMemo(() => {
        const grouped = history.reduce((acc, curr) => {
            const key = curr.isbn; // Group by ISBN
            if (!acc[key]) {
                acc[key] = {
                    id: curr.isbn, // Use ISBN as ID
                    title: curr.book_title,
                    author: curr.author,
                    isbn: curr.isbn,
                    total_issues: 0,
                    records: []
                };
            }
            acc[key].total_issues += 1;
            acc[key].records.push(curr);
            return acc;
        }, {});
        return Object.values(grouped).sort((a, b) => b.total_issues - a.total_issues);
    }, [history]);

    const studentAnalytics = useMemo(() => {
        const grouped = history.reduce((acc, curr) => {
            const key = curr.roll_no; // Group by Roll No
            if (!acc[key]) {
                acc[key] = {
                    id: curr.roll_no,
                    name: curr.student_name,
                    roll_no: curr.roll_no,
                    total_books: 0,
                    records: []
                };
            }
            acc[key].total_books += 1;
            acc[key].records.push(curr);
            return acc;
        }, {});
        return Object.values(grouped).sort((a, b) => b.total_books - a.total_books);
    }, [history]);

    const toggleExpand = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderTabs = () => (
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
            {['history', 'book_wise', 'student_wise'].map(tab => (
                <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setExpandedRows({}); }}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {tab === 'history' ? '📜 All History' :
                        tab === 'book_wise' ? '📚 Book Wise Analysis' :
                            '🎓 Student Wise Analysis'}
                </button>
            ))}
        </div>
    );

    const renderHistoryTable = () => (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Book Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Issue Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Return Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Fine</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{record.book_title}</span>
                                <span className="text-xs text-gray-400">{record.author} • {record.isbn}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{record.student_name}</span>
                                <span className="text-xs text-gray-400">{record.roll_no}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{new Date(record.issue_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{new Date(record.return_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-violet-600 text-center">
                            {new Date(record.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="px-6 py-4 text-center">
                            {Number(record.fine_amount) > 0 ? (
                                <span className="text-red-600 font-medium">₹{record.fine_amount}</span>
                            ) : <span className="text-green-600 font-medium">₹0</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 italic">{record.remarks || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderBookAnalysis = () => (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-10"></th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Book Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Issues</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Unique Students</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {bookAnalytics.map((book) => (
                    <React.Fragment key={book.id}>
                        <tr
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(book.id)}
                        >
                            <td className="px-6 py-4 text-gray-400">{expandedRows[book.id] ? '▼' : '▶'}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">{book.title}</span>
                                    <span className="text-xs text-gray-400">ISBN: {book.isbn}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-blue-600 font-bold">{book.total_issues} times</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{new Set(book.records.map(r => r.roll_no)).size} students</td>
                        </tr>
                        {expandedRows[book.id] && (
                            <tr>
                                <td colSpan="4" className="bg-gray-50 px-6 py-4">
                                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Issue History</div>
                                    <div className="flex flex-wrap gap-2">
                                        {book.records.map((rec, i) => (
                                            <div key={i} className="bg-white border rounded p-2 text-xs shadow-sm">
                                                <span className="font-bold">{rec.student_name}</span> ({rec.roll_no}) <br />
                                                <span className="text-gray-400">
                                                    {new Date(rec.issue_date).toLocaleDateString()} - {new Date(rec.return_date).toLocaleDateString()}
                                                    ({new Date(rec.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );

    const renderStudentAnalysis = () => (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-10"></th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Books Taken</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Unique Books</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {studentAnalytics.map((student) => (
                    <React.Fragment key={student.id}>
                        <tr
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(student.id)}
                        >
                            <td className="px-6 py-4 text-gray-400">{expandedRows[student.id] ? '▼' : '▶'}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                    <span className="text-xs text-gray-400">Roll: {student.roll_no}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-purple-600 font-bold">{student.total_books} books</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{new Set(student.records.map(r => r.isbn)).size} unique</td>
                        </tr>
                        {expandedRows[student.id] && (
                            <tr>
                                <td colSpan="4" className="bg-gray-50 px-6 py-4">
                                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Books Read</div>
                                    <div className="flex flex-wrap gap-2">
                                        {student.records.map((rec, i) => (
                                            <div key={i} className="bg-white border rounded p-2 text-xs shadow-sm">
                                                <span className="font-bold">{rec.book_title}</span> <br />
                                                <span className="text-gray-400">
                                                    {new Date(rec.issue_date).toLocaleDateString()} - {new Date(rec.return_date).toLocaleDateString()}
                                                    ({new Date(rec.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📜 Returned Book History</h1>
                    <p className="text-gray-600 mt-1">Archive and analytics of library usage</p>
                </div>
            </div>

            {renderTabs()}

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading history data...</div>
            ) : (
                <Card variant="elevated">
                    <div className="overflow-x-auto">
                        {activeTab === 'history' && renderHistoryTable()}
                        {activeTab === 'book_wise' && renderBookAnalysis()}
                        {activeTab === 'student_wise' && renderStudentAnalysis()}
                    </div>
                    {!loading && history.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No records found.
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default ReturnBookHistory;
