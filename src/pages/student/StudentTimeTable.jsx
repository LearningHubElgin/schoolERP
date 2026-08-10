import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentTimeTable = () => {
    const [timetable, setTimetable] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classInfo, setClassInfo] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDownloading, setIsDownloading] = useState(false);

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

    // Helper function to format time to AM/PM same as admin
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/student/timetable`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setTimetable(response.data.timetable);
                setTimeSlots(response.data.timeSlots || []);
                setClassInfo(response.data.studentClass); // Note: backend returns studentClass
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const element = document.getElementById('timetable-capture');
        if (!element) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                onclone: (document) => {
                    const el = document.getElementById('timetable-capture');
                    if (el) {
                        el.style.width = '1200px';
                        el.style.padding = '20px';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 20;

            // Add Header
            pdf.setFontSize(18);
            pdf.setTextColor(40, 40, 40);
            pdf.text('Class Timetable', pdfWidth / 2, 10, { align: 'center' });

            if (classInfo) {
                pdf.setFontSize(12);
                pdf.setTextColor(100, 100, 100);
                const classLabel = `Class: ${classInfo.class}${classInfo.stream_name ? ` | Group: ${classInfo.stream_name}` : ''} | Section: ${classInfo.section}`;
                pdf.text(classLabel, pdfWidth / 2, 16, { align: 'center' });
            }

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Timetable-Class-${classInfo?.class || 'Student'}-${classInfo?.section || ''}.pdf`);
        } catch (error) {
            console.error('Error downloading timetable:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const getTimetableEntry = (day, timeSlot) => {
        return timetable.find(
            entry => entry.day_of_week?.toUpperCase() === day.toUpperCase() && entry.time_slot_id === timeSlot.id
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading timetable...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-3 md:pt-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Class Time Table</h1>
                    {classInfo && (
                        <div className="flex items-center gap-2 mt-2 text-sm flex-wrap">
                            <span className="font-semibold text-slate-700 text-lg">
                                Class {classInfo.class}
                            </span>
                            {classInfo.stream_name && (
                                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                                    📚 {classInfo.stream_name}
                                </span>
                            )}
                            <span className="font-semibold text-slate-700 text-lg">
                                Section {classInfo.section}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
                >
                    {isDownloading ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Download Timetable</span>
                        </>
                    )}
                </button>
            </div>

            <div id="timetable-capture">
                <Card allowOverflow={true} className="p-0 border border-slate-200 shadow-sm">
                    <div className="rounded-lg border border-slate-200 overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-220px)]">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-200">
                                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700 text-sm w-32 sticky top-0 left-0 bg-white z-20">
                                        TIME / DAY
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 text-sm min-w-[140px] bg-white sticky top-0 z-10">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {timeSlots.length > 0 ? (
                                    timeSlots
                                        .filter(slot => slot.is_break || timetable.some(entry => entry.time_slot_id === slot.id))
                                        .map((slot, index) => (
                                        <tr key={slot.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                            <td className="border border-slate-200 px-2 py-3 align-top text-xs md:text-sm text-slate-700 text-center bg-slate-50 font-medium sticky left-0 z-10">
                                                {slot.is_break ? (
                                                    <span className="text-orange-600 font-bold">BREAK</span>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 min-w-[85px] text-slate-700">
                                                        <div className="flex items-center justify-center gap-1 font-bold text-[10px] whitespace-nowrap leading-none"><span>{formatTime(slot.start_time)}</span>
                                                        <span className="text-slate-400">-</span>
<span>{formatTime(slot.end_time)}</span></div>
                                                    </div>
                                                )}
                                            </td>

                                            {slot.is_break ? (
                                                <td colSpan={days.length} className="border border-slate-200 bg-orange-50 text-center text-orange-700 font-semibold text-sm py-4">
                                                    {slot.slot_name}
                                                </td>
                                            ) : (
                                                days.map(day => {
                                                    const entry = getTimetableEntry(day, slot);
                                                    return (
                                                        <td
                                                            key={`${day}-${slot.id}`}
                                                            className="border border-slate-200 px-3 py-4 transition-all hover:bg-slate-50 align-top"
                                                            style={{ minHeight: '90px', verticalAlign: 'top' }}
                                                        >
                                                            {entry ? (
                                                                <div className={`space-y-1.5 flex flex-col items-start rounded-lg px-2 py-1.5 ${entry.is_elective ? 'bg-violet-50 border border-violet-200' : ''}`}>
                                                                    <div className={`font-semibold text-sm text-left ${entry.is_elective ? 'text-violet-800' : 'text-slate-900'}`}>
                                                                        {entry.subject_name}
                                                                    </div>

                                                                    {entry.is_elective ? (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded">
                                                                            🎯 Elective
                                                                        </span>
                                                                    ) : null}

                                                                    {entry.teacher_name && (
                                                                        <div className={`text-xs flex items-center gap-1 ${entry.is_elective ? 'text-violet-500' : 'text-slate-500'}`}>
                                                                            <span>👤</span> {entry.teacher_name}
                                                                        </div>
                                                                    )}
                                                                    {entry.room_number && (
                                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                            <span>📍</span> {entry.room_number || 'N/A'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center text-slate-300 text-xl py-2">
                                                                    -
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={days.length + 1} className="border border-slate-200 px-4 py-12 text-center">
                                            <div className="text-slate-400">
                                                <p className="text-lg font-medium mb-2">No time slots configured</p>
                                                <p className="text-sm">Please ask admin to configure time slots.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentTimeTable;
