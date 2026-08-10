import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const TeacherPermissions = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [addedStudents, setAddedStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allClasses, setAllClasses] = useState([]);
    const [allStreams, setAllStreams] = useState([]);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [classUpdating, setClassUpdating] = useState(null);

    useEffect(() => {
        fetchTeachers();
        fetchAllClasses();
        fetchAllStreams();
    }, []);

    const fetchAllClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const sorted = data.classes.sort((a, b) => 
                    String(a.class_number).localeCompare(String(b.class_number), undefined, { numeric: true })
                );
                setAllClasses(sorted);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchAllStreams = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/streams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAllStreams(data.streams);
            }
        } catch (error) {
            console.error('Error fetching streams:', error);
        }
    };

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const normalized = data.teachers.map(t => {
                    let managed = t.managed_classes;
                    if (typeof managed === 'string') {
                        try { managed = JSON.parse(managed); } catch (e) { managed = null; }
                    }
                    let managedStr = t.managed_streams;
                    if (typeof managedStr === 'string') {
                        try { managedStr = JSON.parse(managedStr); } catch (e) { managedStr = null; }
                    }
                    return { ...t, managed_classes: managed, managed_streams: managedStr };
                });
                setTeachers(normalized);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (teacherId, currentStatus) => {
        setUpdating(teacherId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ can_manage_students: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                setTeachers(teachers.map(t => t.id === teacherId ? { ...t, can_manage_students: !currentStatus } : t));
            } else {
                alert(data.message || 'Failed to update permission');
            }
        } catch (error) {
            console.error('Error updating permission:', error);
            alert('Server error');
        } finally {
            setUpdating(null);
        }
    };

    const updateManagedClasses = async (teacherId, managedClasses, managedStreams) => {
        setClassUpdating(teacherId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    managed_classes: managedClasses,
                    managed_streams: managedStreams 
                })
            });
            const data = await response.json();
            if (data.success) {
                setTeachers(teachers.map(t => t.id === teacherId ? { 
                    ...t, 
                    managed_classes: managedClasses,
                    managed_streams: managedStreams 
                } : t));
                setIsClassModalOpen(false);
            } else {
                alert(data.message || 'Failed to update permissions');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert('Server error');
        } finally {
            setClassUpdating(null);
        }
    };

    const handleClassToggle = (classNum) => {
        const currentClasses = selectedTeacher?.managed_classes || [];
        if (classNum === 'all') {
            updateManagedClasses(selectedTeacher.id, ['all'], null);
            return;
        }

        let newClasses;
        if (currentClasses.includes('all')) {
            newClasses = [classNum];
        } else if (currentClasses.includes(classNum)) {
            newClasses = currentClasses.filter(c => c !== classNum);
        } else {
            newClasses = [...currentClasses, classNum];
        }
        
        if (newClasses.length === 0) newClasses = null; 
        setSelectedTeacher({ ...selectedTeacher, managed_classes: newClasses });
    };

    const handleStreamToggle = (streamId) => {
        const currentStreams = selectedTeacher?.managed_streams || [];
        let newStreams;
        if (currentStreams.includes(streamId)) {
            newStreams = currentStreams.filter(id => id !== streamId);
        } else {
            newStreams = [...currentStreams, streamId];
        }
        setSelectedTeacher({ ...selectedTeacher, managed_streams: newStreams });
    };

    const fetchAddedStudents = async (teacher) => {
        setSelectedTeacher(teacher);
        setLoadingStudents(true);
        setIsModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/teacher-added-students/${teacher.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAddedStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching added students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const columns = [
        { header: 'Employee ID', accessor: 'employee_id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Subject', accessor: 'subject' },
        {
            header: 'Allowed Classes',
            render: (teacher) => (
                <div className="flex flex-row flex-nowrap items-center gap-1.5">
                    <div className="flex flex-wrap gap-1 items-center max-w-[120px] md:max-w-[200px]">
                        {!teacher.managed_classes || teacher.managed_classes.includes('all') ? (
                            <Badge variant="primary" className="!text-[9px] md:!text-xs !px-1.5 !py-0.5">All Classes</Badge>
                        ) : (
                            teacher.managed_classes.map(c => (
                                <Badge key={c} variant="secondary" className="!text-[9px] md:text-[10px] !px-1 md:!px-1.5 !py-0 whitespace-nowrap">Class {c}</Badge>
                            ))
                        )}
                    </div>
                    {teacher.can_manage_students && (
                        <button 
                            onClick={() => {
                                setSelectedTeacher(teacher);
                                setIsClassModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-1 flex-shrink-0"
                            title="Edit Allowed Classes"
                        >
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                    )}
                </div>
            )
        },
        { 
            header: 'Students Added', 
            render: (teacher) => (
                <button 
                    onClick={() => fetchAddedStudents(teacher)}
                    className="flex items-center gap-1.5 md:gap-2 text-indigo-600 hover:text-indigo-800 font-bold md:font-semibold transition-colors group"
                >
                    <span className="bg-indigo-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg group-hover:bg-indigo-100 min-w-[1.5rem] md:min-w-[2rem] text-center text-[10px] md:text-sm">
                        {teacher.students_added_count || 0}
                    </span>
                    <span className="text-[9px] md:text-xs uppercase tracking-wider opacity-60 group-hover:opacity-100">View</span>
                </button>
            )
        },
        { 
            header: 'Student Management', 
            render: (teacher) => (
                <div className="flex items-center gap-1.5 md:gap-3">
                    <Badge variant={teacher.can_manage_students ? 'success' : 'secondary'} className="!text-[8px] md:!text-xs !px-1.5 !py-0.5 md:!px-2 md:!py-1 whitespace-nowrap">
                        {teacher.can_manage_students ? 'Authorized' : 'Not Authorized'}
                    </Badge>
                    <button
                        onClick={() => togglePermission(teacher.id, teacher.can_manage_students)}
                        disabled={updating === teacher.id}
                        className={`
                            relative inline-flex h-4 w-8 md:h-6 md:w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0
                            ${teacher.can_manage_students ? 'bg-indigo-600' : 'bg-gray-200'}
                            ${updating === teacher.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform
                                ${teacher.can_manage_students ? 'translate-x-[18px] md:translate-x-6' : 'translate-x-[2px] md:translate-x-1'}
                            `}
                        />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-2 md:p-6 space-y-3 md:space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-800 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">🔑 Teacher Student Management Permissions</h1>
                    <p className="mt-1 text-violet-100 text-xs md:text-sm">Manage which teachers are authorized to manage student records</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-violet-500 opacity-20 blur-3xl"></div>
            </div>

            <Card variant="flat" className="overflow-hidden border-slate-200">
                <Table 
                    columns={columns} 
                    data={teachers} 
                    loading={loading}
                />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Students added by ${selectedTeacher?.name}`}
                size="xl"
            >
                <div className="space-y-4">
                    {loadingStudents ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : addedStudents.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg md:rounded-xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[9px] md:text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Student ID</th>
                                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[9px] md:text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Name</th>
                                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[9px] md:text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Class/Sec</th>
                                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[9px] md:text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Roll No</th>
                                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[9px] md:text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Added Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {addedStudents.map((student, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-[10px] md:text-sm font-medium text-indigo-600">{student.student_unique_id}</td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-[10px] md:text-sm text-slate-800">{student.student_name}</td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-[10px] md:text-sm text-slate-600">{student.class}-{student.section}</td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-[10px] md:text-sm text-slate-600">{student.roll_no}</td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-[10px] md:text-sm text-slate-500">
                                                {new Date(student.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500 italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            No students have been added by this teacher yet.
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                </div>
            </Modal>

            <Modal
                isOpen={isClassModalOpen}
                onClose={() => setIsClassModalOpen(false)}
                title={`Manage Allowed Classes for ${selectedTeacher?.name}`}
                size="md"
            >
                <div className="space-y-4 md:space-y-6">
                    <p className="text-[10px] md:text-sm text-slate-500">
                        Select which classes this teacher is authorized to manage students for.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                        <button
                            onClick={() => handleClassToggle('all')}
                            className={`
                                p-2 md:p-3 rounded-lg md:rounded-xl border-2 transition-all text-[11px] md:text-sm font-bold md:font-semibold
                                ${(!selectedTeacher?.managed_classes || selectedTeacher?.managed_classes.includes('all'))
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'}
                            `}
                        >
                            All Classes
                        </button>
                        
                        {allClasses.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => handleClassToggle(String(cls.class_number))}
                                className={`
                                    p-2 md:p-3 rounded-lg md:rounded-xl border-2 transition-all text-[11px] md:text-sm font-bold md:font-semibold
                                    ${(selectedTeacher?.managed_classes?.includes(String(cls.class_number)) && !selectedTeacher?.managed_classes?.includes('all'))
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600'}
                                `}
                            >
                                Class {cls.class_number}
                            </button>
                        ))}
                    </div>

                    {(selectedTeacher?.managed_classes?.includes('11') || selectedTeacher?.managed_classes?.includes('12')) && !selectedTeacher?.managed_classes?.includes('all') && (
                        <div className="pt-2 md:pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-[11px] md:text-sm font-bold text-slate-700 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                                <span className="bg-indigo-100 text-indigo-700 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[9px] md:text-[10px]">!</span>
                                Select Allowed Streams (for Class 11/12)
                            </h4>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {allStreams.map(stream => (
                                    <button
                                        key={stream.id}
                                        onClick={() => handleStreamToggle(stream.id)}
                                        className={`
                                            px-2.5 py-1.5 md:px-4 md:py-2 rounded-full border-2 transition-all text-[9px] md:text-xs font-bold md:font-semibold
                                            ${selectedTeacher?.managed_streams?.includes(stream.id)
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-100 hover:border-slate-200 text-slate-500'}
                                        `}
                                    >
                                        {stream.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-2 md:pt-4 flex gap-2 md:gap-3 justify-end border-t border-slate-100">
                        <Button variant="ghost" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
                        <Button 
                            loading={classUpdating === selectedTeacher?.id}
                            onClick={() => updateManagedClasses(selectedTeacher.id, selectedTeacher.managed_classes, selectedTeacher.managed_streams)}
                        >
                            Save Permissions
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeacherPermissions;
