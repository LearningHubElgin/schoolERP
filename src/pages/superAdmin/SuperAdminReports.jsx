import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

// Local cache to persist reports data for instant loading
let cachedReports = [];

const SuperAdminReports = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState(cachedReports);
    const [loading, setLoading] = useState(cachedReports.length === 0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBoard, setFilterBoard] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchSchools = async () => {
        if (cachedReports.length === 0) {
            setLoading(true);
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/superadmin/schools`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setSchools(res.data.schools);
                cachedReports = res.data.schools;
            }
        } catch (error) {
            console.error('Error fetching schools report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    // Filters
    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (school.city && school.city.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesBoard = filterBoard === 'All' || school.board === filterBoard;
        const matchesStatus = filterStatus === 'All' || school.status === filterStatus;

        return matchesSearch && matchesBoard && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin text-indigo-600 mb-4 mx-auto w-12 h-12 border-4 border-indigo-600/20 border-b-indigo-600 rounded-full"></div>
                    <p className="text-slate-500 font-medium">Loading school branches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 md:px-8 space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/superadmin/dashboard')}
                    className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800">Branches & Operational Reports</h1>
                <p className="text-slate-500 text-sm mt-1">Audit the status of registered institutions, view licensing provisioning periods, and inspect active configurations.</p>
            </div>

            {/* Quick Filter Control Panels */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Search School Branches</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by school name, branch code, city..."
                        className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 bg-white"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Affiliation Board</label>
                    <select
                        value={filterBoard}
                        onChange={(e) => setFilterBoard(e.target.value)}
                        className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 bg-white"
                    >
                        <option value="All">All Boards</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="WBBSE">WBBSE</option>
                        <option value="State Board">State Board</option>
                        <option value="IB">IB</option>
                        <option value="N/A">N/A</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* List card */}
            <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-4 text-xs font-semibold text-slate-500">Code</th>
                                <th className="p-4 text-xs font-semibold text-slate-500">Institution Name</th>
                                <th className="p-4 text-xs font-semibold text-slate-500">Board</th>
                                <th className="p-4 text-xs font-semibold text-slate-500">Primary Email / Phone</th>
                                <th className="p-4 text-xs font-semibold text-slate-500">Plan Details</th>
                                <th className="p-4 text-xs font-semibold text-slate-500">License Expiry</th>
                                <th className="p-4 text-xs font-semibold text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSchools.map((school) => {
                                const activePlan = (school.subscription_plan || 'basic').toLowerCase();
                                const planColors = {
                                    premium: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                                    standard: 'bg-blue-50 text-blue-700 border border-blue-100',
                                    basic: 'bg-teal-50 text-teal-700 border border-teal-100',
                                    free: 'bg-slate-50 text-slate-600 border border-slate-200'
                                };

                                return (
                                    <tr key={school.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-4 text-sm font-semibold text-slate-800">{school.code}</td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-slate-800 leading-snug">{school.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{school.city ? `${school.city}, ${school.state || ''}` : 'Location Unspecified'}</p>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-500">{school.board || 'N/A'}</td>
                                        <td className="p-4">
                                            <p className="text-xs font-semibold text-slate-700">{school.email}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{school.phone || 'No Phone'}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[activePlan] || 'bg-slate-50 text-slate-600'}`}>
                                                {school.subscription_plan}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-medium text-slate-500">
                                            {school.subscription_end ? new Date(school.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime License'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                school.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                school.status === 'inactive' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {school.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredSchools.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400 italic text-sm">No registered school branches matched your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SuperAdminReports;
