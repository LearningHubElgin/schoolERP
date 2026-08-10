import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
    Car,
    Users, 
    Navigation, 
    Plus,
    Search,
    Settings,
    Shield,
    Trash2,
    Edit,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    UserPlus
} from 'lucide-react';

const AdminTransport = () => {
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBusModal, setShowBusModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [busForm, setBusForm] = useState({
        vehicleNo: '',
        type: 'Bus',
        model: '',
        capacity: '',
        registrationNo: '',
        status: 'Active',
        route: ''
    });

    const [assignmentForm, setAssignmentForm] = useState({
        busId: '',
        driverId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Fetch vehicles from transport API
            const vehiclesRes = await axios.get(`${API_URL}/api/transport/vehicles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (vehiclesRes.data.success) {
                // Map snake_case to camelCase or handle as-is
                setBuses(vehiclesRes.data.vehicles.map(v => ({
                    ...v,
                    vehicleNo: v.vehicle_no,
                    busNo: v.vehicle_no, // Keeping for compatibility if used elsewhere
                    registrationNo: v.registration_no,
                    driver: v.driver_name || 'Unassigned',
                    route: v.route || 'Not Set'
                })));
            }
            
            // Fetch drivers from existing user management (filtered by role)
            const usersRes = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (usersRes.data.success) {
                setDrivers(usersRes.data.users.filter(u => u.role === 'driver'));
            }
        } catch (error) {
            console.error('Error fetching transport data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBus = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = selectedBus ? `${API_URL}/api/transport/vehicles/${selectedBus.id}` : `${API_URL}/api/transport/vehicles`;
            const method = selectedBus ? 'put' : 'post';

            const res = await axios[method](url, {
                vehicle_no: busForm.vehicleNo,
                type: busForm.type,
                model: busForm.model,
                capacity: busForm.capacity,
                registration_no: busForm.registrationNo,
                status: busForm.status,
                route: busForm.route
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                fetchData();
                setShowBusModal(false);
                setSelectedBus(null);
                setBusForm({ vehicleNo: '', type: 'Bus', model: '', capacity: '', registrationNo: '', status: 'Active', route: '' });
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Failed to save vehicle');
        }
    };

    const handleEditVehicle = (bus) => {
        setSelectedBus(bus);
        setBusForm({
            vehicleNo: bus.vehicle_no || bus.busNo,
            type: bus.type,
            model: bus.model,
            capacity: bus.capacity,
            registrationNo: bus.registration_no || bus.registrationNo,
            status: bus.status,
            route: bus.route || ''
        });
        setShowBusModal(true);
    };

    const handleDeleteVehicle = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_URL}/api/transport/vehicles/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete vehicle';
            alert(errorMsg);
        }
    };

    const handleAssignDriver = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/transport/vehicles/assign-driver`, {
                vehicleId: assignmentForm.busId,
                driverId: assignmentForm.driverId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                fetchData();
                setShowAssignModal(false);
                setAssignmentForm({ busId: '', driverId: '' });
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
            alert('Failed to assign driver');
        }
    };

    const filteredBuses = buses.filter(bus => 
        bus.busNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Transport Management</h1>
                    <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">Manage your school fleet and driver assignments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        <UserPlus className="w-4 h-4" />
                        Assign Driver
                    </Button>
                    <Button 
                        onClick={() => {
                            setSelectedBus(null);
                            setBusForm({ vehicleNo: '', type: 'Bus', model: '', capacity: '', registrationNo: '', status: 'Active', route: '' });
                            setShowBusModal(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Vehicle
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Vehicles</p>
                            <h3 className="text-3xl font-bold mt-1">{buses.length}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Car className="w-8 h-8" />
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Active Drivers</p>
                            <h3 className="text-3xl font-bold mt-1">{drivers.length}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Shield className="w-8 h-8" />
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Unassigned Vehicles</p>
                            <h3 className="text-3xl font-bold mt-1">{buses.filter(b => b.driver === 'Unassigned').length}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Fleet Table */}
            <Card className="overflow-hidden border-slate-200/60 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Vehicle No, Driver, or Reg No..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 bg-slate-50 text-slate-600 border-slate-200">
                            Total: {filteredBuses.length} Vehicles
                        </Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registration</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Driver</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">Loading fleet data...</td></tr>
                            ) : filteredBuses.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium whitespace-nowrap">No vehicles found matching your search.</td></tr>
                            ) : filteredBuses.map((bus) => (
                                <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Car className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{bus.busNo || bus.vehicleNo}</p>
                                                <p className="text-xs text-slate-500 font-medium">{bus.type} • {bus.model} • {bus.capacity} Seater</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="font-mono text-slate-600 bg-white border-slate-200 px-2.5 py-1">
                                            {bus.registration_no || bus.registrationNo}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-700">
                                            {bus.route !== 'Not Set' ? bus.route : <span className="text-slate-400 italic">Not Assigned</span>}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {bus.driver === 'Unassigned' ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Unassigned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {bus.driver}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={bus.status === 'Active' ? 'success' : bus.status === 'Maintenance' ? 'warning' : 'danger'}>
                                            {bus.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button 
                                                onClick={() => handleEditVehicle(bus)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteVehicle(bus.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modals */}
            {showBusModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Plus className="w-5 h-5 font-bold" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedBus ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                                    <p className="text-indigo-100 text-xs">{selectedBus ? 'Modify vehicle details' : 'Enter fleet vehicle details'}</p>
                                </div>
                            </div>
                            <button onClick={() => {
                                setShowBusModal(false);
                                setSelectedBus(null);
                            }} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddBus} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Vehicle Type</label>
                                    <select 
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50"
                                        value={busForm.type}
                                        onChange={(e) => setBusForm({...busForm, type: e.target.value})}
                                    >
                                        <option value="Bus">Bus</option>
                                        <option value="Mini Bus">Mini Bus</option>
                                        <option value="Van">Van</option>
                                        <option value="Car (4 Wheeler)">Car (4 Wheeler)</option>
                                        <option value="SUV">SUV</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Vehicle/Bus No</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50"
                                        placeholder="e.g. V-015"
                                        value={busForm.vehicleNo}
                                        onChange={(e) => setBusForm({...busForm, vehicleNo: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Model Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50"
                                        placeholder="e.g. Tata Starbus"
                                        value={busForm.model}
                                        onChange={(e) => setBusForm({...busForm, model: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Reg. Number</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50"
                                        placeholder="WB-01-XXXX"
                                        value={busForm.registrationNo}
                                        onChange={(e) => setBusForm({...busForm, registrationNo: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Capacity</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50"
                                        placeholder="Seating capacity"
                                        value={busForm.capacity}
                                        onChange={(e) => setBusForm({...busForm, capacity: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Status</label>
                                    <select 
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50 shadow-sm"
                                        value={busForm.status}
                                        onChange={(e) => setBusForm({...busForm, status: e.target.value})}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Vehicle Route</label>
                                <input 
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50 shadow-sm"
                                    placeholder="e.g. City Center to Campus (Morning)"
                                    value={busForm.route}
                                    onChange={(e) => setBusForm({...busForm, route: e.target.value})}
                                />
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base shadow-lg shadow-indigo-100">
                                    {selectedBus ? 'Save Changes' : 'Register Vehicle'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Settings className="w-5 h-5 font-bold" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Assign Driver</h3>
                                    <p className="text-emerald-100 text-xs">Map driver to vehicle</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAssignDriver} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Select Bus</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all bg-slate-50 shadow-sm"
                                    value={assignmentForm.busId}
                                    onChange={(e) => setAssignmentForm({...assignmentForm, busId: e.target.value})}
                                >
                                    <option value="">Select a vehicle</option>
                                    {buses.map(bus => (
                                        <option key={bus.id} value={bus.id}>{bus.vehicleNo || bus.busNo} ({bus.registrationNo})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Select Driver</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all bg-slate-50 shadow-sm"
                                    value={assignmentForm.driverId}
                                    onChange={(e) => setAssignmentForm({...assignmentForm, driverId: e.target.value})}
                                >
                                    <option value="">Select a driver</option>
                                    {drivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base shadow-lg shadow-emerald-100">
                                    Confirm Assignment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTransport;
