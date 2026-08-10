import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const ManageAcademic = () => {
    // Data States
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Selection States
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'subjects' | 'groups'
    const [mainTab, setMainTab] = useState('classes'); // 'classes' | 'sections' | 'subjects'

    // Streams/Groups State
    const [streams, setStreams] = useState([]);
    const [classStreams, setClassStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);
    const [streamSections, setStreamSections] = useState([]);
    const [streamSubjects, setStreamSubjects] = useState([]);
    const [streamForm, setStreamForm] = useState({ name: '', code: '', description: '' });
    const [showStreamModal, setShowStreamModal] = useState(false);
    const [classSections, setClassSections] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

    const showConfirmDialog = (title, message) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                open: true,
                title,
                message,
                onConfirm: () => { setConfirmDialog({ open: false, title: '', message: '', onConfirm: null }); resolve(true); },
                onCancel: () => { setConfirmDialog({ open: false, title: '', message: '', onConfirm: null }); resolve(false); }
            });
        });
    };

    // Modal States
    const [modals, setModals] = useState({
        class: false,
        section: false,
        subject: false,
        assignSection: false,
        assignSubject: false
    });

    // Form States
    const [classForm, setClassForm] = useState({ name: '', classNumber: '', sortOrder: '', classCategory: 'primary', description: '' });
    const [sectionForm, setSectionForm] = useState({ name: '', code: '', description: '' });
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '' });
    const [editingId, setEditingId] = useState(null); // For updates
    const [editingStreamId, setEditingStreamId] = useState(null); // For updates

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Helper: check if class is higher secondary
    const isHigherSecondary = (cls) => {
        if (!cls) return false;
        const cn = String(cls.class_number);
        return cn === '11' || cn === '12' || cls.class_category === 'higher_secondary';
    };

    // Initial Fetch
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch Class Details when selected
    useEffect(() => {
        if (selectedClass) {
            fetchClassDetails(selectedClass.id);
            if (isHigherSecondary(selectedClass)) {
                fetchClassStreams(selectedClass.id);
                setActiveTab('groups');
            } else {
                setActiveTab('sections');
            }
            // CRITICAL: Reset the selected stream when switching classes
            // so we don't accidentally display the previous class's stream data
            setSelectedStream(null);
        } else {
            setClassSections([]);
            setClassSubjects([]);
            setClassStreams([]);
            setSelectedStream(null);
        }
    }, [selectedClass]);

    // Fetch stream details when stream selected
    useEffect(() => {
        if (selectedStream) {
            fetchStreamDetails(selectedStream.id);
        } else {
            setStreamSections([]);
            setStreamSubjects([]);
        }
    }, [selectedStream]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [classesRes, sectionsRes, subjectsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/classes`, { headers }),
                fetch(`${API_URL}/api/admin/sections`, { headers }),
                fetch(`${API_URL}/api/admin/subjects`, { headers })
            ]);

            const [classesData, sectionsData, subjectsData] = await Promise.all([
                classesRes.json(),
                sectionsRes.json(),
                subjectsRes.json()
            ]);

            if (classesData.success) {
                const sortedClasses = [...classesData.classes].sort((a, b) => 
                    (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
                );
                setClasses(sortedClasses);
            }
            if (sectionsData.success) setSections(sectionsData.sections);
            if (subjectsData.success) setSubjects(subjectsData.subjects);

            // Also fetch all streams for the school
            try {
                const streamsRes = await fetch(`${API_URL}/api/admin/streams`, { headers });
                const streamsData = await streamsRes.json();
                if (streamsData.success) setStreams(streamsData.streams);
            } catch (e) { /* streams table might not exist yet */ }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassDetails = async (classId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [sectionsRes, subjectsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/class-sections/${classId}`, { headers }),
                fetch(`${API_URL}/api/admin/class-subjects/${classId}`, { headers })
            ]);

            const [sectionsData, subjectsData] = await Promise.all([
                sectionsRes.json(),
                subjectsRes.json()
            ]);

            if (sectionsData.success) setClassSections(sectionsData.sections);
            if (subjectsData.success) setClassSubjects(subjectsData.subjects);

        } catch (error) {
            console.error('Error fetching class details:', error);
            toast.error('Failed to load class details');
        } finally {
            setActionLoading(false);
        }
    };

    // --- CRUD Handlers ---

    const handleSaveClass = async () => {
        if (!classForm.name || !classForm.classNumber) {
            toast.error('Name and Class Identifier are required');
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `${API_URL}/api/admin/classes-extended/${editingId}`
                : `${API_URL}/api/admin/classes-extended`;

            const body = {
                name: classForm.name,
                class_number: classForm.classNumber,
                sort_order: classForm.sortOrder || 0,
                class_category: classForm.classCategory || 'primary',
                description: classForm.description
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingId ? 'Class updated' : 'Class created');
                setModals({ ...modals, class: false });
                setClassForm({ name: '', classNumber: '', sortOrder: '', classCategory: 'primary', description: '' });
                setEditingId(null);
                fetchInitialData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving class:', error);
            toast.error('Failed to save class');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClass = async (id) => {
        const ok = await showConfirmDialog('Delete Class', 'Are you sure? This will remove the class and all its assigned sections, subjects, and groups.');
        if (!ok) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/classes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Class deleted');
                if (selectedClass?.id === id) setSelectedClass(null);
                fetchInitialData();
            } else {
                // Show as popup instead of just toast
                await showConfirmDialog('⛔ Cannot Delete', data.message || 'This class cannot be deleted.');
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            toast.error('Failed to delete class');
        }
    };

    const handleSaveSection = async () => {
        if (!sectionForm.name || !sectionForm.code) {
            toast.error('Name and Code are required');
            return;
        }

        // Check for duplicate name/code if creating new
        if (!editingId) {
            const duplicateName = sections.find(s => s.name?.toLowerCase() === sectionForm.name.toLowerCase());
            if (duplicateName) {
                toast.error(`Section "${duplicateName.name}" already exists. Please assign it from the list instead.`);
                return;
            }
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `${API_URL}/api/admin/sections/${editingId}`
                : `${API_URL}/api/admin/sections`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sectionForm)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingId ? 'Section updated' : 'Section created');
                setModals({ ...modals, section: false });
                setSectionForm({ name: '', code: '', description: '' });
                setEditingId(null);
                fetchInitialData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving section:', error);
            toast.error('Failed to save section');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveSubject = async () => {
        if (!subjectForm.name || !subjectForm.code) {
            toast.error('Name and Code are required');
            return;
        }

        // Check for duplicate name/code if creating new
        if (!editingId) {
            const duplicateName = subjects.find(s => s.name?.toLowerCase() === subjectForm.name.toLowerCase());
            const duplicateCode = subjects.find(s => s.code?.toLowerCase() === subjectForm.code.toLowerCase());

            if (duplicateName) {
                toast.error(`Subject "${duplicateName.name}" already exists. Please assign it from the list instead.`);
                return;
            }
            if (duplicateCode) {
                toast.error(`Subject Code "${duplicateCode.code}" already exists.`);
                return;
            }
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `${API_URL}/api/admin/subjects/${editingId}`
                : `${API_URL}/api/admin/subjects`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subjectForm)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingId ? 'Subject updated' : 'Subject created');
                setModals({ ...modals, subject: false });
                setSubjectForm({ name: '', code: '', description: '' });
                setEditingId(null);
                fetchInitialData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            toast.error('Failed to save subject');
        } finally {
            setActionLoading(false);
        }
    };

    // --- Assignment Handlers ---

    const handleAssignSection = async (sectionId) => {
        if (!selectedClass) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/class-sections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ class_id: selectedClass.id, section_id: sectionId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Section assigned');
                fetchClassDetails(selectedClass.id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error assigning section:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnassignSection = async (mappingId, sectionId) => {
        console.log('handleUnassignSection called with mappingId:', mappingId);
        const ok = await showConfirmDialog('Remove Section', 'Remove this section from the class?');
        if (!ok) return;

        const token = localStorage.getItem('token');
        let success = false;
        let errorMessage = '';

        // Try deleting by Mapping ID first
        if (mappingId) {
            try {
                const res = await fetch(`${API_URL}/api/admin/class-sections/${mappingId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    success = true;
                } else {
                    console.warn('Primary unassign failed, trying fallback...');
                    errorMessage = data.message;
                }
            } catch (error) {
                console.error('Error removing section (primary):', error);
                errorMessage = 'Network error';
            }
        }

        // Fallback: Delete by Class ID + Section ID
        if (!success && selectedClass && sectionId) {
            try {
                console.log('Attempting fallback unassign...');
                const res = await fetch(`${API_URL}/api/admin/class-sections-by-params?class_id=${selectedClass.id}&section_id=${sectionId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    success = true;
                } else {
                    errorMessage = data.message || errorMessage;
                }
            } catch (error) {
                console.error('Error removing section (fallback):', error);
                errorMessage = 'Failed to remove section';
            }
        }

        if (success) {
            toast.success('Section removed');
            fetchClassDetails(selectedClass.id);
            if (selectedStream) {
                fetchStreamDetails(selectedStream.id);
            }
        } else {
            toast.error(errorMessage || 'Failed to remove section');
        }
    };

    const handleDeleteSection = async (id) => {
        const ok = await showConfirmDialog('Delete Section', 'Are you sure? This section will be permanently deleted and removed from all classes.');
        if (!ok) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/sections/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Section deleted');
                fetchInitialData();
            } else {
                // If section is assigned to classes, show them
                if (data.assignedClasses && data.assignedClasses.length > 0) {
                    const classNames = data.assignedClasses
                        .map(cls => `${cls.name} (Class ${cls.class_number})`)
                        .join('\n');
                    await showConfirmDialog(
                        '⛔ Cannot Delete Section',
                        `${data.message}\n\nAssigned to:\n${classNames}`
                    );
                } else {
                    toast.error(data.message || 'Failed to delete section');
                }
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            toast.error('Failed to delete section');
        }
    };

    const handleAssignSubject = async (subjectId) => {
        if (!selectedClass) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/class-subjects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ class_id: selectedClass.id, subject_id: subjectId, stream_id: selectedStream?.id || null })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Subject assigned');
                fetchClassDetails(selectedClass.id);
                if (selectedStream) fetchStreamDetails(selectedStream.id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error assigning subject:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnassignSubject = async (mappingId, subjectId) => {
        const ok = await showConfirmDialog('Remove Subject', 'Remove this subject from the class?');
        if (!ok) return;

        const token = localStorage.getItem('token');
        let success = false;
        let errorMessage = '';

        if (mappingId) {
            try {
                const res = await fetch(`${API_URL}/api/admin/class-subjects/${mappingId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    success = true;
                } else {
                    errorMessage = data.message;
                }
            } catch (error) {
                console.error('Error removing subject:', error);
                errorMessage = 'Network error';
            }
        }

        if (!success && selectedClass && subjectId) {
            try {
                const res = await fetch(`${API_URL}/api/admin/class-subjects-by-params?class_id=${selectedClass.id}&subject_id=${subjectId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    success = true;
                } else {
                    errorMessage = data.message || errorMessage;
                }
            } catch (error) {
                console.error('Error removing subject (fallback):', error);
                errorMessage = 'Failed to remove subject';
            }
        }

        if (success) {
            toast.success('Subject removed');
            fetchClassDetails(selectedClass.id);
            if (selectedStream) fetchStreamDetails(selectedStream.id);
        } else {
            toast.error(errorMessage || 'Failed to remove subject');
        }
    };

    const handleDeleteSubject = async (id) => {
        const ok = await showConfirmDialog('Delete Subject', 'Are you sure? This subject will be permanently deleted and removed from all classes.');
        if (!ok) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/subjects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Subject deleted');
                fetchInitialData();
            } else {
                toast.error(data.message || 'Failed to delete subject');
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error('Failed to delete subject');
        }
    };

    // --- Streams/Groups Handlers ---

    const fetchClassStreams = async (classId) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/class-streams/${classId}`, { headers });
            const data = await res.json();
            if (data.success) setClassStreams(data.streams);
        } catch (e) { console.error('Error fetching class streams:', e); }
    };

    const fetchStreamDetails = async (streamId) => {
        if (!selectedClass) return;
        try {
            // Fetch sections assigned to this class with this stream
            const secRes = await fetch(`${API_URL}/api/admin/class-sections/${selectedClass.id}?stream_id=${streamId}`, { headers });
            const secData = await secRes.json();
            if (secData.success) {
                setStreamSections(secData.sections);
            }

            // Fetch subjects assigned to this class + stream
            const subRes = await fetch(`${API_URL}/api/admin/class-subjects/${selectedClass.id}?stream_id=${streamId}`, { headers });
            const subData = await subRes.json();
            if (subData.success) setStreamSubjects(subData.subjects);
        } catch (e) { console.error('Error fetching stream details:', e); }
    };

    const handleCreateStream = async () => {
        if (!streamForm.name || !streamForm.code) {
            toast.error('Name and Code are required');
            return;
        }
        try {
            if (editingStreamId) {
                // Update stream
                await axios.put(`${API_URL}/api/admin/streams/${editingStreamId}`, streamForm, { headers });
                toast.success('Group updated successfully');
            } else {
                // Create stream
                const res = await axios.post(`${API_URL}/api/admin/streams`, streamForm, { headers });
                const newStreamId = res.data.id;

                // If creating a new stream, also link it to the selected class
                if (selectedClass) {
                    await axios.post(`${API_URL}/api/admin/class-streams`, {
                        class_id: selectedClass.id,
                        stream_id: newStreamId
                    }, { headers });
                }
                toast.success('Group created successfully');
            }
            setShowStreamModal(false);
            setEditingStreamId(null);
            setStreamForm({ name: '', code: '', description: '' }); // Reset form
            // Refresh streams
            const streamsRes = await fetch(`${API_URL}/api/admin/streams`, { headers });
            const streamsData = await streamsRes.json();
            if (streamsData.success) setStreams(streamsData.streams);
            if (selectedClass) fetchClassStreams(selectedClass.id);
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to create group'); }
    };

    const handleLinkStreamToClass = async (streamId) => {
        if (!selectedClass) return;
        try {
            await axios.post(`${API_URL}/api/admin/class-streams`, { class_id: selectedClass.id, stream_id: streamId }, { headers });
            toast.success('Group linked to class');
            fetchClassStreams(selectedClass.id);
        } catch (e) { toast.error('Failed to link group'); }
    };

    const handleUnlinkStream = async (linkId) => {
        const ok = await showConfirmDialog('Remove Group', 'Remove this group from the class?');
        if (!ok) return;
        try {
            await axios.delete(`${API_URL}/api/admin/class-streams/${linkId}`, { headers });
            toast.success('Group removed from class');
            if (selectedStream && classStreams.find(cs => cs.link_id === linkId)?.id === selectedStream.id) {
                setSelectedStream(null);
            }
            fetchClassStreams(selectedClass.id);
        } catch (e) { toast.error('Failed to remove group'); }
    };

    const handleDeleteStream = async (id) => {
        const ok = await showConfirmDialog('Delete Group', 'Delete this group permanently? All linked sections and combinations will be removed.');
        if (!ok) return;
        try {
            await axios.delete(`${API_URL}/api/admin/streams/${id}`, { headers });
            toast.success('Group deleted');
            const streamsRes = await fetch(`${API_URL}/api/admin/streams`, { headers });
            const streamsData = await streamsRes.json();
            if (streamsData.success) setStreams(streamsData.streams);
            if (selectedStream?.id === id) setSelectedStream(null);
            if (selectedClass) fetchClassStreams(selectedClass.id);
        } catch (e) { toast.error('Failed to delete group'); }
    };

    const handleAssignSectionToStream = async (sectionId) => {
        if (!selectedClass || !selectedStream) return;
        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/api/admin/class-sections`, {
                class_id: selectedClass.id,
                section_id: sectionId,
                stream_id: selectedStream.id
            }, { headers });
            toast.success('Section assigned to group');
            fetchStreamDetails(selectedStream.id);
            fetchClassDetails(selectedClass.id);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to assign section');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateCombination = async (name, code) => {
        if (!selectedStream) return;
        try {
            const schoolId = selectedClass?.school_id;
            await axios.post(`${API_URL}/api/admin/stream-combinations`, {
                stream_id: selectedStream.id,
                name, code
            }, { headers });
            toast.success('Combination created');
            fetchStreamDetails(selectedStream.id);
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to create combination'); }
    };

    const handleDeleteCombination = async (id) => {
        const ok = await showConfirmDialog('Delete Combination', 'Delete this combination permanently?');
        if (!ok) return;
        try {
            await axios.delete(`${API_URL}/api/admin/stream-combinations/${id}`, { headers });
            toast.success('Combination deleted');
            fetchStreamDetails(selectedStream.id);
        } catch (e) { toast.error('Failed to delete combination'); }
    };

    // --- Filtering ---
    const sortedSections = [...sections].sort((a, b) => a.name.localeCompare(b.name));
    const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name));


    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Academic Management</h1>
                    <p className="mt-2 text-indigo-100 opacity-90">
                        Manage classes, sections, subjects and their assignments
                    </p>
                </div>
            </div>

            {/* Top-Level Tabs */}
            <Card>
                <div className="p-4 border-b border-gray-100 overflow-x-auto custom-scrollbar">
                    <div className="flex bg-gray-100 p-1 rounded-xl min-w-max">
                        {[
                            { key: 'classes', label: 'Classes', icon: '🏫', count: classes.length },
                            { key: 'sections', label: 'Sections', icon: '📋', count: sections.length },
                            { key: 'subjects', label: 'Subjects', icon: '📚', count: subjects.length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setMainTab(tab.key)}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    mainTab === tab.key
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    mainTab === tab.key
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-gray-200 text-gray-500'
                                }`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== CLASSES TAB ===== */}
                {mainTab === 'classes' && (
                    <div className="p-4">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h2 className="font-bold text-gray-700 mr-2">Classes</h2>
                            <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                                onClick={() => {
                                    setEditingId(null);
                                    setClassForm({ name: '', classNumber: '', sortOrder: '', classCategory: 'primary', description: '' });
                                    setModals({ ...modals, class: true });
                                }}
                            >
                                + Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {loading ? (
                                <p className="text-center text-gray-400 py-2">Loading...</p>
                            ) : classes.length === 0 ? (
                                <p className="text-center text-gray-400 py-2">No classes found</p>
                            ) : (
                                [...classes].sort((a, b) => {
                                    const numA = parseInt(a.class_number) || 0;
                                    const numB = parseInt(b.class_number) || 0;
                                    return numA - numB || String(a.class_number).localeCompare(String(b.class_number));
                                }).map(cls => (
                                    <div
                                        key={cls.id}
                                        className={`group relative inline-flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer transition-all border text-sm font-medium ${selectedClass?.id === cls.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'
                                            }`}
                                        onClick={() => setSelectedClass(cls)}
                                    >
                                        <span>{cls.name}</span>
                                        <div className={`${selectedClass?.id === cls.id ? 'flex' : 'hidden'} items-center gap-0.5 ml-1`}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingId(cls.id);
                                                    setClassForm({ name: cls.name, classNumber: cls.class_number, description: cls.description || '' });
                                                    setModals({ ...modals, class: true });
                                                }}
                                                className={`p-0.5 rounded ${selectedClass?.id === cls.id ? 'hover:bg-indigo-500' : 'hover:bg-gray-100'}`}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClass(cls.id);
                                                }}
                                                className={`p-0.5 rounded ${selectedClass?.id === cls.id ? 'hover:bg-indigo-500' : 'hover:bg-gray-100'}`}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ===== SECTIONS TAB ===== */}
                {mainTab === 'sections' && (
                    <div className="p-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                                📋 All Sections
                                <Badge variant="success">{sections.length}</Badge>
                            </h2>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => {
                                    setEditingId(null);
                                    setSectionForm({ name: '', code: '', description: '' });
                                    setModals({ ...modals, section: true });
                                }}
                            >
                                + Create New Section
                            </Button>
                        </div>
                        {loading ? (
                            <p className="text-center text-gray-400 py-4">Loading...</p>
                        ) : sortedSections.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-gray-700 font-semibold">No sections created yet</p>
                                <p className="text-sm text-gray-500 mt-1">Create your first section to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {sortedSections.map(sec => (
                                    <div key={sec.id} className="group bg-white p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-lg border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {sec.code || sec.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800 text-sm block">{sec.name}</span>
                                                    <span className="text-xs text-gray-500">Code: {sec.code}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(sec.id);
                                                        setSectionForm({ name: sec.name || '', code: sec.code || '', description: sec.description || '' });
                                                        setModals({ ...modals, section: true });
                                                    }}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit section"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSection(sec.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete section"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== SUBJECTS TAB ===== */}
                {mainTab === 'subjects' && (
                    <div className="p-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                                📚 All Subjects
                                <Badge variant="warning">{subjects.length}</Badge>
                            </h2>
                            <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                                onClick={() => {
                                    setEditingId(null);
                                    setSubjectForm({ name: '', code: '', description: '' });
                                    setModals({ ...modals, subject: true });
                                }}
                            >
                                + Create New Subject
                            </Button>
                        </div>
                        {loading ? (
                            <p className="text-center text-gray-400 py-4">Loading...</p>
                        ) : sortedSubjects.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <div className="text-4xl mb-3">📚</div>
                                <p className="text-gray-700 font-semibold">No subjects created yet</p>
                                <p className="text-sm text-gray-500 mt-1">Create your first subject to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {sortedSubjects.map(sub => (
                                    <div key={sub.id} className="group bg-white p-3 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-100 rounded-lg border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-sm">
                                                    {(sub.code || sub.name?.charAt(0) || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800 text-sm block">{sub.name}</span>
                                                    <span className="text-xs text-gray-500">Code: {sub.code}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(sub.id);
                                                        setSubjectForm({ name: sub.name || '', code: sub.code || '', description: sub.description || '' });
                                                        setModals({ ...modals, subject: true });
                                                    }}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit subject"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubject(sub.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete subject"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Class Details - shown below when Classes tab is active and a class is selected */}
            {mainTab === 'classes' && (
            <div>
                {/* Main Content */}
                <div className="space-y-6">
                    {selectedClass ? (
                        <>
                            {/* Class Header & Tabs */}
                            <Card className="border-t-4 border-t-indigo-500">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">{selectedClass.name}</h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Class Number: {selectedClass.class_number}
                                            {selectedClass.description && ` • ${selectedClass.description}`}
                                        </p>
                                    </div>
                                    {/* Tabs - only for non-higher-secondary classes */}
                                    {!isHigherSecondary(selectedClass) && (
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setActiveTab('sections')}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sections'
                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Sections
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('subjects')}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'subjects'
                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Subjects
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ===== HIGHER SECONDARY: Unified Groups + Sections + Subjects view ===== */}
                                {isHigherSecondary(selectedClass) && (
                                    <div className="space-y-6">
                                        {/* Groups Header + Pills */}
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                                    Groups for {selectedClass.name}
                                                    <Badge variant="success">{classStreams.length}</Badge>
                                                </h3>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                                    onClick={() => {
                                                        setStreamForm({ name: '', code: '', description: '' });
                                                        setEditingStreamId(null);
                                                        setShowStreamModal(true);
                                                    }}
                                                >
                                                    + New Group
                                                </Button>
                                            </div>

                                            {/* Group pills */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {classStreams.map(stream => (
                                                    <div
                                                        key={stream.link_id}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border font-medium text-sm ${selectedStream?.id === stream.id
                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-600'
                                                            }`}
                                                        onClick={() => setSelectedStream(stream)}
                                                    >
                                                        <span>{stream.name}</span>
                                                        <span className="text-xs opacity-75">({stream.code})</span>
                                                        {selectedStream?.id === stream.id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleUnlinkStream(stream.link_id); }}
                                                                className="ml-1 hover:bg-emerald-500 rounded p-0.5"
                                                                title="Remove from class"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Link existing groups */}
                                            {streams.filter(s => !classStreams.some(cs => cs.id === s.id)).length > 0 && (
                                                <div className="bg-gray-50 p-3 rounded-xl mb-4">
                                                    <p className="text-xs text-gray-500 mb-2 font-medium">Add existing group:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {streams.filter(s => !classStreams.some(cs => cs.id === s.id)).map(s => (
                                                            <div key={s.id} className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 transition-all">
                                                                <button
                                                                    onClick={() => handleLinkStreamToClass(s.id)}
                                                                    className="px-3 py-1.5 text-sm hover:text-emerald-600 transition-colors flex-grow text-left"
                                                                    title="Add to class"
                                                                >
                                                                    + {s.name}
                                                                </button>
                                                                <div className="flex border-l border-gray-100">
                                                                    <button
                                                                        onClick={() => {
                                                                            setStreamForm({ name: s.name, code: s.code, description: s.description || '' });
                                                                            setEditingStreamId(s.id);
                                                                            setShowStreamModal(true);
                                                                        }}
                                                                        className="px-2 py-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                                        title="Edit Group"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteStream(s.id)}
                                                                        className="px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                        title="Delete Group"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Group → Sections + Subjects */}
                                        {selectedStream ? (
                                            <Card className="border-l-4 border-l-emerald-500">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                    🏷️ {selectedStream.name}
                                                    <span className="text-sm font-normal text-gray-500">({selectedStream.code})</span>
                                                </h3>

                                                {/* --- SECTIONS for this group --- */}
                                                <div className="mb-6">
                                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        📋 Sections in {selectedStream.name}
                                                        <Badge variant="success">{streamSections.length}</Badge>
                                                    </h4>
                                                    {streamSections.length > 0 ? (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                                                            {streamSections.map(sec => (
                                                                <div key={sec.mapping_id} className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                                                                    <span className="font-medium">{sec.section_name} ({sec.code})</span>
                                                                    <button
                                                                        onClick={() => handleUnassignSection(sec.mapping_id, sec.section_id)}
                                                                        className="text-indigo-400 hover:text-red-500 transition-colors"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic mb-3">No sections assigned to this group yet.</p>
                                                    )}

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="bg-gray-50 p-3 rounded-xl">
                                                            <p className="text-xs text-gray-500 mb-2 font-medium">Assign section to {selectedStream.name}:</p>
                                                            <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                                                                {sortedSections.map(sec => {
                                                                    const isAssigned = streamSections.some(ss => ss.section_id === sec.id);
                                                                    return (
                                                                        <div key={sec.id} className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-all">
                                                                            <button
                                                                                onClick={() => !isAssigned && handleAssignSectionToStream(sec.id)}
                                                                                disabled={actionLoading || isAssigned}
                                                                                className={`px-3 py-1.5 text-sm transition-colors flex-grow text-left ${isAssigned
                                                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                                                    : 'hover:text-indigo-600'
                                                                                    }`}
                                                                            >
                                                                                {isAssigned ? (
                                                                                    <span className="flex items-center gap-1">
                                                                                        ✓ {sec.name} <span className="text-xs italic opacity-75">(Assigned)</span>
                                                                                    </span>
                                                                                ) : (
                                                                                    `+ ${sec.name}`
                                                                                )}
                                                                            </button>
                                                                            {/* <div className="flex border-l border-gray-100">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingId(sec.id);
                                                                                        setSectionForm({ name: sec.name || sec.section_name || '', code: sec.code || '', description: sec.description || '' });
                                                                                        setModals({ ...modals, section: true });
                                                                                    }}
                                                                                    className="px-2 py-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                                                    title="Edit section"
                                                                                >
                                                                                    ✏️
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteSection(sec.id)}
                                                                                    className="px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                                    title="Delete section permanently"
                                                                                >
                                                                                    🗑️
                                                                                </button>
                                                                            </div> */}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100 my-6" />

                                                {/* --- SUBJECTS for this group --- */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        📚 Subjects in {selectedStream.name}
                                                        <Badge variant="warning">{streamSubjects.length}</Badge>
                                                    </h4>
                                                    {streamSubjects.length > 0 ? (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                                                            {streamSubjects.map((sub, index) => (
                                                                <div key={sub.mapping_id || `subject-${index}`} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
                                                                    <div className="truncate pr-2">
                                                                        <span className="font-medium block truncate" title={sub.name || sub.subject_name}>
                                                                            {sub.name || sub.subject_name}
                                                                        </span>
                                                                        <span className="text-xs opacity-75">{sub.code || sub.subject_code}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleUnassignSubject(sub.mapping_id, sub.subject_id)}
                                                                        className="text-amber-400 hover:text-red-500 transition-colors"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic mb-3">No subjects assigned to this group yet.</p>
                                                    )}

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="bg-gray-50 p-3 rounded-xl">
                                                            <p className="text-xs text-gray-500 mb-2 font-medium">Assign subject to {selectedStream.name}:</p>
                                                            <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                                                                {sortedSubjects.map(sub => {
                                                                    const isAssigned = streamSubjects.some(cs => cs.subject_id === sub.id);
                                                                    return (
                                                                        <div key={sub.id} className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-amber-300 transition-all">
                                                                            <button
                                                                                onClick={() => !isAssigned && handleAssignSubject(sub.id)}
                                                                                disabled={isAssigned}
                                                                                className={`px-3 py-1.5 text-sm transition-colors flex-grow text-left ${isAssigned
                                                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                                                    : 'hover:text-amber-700'
                                                                                    }`}
                                                                            >
                                                                                {isAssigned ? (
                                                                                    <span className="flex items-center gap-1">
                                                                                        ✓ {sub.name} <span className="text-xs italic opacity-75">(Assigned)</span>
                                                                                    </span>
                                                                                ) : (
                                                                                    `+ ${sub.name}`
                                                                                )}
                                                                            </button>
                                                                            {/* <div className="flex border-l border-gray-100">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingId(sub.id);
                                                                                        setSubjectForm({ name: sub.name || sub.subject_name || '', code: sub.code || sub.subject_code || '', description: sub.description || '' });
                                                                                        setModals({ ...modals, subject: true });
                                                                                    }}
                                                                                    className="px-2 py-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                                                    title="Edit subject"
                                                                                >
                                                                                    ✏️
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteSubject(sub.id)}
                                                                                    className="px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                                    title="Delete subject permanently"
                                                                                >
                                                                                    🗑️
                                                                                </button>
                                                                            </div> */}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ) : classStreams.length > 0 ? (
                                            <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                <p className="text-gray-500">👆 Select a group above to manage its sections and subjects</p>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                <div className="text-4xl mb-3">🏷️</div>
                                                <p className="text-gray-700 font-semibold">No groups added yet</p>
                                                <p className="text-sm text-gray-500 mt-1">Create groups like Science, Commerce, Arts for {selectedClass.name}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ===== REGULAR CLASSES: Sections tab ===== */}
                                {!isHigherSecondary(selectedClass) && activeTab === 'sections' && (
                                    <div className="space-y-4">
                                        {/* Assigned Sections */}
                                        <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded text-xs">📚</span>
                                                    Assigned Sections
                                                </h3>
                                                <Badge variant="success">{classSections.length}</Badge>
                                            </div>

                                            {classSections.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                    {classSections.map((sec, index) => (
                                                        <div key={sec.mapping_id || `section-${index}`} className="group relative bg-white p-2 rounded border border-indigo-300 hover:border-indigo-500 transition-all hover:shadow">
                                                            <div className="absolute top-1 right-1">
                                                                <button
                                                                    onClick={() => handleUnassignSection(sec.mapping_id, sec.section_id)}
                                                                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all text-xs"
                                                                    title="Remove section"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            <div className="flex items-start gap-2 pr-8">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded border border-indigo-300 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                                    {sec.code}
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <span className="font-semibold text-gray-800 text-sm block truncate">{sec.section_name}</span>
                                                                    <span className="text-xs text-gray-500">({sec.code})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-sm text-center py-3">No sections assigned yet</p>
                                            )}
                                        </div>

                                        {/* Setup Actions */}
                                        <div className="grid grid-cols-1 gap-2 max-w-md">
                                            {/* Assign Existing */}
                                            <div className="bg-white p-2 rounded-lg border-2 border-blue-200">
                                                <h4 className="font-bold text-gray-700 mb-1 text-xs flex items-center gap-1">
                                                    <span className="flex items-center justify-center w-4 h-4 bg-blue-600 text-white rounded text-xs">+</span>
                                                    Assign Existing Section
                                                </h4>
                                                <div className="space-y-0.5 max-h-96 overflow-y-auto">
                                                    {sortedSections.length > 0 ? (
                                                        sortedSections.map(sec => {
                                                            const isAssigned = classSections.some(cs => cs.section_id === sec.id);
                                                            return (
                                                                <div key={sec.id} className="group flex items-center gap-2 bg-white p-2 rounded border border-blue-200 hover:border-blue-400 transition-all text-sm">
                                                                    <button
                                                                        onClick={() => !isAssigned && handleAssignSection(sec.id)}
                                                                        disabled={actionLoading || isAssigned}
                                                                        className={`flex-grow px-2 py-1 text-xs font-medium transition-all rounded text-left ${isAssigned
                                                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                            : 'hover:bg-blue-50'
                                                                            }`}
                                                                    >
                                                                        {isAssigned ? '✓' : '+'} {sec.name} {isAssigned && <span className="text-xs">(Assigned)</span>}
                                                                    </button>
                                                                    
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-gray-400 text-xs text-center py-2">No sections created</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Create New */}
                                            {/* <div className="bg-white p-2 rounded-lg border-2 border-green-200 flex flex-col justify-center">
                                                <h4 className="font-bold text-gray-700 mb-1 text-xs flex items-center gap-1">
                                                    <span className="flex items-center justify-center w-4 h-4 bg-green-600 text-white rounded text-xs">✨</span>
                                                    Create New Section
                                                </h4>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setSectionForm({ name: '', code: '', description: '' });
                                                        setModals({ ...modals, section: true });
                                                    }}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1 rounded text-xs transition-colors"
                                                >
                                                    + New Section
                                                </Button>
                                            </div> */}
                                        </div>
                                    </div>
                                )}

                                {/* ===== REGULAR CLASSES: Subjects tab ===== */}
                                {!isHigherSecondary(selectedClass) && activeTab === 'subjects' && (
                                    <div className="space-y-4">
                                        {/* Assigned Subjects */}
                                        <div className="bg-white p-4 rounded-lg border-2 border-amber-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-6 h-6 bg-amber-600 text-white rounded text-xs">📖</span>
                                                    Assigned Subjects
                                                </h3>
                                                <Badge variant="warning">{classSubjects.length}</Badge>
                                            </div>

                                            {classSubjects.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                    {classSubjects.map((sub, index) => (
                                                        <div key={sub.mapping_id || `subject-${index}`} className="group relative bg-white p-2 rounded border border-amber-300 hover:border-amber-500 transition-all hover:shadow">
                                                            <div className="absolute top-1 right-1">
                                                                <button
                                                                    onClick={() => handleUnassignSubject(sub.mapping_id, sub.subject_id)}
                                                                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all text-xs"
                                                                    title="Remove subject"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            <div className="flex items-start gap-2 pr-8">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded border border-amber-300 flex items-center justify-center text-amber-600 font-bold text-xs">
                                                                    {(sub.code || sub.subject_code || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <span className="font-semibold text-gray-800 text-sm block truncate" title={sub.name || sub.subject_name}>{sub.name || sub.subject_name}</span>
                                                                    <span className="text-xs text-gray-500">({sub.code || sub.subject_code})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-sm text-center py-3">No subjects assigned yet</p>
                                            )}
                                        </div>

                                        {/* Setup Actions */}
                                        <div className="grid grid-cols-1 gap-2 max-w-md">
                                            {/* Assign Existing */}
                                            <div className="bg-white p-2 rounded-lg border-2 border-orange-200">
                                                <h4 className="font-bold text-gray-700 mb-1 text-xs flex items-center gap-1">
                                                    <span className="flex items-center justify-center w-4 h-4 bg-orange-600 text-white rounded text-xs">+</span>
                                                    Assign Existing Subject
                                                </h4>
                                                <div className="space-y-0.5 max-h-96 overflow-y-auto">
                                                    {sortedSubjects.length > 0 ? (
                                                        sortedSubjects.map(sub => {
                                                            const isAssigned = classSubjects.some(cs => cs.subject_id === sub.id);
                                                            return (
                                                                <div key={sub.id} className="group flex items-center gap-2 bg-white p-2 rounded border border-orange-200 hover:border-orange-400 transition-all text-sm">
                                                                    <button
                                                                        onClick={() => !isAssigned && handleAssignSubject(sub.id)}
                                                                        disabled={actionLoading || isAssigned}
                                                                        className={`flex-grow px-2 py-1 text-xs font-medium transition-all rounded text-left ${isAssigned
                                                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                            : 'hover:bg-orange-50'
                                                                            }`}
                                                                    >
                                                                        {isAssigned ? '✓' : '+'} {sub.name} {isAssigned && <span className="text-xs">(Assigned)</span>}
                                                                    </button>
                                                                    {/* <div className="flex gap-0.5">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingId(sub.id);
                                                                                setSubjectForm({ name: sub.name || sub.subject_name || '', code: sub.code || sub.subject_code || '', description: sub.description || '' });
                                                                                setModals({ ...modals, subject: true });
                                                                            }}
                                                                            className="p-1 text-orange-500 hover:bg-orange-100 rounded text-xs"
                                                                            title="Edit subject"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteSubject(sub.id)}
                                                                            className="p-1 text-red-500 hover:bg-red-100 rounded text-xs"
                                                                            title="Delete subject"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div> */}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-gray-400 text-xs text-center py-2">No subjects created</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Create New
                                            <div className="bg-white p-2 rounded-lg border-2 border-yellow-200 flex flex-col justify-center">
                                                <h4 className="font-bold text-gray-700 mb-1 text-xs flex items-center gap-1">
                                                    <span className="flex items-center justify-center w-4 h-4 bg-yellow-600 text-white rounded text-xs">✨</span>
                                                    Create New Subject
                                                </h4>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setSubjectForm({ name: '', code: '', description: '' });
                                                        setModals({ ...modals, subject: true });
                                                    }}
                                                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 rounded text-xs transition-colors"
                                                >
                                                    + New Subject
                                                </Button>
                                            </div> */}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </>
                    ) : (
                        <div className="flex items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                            <div>
                                <div className="text-5xl mb-4">💡</div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Class</h3>
                                <p className="text-gray-500">Choose a class from above to manage its sections and subjects.</p>
                            </div>
                        </div>
                    )}
                </div >
            </div >
            )}

            {/* --- MODALS --- */}

            {/* Class Modal */}
            <Modal
                isOpen={modals.class}
                onClose={() => setModals({ ...modals, class: false })}
                title={editingId ? 'Edit Class' : 'Create Class'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModals({ ...modals, class: false })}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveClass} disabled={actionLoading}>
                            {actionLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Class Name"
                        value={classForm.name}
                        onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                        placeholder="e.g. Class X"
                    />
                    <Input
                        label="Class Identifier"
                        value={classForm.classNumber}
                        onChange={e => setClassForm({ ...classForm, classNumber: e.target.value })}
                        placeholder="e.g. 10, NUR, LKG, UKG"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={classForm.classCategory}
                            onChange={e => setClassForm({ ...classForm, classCategory: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        >
                            <option value="pre_primary">Pre-Primary (Nursery/KG)</option>
                            <option value="primary">Primary (1-5)</option>
                            <option value="middle">Middle (6-8)</option>
                            <option value="secondary">Secondary (9-10)</option>
                            <option value="higher_secondary">Higher Secondary (11-12)</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Section Modal */}
            <Modal
                isOpen={modals.section}
                onClose={() => setModals({ ...modals, section: false })}
                title={editingId ? 'Edit Section' : 'Create Section'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModals({ ...modals, section: false })}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveSection} disabled={actionLoading}>
                            {actionLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Section Name"
                        value={sectionForm.name}
                        onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                        placeholder="e.g. Section A"
                    />
                    <Input
                        label="Section Code"
                        value={sectionForm.code}
                        onChange={e => setSectionForm({ ...sectionForm, code: e.target.value })}
                        placeholder="e.g. A"
                    />
                </div>
            </Modal>

            {/* Subject Modal */}
            <Modal
                isOpen={modals.subject}
                onClose={() => setModals({ ...modals, subject: false })}
                title={editingId ? 'Edit Subject' : 'Create Subject'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModals({ ...modals, subject: false })}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveSubject} disabled={actionLoading}>
                            {actionLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Subject Name"
                        value={subjectForm.name}
                        onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        placeholder="e.g. Mathematics"
                    />
                    <Input
                        label="Subject Code"
                        value={subjectForm.code}
                        onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                        placeholder="e.g. MATH"
                    />
                </div>
            </Modal>

            {/* Stream/Group Modal */}
            <Modal
                isOpen={showStreamModal}
                onClose={() => {
                    setShowStreamModal(false);
                    setEditingStreamId(null);
                }}
                title={editingStreamId ? "Edit Group" : "Create Group"}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowStreamModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateStream} disabled={actionLoading}>
                            {actionLoading ? (editingStreamId ? 'Updating...' : 'Creating...') : (editingStreamId ? 'Update' : 'Create')}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Group Name"
                        value={streamForm.name}
                        onChange={e => setStreamForm({ ...streamForm, name: e.target.value })}
                        placeholder="e.g. Science, Commerce, Arts"
                    />
                    <Input
                        label="Group Code"
                        value={streamForm.code}
                        onChange={e => setStreamForm({ ...streamForm, code: e.target.value })}
                        placeholder="e.g. SCI, COM, ARTS"
                    />
                </div>
            </Modal>

            {/* Custom Confirmation Dialog */}
            {
                confirmDialog.open && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={confirmDialog.onCancel}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 text-lg">⚠️</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">{confirmDialog.title}</h3>
                            </div>
                            <p className="text-gray-600 mb-6 ml-[52px]">{confirmDialog.message}</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={confirmDialog.onCancel}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-all shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ManageAcademic;