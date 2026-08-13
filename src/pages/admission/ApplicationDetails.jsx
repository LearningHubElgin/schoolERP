import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Admission Data State
    const [admitData, setAdmitData] = useState({
        section: 'A',
        admissionFeeAmount: '',
        annualFeeAmount: '',
        admissionPaid: '',
        annualPaid: '',
        admissionPaymentMethod: 'offline',
        admissionPaymentDate: '',
        admissionTransactionId: '',
        annualPaymentMethod: 'offline',
        annualPaymentDate: '',
        annualTransactionId: ''
    });

    const [processing, setProcessing] = useState(false);
    const [feeStructure, setFeeStructure] = useState(null);
    const [loadingFee, setLoadingFee] = useState(false);

    // Preview Modal State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // Photo Upload State
    const [studentPhoto, setStudentPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Class Sections State
    const [classSections, setClassSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);

    // Streams State for editing
    const [streams, setStreams] = useState([]);
    const [streamsLoading, setStreamsLoading] = useState(false);

    // Classes State for editing
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);

    useEffect(() => {
        fetchApplicationDetails();
    }, [id]);

    useEffect(() => {
        if (application && application.class) {
            fetchFeeStructure(application.class, application.stream_id);
        }
    }, [application]);

    // Fetch classes on component mount
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

    // Fetch streams when editing a higher secondary class
    const isHigherSecondary = (cls) => String(cls) === '11' || String(cls) === '12';

    useEffect(() => {
        const fetchStreams = async () => {
            if (!isEditing || !isHigherSecondary(editFormData.class)) {
                setStreams([]);
                return;
            }
            setStreamsLoading(true);
            try {
                const schoolId = localStorage.getItem('schoolId') || 1;
                const response = await fetch(`${API_URL}/api/admission/streams?school_id=${schoolId}`);
                const data = await response.json();
                if (data.success) {
                    setStreams(data.streams);
                }
            } catch (err) {
                console.error('Failed to fetch streams', err);
            } finally {
                setStreamsLoading(false);
            }
        };
        fetchStreams();
    }, [isEditing, editFormData.class]);

    const fetchApplicationDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admission/applications/${id}`);
            const data = await response.json();

            if (data.success) {
                setApplication(data.application);
                setEditFormData({
                    studentName: data.application.student_name,
                    dateOfBirth: data.application.date_of_birth ? (() => {
                        const d = new Date(data.application.date_of_birth);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })() : '',
                    gender: data.application.gender || '',
                    class: data.application.class,
                    fatherName: data.application.father_name,
                    fatherPhone: data.application.father_phone || data.application.parent_phone || '',
                    motherName: data.application.mother_name,
                    motherPhone: data.application.mother_phone || '',
                    phone: data.application.phone,
                    email: data.application.email,
                    address: data.application.address,
                    previousSchool: data.application.previous_school || '',
                    previousClass: data.application.previous_class || '',
                    bloodGroup: data.application.blood_group || '',
                    medicalConditions: data.application.medical_conditions || '',
                    stream_id: data.application.stream_id || '',
                });
            } else {
                setError(data.message || 'Failed to fetch application details');
            }
        } catch (err) {
            console.error('Error fetching application:', err);
            setError('Failed to fetch application details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch fee structure
    const fetchFeeStructure = async (classNumber, streamId) => {
        setLoadingFee(true);
        try {
            const schoolId = localStorage.getItem('schoolId') || 1;
            let queryParam = `?school_id=${schoolId}`;
            if (streamId) {
                queryParam += `&stream_id=${streamId}`;
            }
            const response = await fetch(`${API_URL}/api/admission/fee-structure/${classNumber}${queryParam}`);
            const data = await response.json();

            if (data.success && data.feeStructure) {
                setFeeStructure(data.feeStructure);

                let studentMonths = [];
                if (application?.applicable_months) {
                    try {
                        studentMonths = typeof application.applicable_months === 'string'
                            ? JSON.parse(application.applicable_months)
                            : application.applicable_months;
                    } catch (e) {}
                }
                if (!Array.isArray(studentMonths) || studentMonths.length === 0) {
                    if (data.feeStructure.applicable_months) {
                        studentMonths = data.feeStructure.applicable_months;
                    }
                }

                const monthsCount = (Array.isArray(studentMonths) && studentMonths.length > 0)
                    ? studentMonths.length
                    : (data.feeStructure.months_count || 12);

                let monthlyRate = 0;
                if (data.feeStructure.fee_columns && data.feeStructure.fee_columns.length > 0) {
                    data.feeStructure.fee_columns.forEach(col => {
                        const isMonthly = col.display_name.toLowerCase().includes('tuition') || col.display_name.toLowerCase().includes('monthly');
                        if (isMonthly) {
                            monthlyRate += Number(data.feeStructure.column_values?.[col.id] || 0);
                        }
                    });
                }
                if (monthlyRate === 0) {
                    monthlyRate = Number(data.feeStructure.tuition_fee || data.feeStructure.total_fee || 0);
                }

                const totalAcademicFee = monthlyRate * monthsCount;
                const admissionFee = Number(data.feeStructure.admission_fee || 0);

                setAdmitData(prev => ({
                    ...prev,
                    annualFeeAmount: totalAcademicFee,
                    admissionFeeAmount: admissionFee,
                    admissionPaid: admissionFee, // Pre-fill
                    annualPaid: ''
                }));
            } else {
                setFeeStructure(null);
            }
        } catch (err) {
            console.error('Error fetching fee structure:', err);
            setFeeStructure(null);
        } finally {
            setLoadingFee(false);
        }
    };

    // Fetch sections for a specific class
    const fetchClassSections = async (classNumber, streamId) => {
        setSectionsLoading(true);
        try {
            const schoolId = localStorage.getItem('schoolId') || 1;
            // Get class ID from class number
            const classResponse = await fetch(`${API_URL}/api/admission/classes?school_id=${schoolId}`);
            const classData = await classResponse.json();

            if (classData.success && classData.classes) {
                const selectedClass = classData.classes.find(c => String(c.class_number) === String(classNumber));
                if (selectedClass) {
                    let sectionUrl = `${API_URL}/api/admission/class-sections/${selectedClass.id}?school_id=${schoolId}`;
                    if (streamId) {
                        sectionUrl += `&stream_id=${streamId}`;
                    }
                    const response = await fetch(sectionUrl);
                    const data = await response.json();

                    if (data.success && data.sections.length > 0) {
                        setClassSections(data.sections);
                        // Auto-select first section
                        setAdmitData(prev => ({ ...prev, section: data.sections[0].section_code }));
                    } else {
                        // Fallback to default sections if none configured
                        setClassSections([{ section_id: 'A', section_code: 'A', section_name: 'Section A' }]);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch sections:', err);
            setClassSections([{ section_id: 'A', section_code: 'A', section_name: 'Section A' }]);
        } finally {
            setSectionsLoading(false);
        }
    };

    const openAdmitModal = () => {
        setShowAdmitModal(true);
        setStudentPhoto(null);
        setPhotoPreview(null);
        if (application?.class) {
            fetchFeeStructure(application.class, application.stream_id);
            fetchClassSections(application.class, application.stream_id);
        }
    };

    // Photo file handler
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setStudentPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Document Preview State
    const [previewDoc, setPreviewDoc] = useState(null);

    const handlePreviewDoc = (url, name) => {
        const fileType = url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
        setPreviewDoc({ url, type: fileType, name });
    };

    const handleDocumentReplace = async (fieldName, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation - 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit');
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append(fieldName, file);

        try {
            setProcessing(true);
            const token = localStorage.getItem('token'); // In case auth is needed, though route is public currently
            const response = await fetch(`${API_URL}/api/admission/applications/${id}/documents`, {
                method: 'POST',
                // key note: do not set Content-Type header when sending FormData, browser sets it automatically with boundary
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Document updated successfully!');
                fetchApplicationDetails(); // Refresh to see changes
            } else {
                alert(data.message || 'Failed to update document');
            }
        } catch (err) {
            console.error('Error updating document:', err);
            alert('Error updating document');
        } finally {
            setProcessing(false);
            e.target.value = null; // Reset input
        }
    };

    const handleSaveChanges = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admission/applications/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();
            if (data.success) {
                alert('Application updated successfully!');
                setIsEditing(false);
                fetchApplicationDetails();
            } else {
                alert(data.message || 'Failed to update application');
            }
        } catch (err) {
            console.error('Error updating application:', err);
            alert('Failed to update application');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            // Mock implementation or existing one
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admission/applications/${id}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Application_${application.application_no}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert('Failed to download PDF');
            }
        } catch (err) {
            console.error('Error downloading PDF:', err);
            alert('Error downloading PDF');
        }
    };

    const handleDownloadPaymentSlip = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admission/applications/${id}/payment-receipt`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                setPreviewPdfUrl(url);
                setShowPreviewModal(true);
            } else {
                alert('Failed to download payment receipt');
            }
        } catch (err) {
            console.error('Error fetching receipt:', err);
            alert('Error fetching receipt');
        }
    };

    const handleAdmit = async () => {
        if ((!admitData.admissionFeeAmount && !admitData.annualFeeAmount) || (Number(admitData.admissionFeeAmount) <= 0 && Number(admitData.annualFeeAmount) <= 0)) {
            alert('Please check fee amounts.');
            return;
        }

        const requiresPaymentDetails = (amount, method) => Number(amount) > 0 && method === 'online';

        if (requiresPaymentDetails(admitData.admissionPaid, admitData.admissionPaymentMethod)) {
            if (!admitData.admissionPaymentDate || !admitData.admissionTransactionId) {
                alert('Please enter payment details for Admission Fee.');
                return;
            }
        }
        if (requiresPaymentDetails(admitData.annualPaid, admitData.annualPaymentMethod)) {
            if (!admitData.annualPaymentDate || !admitData.annualTransactionId) {
                alert('Please enter payment details for Annual Fee.');
                return;
            }
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admission/applications/${id}/admit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(admitData)
            });

            const data = await response.json();
            if (data.success) {
                // If photo was selected, upload it
                if (studentPhoto && data.studentId) {
                    const photoFormData = new FormData();
                    photoFormData.append('photo', studentPhoto);

                    try {
                        await fetch(`${API_URL}/api/admin/students/${data.studentId}/photo`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: photoFormData
                        });
                    } catch (photoErr) {
                        console.error('Photo upload failed:', photoErr);
                    }
                }

                alert('Student admitted successfully!');
                setShowAdmitModal(false);
                navigate('/admission/applications');
            } else {
                alert(data.message || 'Failed to admit student');
            }
        } catch (err) {
            console.error('Error admitting student:', err);
            alert('Failed to admit student');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason');
            return;
        }
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admission/applications/${id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rejectionReason })
            });

            const data = await response.json();
            if (data.success) {
                alert('Application rejected.');
                setShowRejectModal(false);
                navigate('/admission/applications');
            } else {
                alert(data.message || 'Failed to reject');
            }
        } catch (err) {
            console.error('Error rejecting:', err);
            alert('Failed to reject application');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || '';
        switch (statusLower) {
            case 'pending': return 'warning';
            case 'admitted': return 'success';
            case 'rejected': return 'danger';
            default: return 'info';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading details...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    {error || 'Application not found'}
                </div>
                <Button variant="secondary" onClick={() => navigate('/admission/applications')}>
                    Back to Applications
                </Button>
            </div>
        );
    }

    // Helper for rendering labeled value in structured tiles
    const DetailRow = ({ label, value, colSpan = 1 }) => (
        <div className={`p-2.5 sm:p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl transition-all hover:bg-slate-100/50 ${colSpan === 2 ? 'col-span-2' : ''}`}>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none">{label}</span>
            <p className="text-slate-900 font-bold text-xs sm:text-sm mt-1 leading-tight">{value || '-'}</p>
        </div>
    );

    return (
        <div className="space-y-2.5 sm:space-y-3.5 pb-2 flex flex-col h-full lg:h-[calc(100vh-100px)] lg:overflow-hidden">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-2.5 sm:p-4 text-white shadow-md sm:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/admission/applications')}
                        className="inline-flex items-center text-blue-100 hover:text-white text-xs font-bold mb-1 transition-colors group cursor-pointer"
                    >
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Applications
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xs sm:text-xl font-bold tracking-tight">Application Details #{application.application_no || id}</h1>
                        <Badge variant={getStatusBadge(application.status)} size="sm">
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0 z-10">
                    <button
                        onClick={handleDownloadPDF}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                        📄 <span className="hidden xs:inline">Download Application</span><span className="xs:hidden">Download</span>
                    </button>
                    {application.status.toLowerCase() === 'admitted' && (
                        <button
                            onClick={handleDownloadPaymentSlip}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                            🧾 <span className="hidden xs:inline">Payment Receipt</span><span className="xs:hidden">Receipt</span>
                        </button>
                    )}
                    {!isEditing && application.status.toLowerCase() !== 'rejected' && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-2.5 py-1.5 bg-white text-indigo-700 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 border border-white/40"
                        >
                            ✏️ Edit
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={processing}
                                className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={processing}
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            </div>

            {/* Content Grid */}
            <div className={`grid grid-cols-1 ${application.status.toLowerCase() === 'pending' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-2.5 sm:gap-3.5 flex-1 min-h-0 lg:overflow-hidden`}>

                {/* Main Information Column (Independent Scroll) */}
                <div className="lg:col-span-2 space-y-2.5 sm:space-y-3.5 lg:overflow-y-auto lg:pr-1.5 custom-scrollbar pb-6">
                    {/* Student Info */}
                    <Card title="Student Information" className="shadow-2xs border-slate-200/80">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input label="Full Name" name="studentName" value={editFormData.studentName} onChange={handleEditChange} />
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Gender</label>
                                    <select name="gender" value={editFormData.gender} onChange={handleEditChange} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <Input label="Date of Birth" type="date" name="dateOfBirth" value={editFormData.dateOfBirth} onChange={handleEditChange} />
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Class</label>
                                    <select name="class" value={editFormData.class} onChange={handleEditChange} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" disabled={classesLoading}>
                                        <option value="">{classesLoading ? 'Loading classes...' : 'Select Class'}</option>
                                        {[...classes]
                                            .sort((a, b) => (parseInt(a.class_number) || 0) - (parseInt(b.class_number) || 0))
                                            .map((cls) => (
                                                <option key={cls.id} value={cls.class_number}>
                                                    {cls.name || `Class ${cls.class_number}`}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                {isHigherSecondary(editFormData.class) && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">Stream / Group</label>
                                        <select name="stream_id" value={editFormData.stream_id} onChange={handleEditChange} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" disabled={streamsLoading}>
                                            <option value="">{streamsLoading ? 'Loading...' : 'Select Stream'}</option>
                                            {streams.map(s => <option key={s.id} value={s.id}>{s.stream_name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Blood Group</label>
                                    <select name="bloodGroup" value={editFormData.bloodGroup} onChange={handleEditChange} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg">
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <Input label="Email" name="email" value={editFormData.email} onChange={handleEditChange} />
                                <Input label="Phone" name="phone" value={editFormData.phone} onChange={handleEditChange} />
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-700">Address</label>
                                    <textarea name="address" value={editFormData.address} onChange={handleEditChange} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mt-1" rows="2" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                                <DetailRow label="Full Name" value={application.student_name} />
                                <DetailRow label="Gender" value={application.gender} />
                                <DetailRow label="Date of Birth" value={new Date(application.date_of_birth).toLocaleDateString('en-GB')} />
                                <DetailRow label="Applied For" value={`Class ${application.class}`} />
                                {application.stream_name && (
                                    <DetailRow label="Stream / Group" value={application.stream_name} />
                                )}
                                <DetailRow label="Blood Group" value={application.blood_group} />
                                <DetailRow label="Email" value={application.email} />
                                <DetailRow label="Phone" value={application.phone} />
                                <DetailRow label="Address" value={application.address} colSpan={2} />
                            </div>
                        )}
                    </Card>

                    {/* Uploaded Documents Section */}
                    <Card title="📁 Uploaded Documents" className="shadow-2xs border-slate-200/80">
                        {/* Photos */}
                        <div className="mb-3">
                            <h4 className="text-xs font-bold text-slate-700 mb-2">📷 Photos</h4>
                            <div className="flex flex-wrap gap-3">
                                {/* Student Photo */}
                                <div className="text-center">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-indigo-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-2xs"
                                        onClick={() => application.student_photo && handlePreviewDoc(`${API_URL}${application.student_photo}`, 'Student Photo')}>
                                        {application.student_photo ? (
                                            <img src={`${API_URL}${application.student_photo}`} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl text-slate-300">👤</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-bold mt-1">Student</p>
                                    <input type="file" accept="image/*" id="edit-student-photo" className="hidden" onChange={(e) => handleDocumentReplace('student_photo', e)} />
                                    <label htmlFor="edit-student-photo" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.student_photo ? 'Change' : 'Upload'}</label>
                                </div>
                                {/* Father Photo */}
                                <div className="text-center">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-blue-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-2xs"
                                        onClick={() => application.father_photo && handlePreviewDoc(`${API_URL}${application.father_photo}`, 'Father Photo')}>
                                        {application.father_photo ? (
                                            <img src={`${API_URL}${application.father_photo}`} alt="Father" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl text-slate-300">👨</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-bold mt-1">Father</p>
                                    <input type="file" accept="image/*" id="edit-father-photo" className="hidden" onChange={(e) => handleDocumentReplace('father_photo', e)} />
                                    <label htmlFor="edit-father-photo" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.father_photo ? 'Change' : 'Upload'}</label>
                                </div>
                                {/* Mother Photo */}
                                <div className="text-center">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-pink-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-2xs"
                                        onClick={() => application.mother_photo && handlePreviewDoc(`${API_URL}${application.mother_photo}`, 'Mother Photo')}>
                                        {application.mother_photo ? (
                                            <img src={`${API_URL}${application.mother_photo}`} alt="Mother" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl text-slate-300">👩</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-bold mt-1">Mother</p>
                                    <input type="file" accept="image/*" id="edit-mother-photo" className="hidden" onChange={(e) => handleDocumentReplace('mother_photo', e)} />
                                    <label htmlFor="edit-mother-photo" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.mother_photo ? 'Change' : 'Upload'}</label>
                                </div>
                            </div>
                        </div>
                        {/* Aadhaar Cards */}
                        <div className="mb-3">
                            <h4 className="text-xs font-bold text-slate-700 mb-2">🪪 Aadhaar Cards</h4>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5">
                                    {application.student_aadhaar ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.student_aadhaar}`, 'Student Aadhaar')} className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                                            <span>🖼️</span> Student Aadhaar
                                        </button>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400">📄 Student</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-student-aadhaar" className="hidden" onChange={(e) => handleDocumentReplace('student_aadhaar', e)} />
                                    <label htmlFor="edit-student-aadhaar" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.student_aadhaar ? 'Change' : 'Upload'}</label>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {application.father_aadhaar ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.father_aadhaar}`, 'Father Aadhaar')} className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                                            <span>🖼️</span> Father Aadhaar
                                        </button>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400">📄 Father</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-father-aadhaar" className="hidden" onChange={(e) => handleDocumentReplace('father_aadhaar', e)} />
                                    <label htmlFor="edit-father-aadhaar" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.father_aadhaar ? 'Change' : 'Upload'}</label>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {application.mother_aadhaar ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.mother_mother}`, 'Mother Aadhaar')} className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                                            <span>🖼️</span> Mother Aadhaar
                                        </button>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400">📄 Mother</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-mother-aadhaar" className="hidden" onChange={(e) => handleDocumentReplace('mother_aadhaar', e)} />
                                    <label htmlFor="edit-mother-aadhaar" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.mother_aadhaar ? 'Change' : 'Upload'}</label>
                                </div>
                            </div>
                        </div>
                        {/* PAN Cards */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 mb-2">💳 PAN Cards</h4>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5">
                                    {application.father_pan ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.father_pan}`, 'Father PAN')} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                                            <span>🖼️</span> Father PAN
                                        </button>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400">📄 Father</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-father-pan" className="hidden" onChange={(e) => handleDocumentReplace('father_pan', e)} />
                                    <label htmlFor="edit-father-pan" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.father_pan ? 'Change' : 'Upload'}</label>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {application.mother_pan ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.mother_pan}`, 'Mother PAN')} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                                            <span>🖼️</span> Mother PAN
                                        </button>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400">📄 Mother</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-mother-pan" className="hidden" onChange={(e) => handleDocumentReplace('mother_pan', e)} />
                                    <label htmlFor="edit-mother-pan" className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">{application.mother_pan ? 'Change' : 'Upload'}</label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Parents & Academic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
                        <Card title="Parents / Guardian" className="shadow-2xs border-slate-200/80">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Input label="Father's Name" name="fatherName" value={editFormData.fatherName} onChange={handleEditChange} />
                                    <Input label="Father's Phone" name="fatherPhone" value={editFormData.fatherPhone} onChange={handleEditChange} />
                                    <Input label="Mother's Name" name="motherName" value={editFormData.motherName} onChange={handleEditChange} />
                                    <Input label="Mother's Phone" name="motherPhone" value={editFormData.motherPhone} onChange={handleEditChange} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <DetailRow label="Father's Name" value={application.father_name} />
                                    <DetailRow label="Father's Phone" value={application.father_phone || application.parent_phone} />
                                    <DetailRow label="Mother's Name" value={application.mother_name} />
                                    <DetailRow label="Mother's Phone" value={application.mother_phone || '-'} />
                                </div>
                            )}
                        </Card>
                        <Card title="Academic & Medical" className="shadow-2xs border-slate-200/80">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Input label="Previous School" name="previousSchool" value={editFormData.previousSchool} onChange={handleEditChange} />
                                    <Input label="Previous Class" name="previousClass" value={editFormData.previousClass} onChange={handleEditChange} />
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Medical Conditions</label>
                                        <textarea name="medicalConditions" value={editFormData.medicalConditions} onChange={handleEditChange} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mt-1" rows="2" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <DetailRow label="Previous School" value={application.previous_school} />
                                    <DetailRow label="Previous Class" value={application.previous_class} />
                                    <DetailRow label="Medical Conditions" value={application.medical_conditions} />
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Sidebar: Status & Actions (Independent Scroll) */}
                <div className="space-y-2.5 sm:space-y-3.5 lg:overflow-y-auto lg:pr-1.5 custom-scrollbar pb-6">
                    <Card title="Application Status" className="shadow-2xs border-slate-200/80 border-l-[4px] border-l-indigo-600">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-slate-600 text-xs font-semibold">Application ID</span>
                                <span className="font-mono font-bold text-slate-900 text-xs">#{application.application_no}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-slate-600 text-xs font-semibold">Applied Date</span>
                                <span className="font-bold text-slate-900 text-xs">{new Date(application.applied_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            {application.status === 'admitted' && (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center mt-2">
                                    🎉 Admitted on {new Date(application.admitted_date).toLocaleDateString('en-GB')}
                                </div>
                            )}
                            {application.status === 'rejected' && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium mt-2">
                                    <p className="font-bold mb-0.5">❌ Rejected on {new Date(application.rejected_date).toLocaleDateString('en-GB')}</p>
                                    <p className="text-[11px] text-rose-700">{application.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Fee Estimation Card */}
                    <Card title="Fee Estimation" className="shadow-2xs border-slate-200/80 border-l-[4px] border-l-emerald-600">
                        {loadingFee ? (
                            <div className="py-4 text-center text-emerald-700 text-xs font-medium">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-1"></div>
                                Fetching fee estimation...
                            </div>
                        ) : feeStructure ? (
                            <div className="space-y-2.5">
                                {/* Applicable Academic Months Badge */}
                                {(() => {
                                    let studentMonths = [];
                                    if (application?.applicable_months) {
                                        try {
                                            studentMonths = typeof application.applicable_months === 'string'
                                                ? JSON.parse(application.applicable_months)
                                                : application.applicable_months;
                                        } catch (e) {}
                                    }
                                    if (!Array.isArray(studentMonths) || studentMonths.length === 0) {
                                        if (feeStructure?.applicable_months) {
                                            studentMonths = feeStructure.applicable_months;
                                        }
                                    }
                                    const monthsCount = (Array.isArray(studentMonths) && studentMonths.length > 0)
                                        ? studentMonths.length
                                        : (feeStructure?.months_count || 12);

                                    return (
                                        <>
                                            <div className="flex flex-wrap items-center justify-between bg-emerald-100/90 p-2 rounded-lg text-[11px] text-emerald-900 font-bold border border-emerald-200 shadow-2xs gap-1">
                                                <span className="flex items-center gap-1">🗓️ Applicable Months:</span>
                                                <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-2xs">
                                                    {monthsCount} Months {studentMonths.length > 0 && studentMonths.length < 12 ? `(${studentMonths[0]}–${studentMonths[studentMonths.length - 1]})` : '(Full Year)'}
                                                </span>
                                            </div>

                                            <div className="flex border-b border-emerald-200 pb-1 text-xs font-bold text-emerald-950">
                                                <div className="flex-1">Fee Component</div>
                                                <div className="text-right">Monthly / Unit</div>
                                                <div className="w-24 text-right">Academic Total</div>
                                            </div>

                                            {(() => {
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
                                                                <span className="w-24 text-right font-mono font-semibold">₹{admissionVal.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}

                                                        {items.map(item => item.monthlyVal > 0 && (
                                                            <div key={item.label} className="flex justify-between items-center text-xs text-emerald-900">
                                                                <span className="flex-1 font-medium">{item.label}</span>
                                                                <span className="font-mono text-emerald-700 text-[11px] text-right font-semibold">
                                                                    ₹{item.monthlyVal.toLocaleString('en-IN')}/mo
                                                                </span>
                                                                <span className="w-24 text-right font-mono font-bold text-emerald-950">
                                                                    ₹{(item.isMonthly ? item.monthlyVal * monthsCount : item.monthlyVal).toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        ))}

                                                        <div className="border-t border-dashed border-emerald-300 pt-2 mt-2 space-y-1">
                                                            <div className="flex justify-between items-center text-xs text-emerald-900">
                                                                <span className="font-semibold text-emerald-900">Monthly Total ({monthsCount} months)</span>
                                                                <span className="font-mono font-bold text-emerald-800">₹{totalMonthlyAcademic.toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-emerald-950 pt-1 border-t border-emerald-200">
                                                                <span className="font-black text-xs">Total Estimated Academic Fee</span>
                                                                <span className="font-black text-base font-mono text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center py-3 px-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 font-medium">
                                ⚠️ No fee structure configured for Class {application.class}.
                            </div>
                        )}
                    </Card>

                    {/* Action Cards for Pending state */}
                    {application.status === 'pending' && !isEditing && (
                        <div className="space-y-2">
                            <button
                                onClick={openAdmitModal}
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>✨</span> Confirm Admission
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="w-full py-2.5 px-4 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>❌</span> Reject Application
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Preview Modal */}
            <Modal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                title={previewDoc?.name || 'Document Preview'}
                className="max-w-4xl w-full"
            >
                <div className="p-4 flex items-center justify-center bg-slate-100 rounded-lg min-h-[400px]">
                    {previewDoc?.type === 'image' ? (
                        <img
                            src={previewDoc.url}
                            alt={previewDoc.name}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                        />
                    ) : (
                        <iframe
                            src={previewDoc?.url}
                            title={previewDoc?.name}
                            className="w-full h-[80vh] rounded-lg shadow-lg bg-white"
                        />
                    )}
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => window.open(previewDoc?.url, '_blank')}
                    >
                        Open in New Tab
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setPreviewDoc(null)}
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            {/* Admit Student Modal */}
            <Modal isOpen={showAdmitModal} onClose={() => setShowAdmitModal(false)} title="Confirm Admission" size="md">
                <div className="space-y-3 text-xs">
                    {/* Compact Student Header Banner */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Admitting Student</span>
                            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{application.student_name}</h3>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                            Class {application.class}
                        </span>
                    </div>

                    {/* Compact Photo Upload Section */}
                    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : application.student_photo ? (
                                    <img src={`${API_URL}${application.student_photo}`} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg text-slate-400">📷</span>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-800">Student Photo</label>
                                <p className="text-[10px] text-slate-500">Max 5MB, JPG/PNG</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" id="photo-upload" />
                            <label htmlFor="photo-upload" className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer font-bold text-[11px] transition-colors shadow-2xs">
                                {(photoPreview || application.student_photo) ? 'Change' : 'Upload'}
                            </label>
                            {photoPreview && (
                                <button type="button" onClick={() => { setStudentPhoto(null); setPhotoPreview(null); }} className="text-red-500 hover:text-red-700 text-[11px] font-bold px-1.5 py-1">
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section Assignment & Fee Structure Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Assign Section</label>
                            <select
                                value={admitData.section}
                                onChange={(e) => setAdmitData({ ...admitData, section: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                                disabled={sectionsLoading}
                            >
                                {sectionsLoading ? (
                                    <option>Loading sections...</option>
                                ) : classSections.length > 0 ? (
                                    classSections.map(sec => (
                                        <option key={sec.section_id} value={sec.section_code}>
                                            {sec.section_name}
                                        </option>
                                    ))
                                ) : (
                                    ['A', 'B', 'C', 'D'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)
                                )}
                            </select>
                        </div>

                        {/* Fixed Total Fee Structure Card */}
                        {(() => {
                            let studentMonths = [];
                            if (application?.applicable_months) {
                                try {
                                    studentMonths = typeof application.applicable_months === 'string'
                                        ? JSON.parse(application.applicable_months)
                                        : application.applicable_months;
                                } catch (e) {}
                            }
                            if (!Array.isArray(studentMonths) || studentMonths.length === 0) {
                                if (feeStructure?.applicable_months) {
                                    studentMonths = feeStructure.applicable_months;
                                }
                            }
                            const monthsCount = (Array.isArray(studentMonths) && studentMonths.length > 0)
                                ? studentMonths.length
                                : (feeStructure?.months_count || 12);

                            return (
                                <div className="sm:col-span-2 bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 shadow-2xs space-y-2">
                                    <div className="flex flex-wrap items-center justify-between border-b border-emerald-200/80 pb-1.5 gap-1">
                                        <h4 className="text-emerald-950 font-extrabold text-xs flex items-center gap-1">
                                            💳 Total Fee Structure
                                        </h4>
                                        {monthsCount > 0 && (
                                            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-2xs">
                                                🗓️ {monthsCount} Months {studentMonths.length > 0 && studentMonths.length < 12 ? `(${studentMonths[0]}–${studentMonths[studentMonths.length - 1]})` : '(Full Year)'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Admission Fee</span>
                                            <p className="text-sm font-black text-emerald-950 font-mono mt-0.5">
                                                ₹{Number(admitData.admissionFeeAmount || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Academic Fee</span>
                                                <span className="text-[9px] text-emerald-600 font-extrabold">({monthsCount} mo)</span>
                                            </div>
                                            <p className="text-sm font-black text-emerald-950 font-mono mt-0.5">
                                                ₹{Number(admitData.annualFeeAmount || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-emerald-200 pt-1.5 flex justify-between items-center bg-emerald-100/70 p-2 rounded-lg">
                                        <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">Total Amount</span>
                                        <span className="text-base font-black text-emerald-800 font-mono">
                                            ₹{(Number(admitData.admissionFeeAmount || 0) + Number(admitData.annualFeeAmount || 0)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Payment Details Section */}
                    <div className="space-y-2 pt-1 border-t border-slate-200">
                        {/* Admission Fee Payment */}
                        <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="text-[11px] font-extrabold text-slate-800 block">Admission Fee Payment</span>
                            <div className="grid grid-cols-2 gap-2">
                                <Input label="Amount Paid" type="number" value={admitData.admissionPaid} onChange={(e) => setAdmitData({ ...admitData, admissionPaid: e.target.value })} placeholder="₹ 0" />
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Method</label>
                                    <select value={admitData.admissionPaymentMethod} onChange={(e) => setAdmitData({ ...admitData, admissionPaymentMethod: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white">
                                        <option value="offline">Offline / Cash</option>
                                        <option value="online">Online / UPI</option>
                                    </select>
                                </div>
                            </div>
                            {admitData.admissionPaymentMethod === 'online' && Number(admitData.admissionPaid) > 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                                    <Input label="Date" type="date" value={admitData.admissionPaymentDate} onChange={(e) => setAdmitData({ ...admitData, admissionPaymentDate: e.target.value })} />
                                    <Input label="Transaction ID" value={admitData.admissionTransactionId} onChange={(e) => setAdmitData({ ...admitData, admissionTransactionId: e.target.value })} />
                                </div>
                            )}
                        </div>

                        {/* Annual Fee Payment */}
                        <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="text-[11px] font-extrabold text-slate-800 block">Annual Fee Payment</span>
                            <div className="grid grid-cols-2 gap-2">
                                <Input label="Amount Paid" type="number" value={admitData.annualPaid} onChange={(e) => setAdmitData({ ...admitData, annualPaid: e.target.value })} placeholder="₹ 0" />
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Method</label>
                                    <select value={admitData.annualPaymentMethod} onChange={(e) => setAdmitData({ ...admitData, annualPaymentMethod: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white">
                                        <option value="offline">Offline / Cash</option>
                                        <option value="online">Online / UPI</option>
                                    </select>
                                </div>
                            </div>
                            {admitData.annualPaymentMethod === 'online' && Number(admitData.annualPaid) > 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                                    <Input label="Date" type="date" value={admitData.annualPaymentDate} onChange={(e) => setAdmitData({ ...admitData, annualPaymentDate: e.target.value })} />
                                    <Input label="Transaction ID" value={admitData.annualTransactionId} onChange={(e) => setAdmitData({ ...admitData, annualTransactionId: e.target.value })} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                        <Button variant="secondary" onClick={() => setShowAdmitModal(false)}>Cancel</Button>
                        <Button variant="success" onClick={handleAdmit} disabled={processing}>
                            {processing ? 'Processing...' : 'Confirm Admission'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Application">
                <div className="space-y-4">
                    <p className="text-slate-600">Are you sure you want to reject this application?</p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="Reason for rejection..."
                        rows="3"
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleReject} disabled={processing}>Reject Application</Button>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="Payment Receipt Preview" size="lg">
                {previewPdfUrl && (
                    <div className="h-[60vh] w-full">
                        <iframe src={previewPdfUrl} className="w-full h-full rounded-lg border border-slate-200" title="PDF Preview" />
                    </div>
                )}
                <div className="flex justify-end mt-4">
                    <Button variant="primary" onClick={() => {
                        const a = document.createElement('a');
                        a.href = previewPdfUrl;
                        a.download = `Receipt_${application.application_no}.pdf`;
                        a.click();
                    }}>Download Receipt</Button>
                </div>
            </Modal>
        </div>
    );
};

export default ApplicationDetails;