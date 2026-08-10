import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const TeacherPayslips = () => {
    const [loading, setLoading] = useState(true);
    const [payslips, setPayslips] = useState([]);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/teacher/payslips`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPayslips(data.payslips);
            } else {
                toast.error(data.message || 'Failed to load payslips');
            }
        } catch (error) {
            console.error('Fetch payslips error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (filePath) => {
        window.open(`${API_BASE}${filePath}`, '_blank');
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 text-lg">Loading payslips...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">💰 My Payslips</h1>
            <p className="text-gray-500">View and download your salary payslips</p>

            {payslips.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-lg font-semibold text-gray-600">No Payslips Available</h3>
                        <p className="text-gray-400 mt-1">Your payslips will appear here once uploaded by admin.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payslips.map(p => (
                        <Card key={p.id}>
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="info">{p.month} {p.year}</Badge>
                                    <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">{p.title}</h3>
                                <div className="mt-auto pt-4">
                                    <button
                                        onClick={() => handleDownload(p.file_path)}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all text-sm"
                                    >
                                        📥 Download / View
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherPayslips;
