import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const AdminStudentTimeTable = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [classStreams, setClassStreams] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Helper: check if a class_number is higher secondary
    const isHigherSecondaryClass = (cn) => {
        const s = String(cn);
        return s === '11' || s === '12';
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    // Get current day of week
    const getCurrentDay = () => {
        const dayIndex = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        if (dayIndex === 0) return null; // Sunday
        return days[dayIndex - 1]; // Adjust for our days array
    };

    // Check if a time slot is the current period
    const isCurrentPeriod = (slot) => {
        const now = currentTime;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Parse slot start and end times
        const [startHour, startMinute] = slot.start_time.split(':').map(Number);
        const [endHour, endMinute] = slot.end_time.split(':').map(Number);

        const slotStartInMinutes = startHour * 60 + startMinute;
        const slotEndInMinutes = endHour * 60 + endMinute;

        return currentTimeInMinutes >= slotStartInMinutes && currentTimeInMinutes < slotEndInMinutes;
    };

    // Helper function to format time to AM/PM
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Fetch initial data (classes, sections, time slots)
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch timetable when class and section are selected
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchTimetable();
        } else {
            setTimetable([]);
        }
    }, [selectedClass, selectedSection]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');

            const [classesRes, sectionsRes, timeSlotsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/admin/sections`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/admin/time-slots`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const classesData = await classesRes.json();
            const sectionsData = await sectionsRes.json();
            const timeSlotsData = await timeSlotsRes.json();

            if (classesData.success) setClasses(classesData.classes);
            if (sectionsData.success) setSections(sectionsData.sections);
            if (timeSlotsData.success) setTimeSlots(timeSlotsData.timeSlots);

        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    // Fetch streams for a class
    const fetchClassStreams = async (classNumber) => {
        try {
            const token = localStorage.getItem('token');
            const cls = classes.find(c => String(c.class_number) === String(classNumber));
            if (!cls) return;
            const res = await fetch(`${API_URL}/api/admin/class-streams/${cls.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setClassStreams(data.streams || []);
        } catch (error) {
            console.error('Error fetching streams:', error);
        }
    };

    // Fetch sections for a class (optionally filtered by stream)
    const fetchClassSections = async (classNumber, streamId) => {
        try {
            const token = localStorage.getItem('token');
            const cls = classes.find(c => String(c.class_number) === String(classNumber));
            if (!cls) { setClassSections([]); return; }
            let url = `${API_URL}/api/admin/class-sections/${cls.id}`;
            if (streamId) {
                url += `?stream_id=${streamId}`;
            }
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setClassSections(data.sections);
            } else {
                setClassSections([]);
            }
        } catch (error) {
            console.error('Error fetching class sections:', error);
            setClassSections([]);
        }
    };

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/api/admin/class/${selectedClass}/${selectedSection}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const data = await response.json();
            if (data.success) {
                setTimetable(data.timetable);
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get timetable entry for a specific day and time slot
    const getTimetableEntry = (day, slot) => {
        // Try exact match first by time_slot_id
        let entry = timetable.find(
            e => e.day_of_week === day && e.time_slot_id === slot.id
        );

        // If no match, try case-insensitive day matching with time_slot_id
        if (!entry) {
            entry = timetable.find(
                e => e.day_of_week?.toLowerCase() === day.toLowerCase() && e.time_slot_id === slot.id
            );
        }

        // If still no match, try matching by start_time (for views that include time data)
        if (!entry) {
            entry = timetable.find(
                e => e.day_of_week?.toLowerCase() === day.toLowerCase() &&
                    e.start_time === slot.start_time
            );
        }

        return entry;
    };


    // Get current class info
    const getCurrentClass = () => {
        const currentDay = getCurrentDay();
        if (!currentDay) return null;

        const currentSlot = timeSlots.find(slot => isCurrentPeriod(slot) && !slot.is_break);
        if (!currentSlot) return null;

        const currentEntry = getTimetableEntry(currentDay, currentSlot);
        return currentEntry ? {
            ...currentEntry,
            slot: currentSlot
        } : null;
    };

    const currentDay = getCurrentDay();
    const currentClass = getCurrentClass();

    // Debug: Log timetable data when it changes
    useEffect(() => {
        if (timetable.length > 0) {
            console.log('Timetable data loaded:', timetable);
            console.log('Time slots:', timeSlots);
        }
    }, [timetable, timeSlots]);

    return (
        <div className="space-y-4 md:space-y-8 pb-8 pt-3 md:pt-4">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Student Class Time Table 📅</h1>
                        <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                            View and manage weekly class schedules.
                        </p>
                    </div>
                    {/* Class & Section Selector Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                        <select
                            value={selectedClass}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedClass(val);
                                setSelectedSection('');
                                setSelectedStream('');
                                setClassStreams([]);
                                setClassSections([]);
                                if (val && isHigherSecondaryClass(val)) {
                                    fetchClassStreams(val);
                                } else if (val) {
                                    fetchClassSections(val);
                                }
                            }}
                            className="px-3 py-1.5 bg-white/90 text-slate-800 border-none rounded-lg text-xs font-semibold focus:ring-2 focus:ring-white outline-none cursor-pointer"
                        >
                            <option value="">Select Class</option>
                            {[...classes].sort((a, b) => (parseInt(a.class_number) || 0) - (parseInt(b.class_number) || 0)).map(cls => (
                                <option key={cls.id} value={cls.class_number}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                        {/* Group dropdown - visible for higher secondary */}
                        {selectedClass && isHigherSecondaryClass(selectedClass) && (
                            <select
                                value={selectedStream}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedStream(val);
                                    setSelectedSection('');
                                    if (val) {
                                        fetchClassSections(selectedClass, val);
                                    } else {
                                        setClassSections([]);
                                    }
                                }}
                                className={`px-3 py-1.5 border-none rounded-lg text-xs font-semibold focus:ring-2 focus:ring-white outline-none ${classStreams.length > 0 ? 'bg-white/90 text-slate-800 cursor-pointer' : 'bg-white/40 text-white/60 cursor-not-allowed'}`}
                                disabled={classStreams.length === 0}
                            >
                                <option value="">Select Group</option>
                                {classStreams.map(stream => (
                                    <option key={stream.id} value={stream.id}>{stream.name}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className={`px-3 py-1.5 border-none rounded-lg text-xs font-semibold focus:ring-2 focus:ring-white outline-none ${selectedClass && (!isHigherSecondaryClass(selectedClass) || selectedStream) ? 'bg-white/90 text-slate-800 cursor-pointer' : 'bg-white/40 text-white/60 cursor-not-allowed'}`}
                            disabled={!selectedClass || (isHigherSecondaryClass(selectedClass) && !selectedStream)}
                        >
                            <option value="">{!selectedClass ? 'Select Section' : (isHigherSecondaryClass(selectedClass) && !selectedStream) ? 'Select Group First' : 'Select Section'}</option>
                            {classSections.map(sec => (
                                <option key={sec.id || sec.section_id} value={sec.code || sec.section_code}>
                                    Section {sec.code || sec.section_code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Current Class Alert - Prominent Display */}
            {selectedClass && selectedSection && currentDay && (
                <>
                    {currentClass ? (
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg border border-emerald-400/30 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm shadow-inner hidden md:block">
                                        <span className="text-5xl">📚</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-emerald-600 uppercase tracking-wider shadow-sm">
                                                Active Session
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{currentClass.subject_name || 'No Subject'}</h2>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-emerald-50 font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">👨‍🏫</span>
                                                <span>{currentClass.teacher_name || 'No Teacher Assigned'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">⏰</span>
                                                <span>
                                                    {formatTime(currentClass.slot.start_time)} - {formatTime(currentClass.slot.end_time)}
                                                </span>
                                            </div>
                                            {currentClass.room_number && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">🚪</span>
                                                    <span>Room {currentClass.room_number}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 min-w-[140px]">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-white text-emerald-600 shadow-lg animate-pulse">
                                        ● LIVE NOW
                                    </span>
                                    <span className="text-emerald-100 text-sm font-medium mt-1">{currentDay}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-l-4 border-slate-300 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 rounded-full text-2xl">☕</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">No Class Right Now</h3>
                                    <p className="text-slate-500 text-sm mt-0.5">
                                        Current time: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} • {currentDay}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedClass && selectedSection ? (
                loading ? (
                    <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-center text-slate-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="animate-pulse">Loading timetable...</p>
                        </div>
                    </div>
                ) : (
                    <Card variant="elevated" allowOverflow={true} className="p-0 border border-slate-200">
                        <div className="rounded-lg border border-slate-200 overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-220px)]">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-b-2 border-slate-200">
                                        <th className="px-4 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider w-32 border-r-2 border-slate-200 bg-slate-100 sticky top-0 left-0 z-30">
                                            Time / Day
                                        </th>
                                        {days.map(day => {
                                            const isToday = day === currentDay;
                                            return (
                                                <th
                                                    key={day}
                                                    className={`px-4 py-4 text-center text-xs font-bold uppercase tracking-wider min-w-[160px] border-r border-slate-200 last:border-r-0 bg-slate-100 sticky top-0 z-20 ${isToday ? 'bg-indigo-100 text-indigo-800' : 'text-slate-700'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span>{day}</span>
                                                        {isToday && (
                                                            <span className="mt-1 px-2 py-0.5 bg-indigo-200 text-indigo-800 font-black tracking-widest text-[10px] rounded-full uppercase">
                                                                Today
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y-2 divide-slate-100">
                                    {timeSlots.length > 0 ? (
                                        timeSlots.map((slot, index) => {
                                            const isBreak = slot.is_break === 1;
                                            const isNowPeriod = isCurrentPeriod(slot);

                                            return (
                                                <tr key={slot.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${isNowPeriod ? 'ring-2 ring-indigo-500 z-10 relative shadow-md' : ''}`}>
                                                    <td className={`px-2 py-3 align-top text-xs md:text-sm font-bold text-center border-b border-slate-200 border-r-2 border-slate-200 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${isNowPeriod ? 'bg-indigo-50 text-indigo-900' : 'bg-white text-slate-700'
                                                        }`}>
                                                         {isBreak ? (
                                                             <span className="px-1.5 py-0.5 text-[9px] font-black text-amber-700 bg-amber-100 rounded border border-amber-200 leading-none">BREAK</span>
                                                         ) : (
                                                             <div className="flex flex-col items-center gap-1 min-w-[85px] text-slate-700">
                                                                <div className="flex items-center justify-center gap-1 font-bold text-[10px] whitespace-nowrap leading-none"><span>{formatTime(slot.start_time)}</span>
                                                                <span className="text-slate-400">-</span>
                                                                <span>{formatTime(slot.end_time)}</span></div>
                                                                {isNowPeriod && <div className="text-[9px] px-1.5 py-0.5 bg-indigo-100 border border-indigo-200 rounded w-max mx-auto font-black text-indigo-700 animate-pulse uppercase tracking-wider shadow-sm leading-none">● NOW</div>}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {isBreak ? (
                                                        <td colSpan={days.length} className="bg-amber-50/80 px-4 py-3 text-center border-y border-amber-200">
                                                            <div className="flex items-center justify-center gap-2 text-amber-800 font-black tracking-widest uppercase">
                                                                <span>☕</span> BREAK <span>☕</span>
                                                            </div>
                                                        </td>
                                                    ) : (
                                                        days.map(day => {
                                                            const entry = getTimetableEntry(day, slot);
                                                            const isCurrentCell = day === currentDay && isNowPeriod;

                                                            return (
                                                                <td
                                                                    key={`${day}-${slot.id}`}
                                                                    className={`px-2 py-2 text-center align-top border-b border-r border-slate-200 last:border-r-0 transition-all duration-200 ${isCurrentCell
                                                                        ? 'bg-gradient-to-br from-indigo-50 to-violet-50 ring-inset h-32'
                                                                        : 'hover:bg-slate-50 h-28'
                                                                        }`}
                                                                >
                                                                    {entry ? (
                                                                        <div className={`flex flex-col items-center justify-center gap-1.5 h-full w-full rounded-lg px-2 ${isCurrentCell ? 'bg-white shadow-md border-2 border-indigo-300 py-3' : 'bg-white border-2 border-slate-200 shadow-sm group-hover:shadow-md transition-all'
                                                                            }`}>
                                                                            {isCurrentCell && (
                                                                                <span className="text-[10px] font-black tracking-widest uppercase text-white bg-indigo-600 px-2 py-0.5 rounded-full mb-0.5 shadow-sm">
                                                                                    LIVE
                                                                                </span>
                                                                            )}
                                                                            <span className={`font-black line-clamp-2 text-center leading-tight ${isCurrentCell ? 'text-indigo-900 text-base' : 'text-slate-800 text-sm'
                                                                                }`}>
                                                                                {entry.subject_name || 'N/A'}
                                                                            </span>

                                                                            {entry.teacher_name && (
                                                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border shadow-sm text-xs ${isCurrentCell
                                                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold'
                                                                                    : 'bg-slate-50 border-slate-200 text-slate-700 font-bold'
                                                                                    }`}>
                                                                                    <span>👨‍🏫</span>
                                                                                    <span className="truncate max-w-[80px] sm:max-w-[100px]">{entry.teacher_name}</span>
                                                                                </div>
                                                                            )}

                                                                            {entry.room_number && (
                                                                                <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border font-bold ${isCurrentCell ? 'text-indigo-700 bg-indigo-50 border-indigo-200 shadow-sm' : 'text-slate-600 bg-slate-50 border-slate-200'
                                                                                    }`}>
                                                                                    🚪 Room {entry.room_number}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-slate-200 text-xl font-black">·</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })
                                                    )}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={days.length + 1} className="px-4 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-4xl opacity-50">📅</span>
                                                    <p className="font-medium text-lg">No time slots configured</p>
                                                    <p className="text-sm">Please configure time slots in the database or admin settings.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="font-semibold">Viewing:</span>
                                <span className="bg-white border border-slate-300 px-3 py-1 rounded-full font-medium shadow-sm">
                                    Class {selectedClass} - Section {selectedSection}
                                </span>
                            </div>
                            {timetable.length > 0 && (
                                <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                                    {timetable.length} periods scheduled
                                </span>
                            )}
                        </div>
                    </Card>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
                    <div className="bg-indigo-50 p-6 rounded-full mb-4">
                        <span className="text-4xl">🎓</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Select Class & Section</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                        Please choose a class and section from the toolbar above to view the detailed weekly schedule.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminStudentTimeTable;