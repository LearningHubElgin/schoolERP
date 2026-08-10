import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TeacherTimeTable = () => {
    const [timetable, setTimetable] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

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
            const response = await axios.get(`${API_URL}/api/teacher/timetable`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setTimetable(response.data.timetable);
                setTimeSlots(response.data.timeSlots);
                setTeacherInfo(response.data.teacher);
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
                        el.style.width = '1200px'; // Force width for better resolution
                        el.style.padding = '20px';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4
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
            pdf.text('Teacher Timetable', pdfWidth / 2, 10, { align: 'center' });

            if (teacherInfo) {
                pdf.setFontSize(12);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Teacher: ${teacherInfo.name}`, pdfWidth / 2, 16, { align: 'center' });
            }

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Timetable-${teacherInfo?.name || 'Teacher'}.pdf`);
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

    const getTimetableEntries = (day, timeSlot) => {
        return timetable.filter(
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
        <div className="space-y-4 pb-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-4 sm:p-6 text-white shadow-lg sm:shadow-xl">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                            Teacher Timetable 🗓️
                        </h1>
                        {teacherInfo && (
                            <p className="text-indigo-100 text-xs sm:text-sm mt-0.5">
                                <span className="font-semibold text-white">{teacherInfo.name}</span> • <span className="bg-white/20 px-2 py-0.5 rounded-md text-[11px] font-bold">{timetable.length} classes assigned</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`px-3.5 py-2 bg-white text-indigo-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-opacity-95 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
                    >
                        {isDownloading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
                                <span>Saving PDF...</span>
                            </>
                        ) : (
                            <>
                                <span>📥 Download Timetable</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
            </div>

            <div id="timetable-capture">
                <Card allowOverflow={true} className="p-0 border border-slate-200 shadow-xs rounded-xl overflow-hidden">
                    <div className="rounded-xl border border-slate-200 overflow-x-auto relative visible-scrollbar">
                        <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200">
                                    <th className="border-b border-r-2 border-slate-200 px-3 py-2 text-left font-bold text-slate-700 text-xs w-28 sticky top-0 left-0 bg-slate-100 z-30 shadow-xs">
                                        TIME / DAY
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="border-b border-r border-slate-200 px-3 py-2 text-center font-bold text-slate-700 text-xs min-w-[120px] bg-slate-100 sticky top-0 z-10">
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
                                            <tr key={slot.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                                <td className="border-b border-r-2 border-slate-200 px-2.5 py-2 text-xs text-slate-700 text-center bg-slate-50 font-medium sticky left-0 z-20 shadow-xs">
                                                    {slot.is_break ? (
                                                        <span className="text-amber-600 font-bold text-xs">BREAK</span>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-0.5 min-w-[75px]">
                                                            <span className="whitespace-nowrap font-bold text-[11px]">{formatTime(slot.start_time)}</span>
                                                            <span className="text-slate-400 font-bold text-[9px]">-</span>
                                                            <span className="whitespace-nowrap font-bold text-[11px]">{formatTime(slot.end_time)}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {slot.is_break ? (
                                                    <td colSpan={days.length} className="border-b border-slate-200 bg-amber-50/60 text-center text-amber-700 font-semibold text-xs py-2">
                                                        {slot.slot_name}
                                                    </td>
                                                ) : (
                                                    days.map(day => {
                                                        const entries = getTimetableEntries(day, slot);
                                                        const entry = entries[0];

                                                        const mergedGroupId = entry?.merge_group_id;
                                                        const mergedEntries = mergedGroupId ? entries.filter(e => e.merge_group_id === mergedGroupId) : [];
                                                        const isMergedEntry = mergedEntries.length > 1;

                                                        return (
                                                            <td
                                                                key={`${day}-${slot.id}`}
                                                                className="border border-slate-200/80 px-2 py-2 transition-all hover:bg-indigo-50/30"
                                                                style={{ minHeight: '60px', verticalAlign: 'top' }}
                                                            >
                                                                {entry ? (
                                                                    <div className="space-y-1 flex flex-col items-start">
                                                                        <div className={`font-bold text-xs text-left ${isMergedEntry ? 'text-amber-800' : entry.is_elective ? 'text-violet-800' : 'text-slate-800'}`}>
                                                                            {entry.subject_name}
                                                                        </div>

                                                                        {/* Badges container */}
                                                                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                                                            {isMergedEntry ? (
                                                                                <>
                                                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold whitespace-nowrap">
                                                                                        🔗 Merged
                                                                                    </span>
                                                                                    {mergedEntries.map((me, idx) => (
                                                                                        <span key={idx} className="inline-flex items-center justify-center px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold whitespace-nowrap">
                                                                                            {me.class_number}-{me.section}
                                                                                        </span>
                                                                                    ))}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span
                                                                                        className="inline-flex items-center justify-center px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold whitespace-nowrap"
                                                                                    >
                                                                                        {entry.class_number}-{entry.section}
                                                                                    </span>
                                                                                    {entry.is_elective ? (
                                                                                        <span
                                                                                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold whitespace-nowrap"
                                                                                        >
                                                                                            🎯 Elective
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {entry.room_number && (
                                                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5 mt-0.5">
                                                                                <span>📍</span> {entry.room_number || 'N/A'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center text-slate-300 text-sm py-1">
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
                                        <td colSpan={days.length + 1} className="border border-slate-200 px-4 py-8 text-center">
                                            <div className="text-slate-400">
                                                <p className="text-sm font-semibold mb-1">No time slots configured</p>
                                                <p className="text-xs">Please ask admin to configure time slots.</p>
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

export default TeacherTimeTable;