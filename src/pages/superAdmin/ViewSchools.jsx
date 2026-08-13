import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

// Local cache to persist directories for instant loading
let cachedSchools = [];

const ViewSchools = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState(cachedSchools);
    const [loading, setLoading] = useState(cachedSchools.length === 0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBoard, setFilterBoard] = useState('All');

    // View Modal state
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    useEffect(() => {
        const fetchSchools = async () => {
            if (cachedSchools.length === 0) {
                setLoading(true);
            }
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/superadmin/schools`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success) {
                    setSchools(res.data.schools);
                    cachedSchools = res.data.schools;
                }
            } catch (error) {
                console.error('Error fetching schools list:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, []);

    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (school.city && school.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (school.principal_name && school.principal_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesBoard = filterBoard === 'All' || school.board === filterBoard;
        return matchesSearch && matchesBoard;
    });

    const handleOpenView = (school) => {
        setSelectedSchool(school);
        setViewModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin text-indigo-600 mb-4 mx-auto w-12 h-12 border-4 border-indigo-600/20 border-b-indigo-600 rounded-full"></div>
                    <p className="text-slate-500 font-medium">Loading school directories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800">School Directory</h1>
                    <p className="text-slate-500 text-sm mt-1">View comprehensive information, contact details, and locations for all school branches.</p>
                </div>
                <button
                    onClick={() => navigate('/superadmin/add-school')}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    ➕ Create School Branch
                </button>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Search Institutions</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by school name, branch code, city, principal..."
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
            </div>
            {/* Tabular Header (Visible only on Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/75 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <div className="col-span-1">Code</div>
                <div className="col-span-3">Institution Name</div>
                <div className="col-span-1 text-center">Board</div>
                <div className="col-span-3">Primary Email / Phone</div>
                <div className="col-span-1 text-center">Plan Details</div>
                <div className="col-span-1 text-center">License Expiry</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Horizontal Schools Row-by-Row List */}
            <div className="space-y-3">
                {filteredSchools.map((school) => {
                    const activePlan = (school.subscription_plan || 'basic').toLowerCase();
                    const planColors = {
                        premium: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                        standard: 'bg-blue-50 text-blue-700 border border-blue-100',
                        basic: 'bg-teal-50 text-teal-700 border border-teal-100',
                        free: 'bg-slate-50 text-slate-600 border border-slate-200'
                    };

                    return (
                        <div key={school.id}>
                            {/* Desktop Tabular Row */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-white hover:bg-slate-50/30 items-center rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                                {/* 1. Code */}
                                <div className="col-span-1 font-bold text-slate-700 text-sm">
                                    {school.code}
                                </div>

                                {/* 2. Institution Name with Logo */}
                                <div className="col-span-3 flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                                        {school.logo ? (
                                            <img 
                                                src={`${API_URL}${school.logo}`} 
                                                alt="School Logo" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    if (!e.target.src.startsWith('http')) {
                                                        e.target.src = school.logo; 
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-lg">🏫</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">{school.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                            {school.city || school.state 
                                                ? `${school.city || ''}${school.city && school.state ? ', ' : ''}${school.state || ''}`
                                                : 'Location Unspecified'}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Board */}
                                <div className="col-span-1 text-center text-sm font-semibold text-slate-600">
                                    {school.board || 'N/A'}
                                </div>

                                {/* 4. Primary Email / Phone */}
                                <div className="col-span-3 min-w-0 text-xs text-slate-600">
                                    <p className="font-semibold text-slate-700 truncate">{school.email}</p>
                                    <p className="text-slate-400 mt-0.5 truncate">{school.phone || 'No Phone'}</p>
                                </div>

                                {/* 5. Plan Details */}
                                <div className="col-span-1 text-center">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${planColors[activePlan] || 'bg-slate-50 text-slate-600'}`}>
                                        {school.subscription_plan}
                                    </span>
                                </div>

                                {/* 6. License Expiry */}
                                <div className="col-span-1 text-center text-xs text-slate-600 font-medium">
                                    {school.subscription_end ? (
                                        new Date(school.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                    ) : (
                                        <span className="text-slate-500 font-medium">Lifetime License</span>
                                    )}
                                </div>

                                {/* 7. Status */}
                                <div className="col-span-1 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        school.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {school.status}
                                    </span>
                                </div>

                                {/* 8. Actions */}
                                <div className="col-span-1 flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenView(school)}
                                        title="View Details"
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        👁️
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/superadmin/add-school?id=${school.id}`)}
                                        title="Edit School"
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Grid Card (Only on Mobile/Tablet) */}
                            <div className="md:hidden p-5 space-y-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Code: {school.code}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        school.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {school.status}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                                        {school.logo ? (
                                            <img 
                                                src={`${API_URL}${school.logo}`} 
                                                alt="School Logo" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    if (!e.target.src.startsWith('http')) {
                                                        e.target.src = school.logo; 
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xl">🏫</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-800 leading-snug break-words">{school.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {school.city || school.state 
                                                ? `${school.city || ''}${school.city && school.state ? ', ' : ''}${school.state || ''}`
                                                : 'Location Unspecified'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                                    <div className="space-y-1">
                                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Affiliation Board</span>
                                        <p className="font-semibold text-slate-700">{school.board || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Plan Tier</span>
                                        <div>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${planColors[activePlan] || 'bg-slate-50 text-slate-600'}`}>
                                                {school.subscription_plan}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Contact Info</span>
                                        <p className="font-medium text-slate-700 break-all">{school.email}</p>
                                        <p className="text-slate-400">{school.phone || 'No Phone'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">License Expiry</span>
                                        <p className="font-semibold text-slate-700">
                                            {school.subscription_end ? (
                                                new Date(school.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            ) : (
                                                'Lifetime License'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                                    <button 
                                        onClick={() => handleOpenView(school)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                    >
                                        View Details 👁️
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/superadmin/add-school?id=${school.id}`)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold border border-indigo-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        Edit Branch ✏️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredSchools.length === 0 && (
                    <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-4xl">🏫</span>
                        <p className="mt-4 text-slate-500 font-medium">No school branches match your current search.</p>
                    </div>
                )}
            </div>

            {/* View Full Details Modal */}
            {viewModalOpen && selectedSchool && (
                <Modal
                    isOpen={viewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                    title="Institution Details Report"
                >
                    <div className="space-y-5 text-sm">
                        {/* Header identity */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0">
                                    {selectedSchool.logo ? (
                                        <img 
                                            src={`${API_URL}${selectedSchool.logo}`} 
                                            alt="School Logo" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                if (!e.target.src.startsWith('http')) {
                                                    e.target.src = selectedSchool.logo; 
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xl">🏫</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 leading-tight">{selectedSchool.name}</h3>
                                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">Identification Code: {selectedSchool.code}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border self-start sm:self-center ${
                                selectedSchool.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {selectedSchool.status}
                            </span>
                        </div>

                        {/* Detailed information segments */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Affiliation Board</p>
                                <p className="text-slate-700 font-medium">{selectedSchool.board || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Principal / Head</p>
                                <p className="text-slate-700 font-medium">{selectedSchool.principal_name || 'Not Provided'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                            <div className="space-y-1">
                                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Fee Collection Cycle</p>
                                <p className="text-indigo-900 font-bold text-xs uppercase">
                                    {selectedSchool.fee_collection_cycle === 'yearly' ? '🗓️ Yearly (Annual)' : '📅 Monthly (12 Mo)'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Teachers</p>
                                <p className="text-slate-800 font-bold text-sm">👨‍🏫 {selectedSchool.teacher_count || 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Students</p>
                                <p className="text-slate-800 font-bold text-sm">🎓 {selectedSchool.student_count || 0}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contact Email</p>
                                <p className="text-slate-700 font-medium break-all">{selectedSchool.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contact Phone</p>
                                <p className="text-slate-700 font-medium">{selectedSchool.phone || 'Not Provided'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Established Year</p>
                                <p className="text-slate-700 font-medium">{selectedSchool.established_year || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Website Address</p>
                                {selectedSchool.website ? (
                                    <a 
                                        href={selectedSchool.website.startsWith('http') ? selectedSchool.website : `https://${selectedSchool.website}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline font-medium break-all flex items-center gap-1"
                                    >
                                        {selectedSchool.website} 🔗
                                    </a>
                                ) : (
                                    <p className="text-slate-700 font-medium">None</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Physical Address</p>
                            <p className="text-slate-700 font-medium leading-relaxed">
                                {selectedSchool.address ? `${selectedSchool.address}, ` : ''}
                                {selectedSchool.city || ''}
                                {selectedSchool.state ? `, ${selectedSchool.state}` : ''}
                                {selectedSchool.pincode ? ` - ${selectedSchool.pincode}` : ''}
                            </p>
                        </div>

                        {/* Subscription summary */}
                        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Subscription provisioning</p>
                                <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{selectedSchool.subscription_plan} Tier</p>
                            </div>
                            <p className="text-xs font-semibold text-indigo-700">
                                {selectedSchool.subscription_end ? `Expires: ${new Date(selectedSchool.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Lifetime Access'}
                            </p>
                        </div>

                        {/* Footer action */}
                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ViewSchools;
