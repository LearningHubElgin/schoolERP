import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const AdminElectiveGroups = () => {
    const [electiveGroups, setElectiveGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupStudents, setGroupStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Filters
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Student management modal
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [allClassStudents, setAllClassStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [managingGroup, setManagingGroup] = useState(null);
    const [savingStudents, setSavingStudents] = useState(false);

    useEffect(() => {
        fetchClasses();
        fetchElectiveGroups();
    }, []);

    useEffect(() => {
        fetchElectiveGroups();
    }, [filterClass, filterSection]);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const sorted = (data.classes || []).sort((a, b) => {
                    const aNum = parseInt(a.class_number);
                    const bNum = parseInt(b.class_number);
                    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                    if (!isNaN(aNum)) return -1;
                    if (!isNaN(bNum)) return 1;
                    return String(a.class_number).localeCompare(String(b.class_number));
                });
                setClasses(sorted);
            }
        } catch (err) { console.error(err); }
    };

    const fetchSections = async (classId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/class-sections/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSections(data.sections || []);
        } catch (err) { console.error(err); }
    };

    const fetchElectiveGroups = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/admin/elective-groups`;
            const params = [];
            if (filterClass) params.push(`class_number=${filterClass}`);
            if (filterSection) params.push(`section=${filterSection}`);
            if (params.length) url += '?' + params.join('&');

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setElectiveGroups(data.groups || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const fetchGroupStudents = async (group) => {
        setSelectedGroup(group);
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/elective-group-students?class_number=${group.class_number}&section=${group.section}&subject_id=${group.subject_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setGroupStudents(data.students || []);
        } catch (err) { console.error(err); }
        setLoadingStudents(false);
    };

    const openManageStudents = async (group) => {
        setManagingGroup(group);
        setShowStudentModal(true);
        setLoadingStudents(true);

        try {
            const token = localStorage.getItem('token');

            // Fetch all students of this class-section
            const allRes = await fetch(`${API_URL}/api/admin/class-students?class_number=${group.class_number}&section=${group.section}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = await allRes.json();
            if (allData.success) setAllClassStudents(allData.students || []);

            // Fetch currently enrolled students
            const enrolledRes = await fetch(`${API_URL}/api/admin/elective-subject-students?class_number=${group.class_number}&section=${group.section}&subject_id=${group.subject_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const enrolledData = await enrolledRes.json();
            if (enrolledData.success) setSelectedStudentIds(enrolledData.studentIds || []);
        } catch (err) { console.error(err); }
        setLoadingStudents(false);
    };

    const handleSaveStudents = async () => {
        if (!managingGroup) return;
        setSavingStudents(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/elective-group-students`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    classNumber: managingGroup.class_number,
                    section: managingGroup.section,
                    subjectId: managingGroup.subject_id,
                    studentIds: selectedStudentIds
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('✅ Students updated successfully!');
                setShowStudentModal(false);
                fetchElectiveGroups();
                if (selectedGroup && selectedGroup.subject_id === managingGroup.subject_id) {
                    fetchGroupStudents(selectedGroup);
                }
            } else {
                alert('❌ Error: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('❌ Network error');
        }
        setSavingStudents(false);
    };

    const toggleStudent = (studentId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleRemoveStudent = async (group, studentId) => {
        if (!confirm('Remove this student from the elective?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/elective-group-student`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    classNumber: group.class_number,
                    section: group.section,
                    subjectId: group.subject_id,
                    studentId: studentId
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchGroupStudents(group);
                fetchElectiveGroups();
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-800 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                        🎯 Elective Group Management
                    </h1>
                    <p className="mt-1 text-violet-100 text-xs md:text-sm">Manage elective subjects, assigned students, and class mappings</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-violet-500 opacity-20 blur-3xl"></div>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                        <select
                            value={filterClass}
                            onChange={(e) => {
                                const classNum = e.target.value;
                                setFilterClass(classNum);
                                setFilterSection('');
                                if (classNum) {
                                    const cls = classes.find(c => String(c.class_number) === classNum);
                                    if (cls) fetchSections(cls.id);
                                } else {
                                    setSections([]);
                                }
                            }}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.class_number}>Class {c.class_number}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                            disabled={!filterClass}
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => (
                                <option key={s.section_id || s.id} value={s.code}>{s.section_name || s.code}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => { setFilterClass(''); setFilterSection(''); setSections([]); }}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Group List */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            📋 Elective Groups
                            <span className="text-sm font-normal text-slate-400">({electiveGroups.length} found)</span>
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                            </div>
                        ) : electiveGroups.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <div className="text-4xl mb-3">🎯</div>
                                <p className="font-semibold">No elective groups found</p>
                                <p className="text-sm mt-1">Assign elective subjects from the Teacher Timetable page</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {electiveGroups.map((group, idx) => (
                                    <div
                                        key={idx}
                                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                                            selectedGroup?.subject_id === group.subject_id &&
                                            selectedGroup?.class_number === group.class_number &&
                                            selectedGroup?.section === group.section
                                                ? 'border-violet-400 bg-violet-50 shadow-md'
                                                : 'border-slate-200 hover:border-violet-300'
                                        }`}
                                        onClick={() => fetchGroupStudents(group)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 text-lg font-bold">
                                                    🎯
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{group.subject_name}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-0.5 rounded border border-violet-200">
                                                            Class {group.class_number}-{group.section}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                            {group.teacher_name || 'No teacher'}
                                                        </span>
                                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                            {group.student_count} students
                                                        </span>
                                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                            {group.slot_count} slots
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openManageStudents(group); }}
                                                className="px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-lg transition-colors border border-violet-200"
                                            >
                                                ✏️ Manage Students
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Student Details Panel */}
                <div>
                    <Card>
                        {selectedGroup ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        👥 Enrolled Students
                                    </h2>
                                    <span className="text-sm font-bold text-violet-600 bg-violet-100 px-2.5 py-1 rounded-lg">
                                        {groupStudents.length} students
                                    </span>
                                </div>
                                <div className="mb-3 pb-3 border-b border-slate-200">
                                    <p className="font-bold text-violet-700">{selectedGroup.subject_name}</p>
                                    <p className="text-sm text-slate-500">Class {selectedGroup.class_number}-{selectedGroup.section}</p>
                                </div>

                                {loadingStudents ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                                    </div>
                                ) : groupStudents.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <p className="text-sm">No students enrolled yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        {groupStudents.map((student, i) => (
                                            <div key={student.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-violet-300 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{student.student_name}</p>
                                                        <p className="text-xs text-slate-400">Roll: {student.roll_no}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveStudent(selectedGroup, student.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                    title="Remove student"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <div className="text-3xl mb-3">👈</div>
                                <p className="font-semibold">Select an elective group</p>
                                <p className="text-sm mt-1">Click on a group to see enrolled students</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Manage Students Modal */}
            {showStudentModal && managingGroup && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowStudentModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-violet-50 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-slate-800">Manage Students</h3>
                                <p className="text-sm text-violet-600 font-semibold">{managingGroup.subject_name} — Class {managingGroup.class_number}-{managingGroup.section}</p>
                            </div>
                            <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                        </div>

                        {/* Controls */}
                        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <span className="text-sm font-bold text-slate-600">
                                👥 Select Students <span className="text-violet-600">{selectedStudentIds.length}/{allClassStudents.length}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedStudentIds(allClassStudents.map(s => s.id))}
                                    className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={() => setSelectedStudentIds([])}
                                    className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="flex-1 overflow-y-auto px-6 py-3">
                            {loadingStudents ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                                </div>
                            ) : allClassStudents.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No students in this class-section</p>
                            ) : (
                                <div className="space-y-1">
                                    {allClassStudents.map(student => (
                                        <label
                                            key={student.id}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                                                selectedStudentIds.includes(student.id)
                                                    ? 'bg-violet-50 border-violet-300'
                                                    : 'bg-white border-slate-200 hover:border-violet-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => toggleStudent(student.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">{student.student_name}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">Roll {student.roll_no}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowStudentModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStudents}
                                disabled={savingStudents}
                                className="px-5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {savingStudents ? (
                                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Saving...</>
                                ) : (
                                    '💾 Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminElectiveGroups;
