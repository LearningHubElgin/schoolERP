import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const TakeAttendance = () => {
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [attendanceExists, setAttendanceExists] = useState(false);
    const [markedByTeacherName, setMarkedByTeacherName] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedStream, setSelectedStream] = useState('');
    const [modeLoading, setModeLoading] = useState(true);
    const [hsTimetableEntries, setHsTimetableEntries] = useState([]);

    const isHigherSecondary = (classNumber) => {
        if (!classNumber) return false;
        const name = String(classNumber).toUpperCase();
        return name.includes('XI') || name.includes('11') || name.includes('XII') || name.includes('12') || name === '11' || name === '12';
    };

    const getClassMode = () => {
        if (!selectedClass) return 'day_wise';
        const classNumber = selectedClass.split('-')[0];
        if (isHigherSecondary(classNumber)) return 'subject_wise';
        const cls = assignedClasses.find(c => `${c.class_number}-${c.section}` === selectedClass);
        if (cls && cls.attendance_mode) return cls.attendance_mode;
        return 'day_wise';
    };
    const currentClassMode = getClassMode();

    const getAvailableStreams = () => {
        if (!selectedClass) return [];
        const classNumber = selectedClass;
        if (!isHigherSecondary(classNumber)) return [];
        const unique = [];
        const seen = new Set();
        hsTimetableEntries
            .filter(e => e.class_number === classNumber && e.stream_id)
            .forEach(e => {
                if (!seen.has(e.stream_id)) {
                    seen.add(e.stream_id);
                    unique.push({ id: e.stream_id, name: e.stream_name });
                }
            });
        return unique;
    };
    const availableStreams = getAvailableStreams();

    const getAvailableSections = () => {
        if (!selectedClass || !selectedStream) return [];
        const classNumber = selectedClass.split('-')[0];
        if (!isHigherSecondary(classNumber)) return [];
        const sections = hsTimetableEntries
            .filter(e => e.class_number === classNumber && String(e.stream_id) === String(selectedStream))
            .map(e => ({ section: e.section, section_name: e.section_name }));
        const unique = [];
        const seen = new Set();
        sections.forEach(s => {
            if (!seen.has(s.section)) {
                seen.add(s.section);
                unique.push(s);
            }
        });
        return unique;
    };
    const availableSections = getAvailableSections();

    const getAvailableSubjects = () => {
        if (!selectedClass || !selectedSection || !selectedStream) return [];
        const classNumber = selectedClass.split('-')[0];
        if (!isHigherSecondary(classNumber)) return [];
        const subjs = hsTimetableEntries
            .filter(e => e.class_number === classNumber && e.section === selectedSection && String(e.stream_id) === String(selectedStream));
        const unique = [];
        const seen = new Set();
        subjs.forEach(s => {
            const key = s.subject_id || s.subject_name;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push({ id: s.subject_id, name: s.subject_name, code: s.subject_code });
            }
        });
        return unique;
    };
    const hsSubjects = getAvailableSubjects();

    const getClassOrderRank = (classStr) => {
        if (!classStr) return 999;
        const str = String(classStr).trim().toUpperCase();
        const cleanStr = str.replace(/^CLASS\s+/i, '').replace(/[-_].*$/, '').trim();

        const prePrimaryOrder = {
            'PLAYGROUP': -10, 'PG': -10,
            'NURSERY': -9, 'NUR': -9,
            'LN': -8, 'LOWER NURSERY': -8,
            'LKG': -7, 'KG': -6,
            'UN': -5, 'UPPER NURSERY': -5, 'UKG': -4
        };

        if (prePrimaryOrder[cleanStr] !== undefined) {
            return prePrimaryOrder[cleanStr];
        }

        const num = parseInt(cleanStr, 10);
        if (!isNaN(num)) {
            return num;
        }

        return 1000;
    };

    const getClassOptions = () => {
        const seen = new Set();
        const options = [];
        assignedClasses.forEach(cls => {
            if (!isHigherSecondary(cls.class_number)) {
                const key = `${cls.class_number}-${cls.section}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    options.push({
                        value: key,
                        classNumber: cls.class_number,
                        section: cls.section,
                        label: `${cls.class_name || `Class ${cls.class_number}`} - ${cls.section_name || `Section ${cls.section}`}${cls.student_count > 0 ? ` (${cls.student_count} students)` : ''}`,
                        isHS: false
                    });
                }
            }
        });
        hsTimetableEntries.forEach(entry => {
            if (!seen.has(entry.class_number)) {
                seen.add(entry.class_number);
                options.push({
                    value: entry.class_number,
                    classNumber: entry.class_number,
                    label: `Class ${entry.class_number}`,
                    isHS: true
                });
            }
        });

        return options.sort((a, b) => {
            const rankA = getClassOrderRank(a.classNumber || a.value);
            const rankB = getClassOrderRank(b.classNumber || b.value);
            if (rankA !== rankB) return rankA - rankB;
            if (a.section && b.section) return a.section.localeCompare(b.section, undefined, { numeric: true });
            return a.label.localeCompare(b.label, undefined, { numeric: true });
        });
    };
    const classOptions = getClassOptions();

    const today = new Date().toISOString().split('T')[0];
    const isPastDate = selectedDate < today;
    const isLocked = isPastDate && !editMode;

    useEffect(() => {
        fetchAttendanceMode();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            const classNumber = selectedClass.split('-')[0];
            if (isHigherSecondary(classNumber)) {
                if (selectedStream && selectedSection && selectedSubject) {
                    loadClassData(classNumber, selectedSection, selectedStream);
                } else {
                    setStudents([]);
                    setAttendance({});
                }
            } else {
                const section = selectedClass.split('-')[1];
                setSelectedStream('');
                setSelectedSection('');
                loadClassData(classNumber, section, null);
            }
        } else {
            setStudents([]);
            setAttendance({});
            setSelectedStream('');
            setSelectedSection('');
            setSelectedSubject('');
        }
        setEditMode(false);
    }, [selectedClass, selectedDate, selectedStream, selectedSection, selectedSubject]);

    const fetchAttendanceMode = async () => {
        setModeLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [modeRes, hsRes] = await Promise.all([
                axios.get(`${API_URL}/api/teacher/attendance-mode`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/teacher/hs-timetable-entries`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            if (modeRes.data.success) setAssignedClasses(modeRes.data.assignedClasses || []);
            if (hsRes.data.success) setHsTimetableEntries(hsRes.data.entries || []);
        } catch (error) {
            console.error('Error fetching attendance mode:', error);
        }
        setModeLoading(false);
    };

    const loadClassData = async (classNumber, section, streamId = null) => {
        setLoading(true);
        try {
            const studentsData = await fetchStudents(classNumber, section, streamId);
            if (studentsData && studentsData.length > 0) {
                await fetchExistingAttendance(classNumber, section, studentsData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (classNumber, section, streamId) => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/teacher/students-by-class?classNumber=${classNumber}&section=${section}`;
            if (streamId) url += `&streamId=${streamId}`;
            const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.data.success) {
                const sortedStudents = [...response.data.students].sort((a, b) => {
                    const aRoll = parseInt(a.roll_no);
                    const bRoll = parseInt(b.roll_no);
                    if (!isNaN(aRoll) && !isNaN(bRoll)) return aRoll - bRoll;
                    return String(a.roll_no).localeCompare(String(b.roll_no), undefined, { numeric: true });
                });
                setStudents(sortedStudents);
                const initialAttendance = {};
                sortedStudents.forEach(student => initialAttendance[student.id] = 'absent');
                setAttendance(initialAttendance);
                return sortedStudents;
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Failed to load students');
        }
        return null;
    };

    const fetchExistingAttendance = async (classNumber, section, currentStudents) => {
        try {
            const token = localStorage.getItem('token');
            const subjectParam = getClassMode() === 'subject_wise' ? selectedSubject : 'day_wise';
            const response = await axios.get(
                `${API_URL}/api/teacher/attendance/${selectedDate}?classNumber=${classNumber}&section=${section}&subject=${subjectParam}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.data.success && response.data.attendance.length > 0) {
                setAttendanceExists(true);
                setMarkedByTeacherName(response.data.marked_by_names || response.data.attendance[0]?.marker_teacher_name || '');
                const existingAttendance = {};
                currentStudents.forEach(s => existingAttendance[s.id] = 'absent');
                response.data.attendance.forEach(record => {
                    existingAttendance[record.student_id] = record.status;
                });
                setAttendance(existingAttendance);
            } else {
                setAttendanceExists(false);
                setMarkedByTeacherName('');
            }
        } catch (error) {
            console.error('Error fetching existing attendance:', error);
        }
    };

    const handleToggle = (studentId) => {
        setAttendance(prev => ({ ...prev, [studentId]: prev[studentId] === 'present' ? 'absent' : 'present' }));
    };

    const handleMarkAll = (status) => {
        const newAttendance = {};
        students.forEach(student => newAttendance[student.id] = status);
        setAttendance(newAttendance);
    };

    const executeSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const attendanceData = students.map(student => ({
                studentId: student.id,
                status: attendance[student.id] || 'present',
                remarks: null
            }));
            const requestData = {
                date: selectedDate,
                subject: getClassMode() === 'subject_wise' ? selectedSubject : 'day_wise',
                className: selectedClass,
                section: getClassMode() === 'subject_wise' ? selectedSection : (selectedClass.includes('-') ? selectedClass.split('-')[1] : ''),
                attendanceData
            };
            const response = await axios.post(`${API_URL}/api/teacher/attendance`, requestData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                const presentCountVal = Object.values(attendance).filter(val => val === 'present').length;
                const absentCountVal = students.length - presentCountVal;
                alert(`✅ Attendance submitted successfully!\n\nDate: ${selectedDate}\nClass: ${selectedClass}\n${getClassMode() === 'subject_wise' ? `Subject: ${selectedSubject}\n` : ''}Present: ${presentCountVal}\nAbsent: ${absentCountVal}`);
                if (getClassMode() === 'subject_wise') {
                    loadClassData(selectedClass, selectedSection, selectedStream);
                } else {
                    const [classNumber, section] = selectedClass.split('-');
                    loadClassData(classNumber, section);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to submit attendance';
            alert('❌ Error: ' + errorMessage);
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    const handleSubmit = async () => {
        if (isLocked) {
            alert('⚠️ Cannot submit attendance.\n\nPlease click the "Edit Attendance" button to unlock editing for past dates.');
            return;
        }
        if (getClassMode() === 'subject_wise' && !selectedSubject) {
            alert('Please select a subject');
            return;
        }
        if (attendanceExists) setShowConfirmModal(true);
        else await executeSubmit();
    };

    const calculateStats = () => {
        if (isLocked && !attendanceExists) return { presentCount: 0, absentCount: 0 };
        const presentCount = Object.values(attendance).filter(val => val === 'present').length;
        const absentCount = students.length - presentCount;
        return { presentCount, absentCount };
    };
    const { presentCount, absentCount } = calculateStats();

    if (modeLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading attendance configuration...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (assignedClasses.length === 0 && hsTimetableEntries.length === 0 && !loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-600 text-lg font-medium">No Classes Assigned</p>
                        <p className="text-sm text-gray-500 mt-2">Contact your admin for day-wise classes (1-10) or check if your timetable is set up for classes 11-12.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
            {/* Mode Badge */}
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${currentClassMode === 'day_wise' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {currentClassMode === 'day_wise' ? '📅 Day-wise Mode' : '📚 Subject-wise Mode'}
                </span>
                {selectedClass && <span className="text-[10px] sm:text-xs text-gray-400">{currentClassMode === 'day_wise' ? '(Admin assigned)' : '(From timetable)'}</span>}
            </div>

            {/* Filters */}
            <Card title={currentClassMode === 'subject_wise' ? 'Select Class, Group, Section, Subject and Date' : 'Select Class and Date'} variant="elevated">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
                        <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStream(''); setSelectedSection(''); setSelectedSubject(''); }} className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Class</option>
                            {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {currentClassMode === 'subject_wise' && selectedClass && (
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Group <span className="text-red-500">*</span></label>
                            <select value={selectedStream} onChange={(e) => { setSelectedStream(e.target.value); setSelectedSection(''); setSelectedSubject(''); }} className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={!selectedClass}>
                                <option value="">Select Group</option>
                                {availableStreams.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                            </select>
                        </div>
                    )}
                    {currentClassMode === 'subject_wise' && selectedClass && (
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
                            <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setSelectedSubject(''); }} className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={!selectedStream}>
                                <option value="">Select Section</option>
                                {availableSections.map(s => <option key={s.section} value={s.section}>{s.section_name || `Section ${s.section}`}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    {currentClassMode === 'subject_wise' && (
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={!selectedClass || !selectedStream || !selectedSection}>
                                <option value="">Select Subject</option>
                                {hsSubjects.map(subj => <option key={subj.id || subj.name} value={subj.name}>{subj.name} {subj.code ? `(${subj.code})` : ''}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={today} className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">ℹ️ You can only mark attendance for today</p>
                    </div>
                </div>

                {isPastDate && !editMode && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                                <div className="text-2xl">🔒</div>
                                <div><p className="font-semibold text-yellow-800 text-sm">Past Date Selected</p><p className="text-xs text-yellow-700 mt-0.5">Attendance for past dates is locked. Click the button to unlock and edit.</p></div>
                            </div>
                            <Button variant="primary" size="sm" onClick={() => setEditMode(true)} className="ml-auto whitespace-nowrap">✏️ Edit Attendance</Button>
                        </div>
                    </div>
                )}
                {isPastDate && editMode && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2">
                            <div className="text-2xl">✏️</div>
                            <div><p className="font-semibold text-blue-800 text-sm">Edit Mode Enabled</p><p className="text-xs text-blue-700 mt-0.5">You can now edit attendance for {selectedDate}. Submit when ready.</p></div>
                        </div>
                    </div>
                )}
                {!isPastDate && attendanceExists && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs sm:text-sm text-amber-900 font-medium">
                            ⚠️ <strong>Note:</strong> Attendance for today was marked {markedByTeacherName ? `(Taken by: ${markedByTeacherName})` : ''}. You can update or re-submit below.
                        </p>
                    </div>
                )}
            </Card>

            {/* Stats Cards – compact on mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white p-2 sm:p-4 rounded-xl border-l-4 border-l-blue-500 shadow-sm">
                    <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Students</p>
                    <p className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800">{students.length}</p>
                </div>
                <div className="bg-emerald-50/50 p-2 sm:p-4 rounded-xl border-l-4 border-l-emerald-500 shadow-sm">
                    <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Present</p>
                    <div className="flex items-baseline gap-1"><p className="text-lg sm:text-2xl md:text-3xl font-bold text-emerald-700">{presentCount}</p><span className="text-[9px] sm:text-xs text-emerald-500">({students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%)</span></div>
                </div>
                <div className="bg-rose-50/50 p-2 sm:p-4 rounded-xl border-l-4 border-l-rose-500 shadow-sm">
                    <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Absent</p>
                    <div className="flex items-baseline gap-1"><p className="text-lg sm:text-2xl md:text-3xl font-bold text-rose-700">{absentCount}</p><span className="text-[9px] sm:text-xs text-rose-500">({students.length > 0 ? Math.round((absentCount / students.length) * 100) : 0}%)</span></div>
                </div>
            </div>

            {/* Attendance List */}
            <Card title="Mark Attendance" subtitle={`${selectedClass ? `Class ${selectedClass}` : 'Select a class'} - ${selectedDate}`} variant="elevated">
                {loading ? (
                    <div className="text-center py-12"><div className="text-4xl mb-4">⏳</div><p className="text-gray-600">Loading students...</p></div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12"><div className="text-6xl mb-4">👥</div><p className="text-gray-600">No students found in this class</p><p className="text-sm text-gray-500 mt-2">There are no students enrolled in the selected class</p></div>
                ) : (isLocked && !attendanceExists) ? (
                    <div className="text-center py-12"><div className="text-6xl mb-4">📅</div><p className="text-gray-600 font-medium text-lg">No Attendance Taken</p><p className="text-sm text-gray-500 mt-2">This class was not taken on {selectedDate}.</p></div>
                ) : (
                    <>
                        {attendanceExists && (
                            <div className="mb-4 sm:mb-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-7 w-7 sm:h-9 sm:w-9 bg-emerald-500 text-white flex items-center justify-center rounded-lg text-sm sm:text-lg">✓</div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">Existing Attendance Loaded</h4>
                                        <p className="text-[10px] sm:text-xs text-slate-500">
                                            Below are the current student statuses. {markedByTeacherName && <strong className="text-emerald-950 font-bold ml-1">(Taken by: {markedByTeacherName})</strong>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Button variant="success" size="sm" onClick={() => handleMarkAll('present')} disabled={isLocked}>✓ Mark All Present</Button>
                            <Button variant="danger" size="sm" onClick={() => handleMarkAll('absent')} disabled={isLocked}>✗ Mark All Absent</Button>
                            {isLocked && <span className="text-xs text-red-600 flex items-center ml-2">🔒 Past attendance locked</span>}
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {students.map(student => (
                                <div key={student.id} className={`flex flex-wrap sm:flex-nowrap items-center justify-between p-2 sm:p-4 rounded-lg border-2 transition-all ${attendance[student.id] === 'present' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-base font-semibold">{student.name.charAt(0).toUpperCase()}</div>
                                        <div><p className="font-semibold text-sm sm:text-base text-gray-900">{student.name}</p><p className="text-[10px] sm:text-sm text-gray-600">Roll No: {student.roll_no}</p></div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                                        <span className={`text-xs sm:text-sm font-medium ${attendance[student.id] === 'present' ? 'text-green-700' : 'text-red-700'}`}>{attendance[student.id] === 'present' ? 'Present ✓' : 'Absent ✗'}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={attendance[student.id] === 'present'} onChange={() => handleToggle(student.id)} disabled={isLocked} className="sr-only peer" />
                                            <div className={`w-10 h-5 sm:w-14 sm:h-7 ${isLocked ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-400'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 sm:after:h-6 sm:after:w-6 after:transition-all ${isLocked ? '' : 'peer-checked:bg-green-500'}`}></div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitting || (currentClassMode === 'subject_wise' && !selectedSubject) || isLocked} className="flex-1">
                                {isLocked ? '🔒 Locked - Click Edit Attendance' : submitting ? 'Submitting...' : attendanceExists ? (isPastDate ? 'Update Past Attendance' : 'Update Today\'s Attendance') : 'Submit Attendance'}
                            </Button>
                            {!isPastDate && attendanceExists && (
                                <Button variant="secondary" size="lg" onClick={() => { const [classNumber, section] = selectedClass.split('-'); loadClassData(classNumber, section); }}>Reset</Button>
                            )}
                        </div>
                    </>
                )}
            </Card>

            {/* Confirmation Modal – mobile responsive */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">📝</div>
                            <div><h3 className="text-base sm:text-lg font-bold text-slate-800">Confirm Attendance Update</h3><p className="text-[10px] sm:text-xs text-slate-400">Action requires verification</p></div>
                        </div>
                        <div className="py-4 sm:py-5">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{isPastDate ? `Attendance records for ${selectedDate} have already been marked. Overwrite them with your current changes?` : "Attendance for today has already been marked. Overwrite today's records with your updated choices?"}</p>
                            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 mt-3 flex justify-between text-xs">
                                <div><span className="text-slate-400 block">Present</span><span className="text-emerald-600 font-bold">{presentCount} students</span></div>
                                <div className="w-px h-6 bg-slate-200"></div>
                                <div><span className="text-slate-400 block">Absent</span><span className="text-rose-600 font-bold">{absentCount} students</span></div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-3 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="flex-1 !py-2 text-xs rounded-lg">Cancel</Button>
                            <Button variant="primary" onClick={executeSubmit} disabled={submitting} className="flex-1 !py-2 text-xs rounded-lg">{submitting ? 'Updating...' : 'Yes, Overwrite'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeAttendance;