import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
    Navigation,
    MapPin,
    Clock,
    User,
    Phone,
    Bus,
    Car,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const TrackVehicle = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString('en-IN', timeOptions));
    const [schoolLocation, setSchoolLocation] = useState({ lat: 22.5726, lng: 88.3639, name: "Our School" });
    const [schoolLogo, setSchoolLogo] = useState('');
    const [routeInfo, setRouteInfo] = useState(null);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/transport/vehicles/tracking`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                const fetchedVehicles = res.data.vehicles;
                setVehicles(fetchedVehicles);
                setLastRefresh(new Date().toLocaleTimeString('en-IN', timeOptions));

                setSelectedVehicle(prev => {
                    if (!prev && fetchedVehicles.length > 0) return fetchedVehicles[0];
                    if (prev) {
                        const updated = fetchedVehicles.find(v => v.id === prev.id);
                        return updated || prev;
                    }
                    return null;
                });
            }
        } catch (error) {
            console.error("Error fetching tracking data:", error);
            toast.error("Failed to fetch live tracking data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchoolSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/settings/attendance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success && res.data.settings) {
                setSchoolLocation({
                    lat: parseFloat(res.data.settings.school_latitude) || 22.5726,
                    lng: parseFloat(res.data.settings.school_longitude) || 88.3639,
                    name: "School Location"
                });
            }
        } catch (error) {
            console.error("Error fetching school settings:", error);
        }
    };

    useEffect(() => {
        fetchTrackingData();
        fetchSchoolSettings();
        
        // Fetch school logo from localStorage
        const logo = localStorage.getItem('schoolLogo');
        if (logo) setSchoolLogo(logo);

        // Auto refresh every 30 seconds
        const interval = setInterval(fetchTrackingData, 30000);
        return () => clearInterval(interval);
    }, []);

    const openInMaps = (lat, lng) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-4 md:p-5 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                        🛰️ Live Vehicle Tracking
                    </h1>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm">Real-time location monitoring for all active routes</p>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                    <div className="text-right hidden md:block">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Last Updated</p>
                        <p className="font-mono text-xs font-bold">{lastRefresh}</p>
                    </div>
                    <button
                        onClick={fetchTrackingData}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all active:scale-95 border border-white/20"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20 flex items-center gap-1 text-xs font-semibold">
                        <span className="font-bold">{vehicles.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Active</span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* List */}
            {loading && vehicles.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Connecting to satellites...</p>
                </div>
            ) : vehicles.length === 0 ? (
                <Card className="p-12 text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Navigation className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Vehicles Active</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
                        Tracking starts automatically when drivers begin their travel from the "My Travel" page.
                    </p>
                </Card>
            ) : (
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Vehicle List */}
                    <div className="flex-1 space-y-4 xl:max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        {vehicles.map(item => (
                            <Card
                                key={item.id}
                                className={`relative overflow-hidden group transition-all p-0 cursor-pointer ${selectedVehicle?.id === item.id ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' : 'hover:border-indigo-200'}`}
                                onClick={() => {
                                    setSelectedVehicle(item);
                                }}
                            >
                                <div className={`h-2 w-full ${selectedVehicle?.id === item.id ? 'bg-indigo-600' : 'bg-indigo-400 group-hover:bg-indigo-500'}`}></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                                {item.type && ['car', 'suv', 'sedan', 'jeep'].some(t => item.type.toLowerCase().includes(t)) ? (
                                                    <Car size={24} />
                                                ) : (
                                                    <Bus size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800">{item.vehicle_no || item.registration_no}</h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    <span>{item.type}</span>
                                                    <span>•</span>
                                                    <span className="text-indigo-500">{item.route || 'Global Route'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="approved">LIVE TRACKING</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver</p>
                                            <div className="flex items-center gap-2 font-bold text-slate-700">
                                                <User size={14} className="text-slate-400" />
                                                {item.driver_name}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                                            <div className="flex items-center gap-2 font-bold text-slate-700">
                                                <Phone size={14} className="text-slate-400" />
                                                {item.driver_phone}
                                            </div>
                                        </div>
                                        <div className="space-y-1 col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Location</p>
                                                <div className="flex items-center gap-3 font-mono text-[10px] font-bold text-indigo-400">
                                                    <MapPin size={10} />
                                                    {item.current_latitude ? Number(item.current_latitude).toFixed(6) : '0.000000'}, {item.current_longitude ? Number(item.current_longitude).toFixed(6) : '0.000000'}
                                                </div>
                                            </div>

                                            <div className="flex items-start justify-between gap-4">
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed flex-1">
                                                    {item.current_place_name || "Determining precise address..."}
                                                </p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openInMaps(item.current_latitude, item.current_longitude);
                                                    }}
                                                    className="bg-slate-200 text-slate-700 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
                                                >
                                                    <ExternalLink size={12} /> Google Maps
                                                </button>
                                            </div>

                                            {/* Distance & ETA Details */}
                                            {selectedVehicle?.id === item.id && routeInfo && (
                                                <div className="grid grid-cols-2 gap-4 mt-4 bg-white/60 p-3 rounded-lg border border-indigo-100 shadow-sm animate-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                                                            <Navigation size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Road Distance</p>
                                                            <p className="text-sm font-black text-slate-800">{routeInfo.distance} <span className="text-[10px] font-bold text-slate-400">km</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 bg-amber-50 rounded-md text-amber-600">
                                                            <Clock size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Est. Time</p>
                                                            <p className="text-sm font-black text-slate-800">{routeInfo.duration} <span className="text-[10px] font-bold text-slate-400">mins</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Clock size={12} />
                                            Last sync: {new Date(item.last_location_update).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                        </div>
                                        {selectedVehicle?.id === item.id && (
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Viewing Map</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Integrated Map View */}
                    <div className="xl:w-1/2 xl:sticky xl:top-6 min-h-[500px] xl:h-[700px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative flex flex-col">
                        <div className="bg-white px-4 py-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
                            <div className="flex items-center gap-3 font-bold text-slate-700">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <MapPin size={20} className="text-indigo-600" />
                                </div>
                                {selectedVehicle ? (
                                    <span>
                                        Tracking: <span className="text-indigo-600 ml-1">{selectedVehicle.vehicle_no || selectedVehicle.registration_no}</span>
                                    </span>
                                ) : 'Select a vehicle to view map'}
                            </div>
                            {selectedVehicle && (
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                                    {selectedVehicle.driver_name}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 relative w-full bg-slate-200 min-h-[400px] overflow-hidden rounded-b-2xl">
                            {selectedVehicle && selectedVehicle.current_latitude ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <LeafletMap 
                                        vehicle={selectedVehicle} 
                                        school={schoolLocation} 
                                        logo={schoolLogo}
                                        onRouteUpdate={(info) => setRouteInfo(info)}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-300/30 flex items-center justify-center">
                                        <MapPin size={32} className="opacity-50" />
                                    </div>
                                    <p className="font-bold uppercase tracking-widest text-xs">Awaiting location signal...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LeafletMap = ({ vehicle, school, logo, onRouteUpdate }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const schoolMarkerRef = useRef(null);
    const polylineRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!window.L || !vehicle.current_latitude || !school.lat) return;

        const vLat = parseFloat(vehicle.current_latitude);
        const vLng = parseFloat(vehicle.current_longitude);
        const sLat = school.lat;
        const sLng = school.lng;
        const isCar = ['car', 'suv', 'sedan', 'jeep'].some(t => vehicle.type?.toLowerCase().includes(t));

        if (!mapInstance.current) {
            mapInstance.current = window.L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([vLat, vLng], 15);

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
            window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
        }

        // 1. Vehicle Icon & Marker
        const iconHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 10px 15px rgb(0 0 0 / 0.15));">
                <div style="background: white; padding: 8px; border-radius: 999px; border: 2.5px solid #4f46e5; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; position: relative; z-index: 10;">
                    ${isCar ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>' : 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 13h20v5c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1v-5Z"/><path d="M4 19v2"/><path d="M18 19v2"/><path d="M3 5h18c.6 0 1 .4 1 1v7H2V6c0-.6.4-1 1-1Z"/></svg>'
                    }
                </div>
                <div style="width: 14px; height: 14px; background: #4f46e5; transform: rotate(45deg); margin-top: -7px; border-bottom: 2px solid white; border-right: 2px solid white; position: relative; z-index: 5;"></div>
            </div>
        `;

        if (markerRef.current) {
            markerRef.current.setLatLng([vLat, vLng]);
        } else {
            const vIcon = window.L.divIcon({ html: iconHtml, className: 'v-marker', iconSize: [0, 0], iconAnchor: [0, 22] });
            markerRef.current = window.L.marker([vLat, vLng], { icon: vIcon }).addTo(mapInstance.current);
        }

        // 2. School Marker
        const logoUrl = logo ? `${API_URL}${logo}` : '/logo.png';
        const schoolHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgb(0 0 0 / 0.15));">
                <div style="background: white; padding: 4px; border-radius: 12px; border: 2.5px solid #10b981; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; z-index: 10;">
                    <img src="${logoUrl}" style="width: 100%; height: 100%; object-contain; border-radius: 8px;" onerror="this.src='/logo.png'"/>
                </div>
                <div style="width: 12px; height: 12px; background: #10b981; transform: rotate(45deg); margin-top: -6px; border-bottom: 2px solid white; border-right: 2px solid white; position: relative; z-index: 5;"></div>
            </div>
        `;

        if (schoolMarkerRef.current) {
            schoolMarkerRef.current.setLatLng([sLat, sLng]);
        } else {
            const sIcon = window.L.divIcon({ html: schoolHtml, className: 's-marker', iconSize: [0, 0], iconAnchor: [0, 15] });
            schoolMarkerRef.current = window.L.marker([sLat, sLng], { icon: sIcon }).addTo(mapInstance.current);
            schoolMarkerRef.current.bindPopup(`<b>${school.name}</b><br/>Lat: ${sLat.toFixed(6)}<br/>Lng: ${sLng.toFixed(6)}`).openPopup();
        }

        // 3. Actual Road Path (Using OSRM Routing API)
        const fetchRoute = async () => {
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${vLng},${vLat};${sLng},${sLat}?overview=full&geometries=geojson`
                );
                const data = await response.json();
                
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    
                    // Send road distance (meters to km) and duration (seconds to mins) back to parent
                    if (onRouteUpdate) {
                        onRouteUpdate({
                            distance: (route.distance / 1000).toFixed(2),
                            duration: Math.round(route.duration / 60)
                        });
                    }
                    
                    if (polylineRef.current) {
                        polylineRef.current.setLatLngs(coordinates);
                    } else {
                        polylineRef.current = window.L.polyline(coordinates, {
                            color: '#4f46e5',
                            weight: 6,
                            opacity: 0.7,
                            lineJoin: 'round',
                            className: 'route-path'
                        }).addTo(mapInstance.current);
                    }
                }
            } catch (error) {
                console.error("OSRM Routing Error:", error);
                // Fallback to straight line if routing service is unavailable
                const straightPath = [[vLat, vLng], [sLat, sLng]];
                if (polylineRef.current) {
                    polylineRef.current.setLatLngs(straightPath);
                } else {
                    polylineRef.current = window.L.polyline(straightPath, {
                        color: '#4f46e5',
                        weight: 4,
                        opacity: 0.5,
                        dashArray: '10, 10'
                    }).addTo(mapInstance.current);
                }
            }
        };

        fetchRoute();

        // 4. Adjust Bounds to show both comfortably
        const bounds = window.L.latLngBounds([[vLat, vLng], [sLat, sLng]]);
        mapInstance.current.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });

    }, [vehicle, school]);

    return <div ref={mapRef} id="map-container" className="w-full h-full z-0" style={{ background: '#f8fafc' }} />;
};

export default TrackVehicle;
