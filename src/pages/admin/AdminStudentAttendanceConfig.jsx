import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminStudentAttendanceConfig = () => {
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [streams, setStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState('');
    const [streamsLoading, setStreamsLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const isHigherSecondary = (cls) => {
        if (!cls) return false;
        const name = (cls.name || '').toUpperCase();
        const num = String(cls.class_number || '');
        return name.includes('XI') || name.includes('11') || name.includes('XII') || name.includes('12') || num === '11' || num === '12';
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const assignRes = await axios.get(`${API_URL}/api/admin/daywise-attendance-teachers`, { headers });
            setAssignments(assignRes.data.assignments || []);
        } catch (e) { console.error('Assignments fetch error:', e); }

        try {
            const teacherRes = await axios.get(`${API_URL}/api/admin/teachers`, { headers });
            setTeachers(teacherRes.data.teachers || teacherRes.data || []);
        } catch (e) { console.error('Teachers fetch error:', e); }

        try {
            const classRes = await axios.get(`${API_URL}/api/admin/classes`, { headers });
            const classData = classRes.data.classes || [];
            const sortedClasses = [...classData].sort((a, b) => 
                (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setClasses(sortedClasses);
        } catch (e) { console.error('Classes fetch error:', e); }

        setLoading(false);
    };

    const fetchStreamsForClass = async (classId) => {
        setStreamsLoading(true);
        setSelectedStream('');
        try {
            const res = await axios.get(`${API_URL}/api/admin/class-streams/${classId}`, { headers });
            setStreams(res.data.streams || []);
        } catch (e) {
            console.error('Streams fetch error:', e);
            setStreams([]);
        }
        setStreamsLoading(false);
    };

    const fetchSectionsForClass = async (classId, streamId = null) => {
        setSectionsLoading(true);
        setSelectedSection('');
        try {
            let url = `${API_URL}/api/admin/class-sections/${classId}`;
            if (streamId) url += `?stream_id=${streamId}`;
            const res = await axios.get(url, { headers });
            setSections(res.data.sections || []);
        } catch (e) {
            console.error('Sections fetch error:', e);
            setSections([]);
        }
        setSectionsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Fetch streams or sections when class changes
    useEffect(() => {
        const clsObj = classes.find(c => String(c.id) === String(selectedClass));
        setSections([]);
        setSelectedSection('');

        if (selectedClass) {
            if (isHigherSecondary(clsObj)) {
                fetchStreamsForClass(selectedClass);
            } else {
                setStreams([]);
                setSelectedStream('');
                fetchSectionsForClass(selectedClass);
            }
        } else {
            setStreams([]);
            setSelectedStream('');
        }
    }, [selectedClass, classes]);

    // Fetch sections when stream changes for higher secondary
    useEffect(() => {
        const clsObj = classes.find(c => String(c.id) === String(selectedClass));
        if (selectedClass && isHigherSecondary(clsObj)) {
            if (selectedStream) {
                fetchSectionsForClass(selectedClass, selectedStream);
            } else {
                setSections([]);
                setSelectedSection('');
            }
        }
    }, [selectedStream, selectedClass, classes]);

    const addAssignment = async () => {
        const selectedClassObj = classes.find(c => String(c.id) === String(selectedClass));
        const requiresStream = isHigherSecondary(selectedClassObj);

        if (!selectedTeacher || !selectedClass || !selectedSection || (requiresStream && !selectedStream)) {
            alert('Please select teacher, class, ' + (requiresStream ? 'group, ' : '') + 'and section');
            return;
        }
        try {
            // Find class_number from selected class id
            const classNumber = selectedClassObj ? selectedClassObj.class_number : selectedClass;
            await axios.post(`${API_URL}/api/admin/daywise-attendance-teachers`, {
                assignments: [{
                    teacher_id: selectedTeacher,
                    class_number: classNumber,
                    stream_id: selectedStream || null,
                    section: selectedSection
                }]
            }, { headers });
            setSelectedTeacher('');
            setSelectedClass('');
            setSelectedStream('');
            setSelectedSection('');
            // Refresh assignments
            const res = await axios.get(`${API_URL}/api/admin/daywise-attendance-teachers`, { headers });
            setAssignments(res.data.assignments || []);
        } catch (err) {
            console.error('Error adding assignment:', err);
            alert('Failed to add assignment');
        }
    };

    const removeAssignment = async (id) => {
        if (!window.confirm('Remove this assignment?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/daywise-attendance-teachers/${id}`, { headers });
            setAssignments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error removing assignment:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading configuration...</p>
                </div>
            </div>
        );
    }

    // Group assignments by class and stream
    const groupedAssignments = {};
    assignments.forEach(a => {
        const key = `${a.class_number}-${a.stream_id || 'none'}-${a.section}`;
        if (!groupedAssignments[key]) groupedAssignments[key] = {
            class_number: a.class_number,
            stream_name: a.stream_name,
            section: a.section,
            class_name: a.class_name,
            section_name: a.section_name,
            teachers: []
        };
        groupedAssignments[key].teachers.push(a);
    });

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">📋 Student Attendance Configuration</h1>
                        <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                            Configure how student attendance is tracked and manage day-wise teacher constraints.
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Info Card */}
            <Card className="p-4 bg-amber-50 border border-amber-200">
                <div className="flex gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <p className="font-semibold text-amber-800">Attendance Rules</p>
                        <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                            <li><strong>Classes up to 10th:</strong> Day-wise attendance. Admin assigns specific teachers to classes. Only assigned teachers can mark attendance.</li>
                            <li><strong>Classes 11th & 12th:</strong> Subject-wise attendance. Teachers see all classes from their timetable. They select a subject before marking attendance.</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Add Assignment Form */}
            <Card title="📌 Assign Teacher to Class (Day-wise)" variant="elevated">
                <p className="text-sm text-gray-500 mb-4">Select a teacher and a class to allow them to take day-wise attendance (Classes up to 10th only)</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                        <select
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} {t.employee_id ? `(${t.employee_id})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Select Class</option>
                            {classes.filter(c => !isHigherSecondary(c)).map(c => (
                                <option key={c.id} value={c.id}>{c.name || `Class ${c.class_number}`}</option>
                            ))}
                        </select>
                    </div>

                    {selectedClass && isHigherSecondary(classes.find(c => String(c.id) === String(selectedClass))) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                            <select
                                value={selectedStream}
                                onChange={(e) => setSelectedStream(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                disabled={streamsLoading}
                            >
                                <option value="">{streamsLoading ? 'Loading...' : 'Select Group'}</option>
                                {streams.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={!selectedClass || sectionsLoading || (isHigherSecondary(classes.find(c => String(c.id) === String(selectedClass))) && !selectedStream)}
                        >
                            <option value="">{sectionsLoading ? 'Loading...' : 'Select Section'}</option>
                            {sections.map(s => (
                                <option key={s.section_id || s.id} value={s.code}>{s.section_name || s.name || s.code}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Button variant="primary" onClick={addAssignment} className="w-full">
                            ➕ Assign
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Current Assignments */}
            <Card title="👥 Current Assignments" variant="elevated">
                {assignments.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="text-gray-500 font-medium">No teachers assigned yet</p>
                        <p className="text-sm text-gray-400 mt-1">Use the form above to assign teachers to classes for day-wise attendance</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedAssignments).map(([key, group]) => (
                            <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-100 to-blue-50 px-4 py-3 flex items-center gap-3">
                                    <span className="text-xl">🏫</span>
                                    <span className="font-bold text-gray-800">
                                        {group.class_name || `Class ${group.class_number}`}
                                        {group.stream_name ? ` (${group.stream_name})` : ''}
                                        {' '} - {group.section_name || group.section}
                                    </span>
                                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                        {group.teachers.length} teacher{group.teachers.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {group.teachers.map(a => (
                                        <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {a.teacher_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{a.teacher_name}</p>
                                                    {a.employee_id && <p className="text-xs text-gray-400">{a.employee_id}</p>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeAssignment(a.id)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                title="Remove assignment"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div >
    );
};

export default AdminStudentAttendanceConfig;
