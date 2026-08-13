import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ALL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const NewApplication = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentName: '',
        dateOfBirth: '',
        class: '',
        stream_id: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        phone: '',
        email: '',
        address: '',
        previousSchool: '',
        previousClass: '',
        bloodGroup: '',
        gender: '',
        medicalConditions: '',
    });

    // State for Fee Structure
    const [feeStructure, setFeeStructure] = useState(null);
    const [feeLoading, setFeeLoading] = useState(false);

    // State for Classes & Streams
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [streams, setStreams] = useState([]);
    const [streamsLoading, setStreamsLoading] = useState(false);

    const [studentCustomMonths, setStudentCustomMonths] = useState(ALL_MONTHS);
    const [isCustomizingMonths, setIsCustomizingMonths] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Document Upload States
    const [documents, setDocuments] = useState({
        student_photo: null,
        father_photo: null,
        mother_photo: null,
        student_aadhaar: null,
        father_aadhaar: null,
        mother_aadhaar: null,
        father_pan: null,
        mother_pan: null
    });
    const [previews, setPreviews] = useState({});

    const isHigherSecondary = formData.class === '11' || formData.class === '12';

    // Generic document file handler
    const handleDocumentSelect = (fieldName, e) => {
        const file = e.target.files[0];
        if (file) {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';

            if (!isImage && !isPDF) {
                alert('Please select an image or PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size should be less than 10MB');
                return;
            }

            setDocuments(prev => ({ ...prev, [fieldName]: file }));

            // Generate preview for images
            if (isImage) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => ({ ...prev, [fieldName]: 'pdf' }));
            }
        }
    };

    const removeDocument = (fieldName) => {
        setDocuments(prev => ({ ...prev, [fieldName]: null }));
        setPreviews(prev => ({ ...prev, [fieldName]: null }));
    };

    // Fetch Classes on component mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const schoolId = localStorage.getItem('schoolId');
                const queryParam = schoolId ? `?school_id=${schoolId}` : '';

                const response = await fetch(`${API_URL}/api/admission/classes${queryParam}`);
                const data = await response.json();

                if (data.success) {
                    setClasses(data.classes);
                }
            } catch (err) {
                console.error('Failed to fetch classes:', err);
            } finally {
                setClassesLoading(false);
            }
        };

        fetchClasses();
    }, []);

    // Fetch Streams when a higher secondary class is selected
    useEffect(() => {
        const fetchStreams = async () => {
            if (!isHigherSecondary) {
                setStreams([]);
                return;
            }

            setStreamsLoading(true);
            try {
                const schoolId = localStorage.getItem('schoolId');
                const queryParam = schoolId ? `?school_id=${schoolId}` : '';
                const response = await fetch(`${API_URL}/api/admission/streams${queryParam}`);
                const data = await response.json();
                if (data.success) {
                    setStreams(data.streams);
                }
            } catch (err) {
                console.error("Failed to fetch streams", err);
            } finally {
                setStreamsLoading(false);
            }
        };

        fetchStreams();
    }, [isHigherSecondary]);

    // Fetch Fee Structure when class or stream changes
    useEffect(() => {
        const fetchFeeStructure = async () => {
            if (!formData.class) {
                setFeeStructure(null);
                return;
            }

            if (isHigherSecondary && !formData.stream_id) {
                setFeeStructure(null);
                return;
            }

            setFeeLoading(true);
            try {
                const schoolId = localStorage.getItem('schoolId');
                let queryParam = schoolId ? `?school_id=${schoolId}` : '?';

                if (isHigherSecondary && formData.stream_id) {
                    queryParam += `${schoolId ? '&' : ''}stream_id=${formData.stream_id}`;
                }

                const response = await fetch(`${API_URL}/api/admission/fee-structure/${formData.class}${queryParam}`);
                const data = await response.json();

                if (data.success) {
                    setFeeStructure(data.feeStructure);
                    if (data.feeStructure?.applicable_months && Array.isArray(data.feeStructure.applicable_months)) {
                        setStudentCustomMonths(data.feeStructure.applicable_months);
                    } else {
                        setStudentCustomMonths(ALL_MONTHS);
                    }
                } else {
                    setFeeStructure(null);
                    setStudentCustomMonths(ALL_MONTHS);
                }
            } catch (err) {
                console.error("Failed to fetch fee structure", err);
                setFeeStructure(null);
                setStudentCustomMonths(ALL_MONTHS);
            } finally {
                setFeeLoading(false);
            }
        };

        fetchFeeStructure();
    }, [formData.class, formData.stream_id, isHigherSecondary]);

    const toggleStudentMonth = (month) => {
        setStudentCustomMonths(prev => {
            if (prev.includes(month)) {
                return prev.filter(m => m !== month);
            } else {
                return [...prev, month];
            }
        });
    };

    const toggleAllStudentMonths = () => {
        setStudentCustomMonths(prev => (prev.length === ALL_MONTHS.length ? [] : ALL_MONTHS));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Manual Validation
        const requiredFields = {
            studentName: 'Student Name',
            dateOfBirth: 'Date of Birth',
            class: 'Class',
            gender: 'Gender',
        };

        if (isHigherSecondary) {
            requiredFields.stream_id = 'Stream/Group';
        }

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field] || formData[field].trim() === '') {
                setError(`Please fill in ${label}`);
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        try {
            const payload = new FormData();
            Object.keys(formData).forEach(key => {
                payload.append(key, formData[key]);
            });

            // Append custom applicable months for student
            payload.append('applicable_months', JSON.stringify(studentCustomMonths));

            // Append school_id from localStorage
            const schoolId = localStorage.getItem('schoolId');
            if (schoolId) {
                payload.append('school_id', schoolId);
            }

            // Append documents
            Object.keys(documents).forEach(key => {
                if (documents[key]) {
                    payload.append(key, documents[key]);
                }
            });

            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/admission/applications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: payload,
            });

            const data = await response.json();

            if (data.success) {
                const appNo = data.applicationNo || data.application?.application_no || data.applicationId || '';
                alert(`Application submitted successfully! Application No: ${appNo}`);
                navigate('/admission/applications');
            } else {
                setError(data.message || 'Failed to create application');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Error creating application:', err);
            setError('Failed to create application. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="space-y-2.5 sm:space-y-3.5 pb-2 flex flex-col h-full lg:h-[calc(100vh-100px)] lg:overflow-hidden">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-2.5 sm:p-4 text-white shadow-md sm:shadow-lg flex flex-row items-center justify-between gap-2.5 shrink-0">
                <div className="relative z-10">
                    <button
                        type="button"
                        onClick={() => navigate('/admission/applications')}
                        className="inline-flex items-center text-blue-100 hover:text-white text-xs font-bold mb-1 transition-colors group cursor-pointer"
                    >
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Applications
                    </button>
                    <h1 className="text-xs sm:text-xl font-bold tracking-tight flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-xl">📝</span> New Student Application
                    </h1>
                    <p className="mt-0.5 text-blue-100 text-[9px] sm:text-xs font-medium hidden xs:block">
                        Fill in student information and upload documents to register a new entry
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/admission/dashboard')}
                    className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer border border-white/30"
                >
                    <span>📊</span> <span className="hidden xs:inline">Dashboard</span>
                </button>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 lg:overflow-hidden">
                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2 mb-2 shrink-0">
                        <span>⚠️</span>
                        <div>
                            <p className="font-bold">Submission Error</p>
                            <p className="text-[11px]">{error}</p>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3.5 flex-1 min-h-0 lg:overflow-hidden">

                    {/* Left Column: Form Sections (Independent Scroll) */}
                    <div className="lg:col-span-2 space-y-2.5 sm:space-y-3.5 lg:overflow-y-auto lg:pr-1.5 custom-scrollbar pb-6">

                        {/* Student Information */}
                        <Card title="Student Information" className="shadow-2xs border-slate-200/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleInputChange}
                                        placeholder="Enter student's full official name"
                                        required
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Student Phone
                                    </label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. +91 98765 43210"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Blood Group
                                    </label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    >
                                        <option value="">Select Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Parents & Guardians */}
                        <Card title="Parent / Guardian Details" className="shadow-2xs border-slate-200/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Father's Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="fatherName"
                                        value={formData.fatherName}
                                        onChange={handleInputChange}
                                        placeholder="Father's full name"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Father's Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        name="fatherPhone"
                                        value={formData.fatherPhone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. +91 98765 43210"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Mother's Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="motherName"
                                        value={formData.motherName}
                                        onChange={handleInputChange}
                                        placeholder="Mother's full name"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Mother's Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        name="motherPhone"
                                        value={formData.motherPhone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. +91 98765 43210"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Contact & Address */}
                        <Card title="Contact Address" className="shadow-2xs border-slate-200/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Student Email
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="student@example.com"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Residential Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                        rows="2"
                                        placeholder="Enter full permanent address"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Additional Info */}
                        <Card title="Academic & Medical" className="shadow-2xs border-slate-200/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Previous School</label>
                                    <Input
                                        type="text"
                                        name="previousSchool"
                                        value={formData.previousSchool}
                                        onChange={handleInputChange}
                                        placeholder="School Name"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Previous Class</label>
                                    <Input
                                        type="text"
                                        name="previousClass"
                                        value={formData.previousClass}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Class 5"
                                        className="bg-slate-50/80 border-slate-300 py-1.5 text-xs"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Medical Conditions</label>
                                    <textarea
                                        name="medicalConditions"
                                        value={formData.medicalConditions}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                        rows="2"
                                        placeholder="Any known allergies or medical conditions? (Optional)"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Document Uploads */}
                        <Card title="📁 Document Uploads" className="shadow-2xs border-slate-200/80">
                            {/* Photos Upload Section */}
                            <div className="mb-4 pb-4 border-b border-slate-200">
                                <h4 className="text-xs font-bold text-slate-700 mb-2">📷 Passport Photos</h4>
                                <div className="flex flex-wrap gap-3">
                                    {/* Student Photo */}
                                    <div className="text-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-indigo-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-2xs">
                                            {previews.student_photo ? (
                                                <img src={previews.student_photo} alt="Student" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl text-slate-300">👤</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleDocumentSelect('student_photo', e)} className="hidden" id="student-photo" />
                                        <label htmlFor="student-photo" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline block mt-1">
                                            {previews.student_photo ? 'Change' : 'Student Photo'}
                                        </label>
                                        {previews.student_photo && <button type="button" onClick={() => removeDocument('student_photo')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                    {/* Father Photo */}
                                    <div className="text-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-blue-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-2xs">
                                            {previews.father_photo ? (
                                                <img src={previews.father_photo} alt="Father" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl text-slate-300">👨</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleDocumentSelect('father_photo', e)} className="hidden" id="father-photo" />
                                        <label htmlFor="father-photo" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline block mt-1">
                                            {previews.father_photo ? 'Change' : 'Father Photo'}
                                        </label>
                                        {previews.father_photo && <button type="button" onClick={() => removeDocument('father_photo')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                    {/* Mother Photo */}
                                    <div className="text-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-pink-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-2xs">
                                            {previews.mother_photo ? (
                                                <img src={previews.mother_photo} alt="Mother" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl text-slate-300">👩</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleDocumentSelect('mother_photo', e)} className="hidden" id="mother-photo" />
                                        <label htmlFor="mother-photo" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline block mt-1">
                                            {previews.mother_photo ? 'Change' : 'Mother Photo'}
                                        </label>
                                        {previews.mother_photo && <button type="button" onClick={() => removeDocument('mother_photo')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                </div>
                            </div>

                            {/* Aadhaar Cards Upload Section */}
                            <div className="mb-4 pb-4 border-b border-slate-200">
                                <h4 className="text-xs font-bold text-slate-700 mb-2">🪪 Aadhaar Cards</h4>
                                <div className="flex flex-wrap gap-2">
                                    {/* Student Aadhaar */}
                                    <div className="flex items-center gap-1.5">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('student_aadhaar', e)} className="hidden" id="student-aadhaar" />
                                        <label htmlFor="student-aadhaar" className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${previews.student_aadhaar ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                            <span>{previews.student_aadhaar ? '✅' : '🖼️'}</span> Student Aadhaar
                                        </label>
                                        {previews.student_aadhaar && <button type="button" onClick={() => removeDocument('student_aadhaar')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                    {/* Father Aadhaar */}
                                    <div className="flex items-center gap-1.5">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('father_aadhaar', e)} className="hidden" id="father-aadhaar" />
                                        <label htmlFor="father-aadhaar" className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${previews.father_aadhaar ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                            <span>{previews.father_aadhaar ? '✅' : '🖼️'}</span> Father Aadhaar
                                        </label>
                                        {previews.father_aadhaar && <button type="button" onClick={() => removeDocument('father_aadhaar')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                    {/* Mother Aadhaar */}
                                    <div className="flex items-center gap-1.5">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('mother_aadhaar', e)} className="hidden" id="mother-aadhaar" />
                                        <label htmlFor="mother-aadhaar" className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${previews.mother_aadhaar ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                            <span>{previews.mother_aadhaar ? '✅' : '🖼️'}</span> Mother Aadhaar
                                        </label>
                                        {previews.mother_aadhaar && <button type="button" onClick={() => removeDocument('mother_aadhaar')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                </div>
                            </div>

                            {/* PAN Cards Upload Section */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 mb-2">💳 PAN Cards (Parents)</h4>
                                <div className="flex flex-wrap gap-2">
                                    {/* Father PAN */}
                                    <div className="flex items-center gap-1.5">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('father_pan', e)} className="hidden" id="father-pan" />
                                        <label htmlFor="father-pan" className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${previews.father_pan ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                                            <span>{previews.father_pan ? '✅' : '🖼️'}</span> Father PAN
                                        </label>
                                        {previews.father_pan && <button type="button" onClick={() => removeDocument('father_pan')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                    {/* Mother PAN */}
                                    <div className="flex items-center gap-1.5">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('mother_pan', e)} className="hidden" id="mother-pan" />
                                        <label htmlFor="mother-pan" className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${previews.mother_pan ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                                            <span>{previews.mother_pan ? '✅' : '🖼️'}</span> Mother PAN
                                        </label>
                                        {previews.mother_pan && <button type="button" onClick={() => removeDocument('mother_pan')} className="text-[10px] text-rose-500 font-bold">Remove</button>}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Class Selection & Fee Breakdown (Independent Scroll) */}
                    <div className="space-y-2.5 sm:space-y-3.5 lg:overflow-y-auto lg:pr-1.5 custom-scrollbar pb-6">
                        <Card className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border-0 !p-3.5 sm:!p-4">
                                <h3 className="text-sm font-extrabold mb-2 text-indigo-300 flex items-center gap-1.5">
                                    <span>🎯</span> Step 1: Select Class
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                            Which class is the student applying for?
                                        </label>
                                        <select
                                            name="class"
                                            value={formData.class}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                                            required
                                        >
                                            <option value="" className="text-slate-400">
                                                {classesLoading ? 'Loading classes...' : 'Choose Class...'}
                                            </option>
                                            {[...classes]
                                                .sort((a, b) => (parseInt(a.class_number) || 0) - (parseInt(b.class_number) || 0))
                                                .map((cls) => (
                                                    <option key={cls.id} value={cls.class_number}>
                                                        {cls.name || `Class ${cls.class_number}`}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* Stream Selection for Class 11/12 */}
                                    {isHigherSecondary && (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                                Select Stream / Group <span className="text-rose-400">*</span>
                                            </label>
                                            <select
                                                name="stream_id"
                                                value={formData.stream_id}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs disabled:opacity-50"
                                                required
                                                disabled={streamsLoading}
                                            >
                                                <option value="" className="text-slate-400">
                                                    {streamsLoading ? 'Loading streams...' : 'Choose Stream...'}
                                                </option>
                                                {streams.map((stream) => (
                                                    <option key={stream.id} value={stream.id}>
                                                        {stream.stream_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="Fee Estimation" className="shadow-2xs border-emerald-200/90 bg-emerald-50/60 !p-3.5">
                                {formData.class ? (
                                    <>
                                        {feeLoading ? (
                                            <div className="py-4 text-center text-emerald-700 text-xs font-medium">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-1"></div>
                                                Fetching fee structure...
                                            </div>
                                        ) : feeStructure ? (
                                            <div className="space-y-2.5">
                                                {/* Header badge showing Applicable Academic Months & Edit Button */}
                                                <div className="flex flex-wrap items-center justify-between bg-emerald-100/90 p-2 rounded-lg text-[11px] text-emerald-900 font-bold border border-emerald-200 shadow-2xs gap-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <span>🗓️ Applicable Months:</span>
                                                        <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-2xs">
                                                            {studentCustomMonths.length} Months ({studentCustomMonths.length === 12 ? 'Full Year' : (studentCustomMonths.length === 0 ? 'None' : `${studentCustomMonths[0]}–${studentCustomMonths[studentCustomMonths.length - 1]}`)})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCustomizingMonths(!isCustomizingMonths)}
                                                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-extrabold underline cursor-pointer"
                                                    >
                                                        {isCustomizingMonths ? 'Close Editor' : '✏️ Set Months for Student'}
                                                    </button>
                                                </div>

                                                {/* Expandable Custom Month Selector for this Student */}
                                                {isCustomizingMonths && (
                                                    <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-sm space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-extrabold text-emerald-950">Select Applicable Academic Months for Student</span>
                                                            <button
                                                                type="button"
                                                                onClick={toggleAllStudentMonths}
                                                                className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                                                            >
                                                                {studentCustomMonths.length === ALL_MONTHS.length ? 'Deselect All' : 'Select All'}
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                                            {ALL_MONTHS.map(m => {
                                                                const isSelected = studentCustomMonths.includes(m);
                                                                return (
                                                                    <button
                                                                        key={m}
                                                                        type="button"
                                                                        onClick={() => toggleStudentMonth(m)}
                                                                        className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                                                                            isSelected
                                                                                ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
                                                                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                                                                        }`}
                                                                    >
                                                                        {m}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex border-b border-emerald-200 pb-1 text-xs font-bold text-emerald-950">
                                                    <div className="flex-1">Fee Component</div>
                                                    <div className="text-right">Monthly / Unit</div>
                                                    <div className="w-24 text-right">Academic Total</div>
                                                </div>

                                                {(() => {
                                                    const monthsCount = studentCustomMonths.length;
                                                    const admissionVal = Number(feeStructure.admission_fee || 0);

                                                    let items = [];
                                                    if (feeStructure.fee_columns && feeStructure.fee_columns.length > 0) {
                                                        items = feeStructure.fee_columns.map(col => {
                                                            let label = col.display_name;
                                                            const isMonthly = label.toLowerCase().includes('tuition') || label.toLowerCase().includes('monthly');
                                                            return {
                                                                label: isMonthly && !label.toLowerCase().includes('monthly') ? `${label} (Monthly)` : label,
                                                                monthlyVal: feeStructure.column_values?.[col.id] || 0,
                                                                isMonthly
                                                            };
                                                        });
                                                    } else {
                                                        items = [
                                                            { label: 'Tuition (Monthly)', monthlyVal: Number(feeStructure.tuition_fee || 0), isMonthly: true },
                                                            { label: 'Library Fee', monthlyVal: Number(feeStructure.library_fee || 0), isMonthly: false },
                                                            { label: 'Sports Fee', monthlyVal: Number(feeStructure.sports_fee || 0), isMonthly: false },
                                                            { label: 'Lab Fee', monthlyVal: Number(feeStructure.lab_fee || 0), isMonthly: false },
                                                            { label: 'Exam Fee', monthlyVal: Number(feeStructure.exam_fee || 0), isMonthly: false },
                                                            { label: 'Hostel Fee', monthlyVal: Number(feeStructure.hostel_fee || 0), isMonthly: false },
                                                            { label: 'Misc Fee', monthlyVal: Number(feeStructure.misc_fee || 0), isMonthly: false }
                                                        ];
                                                    }

                                                    let totalMonthlyRate = 0;
                                                    items.forEach(i => { if (i.monthlyVal > 0 && i.isMonthly) totalMonthlyRate += i.monthlyVal; });

                                                    const totalMonthlyAcademic = totalMonthlyRate * monthsCount;
                                                    const grandTotal = admissionVal + totalMonthlyAcademic;

                                                    return (
                                                        <>
                                                            {admissionVal > 0 && (
                                                                <div className="flex justify-between items-center text-xs text-emerald-900">
                                                                    <span className="flex-1 font-medium">Admission (One-Time)</span>
                                                                    <span className="font-mono text-slate-500 text-[11px] text-right">One-Time</span>
                                                                    <span className="w-24 text-right font-mono font-semibold">{formatCurrency(admissionVal)}</span>
                                                                </div>
                                                            )}

                                                            {items.map(item => item.monthlyVal > 0 && (
                                                                <div key={item.label} className="flex justify-between items-center text-xs text-emerald-900">
                                                                    <span className="flex-1 font-medium">{item.label}</span>
                                                                    <span className="font-mono text-emerald-700 text-[11px] text-right font-semibold">
                                                                        {formatCurrency(item.monthlyVal)}/mo
                                                                    </span>
                                                                    <span className="w-24 text-right font-mono font-bold text-emerald-950">
                                                                        {formatCurrency(item.isMonthly ? item.monthlyVal * monthsCount : item.monthlyVal)}
                                                                    </span>
                                                                </div>
                                                            ))}

                                                            <div className="border-t border-dashed border-emerald-300 pt-2 mt-2 space-y-1">
                                                                <div className="flex justify-between items-center text-xs text-emerald-900">
                                                                    <span className="font-semibold text-emerald-900">Monthly Total ({monthsCount} months)</span>
                                                                    <span className="font-mono font-bold text-emerald-800">{formatCurrency(totalMonthlyAcademic)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-emerald-950 pt-1 border-t border-emerald-200">
                                                                    <span className="font-black text-xs">Total Estimated Academic Fee</span>
                                                                    <span className="font-black text-base font-mono text-emerald-700">{formatCurrency(grandTotal)}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 px-2 bg-amber-50 rounded-lg border border-amber-200">
                                                <span className="text-lg block mb-1">⚠️</span>
                                                <h4 className="font-bold text-amber-800 text-xs">Fee Not Configured</h4>
                                                <p className="text-[10px] text-amber-700 mt-0.5">
                                                    Fee structure for Class {formData.class} not set yet. You can still submit the application.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        <p>Select a class above to view the fee breakdown.</p>
                                    </div>
                                )}
                            </Card>

                            <div className="pt-2 space-y-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {loading ? 'Submitting Application...' : '🚀 Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admission/dashboard')}
                                    className="w-full py-2 text-slate-500 font-bold hover:text-slate-800 text-xs rounded-xl transition-colors cursor-pointer text-center"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewApplication;