import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const AdminTeacherTimeTable = () => {
    // Removed default '1', now defaults to empty string
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [classStreams, setClassStreams] = useState([]);

    // Elective states
    const [isElective, setIsElective] = useState(false);
    const [classStudents, setClassStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [electiveConflicts, setElectiveConflicts] = useState([]);

    // Merged class states
    const [isMerged, setIsMerged] = useState(false);
    const [mergedClasses, setMergedClasses] = useState([]);
    const [mergedAddForm, setMergedAddForm] = useState({ class_number: '', section: '', stream_id: '' });
    const [mergedSections, setMergedSections] = useState([]);
    const [mergedStreams, setMergedStreams] = useState([]);

    // School Days Calendar states
    const [weeklySchedule, setWeeklySchedule] = useState([]);


    const isHigherSecondaryClass = (cn) => {
        const s = String(cn);
        return s === '11' || s === '12';
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddSlotModal, setShowAddSlotModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState({ start_time: '', end_time: '' });

    const [classForm, setClassForm] = useState({
        class_number: '',
        section: '',
        subject_id: '',
        room_number: ''
    });

    const [timeSlotForm, setTimeSlotForm] = useState({
        start_time: '',
        end_time: '',
        is_break: false
    });

    const allDaysMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const days = allDaysMap.filter((dayName, index) => {
        const scheduleItem = weeklySchedule.find(s => s.day_of_week === index);
        const isWorking = scheduleItem ? scheduleItem.is_working : (index !== 0);
        return isWorking;
    });

    // Helper function to format time to AM/PM without seconds
    const formatTime = (timeString) => {
        if (!timeString) return '';
        // timeString format: "HH:MM:SS" or "HH:MM"
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11
        return `${displayHour}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        fetchInitialData();
        fetchWeeklySchedule();
    }, []);

    const fetchWeeklySchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/school-weekly-schedule`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setWeeklySchedule(data.schedule || []);
            }
        } catch (err) {
            console.error('Failed to fetch weekly schedule:', err);
        }
    };



    useEffect(() => {
        if (selectedTeacher) {
            fetchTeacherTimetable();
        } else {
            setTimetable([]);
        }
    }, [selectedTeacher]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Added sections fetch below
            // Removed global subjects fetch - now dependent on class
            // Removed global sections fetch - now dependent on class
            const [teachersRes, timeSlotsRes, classesRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/teachers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/admin/time-slots`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/admin/classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const teachersData = await teachersRes.json();
            const timeSlotsData = await timeSlotsRes.json();
            const classesData = await classesRes.json();

            if (teachersData.success) setTeachers(teachersData.teachers.filter(t => t.status === 'active'));
            if (timeSlotsData.success) setTimeSlots(timeSlotsData.timeSlots);
            if (classesData.success) setClasses(classesData.classes);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchTeacherTimetable = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_URL}/api/admin/teacher/${selectedTeacher}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) setTimetable(data.timetable);
        } catch (error) {
            console.error('Error fetching teacher timetable:', error);
        }
    };

    const fetchClassSubjects = async (classNum) => {
        if (!classNum) {
            setSubjects([]);
            return;
        }

        // Find class ID from class_number
        // Use loose equality to handle string/number differences (e.target.value is string)
        const selectedClass = classes.find(c => c.class_number == classNum);
        if (!selectedClass) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_URL}/api/admin/class-subjects/${selectedClass.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) {
                setSubjects(data.subjects);
            }
        } catch (error) {
            console.error('Error fetching class subjects:', error);
        }
    };

    const fetchClassSections = async (classNum, streamId) => {
        if (!classNum) {
            setSections([]);
            return;
        }

        // Find class ID from class_number
        const selectedClass = classes.find(c => c.class_number == classNum);
        if (!selectedClass) return;

        try {
            const token = localStorage.getItem('token');
            let queryUrl = `${API_URL}/api/admin/class-sections/${selectedClass.id}`;
            if (isHigherSecondaryClass(classNum) && streamId) {
                queryUrl += `?stream_id=${streamId}`;
            }

            const response = await fetch(queryUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                setSections(data.sections);
            }
        } catch (error) {
            console.error('Error fetching class sections:', error);
        }
    };

    // Fetch streams/groups for a class
    const fetchClassStreams = async (classNum) => {
        try {
            const token = localStorage.getItem('token');
            const cls = classes.find(c => c.class_number == classNum);
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

    // Fetch students for class+section (for elective checklist)
    const fetchClassStudents = async (classNum, sec, day, slotId) => {
        if (!classNum || !sec) { setClassStudents([]); return; }
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('token');
            const [studentsRes, conflictsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/class-students?class_number=${classNum}&section=${sec}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                isElective && day && slotId ? fetch(`${API_URL}/api/admin/timetable-slot-elective-conflicts?dayOfWeek=${day}&timeSlotId=${slotId}&classNumber=${classNum}&section=${sec}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }) : Promise.resolve({ json: () => ({ success: true, conflicts: [] }) })
            ]);

            const studentsData = await studentsRes.json();
            const conflictsData = await conflictsRes.json();

            if (studentsData.success) setClassStudents(studentsData.students || []);
            if (conflictsData.success) setElectiveConflicts(conflictsData.conflicts || []);
        } catch (err) { console.error('Error fetching students:', err); }
        setLoadingStudents(false);
    };

    // Fetch enrolled student IDs for an existing elective entry
    const fetchElectiveStudents = async (timetableId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/timetable-elective-students/${timetableId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSelectedStudentIds(data.studentIds || []);
        } catch (err) { console.error('Error fetching elective students:', err); }
    };

    // Fetch students already assigned to a specific subject as elective (across all slots)
    const fetchElectiveSubjectStudents = async (classNum, sec, subjectId) => {
        if (!classNum || !sec || !subjectId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/elective-subject-students?class_number=${classNum}&section=${sec}&subject_id=${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSelectedStudentIds(data.studentIds || []);
        } catch (err) { console.error('Error fetching elective subject students:', err); }
    };

    const handleCellClick = async (day, slot) => {
        if (slot.is_break) return;
        if (!selectedTeacher) { alert('Please select a teacher first'); return; }

        const entry = getTimetableEntry(day, slot);
        setSelectedCell({ day, slot, entry });
        setSelectedStudentIds([]);
        setClassStudents([]);

        if (entry) {
            const fetches = [
                fetchClassSubjects(entry.class_number),
                fetchClassSections(entry.class_number)
            ];
            if (isHigherSecondaryClass(entry.class_number)) {
                fetches.push(fetchClassStreams(entry.class_number));
            } else { setClassStreams([]); }
            await Promise.all(fetches);

            const storedStreamId = entry.stream_id ? String(entry.stream_id) : '';
            if (isHigherSecondaryClass(entry.class_number) && storedStreamId) {
                await fetchClassSections(entry.class_number, storedStreamId);
            }

            // Check if this is a merged entry
            if (entry.merge_group_id) {
                const mergedEntries = timetable.filter(e => e.merge_group_id === entry.merge_group_id);
                setIsMerged(true);
                setIsElective(false);
                setMergedClasses(mergedEntries.map(e => ({
                    class_number: e.class_number,
                    section: e.section,
                    stream_id: e.stream_id ? String(e.stream_id) : '',
                    stream_name: e.stream_name || ''
                })));
                setClassForm({
                    class_number: entry.class_number,
                    section: entry.section,
                    subject_id: entry.subject_id,
                    room_number: entry.room_number || '',
                    stream_id: storedStreamId
                });
            } else {
                setIsMerged(false);
                setClassForm({
                    class_number: entry.class_number,
                    section: entry.section,
                    subject_id: entry.subject_id,
                    room_number: entry.room_number || '',
                    stream_id: storedStreamId
                });

                // Set elective state
                const elective = !!entry.is_elective;
                setIsElective(elective);
                if (elective) {
                    await fetchClassStudents(entry.class_number, entry.section, day, slot.id);
                    await fetchElectiveStudents(entry.id);
                }
            }
        } else {
            setSubjects([]);
            setSections([]);
            setClassStreams([]);
            setIsElective(false);
            setIsMerged(false);
            setMergedClasses([]);
            setClassForm({ class_number: '', section: '', subject_id: '', room_number: '', stream_id: '' });
        }

        setShowEditModal(true);
    };

    const handleClassChange = (e) => {
        const newClassNum = e.target.value;
        setClassForm({
            ...classForm,
            class_number: newClassNum,
            section: '',    // Reset section
            subject_id: '', // Reset subject
            stream_id: ''   // Reset stream
        });

        if (newClassNum) {
            fetchClassSubjects(newClassNum);
            if (isHigherSecondaryClass(newClassNum)) {
                fetchClassStreams(newClassNum);
                setSections([]);
            } else {
                setClassStreams([]);
                fetchClassSections(newClassNum);
            }
        } else {
            setSubjects([]);
            setSections([]);
            setClassStreams([]);
        }
    };

    const handleSaveClass = async (e) => {
        e.preventDefault();

        // ========== MERGED SAVE ==========
        if (isMerged) {
            if (mergedClasses.length < 2) {
                alert('❌ Please add at least 2 class-section pairs for a merged class.');
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/admin/teacher/assign`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teacherId: selectedTeacher,
                        dayOfWeek: selectedCell.day.charAt(0).toUpperCase() + selectedCell.day.slice(1).toLowerCase(),
                        timeSlotId: selectedCell.slot.id,
                        subjectId: classForm.subject_id,
                        roomNumber: classForm.room_number,
                        isMerged: true,
                        mergedClasses: mergedClasses.map(mc => ({
                            classNumber: mc.class_number,
                            section: mc.section,
                            streamId: mc.stream_id || null
                        }))
                    })
                });
                const data = await response.json();
                if (data.success) {
                    alert('✅ Merged class assigned successfully!');
                    setShowEditModal(false);
                    fetchTeacherTimetable();
                } else {
                    alert('❌ Failed: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error saving merged class:', error);
                alert('❌ Failed to save merged class');
            }
            return;
        }

        // ========== REGULAR / ELECTIVE SAVE ==========
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teacher/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    classNumber: classForm.class_number,
                    section: classForm.section,
                    streamId: classForm.stream_id || null,
                    dayOfWeek: selectedCell.day.charAt(0).toUpperCase() + selectedCell.day.slice(1).toLowerCase(),
                    timeSlotId: selectedCell.slot.id,
                    subjectId: classForm.subject_id,
                    teacherId: selectedTeacher,
                    roomNumber: classForm.room_number,
                    isElective: isElective,
                    studentIds: isElective ? selectedStudentIds : []
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Assignment saved successfully!');
                setShowEditModal(false);
                fetchTeacherTimetable();
            } else {
                alert('❌ Failed to save: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('❌ Failed to save assignment');
        }
    };

    // Toggle student selection for elective
    const toggleStudentSelection = (studentId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };
    const toggleSelectAll = () => {
        // Only select students who aren't conflicted (unless they are already in THIS assignment)
        const availableStudents = classStudents.filter(s => {
            const isConflicted = electiveConflicts.some(c => c.student_id === s.id && c.timetable_id !== selectedCell?.entry?.id);
            return !isConflicted;
        });

        if (selectedStudentIds.length >= availableStudents.length && availableStudents.length > 0) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(availableStudents.map(s => s.id));
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedCell?.entry?.id) return;
        if (!confirm('Are you sure you want to delete this assignment?')) return;

        try {
            const token = localStorage.getItem('token');
            // Updated endpoint to match admin.js router path
            const response = await fetch(`${API_URL}/api/admin/teacher/entry/${selectedCell.entry.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Assignment deleted successfully!');
                setShowEditModal(false);
                fetchTeacherTimetable();
            } else {
                alert('❌ Failed to delete: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('❌ Failed to delete assignment');
        }
    };

    const handleAddTimeSlot = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/time-slots`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    start_time: timeSlotForm.start_time,
                    end_time: timeSlotForm.end_time,
                    is_break: timeSlotForm.is_break
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(timeSlotForm.is_break ? '✅ Break added successfully!' : '✅ Time slot added successfully!');
                setShowAddSlotModal(false);
                setTimeSlotForm({ start_time: '', end_time: '', is_break: false });
                fetchInitialData();
            } else {
                alert('❌ ' + (data.message || 'Failed to add time slot'));
            }
        } catch (error) {
            console.error('Error adding time slot:', error);
            alert('❌ Failed to add time slot');
        }
    };

    const handleDeleteTimeSlot = async (slotId, isBreak) => {
        const confirmMsg = isBreak
            ? 'Are you sure you want to remove this break?'
            : 'Are you sure you want to delete this time slot? All timetable entries for this slot will also be deleted.';
        if (!confirm(confirmMsg)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/time-slots/${slotId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert(isBreak ? '✅ Break removed!' : '✅ Time slot deleted!');
                fetchInitialData();
                if (selectedTeacher) fetchTeacherTimetable();
            } else {
                alert('❌ ' + (data.message || 'Failed to delete'));
            }
        } catch (error) {
            console.error('Error deleting time slot:', error);
            alert('❌ Failed to delete time slot');
        }
    };

    const handleTimeSlotEdit = (slot) => {
        if (slot.is_break) return;
        setEditingSlotId(slot.id);
        // Convert HH:MM:SS to HH:MM for input
        setEditSlotForm({
            start_time: slot.start_time ? slot.start_time.substring(0, 5) : '',
            end_time: slot.end_time ? slot.end_time.substring(0, 5) : ''
        });
    };

    const handleTimeSlotSave = async (slotId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/time-slots/${slotId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    start_time: editSlotForm.start_time,
                    end_time: editSlotForm.end_time
                })
            });
            const data = await response.json();
            if (data.success) {
                // Update local state
                setTimeSlots(prev => prev.map(s => s.id === slotId
                    ? { ...s, start_time: editSlotForm.start_time, end_time: editSlotForm.end_time }
                    : s
                ));
                setEditingSlotId(null);
                alert('✅ Time slot updated!');
            } else {
                alert('❌ ' + (data.message || 'Failed to update'));
            }
        } catch (error) {
            console.error('Error updating time slot:', error);
            alert('❌ Failed to update time slot');
        }
    };

    const getTimetableEntry = (day, timeSlot) => {
        // Case-insensitive comparison to handle both 'MONDAY' and 'Monday'
        return timetable.find(
            entry => entry.day_of_week?.toUpperCase() === day.toUpperCase() && entry.time_slot_id === timeSlot.id
        );
    };

    // Get all entries at a cell (for merged grouping)
    const getTimetableEntries = (day, timeSlot) => {
        return timetable.filter(
            entry => entry.day_of_week?.toUpperCase() === day.toUpperCase() && entry.time_slot_id === timeSlot.id
        );
    };

    // Fetch sections for merged add form
    const fetchMergedSections = async (classNum, streamId) => {
        if (!classNum) { setMergedSections([]); return; }
        const selectedClass = classes.find(c => c.class_number == classNum);
        if (!selectedClass) return;
        try {
            const token = localStorage.getItem('token');
            let queryUrl = `${API_URL}/api/admin/class-sections/${selectedClass.id}`;
            if (isHigherSecondaryClass(classNum) && streamId) {
                queryUrl += `?stream_id=${streamId}`;
            }
            const res = await fetch(queryUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setMergedSections(data.sections || []);
        } catch (err) { console.error('Error fetching merged sections:', err); }
    };

    const fetchMergedStreams = async (classNum) => {
        try {
            const token = localStorage.getItem('token');
            const cls = classes.find(c => c.class_number == classNum);
            if (!cls) return;
            const res = await fetch(`${API_URL}/api/admin/class-streams/${cls.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setMergedStreams(data.streams || []);
        } catch (error) { console.error('Error fetching merged streams:', error); }
    };

    const handleAddMergedClass = () => {
        if (!mergedAddForm.class_number || !mergedAddForm.section) {
            alert('Please select class and section');
            return;
        }
        // Check for duplicates
        const exists = mergedClasses.some(mc => mc.class_number === mergedAddForm.class_number && mc.section === mergedAddForm.section && (mc.stream_id || '') === (mergedAddForm.stream_id || ''));
        if (exists) {
            alert('This class-section is already added');
            return;
        }
        const streamName = mergedStreams.find(s => String(s.id) === String(mergedAddForm.stream_id))?.name || '';
        setMergedClasses(prev => [...prev, { ...mergedAddForm, stream_name: streamName }]);
        setMergedAddForm({ class_number: '', section: '', stream_id: '' });
        setMergedSections([]);
        setMergedStreams([]);
    };

    const removeMergedClass = (index) => {
        setMergedClasses(prev => prev.filter((_, i) => i !== index));
    };

    const getSelectedTeacherName = () => {
        // Now checks real teachers state only
        const teacher = teachers.find(t => t.id === parseInt(selectedTeacher));
        return teacher ? teacher.name : '';
    };

    return (
        <div className="space-y-3 md:space-y-4 pb-4 pt-3 md:pt-4">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-pink-600 py-1.5 px-3 text-white shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-sm md:text-base font-bold tracking-tight">Teacher Time Table 👨‍🏫</h1>
                        <p className="text-red-100 text-[10px] md:text-xs">
                            Manage teacher schedules and assignments.
                        </p>
                    </div>
                </div>

                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-red-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Teacher Selector Toolbar */}
            <div className="bg-white p-2.5 rounded-lg shadow-sm border-b md:border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 -mx-4 md:mx-0">
                <div className="flex-1 max-w-xs">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Teacher</label>
                    <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer hover:bg-slate-100"
                    >
                        <option value="">Choose a teacher...</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedTeacher && (
                        <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded border border-red-100">
                            <div className="p-1 bg-white rounded-full shadow-sm text-xs text-red-500">
                                👨‍🏫
                            </div>
                            <div>
                                <p className="text-[9px] text-red-600 font-bold uppercase tracking-wide leading-none">Selected Teacher</p>
                                <p className="font-bold text-xs text-red-900 leading-tight">{getSelectedTeacherName()}</p>
                                <p className="text-[9px] text-red-700 leading-none">{timetable.length} classes assigned</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setShowAddSlotModal(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm transform active:scale-95 duration-200 flex items-center gap-1.5"
                    >
                        <span className="text-sm">➕</span> Add Slot
                    </button>
                </div>
            </div>

            {/* Custom Wrapper with Card styling for Timetable Table */}
            {selectedTeacher ? (
                <Card variant="elevated" allowOverflow={true} className="p-0 border border-slate-200 shadow-md">
                    <div className="rounded-lg border border-slate-200 max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-220px)] overflow-x-scroll overflow-y-auto relative visible-scrollbar">
                        <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead className="bg-slate-100 sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-24 border-b border-r-2 border-slate-200 bg-slate-100 sticky top-0 left-0 z-40">
                                        Time / Day
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="px-2 py-2 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider min-w-[115px] border-b border-r border-slate-200 last:border-r-0 bg-slate-100 sticky top-0 z-30">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y-2 divide-slate-100">
                                {timeSlots.length > 0 ? (
                                    timeSlots.map((slot, index) => (
                                        <tr key={slot.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                            <td
                                                className={`px-2 py-1 text-[11px] font-semibold text-center border-b border-slate-200 border-r-2 border-slate-200 sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${!slot.is_break && editingSlotId !== slot.id ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!slot.is_break && editingSlotId !== slot.id) {
                                                        handleTimeSlotEdit(slot);
                                                    }
                                                }}
                                            >
                                                {slot.is_break ? (
                                                    <div className="flex flex-col items-center gap-1 min-w-[85px]">
                                                        <span className="px-1.5 py-0.5 text-[9px] font-black text-amber-700 bg-amber-100 rounded border border-amber-200 leading-none">BREAK</span>
                                                        <div className="flex items-center justify-center gap-1 font-bold text-[10px] text-slate-500 whitespace-nowrap leading-none">
                                                            <span>{formatTime(slot.start_time)}</span>
                                                            <span className="text-slate-300">-</span>
                                                            <span>{formatTime(slot.end_time)}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteTimeSlot(slot.id, true); }}
                                                            className="px-1.5 py-0.5 text-[9px] font-bold text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors border border-red-200 leading-none"
                                                        >
                                                            ✕ Remove
                                                        </button>
                                                    </div>
                                                ) : editingSlotId === slot.id ? (
                                                    <div className="flex flex-col gap-1.5 items-center min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="time"
                                                            value={editSlotForm.start_time}
                                                            onChange={(e) => setEditSlotForm({ ...editSlotForm, start_time: e.target.value })}
                                                            className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
                                                        />
                                                        <span className="text-[10px] text-slate-400 font-bold">-</span>
                                                        <input
                                                            type="time"
                                                            value={editSlotForm.end_time}
                                                            onChange={(e) => setEditSlotForm({ ...editSlotForm, end_time: e.target.value })}
                                                            className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
                                                        />
                                                        <div className="flex gap-1 mt-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleTimeSlotSave(slot.id); }}
                                                                className="px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingSlotId(null); }}
                                                                className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors shadow-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingSlotId(null); handleDeleteTimeSlot(slot.id, false); }}
                                                            className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors border border-red-200"
                                                        >
                                                            🗑️ Delete Slot
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 min-w-[85px] text-slate-700">
                                                        <div className="flex items-center justify-center gap-1 font-bold text-[10px] whitespace-nowrap leading-none">
                                                            <span>{formatTime(slot.start_time)}</span>
                                                            <span className="text-slate-400">-</span>
                                                            <span>{formatTime(slot.end_time)}</span>
                                                        </div>
                                                        <span className="text-[9px] text-blue-600 font-bold bg-blue-50 w-max mx-auto px-1.5 py-0.5 rounded border border-blue-100 leading-none">✏️ Edit</span>
                                                    </div>
                                                )}
                                            </td>

                                            {slot.is_break ? (
                                                <td colSpan={days.length} className="bg-amber-50/80 px-4 py-3 text-center border-y border-amber-200">
                                                    <div className="flex items-center justify-center gap-2 text-amber-800 font-black tracking-widest uppercase">
                                                        <span>☕</span> BREAK <span>☕</span>
                                                    </div>
                                                </td>
                                            ) : (
                                                days.map(day => {
                                                    const entries = getTimetableEntries(day, slot);
                                                    const entry = entries[0]; // first entry for click handling

                                                    // Group merged entries
                                                    const mergedGroupId = entry?.merge_group_id;
                                                    const mergedEntries = mergedGroupId ? entries.filter(e => e.merge_group_id === mergedGroupId) : [];
                                                    const isMergedEntry = mergedEntries.length > 1;

                                                    return (
                                                        <td
                                                            key={`${day}-${slot.id}`}
                                                            onClick={() => handleCellClick(day, slot)}
                                                            className={`px-2 py-2 border-b border-r border-slate-200 last:border-r-0 transition-all duration-200 relative group h-28 align-top ${selectedTeacher
                                                                ? 'cursor-pointer hover:bg-blue-50/50'
                                                                : 'cursor-not-allowed opacity-50 bg-slate-50'
                                                                }`}
                                                        >
                                                            {/* Empty State / Hover Indicator */}
                                                            {selectedTeacher && !entry && (
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-3xl text-blue-300 font-black">+</span>
                                                                </div>
                                                            )}

                                                            {entry ? (
                                                                isMergedEntry ? (
                                                                    /* === MERGED ENTRY CARD === */
                                                                    <div className="bg-white border-2 border-amber-300 shadow-sm rounded-lg p-1 h-full flex flex-col gap-0.5 group-hover:shadow-md group-hover:border-amber-500 transition-all">
                                                                        <div className="flex items-start justify-between gap-1">
                                                                            <span className="font-black text-slate-800 text-xs line-clamp-2 leading-none">
                                                                                {entry.subject_name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-[9px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 w-fit font-black shadow-sm">
                                                                            🔗 Merged
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                                                            {mergedEntries.map((me, idx) => (
                                                                                <span key={idx} className="text-[9px] font-black px-1 py-0.5 rounded border whitespace-nowrap shadow-sm text-amber-800 bg-amber-50 border-amber-200">
                                                                                    {me.class_number}-{me.section}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        {entry.room_number && (
                                                                            <div className="mt-auto flex items-center gap-1 text-[9px] text-slate-600 font-bold bg-slate-50 w-max px-1 py-0.5 rounded border border-slate-200">
                                                                                <span>📍</span> {entry.room_number}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    /* === REGULAR / ELECTIVE ENTRY CARD === */
                                                                    <div className={`bg-white border-2 shadow-sm rounded-lg p-1 h-full flex flex-col gap-0.5 group-hover:shadow-md transition-all ${entry.is_elective ? 'border-violet-300 group-hover:border-violet-500' : 'border-red-200 group-hover:border-red-400'}`}>
                                                                        <div className="flex items-start justify-between gap-1">
                                                                            <span className="font-black text-slate-800 text-xs line-clamp-2 leading-none">
                                                                                {entry.subject_name}
                                                                            </span>
                                                                            <span className={`text-[9px] font-black px-1 py-0.5 rounded border whitespace-nowrap shadow-sm ${entry.is_elective ? 'text-violet-700 bg-violet-50 border-violet-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                                                                                {entry.class_number}-{entry.section}
                                                                            </span>
                                                                        </div>

                                                                        {entry.is_elective ? (
                                                                            <div className="flex items-center gap-1 text-[9px] text-violet-700 bg-violet-50 px-1 py-0.5 rounded border border-violet-200 w-fit font-black shadow-sm">
                                                                                🎯 Elective
                                                                            </div>
                                                                        ) : null}

                                                                        {entry.stream_name && (
                                                                            <div className="flex items-center gap-1 text-[9px] text-teal-800 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 w-fit font-black shadow-sm">
                                                                                📚 {entry.stream_name}
                                                                            </div>
                                                                        )}

                                                                        {entry.room_number && (
                                                                            <div className="mt-auto flex items-center gap-1 text-[9px] text-slate-600 font-bold bg-slate-50 w-max px-1 py-0.5 rounded border border-slate-200">
                                                                                <span>📍</span> {entry.room_number}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <span className="text-slate-200 text-2xl font-black">•</span>
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
                                        <td colSpan={days.length + 1} className="px-4 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-4xl opacity-50">📅</span>
                                                <p className="font-medium text-lg">No time slots found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                timeSlots.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
                        <div className="bg-red-50 p-6 rounded-full mb-4">
                            <span className="text-4xl">👨‍🏫</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Assign Classes</h3>
                        <p className="text-slate-500 mt-2 max-w-sm">
                            Select a teacher from the dropdown above to view their schedule and assign classes.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Click cells to assign</span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Click assignments to edit</span>
                        </div>
                    </div>
                )
            )}

            {/* Edit/Delete Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedCell?.entry ? '✏️ Edit Assignment' : '➕ Assign Class'}
                            </h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Context Info */}
                        <div className="bg-blue-50 px-6 py-3 flex justify-between items-center text-sm border-b border-blue-100">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-700">Day:</span>
                                <span className="text-blue-900">{selectedCell?.day}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-700">Time:</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                    {formatTime(selectedCell?.slot?.start_time)} - {formatTime(selectedCell?.slot?.end_time)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSaveClass} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Subject Type Toggle */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Type</label>
                                <div className="flex rounded-lg border border-slate-300 overflow-hidden divide-x divide-slate-300">
                                    <button type="button"
                                        onClick={() => { setIsElective(false); setIsMerged(false); setSelectedStudentIds([]); setClassStudents([]); setMergedClasses([]); }}
                                        className={`flex-1 px-3 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 ${!isElective && !isMerged ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                    >📚 Subject</button>
                                    <button type="button"
                                        onClick={() => {
                                            setIsElective(true); setIsMerged(false); setMergedClasses([]);
                                            if (classForm.class_number && classForm.section) {
                                                fetchClassStudents(classForm.class_number, classForm.section, selectedCell?.day, selectedCell?.slot?.id);
                                                if (classForm.subject_id) {
                                                    fetchElectiveSubjectStudents(classForm.class_number, classForm.section, classForm.subject_id);
                                                }
                                            }
                                        }}
                                        className={`flex-1 px-3 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 ${isElective ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                    >🎯 Elective</button>
                                    <button type="button"
                                        onClick={() => { setIsMerged(true); setIsElective(false); setSelectedStudentIds([]); setClassStudents([]); }}
                                        className={`flex-1 px-3 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 ${isMerged ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                    >🔗 Merged</button>
                                </div>
                            </div>

                            {/* === MERGED CLASS UI === */}
                            {isMerged && (
                                <div className="space-y-3">
                                    {/* Added classes list */}
                                    <div className="border-2 border-amber-200 rounded-xl overflow-hidden bg-amber-50/30">
                                        <div className="px-4 py-3 bg-amber-100 border-b border-amber-200 flex items-center gap-2">
                                            <span className="text-lg">🔗</span>
                                            <span className="font-bold text-amber-800 text-sm">Merged Classes</span>
                                            <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">{mergedClasses.length}</span>
                                        </div>

                                        {/* List of added classes */}
                                        {mergedClasses.length > 0 && (
                                            <div className="p-2 space-y-1 border-b border-amber-200">
                                                {mergedClasses.map((mc, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-200">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-800">Class {mc.class_number} - {mc.section}</span>
                                                            {mc.stream_name && <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 font-bold">{mc.stream_name}</span>}
                                                        </div>
                                                        <button type="button" onClick={() => removeMergedClass(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 hover:bg-red-50 rounded transition-colors">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add class form */}
                                        <div className="p-3 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <select value={mergedAddForm.class_number} onChange={(e) => {
                                                    const cn = e.target.value;
                                                    setMergedAddForm({ ...mergedAddForm, class_number: cn, section: '', stream_id: '' });
                                                    if (cn) {
                                                        fetchClassSubjects(cn);
                                                        if (isHigherSecondaryClass(cn)) { fetchMergedStreams(cn); setMergedSections([]); }
                                                        else { setMergedStreams([]); fetchMergedSections(cn); }
                                                    } else { setMergedSections([]); setMergedStreams([]); }
                                                }} className="px-2 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                                                    <option value="">Class</option>
                                                    {[...new Set(classes.map(cls => cls.class_number))].sort((a, b) => a - b).map(cn => (
                                                        <option key={cn} value={cn}>Class {cn}</option>
                                                    ))}
                                                </select>

                                                {mergedAddForm.class_number && isHigherSecondaryClass(mergedAddForm.class_number) ? (
                                                    <select value={mergedAddForm.stream_id} onChange={(e) => {
                                                        setMergedAddForm({ ...mergedAddForm, stream_id: e.target.value, section: '' });
                                                        if (e.target.value) fetchMergedSections(mergedAddForm.class_number, e.target.value);
                                                        else setMergedSections([]);
                                                    }} className="px-2 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                                                        <option value="">Stream</option>
                                                        {mergedStreams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                ) : (
                                                    <select value={mergedAddForm.section} onChange={(e) => setMergedAddForm({ ...mergedAddForm, section: e.target.value })}
                                                        className="px-2 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" disabled={!mergedAddForm.class_number}>
                                                        <option value="">Section</option>
                                                        {mergedSections.map(s => <option key={s.section_id || s.id} value={s.section_code || s.code}>{s.section_name || s.name}</option>)}
                                                    </select>
                                                )}
                                            </div>

                                            {mergedAddForm.class_number && isHigherSecondaryClass(mergedAddForm.class_number) && mergedAddForm.stream_id && (
                                                <select value={mergedAddForm.section} onChange={(e) => setMergedAddForm({ ...mergedAddForm, section: e.target.value })}
                                                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                                                    <option value="">Section</option>
                                                    {mergedSections.map(s => <option key={s.section_id || s.id} value={s.section_code || s.code}>{s.section_name || s.name}</option>)}
                                                </select>
                                            )}

                                            <button type="button" onClick={handleAddMergedClass}
                                                className="w-full px-3 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-all text-sm flex items-center justify-center gap-1">
                                                ➕ Add Class-Section
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subject for merged class */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject *</label>
                                        <select
                                            value={classForm.subject_id}
                                            onChange={(e) => setClassForm({ ...classForm, subject_id: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                            required
                                        >
                                            <option value="">Select Subject (pick a class above first)</option>
                                            {subjects.map(subject => (
                                                <option key={subject.subject_id || subject.id} value={subject.subject_id || subject.id}>{subject.subject_name || subject.name}{subject.subject_code || subject.code ? ` (${subject.subject_code || subject.code})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* === REGULAR / ELECTIVE FORM FIELDS === */}
                            {!isMerged && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Class *</label>
                                            <select
                                                value={classForm.class_number}
                                                onChange={(e) => {
                                                    handleClassChange(e);
                                                    if (isElective && e.target.value) {
                                                        // Will fetch students after section is selected
                                                        setClassStudents([]);
                                                        setSelectedStudentIds([]);
                                                    }
                                                }}
                                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                required
                                            >
                                                <option value="">Select Class</option>
                                                {[...new Set(classes.map(cls => cls.class_number))].sort((a, b) => a - b).map(classNum => (
                                                    <option key={classNum} value={classNum}>Class {classNum}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {classForm.class_number && isHigherSecondaryClass(classForm.class_number) ? (
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Group (Stream) *</label>
                                                <select
                                                    value={classForm.stream_id || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setClassForm({ ...classForm, stream_id: val, section: '' });
                                                        if (val) { fetchClassSections(classForm.class_number, val); }
                                                        else { setSections([]); }
                                                    }}
                                                    className={`w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${classStreams.length > 0 ? 'bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                                    disabled={classStreams.length === 0}
                                                >
                                                    <option value="">Select Group</option>
                                                    {classStreams.map(stream => (
                                                        <option key={stream.id} value={stream.id}>{stream.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section *</label>
                                                <select
                                                    value={classForm.section}
                                                    onChange={(e) => {
                                                        setClassForm({ ...classForm, section: e.target.value });
                                                        if (isElective && classForm.class_number && e.target.value) {
                                                            fetchClassStudents(classForm.class_number, e.target.value, selectedCell?.day, selectedCell?.slot?.id);
                                                            setSelectedStudentIds([]);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    required
                                                    disabled={!classForm.class_number}
                                                >
                                                    <option value="">Select Section</option>
                                                    {sections.map(section => (
                                                        <option key={section.section_id || section.id} value={section.section_code || section.code}>{section.section_name || section.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {classForm.class_number && isHigherSecondaryClass(classForm.class_number) && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section *</label>
                                            <select
                                                value={classForm.section}
                                                onChange={(e) => {
                                                    setClassForm({ ...classForm, section: e.target.value });
                                                    if (isElective && classForm.class_number && e.target.value) {
                                                        fetchClassStudents(classForm.class_number, e.target.value, selectedCell?.day, selectedCell?.slot?.id);
                                                        setSelectedStudentIds([]);
                                                    }
                                                }}
                                                className={`w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${classForm.stream_id ? 'bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                                required
                                                disabled={!classForm.stream_id}
                                            >
                                                <option value="">{!classForm.stream_id ? 'Select Group First' : 'Select Section'}</option>
                                                {sections.map(section => (
                                                    <option key={section.section_id || section.id} value={section.section_code || section.code}>{section.section_name || section.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isElective ? 'Elective Subject' : 'Subject'} *</label>
                                        <select
                                            value={classForm.subject_id}
                                            onChange={(e) => {
                                                setClassForm({ ...classForm, subject_id: e.target.value });
                                                if (isElective && classForm.class_number && classForm.section && e.target.value) {
                                                    fetchElectiveSubjectStudents(classForm.class_number, classForm.section, e.target.value);
                                                }
                                            }}
                                            className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 outline-none transition-all ${isElective ? 'border-violet-300 focus:ring-violet-500 focus:border-violet-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                            required
                                            disabled={!classForm.class_number}
                                        >
                                            <option value="">Select {isElective ? 'Elective ' : ''}Subject</option>
                                            {subjects.map(subject => (
                                                <option key={subject.subject_id || subject.id} value={subject.subject_id || subject.id}>{subject.subject_name || subject.name}{subject.subject_code || subject.code ? ` (${subject.subject_code || subject.code})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Student Checklist for Electives */}
                                    {isElective && classForm.class_number && classForm.section && (
                                        <div className="border-2 border-violet-200 rounded-xl overflow-hidden bg-violet-50/30">
                                            <div className="px-4 py-3 bg-violet-100 border-b border-violet-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">👥</span>
                                                    <span className="font-bold text-violet-800 text-sm">Select Students</span>
                                                    <span className="text-xs bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full font-bold">
                                                        {selectedStudentIds.length}/{classStudents.length}
                                                    </span>
                                                </div>
                                                <button type="button" onClick={toggleSelectAll}
                                                    className="text-xs font-bold text-violet-600 hover:text-violet-800 px-3 py-1 bg-white rounded-lg border border-violet-200 hover:bg-violet-50 transition-all">
                                                    {selectedStudentIds.length === classStudents.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto p-2">
                                                {loadingStudents ? (
                                                    <div className="text-center py-6 text-slate-400">
                                                        <div className="animate-spin inline-block w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full mb-2"></div>
                                                        <p className="text-sm">Loading students...</p>
                                                    </div>
                                                ) : classStudents.length === 0 ? (
                                                    <p className="text-center py-6 text-slate-400 text-sm">No students found in this class-section</p>
                                                ) : (
                                                    classStudents.map(student => {
                                                        const conflict = electiveConflicts.find(c => c.student_id === student.id && c.timetable_id !== selectedCell?.entry?.id);
                                                        const isChecked = selectedStudentIds.includes(student.id);
                                                        const isDisabled = !!conflict;

                                                        return (
                                                            <div key={student.id} className="relative mb-1">
                                                                <label
                                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${isDisabled ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : (isChecked ? 'bg-violet-100 border-violet-300 cursor-pointer' : 'bg-white border-slate-200 hover:border-violet-200 cursor-pointer')}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        disabled={isDisabled}
                                                                        onChange={() => !isDisabled && toggleStudentSelection(student.id)}
                                                                        className={`w-4 h-4 rounded border-slate-300 focus:ring-violet-500 ${isDisabled ? 'text-slate-400' : 'text-violet-600'}`}
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <span className={`text-sm font-bold truncate ${isDisabled ? 'text-slate-500' : 'text-slate-800'}`}>{student.student_name}</span>
                                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">Roll: {student.roll_no}</span>
                                                                        </div>
                                                                        {conflict && (
                                                                            <div className="mt-1 flex items-center gap-1.5">
                                                                                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                                                                <span className="text-[10px] text-amber-700 font-bold leading-none">
                                                                                    Already in: {conflict.subject_name} ({conflict.teacher_name})
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {isDisabled && (
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0 ml-2">
                                                                            Inactive
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400">🚪</span>
                                    <input
                                        type="text"
                                        value={classForm.room_number}
                                        onChange={(e) => setClassForm({ ...classForm, room_number: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g., 101, Lab A"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 mt-2">
                                {selectedCell?.entry && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteClass}
                                        className="px-4 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors mr-auto border border-red-200"
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2.5 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200 ${isMerged ? 'bg-amber-600 hover:bg-amber-700' : isElective ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {selectedCell?.entry ? 'Save Changes' : (isMerged ? '🔗 Assign Merged' : isElective ? 'Assign Elective' : 'Assign Class')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

            {/* Add Time Slot Modal */}
            {showAddSlotModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                ➕ Add New Time Slot
                            </h2>
                            <button
                                onClick={() => { setShowAddSlotModal(false); setTimeSlotForm({ start_time: '', end_time: '', is_break: false }); }}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddTimeSlot} className="p-6 space-y-5">
                            {/* Time Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time *</label>
                                    <input
                                        type="time"
                                        value={timeSlotForm.start_time}
                                        onChange={(e) => setTimeSlotForm({ ...timeSlotForm, start_time: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time *</label>
                                    <input
                                        type="time"
                                        value={timeSlotForm.end_time}
                                        onChange={(e) => setTimeSlotForm({ ...timeSlotForm, end_time: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {timeSlotForm.start_time && timeSlotForm.end_time && (
                                <div className="p-3 rounded-lg border-2 border-dashed text-center bg-emerald-50 border-emerald-300 text-emerald-800">
                                    <p className="text-xs font-bold uppercase tracking-wide mb-1">Preview</p>
                                    <p className="text-lg font-bold">
                                        📚 {formatTime(timeSlotForm.start_time)} — {formatTime(timeSlotForm.end_time)}
                                    </p>
                                    <p className="text-xs mt-1 font-medium">Class Period</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddSlotModal(false); setTimeSlotForm({ start_time: '', end_time: '', is_break: false }); }}
                                    className="flex-1 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-5 py-2.5 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-95 duration-200 text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                >
                                    📚 Add Slot
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div >
    );
};


export default AdminTeacherTimeTable;