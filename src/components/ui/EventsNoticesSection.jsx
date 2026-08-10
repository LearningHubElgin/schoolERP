import React, { useState, useEffect } from 'react';
import Card from './Card';
import Badge from './Badge';
import { API_URL } from '../../productionLink/productionLink';

const EventsNoticesSection = ({ role = 'admin' }) => {
    const [events, setEvents] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventsAndNotices();
    }, []);

    const fetchEventsAndNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/common/events-notices`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setEvents(data.events || []);
                setNotices(data.notices || []);
            }
        } catch (error) {
            console.error('Error fetching events and notices:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="animate-pulse bg-gray-100 rounded-xl h-48"></div>
                <div className="animate-pulse bg-gray-100 rounded-xl h-48"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Upcoming Events Section */}
            <div className="space-y-2 sm:space-y-3">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-base sm:text-xl">🎉</span> Upcoming Events
                </h2>
                <Card variant="elevated" className="h-fit">
                    {events && events.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                            {events.map((event, index) => (
                                <div
                                    key={event.id || index}
                                    className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all"
                                >
                                    <div className="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
                                        <span className="text-[10px] sm:text-xs font-medium opacity-90">
                                            {event.date?.split(' ')[1] || ''}
                                        </span>
                                        <span className="text-sm sm:text-lg font-bold leading-tight">
                                            {event.date?.split(' ')[0] || ''}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 truncate">{event.title}</h3>
                                            <Badge
                                                variant={event.priority === 'High' ? 'destructive' : event.priority === 'Medium' ? 'warning' : 'default'}
                                                className="flex-shrink-0 text-[10px] sm:text-xs px-1.5 py-0.5"
                                            >
                                                {event.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2">{event.description}</p>
                                        {event.location && (
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <span>📍</span> {event.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 sm:py-6 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                            <span className="text-2xl sm:text-3xl mb-1 block">📅</span>
                            <p className="text-xs sm:text-sm text-slate-500">No upcoming events at the moment.</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Notices Section */}
            <div className="space-y-2 sm:space-y-3">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-base sm:text-xl">📌</span> Notices
                </h2>
                <Card variant="elevated" className="h-fit">
                    {notices && notices.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                            {notices.map((notice, index) => (
                                <div
                                    key={notice.id || index}
                                    className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-xs sm:text-sm text-gray-800 truncate flex-1">{notice.title}</h3>
                                        <Badge
                                            variant={notice.priority === 'High' ? 'destructive' : notice.priority === 'Medium' ? 'warning' : 'default'}
                                            className="flex-shrink-0 text-[10px] sm:text-xs px-1.5 py-0.5"
                                        >
                                            {notice.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{notice.description}</p>
                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-gray-500">
                                        <span>📆</span>
                                        <span>{notice.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 sm:py-6 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                            <span className="text-2xl sm:text-3xl mb-1 block">📋</span>
                            <p className="text-xs sm:text-sm text-slate-500">No notices available.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default EventsNoticesSection;
