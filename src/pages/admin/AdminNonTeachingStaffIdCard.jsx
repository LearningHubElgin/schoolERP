import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const StaffIDCard = ({ data, school, idPrefix = "" }) => {
    if (!data || !school) return null;

    const staffName = data.staff_name || data.name || "Staff Member";
    // If it's a preview, use the provided card_number, otherwise fallback to PENDING
    const cardNumber = data.card_number || "PENDING";
    const photoUrl = data.staff_photo || data.photo || "";
    
    const generateQRDataURL = (val) => {
        const text = `STAFF ID: ${val.card_number || 'N/A'}\nName: ${val.staff_name || val.name || 'N/A'}\nDesignation: ${val.designation || ''}\nPhone: ${val.phone || ''}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=1e3a8a&margin=2`;
    };

    const qrUrl = generateQRDataURL(data);

    const CARD_W = '260px';
    const CARD_H = '460px';
    const cardBase = {
        width: CARD_W,
        height: CARD_H,
        borderRadius: '12px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid #e3eafc',
    };

    return (
        <div id={`${idPrefix}wrapper`} style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', padding: '12px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            {/* FRONT SIDE */}
            <div id={`${idPrefix}front`} style={cardBase}>
                <div style={{
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                    padding: '10px 14px 20px',
                    position: 'relative',
                    borderBottomLeftRadius: '50% 18px',
                    borderBottomRightRadius: '50% 18px',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'white', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                            flexShrink: 0,
                            overflow: 'hidden',
                            border: '2px solid #90caf9',
                        }}>
                            {school.logo
                                ? <img src={`${API_URL}${school.logo}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : <span style={{ fontSize: '10px', fontWeight: 900, color: '#1565c0', textAlign: 'center', lineHeight: '1.1' }}>LOGO</span>
                            }
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontWeight: 900, fontSize: '11px', lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                {school.name || "School Name"}
                            </div>
                            <div style={{ color: '#bbdefb', fontSize: '7px', lineHeight: '1.3', marginTop: '2px' }}>
                                {school.address || "School Address"}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ background: 'white', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px 6px', gap: '0' }}>
                    <div style={{ width: '80px', height: '95px', border: '2px solid #1976d2', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(21,101,192,0.15)', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', flexShrink: 0 }}>
                        {photoUrl ? <img src={`${API_URL}${photoUrl}`} alt="Staff" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>👤</span>}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#1a237e', textAlign: 'center', marginBottom: '2px', letterSpacing: '0.3px' }}>{staffName}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#5c6bc0', textTransform: 'uppercase', marginBottom: '8px' }}>{data.designation || "Staff Member"}</div>
                    
                    <div style={{ width: '100%', border: '1px solid #e3eafc', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px', fontSize: '9px' }}>
                        {[
                            { label: "Emp ID", val: data.employee_id || "N/A" },
                            { label: "Department", val: data.department || "General" },
                            { label: "Contact", val: data.phone || "N/A" },
                            { label: "Blood Grp", val: data.blood_group || "N/A" },
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', borderBottom: i < 3 ? '1px solid #e3eafc' : 'none', background: i % 2 === 0 ? 'white' : '#f5f8ff' }}>
                                <span style={{ width: '38%', padding: '4px 6px', fontWeight: 700, color: '#5c6bc0', borderRight: '1px solid #e3eafc', flexShrink: 0 }}>{row.label}</span>
                                <span style={{ padding: '4px 6px', fontWeight: 600, color: '#1a237e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ width: '100%', fontSize: '8px', color: '#37474f', lineHeight: '1.2', marginBottom: '4px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1565c0' }}>Add: </span>{data.address || "School Premises"}
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(90deg, #0d47a1, #1565c0)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: '9px', fontWeight: 800 }}>CARD NO: {cardNumber}</span>
                    <span style={{ color: '#bbdefb', fontSize: '7px', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL STAFF</span>
                </div>
            </div>

            {/* BACK SIDE */}
            <div id={`${idPrefix}back`} style={cardBase}>
                <div style={{ background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)', padding: '12px', textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>Security Terms</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                        <img src={qrUrl} alt="QR" style={{ width: '80px', height: '80px', padding: '4px', border: '1px solid #e3eafc', borderRadius: '8px' }} />
                    </div>
                    
                    <div style={{ background: '#f8faff', borderRadius: '8px', padding: '10px', fontSize: '9px', color: '#37474f', border: '1px solid #e3eafc' }}>
                        <ul style={{ paddingLeft: '14px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <li>Must be displayed while on duty.</li>
                            <li>The card is property of the institution.</li>
                            <li>If found, please return to office.</li>
                            <li>Unauthorized use is prohibited.</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                            {school.principal_signature 
                                ? <img src={`${API_URL}${school.principal_signature}`} alt="Sign" style={{ height: '100%' }} />
                                : <span style={{ fontFamily: '"Dancing Script", cursive', fontSize: '20px', color: '#1a237e' }}>Principal</span>
                            }
                        </div>
                        <div style={{ fontSize: '8px', fontWeight: 800, color: '#90a4ae', textTransform: 'uppercase', borderTop: '1px solid #eee', width: '100%', textAlign: 'center', paddingTop: '4px' }}>Authorized Signatory</div>
                    </div>
                </div>
                <div style={{ background: '#0d47a1', height: '12px' }}></div>
            </div>
        </div>
    );
};

const AdminNonTeachingStaffIdCard = () => {
    const [staffList, setStaffList] = useState([]);
    const [issuedCards, setIssuedCards] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [viewCard, setViewCard] = useState(null);
    const [nextCardNumber, setNextCardNumber] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Staff
            const staffRes = await fetch(`${API_URL}/api/admin/non-teaching-staff`, { headers });
            const staffData = await staffRes.json();

            // Fetch Issued Cards
            const cardsRes = await fetch(`${API_URL}/api/admin/non-teaching-staff-cards`, { headers });
            const cardsData = await cardsRes.json();

            // Fetch School Settings for Principal Signature
            const settingsRes = await fetch(`${API_URL}/api/admin/settings/attendance`, { headers });
            const settingsData = await settingsRes.json();

            // School Info
            setSchoolInfo({
                name: localStorage.getItem('schoolName'),
                logo: localStorage.getItem('schoolLogo'),
                address: localStorage.getItem('schoolAddress'),
                principal_signature: settingsData.success ? settingsData.settings.principal_signature : null 
            });

            // Fetch Next Card Number for Preview
            try {
                const nextRes = await fetch(`${API_URL}/api/admin/non-teaching-staff-cards/next-number`, { headers });
                const nextData = await nextRes.json();
                if (nextData.success) setNextCardNumber(nextData.nextNumber);
            } catch (err) {
                console.error('Next number fetch error:', err);
            }

            if (staffData.success) {
                setStaffList(staffData.staff);
            }
            if (cardsData.success) setIssuedCards(cardsData.cards);

        } catch (error) {
            console.error('Fetch data error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Filter staff who don't have cards yet
    const pendingStaff = staffList.filter(staff => 
        !issuedCards.some(card => card.user_id === staff.user_id)
    );

    const handleIssueCard = async () => {
        if (!selectedStaff) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/non-teaching-staff-cards`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: selectedStaff.user_id, title: 'Staff Identity Card' })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Identity Card Generated Successfully');
                setSelectedStaff(null);
                fetchInitialData();
            } else {
                toast.error(data.message || 'Failed to issue card');
            }
        } catch (error) {
            console.error('Issue card error:', error);
            toast.error('Server connection error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevokeCard = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this ID card access?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/non-teaching-staff-cards/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Access Revoked Successfully');
                fetchInitialData();
            } else {
                toast.error(data.message || 'Failed to revoke card');
            }
        } catch (error) {
            console.error('Revoke error:', error);
            toast.error('Server error');
        }
    };

    return (
        <div className="p-4 md:p-6 w-full space-y-6">
            {/* Page Header - Screenshot Style */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 md:p-5 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative flex items-center gap-3">
                    <div className="text-xl md:text-2xl">🪪</div>
                    <div className="text-left">
                        <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">Non-Teaching Staff ID Cards</h1>
                        <p className="text-blue-100 text-xs md:text-sm font-medium mt-1">Manage and view all support staff id cards details</p>
                    </div>
                </div>
            </div>

            {/* Issuance Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Staff Selection Column - Dropdown Style */}
                <Card className="lg:col-span-4 p-6 rounded-2xl shadow-sm border border-gray-100 bg-white">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-800 uppercase tracking-tight">
                                Select Staff for Issuance
                            </h2>
                            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-[10px] font-bold">{pendingStaff.length} Pending</span>
                        </div>
                        
                        <div className="relative">
                            <select
                                value={selectedStaff?.user_id || ''}
                                onChange={(e) => {
                                    const staff = pendingStaff.find(s => s.user_id === parseInt(e.target.value));
                                    setSelectedStaff(staff || null);
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-700 appearance-none cursor-pointer transition-all hover:bg-gray-100"
                            >
                                <option value="">--- Choose Staff Member ---</option>
                                {pendingStaff.map(staff => (
                                    <option key={staff.user_id} value={staff.user_id}>
                                        {staff.name} ({staff.designation})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-black">
                                ⌵
                            </div>
                        </div>

                        {selectedStaff && (
                            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                                        {selectedStaff.photo ? (
                                            <img src={`${API_URL}${selectedStaff.photo}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center font-bold">{selectedStaff.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-teal-900 text-sm leading-none mb-1">{selectedStaff.name}</p>
                                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{selectedStaff.designation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!selectedStaff && pendingStaff.length > 0 && (
                            <div className="py-4 text-center opacity-40">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Awaiting Selection</p>
                            </div>
                        )}

                        {pendingStaff.length === 0 && (
                            <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">All identities issued</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Central Preview & Action Area */}
                <Card className="lg:col-span-8 p-0 rounded-2xl shadow-sm border border-gray-100 bg-white flex flex-col min-h-[500px]">
                    {!selectedStaff ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 gap-4">
                            <div className="text-5xl opacity-20">💳</div>
                            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Identity Preview</h3>
                            <p className="max-w-xs text-sm text-gray-500">Pick a staff member from the list to preview and generate their digital credential</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                             <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Card Live View</h3>
                                <button onClick={() => setSelectedStaff(null)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                             </div>
                             
                             <div className="p-4 md:p-8 flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 overflow-x-auto">
                                <div className="scale-[0.75] md:scale-100 origin-top">
                                    <StaffIDCard 
                                        data={{ ...selectedStaff, card_number: nextCardNumber }} 
                                        school={schoolInfo} 
                                        idPrefix="live-issue-" 
                                    />
                                </div>
                                
                                <button
                                    onClick={handleIssueCard}
                                    disabled={submitting}
                                    className="px-10 py-3 bg-teal-600 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                                >
                                    {submitting ? 'Generating...' : '🛠️ Issue Official Card'}
                                </button>
                             </div>
                        </div>
                    )}
                </Card>

            </div>

            {/* Issued Inventory Section */}
            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">📋 Issued Credentials Registry</h2>
                <Card className="p-0 rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white">
                    {loading ? (
                         <div className="py-20 text-center text-gray-400">Loading master records...</div>
                    ) : issuedCards.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">No identity cards issued yet.</div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {issuedCards.map(card => (
                                    <div key={card.id} className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center bg-gray-50 shrink-0">
                                                {card.staff_photo ? (
                                                    <img src={`${API_URL}${card.staff_photo}`} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-300">{card.staff_name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-800 text-sm leading-none mb-1 truncate">{card.staff_name}</p>
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{card.designation}</p>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded shrink-0">
                                                {card.card_number}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setViewCard(card)} className="flex-1 text-xs font-bold text-teal-600 bg-teal-50 py-2 rounded-lg border border-teal-100">View Card</button>
                                            <button onClick={() => handleRevokeCard(card.id)} className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">Revoke</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
                                        <tr>
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Card Number</th>
                                            <th className="px-6 py-4 text-center">Preview</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {issuedCards.map(card => (
                                            <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center bg-gray-50">
                                                        {card.staff_photo ? (
                                                            <img src={`${API_URL}${card.staff_photo}`} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-300">{card.staff_name?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm leading-none mb-1">{card.staff_name}</p>
                                                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{card.designation}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                                        {card.card_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => setViewCard(card)} className="text-sm font-bold text-teal-600 hover:text-teal-800 underline decoration-2 decoration-teal-100 hover:decoration-teal-200">View Card</button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleRevokeCard(card.id)}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                                                    >
                                                        Revoke
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* View Full Card Modal */}
            {viewCard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" onClick={() => setViewCard(null)}>
                    <div className="relative w-full max-w-[300px] md:max-w-3xl flex flex-col items-center animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-[32px] shadow-2xl relative max-h-[85vh] overflow-y-auto">
                            <button
                                onClick={() => setViewCard(null)}
                                className="absolute top-2 right-2 md:-top-3 md:-right-3 w-8 h-8 bg-white text-gray-400 hover:text-gray-800 rounded-full flex items-center justify-center shadow-lg border border-gray-100 transition-all font-black z-10"
                            >
                                ✕
                            </button>
                            <div className="scale-[0.85] md:scale-100 origin-top">
                                <StaffIDCard data={viewCard} school={schoolInfo} />
                            </div>
                        </div>
                        <p className="mt-4 md:mt-6 text-white/70 font-bold uppercase tracking-widest text-[10px]">Registry Preview Mode</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNonTeachingStaffIdCard;
