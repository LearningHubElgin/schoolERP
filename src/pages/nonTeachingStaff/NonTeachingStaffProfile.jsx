import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import { UserCircle, Mail, Phone, MapPin, Calendar, Award, Briefcase, Building } from 'lucide-react';

const NonTeachingStaffProfile = () => {
    const [loading, setLoading] = useState(false);

    const [staff, setStaff] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/staff/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStaff(data.profile);
                } else {
                    console.error(data.message || 'Failed to load profile');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not provided';
        return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading || !staff) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading live profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative z-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 p-1 backdrop-blur-sm shrink-0">
                        {staff.photo ? (
                            <img
                                src={`${API_URL}${staff.photo}`}
                                alt={staff.name}
                                className="w-full h-full rounded-full object-cover border-2 border-white ring-2 ring-white/20"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold border-2 border-white ring-2 ring-white/20">
                                {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left w-full">
                        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">{staff.name}</h2>
                        <div className="text-teal-100 mt-2 space-y-1">
                            <p className="flex items-center justify-center md:justify-start gap-2">
                                <span className="opacity-75">ID:</span>
                                <span className="font-semibold">{staff.employee_id}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md border border-white/20 shadow-sm ${staff.status === 'active' ? 'bg-emerald-500/20 text-emerald-50' : 'bg-white/10 text-white/90'}`}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${staff.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                {staff.status === 'active' ? 'Active' : 'Inactive'} Staff
                            </span>
                            <span className="px-4 py-1.5 bg-white/10 text-white border border-white/20 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md shadow-sm">
                                <Briefcase className="w-3 h-3 inline mr-1" /> {staff.designation}
                            </span>
                            {staff.blood_group && (
                                <span className="px-4 py-1.5 bg-rose-500/20 text-rose-50 border border-white/20 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md shadow-sm">
                                    🩸 {staff.blood_group}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-teal-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <Card className="border-t-4 border-t-blue-500" title={<div className="flex items-center gap-2 text-blue-700"><UserCircle className="w-5 h-5" /> Personal Information</div>} variant="elevated">
                    <div className="space-y-4">
                        <InfoRow icon={<UserCircle className="w-4 h-4 text-blue-500" />} label="Full Name" value={staff.name} color="blue" />
                        <InfoRow icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Date of Birth" value={formatDate(staff.dob)} color="blue" />
                        <InfoRow icon={<UserCircle className="w-4 h-4 text-blue-500" />} label="Gender" value={staff.gender} color="blue" />
                        <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email" value={staff.email} color="blue" />
                        <InfoRow icon={<Phone className="w-4 h-4 text-blue-500" />} label="Phone" value={staff.phone} color="blue" />
                        <InfoRow icon={<MapPin className="w-4 h-4 text-blue-500" />} label="Address" value={staff.address} color="blue" />
                    </div>
                </Card>

                {/* Professional Info */}
                <Card className="border-t-4 border-t-purple-500" title={<div className="flex items-center gap-2 text-purple-700"><Briefcase className="w-5 h-5" /> Professional Information</div>} variant="elevated">
                    <div className="space-y-4">
                        <InfoRow icon={<Briefcase className="w-4 h-4 text-purple-500" />} label="Employee ID" value={staff.employee_id} color="purple" />
                        <InfoRow icon={<Award className="w-4 h-4 text-purple-500" />} label="Designation" value={staff.designation} color="purple" />
                        <InfoRow icon={<Calendar className="w-4 h-4 text-purple-500" />} label="Joining Date" value={formatDate(staff.joining_date)} color="purple" />
                    </div>
                </Card>
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value, color = 'blue' }) => (
    <div className="group">
        <label className={`text-xs font-semibold text-${color}-600/70 uppercase tracking-wider flex items-center gap-1.5`}>
            {icon} {label}
        </label>
        <p className="text-gray-900 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
            {value || 'Not provided'}
        </p>
    </div>
);

export default NonTeachingStaffProfile;
