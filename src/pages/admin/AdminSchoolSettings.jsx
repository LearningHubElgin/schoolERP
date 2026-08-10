import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const AdminSchoolSettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [settings, setSettings] = useState({
        latitude: '',
        longitude: '',
        radius: '500',
        half_day_hours: '4',
        full_day_hours: '6',
        principal_signature: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        address: ''
    });

    // School Days Calendar states
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [savingDays, setSavingDays] = useState(false);
    const [school, setSchool] = useState(null);

    useEffect(() => {
        fetchSettings();
        fetchWeeklySchedule();
    }, []);

    const fetchWeeklySchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/school-weekly-schedule`, {
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

    const toggleWeeklySchedule = (dayOfWeek, isWorking) => {
        setWeeklySchedule(prev => {
            const exists = prev.find(s => s.day_of_week === dayOfWeek);
            if (exists) {
                return prev.map(s => s.day_of_week === dayOfWeek ? { ...s, is_working: isWorking } : s);
            } else {
                return [...prev, { day_of_week: dayOfWeek, is_working: isWorking }];
            }
        });
    };

    const saveWeeklySchedule = async () => {
        setSavingDays(true);
        const loadingToast = toast.loading('Saving schedule...');
        try {
            const token = localStorage.getItem('token');
            const fullSchedule = [0,1,2,3,4,5,6].map(index => {
                const scheduleItem = weeklySchedule.find(s => s.day_of_week === index);
                return {
                    day_of_week: index,
                    is_working: scheduleItem ? scheduleItem.is_working : (index !== 0)
                };
            });
            const res = await fetch(`${API_BASE}/api/admin/school-weekly-schedule`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ schedule: fullSchedule })
            });
            const data = await res.json();
            toast.dismiss(loadingToast);
            if (data.success) {
                toast.success('School Days Calendar updated successfully!');
                fetchWeeklySchedule();
            } else {
                toast.error(data.message || 'Failed to update schedule');
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            console.error('Update schedule error:', err);
            toast.error('Server error updating schedule');
        } finally {
            setSavingDays(false);
        }
    };


    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/settings/attendance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setSettings({
                    latitude: data.settings.school_latitude || '',
                    longitude: data.settings.school_longitude || '',
                    radius: data.settings.attendance_radius || '500',
                    half_day_hours: data.settings.min_hours_half_day || '4',
                    full_day_hours: data.settings.min_hours_full_day || '6',
                    principal_signature: data.settings.principal_signature || '',
                    phone: data.school?.phone || '',
                    email: data.school?.email || '',
                    city: data.school?.city || '',
                    state: data.school?.state || '',
                    address: data.school?.address || ''
                });
                if (data.school) {
                    setSchool(data.school);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignatureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, JPG, etc.)');
            return;
        }

        const formDataObj = new FormData();
        formDataObj.append('signature', file);

        setUploading(true);
        const loadingToast = toast.loading('Uploading signature...');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/signature`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataObj
            });
            const data = await res.json();
            toast.dismiss(loadingToast);
            if (data.success) {
                toast.success('Signature uploaded successfully!');
                fetchSettings();
            } else {
                toast.error(data.message || 'Upload failed. Check file size/format.');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Signature upload error:', error);
            toast.error('Failed to upload signature. Server connection error.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveSignature = async () => {
        if (!window.confirm('Are you sure you want to remove the principal signature? This will remove it from all ID cards.')) {
            return;
        }

        const loadingToast = toast.loading('Removing signature...');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/signature`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            toast.dismiss(loadingToast);
            if (data.success) {
                toast.success('Signature removed successfully');
                setSettings(prev => ({ ...prev, principal_signature: '' }));
            } else {
                toast.error(data.message || 'Failed to remove signature');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Remove signature error:', error);
            toast.error('Server error');
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        toast.loading('Fetching location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                toast.dismiss();
                setSettings(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                toast.success('Location fetched!');
            },
            (error) => {
                toast.dismiss();
                toast.error('Unable to retrieve location');
                console.error(error);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/settings/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Settings updated successfully');
                fetchSettings();
            } else {
                toast.error(data.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Server error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 pb-8">

            {/* ── Header Banner (mirrors FeeManagement) ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">School settings 🏫</h1>
                        <p className="mt-1 text-teal-100 text-xs md:text-sm">
                            Configure geofencing, attendance thresholds, and principal signature.
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-teal-400 opacity-20 blur-3xl"></div>
            </div>

            {/* School Directory Details Table Row */}
            {school && (
                <div className="space-y-3">
                    <div className="block">
                        <h2 className="text-xs font-semibold text-slate-400 mb-2 ml-1">Branch directory status</h2>
                    </div>
                    
                    {/* Tabular Header (Visible only on Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/75 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 mb-3">
                        <div className="col-span-1">Code</div>
                        <div className="col-span-3">Institution name</div>
                        <div className="col-span-1 text-center">Board</div>
                        <div className="col-span-3">Primary email / phone</div>
                        <div className="col-span-1 text-center">Plan details</div>
                        <div className="col-span-1 text-center">License expiry</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-right">Details</div>
                    </div>

                    {/* School Tabular Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-white items-center rounded-xl border border-slate-200 shadow-sm">
                        {/* 1. Code */}
                        <div className="col-span-1 font-semibold text-slate-700 text-sm">
                            {school.code}
                        </div>

                        {/* 2. Institution Name with Logo */}
                        <div className="col-span-3 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                                {school.logo ? (
                                    <img 
                                        src={`${API_BASE}${school.logo}`} 
                                        alt="School Logo" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            if (!e.target.src.startsWith('http')) {
                                                e.target.src = school.logo; 
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-lg">🏫</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-800 leading-snug truncate">{school.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    {school.city || school.state 
                                        ? `${school.city || ''}${school.city && school.state ? ', ' : ''}${school.state || ''}`
                                        : 'Location Unspecified'}
                                </p>
                            </div>
                        </div>

                        {/* 3. Board */}
                        <div className="col-span-1 text-center text-sm font-semibold text-slate-600">
                            {school.board || 'N/A'}
                        </div>

                        {/* 4. Primary Email / Phone */}
                        <div className="col-span-3 min-w-0 text-xs text-slate-600">
                            <p className="font-semibold text-slate-700 truncate">{school.email}</p>
                            <p className="text-slate-400 mt-0.5 truncate">{school.phone || 'No Phone'}</p>
                        </div>

                        {/* 5. Plan Details */}
                        <div className="col-span-1 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                (school.subscription_plan || 'basic').toLowerCase() === 'premium' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                (school.subscription_plan || 'basic').toLowerCase() === 'standard' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                (school.subscription_plan || 'basic').toLowerCase() === 'basic' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}>
                                {school.subscription_plan ? school.subscription_plan.charAt(0).toUpperCase() + school.subscription_plan.slice(1).toLowerCase() : 'Basic'}
                            </span>
                        </div>

                        {/* 6. License Expiry */}
                        <div className="col-span-1 text-center text-xs text-slate-600 font-medium">
                            {school.subscription_end ? (
                                new Date(school.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            ) : (
                                <span className="text-slate-500 font-medium">Lifetime license</span>
                            )}
                        </div>

                        {/* 7. Status */}
                        <div className="col-span-1 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                school.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {school.status ? school.status.charAt(0).toUpperCase() + school.status.slice(1).toLowerCase() : 'Active'}
                            </span>
                        </div>

                        {/* 8. Active Label */}
                        <div className="col-span-1 text-right">
                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                                Current branch
                            </span>
                        </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="md:hidden p-5 space-y-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">Branch code: {school.code}</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                school.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {school.status ? school.status.charAt(0).toUpperCase() + school.status.slice(1).toLowerCase() : 'Active'}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                                {school.logo ? (
                                    <img 
                                        src={`${API_BASE}${school.logo}`} 
                                        alt="School Logo" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            if (!e.target.src.startsWith('http')) {
                                                e.target.src = school.logo; 
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-lg">🏫</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-800 leading-snug">{school.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {school.city || school.state 
                                        ? `${school.city || ''}${school.city && school.state ? ', ' : ''}${school.state || ''}`
                                        : 'Location Unspecified'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-400">Affiliation board</span>
                                <span className="font-semibold text-slate-700 mt-0.5 block">{school.board || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-400">Plan details</span>
                                <span className="font-semibold text-slate-700 mt-0.5 block capitalize">{school.subscription_plan || 'Basic'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-[10px] font-semibold text-slate-400">Contact details</span>
                                <span className="font-semibold text-slate-700 mt-0.5 block truncate">{school.email}</span>
                                <span className="text-slate-400 mt-0.5 block">{school.phone || 'No Phone'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-[10px] font-semibold text-slate-400">License expiry</span>
                                <span className="font-semibold text-slate-700 mt-0.5 block">
                                    {school.subscription_end ? (
                                        new Date(school.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                    ) : (
                                        'Lifetime license'
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── School Contact & Location Card ── */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                        School contact & location details
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 ml-4">View and update official contact details and location address of your school branch</p>
                </div>

                <div className="p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* School Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                School email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="school@example.com"
                                required
                            />
                        </div>

                        {/* School Mobile Number */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Mobile / phone number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. +91 9876543210"
                                required
                            />
                        </div>

                        {/* Street Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Street address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. 123 Education Lane"
                                required
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.city}
                                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. Kolkata"
                                required
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.state}
                                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. West Bengal"
                                required
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Attendance Geofencing Card ── */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-6 bg-teal-600 rounded-full"></span>
                            Attendance geofencing
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 ml-4">Set the school's GPS coordinates and allowed check-in radius</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={getCurrentLocation}
                        className="border-slate-300 hover:border-teal-300 hover:text-teal-600 font-semibold"
                    >
                        🗺️ Detect Location
                    </Button>
                </div>

                <div className="p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Latitude */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Latitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={settings.latitude}
                                onChange={(e) => setSettings({ ...settings, latitude: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. 22.5726"
                                required
                            />
                        </div>

                        {/* Longitude */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Longitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={settings.longitude}
                                onChange={(e) => setSettings({ ...settings, longitude: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. 88.3639"
                                required
                            />
                        </div>

                        {/* Radius */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Allowed radius (meters) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={settings.radius}
                                onChange={(e) => setSettings({ ...settings, radius: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-slate-800 text-sm"
                                placeholder="e.g. 500"
                                required
                            />
                            <p className="text-[10px] text-slate-400 font-medium ml-1 mt-1 italic">
                                * Teachers must be within this distance from school to mark attendance.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Working Hour Thresholds Card ── */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                        Working hour thresholds
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 ml-4">Minimum hours required to count as half-day or full-day attendance</p>
                </div>

                <div className="p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Half Day */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Half day (hours)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={settings.half_day_hours || ''}
                                onChange={(e) => setSettings({ ...settings, half_day_hours: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="4.0"
                                required
                            />
                            <p className="text-[10px] text-slate-400 font-medium ml-1 mt-1">Minimum for 0.5 Day</p>
                        </div>

                        {/* Full Day */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                                Full day (hours)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={settings.full_day_hours || ''}
                                onChange={(e) => setSettings({ ...settings, full_day_hours: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 text-sm"
                                placeholder="6.0"
                                required
                            />
                            <p className="text-[10px] text-slate-400 font-medium ml-1 mt-1">Minimum for 1.0 Day</p>
                        </div>
                    </div>

                    {/* Summary pills */}
                    <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-wrap gap-4 items-center justify-between">
                        <div>
                            <span className="block text-xs font-semibold text-indigo-600">Threshold summary</span>
                            <span className="text-xs text-indigo-400">Current attendance counting rules</span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <span className="px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 shadow-sm">
                                ½ Day ≥ {settings.half_day_hours || '–'} hrs
                            </span>
                            <span className="px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 shadow-sm">
                                Full Day ≥ {settings.full_day_hours || '–'} hrs
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── School Days Calendar Card (Moved from Timetable) ── */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-5 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            📅 School days calendar
                        </h2>
                        <p className="text-rose-100 text-xs mt-0.5">Configure working days and holidays</p>
                    </div>
                </div>

                <div className="p-6 bg-white">
                    <p className="text-sm text-slate-500 font-medium mb-5">Click on a day to toggle whether the school is open or closed.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, index) => {
                            const defaultWorking = index !== 0;
                            const scheduleItem = weeklySchedule.find(s => s.day_of_week === index);
                            const isWorking = scheduleItem ? scheduleItem.is_working : defaultWorking;

                            return (
                                <button
                                    key={index}
                                    onClick={() => toggleWeeklySchedule(index, !isWorking)}
                                    disabled={savingDays}
                                    className={`relative h-24 rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-sm ${
                                        isWorking
                                            ? 'bg-white border-emerald-400 hover:bg-emerald-50'
                                            : 'bg-slate-50 border-rose-200 hover:bg-rose-50 opacity-80'
                                    }`}
                                >
                                    <span className={`text-sm md:text-base font-semibold ${isWorking ? 'text-slate-800' : 'text-slate-500 line-through decoration-rose-300'}`}>
                                        {dayName}
                                    </span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        isWorking ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {isWorking ? '✓ Open' : '✗ Closed'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="primary"
                            onClick={saveWeeklySchedule}
                            disabled={savingDays}
                            className="!bg-emerald-600 hover:!bg-emerald-700 shadow-md transform active:scale-95 transition-all px-6 py-2.5 text-xs font-semibold flex items-center gap-2"
                        >
                            {savingDays ? 'Saving...' : '💾 Save Changes'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* ── Principal Signature Card ── */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
                        Principal signature
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 ml-4">Official signature used on student and staff identity cards</p>
                </div>

                <div className="p-6 bg-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* Preview */}
                        <div className="flex items-center gap-4">
                            {settings.principal_signature ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 group hover:border-emerald-200 hover:shadow-md transition-all">
                                    <img
                                        src={`${API_BASE}${settings.principal_signature}`}
                                        alt="Current Signature"
                                        className="h-14 object-contain transition-transform group-hover:scale-105"
                                    />
                                    <div className="flex flex-col border-l border-slate-100 pl-4">
                                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            Active
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">On-record</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-16 w-48 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                                    <span className="text-xs text-slate-400 font-medium">No signature uploaded</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95 shadow-sm
                                ${uploading
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md'
                                }`}>
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        {settings.principal_signature ? '✏️ Update' : '⬆️ Upload Signature'}
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleSignatureUpload}
                                    disabled={uploading}
                                />
                            </label>

                            {settings.principal_signature && (
                                <Button
                                    variant="secondary"
                                    onClick={handleRemoveSignature}
                                    className="!bg-red-50 !text-red-700 !border-red-200 hover:!bg-red-600 hover:!text-white transition-all shadow-sm flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Save Configuration Footer Button ── */}
            <div className="flex justify-end pt-2">
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="!bg-emerald-600 hover:!bg-emerald-700 shadow-md hover:shadow-lg transform active:scale-95 transition-all px-8 py-3 text-sm font-semibold"
                >
                    {submitting ? 'Saving Changes...' : 'Save Configuration'}
                </Button>
            </div>
        </div>
    );
};

export default AdminSchoolSettings;