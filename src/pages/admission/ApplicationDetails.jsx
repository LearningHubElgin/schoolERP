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
                    motherName: data.application.mother_name,
                    parentPhone: data.application.parent_phone || '',
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
                setAdmitData(prev => ({
                    ...prev,
                    annualFeeAmount: data.feeStructure.total_fee || 0,
                    admissionFeeAmount: data.feeStructure.admission_fee || 0,
                    admissionPaid: data.feeStructure.admission_fee || 0, // Pre-fill
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

    // Helper for rendering labeled value
    const DetailRow = ({ label, value }) => (
        <div className="mb-4 last:mb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</span>
            <p className="text-slate-800 font-medium text-lg border-b border-slate-100 pb-2">{value || '-'}</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admission/applications')}
                        className="flex items-center text-slate-500 hover:text-slate-800 mb-2 transition-colors group"
                    >
                        <svg className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Application Details</h1>
                        <Badge variant={getStatusBadge(application.status)} size="lg">
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 ">
                    <Button variant="secondary" onClick={handleDownloadPDF} className="bg-green-500 border-slate-200">
                        📄 Download Application
                    </Button>
                    {application.status.toLowerCase() === 'admitted' && (
                        <Button variant="primary" onClick={handleDownloadPaymentSlip}>
                            🧾 Payment Receipt
                        </Button>
                    )}
                    {!isEditing && application.status.toLowerCase() !== 'rejected' && (
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            ✏️ Edit
                        </Button>
                    )}
                    {isEditing && (
                        <>
                            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button variant="success" onClick={handleSaveChanges} disabled={processing}>
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className={`grid grid-cols-1 ${application.status.toLowerCase() === 'pending' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>

                {/* Main Information Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Student Info */}
                    <Card title="Student Information" className="shadow-sm border-slate-200">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name" name="studentName" value={editFormData.studentName} onChange={handleEditChange} />
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Gender</label>
                                    <select name="gender" value={editFormData.gender} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <Input label="Date of Birth" type="date" name="dateOfBirth" value={editFormData.dateOfBirth} onChange={handleEditChange} />
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Class</label>
                                    <select name="class" value={editFormData.class} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" disabled={classesLoading}>
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
                                        <label className="text-sm font-medium text-slate-700">Stream / Group</label>
                                        <select name="stream_id" value={editFormData.stream_id} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" disabled={streamsLoading}>
                                            <option value="">{streamsLoading ? 'Loading...' : 'Select Stream'}</option>
                                            {streams.map(s => <option key={s.id} value={s.id}>{s.stream_name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Blood Group</label>
                                    <select name="bloodGroup" value={editFormData.bloodGroup} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <Input label="Email" name="email" value={editFormData.email} onChange={handleEditChange} />
                                <Input label="Phone" name="phone" value={editFormData.phone} onChange={handleEditChange} />
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Address</label>
                                    <textarea name="address" value={editFormData.address} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1" rows="3" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                                <div className="md:col-span-2">
                                    <DetailRow label="Address" value={application.address} />
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Uploaded Documents Section */}
                    <Card title="📁 Uploaded Documents" className="shadow-sm border-slate-200">
                        {/* Photos */}
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-slate-600 mb-3">📷 Photos</h4>
                            <div className="flex flex-wrap gap-4">
                                {/* Student Photo */}
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-lg border-2 border-cyan-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => application.student_photo && handlePreviewDoc(`${API_URL}${application.student_photo}`, 'Student Photo')}>
                                        {application.student_photo ? (
                                            <img src={`${API_URL}${application.student_photo}`} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl text-slate-300">👤</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Student</p>
                                    <input type="file" accept="image/*" id="edit-student-photo" className="hidden" onChange={(e) => handleDocumentReplace('student_photo', e)} />
                                    <label htmlFor="edit-student-photo" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.student_photo ? 'Change' : 'Upload'}</label>
                                </div>
                                {/* Father Photo */}
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-lg border-2 border-blue-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => application.father_photo && handlePreviewDoc(`${API_URL}${application.father_photo}`, 'Father Photo')}>
                                        {application.father_photo ? (
                                            <img src={`${API_URL}${application.father_photo}`} alt="Father" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl text-slate-300">👨</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Father</p>
                                    <input type="file" accept="image/*" id="edit-father-photo" className="hidden" onChange={(e) => handleDocumentReplace('father_photo', e)} />
                                    <label htmlFor="edit-father-photo" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.father_photo ? 'Change' : 'Upload'}</label>
                                </div>
                                {/* Mother Photo */}
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-lg border-2 border-pink-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => application.mother_photo && handlePreviewDoc(`${API_URL}${application.mother_photo}`, 'Mother Photo')}>
                                        {application.mother_photo ? (
                                            <img src={`${API_URL}${application.mother_photo}`} alt="Mother" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl text-slate-300">👩</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Mother</p>
                                    <input type="file" accept="image/*" id="edit-mother-photo" className="hidden" onChange={(e) => handleDocumentReplace('mother_photo', e)} />
                                    <label htmlFor="edit-mother-photo" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.mother_photo ? 'Change' : 'Upload'}</label>
                                </div>
                            </div>
                        </div>
                        {/* Aadhaar Cards */}
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-slate-600 mb-3">🪪 Aadhaar Cards</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    {application.student_aadhaar ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.student_aadhaar}`, 'Student Aadhaar')} className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 hover:bg-orange-100 flex items-center gap-2">
                                            <span>�️</span> View Student Aadhaar
                                        </button>
                                    ) : (
                                        <span className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400">📄 Student</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-student-aadhaar" className="hidden" onChange={(e) => handleDocumentReplace('student_aadhaar', e)} />
                                    <label htmlFor="edit-student-aadhaar" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.student_aadhaar ? 'Change' : 'Upload'}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    {application.father_aadhaar ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.father_aadhaar}`, 'Father Aadhaar')} className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 hover:bg-orange-100 flex items-center gap-2">
                                            <span>�️</span> View Father Aadhaar
                                        </button>
                                    ) : (
                                        <span className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400">📄 Father</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-father-aadhaar" className="hidden" onChange={(e) => handleDocumentReplace('father_aadhaar', e)} />
                                    <label htmlFor="edit-father-aadhaar" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.father_aadhaar ? 'Change' : 'Upload'}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    {application.mother_aadhaar ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.mother_aadhaar}`, 'Mother Aadhaar')} className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 hover:bg-orange-100 flex items-center gap-2">
                                            <span>�️</span> View Mother Aadhaar
                                        </button>
                                    ) : (
                                        <span className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400">📄 Mother</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-mother-aadhaar" className="hidden" onChange={(e) => handleDocumentReplace('mother_aadhaar', e)} />
                                    <label htmlFor="edit-mother-aadhaar" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.mother_aadhaar ? 'Change' : 'Upload'}</label>
                                </div>
                            </div>
                        </div>
                        {/* PAN Cards */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-600 mb-3">💳 PAN Cards</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    {application.father_pan ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.father_pan}`, 'Father PAN')} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 flex items-center gap-2">
                                            <span>�️</span> View Father PAN
                                        </button>
                                    ) : (
                                        <span className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400">📄 Father</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-father-pan" className="hidden" onChange={(e) => handleDocumentReplace('father_pan', e)} />
                                    <label htmlFor="edit-father-pan" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.father_pan ? 'Change' : 'Upload'}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    {application.mother_pan ? (
                                        <button onClick={() => handlePreviewDoc(`${API_URL}${application.mother_pan}`, 'Mother PAN')} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 flex items-center gap-2">
                                            <span>�️</span> View Mother PAN
                                        </button>
                                    ) : (
                                        <span className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400">📄 Mother</span>
                                    )}
                                    <input type="file" accept="image/*,.pdf" id="edit-mother-pan" className="hidden" onChange={(e) => handleDocumentReplace('mother_pan', e)} />
                                    <label htmlFor="edit-mother-pan" className="text-xs text-blue-600 cursor-pointer hover:underline">{application.mother_pan ? 'Change' : 'Upload'}</label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Parents & Academic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Parents / Guardian" className="shadow-sm border-slate-200">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input label="Father's Name" name="fatherName" value={editFormData.fatherName} onChange={handleEditChange} />
                                    <Input label="Mother's Name" name="motherName" value={editFormData.motherName} onChange={handleEditChange} />
                                    <Input label="Parent Phone" name="parentPhone" value={editFormData.parentPhone} onChange={handleEditChange} />
                                </div>
                            ) : (
                                <>
                                    <DetailRow label="Father's Name" value={application.father_name} />
                                    <DetailRow label="Mother's Name" value={application.mother_name} />
                                    <DetailRow label="Contact Number" value={application.parent_phone} />
                                </>
                            )}
                        </Card>
                        <Card title="Academic & Medical" className="shadow-sm border-slate-200">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input label="Previous School" name="previousSchool" value={editFormData.previousSchool} onChange={handleEditChange} />
                                    <Input label="Previous Class" name="previousClass" value={editFormData.previousClass} onChange={handleEditChange} />
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Medical Conditions</label>
                                        <textarea name="medicalConditions" value={editFormData.medicalConditions} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg mt-1" rows="2" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <DetailRow label="Previous School" value={application.previous_school} />
                                    <DetailRow label="Previous Class" value={application.previous_class} />
                                    <DetailRow label="Medical Conditions" value={application.medical_conditions} />
                                </>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Sidebar: Status & Actions */}
                <div className="space-y-6">
                    <Card title="Application Status" className="shadow-md border-t-4 border-t-cyan-500">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Application ID</span>
                                <span className="font-mono font-bold text-slate-800">#{application.application_no}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Applied Date</span>
                                <span className="font-medium text-slate-800">{new Date(application.applied_date).toLocaleDateString('en-GB')}</span>
                            </div>
                            {application.status === 'admitted' && (
                                <div className="p-3 bg-green-50 rounded-lg text-green-800 text-sm font-medium text-center">
                                    Admitted on {new Date(application.admitted_date).toLocaleDateString('en-GB')}
                                </div>
                            )}
                            {application.status === 'rejected' && (
                                <div className="p-3 bg-red-50 rounded-lg text-red-800 text-sm font-medium">
                                    <p className="font-bold mb-1">Rejected on {new Date(application.rejected_date).toLocaleDateString('en-GB')}</p>
                                    <p className="text-xs">{application.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Action Cards for Pending state */}
                    {application.status === 'pending' && !isEditing && (
                        <div className="space-y-4">
                            <button
                                onClick={openAdmitModal}
                                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] transition-all font-bold text-lg flex items-center justify-center gap-2"
                            >
                                <span>✨</span> Confirm Admission
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="w-full p-4 bg-white border-2 border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold flex items-center justify-center gap-2"
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
            <Modal isOpen={showAdmitModal} onClose={() => setShowAdmitModal(false)} title="Confirm Admission">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-slate-600 text-sm">Admitting Student:</p>
                        <h3 className="text-lg font-bold text-slate-900">{application.student_name}</h3>
                        <p className="text-slate-500 text-xs">Class {application.class}</p>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-slate-700 mb-3">📷 Student Photo (Optional)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : application.student_photo ? (
                                    <img src={`${API_URL}${application.student_photo}`} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-slate-300">📷</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className="inline-block px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors font-medium text-sm"
                                >
                                    {(photoPreview || application.student_photo) ? 'Change Photo' : 'Upload Photo'}
                                </label>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setStudentPhoto(null); setPhotoPreview(null); }}
                                        className="ml-2 text-red-500 text-sm hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                                <p className="text-xs text-slate-500 mt-2">Max 5MB, JPG/PNG format</p>
                                {application.student_photo && !photoPreview && (
                                    <p className="text-xs text-green-600 mt-1">✅ Photo from application will be used</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Assign Section</label>
                            <select
                                value={admitData.section}
                                onChange={(e) => setAdmitData({ ...admitData, section: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
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
                            {classSections.length === 0 && !sectionsLoading && (
                                <p className="text-xs text-yellow-600 mt-1">⚠️ Using default sections. Configure class-specific sections in Admin.</p>
                            )}
                        </div>

                        {/* Fee Structure Summary */}
                        <div className="md:col-span-2">
                            {loadingFee ? (
                                <div className="p-4 bg-slate-50 text-center text-sm text-slate-500">Loading Fees...</div>
                            ) : feeStructure ? (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                    <h4 className="text-emerald-800 font-bold text-sm mb-3">Total Fee Structure</h4>
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <span className="text-xs text-emerald-600 uppercase font-bold">Admission Fee</span>
                                            <p className="text-xl font-bold text-emerald-900">₹{Number(admitData.admissionFeeAmount).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-emerald-600 uppercase font-bold">Annual Fee</span>
                                            <p className="text-xl font-bold text-emerald-900">₹{Number(admitData.annualFeeAmount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-emerald-200 pt-3 mt-3 flex justify-between items-center">
                                        <span className="text-sm font-black text-emerald-800 uppercase tracking-wider">Total Amount</span>
                                        <span className="text-2xl font-black text-emerald-900">
                                            ₹{(Number(admitData.admissionFeeAmount) + Number(admitData.annualFeeAmount)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-yellow-50 text-yellow-700 text-sm">Fee structure not set. Enter amounts manually.</div>
                            )}
                        </div>

                        {/* Payment Inputs - Split Logic */}
                        <div className="md:col-span-2 border-t pt-2">
                            <h5 className="font-bold text-slate-700 mb-2">Admission Fee Payment</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Amount Paid" type="number" value={admitData.admissionPaid} onChange={(e) => setAdmitData({ ...admitData, admissionPaid: e.target.value })} placeholder="₹ 0" />
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Method</label>
                                    <select value={admitData.admissionPaymentMethod} onChange={(e) => setAdmitData({ ...admitData, admissionPaymentMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1">
                                        <option value="offline">Offline / Cash</option>
                                        <option value="online">Online / UPI</option>
                                    </select>
                                </div>
                            </div>
                            {admitData.admissionPaymentMethod === 'online' && Number(admitData.admissionPaid) > 0 && (
                                <div className="grid grid-cols-2 gap-4 mt-2 bg-slate-50 p-3 rounded-lg">
                                    <Input label="Date" type="date" value={admitData.admissionPaymentDate} onChange={(e) => setAdmitData({ ...admitData, admissionPaymentDate: e.target.value })} />
                                    <Input label="Transaction ID" value={admitData.admissionTransactionId} onChange={(e) => setAdmitData({ ...admitData, admissionTransactionId: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 border-t pt-2">
                            <h5 className="font-bold text-slate-700 mb-2">Annual Fee Payment</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Amount Paid" type="number" value={admitData.annualPaid} onChange={(e) => setAdmitData({ ...admitData, annualPaid: e.target.value })} placeholder="₹ 0" />
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Method</label>
                                    <select value={admitData.annualPaymentMethod} onChange={(e) => setAdmitData({ ...admitData, annualPaymentMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1">
                                        <option value="offline">Offline / Cash</option>
                                        <option value="online">Online / UPI</option>
                                    </select>
                                </div>
                            </div>
                            {admitData.annualPaymentMethod === 'online' && Number(admitData.annualPaid) > 0 && (
                                <div className="grid grid-cols-2 gap-4 mt-2 bg-slate-50 p-3 rounded-lg">
                                    <Input label="Date" type="date" value={admitData.annualPaymentDate} onChange={(e) => setAdmitData({ ...admitData, annualPaymentDate: e.target.value })} />
                                    <Input label="Transaction ID" value={admitData.annualTransactionId} onChange={(e) => setAdmitData({ ...admitData, annualTransactionId: e.target.value })} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
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