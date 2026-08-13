import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { API_URL } from '../../productionLink/productionLink';

const AdmissionReports = () => {
    const navigate = useNavigate();
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
        <div className="space-y-2.5 sm:space-y-3.5 pb-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-2.5 sm:p-5 text-white shadow-md sm:shadow-lg flex flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="relative z-10">
                    <button
                        type="button"
                        onClick={() => navigate('/admission/dashboard')}
                        className="inline-flex items-center text-blue-100 hover:text-white text-xs font-bold mb-1 transition-colors group cursor-pointer"
                    >
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-xs sm:text-xl font-bold tracking-tight flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-xl">📊</span> Admission Reports
                    </h1>
                    <p className="mt-0.5 text-blue-100 text-[9px] sm:text-xs font-medium hidden xs:block">
                        Filter, review and export comprehensive student admission PDF reports
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/admission/applications')}
                    className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer border border-white/30"
                >
                    <span>📂</span> <span className="hidden xs:inline">All Applications</span>
                </button>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            </div>

            {/* Quick Preset Filter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Card
                    onClick={() => handleFilterChange('status', 'All')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filters.status === 'All'
                        ? '!bg-gradient-to-r !from-indigo-100/90 !to-white !border-indigo-400 !border-l-[4px] !border-l-indigo-600 ring-2 ring-indigo-200'
                        : '!bg-gradient-to-r !from-indigo-50/90 !via-indigo-50/40 !to-white !border-indigo-200/90 !border-l-[4px] !border-l-indigo-600 hover:!border-indigo-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs font-bold text-indigo-950 tracking-tight">All Reports</p>
                            <p className="text-[10px] sm:text-xs text-indigo-700/80 font-medium mt-0.5">Complete Summary</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-indigo-100/90 border border-indigo-300 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">📄</div>
                    </div>
                </Card>

                <Card
                    onClick={() => handleFilterChange('status', 'Admitted')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filters.status === 'Admitted'
                        ? '!bg-gradient-to-r !from-emerald-100/90 !to-white !border-emerald-400 !border-l-[4px] !border-l-emerald-600 ring-2 ring-emerald-200'
                        : '!bg-gradient-to-r !from-emerald-50/90 !via-emerald-50/40 !to-white !border-emerald-200/90 !border-l-[4px] !border-l-emerald-600 hover:!border-emerald-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs font-bold text-emerald-950 tracking-tight">Admitted Only</p>
                            <p className="text-[10px] sm:text-xs text-emerald-700/80 font-medium mt-0.5">Approved List</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/90 border border-emerald-300 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">🎉</div>
                    </div>
                </Card>

                <Card
                    onClick={() => handleFilterChange('status', 'Pending')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filters.status === 'Pending'
                        ? '!bg-gradient-to-r !from-amber-100/90 !to-white !border-amber-400 !border-l-[4px] !border-l-amber-500 ring-2 ring-amber-200'
                        : '!bg-gradient-to-r !from-amber-50/90 !via-amber-50/40 !to-white !border-amber-200/90 !border-l-[4px] !border-l-amber-500 hover:!border-amber-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs font-bold text-amber-950 tracking-tight">Pending Review</p>
                            <p className="text-[10px] sm:text-xs text-amber-700/80 font-medium mt-0.5">Action Needed</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0">⏳</div>
                    </div>
                </Card>

                <Card
                    onClick={() => handleFilterChange('status', 'Rejected')}
                    className={`!p-0 cursor-pointer transition-all shadow-2xs ${filters.status === 'Rejected'
                        ? '!bg-gradient-to-r !from-rose-100/90 !to-white !border-rose-400 !border-l-[4px] !border-l-rose-500 ring-2 ring-rose-200'
                        : '!bg-gradient-to-r !from-rose-50/90 !via-rose-50/40 !to-white !border-rose-200/90 !border-l-[4px] !border-l-rose-500 hover:!border-rose-400'
                        }`}
                >
                    <div className="p-2.5 sm:p-3 flex items-center justify-between gap-1.5">
                        <div>
                            <p className="text-xs font-bold text-rose-950 tracking-tight">Rejected Entries</p>
                            <p className="text-[10px] sm:text-xs text-rose-700/80 font-medium mt-0.5">Declined List</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-rose-100/90 border border-rose-300 text-rose-700 font-bold text-sm flex items-center justify-center shrink-0">❌</div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                {/* Filters Section */}
                <div className="lg:col-span-2">
                    <Card title="Report Configuration" className="shadow-2xs border-slate-200/80">
                        <div className="space-y-3.5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Application Status</label>
                                    <select
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50/80 font-medium"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Admitted">Admitted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* Class Filter */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
                                    <select
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50/80 font-medium"
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
                                </div>

                                {/* Date Range Start */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
                                    <Input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>

                                {/* Date Range End */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
                                    <Input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <button
                                    onClick={generateReport}
                                    disabled={loading}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Generating PDF...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1.5">
                                            <span>📥</span> Download PDF Report
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Info Column */}
                <div className="space-y-3.5">
                    <Card className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border-0 !p-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white/10 text-indigo-300 rounded-xl flex items-center justify-center text-2xl mb-2.5 border border-white/10">
                                📊
                            </div>
                            <h3 className="text-sm font-extrabold text-indigo-200 mb-1">Report Features</h3>
                            <p className="text-slate-300 text-xs mb-4">
                                Generated PDF reports provide complete breakdown of application statistics and candidate details.
                            </p>

                            <div className="self-start text-left w-full bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <h4 className="font-extrabold text-indigo-300 mb-2 text-[10px] uppercase tracking-wider">Report Includes:</h4>
                                <ul className="space-y-1.5 text-xs text-slate-200">
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-400">✓</span> Candidate Personal Details
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-400">✓</span> Application & Class Numbers
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-400">✓</span> Fee Payment Receipts & Logs
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-400">✓</span> Admission Approval Dates
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
