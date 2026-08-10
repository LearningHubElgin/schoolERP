import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const StudentHolidays = () => {
    const [holidays, setHolidays] = useState([]);

    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeView, setActiveView] = useState('calendar'); // 'calendar' or 'list'
    const [filterType, setFilterType] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming'); // 'upcoming' or 'past'


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [holidayRes] = await Promise.all([
                fetch(`${API_BASE}/api/student/holidays`, { headers })
            ]);

            const holidayData = await holidayRes.json();

            if (holidayData.success) setHolidays(holidayData.holidays);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getHolidaysForDate = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        return holidays.filter(h => {
            const hStart = new Date(h.start_date);
            const hEnd = h.end_date ? new Date(h.end_date) : hStart;

            const checkDate = new Date(year, month, day);
            const start = new Date(hStart.getFullYear(), hStart.getMonth(), hStart.getDate());
            const end = new Date(hEnd.getFullYear(), hEnd.getMonth(), hEnd.getDate());

            return checkDate >= start && checkDate <= end;
        });
    };



    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 md:h-24 bg-gray-50/50"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayHolidays = getHolidaysForDate(day);
            const isHoliday = dayHolidays.length > 0;
            const isSelected = selectedDate === day;
            const isCurrentDay = isToday(day);

            days.push(
                <div
                    key={day}
                    onClick={() => { setSelectedDate(day); }}
                    className={`
                        relative h-14 md:h-28 border border-gray-100 p-1 md:p-2 transition-all cursor-pointer
                        ${isCurrentDay ? 'bg-blue-50/50' : 'bg-white'}
                        ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
                        hover:bg-gray-50
                    `}
                >
                    <div className={`
                        text-xs md:text-sm font-medium w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full mb-1
                        ${isCurrentDay ? 'bg-blue-600 text-white' : 'text-gray-700'}
                        ${isHoliday ? 'text-red-600 font-bold' : ''}
                    `}>
                        {day}
                    </div>

                    {/* Desktop View: Show Holiday & Announcement titles */}
                    <div className="hidden md:flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                        {dayHolidays.map((h, idx) => (
                            <div key={`h-${idx}`} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${h.type === 'National' ? 'bg-red-100 text-red-700' :
                                h.type === 'Religious' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                {h.title}
                            </div>
                        ))}
                    </div>

                    {/* Mobile View: Indicator Dots */}
                    <div className="md:hidden flex justify-center gap-0.5 mt-1">
                        {dayHolidays.slice(0, 2).map((h, idx) => (
                            <div key={`hd-${idx}`} className={`w-1.5 h-1.5 rounded-full ${h.type === 'National' ? 'bg-red-500' :
                                h.type === 'Religious' ? 'bg-purple-500' :
                                    'bg-green-500'
                                }`} />
                        ))}

                    </div>
                </div>
            );
        }

        return days;
    };

    const selectedDayHolidays = selectedDate ? getHolidaysForDate(selectedDate) : [];


    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'National': return 'destructive';
            case 'Religious': return 'warning';
            case 'School': return 'success';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'National': return 'from-red-500 to-rose-600';
            case 'Religious': return 'from-purple-500 to-indigo-600';
            case 'School': return 'from-emerald-500 to-teal-600';
            default: return 'from-gray-500 to-slate-600';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'National': return '🏛️';
            case 'Religious': return '🕌';
            case 'School': return '🏫';
            default: return '📅';
        }
    };

    const filteredHolidays = filterType === 'all' ? holidays : holidays.filter(h => h.type === filterType);

    const now = new Date();
    // Reset time to start of day for accurate full-day comparison
    now.setHours(0, 0, 0, 0);

    const timeFilteredHolidays = filterType === 'all'
        ? filteredHolidays.filter(h => {
            const hEnd = h.end_date ? new Date(h.end_date) : new Date(h.start_date);
            hEnd.setHours(0, 0, 0, 0);
            return timeFilter === 'upcoming' ? hEnd >= now : hEnd < now;
        })
        : filteredHolidays;



    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight">🎄 Holiday Calendar</h1>
                    <p className="mt-3 text-emerald-100 text-lg max-w-2xl">
                        View upcoming school holidays and plan your schedule.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/10 rounded-full -mb-32"></div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                <button onClick={() => setActiveView('calendar')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${activeView === 'calendar' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                    📅 Calendar
                </button>
                <button onClick={() => setActiveView('list')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${activeView === 'list' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                    📋 List View
                </button>
            </div>



            {/* ==================== CALENDAR VIEW ==================== */}
            {activeView === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition">◀</button>
                            <span className="text-lg font-bold text-gray-800">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition">▶</button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className={`py-3 text-center text-xs font-semibold uppercase tracking-wider
                                    ${day === 'Sun' ? 'text-red-500' : day === 'Sat' ? 'text-blue-500' : 'text-gray-500'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        {/* Days Grid */}
                        <div className="grid grid-cols-7 border-l border-t border-gray-100">
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-6">

                        {/* Legend */}
                        <Card className="bg-white">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">Legend</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div> National</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div> Religious</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div> School</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div> Other</div>

                            </div>
                        </Card>

                        {/* Selected Day Details */}
                        {selectedDate && (
                            <Card variant="elevated" className="border-l-4 border-l-blue-500">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    {selectedDate} {currentDate.toLocaleString('default', { month: 'long' })}
                                </h3>
                                {(selectedDayHolidays.length > 0) ? (
                                    <div className="space-y-3">
                                        {selectedDayHolidays.map((h, i) => (
                                            <div key={`sh-${i}`} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-800">{getTypeIcon(h.type)} {h.title}</h4>
                                                    <Badge variant={getTypeBadge(h.type)}>{h.type}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">{h.description}</p>
                                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">No holidays for this date.</p>
                                )}
                            </Card>
                        )}

                        {/* Upcoming Holidays */}
                        <Card>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                🎉 Upcoming Holidays
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {holidays
                                    .filter(h => new Date(h.start_date) >= new Date())
                                    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                                    .slice(0, 5)
                                    .map((h, i) => (
                                        <div key={i} className="flex gap-4 items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center text-blue-600 border border-blue-100 group-hover:border-blue-200 group-hover:bg-blue-100 transition-colors">
                                                <span className="text-xs font-bold uppercase">{new Date(h.start_date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-bold leading-none">{new Date(h.start_date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{h.title}</h4>
                                                <p className="text-xs text-gray-500">{new Date(h.start_date).toLocaleDateString(undefined, { weekday: 'long' })} • {h.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                {holidays.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No upcoming holidays.</p>}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ==================== LIST VIEW ==================== */}
            {activeView === 'list' && (
                <div className="space-y-4">
                    {/* Type Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: 'All', key: 'all', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                            { label: 'National', key: 'National', color: 'bg-red-50 text-red-700 border-red-200' },
                            { label: 'Religious', key: 'Religious', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                            { label: 'School', key: 'School', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                            { label: 'Other', key: 'Other', color: 'bg-gray-50 text-gray-700 border-gray-200' },
                        ].map(stat => (
                            <button key={stat.key} onClick={() => setFilterType(stat.key)}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${filterType === stat.key ? stat.color + ' shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                <p className="text-xl font-bold">{stat.key === 'all' ? holidays.length : holidays.filter(h => h.type === stat.key).length}</p>
                                <p className="text-xs font-medium">{stat.label}</p>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {filterType === 'all' ? 'All Holidays' : `${filterType} Holidays`}
                            <span className="text-gray-400 font-normal ml-2">({timeFilteredHolidays.length})</span>
                        </h2>

                        {filterType === 'all' && (
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setTimeFilter('upcoming')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'upcoming' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setTimeFilter('past')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'past' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Past
                                </button>
                            </div>
                        )}
                    </div>

                    {timeFilteredHolidays.length === 0 ? (
                        <Card variant="elevated">
                            <div className="text-center py-12">
                                <span className="text-5xl mb-4 block">🎄</span>
                                <p className="text-gray-500">No {filterType === 'all' ? timeFilter : ''} holidays found.</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timeFilteredHolidays.map((holiday) => (
                                <Card key={holiday.id} variant="elevated" className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                                    <div className={`h-1.5 bg-gradient-to-r ${getTypeColor(holiday.type)} -mx-6 -mt-6 mb-4`}></div>
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getTypeIcon(holiday.type)}</span>
                                                <h3 className="font-semibold text-gray-800 text-lg">{holiday.title}</h3>
                                            </div>
                                            <Badge variant={getTypeBadge(holiday.type)}>{holiday.type}</Badge>
                                        </div>
                                        {holiday.description && <p className="text-gray-600 text-sm line-clamp-2">{holiday.description}</p>}
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p className="flex items-center gap-2">
                                                <span>📅</span> {formatDate(holiday.start_date)}
                                                {holiday.end_date && <span> → {formatDate(holiday.end_date)}</span>}
                                            </p>
                                            {holiday.end_date && (() => {
                                                const days = Math.ceil((new Date(holiday.end_date) - new Date(holiday.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                                                return <p className="flex items-center gap-2"><span>⏳</span> {days} day{days > 1 ? 's' : ''}</p>;
                                            })()}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}


        </div>
    );
};

export default StudentHolidays;
