import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const API_BASE = API_URL;

const AdminCards = () => {
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Data Lists
    const [classes, setClasses] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [classStudents, setClassStudents] = useState([]);
    const [distributedCards, setDistributedCards] = useState([]);

    // Selection
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [streams, setStreams] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({
        student_id: '',
        card_type: 'Identity Card'
    });


    // Preview Modal State
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [nextCardNumber, setNextCardNumber] = useState('');

    // Demo Modal State
    const [showDemo, setShowDemo] = useState(false);
    const [demoCardType, setDemoCardType] = useState('Identity Card');

    // Edit Modal State
    const [editModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState({ id: '', card_type: '', title: '' });

    const [editLoading, setEditLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [classesRes, cardsRes, schoolRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/classes`, { headers }),
                fetch(`${API_BASE}/api/admin/cards`, { headers }),
                fetch(`${API_BASE}/api/auth/me`, { headers })
            ]);

            const classesData = await classesRes.json();
            const cardsData = await cardsRes.json();
            const schoolData = await schoolRes.json();

            if (classesData.success) {
                const sortedClasses = [...classesData.classes].sort((a, b) => 
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                );
                setClasses(sortedClasses);
            }
            if (cardsData.success) setDistributedCards(cardsData.cards);
            if (schoolData.success) setSchoolInfo(schoolData.school);
        } catch (error) {
            console.error('Initial fetch error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getStreamCode = () => {
        if (!selectedStream) return '';
        const streamObj = streams.find(s => String(s.id) === String(selectedStream));
        if (streamObj && streamObj.name) {
            return streamObj.name.substring(0, 3).toUpperCase();
        }
        return '';
    };

    const fetchNextNumber = async () => {
        try {
            const token = localStorage.getItem('token');
            const streamCode = getStreamCode();
            const res = await fetch(`${API_BASE}/api/admin/cards/next-number?streamCode=${streamCode}`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNextCardNumber(data.nextNumber);
            }
        } catch (err) {
            console.error('Next number fetch error:', err);
        }
    };

    // Re-fetch next number when stream selection changes
    useEffect(() => {
        fetchNextNumber();
    }, [selectedStream, streams]);


    const isHigherSecondary = (classId) => {
        const cls = classes.find(c => String(c.id) === String(classId));
        if (!cls) return false;
        const name = (cls.name || '').toUpperCase();
        const num = String(cls.class_number || '');
        return name.includes('XI') || name.includes('11') || name.includes('XII') || name.includes('12') || num === '11' || num === '12';
    };

    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        setSelectedSection('');
        setSelectedStream('');
        setClassSections([]);
        setClassStudents([]);
        setStreams([]);
        setFormData(prev => ({ ...prev, student_id: '' }));

        if (!classId) return;

        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        if (isHigherSecondary(classId)) {
            // Fetch streams for HS classes
            try {
                const res = await fetch(`${API_BASE}/api/admin/class-streams/${classId}`, { headers });
                const data = await res.json();
                if (data.success) setStreams(data.streams || []);
            } catch (error) {
                console.error('Error fetching streams:', error);
                setStreams([]);
            }
        } else {
            // Fetch sections directly for non-HS classes
            try {
                const res = await fetch(`${API_BASE}/api/admin/class-sections/${classId}`, { headers });
                const data = await res.json();
                if (data.success) setClassSections(data.sections);
                else setClassSections([]);
            } catch (error) {
                console.error('Error fetching class sections:', error);
                setClassSections([]);
            }
        }
    };

    const handleStreamChange = async (streamId) => {
        setSelectedStream(streamId);
        setSelectedSection('');
        setClassSections([]);
        setClassStudents([]);
        setFormData(prev => ({ ...prev, student_id: '' }));

        if (!streamId || !selectedClassId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/class-sections/${selectedClassId}?stream_id=${streamId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setClassSections(data.sections || []);
            else setClassSections([]);
        } catch (error) {
            console.error('Error fetching sections for stream:', error);
            setClassSections([]);
        }
    };

    const handleSectionChange = async (sectionCode) => {
        setSelectedSection(sectionCode);
        setClassStudents([]);
        setFormData(prev => ({ ...prev, student_id: '' }));

        if (!sectionCode || !selectedClassId) return;

        const selectedClass = classes.find(c => String(c.id) === String(selectedClassId));
        if (!selectedClass) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const filtered = data.students.filter(s =>
                    String(s.class) === String(selectedClass.class_number) &&
                    String(s.section) === String(sectionCode)
                );
                setClassStudents(filtered);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setClassStudents([]);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedStudent = classStudents.find(s => String(s.id) === String(formData.student_id));
        
        if (!formData.student_id || !selectedStudent) {
            toast.error('Please select a student');
            return;
        }

        setSubmitLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/cards`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: formData.student_id,
                    card_type: formData.card_type,
                    title: `${formData.card_type} - ${selectedStudent.name}`,
                    streamCode: getStreamCode()
                })
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Card issued successfully');
                setFormData(prev => ({ ...prev, student_id: '' }));
                fetchCards();
                
                // Fetch the new next card number for the preview
                fetchNextNumber();
            } else {
                toast.error(result.message || 'Failed to issue card');
            }
        } catch (error) {
            console.error('Issue card error:', error);
            toast.error('Failed to issue card');
        } finally {
            setSubmitLoading(false);
        }
    };

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/cards`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDistributedCards(data.cards);
        } catch (error) {
            console.error('Fetch cards error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this card?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/cards/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Card deleted');
                setDistributedCards(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Server error');
        }
    };

    // ---- Edit Handlers ----
    const openEditModal = (card) => {
        setEditData({ id: card.id, card_type: card.card_type, title: card.title });
        setEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/cards/${editData.id}`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    card_type: editData.card_type,
                    title: editData.title
                })
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Card updated successfully');
                setEditModal(false);
                fetchCards();
            } else {
                toast.error(result.message || 'Failed to update card');
            }
        } catch (error) {
            console.error('Edit card error:', error);
            toast.error('Server error');
        } finally {
            setEditLoading(false);
        }
    };

    const handlePreview = (card) => {
        setPreviewData({
            student_name: card.student_name,
            card_number: card.card_number,
            class_name: card.class_name,
            section_name: card.section_name,
            roll_no: card.roll_no,
            father_name: card.father_name,
            mother_name: card.mother_name,
            dob: card.dob,
            phone: card.phone,
            address: card.address,
            student_photo: card.student_photo
        });
        setShowPreview(true);
    };

    // ── Helper Utilities for ID Cards ──────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    };

    const generateQRDataURL = (data) => {
        const text = typeof data === 'object' 
            ? `ID: ${data.card_number || 'N/A'}\nName: ${data.student_name || 'N/A'}\nClass: ${data.class_name || ''}-${data.section_name || ''}\nRoll: ${data.roll_no || ''}\nFather: ${data.father_name || ''}\nPhone: ${data.phone || ''}\nDOB: ${data.dob ? new Date(data.dob).toLocaleDateString('en-GB') : ''}`
            : `ID: ${data}`;
        const encoded = encodeURIComponent(text);
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}&bgcolor=ffffff&color=1e3a8a&margin=2`;
    };

    const StudentIDCard = ({ data, school, idPrefix = "" }) => {
        if (!data || !school) return null;

        const studentName = data.student_name || data.name || "Demo Student";
        const cardNumber = data.card_number || "N/A";
        const photoUrl = data.photo || data.student_photo || "";
        const qrUrl = generateQRDataURL(data);
        
        const cName = String(data.class_name || data.class || "1st").toUpperCase();
        const hideSection = cName.includes('XI') || cName.includes('11') || cName.includes('XII') || cName.includes('12') || cName === '11' || cName === '12';

        // Shared card style constants
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
            <div id={`${idPrefix}wrapper`} style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', padding: '24px', background: '#f1f5fb', borderRadius: '20px', border: '1.5px dashed #c5cae9' }}>
                {/* ══════════════════════════════════════
                    FRONT SIDE
                ══════════════════════════════════════ */}
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
                                    ? <img src={`${API_BASE}${school.logo}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    : <span style={{ fontSize: '10px', fontWeight: 900, color: '#1565c0', textAlign: 'center', lineHeight: '1.1' }}>LOGO</span>
                                }
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontWeight: 900, fontSize: '12px', lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                    {school.name || "School Name"}
                                </div>
                                <div style={{ color: '#bbdefb', fontSize: '7.5px', lineHeight: '1.3', marginTop: '2px' }}>
                                    (Govt. Recognised)<br />
                                    {school.address || "Place your address,"}<br />
                                    District State and Pin - {school.pincode || "000000"}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: 'white', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px 6px', gap: '0' }}>
                        <div style={{ width: '70px', height: '85px', border: '2px solid #1976d2', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(21,101,192,0.15)', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', flexShrink: 0 }}>
                            {photoUrl ? <img src={`${API_BASE}${photoUrl}`} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '28px' }}>👤</span>}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a237e', textAlign: 'center', marginBottom: '5px', letterSpacing: '0.3px' }}>{studentName}</div>
                        <div style={{ width: '100%', border: '1px solid #e3eafc', borderRadius: '6px', overflow: 'hidden', marginBottom: '5px', fontSize: '9px' }}>
                            {[
                                { label: "Father's Name", val: data.father_name || "N/A" },
                                { label: "Mother's Name", val: data.mother_name || "N/A" },
                                { label: "D.O.B.", val: formatDate(data.dob || data.dateOfBirth) },
                                { label: "Contact No.", val: data.phone || data.contact_no || "N/A" },
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', borderBottom: i < 3 ? '1px solid #e3eafc' : 'none', background: i % 2 === 0 ? 'white' : '#f5f8ff' }}>
                                    <span style={{ width: '38%', padding: '3px 5px', fontWeight: 700, color: '#5c6bc0', borderRight: '1px solid #e3eafc', flexShrink: 0 }}>{row.label}</span>
                                    <span style={{ padding: '3px 5px', fontWeight: 600, color: '#1a237e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ width: '100%', fontSize: '8px', color: '#37474f', lineHeight: '1.3', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#1565c0' }}>Add.: </span>{data.address || school.address || "N/A"}
                        </div>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 'auto', padding: '6px 0 2px', borderTop: '1px dashed #c5cae9' }}>
                            {/* <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a237e' }}>Class : <span style={{ color: '#1565c0', fontStyle: 'italic' }}>{data.class_name || data.class || "1st"}</span> {data.section_name && !hideSection ? <span> | Sec: <span style={{ color: '#1565c0', fontStyle: 'italic' }}>{data.section_name}</span></span> : null}</div> */}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(90deg, #0d47a1, #1565c0)', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#bbdefb', fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{school.name || "School Portal"}</span>
                    </div>
                </div>

                {/* ══════════════════════════════════════
                    BACK SIDE
                ══════════════════════════════════════ */}
                <div id={`${idPrefix}back`} style={cardBase}>
                    {/* Top blue header with logo */}
                    <div style={{ background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid #90caf9' }}>
                            {school.logo
                                ? <img src={`${API_BASE}${school.logo}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : <span style={{ fontSize: '8px', fontWeight: 900, color: '#1565c0' }}>LOGO</span>
                            }
                        </div>
                        <div style={{ color: 'white', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: '1.2' }}>
                            {school.name || "School Name"}
                        </div>
                    </div>

                    {/* White body */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 12px', gap: '6px' }}>
                        {/* QR Code and Student ID */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 0', borderBottom: '1px dashed #c5cae9' }}>
                            <img src={qrUrl} alt="QR" style={{ width: '70px', height: '70px', imageRendering: 'pixelated', border: '1px solid #c5cae9', borderRadius: '4px', background: 'white', padding: '3px' }} crossOrigin="anonymous" />
                            <span style={{ fontSize: '10px', color: '#1a237e', fontWeight: 800, textAlign: 'center' }}>ID NO: {cardNumber}</span>
                        </div>

                        {/* Rules & Instructions */}
                        <div style={{ background: '#f5f8ff', borderRadius: '6px', border: '1px solid #e3eafc', padding: '6px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                <span style={{ width: '5px', height: '5px', background: '#1565c0', borderRadius: '50%', flexShrink: 0 }}></span>
                                <span style={{ fontSize: '8.5px', fontWeight: 900, color: '#0d47a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructions</span>
                            </div>
                            {[
                                'Identity card is mandatory for campus entry.',
                                'This card is non-transferable property.',
                                'Report loss of card immediately to the office.',
                            ].map((rule, i) => (
                                <div key={i} style={{ display: 'flex', gap: '4px', fontSize: '8px', color: '#37474f', lineHeight: '1.3', marginBottom: i < 2 ? '2px' : 0 }}>
                                    <span style={{ fontWeight: 700, color: '#1565c0', flexShrink: 0 }}>•</span>
                                    <span>{rule}</span>
                                </div>
                            ))}
                        </div>

                        {/* Signature */}
                        <div style={{ marginTop: 'auto', borderTop: '1px dashed #c5cae9', paddingTop: '6px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                                    {school.principal_signature
                                        ? <img src={`${API_BASE}${school.principal_signature}`} alt="Signature" style={{ height: '100%', objectFit: 'contain' }} />
                                        : <span style={{ fontFamily: '"Dancing Script", cursive', fontSize: '18px', color: '#1a237e', fontStyle: 'italic' }}>Principal</span>
                                    }
                                </div>
                                <div style={{ fontSize: '7px', fontWeight: 800, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid #e0e0e0', paddingTop: '2px' }}>
                                    Authorized Sign
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom blue strip */}
                    <div style={{ background: 'linear-gradient(90deg, #0d47a1, #1565c0)', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#bbdefb', fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{school.name || "School Portal"}</span>
                    </div>
                </div>
            </div>
        );
    };

    const VirtualIDCardModal = ({ data, school }) => {
        if (!data || !school) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <button 
                        onClick={() => setShowPreview(false)}
                        className="absolute -top-16 md:-top-12 md:-right-12 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/10 shadow-2xl group flex items-center gap-2"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Close Vault</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    
                    <div className="bg-white/5 p-4 md:p-8 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-sm">
                        <StudentIDCard data={data} school={school} idPrefix="admin-preview-id-" />
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-4 text-center">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-6 py-2 rounded-full border border-white/5 shadow-inner">
                            Official Digital Identity • School ERP Secure
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Issue Student Cards 💳</h1>
                        <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                            Generate and manage identity cards for students.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDemo(true)}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md border border-white/20 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <span className="text-sm">👁️</span> Card Preview
                        </button>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Issue Section - Side by Side */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Form Card */}
                <div className="xl:col-span-4">
                    <Card className="h-full border-none shadow-xl bg-white/80 backdrop-blur-sm">
                        <div className="p-1">
                            <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tight flex items-center gap-2">
                                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                                Issue New Card
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Academic Class</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-700"
                                        value={selectedClassId}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Class --</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stream/Group dropdown - only for Class 11/12 */}
                                {isHigherSecondary(selectedClassId) && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-purple-400 uppercase tracking-wider ml-1">Group (Stream)</label>
                                        <select
                                            className="w-full px-4 py-3 bg-purple-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-gray-700 disabled:opacity-50"
                                            value={selectedStream}
                                            onChange={(e) => handleStreamChange(e.target.value)}
                                            required
                                            disabled={!selectedClassId || streams.length === 0}
                                        >
                                            <option value="">{selectedClassId ? (streams.length === 0 ? 'No groups found' : '-- Select Group --') : '-- Select Class First --'}</option>
                                            {streams.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Section Group</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-700 disabled:opacity-50"
                                        value={selectedSection}
                                        onChange={(e) => handleSectionChange(e.target.value)}
                                        required
                                        disabled={!selectedClassId || classSections.length === 0 || (isHigherSecondary(selectedClassId) && !selectedStream)}
                                    >
                                        <option value="">{selectedClassId ? (isHigherSecondary(selectedClassId) && !selectedStream ? '-- Select Group First --' : (classSections.length === 0 ? 'No sections found' : '-- Select Section --')) : '-- Select Class First --'}</option>
                                        {classSections.map(s => (
                                            <option key={s.section_id || s.id} value={s.code}>{s.section_name || s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Target Student</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-700 disabled:opacity-50"
                                        name="student_id"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        required
                                        disabled={!selectedSection || classStudents.length === 0}
                                    >
                                        <option value="">{selectedSection ? (classStudents.length === 0 ? 'No students found' : '-- Select Student --') : '-- Select Section First --'}</option>
                                        {classStudents.map(s => {
                                            const alreadyIssued = distributedCards.some(c => String(c.student_id) === String(s.id) && c.card_type === formData.card_type);
                                            return (
                                                <option key={s.id} value={s.id} disabled={alreadyIssued}>
                                                    {s.name} (Roll: {s.roll_no}){alreadyIssued ? ' ✓ Already Issued' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Card Variation</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-700"
                                        name="card_type"
                                        value={formData.card_type}
                                        onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                                    >
                                        <option value="Identity Card">Identity Card</option>
                                        <option value="Admit Card">Admit Card</option>
                                        <option value="Library Card">Library Card</option>
                                        <option value="Registration Card">Registration Card</option>
                                    </select>
                                </div>



                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className={`w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-3 ${submitLoading ? 'opacity-70 pointer-events-none' : ''}`}
                                >
                                    {submitLoading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                            Issue Card
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="xl:col-span-8 flex flex-col">
                    <Card className="flex-1 border-none shadow-xl bg-white overflow-hidden flex flex-col">
                        <div className="p-1 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                                    Virtual Card Preview
                                </h2>
                                {formData.student_id && formData.card_type === 'Identity Card' && (
                                    <Badge variant="success" className="animate-pulse">Live Draft</Badge>
                                )}
                            </div>

                            <div className="flex-1 flex items-center justify-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 min-h-[400px]">
                                {formData.card_type === 'Identity Card' && formData.student_id ? (
                                    <div className="w-full transform transition-all duration-500 ease-out">
                                        <StudentIDCard 
                                            data={{
                                                ...classStudents.find(s => String(s.id) === String(formData.student_id)),
                                                class_name: classes.find(c => String(c.id) === String(selectedClassId))?.name,
                                                section_name: selectedSection,
                                                card_number: nextCardNumber
                                            }} 
                                            school={schoolInfo} 
                                            idPrefix="virtual-id-card-" 
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center space-y-3 opacity-30 select-none">
                                        <div className="text-6xl">🪪</div>
                                        <p className="text-sm font-black uppercase tracking-widest text-gray-500">Student Identity Card Preview</p>
                                        <p className="text-xs text-gray-400 lowercase italic">Please select a student to see the design...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* List Cards Section - Full Width */}
            <Card className="border-none shadow-xl bg-white overflow-hidden">
                <div className="p-1">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                            Issued Identity Repository
                        </h2>
                        <div className="flex gap-2">
                            <div className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                Total: {distributedCards.length} Cards
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                                    <th className="px-6 py-4">Student Identity</th>
                                    <th className="px-6 py-4">Card Number</th>
                                    <th className="px-6 py-4">Card Classification</th>
                                    <th className="px-6 py-4">Issuance Date</th>
                                    <th className="px-6 py-4 text-right">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-16 text-gray-400 italic">Synchronizing database...</td></tr>
                                ) : distributedCards.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-16 text-gray-400 italic">No records found in the repository.</td></tr>
                                ) : (
                                    distributedCards.map(card => (
                                        <tr key={card.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black text-xs border border-red-100 uppercase">
                                                        {card.student_name.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-800 uppercase tracking-tight">{card.student_name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                                                            {card.class_name}-{card.section_name} • Roll: {card.roll_no}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md inline-block font-mono">{card.card_number || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge variant={card.card_type === 'Identity Card' ? 'danger' : 'info'} className="text-[9px] font-black uppercase px-3 py-1">{card.card_type}</Badge>
                                                <div className="text-[9px] text-gray-400 mt-1 italic opacity-0 group-hover:opacity-100 transition-opacity">{card.title}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[11px] font-bold text-gray-500">{new Date(card.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </td>
                                            <td className="px-6 py-5 text-right space-x-1">
                                                <button
                                                    onClick={() => handlePreview(card)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(card)}
                                                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-green-600 hover:text-white transition-all"
                                                >
                                                    Modify
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(card.id)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>


            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Edit Card</h3>
                            <button
                                onClick={() => setEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editData.card_type}
                                    onChange={(e) => setEditData({ ...editData, card_type: e.target.value })}
                                >
                                    <option value="Identity Card">Identity Card</option>
                                    <option value="Admit Card">Admit Card</option>
                                    <option value="Library Card">Library Card</option>
                                    <option value="Registration Card">Registration Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    placeholder="Card title"
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>



                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className={`flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all ${editLoading ? 'opacity-70' : ''}`}
                                >
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/*  Preview card Modal */}
            {showDemo && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="relative w-full max-w-4xl flex flex-col items-center py-8">
                        <button 
                            onClick={() => setShowDemo(false)}
                            className="absolute top-0 right-0 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/10 shadow-2xl group flex items-center gap-2 z-10"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Close Preview</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div className="mb-6 text-center">
                            <h2 className="text-white text-2xl font-bold tracking-tight">🎴 Card Preview</h2>
                            <p className="text-white/50 text-xs font-medium mt-1">Select a card type to preview its design</p>
                        </div>

                        {/* Card Type Selector Tabs */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {['Identity Card', 'Admit Card', 'Library Card', 'Registration Card'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setDemoCardType(type)}
                                    className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                                        demoCardType === type
                                            ? 'bg-white text-slate-900 shadow-lg shadow-white/20 scale-105'
                                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/10'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white/5 p-4 md:p-8 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-sm w-full flex justify-center">
                            {demoCardType === 'Identity Card' && (
                                <StudentIDCard 
                                    data={{
                                        student_name: 'Demo Student',
                                        card_number: nextCardNumber || 'SCH-2026-0001',
                                        student_photo: '',
                                        father_name: 'Mr. Demo Father',
                                        mother_name: 'Mrs. Demo Mother',
                                        dob: '2015-01-15',
                                        phone: '9876543210',
                                        address: 'Demo Address, City, State',
                                        class_name: 'Class 1',
                                        section_name: 'A',
                                        roll_no: '001'
                                    }} 
                                    school={schoolInfo || { name: 'Your School Name', address: 'School Address', pincode: '000000' }} 
                                    idPrefix="demo-id-" 
                                />
                            )}

                            {demoCardType === 'Admit Card' && (
                                <div style={{ width: '380px', fontFamily: "'Inter', sans-serif" }}>
                                    <div style={{ border: '2px solid #1565c0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #0d47a1, #1565c0)', padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ color: 'white', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {schoolInfo?.name || 'Your School Name'}
                                            </div>
                                            <div style={{ color: '#bbdefb', fontSize: '9px', marginTop: '4px' }}>{schoolInfo?.address || 'School Address'}</div>
                                            <div style={{ background: '#fff3', padding: '4px 16px', borderRadius: '20px', display: 'inline-block', marginTop: '8px' }}>
                                                <span style={{ color: 'white', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Admit Card</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'white' }}>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                                <div style={{ width: '70px', height: '85px', border: '2px solid #1976d2', borderRadius: '6px', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span style={{ fontSize: '28px' }}>👤</span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#1a237e', marginBottom: '6px' }}>Demo Student</div>
                                                    <div style={{ fontSize: '10px', color: '#546e7a', lineHeight: '1.8' }}>
                                                        <div><b>Class:</b> Class 1 | <b>Section:</b> A</div>
                                                        <div><b>Roll No:</b> 001</div>
                                                        <div><b>Father:</b> Mr. Demo Father</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ border: '1px dashed #c5cae9', borderRadius: '8px', padding: '12px', background: '#f5f8ff', fontSize: '10px', color: '#37474f' }}>
                                                <div style={{ fontWeight: 900, color: '#0d47a1', marginBottom: '6px', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px' }}>Exam Details</div>
                                                <div><b>Exam:</b> Annual Examination 2026</div>
                                                <div><b>Date:</b> 01-03-2026 to 15-03-2026</div>
                                                <div><b>Timing:</b> 10:00 AM - 1:00 PM</div>
                                            </div>
                                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontFamily: 'cursive', fontSize: '16px', color: '#1a237e', fontStyle: 'italic' }}>Principal</div>
                                                    <div style={{ fontSize: '7px', fontWeight: 800, color: '#90a4ae', textTransform: 'uppercase', borderTop: '1px solid #e0e0e0', paddingTop: '2px', letterSpacing: '1px' }}>Authorized Sign</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {demoCardType === 'Library Card' && (
                                <div style={{ width: '320px', fontFamily: "'Inter', sans-serif" }}>
                                    <div style={{ border: '2px solid #2e7d32', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)', padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ color: 'white', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {schoolInfo?.name || 'Your School Name'}
                                            </div>
                                            <div style={{ background: '#fff3', padding: '4px 16px', borderRadius: '20px', display: 'inline-block', marginTop: '8px' }}>
                                                <span style={{ color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>📚 Library Card</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'white' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #2e7d32', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span style={{ fontSize: '24px' }}>👤</span>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#1b5e20' }}>Demo Student</div>
                                                    <div style={{ fontSize: '10px', color: '#546e7a' }}>Class 1 - Section A | Roll: 001</div>
                                                </div>
                                            </div>
                                            <div style={{ border: '1px solid #c8e6c9', borderRadius: '8px', overflow: 'hidden', fontSize: '10px', marginBottom: '12px' }}>
                                                {[{ l: 'Card No', v: 'LIB-2026-001' }, { l: 'Valid From', v: '01-04-2026' }, { l: 'Valid Till', v: '31-03-2027' }, { l: 'Max Books', v: '3' }].map((r, i) => (
                                                    <div key={i} style={{ display: 'flex', borderBottom: i < 3 ? '1px solid #c8e6c9' : 'none', background: i % 2 === 0 ? 'white' : '#f1f8e9' }}>
                                                        <span style={{ width: '35%', padding: '5px 8px', fontWeight: 700, color: '#2e7d32', borderRight: '1px solid #c8e6c9' }}>{r.l}</span>
                                                        <span style={{ padding: '5px 8px', fontWeight: 600, color: '#1b5e20' }}>{r.v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ fontSize: '8px', color: '#66bb6a', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Handle books with care • Return on time</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {demoCardType === 'Registration Card' && (
                                <div style={{ width: '380px', fontFamily: "'Inter', sans-serif" }}>
                                    <div style={{ border: '2px solid #e65100', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #bf360c, #e65100)', padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ color: 'white', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {schoolInfo?.name || 'Your School Name'}
                                            </div>
                                            <div style={{ color: '#ffccbc', fontSize: '9px', marginTop: '4px' }}>{schoolInfo?.address || 'School Address'}</div>
                                            <div style={{ background: '#fff3', padding: '4px 16px', borderRadius: '20px', display: 'inline-block', marginTop: '8px' }}>
                                                <span style={{ color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Registration Card</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'white' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '70px', height: '85px', border: '2px solid #e65100', borderRadius: '6px', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                                    <span style={{ fontSize: '28px' }}>👤</span>
                                                </div>
                                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#bf360c' }}>Demo Student</div>
                                                <div style={{ fontSize: '10px', color: '#8d6e63', fontWeight: 600 }}>Registration No: REG-2026-0001</div>
                                            </div>
                                            <div style={{ border: '1px solid #ffccbc', borderRadius: '8px', overflow: 'hidden', fontSize: '10px', marginBottom: '12px' }}>
                                                {[{ l: 'Class', v: 'Class 1' }, { l: 'Section', v: 'A' }, { l: 'Session', v: '2026-2027' }, { l: 'DOB', v: '15-01-2015' }, { l: 'Father', v: 'Mr. Demo Father' }, { l: 'Contact', v: '9876543210' }].map((r, i) => (
                                                    <div key={i} style={{ display: 'flex', borderBottom: i < 5 ? '1px solid #ffccbc' : 'none', background: i % 2 === 0 ? 'white' : '#fff8e1' }}>
                                                        <span style={{ width: '30%', padding: '5px 8px', fontWeight: 700, color: '#e65100', borderRight: '1px solid #ffccbc' }}>{r.l}</span>
                                                        <span style={{ padding: '5px 8px', fontWeight: 600, color: '#bf360c' }}>{r.v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontFamily: 'cursive', fontSize: '16px', color: '#bf360c', fontStyle: 'italic' }}>Principal</div>
                                                    <div style={{ fontSize: '7px', fontWeight: 800, color: '#90a4ae', textTransform: 'uppercase', borderTop: '1px solid #e0e0e0', paddingTop: '2px', letterSpacing: '1px' }}>Authorized Sign</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col items-center text-center">
                            <p className="text-white/30 text-xs font-medium bg-white/5 px-5 py-2 rounded-full border border-white/5">
                                ℹ️ Sample preview only — actual cards use real student data
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showPreview && <VirtualIDCardModal data={previewData} school={schoolInfo} />}
        </div>
    );
};

export default AdminCards;