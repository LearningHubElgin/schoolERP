import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';

const StatCard = ({ title, value, icon, color, borderColor, isLoading }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-cyan-500': '#06b6d4',
        'border-indigo-500': '#6366f1',
        'border-emerald-500': '#10b981',
        'border-purple-500': '#a855f7',
        'border-orange-500': '#f97316',
        'border-red-500': '#ef4444',
        'border-pink-500': '#ec4899',
    };

    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 cursor-default group h-full border-l-4 ${borderColor} ${isLoading ? 'animate-pulse' : ''}`}
            style={{ borderLeftColor: borderColors[borderColor] }}
        >
            <div className="flex items-center justify-between h-full gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-tight mb-1">{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
                    ) : (
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 whitespace-nowrap">{value}</p>
                    )}
                </div>
                <div className={`w-8 h-8 md:w-10 h-10 rounded-xl flex items-center justify-center text-lg md:text-xl ${color} flex-shrink-0 ${isLoading ? 'opacity-50' : ''}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const AdminAdmissionReport = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filter states
    const [filterType, setFilterType] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'yearly'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Get start of week (Sunday)
    const getStartOfWeek = (dateString) => {
        const d = new Date(dateString);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const start = new Date(d.setDate(diff));
        start.setHours(0,0,0,0);
        return start;
    };

    // Helper: Get end of week (Saturday)
    const getEndOfWeek = (dateString) => {
        const start = getStartOfWeek(dateString);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        return end;
    };

    const filteredStudents = students.filter(student => {
        const admissionDateStr = student.admission_date || student.created_at;
        if (!admissionDateStr) return false;
        
        const admissionDate = new Date(admissionDateStr);
        
        let dateMatch = true;
        if (filterType === 'daily') {
            const targetDate = new Date(selectedDate);
            dateMatch = admissionDate.getFullYear() === targetDate.getFullYear() &&
                   admissionDate.getMonth() === targetDate.getMonth() &&
                   admissionDate.getDate() === targetDate.getDate();
        } else if (filterType === 'weekly') {
            const start = getStartOfWeek(selectedDate);
            const end = getEndOfWeek(selectedDate);
            dateMatch = admissionDate >= start && admissionDate <= end;
        } else if (filterType === 'monthly') {
            const [year, month] = selectedMonth.split('-');
            dateMatch = admissionDate.getFullYear() === parseInt(year) &&
                   admissionDate.getMonth() === parseInt(month) - 1;
        } else if (filterType === 'yearly') {
            dateMatch = admissionDate.getFullYear() === parseInt(selectedYear);
        }

        const query = searchQuery.toLowerCase();
        const searchMatch = (student.name || '').toLowerCase().includes(query) ||
                            (student.student_unique_id || '').toLowerCase().includes(query) ||
                            (student.roll_no || '').toLowerCase().includes(query);

        return dateMatch && searchMatch;
    }).sort((a, b) => {
        const dateA = new Date(a.admission_date || a.created_at);
        const dateB = new Date(b.admission_date || b.created_at);
        return dateB - dateA; // Newest first
    });

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const getWeekDisplayRange = () => {
        const start = getStartOfWeek(selectedDate);
        const end = getEndOfWeek(selectedDate);
        return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterType('monthly');
        setSelectedMonth(new Date().toISOString().slice(0, 7));
    };

    const columns = [
        { header: 'Student ID', accessor: 'student_unique_id' },
        { header: 'Name', accessor: 'name' },
        {
            header: 'Class/Sec',
            accessor: 'class',
            render: (row) => `${row.class}-${row.section}`
        },
        { header: 'Gender', accessor: 'gender' },
        {
            header: 'Joining Date',
            accessor: 'admission_date',
            render: (row) => formatDisplayDate(row.admission_date || row.created_at)
        }
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">🎓 Student Joining Report</h1>
                    <p className="mt-1 text-emerald-100 text-xs md:text-sm">
                        Track when students joined or were added to the portal
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-emerald-500 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Selected Joinings"
                    value={filteredStudents.length}
                    icon="🎓"
                    color="bg-emerald-100 text-emerald-600"
                    borderColor="border-emerald-500"
                    isLoading={loading}
                />
                <StatCard
                    title="Total Boys"
                    value={filteredStudents.filter(s => s.gender === 'Male').length}
                    icon="👦"
                    color="bg-blue-100 text-blue-600"
                    borderColor="border-blue-500"
                    isLoading={loading}
                />
                <StatCard
                    title="Total Girls"
                    value={filteredStudents.filter(s => s.gender === 'Female').length}
                    icon="👧"
                    color="bg-pink-100 text-pink-600"
                    borderColor="border-pink-500"
                    isLoading={loading}
                />
                <StatCard
                    title="Total Other"
                    value={filteredStudents.filter(s => s.gender && s.gender !== 'Male' && s.gender !== 'Female').length}
                    icon="🧑"
                    color="bg-purple-100 text-purple-600"
                    borderColor="border-purple-500"
                    isLoading={loading}
                />
            </div>

            <Card variant="elevated">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Student Joining Records</h3>
                        <p className="text-sm text-slate-500 mt-1">Showing {filteredStudents.length} students</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-6 mt-4">
                    <div className="w-full">
                        <Input
                            placeholder="🔍 Search by name or student ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:max-w-md"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700 hover:border-indigo-300 transition-colors cursor-pointer"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="daily">Today</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        {filterType === 'daily' && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700 hover:border-indigo-300 transition-colors cursor-pointer"
                            />
                        )}
                        
                        {filterType === 'weekly' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700 hover:border-indigo-300 transition-colors cursor-pointer"
                                />
                                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                    {getWeekDisplayRange()}
                                </span>
                            </div>
                        )}

                        {filterType === 'monthly' && (
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700 hover:border-indigo-300 transition-colors cursor-pointer"
                            />
                        )}

                        {filterType === 'yearly' && (
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700 hover:border-indigo-300 transition-colors cursor-pointer"
                            >
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        )}

                        {(searchQuery || filterType !== 'monthly') && (
                            <Button size="md" variant="secondary" onClick={handleClearFilters}>
                                ❌ Clear
                            </Button>
                        )}
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredStudents}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default AdminAdmissionReport;
