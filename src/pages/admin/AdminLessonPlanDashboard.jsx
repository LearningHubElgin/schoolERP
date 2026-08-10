import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Users, BookOpen, Clock, CheckCircle, AlertCircle, TrendingUp, Search, Calendar,
  ChevronRight, Filter, Download
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const AdminLessonPlanDashboard = () => {
  const [summary, setSummary] = useState({ byTeacher: [], byClass: [], bySubject: [] });
  const [recentPlans, setRecentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({
    week_start: '',
    week_end: '',
    teacher_id: ''
  });
  const [teachers, setTeachers] = useState([]);

  function getThisWeekMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
  }
  function getThisWeekSunday() {
    const monday = new Date(getThisWeekMonday());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [summaryRes, plansRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/lesson-plans/summary?week_start=${filters.week_start}&week_end=${filters.week_end}&teacher_id=${filters.teacher_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/lesson-plans/report?week_start=${filters.week_start}&week_end=${filters.week_end}&teacher_id=${filters.teacher_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.summary);
      if (plansRes.data.success) setRecentPlans(plansRes.data.lessonPlans);

      // Fetch teacher list for filter
      const teacherListRes = await axios.get(`${API_URL}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (teacherListRes.data.success) setTeachers(teacherListRes.data.teachers);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const teacherData = summary.byTeacher.map(t => ({ name: t.name.split(' ')[0], avg: Math.round(t.avg_completion), total: t.total_tasks }));
  const classData = summary.byClass.map(c => ({ name: c.class_name || c.class_number, avg: Math.round(c.avg_completion) }));
  const subjectData = summary.bySubject.map(s => ({ name: s.name, avg: Math.round(s.avg_completion) }));

  const totalTasks = summary.byTeacher.reduce((sum, t) => sum + t.total_tasks, 0);
  const overallAvg = summary.byTeacher.length ? Math.round(summary.byTeacher.reduce((sum, t) => sum + t.avg_completion, 0) / summary.byTeacher.length) : 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-5 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-lg md:text-xl font-bold tracking-tight">📊 Lesson Plan Dashboard</h1>
          <p className="mt-1 text-indigo-100 text-xs md:text-sm">Monitor teacher lesson plan completion and track syllabus coverage</p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="block text-sm font-semibold mb-1">From Date</label><input type="date" className="w-full border rounded-lg p-2" value={filters.week_start} onChange={(e) => setFilters({ ...filters, week_start: e.target.value })} /></div>
          <div><label className="block text-sm font-semibold mb-1">To Date</label><input type="date" className="w-full border rounded-lg p-2" value={filters.week_end} onChange={(e) => setFilters({ ...filters, week_end: e.target.value })} /></div>
          <div>
            <label className="block text-sm font-semibold mb-1">Teacher</label>
            <select className="w-full border rounded-lg p-2" value={filters.teacher_id} onChange={(e) => setFilters({ ...filters, teacher_id: e.target.value })}>
              <option value="">All Teachers</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ week_start: '', week_end: '', teacher_id: '' })}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50"><div className="text-center"><Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" /><p className="text-2xl font-bold">{recentPlans.length}</p><p className="text-sm text-gray-600">Total Lesson Plans</p></div></Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50"><div className="text-center"><CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold">{overallAvg}%</p><p className="text-sm text-gray-600">Average Completion</p></div></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50"><div className="text-center"><Users className="w-8 h-8 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold">{summary.byTeacher.length}</p><p className="text-sm text-gray-600">Teachers Active</p></div></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Teacher-wise Completion">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teacherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#6366f1" name="Avg Completion (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Class-wise Progress">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#10b981" name="Completion (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Teacher Performance Summary */}
      <Card title="Teacher-wise Activity Summary">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left font-bold">Teacher Name</th>
                <th className="p-3 text-center font-bold">Total Plans</th>
                <th className="p-3 text-center font-bold">Completed</th>
                <th className="p-3 text-center font-bold">Avg. Progress</th>
                <th className="p-3 text-center font-bold">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.byTeacher.map(teacher => (
                <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {teacher.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-600">{teacher.total_tasks}</td>
                  <td className="p-3 text-center">
                    <Badge variant={teacher.completed_tasks === teacher.total_tasks ? "success" : "default"}>
                      {teacher.completed_tasks} / {teacher.total_tasks}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[80px]">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${teacher.avg_completion >= 80 ? 'bg-emerald-500' :
                            teacher.avg_completion >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          style={{ width: `${teacher.avg_completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold w-10 text-right">{Math.round(teacher.avg_completion)}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {teacher.avg_completion >= 90 ? '🌟 Excellent' :
                      teacher.avg_completion >= 70 ? '✅ Good' :
                        teacher.avg_completion >= 40 ? '⚠️ Average' : '🚨 Poor'}
                  </td>
                </tr>
              ))}
              {summary.byTeacher.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 italic">No teacher activity found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Report with Tabs */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Detailed Lesson Plan Report</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['All', 'Ongoing', 'Upcoming', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 text-left font-bold border-b border-slate-700">Teacher</th>
                <th className="p-4 text-left font-bold border-b border-slate-700">Class</th>
                <th className="p-4 text-left font-bold border-b border-slate-700">Subject</th>
                <th className="p-4 text-left font-bold border-b border-slate-700">Topic</th>
                <th className="p-4 text-center font-bold border-b border-slate-700">Start date</th>
                <th className="p-4 text-center font-bold border-b border-slate-700">Completed</th>
                <th className="p-4 text-center font-bold border-b border-slate-700">Days taken</th>
                <th className="p-4 text-center font-bold border-b border-slate-700">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let filtered = recentPlans.filter(plan => {
                  const planDate = new Date(plan.week_start_date);
                  const isFuture = planDate > today;
                  if (activeTab === 'Completed') return plan.completion_percentage >= 100;
                  if (activeTab === 'Ongoing') return plan.completion_percentage > 0 && plan.completion_percentage < 100;
                  if (activeTab === 'Upcoming') return isFuture && plan.completion_percentage === 0;
                  return true;
                });

                // Smart Sorting for "All" tab
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

                return (
                  <>
                    {filtered.slice(0, 100).map(plan => {
                      const isCompleted = plan.completion_percentage >= 100 && plan.completion_date;

                      // Calculate days taken (Ongoing or Completed)
                      const start = new Date(plan.week_start_date);
                      start.setHours(0, 0, 0, 0);
                      const end = isCompleted ? new Date(plan.completion_date) : new Date();
                      end.setHours(0, 0, 0, 0);
                      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                      const displayDays = diff < 0 ? '---' : (diff === 0 ? 'Today' : `${diff + 1}d`);

                      return (
                        <tr key={plan.id} className="hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-100">
                          <td className="p-4 font-medium text-slate-700 border-r border-slate-100">{plan.teacher_name}</td>
                          <td className="p-4 border-r border-slate-100">{plan.class_number}-{plan.section}</td>
                          <td className="p-4 text-indigo-600 font-medium border-r border-slate-100">{plan.subject_name}</td>
                          <td className="p-4 min-w-[180px] max-w-[250px] border-r border-slate-100">
                            <div className="font-bold text-slate-800 text-base mb-1">{plan.topic}</div>
                            {plan.sub_topics && (
                              <div className="mt-1 space-y-1">
                                {(() => {
                                  try {
                                    let subs = typeof plan.sub_topics === 'string' ? JSON.parse(plan.sub_topics) : plan.sub_topics;
                                    if (typeof subs === 'string') {
                                      subs = JSON.parse(subs);
                                    }
                                    if (Array.isArray(subs) && subs.length > 0) {
                                      const completedList = subs.filter(s => typeof s === 'object' ? s.completed : false).map(s => typeof s === 'object' ? s.title : s);
                                      const pendingList = subs.filter(s => typeof s === 'object' ? !s.completed : true).map(s => typeof s === 'object' ? s.title : s);

                                      return (
                                        <div className="text-[11px] space-y-0.5">
                                          {completedList.length > 0 && (
                                            <div>
                                              <span className="text-emerald-600 font-bold uppercase text-[10px] mr-1">Completed:</span>
                                              <span className="text-slate-500">{completedList.join(', ')}</span>
                                            </div>
                                          )}
                                          {pendingList.length > 0 && (
                                            <div>
                                              <span className="text-orange-500 font-bold uppercase text-[10px] mr-1">Incomplete:</span>
                                              <span className="text-slate-500">{pendingList.join(', ')}</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  } catch (e) { return null; }
                                  return null;
                                })()}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap border-r border-slate-100">{formatDate(plan.week_start_date)}</td>
                          <td className="p-4 text-center whitespace-nowrap border-r border-slate-100">
                            {isCompleted ? (
                              <span className="text-emerald-600 font-medium">{formatDate(plan.completion_date)}</span>
                            ) : (
                              <span className="text-amber-600 font-medium italic">Pending</span>
                            )}
                          </td>
                          <td className="p-4 text-center font-bold border-r border-slate-100 text-slate-700">
                            {displayDays}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                                <div
                                  className={`h-1.5 rounded-full ${plan.completion_percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${plan.completion_percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold w-8 text-right text-slate-700">{plan.completion_percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="8" className="p-12 text-center">
                          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                          <p className="text-slate-400 italic">No {activeTab.toLowerCase()} lesson plans found for the current selection.</p>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminLessonPlanDashboard;