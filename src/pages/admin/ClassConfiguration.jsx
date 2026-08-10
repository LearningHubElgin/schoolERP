import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const ClassConfiguration = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classSections, setClassSections] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('sections');

    useEffect(() => {
        fetchClasses();
        fetchAllSections();
        fetchAllSubjects();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchClassSections();
            fetchClassSubjects();
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/classes`, {
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

    const fetchAllSections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/sections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setSections(data.sections);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const fetchAllSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/subjects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setSubjects(data.subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchClassSections = async () => {
        if (!selectedClass) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/class-sections/${selectedClass.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setClassSections(data.sections);
        } catch (error) {
            console.error('Error fetching class sections:', error);
        }
    };

    const fetchClassSubjects = async () => {
        if (!selectedClass) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/class-subjects/${selectedClass.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setClassSubjects(data.subjects);
        } catch (error) {
            console.error('Error fetching class subjects:', error);
        }
    };

    const handleAddSection = async (sectionId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/class-sections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    class_id: selectedClass.id,
                    section_id: sectionId
                })
            });
            const data = await response.json();
            if (data.success) {
                fetchClassSections();
            } else {
                alert(data.message || 'Failed to add section');
            }
        } catch (error) {
            console.error('Error adding section:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSection = async (mappingId) => {
        if (!window.confirm('Remove this section from the class?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/class-sections/${mappingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchClassSections();
            }
        } catch (error) {
            console.error('Error removing section:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (subjectId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/class-subjects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    class_id: selectedClass.id,
                    subject_id: subjectId
                })
            });
            const data = await response.json();
            if (data.success) {
                fetchClassSubjects();
            } else {
                alert(data.message || 'Failed to add subject');
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubject = async (mappingId) => {
        if (!window.confirm('Remove this subject from the class?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/class-subjects/${mappingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchClassSubjects();
            }
        } catch (error) {
            console.error('Error removing subject:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get sections not yet assigned to this class
    const availableSections = sections.filter(
        sec => !classSections.find(cs => cs.section_id === sec.id)
    );

    // Get subjects not yet assigned to this class
    const availableSubjects = subjects.filter(
        sub => !classSubjects.find(cs => cs.subject_id === sub.id)
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">Class Configuration</h1>
                    <p className="mt-1 text-indigo-100 text-xs md:text-sm">
                        Assign sections and subjects to each class
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Class List */}
                <div className="lg:col-span-1">
                    <Card title="Select Class" variant="elevated">
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {classes.map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClass(cls)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedClass?.id === cls.id
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <span className="font-medium">{cls.name}</span>
                                </button>
                            ))}
                            {classes.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No classes found</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Configuration Panel */}
                <div className="lg:col-span-3">
                    {selectedClass ? (
                        <Card variant="elevated">
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Configure: {selectedClass.name}
                                </h2>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setActiveTab('sections')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'sections'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    📚 Sections ({classSections.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('subjects')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'subjects'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    📖 Subjects ({classSubjects.length})
                                </button>
                            </div>

                            {activeTab === 'sections' && (
                                <div className="space-y-6">
                                    {/* Assigned Sections */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                            Assigned Sections
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {classSections.length > 0 ? (
                                                classSections.map((sec) => (
                                                    <div
                                                        key={sec.mapping_id}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200"
                                                    >
                                                        <span className="font-medium">{sec.section_name}</span>
                                                        <button
                                                            onClick={() => handleRemoveSection(sec.mapping_id)}
                                                            className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 text-xs"
                                                            disabled={loading}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">No sections assigned yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Available Sections */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                            Available Sections (Click to Add)
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSections.length > 0 ? (
                                                availableSections.map((sec) => (
                                                    <button
                                                        key={sec.id}
                                                        onClick={() => handleAddSection(sec.id)}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors border border-gray-200 hover:border-green-300"
                                                        disabled={loading}
                                                    >
                                                        + {sec.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">All sections are assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'subjects' && (
                                <div className="space-y-6">
                                    {/* Assigned Subjects */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                            Assigned Subjects
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {classSubjects.length > 0 ? (
                                                classSubjects.map((sub) => (
                                                    <div
                                                        key={sub.mapping_id}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200"
                                                    >
                                                        <span className="font-medium">{sub.subject_name}</span>
                                                        <span className="text-xs text-emerald-500">({sub.subject_code})</span>
                                                        <button
                                                            onClick={() => handleRemoveSubject(sub.mapping_id)}
                                                            className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 text-xs"
                                                            disabled={loading}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">No subjects assigned yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Available Subjects */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                            Available Subjects (Click to Add)
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSubjects.length > 0 ? (
                                                availableSubjects.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => handleAddSubject(sub.id)}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors border border-gray-200 hover:border-green-300"
                                                        disabled={loading}
                                                    >
                                                        + {sub.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">All subjects are assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card variant="elevated">
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">👈</div>
                                <p className="text-lg">Select a class from the left to configure its sections and subjects</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassConfiguration;
