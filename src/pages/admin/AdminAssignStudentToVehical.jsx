import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
    Users, 
    Car, 
    Search, 
    Filter, 
    CheckCircle2, 
    AlertCircle, 
    Navigation,
    UserPlus,
    XCircle,
    Loader2
} from 'lucide-react';

const AdminAssignStudentToVehical = () => {
    const [students, setStudents] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('All');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [assigning, setAssigning] = useState(false);
    
    // New states for Remove Modal
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // 1. Fetch vehicles
            const vehiclesRes = await axios.get(`${API_URL}/api/transport/vehicles?_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // 2. Fetch assignments
            const assignmentsRes = await axios.get(`${API_URL}/api/transport/assignments?_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 3. Fetch students
            const studentsRes = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (vehiclesRes.data.success) {
                setVehicles(vehiclesRes.data.vehicles.map(v => ({
                    id: v.id,
                    vehicleNo: v.vehicle_no,
                    type: v.type,
                    capacity: v.capacity,
                    driverName: v.driver_name,
                    assigned: assignmentsRes.data.assignments?.filter(a => a.vehicle_id === v.id).length || 0
                })));
            }

            if (studentsRes.data.success && assignmentsRes.data.success) {
                const studentList = studentsRes.data.users.filter(u => u.role === 'student').map(s => {
                    const assignment = assignmentsRes.data.assignments.find(a => a.student_id === s.id);
                    return {
                        ...s,
                        assignedVehicle: assignment ? assignment.vehicle_no : 'None',
                        route: assignment ? assignment.route_name : 'Not Set',
                        pickupPoint: assignment ? assignment.pickup_point : ''
                    };
                });
                setStudents(studentList);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (studentId) => {
        if (!selectedVehicle) {
            alert('Please select a vehicle first!');
            return;
        }

        setAssigning(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/transport/assignments`, {
                studentId,
                vehicleId: parseInt(selectedVehicle),
                routeName: 'Standard Route', // Placeholder, can be a form input
                pickupPoint: 'Main Gate'      // Placeholder
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                fetchData();
            }
        } catch (error) {
            console.error('Error assigning transport:', error);
            alert('Failed to assign transport');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveClick = (student) => {
        setStudentToRemove(student);
        setShowRemoveModal(true);
    };

    const confirmRemove = async () => {
        if (!studentToRemove) return;
        
        const studentId = studentToRemove.id;
        
        // Optimistically update the UI to show immediate feedback
        setStudents(prevStudents => prevStudents.map(student => {
            if (student.id === studentId) {
                return {
                    ...student,
                    assignedVehicle: 'None',
                    route: 'Not Set',
                    pickupPoint: ''
                };
            }
            return student;
        }));

        setShowRemoveModal(false);
        setStudentToRemove(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_URL}/api/transport/assignments/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                fetchData();
            }
        } catch (error) {
            console.error('Error removing transport:', error);
            alert('Failed to remove transport');
            fetchData(); // Rollback on error
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (filterVehicle !== 'All') {
            if (filterVehicle === 'Unassigned') {
                matchesFilter = s.assignedVehicle === 'None';
            } else {
                matchesFilter = s.assignedVehicle === filterVehicle;
            }
        }
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 md:w-6 md:h-6" /> Student Transport Assignment
                        </h1>
                        <p className="mt-1 text-blue-100 text-xs md:text-sm">Link students to school transport vehicles and routes</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            </div>

            {/* Controls */}
            <Card className="p-6 border-slate-200/60 shadow-sm bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Assign to Vehicle</label>
                        <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select 
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-white shadow-sm"
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                            >
                                <option value="">Select a vehicle for assignment...</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.vehicleNo} ({v.type}){v.driverName ? ` - ${v.driverName}` : ''} - {v.assigned}/{v.capacity} Filled
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Filter by Vehicle</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select 
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-white shadow-sm"
                                value={filterVehicle}
                                onChange={(e) => setFilterVehicle(e.target.value)}
                            >
                                <option value="All">All Vehicles</option>
                                <option value="Unassigned">Unassigned</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.vehicleNo}>
                                        {v.vehicleNo} ({v.type}){v.driverName ? ` - ${v.driverName}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Search Students</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-white shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Student List */}
            <Card className="overflow-hidden border-slate-200/60 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Vehicle</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Loading Students...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">No students found.</td></tr>
                            ) : filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {student.assignedVehicle === 'None' ? (
                                            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">Unassigned</Badge>
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                                                <Car className="w-4 h-4" />
                                                {student.assignedVehicle}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                        {student.route}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {student.assignedVehicle === 'None' ? (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleAssign(student.id)}
                                                disabled={assigning}
                                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 group-hover:scale-105 transition-all"
                                            >
                                                <UserPlus className="w-4 h-4 mr-1.5" />
                                                Assign
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleRemoveClick(student)}
                                                className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                                            >
                                                <XCircle className="w-4 h-4 mr-1.5" />
                                                Remove
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Remove Confirmation Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Remove Assignment?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Are you sure you want to remove <span className="font-semibold text-slate-700">{studentToRemove?.name}</span> from the existing transport route?
                        </p>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                    setShowRemoveModal(false);
                                    setStudentToRemove(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="danger" 
                                className="w-full bg-red-600 hover:bg-red-700"
                                onClick={confirmRemove}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAssignStudentToVehical;
