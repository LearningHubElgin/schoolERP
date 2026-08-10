import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

const StaffIDCard = ({ data, school, idPrefix = "" }) => {
    if (!data || !school) return null;

    const staffName = data.staff_name || data.name || "Staff Member";
    const cardNumber = data.card_number || "N/A";
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
        // fontFamily: "'', sans-serif",
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

const NonTeachingStaffIdCard = () => {
    const [cardData, setCardData] = useState(null);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCard();
    }, []);

    const fetchMyCard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/staff/my-id-card`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setCardData(data.card);
                setSchoolInfo({
                    name: localStorage.getItem('schoolName'),
                    logo: localStorage.getItem('schoolLogo'),
                    address: localStorage.getItem('schoolAddress'),
                    principal_signature: data.card.principal_signature 
                });
            } else {
                setSchoolInfo({
                    name: localStorage.getItem('schoolName'),
                    logo: localStorage.getItem('schoolLogo'),
                    address: localStorage.getItem('schoolAddress'),
                    principal_signature: null 
                });
                if (response.status !== 404) {
                    toast.error(data.message || 'Failed to fetch ID card');
                }
            }
        } catch (error) {
            console.error('Fetch card error:', error);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full font-black"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Identity Vault...</p>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-8 w-full space-y-6 md:space-y-12">
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-5 md:p-10 rounded-2xl md:rounded-[40px] shadow-2xl relative overflow-hidden text-center">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 text-left">
                    <div className="flex items-center gap-4 md:gap-6">
                        <span className="text-3xl md:text-5xl translate-y-1">🪪</span>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">My Official Identity</h1>
                            <p className="text-slate-400 mt-1 font-medium italic text-xs md:text-base">Validated identification for secure school premises</p>
                        </div>
                    </div>
                    {cardData && (
                        <button
                            onClick={handlePrint}
                            className="px-6 md:px-8 py-2.5 md:py-3 bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl md:rounded-2xl hover:bg-white hover:text-slate-900 transition-all border border-white/20 active:scale-95 self-start md:self-auto"
                        >
                            🖨️ Generate Print
                        </button>
                    )}
                </div>
            </div>

            {!cardData ? (
                <Card className="p-8 md:p-16 rounded-2xl md:rounded-[40px] shadow-2xl border-none bg-white text-center flex flex-col items-center gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-amber-50 rounded-full flex items-center justify-center shadow-inner mb-2 animate-bounce">
                        <span className="text-4xl md:text-6xl">⌛</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Access Locked</h2>
                    <p className="text-slate-500 max-w-sm font-bold leading-relaxed text-xs md:text-sm">
                        Your digital identity card hasn't been issued by the administrative department yet. This is mandatory for premise entry.
                    </p>
                    <div className="mt-2 md:mt-4 px-6 md:px-8 py-2.5 md:py-3 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-200">
                        Status: Pending Admin Authorization
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col items-center gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700 print:block">
                    <div className="bg-white p-4 md:p-12 rounded-2xl md:rounded-[60px] shadow-3xl border border-gray-100/50 print:p-0 print:border-none print:shadow-none">
                        <div className="scale-[0.85] md:scale-100 origin-top">
                            <StaffIDCard data={cardData} school={schoolInfo} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl print:hidden">
                        <div className="bg-blue-50/70 p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-blue-100 flex items-center gap-4 md:gap-6 text-left shadow-sm">
                            <span className="text-2xl md:text-4xl">🛡️</span>
                            <div>
                                <div className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Secure Profile</div>
                                <p className="text-xs text-blue-600/70 font-bold italic leading-relaxed">Identity cryptographic signature is officially validated.</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50/70 p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-indigo-100 flex items-center gap-4 md:gap-6 text-left shadow-sm">
                            <span className="text-2xl md:text-4xl">🏧</span>
                            <div>
                                <div className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">NFC Compliant</div>
                                <p className="text-xs text-indigo-600/70 font-bold italic leading-relaxed">Valid for all smart gate entry and exit points.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NonTeachingStaffIdCard;
