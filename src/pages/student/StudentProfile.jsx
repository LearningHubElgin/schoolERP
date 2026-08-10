import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const StudentProfile = () => {
    const navigate = useNavigate();
    const { setGlobalError } = useOutletContext() || {};
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudentProfile();
    }, []);

    const fetchStudentProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/student/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setStudent(data.student);
            } else {
                if (response.status === 401 || data.message?.toLowerCase().includes('token')) {
                    setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
                } else if (data.message === 'Student not found' || data.message === 'Failed to fetch profile') {
                    setGlobalError?.({ type: 'NOT_FOUND', message: 'Student profile not found. Please contact the administrator.' });
                } else {
                    setError(data.message || 'Failed to fetch profile');
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            const errMsg = 'Failed to fetch profile. Please check your connection.';
            setGlobalError?.({ type: 'LOAD_ERROR', message: errMsg });
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Local fallback removed in favor of global PortalErrorState handled by Layout context


    if (!student) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                Student profile not found
            </div>
        );
    }

    const isPassedOut = student.status === 'passed_out';

    return (
        <div className="space-y-6">
            {/* Profile Header - Gradient & Colorful */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 p-1 backdrop-blur-sm shrink-0">
                        {student.photo_path ? (
                            <img
                                src={`${API_URL}${student.photo_path}`}
                                alt={student.name}
                                className="w-full h-full rounded-full object-cover border-2 border-white ring-2 ring-white/20"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold border-2 border-white ring-2 ring-white/20">
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left w-full">
                        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start">
                            {student.name}
                            {isPassedOut && (
                                <Badge variant="success" className="ml-3 bg-purple-100 text-purple-700 border-purple-200">
                                    🎓 Passout • {student.passed_out_year}
                                </Badge>
                            )}
                        </h2>
                        <div className="text-indigo-100 mt-2 space-y-1">
                            <p className="flex items-center justify-center md:justify-start gap-2">
                                <span className="opacity-75">Roll No:</span>
                                <span className="font-semibold">{student.roll_no}</span>
                                <span className="mx-2 opacity-50">|</span>
                                <span className="opacity-75">User ID:</span>
                                <span className="font-semibold">{student.user_id || 'N/A'}</span>
                                <span className="mx-2 opacity-50">|</span>
                                <span className="opacity-75">Class:</span>
                                <span className="font-semibold">{student.class}-{student.section}</span>
                                {student.stream_name && (
                                    <>
                                        <span className="mx-2 opacity-50">|</span>
                                        <span className="opacity-75">Group:</span>
                                        <span className="font-semibold">{student.stream_name}</span>
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md border border-white/20 shadow-sm ${student.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-50'
                                : 'bg-white/10 text-white/90'
                                }`}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${student.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active'} Student
                            </span>
                            {student.blood_group && (
                                <span className="px-4 py-1.5 bg-rose-500/20 text-rose-50 border border-white/20 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md shadow-sm">
                                    🩸 {student.blood_group}
                                </span>
                            )}
                        </div>


                    </div>
                </div>
            </div>

            {/* Passout Info Card */}
            {isPassedOut && (
                <Card className="border-t-4 border-t-purple-500 bg-purple-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">🎓</div>
                        <div>
                            <h3 className="font-bold text-purple-800">Academic Archive</h3>
                            <p className="text-sm text-purple-600">
                                Passed out from Class {student.passed_out_class} in {student.passed_out_year}
                            </p>
                            <p className="text-xs text-purple-500 mt-1">
                                Your records are preserved for future reference. You can download marksheets and certificates.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Personal Information - Blue Accent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-t-4 border-t-blue-500" title={<div className="flex items-center gap-2 text-blue-700">👤 Personal Information</div>} variant="elevated">
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Gender</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {student.gender || 'Not provided'}
                            </p>
                        </div>
                        <div className="group">
                            <label className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Date of Birth</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {student.date_of_birth
                                    ? new Date(student.date_of_birth).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Email</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 break-words">{student.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Student Phone</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.student_phone || student.phone || student.user_phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Address</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.address || 'Not provided'}</p>
                        </div>
                    </div>
                </Card>

                {/* Guardian Information - Purple Accent */}
                <Card className="border-t-4 border-t-purple-500" title={<div className="flex items-center gap-2 text-purple-700">👨‍👩‍👦 Guardian Information</div>} variant="elevated">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Father's Name</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.father_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Father Phone</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.father_phone || student.fatherPhone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Mother's Name</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.mother_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Mother Phone</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.mother_phone || student.motherPhone || 'Not provided'}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Academic Information - Emerald Accent */}
            <Card className="border-t-4 border-t-emerald-500" title={<div className="flex items-center gap-2 text-emerald-700">🎓 Academic Information</div>} variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Admission Date</label>
                        <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {student.admission_date
                                ? new Date(student.admission_date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                                : 'Not available'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Current Class</label>
                        <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">Class {student.class} - Section {student.section}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Roll Number</label>
                        <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.roll_no}</p>
                    </div>
                    {student.stream_name && (
                        <div>
                            <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Group (Stream)</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.stream_name}</p>
                        </div>
                    )}
                    {student.batch_name && (
                        <div>
                            <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Batch</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.batch_name}</p>
                        </div>
                    )}
                    {student.previous_school && (
                        <div className="md:col-span-1">
                            <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Previous School</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.previous_school}</p>
                        </div>
                    )}
                    {student.previous_class && (
                        <div className="md:col-span-1">
                            <label className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Previous Class</label>
                            <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.previous_class}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Medical Information - Rose Accent */}
            {(student.blood_group || student.medical_conditions) && (
                <Card className="border-t-4 border-t-rose-500" title={<div className="flex items-center gap-2 text-rose-700">🏥 Medical Information</div>} variant="elevated">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {student.blood_group && (
                            <div>
                                <label className="text-xs font-semibold text-rose-600/70 uppercase tracking-wider">Blood Group</label>
                                <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.blood_group}</p>
                            </div>
                        )}
                        {student.medical_conditions && (
                            <div>
                                <label className="text-xs font-semibold text-rose-600/70 uppercase tracking-wider">Medical Conditions</label>
                                <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{student.medical_conditions}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default StudentProfile;