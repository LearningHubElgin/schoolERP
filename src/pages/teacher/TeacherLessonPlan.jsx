import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { Calendar, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

// Helper to format date (YYYY-MM-DD) to DD-MM-YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Convert any sub_topics value (string or array) to an array
const parseSubTopics = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    let parsed = JSON.parse(data);
    // Handle double-stringified arrays from the backend
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const TeacherLessonPlan = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({
    week_start: '',
    class_number: '',
    section: '',
    subject_id: ''
  });
  const [formData, setFormData] = useState({
    teacher_id: '',
    class_number: '',
    section: '',
    subject_id: '',
    week_start_date: getCurrentWeekMonday(),
    week_end_date: getCurrentWeekFriday(),
    topic: '',
    sub_topics: [],     // will be an array of { title, completed }
    completion_percentage: 0,
    completion_date: ''
  });

  function getCurrentWeekMonday() {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday...
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  function getCurrentWeekFriday() {
    const m = new Date(getCurrentWeekMonday());
    m.setDate(m.getDate() + 4);
    return m.toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (teacherInfo) {
      fetchLessonPlans();
    }
  }, [filters, teacherInfo]);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [profileRes, classesRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/api/teacher/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/teacher/assigned-classes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/teacher/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (profileRes.data.success) {
        setTeacherInfo(profileRes.data.teacher);
        setFormData(prev => ({ ...prev, teacher_id: profileRes.data.teacher.id }));
      }
      if (classesRes.data.success) setAssignedClasses(classesRes.data.classes);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.subjects);
    } catch (error) {
      toast.error('Failed to load teacher data');
    }
  };

  const fetchLessonPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.week_start) params.append('week_start', filters.week_start);
      if (filters.class_number) params.append('class_number', filters.class_number);
      if (filters.section) params.append('section', filters.section);
      if (filters.subject_id) params.append('subject_id', filters.subject_id);
      const res = await axios.get(`${API_URL}/api/teacher/lesson-plans?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Parse sub_topics for each plan (backend sends as JSON string)
        const plans = res.data.lessonPlans.map(plan => ({
          ...plan,
          sub_topics: parseSubTopics(plan.sub_topics)
        }));
        setLessonPlans(plans);
      }
    } catch (error) {
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        sub_topics: formData.sub_topics   // send directly, backend handles stringification
      };
      if (editingPlan) {
        await axios.put(`${API_URL}/api/teacher/lesson-plans/${editingPlan.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Lesson plan updated');
      } else {
        await axios.post(`${API_URL}/api/teacher/lesson-plans`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Lesson plan added');
      }
      setShowModal(false);
      resetForm();
      fetchLessonPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lesson plan?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/lesson-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deleted');
      fetchLessonPlans();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (plan) => {
    // Ensure week_start_date & week_end_date are local dates
    const startDate = plan.week_start_date ? new Date(plan.week_start_date) : null;
    const localStartDate = startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}` : '';

    const endDateRaw = plan.week_end_date || plan.scheduled_date;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    const localEndDate = endDate ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}` : '';

    setEditingPlan(plan);
    setFormData({
      teacher_id: plan.teacher_id,
      class_number: plan.class_number,
      section: plan.section,
      subject_id: plan.subject_id,
      week_start_date: localStartDate,
      week_end_date: localEndDate,
      topic: plan.topic,
      sub_topics: parseSubTopics(plan.sub_topics),   // already array
      completion_percentage: plan.completion_percentage,
      completion_date: plan.completion_date ? plan.completion_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      teacher_id: teacherInfo?.id || '',
      class_number: '',
      section: '',
      subject_id: '',
      week_start_date: getCurrentWeekMonday(),
      week_end_date: getCurrentWeekFriday(),
      topic: '',
      sub_topics: [],
      completion_percentage: 0,
      completion_date: ''
    });
  };

  const getStatusBadge = (plan) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planDate = new Date(plan.week_start_date);
    const isFuture = planDate > today;

    if (plan.completion_percentage >= 100) return <Badge variant="success">Completed</Badge>;
    if (plan.completion_percentage > 0) return <Badge variant="warning">In Progress</Badge>;
    if (isFuture) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Upcoming</Badge>;
    return <Badge variant="default">Pending</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-4 sm:p-6 text-white shadow-lg sm:shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-200" /> Lesson Plan Tracker 📚
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-0.5 max-w-xl">
              Plan weekly syllabus, track completion percentages, and manage sub-topics.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-3.5 py-2 bg-white text-indigo-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-opacity-95 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Lesson Plan
            </button>
            <button
              onClick={fetchLessonPlans}
              className="px-3 py-2 bg-indigo-800/40 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-medium hover:bg-opacity-60 transition-all active:scale-95 cursor-pointer"
              title="Refresh Lesson Plans"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Compact Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 shrink-0">Week:</span>
          <input
            type="date"
            className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            value={filters.week_start}
            onChange={(e) => setFilters({ ...filters, week_start: e.target.value })}
          />
          {filters.week_start && (
            <button
              onClick={() => setFilters({ ...filters, week_start: '' })}
              className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold hover:bg-rose-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <select
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
          value={filters.class_number}
          onChange={(e) => setFilters({ ...filters, class_number: e.target.value })}
        >
          <option value="">All Classes</option>
          {Array.from(new Set(assignedClasses.map(c => c.class_number))).map(classNum => {
            const cls = assignedClasses.find(c => c.class_number === classNum);
            return <option key={`cls-${classNum}`} value={classNum}>{cls.class_name || `Class ${classNum}`}</option>;
          })}
        </select>

        <select
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
          value={filters.section}
          onChange={(e) => setFilters({ ...filters, section: e.target.value })}
        >
          <option value="">All Sections</option>
          {Array.from(new Set(assignedClasses
            .filter(c => !filters.class_number || c.class_number === filters.class_number)
            .map(c => c.section)))
            .map((section, idx) => (
              <option key={`sec-${section || idx}`} value={section}>{section}</option>
            ))}
        </select>

        <select
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
          value={filters.subject_id}
          onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={`subj-${s.id}`} value={s.id}>{s.name}</option>)}
        </select>

        {(filters.week_start || filters.class_number || filters.section || filters.subject_id) && (
          <button
            onClick={() => setFilters({ week_start: '', class_number: '', section: '', subject_id: '' })}
            className="px-2.5 py-1.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-lg font-bold hover:bg-rose-100 transition-colors ml-auto cursor-pointer"
          >
            ❌ Clear Filters
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-xl px-4">
        {['All', 'Ongoing', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lesson Plans List */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = lessonPlans.filter(plan => {
          const planDate = new Date(plan.week_start_date);
          const isFuture = planDate > today;

          if (activeTab === 'Completed') return plan.completion_percentage >= 100;
          if (activeTab === 'Ongoing') return plan.completion_percentage > 0 && plan.completion_percentage < 100;
          if (activeTab === 'Upcoming') return isFuture && plan.completion_percentage === 0;
          return true; // All tab
        });

        // Sorting for "All" tab: Current/Ongoing first, then Upcoming, then Past
        if (activeTab === 'All') {
          filtered.sort((a, b) => {
            const dateA = new Date(a.week_start_date);
            const dateB = new Date(b.week_start_date);
            const isTodayA = dateA.getTime() === today.getTime();
            const isTodayB = dateB.getTime() === today.getTime();
            const isOngoingA = a.completion_percentage > 0 && a.completion_percentage < 100;
            const isOngoingB = b.completion_percentage > 0 && b.completion_percentage < 100;
            const isFutureA = dateA > today;
            const isFutureB = dateB > today;

            if (isTodayA && !isTodayB) return -1;
            if (!isTodayA && isTodayB) return 1;
            if (isOngoingA && !isOngoingB) return -1;
            if (!isOngoingA && isOngoingB) return 1;
            if (isFutureA && !isFutureB) return -1;
            if (!isFutureA && isFutureB) return 1;
            return isFutureA ? dateA - dateB : dateB - dateA;
          });
        }

        if (filtered.length === 0) {
          return (
            <div className="text-center py-16 bg-white rounded-b-xl border-dashed border-2 border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No {activeTab.toLowerCase()} lesson plans found.</p>
            </div>
          );
        }

        return (
          <div className="space-y-4 bg-white p-4 rounded-b-xl border-t-0 shadow-sm border border-gray-200">
            {filtered.map(plan => (
              <Card key={plan.id} className={`border-l-4 transition-all hover:shadow-md ${plan.completion_percentage >= 100 ? 'border-l-green-500' : plan.completion_percentage > 0 ? 'border-l-amber-500' : 'border-l-gray-300'}`}>
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-800">{plan.topic}</h3>
                      {getStatusBadge(plan)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm border-t pt-3 border-slate-50">
                      <div><span className="text-gray-500 block text-xs font-semibold mb-0.5">Class</span> <span className="text-slate-700">{plan.class_number}-{plan.section}</span></div>
                      <div><span className="text-gray-500 block text-xs font-semibold mb-0.5">Subject</span> <span className="text-slate-700">{plan.subject_name}</span></div>
                      <div><span className="text-gray-500 block text-xs font-semibold mb-0.5">Start date</span> <span className="text-slate-700">{formatDate(plan.week_start_date)}</span></div>
                      <div><span className="text-gray-500 block text-xs font-semibold mb-0.5">Completed</span> <span className="text-slate-700">{plan.completion_percentage >= 100 && plan.completion_date ? formatDate(plan.completion_date) : <span className="text-amber-600 font-medium">Pending</span>}</span></div>
                      <div>
                        <span className="text-gray-500 block text-xs font-semibold mb-0.5">Days taken</span>
                        {plan.week_start_date ? (() => {
                          const start = new Date(plan.week_start_date);
                          start.setHours(0, 0, 0, 0);
                          const end = (plan.completion_percentage >= 100 && plan.completion_date) ? new Date(plan.completion_date) : new Date();
                          end.setHours(0, 0, 0, 0);
                          const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                          if (diff < 0) return <span className="text-slate-400">---</span>;
                          if (diff === 0) return <span className="font-semibold text-indigo-600">Today</span>;
                          return <span className="font-semibold text-indigo-600">{diff + 1} days</span>;
                        })() : <span className="text-slate-400">---</span>}
                      </div>
                    </div>

                    {/* Sub-topics progress */}
                    {plan.sub_topics && plan.sub_topics.length > 0 && (
                      <div className="mt-4 bg-slate-50 p-3 rounded-lg">
                        <p className="text-[10px] font-semibold text-slate-400 mb-2">Sub-topic progress</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.sub_topics.map((st, i) => (
                            <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${st.completed ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                              {st.completed ? '✅' : '⏳'} {st.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex items-center justify-center gap-1.5 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all font-bold text-xs border border-blue-200 shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex items-center justify-center gap-1.5 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-all font-bold text-xs border border-red-200 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Overall progress</span>
                    <span>{plan.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 rounded-full ${plan.completion_percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${plan.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      })()}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPlan ? 'Edit Lesson Plan' : 'Add Lesson Plan'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Class *</label>
              <select className="w-full border rounded-lg p-2" value={formData.class_number} onChange={(e) => setFormData({ ...formData, class_number: e.target.value })} required>
                <option value="">Select Class</option>
                {Array.from(new Set(assignedClasses.map(c => c.class_number))).map(classNum => {
                  const cls = assignedClasses.find(c => c.class_number === classNum);
                  return <option key={classNum} value={classNum}>{cls.class_name || classNum}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Section *</label>
              <select className="w-full border rounded-lg p-2" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} required>
                <option value="">Select Section</option>
                {Array.from(new Set(assignedClasses
                  .filter(c => c.class_number === formData.class_number)
                  .map(c => c.section)))
                  .map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Subject *</label>
              <select className="w-full border rounded-lg p-2" value={formData.subject_id} onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })} required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Plan start date *</label>
              <input type="date" className="w-full border rounded-lg p-2" value={formData.week_start_date} onChange={(e) => setFormData({ ...formData, week_start_date: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Plan end date *</label>
              <input type="date" className="w-full border rounded-lg p-2" value={formData.week_end_date} onChange={(e) => setFormData({ ...formData, week_end_date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Chapter name *</label>
              <input type="text" className="w-full border rounded-lg p-2" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} required />
            </div>
          </div>

          {/* Sub-topics checklist */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-700">Sub-topics / tasks checklist</label>
              <Button size="sm" variant="secondary" onClick={() => {
                const title = window.prompt("Enter sub-topic title:");
                if (title && title.trim()) {
                  const newSubTopics = [...formData.sub_topics, { title: title.trim(), completed: false }];
                  const completedCount = newSubTopics.filter(t => t.completed).length;
                  const percentage = Math.round((completedCount / newSubTopics.length) * 100);
                  setFormData({
                    ...formData,
                    sub_topics: newSubTopics,
                    completion_percentage: percentage,
                    completion_date: percentage === 100 ? (formData.completion_date || new Date().toISOString().split('T')[0]) : ''
                  });
                }
              }} type="button">
                <Plus className="w-3 h-3 mr-1" /> Add Topic
              </Button>
            </div>
            <div className="space-y-2">
              {formData.sub_topics.map((st, i) => (
                <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 group">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={(e) => {
                      const newSubTopics = formData.sub_topics.map((t, idx) => 
                        idx === i ? { ...t, completed: e.target.checked } : t
                      );
                      const completedCount = newSubTopics.filter(t => t.completed).length;
                      const percentage = newSubTopics.length > 0 ? Math.round((completedCount / newSubTopics.length) * 100) : 0;
                      setFormData({
                        ...formData,
                        sub_topics: newSubTopics,
                        completion_percentage: percentage,
                        completion_date: percentage === 100 ? new Date().toISOString().split('T')[0] : (percentage < 100 ? '' : formData.completion_date)
                      });
                    }}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => {
                      const newSubTopics = [...formData.sub_topics];
                      newSubTopics[i].title = e.target.value;
                      setFormData({ ...formData, sub_topics: newSubTopics });
                    }}
                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm"
                  />
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const newTitle = window.prompt("Edit sub-topic title:", st.title);
                        if (newTitle && newTitle.trim()) {
                          const newSubTopics = [...formData.sub_topics];
                          newSubTopics[i].title = newTitle;
                          setFormData({ ...formData, sub_topics: newSubTopics });
                        }
                      }}
                      className="text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-lg border border-indigo-100 shadow-sm transition-colors"
                      title="Edit topic"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newSubTopics = formData.sub_topics.filter((_, idx) => idx !== i);
                        const completedCount = newSubTopics.filter(t => t.completed).length;
                        const percentage = newSubTopics.length > 0 ? Math.round((completedCount / newSubTopics.length) * 100) : 0;
                        setFormData({
                          ...formData,
                          sub_topics: newSubTopics,
                          completion_percentage: percentage,
                          completion_date: percentage === 100 ? (formData.completion_date || new Date().toISOString().split('T')[0]) : (percentage < 100 ? '' : formData.completion_date)
                        });
                      }}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg border border-rose-100 shadow-sm transition-colors"
                      title="Remove topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.sub_topics.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-2 italic">Add specific items to track progress more accurately</p>
              )}
            </div>
          </div>

          {/* Calculated completion */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-slate-700">Calculated completion</label>
              <p className="text-xs text-slate-500">Based on checklist items above</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${formData.completion_percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${formData.completion_percentage}%` }}
                ></div>
              </div>
              <span className="text-lg font-black text-slate-700 w-12 text-right">{formData.completion_percentage}%</span>
            </div>
          </div>
          {formData.completion_percentage === 100 && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-green-700">Completion date *</label>
              <input
                type="date"
                className="w-full border border-green-200 bg-green-50 rounded-lg p-2"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                required={formData.completion_percentage === 100}
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Add Plan')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherLessonPlan;