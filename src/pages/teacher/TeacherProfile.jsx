import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const TeacherProfile = () => {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchTeacherProfile();
    }, []);

    const fetchTeacherProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTeacher(data.teacher);
            } else {
                setError(data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to fetch profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        
        if (!passwordData.currentPassword) {
            setPasswordError('Current password is required');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setPasswordSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Password changed successfully!');
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (err) {
            console.error('Password change error:', err);
            setPasswordError('Server error. Please try again.');
        } finally {
            setPasswordSubmitting(false);
        }
    };

    const openPasswordModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPasswordModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                Teacher profile not found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-md">
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 p-1 backdrop-blur-sm shrink-0">
                        {teacher.photo_path ? (
                            <img
                                src={`${API_URL}${teacher.photo_path}`}
                                alt={teacher.name}
                                className="w-full h-full rounded-full object-cover border-2 border-white ring-1 ring-white/20"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-2 border-white ring-1 ring-white/20">
                                {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left w-full">
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{teacher.name}</h2>
                        <div className="text-indigo-100 mt-1 space-y-1 text-xs">
                            <p className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className="opacity-75">Employee ID:</span>
                                <span className="font-semibold">{teacher.employee_id}</span>
                                <span className="mx-2 opacity-50 hidden md:inline">|</span>
                                <span className="opacity-75">Subject:</span>
                                <span className="font-semibold">{teacher.subject || 'General'}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold backdrop-blur-md border border-white/20 shadow-sm ${teacher.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-50'
                                : 'bg-white/10 text-white/90'
                                }`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${teacher.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                {teacher.status ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1) : 'Active'} Teacher
                            </span>
                            {teacher.experience && (
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-50 border border-white/20 rounded-lg text-[10px] md:text-xs font-bold backdrop-blur-md shadow-sm">
                                    📅 {teacher.experience} years exp.
                                </span>
                            )}
                            <button
                                onClick={openPasswordModal}
                                type="button"
                                className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-bold border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-10 -mb-10 w-32 h-32 rounded-full bg-purple-400 opacity-20 blur-2xl pointer-events-none"></div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-t-[3px] border-t-blue-500 border border-gray-200 shadow-sm !p-4" title={<div className="flex items-center gap-2 text-blue-700 text-sm font-bold">👤 Personal Information</div>} variant="elevated">
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Full Name</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.name || '—'}</p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Date of Birth</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">
                                {teacher.date_of_birth
                                    ? new Date(teacher.date_of_birth).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Gender</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.gender || '—'}</p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Address</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.address || '—'}</p>
                        </div>
                    </div>
                </Card>

                {/* Professional Information */}
                <Card className="border-t-[3px] border-t-purple-500 border border-gray-200 shadow-sm !p-4" title={<div className="flex items-center gap-2 text-purple-700 text-sm font-bold">💼 Professional Information</div>} variant="elevated">
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-purple-600">Subject Specialization</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.subject || '—'}</p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-purple-600">Qualification</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.qualification || '—'}</p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-purple-600">Experience</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.experience ? `${teacher.experience} years` : '—'}</p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-purple-600">Joining Date</label>
                            <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">
                                {teacher.joining_date
                                    ? new Date(teacher.joining_date).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Contact Information */}
            <Card className="border-t-[3px] border-t-emerald-500 border border-gray-200 shadow-sm !p-4" title={<div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">📞 Contact Information</div>} variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Email Address</label>
                        <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200 break-words">{teacher.email || '—'}</p>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Phone Number</label>
                        <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.phone || '—'}</p>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Emergency Contact</label>
                        <p className="text-gray-800 mt-0.5 text-xs font-semibold bg-slate-50 p-1.5 rounded-md border border-gray-200">{teacher.emergency_contact || '—'}</p>
                    </div>
                </div>
            </Card>

            {/* Assigned Classes */}
            {teacher.classes && teacher.classes.length > 0 && (
                <Card className="border-t-[3px] border-t-rose-500 border border-gray-200 shadow-sm !p-4" title={<div className="flex items-center gap-2 text-rose-700 text-sm font-bold">🏫 Assigned Classes</div>} variant="elevated">
                    <div className="flex flex-wrap gap-2">
                        {teacher.classes.map((cls, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-md text-[11px] font-bold border border-rose-200 shadow-sm">
                                Class {cls}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Change Password Modal - portaled to document.body */}
            {showPasswordModal && createPortal(
                <div 
                    className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto border border-slate-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                aria-label="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    autoComplete="off"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            {passwordError && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                                    {passwordError}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordSubmitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium shadow-sm"
                                >
                                    {passwordSubmitting ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default TeacherProfile;