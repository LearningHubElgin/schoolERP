import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';

const TeacherStudents = () => {
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassNum, setSelectedClassNum] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAssignedClasses();
    }, []);

    const uniqueClasses = [...new Set(assignedClasses.map(c => c.class_number))].sort((a, b) => Number(a) - Number(b));

    const sectionsForClass = selectedClassNum
        ? [...new Set(assignedClasses.filter(c => String(c.class_number) === String(selectedClassNum)).map(c => c.section))].sort()
        : [];

    useEffect(() => {
        if (selectedClassNum && selectedSection) {
            fetchStudentsByClass(selectedClassNum, selectedSection);
        } else if (selectedClassNum) {
            fetchStudentsByClassOnly(selectedClassNum);
        } else if (assignedClasses.length > 0) {
            fetchAllStudents();
        }
    }, [selectedClassNum, selectedSection, assignedClasses]);

    const fetchAssignedClasses = async () => {
        try {
            const res = await fetch(`${API_URL}/api/teacher/assigned-classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAssignedClasses(data.classes || []);
                if (!data.classes || data.classes.length === 0) setLoading(false);
            } else setLoading(false);
        } catch (error) {
            console.error('Error fetching assigned classes:', error);
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        setLoading(true);
        try {
            const uniqueClassSections = Array.from(new Map(assignedClasses.map(c => [`${c.class_number}-${c.section}`, c])).values());
            const allStudents = [];
            for (const cls of uniqueClassSections) {
                const res = await fetch(`${API_URL}/api/teacher/students-by-class?classNumber=${cls.class_number}&section=${cls.section}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.students) allStudents.push(...data.students);
            }
            const uniqueStudents = Array.from(new Map(allStudents.map(s => [s.id, s])).values());
            setStudents(uniqueStudents);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsByClassOnly = async (classNumber) => {
        setLoading(true);
        try {
            const classSections = assignedClasses.filter(c => String(c.class_number) === String(classNumber));
            const uniqueClassSections = Array.from(new Map(classSections.map(c => [`${c.class_number}-${c.section}`, c])).values());
            const allStudents = [];
            for (const cls of uniqueClassSections) {
                const res = await fetch(`${API_URL}/api/teacher/students-by-class?classNumber=${cls.class_number}&section=${cls.section}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.students) allStudents.push(...data.students);
            }
            const uniqueStudents = Array.from(new Map(allStudents.map(s => [s.id, s])).values());
            setStudents(uniqueStudents);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsByClass = async (classNumber, section) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/teacher/students-by-class?classNumber=${classNumber}&section=${section}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.students) {
                const uniqueStudents = Array.from(new Map(data.students.map(s => [s.id, s])).values());
                setStudents(uniqueStudents);
            } else setStudents([]);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.roll_no || '').toString().includes(searchTerm) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone || '').includes(searchTerm)
    );

    const getTitle = () => {
        if (selectedClassNum && selectedSection) return `Class ${selectedClassNum} - Section ${selectedSection} Students`;
        if (selectedClassNum) return `Class ${selectedClassNum} - All Sections Students`;
        return 'All Assigned Students';
    };

    const downloadPDF = () => {
        const title = getTitle();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
                    h1 { text-align: center; color: #1e40af; margin-bottom: 4px; font-size: 22px; }
                    .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 18px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 12px; }
                    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <h1>📋 ${title}</h1>
                <div class="subtitle">Total Students: ${filteredStudents.length} | Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
                <table>
                    <thead><tr><th>Sl. No</th><th>Class</th><th>Section</th><th>Roll No</th><th>Student Name</th><th>Email</th><th>Phone</th></tr></thead>
                    <tbody>${filteredStudents.map((s, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${s.class || '-'}</td>
                            <td>${s.section || '-'}</td>
                            <td>${s.roll_no || '-'}</td>
                            <td>${s.name || '-'}</td>
                            <td>${s.email || '-'}</td>
                            <td>${s.phone || '-'}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
                <div class="footer">School ERP System</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 400);
    };

    const downloadExcel = () => {
        const title = getTitle();
        const headers = ['Sl. No', 'Class', 'Section', 'Roll No', 'Student Name', 'Email', 'Phone'];
        const rows = filteredStudents.map((s, i) => [i + 1, s.class || '-', s.section || '-', s.roll_no || '-', s.name || '-', s.email || '-', s.phone || '-']);
        let csv = title + '\n' + headers.join(',') + '\n';
        rows.forEach(row => { csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n'; });
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading && students.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-600">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-6 pb-6 sm:pb-8">
            {/* Header Banner - compact on full screen */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 text-white shadow-sm">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight">My Students 🎓</h1>
                        <p className="mt-0.5 text-blue-100 text-xs">View students from your assigned classes. Download lists as PDF or Excel.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                            <span className="text-blue-200 font-bold uppercase text-[10px]">Assigned Classes:</span>
                            <span className="text-sm font-bold text-white">{assignedClasses.length}</span>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                            <span className="text-blue-200 font-bold uppercase text-[10px]">Total Students:</span>
                            <span className="text-sm font-bold text-white">{assignedClasses.reduce((sum, c) => sum + (c.student_count || 0), 0)}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl"></div>
            </div>

            {/* Filters - compact single-row on desktop */}
            <Card variant="elevated" className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                        <select value={selectedClassNum} onChange={(e) => { setSelectedClassNum(e.target.value); setSelectedSection(''); }} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                            <option value="">All Classes</option>
                            {uniqueClasses.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClassNum} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50">
                            <option value="">All Sections</option>
                            {sectionsForClass.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Search</label>
                        <input type="text" placeholder="Search by name, roll no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="sm:col-span-2 flex gap-1.5 justify-end">
                        <button onClick={downloadPDF} disabled={filteredStudents.length === 0} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 disabled:opacity-50 flex-1 sm:flex-initial text-center shadow-xs">📄 PDF</button>
                        <button onClick={downloadExcel} disabled={filteredStudents.length === 0} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex-1 sm:flex-initial text-center shadow-xs">📊 Excel</button>
                    </div>
                </div>
            </Card>

            {/* Students Table - horizontally scrollable on mobile */}
            <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[700px] sm:min-w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Sl. No</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Class</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Section</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Roll No</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Student Name</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Email</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Phone</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-500">{index + 1}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3"><span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] sm:text-xs font-bold">{student.class || '-'}</span></td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3"><span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] sm:text-xs font-bold">{student.section || '-'}</span></td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700">{student.roll_no || '-'}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-slate-800">{student.name || '-'}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-500">{student.email || '-'}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-500">{student.phone || '-'}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                                            <button onClick={() => setSelectedStudent(student)} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-500 text-white rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-blue-600">👁️ View</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="px-4 py-8 sm:py-12 text-center"><div className="text-4xl mb-2">📭</div><p className="text-sm text-slate-500">No students found</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Student Detail Modal - portaled to document.body to cover topbar & full screen */}
            {selectedStudent && createPortal(
                <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setSelectedStudent(null)}>
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 rounded-t-xl text-white flex justify-between items-center">
                            <h2 className="text-base sm:text-lg font-bold">Student Details</h2>
                            <button onClick={() => setSelectedStudent(null)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold">✕</button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Photo & Name */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-blue-100 overflow-hidden flex-shrink-0 shadow-sm">
                                    {selectedStudent.photo_path ? <img src={`${API_URL}${selectedStudent.photo_path}`} alt="Student" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl bg-blue-50">👤</div>}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{selectedStudent.name}</h3>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 justify-center sm:justify-start">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] sm:text-[10px] font-bold">Class {selectedStudent.class}</span>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] sm:text-[10px] font-bold">Section {selectedStudent.section}</span>
                                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] sm:text-[10px] font-bold">Roll: {selectedStudent.roll_no}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div>
                                <h4 className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase flex items-center gap-2 border-b pb-1.5 mb-3"><span className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-100 text-sm">👤</span> Personal Information</h4>
                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <DetailItem icon="🎂" iconBg="bg-pink-200" label="Date of Birth" value={selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString('en-IN') : '-'} />
                                    <DetailItem icon="⚥" iconBg="bg-indigo-200" label="Gender" value={selectedStudent.gender || '-'} />
                                    <DetailItem icon="🩸" iconBg="bg-red-200" label="Blood Group" value={selectedStudent.blood_group || '-'} />
                                    <DetailItem icon="📧" iconBg="bg-amber-200" label="Email" value={selectedStudent.email || '-'} />
                                    <DetailItem icon="📞" iconBg="bg-blue-200" label="Student Phone" value={selectedStudent.phone || '-'} />
                                    <DetailItem icon="🆔" iconBg="bg-teal-200" label="Student ID" value={selectedStudent.student_unique_id || '-'} />
                                </div>
                                <DetailItem icon="🏠" iconBg="bg-slate-100" label="Address" value={selectedStudent.address || '-'} full />
                            </div>

                            {/* Parent */}
                            <div>
                                <h4 className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase flex items-center gap-2 border-b pb-1.5 mb-3"><span className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-100 text-sm">👨‍👩‍👧‍👦</span> Parent / Guardian</h4>
                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                     <DetailItem icon="👨" iconBg="bg-blue-50" label="Father's Name" value={selectedStudent.father_name || '-'} />
                                     <DetailItem icon="📱" iconBg="bg-blue-100" label="Father Phone" value={selectedStudent.father_phone || selectedStudent.guardian_phone || '-'} />
                                     <DetailItem icon="👩" iconBg="bg-pink-50" label="Mother's Name" value={selectedStudent.mother_name || '-'} />
                                     <DetailItem icon="📱" iconBg="bg-pink-100" label="Mother Phone" value={selectedStudent.mother_phone || selectedStudent.motherPhone || '-'} />
                                </div>
                            </div>

                            {/* Medical */}
                            <div>
                                <h4 className="text-[10px] sm:text-xs font-bold text-purple-600 uppercase flex items-center gap-2 border-b pb-1.5 mb-3"><span className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-100 text-sm">📜</span> Other Details</h4>
                                <DetailItem icon="🏥" iconBg="bg-rose-100" label="Medical Conditions" value={selectedStudent.medical_conditions || '-'} />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const DetailItem = ({ label, value, icon, iconBg = 'bg-slate-100', full }) => (
    <div className={`${full ? 'col-span-2' : ''} space-y-0.5 group`}>
        <p className="text-[9px] sm:text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md ${iconBg} text-[10px] sm:text-xs shadow-sm transition-transform group-hover:scale-110`}>{icon}</span>{label}
        </p>
        <p className="text-xs sm:text-sm text-slate-800 font-semibold bg-slate-50/50 p-1.5 sm:p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 transition-all break-words">{value || '-'}</p>
    </div>
);

export default TeacherStudents;