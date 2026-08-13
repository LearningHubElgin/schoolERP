import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { compressImage } from '../../utils/imageCompressor';

const StatCard = ({ title, value, icon, color, borderColor }) => {
    const borderColors = {
        'border-blue-500': '#3b82f6',
        'border-cyan-500': '#06b6d4',
        'border-indigo-500': '#6366f1',
        'border-emerald-500': '#10b981',
        'border-purple-500': '#a855f7',
        'border-orange-500': '#f97316',
        'border-red-500': '#ef4444',
        'border-pink-500': '#ec4899',
    };

    return (
        <div
            className={`bg-white rounded-xl border border-slate-100 border-l-4 shadow-xs hover:shadow-md transition-all duration-200 p-2 sm:p-2.5 flex items-center justify-between gap-1.5 h-full ${borderColor}`}
            style={{ borderLeftColor: borderColors[borderColor] }}
        >
            <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight mb-0.5 truncate">{title}</p>
                <p className="text-xs sm:text-base font-bold text-slate-800 whitespace-nowrap">{value}</p>
            </div>
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs sm:text-sm ${color} shrink-0`}>
                {icon}
            </div>
        </div>
    );
};

const StudentDetailCard = ({ icon, iconColor, label, value, className = '' }) => (
    <div className={`flex items-center p-2.5 sm:p-3 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 hover:shadow-md transition-all h-full group ${className}`}>
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${iconColor} group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
        </div>
        <div className="flex-1 min-w-0 ml-3">
            <span className="text-xs font-medium text-slate-400 block mb-0.5">{label?.toLowerCase()}</span>
            <span className="text-xs sm:text-sm font-medium text-slate-800 truncate block" title={value}>{value}</span>
        </div>
    </div>
);

const TeacherStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterBloodGroup, setFilterBloodGroup] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [editFormData, setEditFormData] = useState({});
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState({
        father_photo: null,
        mother_photo: null,
        student_aadhaar: null,
        father_aadhaar: null,
        mother_aadhaar: null,
        father_pan: null,
        mother_pan: null
    });
    const [docPreviews, setDocPreviews] = useState({});
    const [uploadingDocs, setUploadingDocs] = useState(false);
    const [previewDoc, setPreviewDoc] = useState({ isOpen: false, url: null, title: null });
    const [classSections, setClassSections] = useState([]);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [filterSections, setFilterSections] = useState([]);
    const [classStreams, setClassStreams] = useState([]);
    const [filterStreams, setFilterStreams] = useState([]);
    const [filterStream, setFilterStream] = useState('');
    const downloadMenuRef = useRef(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null, variant: 'danger' });
    const [resultModal, setResultModal] = useState({ open: false, title: '', message: '', variant: 'success' });
    const [submitting, setSubmitting] = useState(false);
    const [addFormData, setAddFormData] = useState({
        name: '',
        email: '',
        phone: '',
        class: '',
        section: '',
        fatherName: '',
        motherName: '',
        fatherPhone: '',
        motherPhone: '',
        address: '',
        dateOfBirth: '',
        rollNo: '',
        bloodGroup: '',
        gender: '',
        medicalConditions: '',
        student_unique_id: ''
    });

    const isHigherSecondaryClass = (classNumber) => {
        const cn = String(classNumber);
        return cn === '11' || cn === '12';
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/teacher/manage-students`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setStudents(data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses();
        fetchSections();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
                setShowDownloadMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesName = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = filterClass === '' || String(student.class) === String(filterClass);
        const matchesSection = filterSection === '' || String(student.section) === String(filterSection);
        const matchesGender = filterGender === '' || student.gender === filterGender;
        const matchesBloodGroup = filterBloodGroup === '' || student.blood_group === filterBloodGroup;
        const matchesStream = filterStream === '' || String(student.stream_id) === String(filterStream);
        return matchesName && matchesClass && matchesSection && matchesGender && matchesBloodGroup && matchesStream;
    }).sort((a, b) => {
        if (filterClass !== '' || filterSection !== '') {
            const rollA = parseInt(a.roll_no) || 0;
            const rollB = parseInt(b.roll_no) || 0;
            if (rollA !== rollB) return rollA - rollB;
            return a.name.localeCompare(b.name);
        }
        return 0;
    });

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const sortedClasses = [...data.classes].sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                );
                setClasses(sortedClasses);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/sections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setSections(data.sections);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleClearFilters = () => {
        setFilterClass('');
        setFilterSection('');
        setFilterStream('');
        setFilterGender('');
        setFilterBloodGroup('');
        setSearchQuery('');
        setFilterSections([]);
        setFilterStreams([]);
    };

    const fetchClassStreams = async (classNumber) => {
        try {
            const token = localStorage.getItem('token');
            const selectedCls = classes.find(c => String(c.class_number) === String(classNumber));
            if (!selectedCls) return [];
            const response = await fetch(`${API_URL}/api/teacher/class-streams/${selectedCls.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) return data.streams || [];
            return [];
        } catch (error) {
            console.error('Error fetching class streams:', error);
            return [];
        }
    };

    const fetchFilterSections = async (classNumber, streamId) => {
        if (!classNumber) {
            setFilterSections([]);
            setFilterSection('');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const selectedClass = classes.find(c => String(c.class_number) === String(classNumber));
            if (!selectedClass) {
                setFilterSections([]);
                return;
            }
            let url = `${API_URL}/api/teacher/class-sections/${selectedClass.id}`;
            if (streamId) url += `?stream_id=${streamId}`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success && data.sections.length > 0) setFilterSections(data.sections);
            else setFilterSections([]);
        } catch (error) {
            console.error('Error fetching filter sections:', error);
            setFilterSections([]);
        }
    };

    const fetchSectionsByClass = async (classNumber, streamId) => {
        if (!classNumber) {
            setClassSections([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const selectedClass = classes.find(c => String(c.class_number) === String(classNumber));
            if (!selectedClass) {
                setClassSections([]);
                return;
            }
            let url = `${API_URL}/api/teacher/class-sections/${selectedClass.id}`;
            if (streamId) url += `?stream_id=${streamId}`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                const normalized = data.sections.map(sec => ({
                    ...sec,
                    section_code: sec.section_code || sec.code,
                    section_name: sec.section_name || sec.name
                }));
                setClassSections(normalized);
            } else setClassSections([]);
        } catch (error) {
            console.error('Error fetching class sections:', error);
            setClassSections([]);
        }
    };

    const handleView = (student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditFormData({
            ...student,
            user_id: student.user_id || student.id || '',
            student_unique_id: student.student_unique_id || '',
            name: student.name || '',
            rollNo: student.roll_no || '',
            email: student.email || '',
            phone: student.phone || '',
            fatherName: student.father_name || '',
            motherName: student.mother_name || '',
            fatherPhone: student.father_phone || student.fatherPhone || '',
            motherPhone: student.mother_phone || student.motherPhone || '',
            address: student.address || '',
            bloodGroup: student.blood_group || '',
            gender: student.gender || '',
            medicalConditions: student.medical_conditions || '',
            stream_id: student.stream_id || '',
            dateOfBirth: student.date_of_birth ? (() => {
                const d = new Date(student.date_of_birth);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            })() : ''
        });
        setPhotoPreview(student.photo_path ? `${API_URL}${student.photo_path}` : null);
        setSelectedPhoto(null);
        setIsPhotoRemoved(false);
        setSelectedDocs({
            father_photo: null,
            mother_photo: null,
            student_aadhaar: null,
            father_aadhaar: null,
            mother_aadhaar: null,
            father_pan: null,
            mother_pan: null
        });
        setDocPreviews({
            father_photo: student.father_photo ? `${API_URL}${student.father_photo}` : null,
            mother_photo: student.mother_photo ? `${API_URL}${student.mother_photo}` : null,
            student_aadhaar: student.student_aadhaar ? `${API_URL}${student.student_aadhaar}` : null,
            father_aadhaar: student.father_aadhaar ? `${API_URL}${student.father_aadhaar}` : null,
            mother_aadhaar: student.mother_aadhaar ? `${API_URL}${student.mother_aadhaar}` : null,
            father_pan: student.father_pan ? `${API_URL}${student.father_pan}` : null,
            mother_pan: student.mother_pan ? `${API_URL}${student.mother_pan}` : null
        });
        if (isHigherSecondaryClass(student.class)) {
            fetchClassStreams(student.class).then(streams => {
                setClassStreams(streams);
                if (student.stream_id) fetchSectionsByClass(student.class, student.stream_id);
                else setClassSections([]);
            });
        } else {
            setClassStreams([]);
            fetchSectionsByClass(student.class);
        }
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/teacher/manage-students/${editFormData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editFormData)
            });
            const data = await response.json();
            if (data.success) {
                if (isPhotoRemoved && editFormData.id) {
                    try {
                        await fetch(`${API_URL}/api/teacher/manage-students/${editFormData.id}/photo`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                    } catch (err) {
                        console.error('Error deleting photo on save:', err);
                    }
                } else if (selectedPhoto) {
                    await handlePhotoUpload(editFormData.id);
                }
                const docsToUpload = Object.keys(selectedDocs).filter(key => selectedDocs[key] !== null);
                if (docsToUpload.length > 0) await handleDocsUpload(editFormData.id);
                setResultModal({ open: true, title: '✅ Success', message: 'Student updated successfully', variant: 'success' });
                setIsEditModalOpen(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
                setIsPhotoRemoved(false);
                fetchStudents();
            } else {
                setResultModal({ open: true, title: '❌ Failed', message: data.message || 'Failed to update student', variant: 'danger' });
            }
        } catch (error) {
            console.error('Error updating student:', error);
            setResultModal({ open: true, title: '❌ Error', message: 'An error occurred while updating the student.', variant: 'danger' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddStudent = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const missingFields = [];
            if (!addFormData.name || !addFormData.name.trim()) missingFields.push('Full Name');
            if (!addFormData.dateOfBirth) missingFields.push('Date of Birth');
            if (!addFormData.gender) missingFields.push('Gender');
            if (!addFormData.class) missingFields.push('Class');
            if (!addFormData.section) missingFields.push('Section');
            if (!addFormData.rollNo || !addFormData.rollNo.trim()) missingFields.push('Roll Number');
            if (addFormData.class && isHigherSecondaryClass(addFormData.class) && !addFormData.stream_id) {
                missingFields.push('Group (Stream)');
            }

            if (missingFields.length > 0) {
                setResultModal({
                    open: true,
                    title: '⚠️ Required Fields Missing',
                    message: `Please provide the following mandatory fields before adding a student:\n\n• ${missingFields.join('\n• ')}`,
                    variant: 'danger'
                });
                setSubmitting(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/teacher/manage-students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(addFormData)
            });
            const data = await response.json();
            if (data.success) {
                const newStudentId = data.studentId || data.student?.id;
                if (selectedPhoto && newStudentId) {
                    await handlePhotoUpload(newStudentId);
                }
                setResultModal({ open: true, title: '✅ Success', message: 'Student added successfully', variant: 'success' });
                setIsAddModalOpen(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
                setIsPhotoRemoved(false);
                setAddFormData({
                    name: '', email: '', phone: '', class: '', section: '', fatherName: '', motherName: '',
                    fatherPhone: '', motherPhone: '', address: '', rollNo: '', dateOfBirth: '', bloodGroup: '', gender: '',
                    medicalConditions: '', student_unique_id: ''
                });
                fetchStudents();
            } else {
                setResultModal({ open: true, title: '❌ Failed', message: data.message || 'Failed to add student', variant: 'danger' });
            }
        } catch (error) {
            console.error('Error adding student:', error);
            setResultModal({ open: true, title: '❌ Error', message: 'An error occurred while adding the student.', variant: 'danger' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (student) => {
        setConfirmModal({
            open: true,
            title: '🗑️ Delete Student',
            message: `Are you sure you want to delete "${student.name}"? This action cannot be undone.`,
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/api/teacher/manage-students/${student.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setResultModal({ open: true, title: '✅ Success', message: 'Student deleted successfully.', variant: 'success' });
                        fetchStudents();
                    } else {
                        setResultModal({ open: true, title: '❌ Error', message: data.message || 'Failed to delete student.', variant: 'error' });
                    }
                } catch (error) {
                    console.error('Error deleting student:', error);
                    setResultModal({ open: true, title: '❌ Error', message: 'Error deleting student. Please try again.', variant: 'error' });
                }
            }
        });
    };

    const handlePhotoSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, or WebP)');
                return;
            }
            try {
                const compressed = await compressImage(file);
                setSelectedPhoto(compressed);
                setPhotoPreview(URL.createObjectURL(compressed));
                setIsPhotoRemoved(false);
            } catch (error) {
                console.error('Error compressing image:', error);
                setSelectedPhoto(file);
                setPhotoPreview(URL.createObjectURL(file));
                setIsPhotoRemoved(false);
            }
        }
    };

    const handleRemovePhoto = () => {
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setIsPhotoRemoved(true);
    };

    const handlePhotoUpload = async (studentId) => {
        if (!selectedPhoto) return;
        setUploadingPhoto(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('photo', selectedPhoto);
            const response = await fetch(`${API_URL}/api/teacher/manage-students/${studentId}/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (!data.success) console.error('Photo upload failed:', data.message);
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDocSelect = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            if (!isImage && !isPDF) {
                alert('Please select a valid image or PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedDocs(prev => ({ ...prev, [field]: file }));
            if (isImage) setDocPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
            else setDocPreviews(prev => ({ ...prev, [field]: 'pdf_icon' }));
        }
    };

    const handleDocsUpload = async (studentId) => {
        const docsToUpload = Object.keys(selectedDocs).filter(key => selectedDocs[key] !== null);
        if (docsToUpload.length === 0) return;
        setUploadingDocs(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            docsToUpload.forEach(field => formData.append(field, selectedDocs[field]));
            const response = await fetch(`${API_URL}/api/teacher/manage-students/${studentId}/documents`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (!data.success) console.error('Document upload failed:', data.message);
        } catch (error) {
            console.error('Error uploading documents:', error);
        } finally {
            setUploadingDocs(false);
        }
    };

    const handleViewDoc = (url, title) => {
        if (!url) return;
        setPreviewDoc({ isOpen: true, url, title });
    };

    const handlePromote = (student) => {
        const classNum = parseInt(String(student.class), 10);
        if (classNum === 10) {
            setResultModal({ open: true, title: '⚠️ Cannot Promote', message: 'Cannot promote from Class 10 to 11. Please reassign manually for Higher Secondary.', variant: 'error' });
            return;
        }
        if (classNum === 12) {
            setResultModal({ open: true, title: '⚠️ Cannot Promote', message: 'Class 12 is the final class. Cannot promote further.', variant: 'error' });
            return;
        }
        setConfirmModal({
            open: true,
            title: '🎓 Promote Student',
            message: `Are you sure you want to promote "${student.name}" from Class ${student.class} to Class ${classNum + 1}?\n\nNote: All fees must be cleared before promotion.`,
            variant: 'success',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/api/teacher/manage-students/${student.id}/promote`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setResultModal({ open: true, title: '✅ Success', message: data.message, variant: 'success' });
                        fetchStudents();
                    } else {
                        setResultModal({ open: true, title: '❌ Error', message: data.message || 'Failed to promote student.', variant: 'error' });
                    }
                } catch (error) {
                    console.error('Error promoting student:', error);
                    setResultModal({ open: true, title: '❌ Error', message: 'Failed to promote student. Please try again.', variant: 'error' });
                }
            }
        });
    };

    const columns = [
        { header: 'Roll No', accessor: 'roll_no' },
        { header: 'Student ID', accessor: 'student_unique_id' },
        {
            header: 'Name',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div
                        className={`w-9 h-9 rounded-full overflow-hidden bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center justify-center text-xs shrink-0 shadow-xs ${row.photo_path ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-indigo-400 transition-all' : ''}`}
                        onClick={() => row.photo_path && handleViewDoc(`${API_URL}${row.photo_path}`, `${row.name}'s Photo`)}
                        title={row.photo_path ? "Click to view photo" : ""}
                    >
                        {row.photo_path ? (
                            <img
                                src={`${API_URL}${row.photo_path}`}
                                alt={row.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            row.name?.charAt(0)?.toUpperCase() || 'S'
                        )}
                    </div>
                    <span className="font-semibold text-slate-800">{row.name}</span>
                </div>
            )
        },
        { header: 'Class/Sec', accessor: 'class', render: (row) => `${row.class}-${row.section}` },
        { header: 'Group', accessor: 'stream_name', render: (row) => isHigherSecondaryClass(row.class) ? (row.stream_name || 'N/A') : '-' },
        { header: 'Father Name', accessor: 'father_name' },
    ];

    const canPromote = (classNumber) => {
        const num = parseInt(String(classNumber), 10);
        return !isNaN(num) && ((num >= 1 && num <= 9) || num === 11);
    };

    const actions = (row) => (
        <div className="flex flex-wrap gap-1 min-w-max">
            <Button size="sm" variant="secondary" onClick={() => handleView(row)}>View</Button>
            <Button size="sm" variant="primary" onClick={() => handleEdit(row)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>Delete</Button>
            {canPromote(row.class) && (
                <Button size="sm" variant="success" onClick={() => handlePromote(row)} style={{ backgroundColor: '#10b981', color: 'white' }}>Promote</Button>
            )}
        </div>
    );

    const totalStudents = students.length;
    const totalClasses = new Set(students.map(s => s.class)).size;
    const totalSections = new Set(students.map(s => `${s.class}-${s.section}`)).size;
    const activeStudents = students.filter(s => s.status !== 'Inactive').length;

    const getDownloadData = () => {
        return filteredStudents.map(s => ({
            'Roll No': s.roll_no || '',
            'Name': s.name || '',
            'Class': s.class || '',
            'Section': s.section || '',
            'Group': isHigherSecondaryClass(s.class) ? (s.stream_name || '') : '',
            'Father Name': s.father_name || '',
            'Mother Name': s.mother_name || '',
            'Phone': s.phone || '',
            'Email': s.email || '',
            'Gender': s.gender || '',
            'Blood Group': s.blood_group || '',
            'Date of Birth': s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : '',
            'Address': s.address || ''
        }));
    };

    const handleDownloadPDF = async () => {
        setShowDownloadMenu(false);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('l', 'mm', 'a4');
            const schoolName = localStorage.getItem('schoolName') || 'School';
            const filterParts = [];
            if (filterClass) filterParts.push(`Class_${filterClass}`);
            if (filterStream) { const streamObj = filterStreams.find(s => String(s.id) === String(filterStream)); if (streamObj) filterParts.push(streamObj.name); }
            if (filterSection) filterParts.push(`Sec_${filterSection}`);
            if (filterGender) filterParts.push(filterGender);
            const filterLabel = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`${schoolName} - Student List`, 14, 15);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total: ${filteredStudents.length} students${filterParts.length > 0 ? ' | Filters: ' + filterParts.join(', ') : ''}`, 14, 22);
            const tableData = filteredStudents.map(s => [
                s.roll_no || '',
                s.name || '',
                `${s.class}-${s.section}`,
                isHigherSecondaryClass(s.class) ? (s.stream_name || '') : '-',
                s.father_name || '',
                s.phone || '',
                s.email || '',
                s.gender || '',
                s.blood_group || ''
            ]);
            const { default: autoTable } = await import('jspdf-autotable');
            autoTable(doc, {
                head: [['Roll No', 'Name', 'Class/Sec', 'Group', 'Father Name', 'Phone', 'Email', 'Gender', 'Blood Group']],
                body: tableData,
                startY: 28,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 255] },
            });
            doc.save(`Students_List${filterLabel}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('PDF download error:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handleDownloadExcel = async () => {
        setShowDownloadMenu(false);
        try {
            const XLSX = await import('xlsx');
            const data = getDownloadData();
            const worksheet = XLSX.utils.json_to_sheet(data);
            worksheet['!cols'] = [
                { wch: 8 }, { wch: 22 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
                { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 22 },
                { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 30 }
            ];
            const filterParts = [];
            if (filterClass) filterParts.push(`Class_${filterClass}`);
            if (filterStream) { const streamObj = filterStreams.find(s => String(s.id) === String(filterStream)); if (streamObj) filterParts.push(streamObj.name); }
            if (filterSection) filterParts.push(`Sec_${filterSection}`);
            if (filterGender) filterParts.push(filterGender);
            const filterLabel = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
            XLSX.writeFile(workbook, `Students_List${filterLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error('Excel download error:', error);
            alert('Failed to download Excel. Please try again.');
        }
    };

    return (
        <div className="space-y-3 sm:space-y-6 pb-6 sm:pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-3 sm:p-6 md:p-8 text-white shadow-md sm:shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-base sm:text-xl md:text-3xl font-medium tracking-tight">Student management (Teacher access) 👨‍🎓</h1>
                    <p className="mt-1 text-indigo-100 text-xs sm:text-sm md:text-lg max-w-2xl">Manage student records, admissions, and academic details efficiently.</p>
                    <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
                        <button onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); setIsPhotoRemoved(false); setIsAddModalOpen(true); }} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-indigo-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-opacity-90 transition-all shadow-md active:scale-95">+ Add new student</button>
                        <button onClick={fetchStudents} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-700/40 text-white border border-white/20 rounded-lg text-xs sm:text-sm font-medium hover:bg-opacity-50 transition-all active:scale-95">🔄 Refresh data</button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-10 -mb-16 w-48 h-48 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                <StatCard title="Total Students" value={totalStudents} icon="🎓" color="bg-blue-100 text-blue-600" borderColor="border-blue-500" />
                <StatCard title="Active Classes" value={totalClasses} icon="🏫" color="bg-emerald-100 text-emerald-600" borderColor="border-emerald-500" />
                <StatCard title="Total Sections" value={totalSections} icon="📑" color="bg-purple-100 text-purple-600" borderColor="border-purple-500" />
                <StatCard title="Girls / Boys / Others" value={`${students.filter(s => s.gender === 'Female').length} / ${students.filter(s => s.gender === 'Male').length} / ${students.filter(s => s.gender && s.gender !== 'Male' && s.gender !== 'Female').length}`} icon="👫" color="bg-pink-100 text-pink-600" borderColor="border-pink-500" />
                <StatCard title="New Admissions (30d)" value={students.filter(s => { const admissionDate = new Date(s.admission_date || s.created_at); const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); return admissionDate >= thirtyDaysAgo; }).length} icon="🆕" color="bg-orange-100 text-orange-600" borderColor="border-orange-500" />
            </div>

            {/* Student Table Section */}
            <Card variant="elevated">
                <div className="flex flex-row justify-between items-center gap-2 mb-3">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800">Student directory</h3>
                        <p className="text-xs text-slate-500">Showing {filteredStudents.length} students</p>
                    </div>
                    <div className="relative" ref={downloadMenuRef}>
                        <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all shadow-xs active:scale-95 flex items-center gap-1.5">
                            📥 Download <svg className={`w-3 h-3 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {showDownloadMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[160px]">
                                <button onClick={handleDownloadPDF} className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"><span className="text-base">📄</span> PDF</button>
                                <button onClick={handleDownloadExcel} className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 border-t border-gray-100"><span className="text-base">📊</span> Excel</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                    <div className="relative flex-1 min-w-[180px] sm:min-w-[220px]">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <select className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={filterClass} onChange={async (e) => { const val = e.target.value; setFilterClass(val); setFilterSection(''); setFilterStreams([]); setFilterSections([]); if (val && isHigherSecondaryClass(val)) { const streams = await fetchClassStreams(val); setFilterStreams(streams); } else { fetchFilterSections(val); } }}>
                        <option value="">All Classes</option>
                        {[...classes].sort((a, b) => (parseInt(a.class_number) || 0) - (parseInt(b.class_number) || 0)).map((cls, idx) => <option key={`cls-${cls.id || cls.class_number || idx}`} value={cls.class_number}>{cls.name}</option>)}
                    </select>
                    {filterClass && isHigherSecondaryClass(filterClass) && (
                        <select className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => { setFilterStream(e.target.value); setFilterSection(''); if (e.target.value) fetchFilterSections(filterClass, e.target.value); else setFilterSections([]); }} value={filterStream} disabled={filterStreams.length === 0}>
                            <option value="">All Groups</option>
                            {filterStreams.map((stream, idx) => <option key={`stream-${stream.id || idx}`} value={stream.id}>{stream.name}</option>)}
                        </select>
                    )}
                    <select className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={filterSection} onChange={(e) => setFilterSection(e.target.value)} disabled={!filterClass || filterSections.length === 0}>
                        <option value="">All Sections</option>
                        {filterSections.map((sec, idx) => <option key={`sec-${sec.id || sec.section_code || sec.code || idx}`} value={sec.section_code || sec.code}>{sec.section_code || sec.code}</option>)}
                    </select>
                    <select className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                        <option value="">All Genders</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                    <select className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={filterBloodGroup} onChange={(e) => setFilterBloodGroup(e.target.value)}>
                        <option value="">All Blood Groups</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                    {(filterClass || filterSection || searchQuery || filterGender || filterBloodGroup) && (
                        <button onClick={handleClearFilters} className="px-2.5 py-1.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-lg font-semibold hover:bg-rose-100 transition-colors">❌ Clear</button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <Table columns={columns} data={filteredStudents} actions={actions} isLoading={loading} />
                </div>
            </Card>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Details" size="lg" footer={<Button onClick={() => setIsViewModalOpen(false)}>Close</Button>}>
                {selectedStudent && (
                    <div className="space-y-4 pb-2">
                        <div className="-mx-5 -mt-4 bg-[#2a2b4b] px-4 py-5 text-white flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#5c7cfa] border-4 border-[#3e3f61] cursor-pointer hover:border-indigo-400 transition-all shadow-lg flex-shrink-0 flex items-center justify-center text-2xl font-bold" onClick={() => selectedStudent.photo_path && handleViewDoc(`${API_URL}${selectedStudent.photo_path}`, `${selectedStudent.name}'s Photo`)} title={selectedStudent.photo_path ? "View Full Photo" : ""}>
                                {selectedStudent.photo_path ? <img src={`${API_URL}${selectedStudent.photo_path}`} alt={selectedStudent.name} className="w-full h-full object-cover" /> : selectedStudent.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl font-medium truncate">{selectedStudent.name}</h2>
                                <p className="text-[#a5b4fc] text-xs">Student • Class {selectedStudent.class}-{selectedStudent.section} • Roll No: {selectedStudent.roll_no || 'N/A'}</p>
                                <div className="mt-2 text-[11px] px-2 py-0.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full inline-block font-medium">{selectedStudent.status === 'Inactive' ? 'inactive' : 'active'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <StudentDetailCard className="col-span-2" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} iconColor="bg-[#339af0]" label="STUDENT ID" value={selectedStudent.student_unique_id || 'N/A'} />
                            <StudentDetailCard className="col-span-2" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>} iconColor="bg-[#5c7cfa]" label="EMAIL" value={selectedStudent.email || 'N/A'} />
                            <StudentDetailCard className="col-span-2" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>} iconColor="bg-[#20c997]" label="STUDENT PHONE NUMBER" value={selectedStudent.phone || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>} iconColor="bg-[#9775fa]" label="GROUP / STREAM" value={selectedStudent.stream_name || (isHigherSecondaryClass(selectedStudent.class) ? 'Not Assigned' : 'N/A')} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>} iconColor="bg-[#f06595]" label="DATE OF BIRTH" value={selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString('en-GB') : 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} iconColor="bg-[#e03131]" label="BLOOD GROUP" value={selectedStudent.blood_group || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>} iconColor="bg-[#fa5252]" label="ROLL NUMBER" value={selectedStudent.roll_no || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} iconColor="bg-[#22b8cf]" label="GENDER" value={selectedStudent.gender || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} iconColor="bg-[#cc5de8]" label="FATHER'S NAME" value={selectedStudent.father_name || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>} iconColor="bg-[#cc5de8]" label="FATHER PHONE" value={selectedStudent.father_phone || selectedStudent.fatherPhone || selectedStudent.guardian_phone || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} iconColor="bg-[#845ef7]" label="MOTHER'S NAME" value={selectedStudent.mother_name || 'N/A'} />
                            <StudentDetailCard icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>} iconColor="bg-[#845ef7]" label="MOTHER PHONE" value={selectedStudent.mother_phone || selectedStudent.motherPhone || 'N/A'} />
                        </div>

                        <div className="space-y-3 mt-2">
                            <div className="flex items-center p-3 border rounded-lg bg-white hover:border-indigo-100 w-full">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm bg-[#f06595]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>
                                <div className="flex-1 ml-3"><span className="text-xs font-medium text-slate-400 block mb-0.5">Residential address</span><span className="text-xs font-medium text-slate-800 break-words">{selectedStudent.address || 'N/A'}</span></div>
                            </div>
                        </div>

                        {selectedStudent.medical_conditions && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg"><h4 className="text-xs font-medium text-orange-800 flex items-center gap-2 mb-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> Medical conditions</h4><p className="text-xs text-orange-900">{selectedStudent.medical_conditions}</p></div>
                        )}

                        <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2 mb-3">📁 Uploaded documents</h3>
                            <div className="space-y-4">
                                <div><h4 className="text-[11px] font-medium text-slate-500 mb-2">📷 Photos</h4><div className="flex flex-wrap gap-3">
                                    {[{ label: 'Student', path: selectedStudent.photo_path }, { label: 'Father', path: selectedStudent.father_photo }, { label: 'Mother', path: selectedStudent.mother_photo }].map((doc, idx) => doc.path && (
                                        <div key={idx} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm cursor-pointer hover:border-indigo-400" onClick={() => handleViewDoc(`${API_URL}${doc.path}`, `${doc.label} Photo`)}><img src={`${API_URL}${doc.path}`} alt={doc.label} className="w-full h-full object-cover" /></div><span className="text-[9px] font-medium text-gray-600">{doc.label}</span></div>
                                    ))}
                                </div></div>
                                {(selectedStudent.student_aadhaar || selectedStudent.father_aadhaar || selectedStudent.mother_aadhaar) && (
                                    <div><h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">🆔 Aadhaar Cards</h4><div className="flex flex-wrap gap-2">
                                        {[{ label: 'Student Aadhaar', path: selectedStudent.student_aadhaar }, { label: 'Father Aadhaar', path: selectedStudent.father_aadhaar }, { label: 'Mother Aadhaar', path: selectedStudent.mother_aadhaar }].map((doc, idx) => doc.path && (
                                            <button key={idx} onClick={() => handleViewDoc(`${API_URL}${doc.path}`, doc.label)} className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-[10px] font-bold text-orange-700 hover:bg-orange-100 flex items-center gap-1">🔸 View {doc.label}</button>
                                        ))}
                                    </div></div>
                                )}
                                {(selectedStudent.father_pan || selectedStudent.mother_pan) && (
                                    <div><h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">💳 PAN Cards</h4><div className="flex flex-wrap gap-2">
                                        {[{ label: 'Father PAN', path: selectedStudent.father_pan }, { label: 'Mother PAN', path: selectedStudent.mother_pan }].map((doc, idx) => doc.path && (
                                            <button key={idx} onClick={() => handleViewDoc(`${API_URL}${doc.path}`, doc.label)} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-[10px] font-bold text-blue-700 hover:bg-blue-100 flex items-center gap-1">🔹 View {doc.label}</button>
                                        ))}
                                    </div></div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Details" size="lg" footer={<><Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleUpdate} disabled={submitting}>{submitting ? 'Updating...' : 'Save Changes'}</Button></>}>
                <div className="space-y-4">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-200 border-2 sm:border-4 border-indigo-200 shadow-xs">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-400">
                                    {editFormData.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                            <label className="cursor-pointer px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs">
                                📁 {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </label>
                            <label className="cursor-pointer px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs">
                                📸 Take Photo (Camera)
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </label>
                            {(photoPreview || selectedPhoto || (editFormData.photo_path && !isPhotoRemoved)) && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95"
                                >
                                    🗑️ Remove Photo
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500">Auto-compressed (JPEG, PNG, WebP)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Full Name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                        <Input label="Student Unique ID" value={editFormData.student_unique_id} onChange={(e) => setEditFormData({ ...editFormData, student_unique_id: e.target.value })} placeholder="e.g. BALLY2026001" />
                        <Input label="Numeric User ID" value={editFormData.user_id} disabled onChange={() => {}} />
                        <Input label="Roll Number" value={editFormData.rollNo} onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })} />
                        <Input label="Email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                        <Input label="Student Phone Number" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                        <div><label className="block text-xs font-medium mb-1">Date of Birth</label><input type="date" className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.dateOfBirth} onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })} /></div>
                        <div><label className="block text-xs font-medium mb-1">Gender</label><select className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div><label className="block text-xs font-medium mb-1">Class</label><select className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.class} onChange={(e) => { const val = e.target.value; setEditFormData({ ...editFormData, class: val, section: '', stream_id: '' }); if (val) { if (isHigherSecondaryClass(val)) fetchClassStreams(val).then(streams => setClassStreams(streams)); else fetchSectionsByClass(val); } else { setClassSections([]); setClassStreams([]); } }}><option value="">Select</option>{classes.map((cls) => <option key={cls.id} value={cls.class_number}>{cls.name}</option>)}</select></div>
                        {editFormData.class && isHigherSecondaryClass(editFormData.class) && (
                            <div><label className="block text-xs font-medium mb-1">Group (Stream)</label><select className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.stream_id || ''} onChange={(e) => { setEditFormData({ ...editFormData, stream_id: e.target.value, section: '' }); if (e.target.value) fetchSectionsByClass(editFormData.class, e.target.value); else setClassSections([]); }} disabled={classStreams.length === 0}><option value="">Select Group</option>{classStreams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        )}
                        <div><label className="block text-xs font-medium mb-1">Section</label><select className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.section} onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })} disabled={!editFormData.class || (isHigherSecondaryClass(editFormData.class) && !editFormData.stream_id)}><option value="">Select</option>{classSections.map((sec) => <option key={sec.id || sec.section_id} value={sec.section_code}>{sec.section_code}</option>)}</select></div>
                        <Input label="Father's Name" value={editFormData.fatherName} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })} />
                        <Input label="Father Phone Number" value={editFormData.fatherPhone ?? ''} onChange={(e) => setEditFormData({ ...editFormData, fatherPhone: e.target.value, father_phone: e.target.value })} />
                        <Input label="Mother's Name" value={editFormData.motherName} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })} />
                        <Input label="Mother Phone Number" value={editFormData.motherPhone ?? ''} onChange={(e) => setEditFormData({ ...editFormData, motherPhone: e.target.value, mother_phone: e.target.value })} />
                        <div><label className="block text-xs font-medium mb-1">Blood Group</label><select className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.bloodGroup} onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
                        <div className="col-span-2"><Input label="Address" value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} /></div>
                        <div className="col-span-2"><label className="block text-xs font-medium mb-1">Medical Conditions</label><textarea rows={2} className="w-full px-3 py-1.5 text-sm border rounded-lg" value={editFormData.medicalConditions} onChange={(e) => setEditFormData({ ...editFormData, medicalConditions: e.target.value })} /></div>
                        <div className="col-span-2 mt-2 pt-4 border-t border-gray-200"><h3 className="text-sm font-bold text-slate-800 mb-3">📁 Uploaded Documents</h3>
                            <div className="space-y-5">
                                <div><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">📷 Photos</h4><div className="flex flex-wrap gap-4">
                                    {[{ label: 'Student', field: 'photo_path', preview: photoPreview, isMain: true }, { label: 'Father', field: 'father_photo', preview: docPreviews.father_photo }, { label: 'Mother', field: 'mother_photo', preview: docPreviews.mother_photo }].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-1"><div onClick={() => item.preview && handleViewDoc(item.preview, `${item.label} Photo Preview`)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${item.isMain ? 'border-indigo-500' : 'border-slate-200'} bg-white shadow-md group relative ${item.preview ? 'cursor-pointer' : ''}`}>{item.preview ? <img src={item.preview} alt={item.label} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 text-2xl">👤</div>}</div><div className="flex flex-col items-center"><span className="text-[9px] font-bold text-slate-500">{item.label}</span><label className="text-[9px] font-extrabold text-indigo-600 cursor-pointer underline">Change<input type="file" accept="image/*" onChange={(e) => item.isMain ? handlePhotoSelect(e) : handleDocSelect(e, item.field)} className="hidden" /></label></div></div>
                                    ))}
                                </div></div>
                                <div><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">🆔 Aadhaar Cards</h4><div className="flex flex-wrap gap-3">
                                    {[{ label: 'Student Aadhaar', field: 'student_aadhaar' }, { label: 'Father Aadhaar', field: 'father_aadhaar' }, { label: 'Mother Aadhaar', field: 'mother_aadhaar' }].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border rounded-xl p-2"><button onClick={() => handleViewDoc(docPreviews[item.field])} disabled={!docPreviews[item.field]} className={`w-8 h-8 rounded-lg flex items-center justify-center ${docPreviews[item.field] ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>🔸</button><div><span className="text-[10px] font-bold text-slate-800">{item.label}</span><label className="text-[9px] font-extrabold text-slate-500 underline cursor-pointer block">Change<input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocSelect(e, item.field)} className="hidden" /></label></div></div>
                                    ))}
                                </div></div>
                                <div><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">💳 PAN Cards</h4><div className="flex flex-wrap gap-3">
                                    {[{ label: 'Father PAN', field: 'father_pan' }, { label: 'Mother PAN', field: 'mother_pan' }].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border rounded-xl p-2"><button onClick={() => handleViewDoc(docPreviews[item.field])} disabled={!docPreviews[item.field]} className={`w-8 h-8 rounded-lg flex items-center justify-center ${docPreviews[item.field] ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>🔹</button><div><span className="text-[10px] font-bold text-slate-800">{item.label}</span><label className="text-[9px] font-extrabold text-slate-500 underline cursor-pointer block">Change<input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocSelect(e, item.field)} className="hidden" /></label></div></div>
                                    ))}
                                </div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Student Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setSelectedPhoto(null); setPhotoPreview(null); setIsPhotoRemoved(false); }} title="Add New Student" size="lg" footer={<><Button variant="secondary" onClick={() => { setIsAddModalOpen(false); setSelectedPhoto(null); setPhotoPreview(null); setIsPhotoRemoved(false); }}>Cancel</Button><Button variant="primary" onClick={handleAddStudent} disabled={submitting}>{submitting ? 'Adding...' : 'Add Student'}</Button></>}>
                <div className="flex flex-wrap gap-x-[6%] gap-y-1">
                    {/* Profile Photo & Camera Section */}
                    <div className="w-full flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                        <div className="relative mb-2">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Student Profile Preview"
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-indigo-600 shadow-md"
                                />
                            ) : (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold text-2xl shadow-inner">
                                    📷
                                </div>
                            )}
                            {photoPreview && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
                                    title="Remove Photo"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95">
                                📁 {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </label>
                            <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95">
                                📸 Take Photo (Camera)
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </label>
                            {photoPreview && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
                                >
                                    🗑️ Remove Photo
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Auto-compressed (JPEG, PNG, WebP)</p>
                    </div>

                    {/* Full-width: Full Name */}
                    <div className="w-full mb-2">
                        <Input small label="Full Name" value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })} required />
                    </div>
                    {/* Full-width: Student Unique ID */}
                    <div className="w-full mb-2">
                        <Input small label="Student Unique ID (Optional)" value={addFormData.student_unique_id} onChange={(e) => setAddFormData({ ...addFormData, student_unique_id: e.target.value })} placeholder="Leave blank to auto-generate" />
                    </div>
                    {/* Full-width: Email */}
                    <div className="w-full mb-2">
                        <Input small label="Email" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} />
                    </div>
                    {/* Full-width: Student Phone Number */}
                    <div className="w-full mb-2">
                        <Input small label="Student Phone Number" value={addFormData.phone} onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })} />
                    </div>
                    {/* Half-width: Date of Birth */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Date of Birth <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={addFormData.dateOfBirth}
                            required
                            onChange={(e) => setAddFormData({ ...addFormData, dateOfBirth: e.target.value })}
                        />
                    </div>
                    {/* Half-width: Gender */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Gender <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                            value={addFormData.gender}
                            required
                            onChange={(e) => setAddFormData({ ...addFormData, gender: e.target.value })}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    {/* Half-width: Blood Group */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
                        <select
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                            value={addFormData.bloodGroup}
                            onChange={(e) => setAddFormData({ ...addFormData, bloodGroup: e.target.value })}
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                    </div>
                    {/* Half-width: Class */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Class <span className="text-red-500 ml-1">*</span></label>
                        <select
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                            value={addFormData.class}
                            onChange={(e) => {
                                const val = e.target.value;
                                setAddFormData({ ...addFormData, class: val, section: '', stream_id: '' });
                                if (val) {
                                    if (isHigherSecondaryClass(val)) {
                                        fetchClassStreams(val).then(streams => setClassStreams(streams));
                                        setClassSections([]);
                                    } else {
                                        fetchSectionsByClass(val);
                                        setClassStreams([]);
                                    }
                                } else {
                                    setClassSections([]);
                                    setClassStreams([]);
                                }
                            }}
                            required
                        >
                            <option value="">Select Class</option>
                            {[...classes].sort((a, b) => (parseInt(a.class_number) || 0) - (parseInt(b.class_number) || 0)).map((cls) => (
                                <option key={cls.id} value={cls.class_number}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Half-width: Group (Stream) */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Group (Stream) {addFormData.class && isHigherSecondaryClass(addFormData.class) && <span className="text-red-500 ml-1">*</span>}</label>
                        <select
                            className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg ${addFormData.class && isHigherSecondaryClass(addFormData.class) && classStreams.length > 0 ? '' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            value={addFormData.stream_id || ''}
                            onChange={(e) => {
                                setAddFormData({ ...addFormData, stream_id: e.target.value, section: '' });
                                if (e.target.value) {
                                    fetchSectionsByClass(addFormData.class, e.target.value);
                                } else {
                                    setClassSections([]);
                                }
                            }}
                            disabled={!addFormData.class || !isHigherSecondaryClass(addFormData.class) || classStreams.length === 0}
                        >
                            <option value="">{!addFormData.class || !isHigherSecondaryClass(addFormData.class) ? 'Not applicable' : 'Select Group'}</option>
                            {classStreams.map((stream) => (
                                <option key={stream.id} value={stream.id}>{stream.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Half-width: Section */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Section <span className="text-red-500 ml-1">*</span></label>
                        <select
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                            value={addFormData.section}
                            onChange={(e) => setAddFormData({ ...addFormData, section: e.target.value })}
                            required
                            disabled={!addFormData.class || (isHigherSecondaryClass(addFormData.class) && !addFormData.stream_id)}
                        >
                            <option value="">{!addFormData.class ? 'Select Class First' : (isHigherSecondaryClass(addFormData.class) && !addFormData.stream_id) ? 'Select Group First' : 'Select Section'}</option>
                            {classSections.map((sec) => (
                                <option key={sec.id || sec.section_id} value={sec.section_code}>{sec.section_code}</option>
                            ))}
                        </select>
                    </div>
                    {/* Half-width: Roll Number */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <Input small label="Roll Number" value={addFormData.rollNo} onChange={(e) => setAddFormData({ ...addFormData, rollNo: e.target.value })} required />
                    </div>
                    {/* Half-width: Father's Name */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <Input small label="Father's Name" value={addFormData.fatherName} onChange={(e) => setAddFormData({ ...addFormData, fatherName: e.target.value })} />
                    </div>
                    {/* Half-width: Father Phone Number */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <Input small label="Father Phone Number" value={addFormData.fatherPhone} onChange={(e) => setAddFormData({ ...addFormData, fatherPhone: e.target.value, father_phone: e.target.value })} />
                    </div>
                    {/* Half-width: Mother's Name */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <Input small label="Mother's Name" value={addFormData.motherName} onChange={(e) => setAddFormData({ ...addFormData, motherName: e.target.value })} />
                    </div>
                    {/* Half-width: Mother Phone Number */}
                    <div className="w-full sm:w-[47%] mb-2">
                        <Input small label="Mother Phone Number" value={addFormData.motherPhone} onChange={(e) => setAddFormData({ ...addFormData, motherPhone: e.target.value, mother_phone: e.target.value })} />
                    </div>
                    {/* Full-width: Address */}
                    <div className="w-full">
                        <Input small label="Address" value={addFormData.address} onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })} />
                    </div>
                    {/* Full-width: Medical Conditions */}
                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Medical Conditions (if any)</label>
                        <textarea
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter any medical conditions or allergies (or write 'None')"
                            value={addFormData.medicalConditions}
                            onChange={(e) => setAddFormData({ ...addFormData, medicalConditions: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))} title={confirmModal.title} size="sm" footer={<><Button variant="secondary" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>Cancel</Button><Button variant={confirmModal.variant === 'success' ? 'success' : 'danger'} onClick={confirmModal.onConfirm}>{confirmModal.variant === 'danger' ? 'Yes, Delete' : 'Yes, Promote'}</Button></>}>
                <div className="text-center py-3"><div className="text-4xl mb-3">{confirmModal.variant === 'danger' ? '⚠️' : '🎓'}</div><p className="text-sm text-gray-700 whitespace-pre-line">{confirmModal.message}</p></div>
            </Modal>

            {/* Result Modal */}
            <Modal isOpen={resultModal.open} onClose={() => setResultModal(prev => ({ ...prev, open: false }))} title={resultModal.title} size="sm" footer={<Button variant="primary" onClick={() => setResultModal(prev => ({ ...prev, open: false }))}>OK</Button>}>
                <div className="text-center py-3"><div className="text-4xl mb-3">{resultModal.variant === 'success' ? '✅' : '❌'}</div><p className="text-sm text-gray-700 whitespace-pre-line text-left max-w-sm mx-auto">{resultModal.message}</p></div>
            </Modal>

            {/* Document Preview Modal */}
            <Modal isOpen={previewDoc.isOpen} onClose={() => setPreviewDoc({ ...previewDoc, isOpen: false })} title={previewDoc.title || 'Document Preview'} size="lg" footer={<div className="flex justify-end gap-3 w-full"><Button variant="secondary" onClick={() => setPreviewDoc({ ...previewDoc, isOpen: false })}>Close</Button><Button variant="primary" onClick={async () => { try { const response = await fetch(previewDoc.url); const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${previewDoc.title || 'document'}${previewDoc.url.substring(previewDoc.url.lastIndexOf('.'))}`; link.click(); link.remove(); window.URL.revokeObjectURL(url); } catch (error) { console.error(error); const link = document.createElement('a'); link.href = previewDoc.url; link.download = `${previewDoc.title || 'document'}${previewDoc.url.substring(previewDoc.url.lastIndexOf('.'))}`; link.target = '_blank'; link.click(); } }}>📥 Download</Button></div>}>
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 rounded-lg overflow-hidden">
                    {previewDoc.url ? (previewDoc.url.toLowerCase().endsWith('.pdf') ? <iframe src={previewDoc.url} title={previewDoc.title} className="w-full h-[60vh] border-none" /> : <img src={previewDoc.url} alt={previewDoc.title} className="max-w-full max-h-[60vh] object-contain shadow-lg rounded-lg" />) : <div className="text-slate-400 text-center"><span className="text-4xl block">📄</span><p className="text-xs mt-1">No document</p></div>}
                </div>
            </Modal>
        </div>
    );
};

export default TeacherStudentManagement;