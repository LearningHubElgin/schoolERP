import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { 
    Navigation, 
    MapPin, 
    Users, 
    Clock, 
    Play, 
    Square,
    Search,
    Phone,
    UserCheck,
    Bus,
    Route as RouteIcon
} from 'lucide-react';

const QuickStat = ({ title, value, icon, color, borderColor }) => {
    return (
        <Card
            variant="elevated"
            className={`hover:translate-y-[-2px] transition-all duration-300 group h-full border-l-4 ${borderColor} bg-white`}
        >
            <div className="flex items-center justify-between h-full gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color} flex-shrink-0 shadow-sm`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const DriverTravel = () => {
    const { setGlobalError } = useOutletContext() || {};
    const [isTraveling, setIsTraveling] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [vehicle, setVehicle] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingInterval, setTrackingInterval] = useState(null);
    const [schoolLocation, setSchoolLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [currentPlace, setCurrentPlace] = useState('');

    // Format time: HH:MM:SS
    const travelTime = useMemo(() => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [seconds]);

    const toggleTracking = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/transport/vehicles/toggle-tracking`, 
                { status: newStatus ? 1 : 0 },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (res.data.success) {
                setIsTraveling(newStatus);
                if (newStatus) {
                    const now = Date.now();
                    localStorage.setItem(`travel_start_${vehicle.id}`, now.toString());
                    setSeconds(0);
                    startHeartbeat();
                } else {
                    localStorage.removeItem(`travel_start_${vehicle.id}`);
                    stopHeartbeat();
                }
            }
        } catch (error) {
            console.error("Error toggling tracking:", error);
            if (error.response?.status === 401) {
                setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
            } else {
                const msg = error.response?.data?.message || "Failed to toggle travel mode";
                alert(msg);
            }
        }
    };

    const startHeartbeat = () => {
        // Initial update
        updateLocation();
        
        // Every 60 seconds
        const interval = setInterval(updateLocation, 60000);
        setTrackingInterval(interval);
    };

    const stopHeartbeat = () => {
        if (trackingInterval) {
            clearInterval(trackingInterval);
            setTrackingInterval(null);
        }
    };

    const updateLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const token = localStorage.getItem('token');
                
                // Fetch place name using OpenStreetMap Nominatim (Free)
                let placeName = '';
                try {
                    const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    placeName = geoRes.data.display_name;
                    setCurrentPlace(placeName);
                } catch (geoErr) {
                    console.error("Geocoding error:", geoErr);
                }

                const res = await axios.post(`${API_URL}/api/transport/vehicles/update-location`, {
                    latitude,
                    longitude,
                    placeName
                }, { headers: { 'Authorization': `Bearer ${token}` } });
                
                if (!res.data.success) {
                    console.warn("Tracking failed:", res.data.message);
                    if (res.data.trackingActive === false) {
                        setIsTraveling(false);
                        stopHeartbeat();
                    }
                    return;
                }

                // Calculate distance to school
                if (schoolLocation) {
                    try {
                        const routeRes = await axios.get(
                            `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${schoolLocation.lng},${schoolLocation.lat}?overview=false`
                        );
                        if (routeRes.data.routes && routeRes.data.routes.length > 0) {
                            const route = routeRes.data.routes[0];
                            setRouteInfo({
                                distance: (route.distance / 1000).toFixed(2),
                                duration: Math.round(route.duration / 60)
                            });
                        }
                    } catch (routeErr) {
                        console.error("Routing error:", routeErr);
                    }
                }
            } catch (error) {
                console.error("Error updating tracking location:", error);
            }
        }, (err) => {
            console.error("Geolocation error:", err);
        }, { enableHighAccuracy: true });
    };

    const fetchSchoolSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/transport/school-location`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setSchoolLocation({
                    lat: parseFloat(res.data.latitude),
                    lng: parseFloat(res.data.longitude)
                });
            }
        } catch (error) {
            console.error("Error fetching school settings:", error);
        }
    };

    useEffect(() => {
        return () => stopHeartbeat(); // Cleanup on unmount
    }, []);

    // Timer Effect
    useEffect(() => {
        let timer;
        if (isTraveling) {
            timer = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isTraveling]);

    useEffect(() => {
        const fetchTravelData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/transport/driver/my-travel`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success && res.data.hasVehicle) {
                    const veh = res.data.vehicle;
                    setVehicle(veh);
                    setStudents(res.data.students.map(s => ({ ...s, status: 'pending' })));
                    
                    // Resume tracking if it was active on the server
                    if (Number(veh.is_tracking) === 1) {
                        setIsTraveling(true);
                        
                        // Try to get start time from localStorage first for perfect refresh sync
                        const localStart = localStorage.getItem(`travel_start_${veh.id}`);
                        let startTS = null;
                        
                        if (localStart) {
                            startTS = parseInt(localStart);
                        } else if (veh.tracking_start_time) {
                            // Fallback to server time with timezone safety
                            startTS = new Date(veh.tracking_start_time).getTime();
                        }

                        if (startTS) {
                            const now = Date.now();
                            const diff = Math.floor((now - startTS) / 1000);
                            setSeconds(diff > 0 ? diff : 0);
                        }
                        
                        startHeartbeat();
                    }
                } else {
                    setVehicle(null);
                    setStudents([]);
                }
            } catch (error) {
                console.error("Error fetching travel data:", error);
                if (error.response?.status === 401) {
                    setGlobalError?.({ type: 'EXPIRED', message: 'Your session has expired. Please log in again.' });
                } else {
                    setGlobalError?.({ type: 'LOAD_ERROR', message: 'Failed to load travel data. Please check your connection.' });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTravelData();
        fetchSchoolSettings();
    }, []);

    const pickedUp = students.filter(s => s.status === 'boarded').length;
    const pending = students.length - pickedUp;
    const uniqueStops = [...new Set(students.map(s => s.stop))].filter(Boolean);

    const stats = {
        totalStudents: students.length,
        pickedUp: pickedUp,
        pending: pending,
        stops: uniqueStops.length
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.stop && s.stop.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading route details...</div>;
    }

    if (!vehicle) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bus className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">No Vehicle Assigned</h2>
                <p className="text-slate-500 mt-2">You currently do not have a vehicle assigned for transport duties.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Travel Control Banner */}
            <div className={`relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-500 shadow-xl ${
                isTraveling ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white' : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white'
            }`}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-3">
                            <span className={`w-2 h-2 rounded-full ${isTraveling ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isTraveling ? 'Route Live' : 'Not Started'}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{vehicle.route || 'Route Not Set'}</h1>
                        <p className="mt-1 text-white/70 text-sm md:text-base font-medium flex items-center gap-2">
                             <Bus className="w-4 h-4" /> {vehicle.vehicle_no || vehicle.registration_no} ({vehicle.type})
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {routeInfo && (
                            <div className="hidden lg:flex items-center gap-4 border-l border-white/20 pl-6 mr-2">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">To School</p>
                                    <p className="text-lg font-black">{routeInfo.distance} km</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">EST. Time</p>
                                    <p className="text-lg font-black">{routeInfo.duration} mins</p>
                                </div>
                            </div>
                        )}

                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Active Duration</p>
                            <span className="text-2xl font-mono font-bold tracking-wider">{travelTime}</span>
                        </div>
                        
                        <button 
                            onClick={() => toggleTracking(!isTraveling)}
                            className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm md:text-base transition-all shadow-lg active:scale-95 ${
                                isTraveling 
                                ? 'bg-white text-emerald-600 hover:bg-opacity-95' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isTraveling ? (
                                <><Square className="w-5 h-5 fill-current" /> End Travel</>
                            ) : (
                                <><Play className="w-5 h-5 fill-current" /> Start Travel</>
                            )}
                        </button>
                    </div>
                </div>
                {/* Decorative background */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500 opacity-5 blur-3xl"></div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Attendance List */}
                <Card title="Passenger Attendance" subtitle="Student Roster" variant="elevated" className="lg:col-span-2">
                    <div className="mb-4 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    
                    <div className="space-y-3">
                        {filteredStudents.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">No students found.</div>
                        ) : filteredStudents.map(student => (
                            <div key={student.id} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        student.status === 'boarded' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                                            {student.class} • <MapPin className="w-3 h-3" /> {student.stop}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {student.student_phone && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                            <Phone className="w-3 h-3 text-slate-400" /> 
                                            <span title="Student Phone">{student.student_phone}</span>
                                        </div>
                                    )}
                                    {(student.father_phone || student.guardian_phone) && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pb-0.5">
                                            <Users className="w-3 h-3 text-slate-400" /> 
                                            <span title="Father Phone">{student.father_phone || student.guardian_phone}</span>
                                        </div>
                                    )}
                                    {!student.student_phone && !student.father_phone && !student.guardian_phone && (
                                        <span className="text-[10px] text-slate-400 italic">No contact info</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>


            </div>
        </div>
    );
};

export default DriverTravel;
