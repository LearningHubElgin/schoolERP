import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { API_URL } from '../../productionLink/productionLink';

const AdmissionReports = () => {
    const [filters, setFilters] = useState({
        status: 'All',
        class: 'All',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);

    // Classes State
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const schoolId = localStorage.getItem('schoolId');
                const queryParam = schoolId ? `?school_id=${schoolId}` : '';
                const response = await fetch(`${API_URL}/api/admission/classes${queryParam}`);
                const data = await response.json();
                if (data.success) {
                    setClasses(data.classes);
                }
            } catch (err) {
                console.error('Failed to fetch classes:', err);
            } finally {
                setClassesLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const schoolId = localStorage.getItem('schoolId');

            const queryParams = new URLSearchParams();

            // Add school_id filter
            if (schoolId) queryParams.append('school_id', schoolId);

            if (filters.status !== 'All') queryParams.append('status', filters.status);
            if (filters.class !== 'All') queryParams.append('class', filters.class);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);

            const response = await fetch(`${API_URL}/api/admission/reports?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            // Get filename from header or default
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Admission_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Report generation error:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admission Reports 📊</h1>
                        <p className="mt-2 text-cyan-100 text-lg">
                            Generate comprehensive PDF reports based on custom filters.
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30 hidden md:block">
                        <span className="text-2xl">📄</span>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters Section */}
                <div className="lg:col-span-2">
                    <Card title="Report Configuration" className="shadow-md border-slate-200 h-full">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Application Status</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all appearance-none bg-slate-50"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Admitted">Admitted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Class Filter */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Class</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all appearance-none bg-slate-50"
                                            value={filters.class}
                                            onChange={(e) => handleFilterChange('class', e.target.value)}
                                        >
                                            <option value="All">{classesLoading ? 'Loading classes...' : 'All Classes'}</option>
                                            {[...classes]
                                                .sort((a, b) => (parseInt(a.class_number) || 0) - (parseInt(b.class_number) || 0))
                                                .map((cls) => (
                                                    <option key={cls.id} value={String(cls.class_number)}>
                                                        {cls.name || `Class ${cls.class_number}`}
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range Start */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">From Date</label>
                                    <Input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>

                                {/* Date Range End */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">To Date</label>
                                    <Input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <Button
                                    variant="primary"
                                    onClick={generateReport}
                                    disabled={loading}
                                    className="w-full md:w-auto min-w-[240px] py-3 text-lg font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Generating PDF...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <span>📥</span> Download Report
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Info Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 h-full">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
                                ℹ️
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">About Reports</h3>
                            <p className="text-slate-600 mb-6">
                                Generated reports include detailed lists of applicants, payment statuses, and student information based on your selected criteria.
                            </p>

                            <div className="self-start text-left w-full bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wide">Report Includes:</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Application Details
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Student Personal Info
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Fee Payment Status
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Admission Dates
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdmissionReports;
