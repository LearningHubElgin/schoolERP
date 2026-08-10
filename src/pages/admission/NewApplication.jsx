import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const NewApplication = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentName: '',
        dateOfBirth: '',
        class: '',
        stream_id: '',
        fatherName: '',
        motherName: '',
        parentPhone: '',
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

            // If it's class 11/12 and no stream is selected yet, don't fetch fees
            if (isHigherSecondary && !formData.stream_id) {
                setFeeStructure(null);
                return;
            }

            setFeeLoading(true);
            try {
                // Get school_id from localStorage
                const schoolId = localStorage.getItem('schoolId');
                let queryParam = schoolId ? `?school_id=${schoolId}` : '?';

                if (isHigherSecondary && formData.stream_id) {
                    queryParam += `${schoolId ? '&' : ''}stream_id=${formData.stream_id}`;
                }

                const response = await fetch(`${API_URL}/api/admission/fee-structure/${formData.class}${queryParam}`);
                const data = await response.json();

                if (data.success) {
                    setFeeStructure(data.feeStructure);
                } else {
                    setFeeStructure(null);
                }
            } catch (err) {
                console.error("Failed to fetch fee structure", err);
                setFeeStructure(null);
            } finally {
                setFeeLoading(false);
            }
        };

        fetchFeeStructure();
    }, [formData.class, formData.stream_id, isHigherSecondary]);

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
            fatherName: "Father's Name",
            motherName: "Mother's Name",
            parentPhone: 'Parent Phone Number',
            phone: 'Student Phone Number',
            bloodGroup: 'Blood Group',
            gender: 'Gender',
            address: 'Address'
        };

        const missingFields = [];
        for (const [key, label] of Object.entries(requiredFields)) {
            if (!formData[key]) {
                missingFields.push(label);
            }
        }

        if (missingFields.length > 0) {
            setError(`Please provide all required information: ${missingFields.join(', ')}`);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const schoolId = localStorage.getItem('schoolId');

            const response = await fetch(`${API_URL}/api/admission/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    school_id: schoolId  // Add school_id to application
                })
            });

            const data = await response.json();

            if (data.success) {
                // Upload documents if any were selected
                const hasDocuments = Object.values(documents).some(doc => doc !== null);

                if (hasDocuments) {
                    const docFormData = new FormData();
                    Object.entries(documents).forEach(([key, file]) => {
                        if (file) {
                            docFormData.append(key, file);
                        }
                    });

                    try {
                        await fetch(`${API_URL}/api/admission/applications/${data.applicationId}/documents`, {
                            method: 'POST',
                            body: docFormData
                        });
                    } catch (docErr) {
                        console.error('Document upload error:', docErr);
                    }
                }

                alert(`Application created successfully! Application No: ${data.applicationNo}`);
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
        <div className="space-y-6 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white shadow-xl">
                <button
                    onClick={() => navigate('/admission/dashboard')}
                    className="flex items-center text-cyan-100 hover:text-white mb-4 transition-colors group"
                >
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight">New Student Application 📝</h1>
                    <p className="mt-2 text-cyan-100 text-lg">
                        Fill in the details to create a new enrollment record.
                    </p>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold">Submission Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Form Sections */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Student Information */}
                        <Card title="Student Information" className="shadow-md border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleInputChange}
                                        placeholder="Enter student's full official name"
                                        required
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Blood Group <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                                            required
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
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Parents & Guardians */}
                        <Card title="Parent/Guardian Details" className="shadow-md border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Father's Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="fatherName"
                                        value={formData.fatherName}
                                        onChange={handleInputChange}
                                        placeholder="Father/Guardian Name"
                                        required
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Mother's Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="motherName"
                                        value={formData.motherName}
                                        onChange={handleInputChange}
                                        placeholder="Mother's Name"
                                        required
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Parent Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="tel"
                                        name="parentPhone"
                                        value={formData.parentPhone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. +91 98765 43210"
                                        required
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Contact & Address */}
                        <Card title="Contact Address" className="shadow-md border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Student Email
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="student@example.com"
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Student Phone <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. +91 98765 43210"
                                        required
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Residential Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-sans"
                                        rows="3"
                                        placeholder="Enter full permanent address"
                                        required
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Additional Info */}
                        <Card title="Additional Information" className="shadow-md border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Previous School</label>
                                    <Input
                                        type="text"
                                        name="previousSchool"
                                        value={formData.previousSchool}
                                        onChange={handleInputChange}
                                        placeholder="School Name"
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Previous Class</label>
                                    <Input
                                        type="text"
                                        name="previousClass"
                                        value={formData.previousClass}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Class 5"
                                        className="bg-slate-50 border-slate-300"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Medical Conditions</label>
                                    <textarea
                                        name="medicalConditions"
                                        value={formData.medicalConditions}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-sans"
                                        rows="2"
                                        placeholder="Any known allergies or medical conditions? (Optional)"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Document Uploads */}
                        <Card title="Document Uploads" className="shadow-md border-slate-200">
                            {/* Photos Upload Section */}
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-4">📷 Passport Photos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Student Photo */}
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-2">
                                            {previews.student_photo ? (
                                                <img src={previews.student_photo} alt="Student" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl text-slate-300">👤</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleDocumentSelect('student_photo', e)} className="hidden" id="student-photo" />
                                        <label htmlFor="student-photo" className="text-xs px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded cursor-pointer hover:bg-cyan-100">
                                            {previews.student_photo ? 'Change' : 'Student Photo'}
                                        </label>
                                        {previews.student_photo && <button type="button" onClick={() => removeDocument('student_photo')} className="text-xs text-red-500 ml-1">✕</button>}
                                    </div>
                                    {/* Father Photo */}
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-2">
                                            {previews.father_photo ? (
                                                <img src={previews.father_photo} alt="Father" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl text-slate-300">👨</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleDocumentSelect('father_photo', e)} className="hidden" id="father-photo" />
                                        <label htmlFor="father-photo" className="text-xs px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded cursor-pointer hover:bg-cyan-100">
                                            {previews.father_photo ? 'Change' : 'Father Photo'}
                                        </label>
                                        {previews.father_photo && <button type="button" onClick={() => removeDocument('father_photo')} className="text-xs text-red-500 ml-1">✕</button>}
                                    </div>
                                    {/* Mother Photo */}
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-2">
                                            {previews.mother_photo ? (
                                                <img src={previews.mother_photo} alt="Mother" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl text-slate-300">👩</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleDocumentSelect('mother_photo', e)} className="hidden" id="mother-photo" />
                                        <label htmlFor="mother-photo" className="text-xs px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded cursor-pointer hover:bg-cyan-100">
                                            {previews.mother_photo ? 'Change' : 'Mother Photo'}
                                        </label>
                                        {previews.mother_photo && <button type="button" onClick={() => removeDocument('mother_photo')} className="text-xs text-red-500 ml-1">✕</button>}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 text-center mt-2">Optional • Max 10MB • JPG/PNG</p>
                            </div>

                            {/* Aadhaar Cards Upload Section */}
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-4">🪪 Aadhaar Cards</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Student Aadhaar */}
                                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('student_aadhaar', e)} className="hidden" id="student-aadhaar" />
                                        <label htmlFor="student-aadhaar" className="cursor-pointer block">
                                            <span className="text-2xl mb-1 block">{previews.student_aadhaar ? '✅' : '📄'}</span>
                                            <span className="text-xs font-medium text-orange-800">{previews.student_aadhaar ? 'Student ✓' : 'Student Aadhaar'}</span>
                                        </label>
                                        {previews.student_aadhaar && <button type="button" onClick={() => removeDocument('student_aadhaar')} className="text-xs text-red-500 mt-1">Remove</button>}
                                    </div>
                                    {/* Father Aadhaar */}
                                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('father_aadhaar', e)} className="hidden" id="father-aadhaar" />
                                        <label htmlFor="father-aadhaar" className="cursor-pointer block">
                                            <span className="text-2xl mb-1 block">{previews.father_aadhaar ? '✅' : '📄'}</span>
                                            <span className="text-xs font-medium text-orange-800">{previews.father_aadhaar ? 'Father ✓' : 'Father Aadhaar'}</span>
                                        </label>
                                        {previews.father_aadhaar && <button type="button" onClick={() => removeDocument('father_aadhaar')} className="text-xs text-red-500 mt-1">Remove</button>}
                                    </div>
                                    {/* Mother Aadhaar */}
                                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('mother_aadhaar', e)} className="hidden" id="mother-aadhaar" />
                                        <label htmlFor="mother-aadhaar" className="cursor-pointer block">
                                            <span className="text-2xl mb-1 block">{previews.mother_aadhaar ? '✅' : '📄'}</span>
                                            <span className="text-xs font-medium text-orange-800">{previews.mother_aadhaar ? 'Mother ✓' : 'Mother Aadhaar'}</span>
                                        </label>
                                        {previews.mother_aadhaar && <button type="button" onClick={() => removeDocument('mother_aadhaar')} className="text-xs text-red-500 mt-1">Remove</button>}
                                    </div>
                                </div>
                            </div>

                            {/* PAN Cards Upload Section */}
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-4">💳 PAN Cards (Parents)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Father PAN */}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('father_pan', e)} className="hidden" id="father-pan" />
                                        <label htmlFor="father-pan" className="cursor-pointer block">
                                            <span className="text-2xl mb-1 block">{previews.father_pan ? '✅' : '📄'}</span>
                                            <span className="text-xs font-medium text-blue-800">{previews.father_pan ? 'Father PAN ✓' : 'Father PAN Card'}</span>
                                        </label>
                                        {previews.father_pan && <button type="button" onClick={() => removeDocument('father_pan')} className="text-xs text-red-500 mt-1">Remove</button>}
                                    </div>
                                    {/* Mother PAN */}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocumentSelect('mother_pan', e)} className="hidden" id="mother-pan" />
                                        <label htmlFor="mother-pan" className="cursor-pointer block">
                                            <span className="text-2xl mb-1 block">{previews.mother_pan ? '✅' : '📄'}</span>
                                            <span className="text-xs font-medium text-blue-800">{previews.mother_pan ? 'Mother PAN ✓' : 'Mother PAN Card'}</span>
                                        </label>
                                        {previews.mother_pan && <button type="button" onClick={() => removeDocument('mother_pan')} className="text-xs text-red-500 mt-1">Remove</button>}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 text-center mt-2">Optional • Max 10MB • JPG/PNG/PDF</p>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Class Selection & Fee Breakdown */}
                    <div className="space-y-6">
                        <div className="sticky top-6 space-y-6">
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl border-0">
                                <h3 className="text-lg font-bold mb-4 text-cyan-400">Step 1: Select Class</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Which class is the student applying for?
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="class"
                                                value={formData.class}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none font-bold text-lg"
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
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stream Selection for Class 11/12 */}
                                    {isHigherSecondary && (
                                        <div className="animate-fade-in-up">
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Select Stream/Group <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="stream_id"
                                                    value={formData.stream_id}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none font-bold text-lg disabled:opacity-50"
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
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                    {streamsLoading ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="Fee Estimation" className="shadow-lg border-emerald-100 bg-emerald-50/50">
                                {formData.class ? (
                                    <>
                                        {feeLoading ? (
                                            <div className="py-8 text-center text-emerald-600">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                                                Fetching fees...
                                            </div>
                                        ) : feeStructure ? (
                                            <div className="space-y-3">
                                                <div className="flex border-b border-emerald-200 pb-2 mb-2">
                                                    <div className="flex-1 font-bold text-emerald-900">Fee Component</div>
                                                    <div className="font-bold text-emerald-900">Amount</div>
                                                </div>

                                                {/* Line Items - Dynamic */}
                                                {[
                                                    { label: 'Admission (One-Time)', val: feeStructure.admission_fee },
                                                    ...(feeStructure.fee_columns || []).map(col => ({
                                                        label: col.display_name,
                                                        val: feeStructure.column_values?.[col.id] || 0
                                                    }))
                                                ].map(item => (
                                                    item.val > 0 && (
                                                        <div key={item.label} className="flex justify-between text-sm text-emerald-800">
                                                            <span>{item.label}</span>
                                                            <span className="font-mono font-medium">{formatCurrency(item.val)}</span>
                                                        </div>
                                                    )
                                                ))}

                                                <div className="border-t-2 border-dashed border-emerald-300 pt-3 mt-2">
                                                    <div className="flex justify-between items-center text-emerald-900">
                                                        <span className="font-bold text-lg">Total Estimated Fee</span>
                                                        <span className="font-bold text-2xl font-mono">{formatCurrency(Number(feeStructure.total_fee || 0) + Number(feeStructure.admission_fee || 0))}</span>
                                                    </div>
                                                    <p className="text-xs text-emerald-600 mt-1 text-center bg-white/50 py-1 rounded">
                                                        * Final amount may vary during admission confirmation
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 px-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <span className="text-2xl block mb-2">⚠️</span>
                                                <h4 className="font-bold text-yellow-800">Fee Not Configured</h4>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    The fee structure for Class {formData.class} has not been set yet. You can still submit the application.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>Select a class above to view the standard fee breakdown.</p>
                                    </div>
                                )}
                            </Card>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                    className="w-full py-4 text-lg font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transform active:scale-[0.98] transition-all"
                                >
                                    {loading ? 'Submitting Application...' : '🚀 Submit Application'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admission/dashboard')}
                                    className="w-full mt-3 py-3 text-slate-500 font-medium hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewApplication;