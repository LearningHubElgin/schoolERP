import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Filter, Search } from 'lucide-react';

const NonTeachingStaffAssignWork = () => {
    const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
    const [searchQuery, setSearchQuery] = useState('');

    // Placeholder tasks — will be fetched from API later
    const [tasks] = useState([
        {
            id: 1,
            title: 'Prepare Mathematics Exam Paper (Class 10)',
            description: 'Create final exam paper with 50 marks MCQ and 50 marks descriptive for Class 10 annual examination.',
            assigned_by: 'Principal',
            assigned_date: '2026-03-20',
            due_date: '2026-03-28',
            status: 'pending',
            priority: 'High',
            class: 'Class 10',
        },
        {
            id: 2,
            title: 'Submit Attendance Report (March)',
            description: 'Compile and submit the monthly attendance report for all assigned classes.',
            assigned_by: 'Admin Office',
            assigned_date: '2026-03-25',
            due_date: '2026-03-31',
            status: 'in-progress',
            priority: 'Medium',
            class: 'All Classes',
        },
        {
            id: 3,
            title: 'Prepare Class 9 Syllabus Completion Report',
            description: 'Submit a detailed report on syllabus completion status for Class 9 Mathematics.',
            assigned_by: 'HOD',
            assigned_date: '2026-03-18',
            due_date: '2026-03-24',
            status: 'completed',
            priority: 'Low',
            class: 'Class 9',
        },
        {
            id: 4,
            title: 'Conduct Extra Classes for Weak Students',
            description: 'Identify students scoring below 40% and arrange remedial classes after school hours.',
            assigned_by: 'Principal',
            assigned_date: '2026-03-22',
            due_date: '2026-04-05',
            status: 'pending',
            priority: 'High',
            class: 'Class 8-A',
        },
        {
            id: 5,
            title: 'Update Student Progress Cards',
            description: 'Enter marks and comments in the student progress cards for mid-term evaluation.',
            assigned_by: 'Admin Office',
            assigned_date: '2026-03-15',
            due_date: '2026-03-22',
            status: 'completed',
            priority: 'Medium',
            class: 'Class 10-B',
        },
    ]);

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'all' || task.status === filter;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock className="w-4 h-4" />, label: 'Pending' };
            case 'in-progress': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <AlertCircle className="w-4 h-4" />, label: 'In Progress' };
            case 'completed': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: null, label: status };
        }
    };

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'High': return 'destructive';
            case 'Medium': return 'warning';
            default: return 'default';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'completed') return false;
        return new Date(dueDate) < new Date();
    };

    // Stats
    const totalTasks = tasks.length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 p-4 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                            <ClipboardList className="w-7 h-7" /> Assigned Work
                        </h1>
                        <p className="text-amber-100 mt-1">View and manage your assigned tasks & responsibilities</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-lg border border-white/20 text-center">
                            <p className="text-2xl font-bold">{pendingCount}</p>
                            <p className="text-[10px] text-amber-100 uppercase font-bold tracking-wider">Pending</p>
                        </div>
                        <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-lg border border-white/20 text-center">
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                            <p className="text-[10px] text-amber-100 uppercase font-bold tracking-wider">In Progress</p>
                        </div>
                        <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-lg border border-white/20 text-center">
                            <p className="text-2xl font-bold">{completedCount}</p>
                            <p className="text-[10px] text-amber-100 uppercase font-bold tracking-wider">Done</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <Card variant="elevated">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    {/* Filter Pills */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'in-progress', label: 'In Progress' },
                            { key: 'completed', label: 'Done' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${filter === f.key
                                    ? 'bg-white text-amber-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Task List */}
            {filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-800 font-semibold text-lg">No tasks found</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {filter !== 'all' ? 'Try changing the filter to see more tasks.' : 'No tasks have been assigned yet.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map(task => {
                        const statusConfig = getStatusConfig(task.status);
                        const overdue = isOverdue(task.due_date, task.status);

                        return (
                            <Card key={task.id} variant="elevated" className={`hover:shadow-lg transition-all duration-300 border-l-4 ${overdue ? 'border-l-red-500' : task.status === 'completed' ? 'border-l-emerald-500' : task.status === 'in-progress' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                                            <Badge variant={getPriorityVariant(task.priority)} className="text-xs">{task.priority}</Badge>
                                            {overdue && <Badge variant="destructive" className="text-xs animate-pulse">Overdue!</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-700">Assigned by:</span> {task.assigned_by}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-700">Class:</span> {task.class}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-700">Assigned:</span> {formatDate(task.assigned_date)}
                                            </span>
                                            <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-semibold' : ''}`}>
                                                <span className="font-semibold text-gray-700">Due:</span> {formatDate(task.due_date)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border shrink-0`}>
                                        {statusConfig.icon}
                                        {statusConfig.label}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NonTeachingStaffAssignWork;
