import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const DriverProfile = () => {
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDriverProfile();
    }, []);

    const fetchDriverProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/transport/driver/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setDriver(data.driver);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl">
                Driver profile not found
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 pb-8">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 md:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 overflow-hidden shadow-inner font-bold flex items-center justify-center text-5xl">
                        {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{driver.name}</h1>
                        <p className="mt-2 text-indigo-100 text-sm md:text-lg font-medium opacity-90">
                            Fleet Operator
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-semibold border border-white/20">
                                ID: #{driver.id}
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-sm text-emerald-100 rounded-full text-xs md:text-sm font-semibold border border-emerald-500/20">
                                {driver.user_status?.charAt(0).toUpperCase() + driver.user_status?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                    <Card title="Detailed Information" variant="elevated">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                <p className="text-slate-800 font-semibold">{driver.name || 'Not provided'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                <p className="text-slate-800 font-semibold">{driver.phone || 'Not provided'}</p>
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                <p className="text-slate-800 font-semibold">{driver.email || 'Not provided'}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Professional Details" variant="elevated">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">License Number</label>
                                <p className="text-slate-800 font-semibold">{driver.license_no || 'Not provided'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</label>
                                <p className="text-slate-800 font-semibold">{driver.experience_years ? `${driver.experience_years} years` : 'Not provided'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Status</label>
                                <p className="text-slate-800 font-semibold">
                                    <Badge variant={driver.driver_status === 'active' ? 'success' : 'danger'}>
                                        {driver.driver_status?.toUpperCase() || 'UNKNOWN'}
                                    </Badge>
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DriverProfile;
