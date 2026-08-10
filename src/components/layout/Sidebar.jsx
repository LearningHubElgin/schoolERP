import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';

// ─── SVG Icon Helpers ─────────────────────────────────────────────────────────

const IconLogout = ({ className = "w-5 h-5 text-red-400" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const IconChevronRight = ({ className = "w-4 h-4 text-slate-400", rotated = false }) => (
    <svg className={`${className} transition-transform duration-200 ${rotated ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const IconDoubleChevronLeft = ({ className = "w-4 h-4 text-blue-400", flipped = false }) => (
    <svg className={`${className} transition-transform duration-200 ${flipped ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
);

const IconClose = ({ className = "w-5 h-5 text-slate-400" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const IconLogoutModal = ({ className = "w-10 h-10 text-red-500" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar = ({
    role,
    isMobileMenuOpen = false,
    closeMobileMenu = () => { },
    isCollapsed = false,
    toggleCollapse,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef(null);

    const [userName, setUserName] = useState('');
    const [schoolName, setSchoolName] = useState('School ERP');
    const [schoolLogo, setSchoolLogo] = useState('');
    const [expandedStores, setExpandedStores] = useState({});
    const [expandedMenus, setExpandedMenus] = useState({});
    const [hideAttendance, setHideAttendance] = useState(false);
    const [canManageStudents, setCanManageStudents] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [isPassedOut, setIsPassedOut] = useState(false);

    // ── Fetch User & School info from localStorage ─────────────────────────────
    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        const storedSchoolName = localStorage.getItem('schoolName');
        const storedSchoolLogo = localStorage.getItem('schoolLogo');
        const passedOut = localStorage.getItem('isPassedOut');

        if (storedUserName) setUserName(storedUserName);
        if (storedSchoolName) setSchoolName(storedSchoolName);
        if (storedSchoolLogo) setSchoolLogo(storedSchoolLogo);
        if (passedOut === 'true') setIsPassedOut(true);

        // Teacher role permission checks
        if (role === 'teacher') {
            const token = localStorage.getItem('token');
            if (token) {
                axios.get(`${API_URL}/api/teacher/attendance-mode`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(res => {
                        if (
                            res.data.success &&
                            res.data.mode === 'day_wise' &&
                            (!res.data.assignedClasses || res.data.assignedClasses.length === 0)
                        ) {
                            setHideAttendance(true);
                        }
                    })
                    .catch(() => { });

                axios.get(`${API_URL}/api/teacher/permissions`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(res => {
                        if (res.data.success) {
                            setCanManageStudents(res.data.permissions?.can_manage_students || false);
                        }
                    })
                    .catch(() => { });
            }
        }
    }, [role]);

    // ── Toggle Helpers ────────────────────────────────────────────────────────

    const toggleStoreExpand = (slug) => {
        setExpandedStores(prev => ({ ...prev, [slug]: !prev[slug] }));
    };

    const toggleMenuExpand = (key) => {
        setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ── Store Types for Store Manager ──────────────────────────────────────────

    const storeTypes = [
        { name: 'Sports Store', slug: 'sports', icon: '⚽' },
        { name: 'Music Store', slug: 'music', icon: '🎵' },
        { name: 'Library Store', slug: 'library-store', icon: '📚' },
        { name: 'Food Store', slug: 'food', icon: '🍔' },
        { name: 'Medical Store', slug: 'medical', icon: '🏥' },
        { name: 'Uniform Store', slug: 'uniform', icon: '👔' },
        { name: 'Convenience Store', slug: 'convenience', icon: '🏪' },
    ];

    // ── Menu Items Dictionary ──────────────────────────────────────────────────

    const menuItems = {
        student: [
            { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
            { name: 'My Profile', path: '/student/profile', icon: '👤' },
            { name: 'Fees', path: '/student/fees', icon: '💰' },
            { name: 'Attendance', path: '/student/attendance', icon: '📅' },
            { name: 'Class Time Table', path: '/student/timetable', icon: '📅' },
            { name: 'My Syllabus', path: '/student/syllabus', icon: '📚' },
            { name: 'Online Study', path: '/student/online-study', icon: '🎬' },
            { name: 'My Library Books', path: '/student/library', icon: '📖' },
            { name: 'Requisition', path: '/student/requisition', icon: '📋' },
            { name: 'Assignments & Notes', path: '/student/assignments', icon: '📝' },
            { name: 'Apply Leave', path: '/student/leave', icon: '📨' },
            { name: 'Holidays', path: '/student/holidays', icon: '📅' },
            { name: 'Forms Center', path: '/student/forms', icon: '📄' },
            { name: 'My Cards', path: '/student/cards', icon: '💳' },
            { name: 'Store Purchases', path: '/student/store-purchases', icon: '🏪' },
            { name: 'My Marksheets', path: '/student/marksheets', icon: '📋' },
            { name: 'Submit Grievance', path: '/student/grievance', icon: '📢' },
            { name: 'Track Vehicle', path: '/student/track-vehicle', icon: '🛰️' },
        ],
        teacher: [
            { name: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
            { name: 'Lesson Plan', path: '/teacher/lesson-plans', icon: '📖' },
            { name: 'Check In / Out', path: '/teacher/self-attendance', icon: '📍' },
            { name: 'Class Time Table', path: '/teacher/timetable', icon: '📅' },
            { name: 'Take Attendance', path: '/teacher/attendance', icon: '✅' },
            { name: 'My Students', path: '/teacher/students', icon: '🎓' },
            { name: 'Enter Marks', path: '/teacher/marks-entry', icon: '📝' },
            { name: 'Requisitions', path: '/teacher/requisition', icon: '📋' },
            { name: 'My Profile', path: '/teacher/profile', icon: '👤' },
            { name: 'Assignments & Notes', path: '/teacher/assignments', icon: '📝' },
            { name: 'Manage Syllabus', path: '/teacher/syllabus', icon: '📚' },
            { name: 'Apply Leave', path: '/teacher/leave', icon: '📨' },
            { name: 'My Payslips', path: '/teacher/payslips', icon: '💰' },
            { name: 'Holidays', path: '/teacher/holidays', icon: '📅' },
            { name: 'Grievance', path: '/teacher/grievance', icon: '📢' },
            { name: 'Store Purchases', path: '/teacher/store-purchases', icon: '🏪' },
        ],
        accounts: [
            { name: 'Dashboard', path: '/accounts/dashboard', icon: '📊' },
            { name: 'Fee Collect', path: '/accounts/fees', icon: '💰' },
            { name: 'Expenses', path: '/accounts/expenses', icon: '💸' },
            { name: 'Reports', path: '/accounts/reports', icon: '📈' },
            { name: 'Analytics', path: '/accounts/analytics', icon: '📊' },
            { name: 'Requisitions', path: '/accounts/requisitions', icon: '📋' },
            { name: 'Salary Management', path: '/accounts/payslips', icon: '🧾' },
        ],
        admin: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
            { name: 'User Management', path: '/admin/users', icon: '👥' },
            {
                name: 'Students', icon: '🎓',
                submenu: [
                    { name: 'Manage Students', path: '/admin/students', icon: '👥' },
                    { name: 'Attendance Report', path: '/admin/student-attendance-report', icon: '📊' },
                    { name: 'Student Class Time Table', path: '/admin/student-timetable', icon: '📅' },
                    { name: 'Issue Cards', path: '/admin/cards', icon: '💳' },
                    { name: 'Student Joining Report', path: '/admin/student-joining-report', icon: '📈' },
                    { name: 'Passout Students', path: '/admin/passout-students', icon: '🎓' },
                ],
            },
            {
                name: 'Teachers', icon: '👨🏫',
                submenu: [
                    { name: 'Manage Teachers', path: '/admin/teachers', icon: '👨🏫' },
                    { name: 'Teacher Student Permissions', path: '/admin/teacher-permissions', icon: '🔐' },
                    { name: 'Teacher Attendance Dashboard', path: '/admin/attendance-dashboard', icon: '📍' },
                    { name: 'Teacher Class Table', path: '/admin/teacher-timetable', icon: '📅' },
                    { name: 'Manage Teacher Payslips', path: '/admin/payslips', icon: '💰' },
                    { name: 'Student Attendance Config', path: '/admin/student-attendance-config', icon: '⚙️' },
                    { name: 'Lesson Plan', path: '/admin/syllabus-progress', icon: '📊' },
                ],
            },
            {
                name: 'Academic', icon: '📚',
                submenu: [
                    { name: 'Manage Academic', path: '/admin/academic', icon: '📚' },
                    { name: 'Syllabus Management', path: '/admin/syllabus', icon: '📖' },
                    { name: 'Marks Management', path: '/admin/marks', icon: '📝' },
                    { name: 'Marksheet Templates', path: '/admin/marksheet-templates', icon: '📄' },
                    { name: 'Elective Groups', path: '/admin/elective-groups', icon: '🎯' },
                    { name: 'Manage Forms', path: '/admin/forms', icon: '📄' },
                ],
            },
            {
                name: 'Others', icon: '📁',
                submenu: [
                    { name: 'Holiday Manage', path: '/admin/holiday-management', icon: '🎄' },
                    { name: 'Events & Notices Management', path: '/admin/events-notices', icon: '📢' },
                    { name: 'Grievance Management', path: '/admin/grievances', icon: '📢' },
                    { name: 'Requisition Approval', path: '/admin/requisitions', icon: '📝' },
                    { name: 'Leave Approvals', path: '/admin/leave-approval', icon: '✅' },
                ],
            },
            {
                name: 'Visitors', icon: '🛂',
                submenu: [
                    { name: 'Visitors Approvals', path: '/admin/visitor-approval', icon: '✔️' },
                    { name: 'Visitors Appointments', path: '/admin/visitor-appointments', icon: '📅' },
                ],
            },
            {
                name: 'Transport Management', icon: '🚗',
                submenu: [
                    { name: 'Transport Manage', path: '/admin/transport', icon: '📋' },
                    { name: 'Driver Details', path: '/admin/drivers', icon: '👤' },
                    { name: 'Assign Students to Vehicle', path: '/admin/assign-student-vehical', icon: '🎓' },
                    { name: 'Driver Attendance', path: '/admin/driver-attendance', icon: '✅' },
                    { name: 'Track Vehicle', path: '/admin/track-vehicle', icon: '🛰️' },
                ],
            },
            {
                name: 'Non Teaching Staff', icon: '🧑🔧',
                submenu: [
                    { name: 'Non Teaching Staff', path: '/admin/nonteaching-staff-list', icon: '👥' },
                    { name: 'Staff Attendance ', path: '/admin/nonteaching-staff-attendance', icon: '✅' },
                    { name: 'Assign Work', path: '/admin/nonteaching-staff-assign-work', icon: '📋' },
                    { name: 'Staff ID Cards', path: '/admin/nonteaching-staff-cards', icon: '💳' },
                    { name: 'Shift Time', path: '/admin/nonteaching-staff-shift-time', icon: '⏰' },
                ],
            },
            { name: 'Fee Management', path: '/admin/fees', icon: '💰' },
            {
                name: 'Certificate', icon: '📜',
                submenu: [
                    { name: 'Bonafide Certificate', path: '/admin/bonafide-certificate', icon: '📜' },
                    { name: 'Character Certificate', path: '/admin/character-certificate', icon: '🌟' },
                    { name: 'Transfer Certificate', path: '/admin/transfer-certificate', icon: '📜' },
                ],
            },
            { name: 'School Settings', path: '/admin/school-settings', icon: '🏫' },
            { name: 'Audit Trail & Activity Logs', path: '/admin/activity-logs', icon: '🛡️' },
            { name: 'Enquiry Management', path: '/admin/enquiry-management', icon: '📞' },
        ],
        admission: [
            { name: 'Dashboard', path: '/admission/dashboard', icon: '📊' },
            { name: 'Applications', path: '/admission/applications', icon: '📄' },
            { name: 'New Application', path: '/admission/new-application', icon: '➕' },
            { name: 'Reports', path: '/admission/reports', icon: '📑' },
        ],
        library: [
            { name: 'Dashboard', path: '/library/dashboard', icon: '📊' },
            { name: 'Add Book', path: '/library/add-book', icon: '➕' },
            { name: 'Book Catalog', path: '/library/catalog', icon: '📚' },
            { name: 'Issue Book', path: '/library/issue', icon: '📤' },
            { name: 'Issued Books', path: '/library/issued', icon: '📋' },
            { name: 'Return Book', path: '/library/return', icon: '📥' },
            { name: 'Return Book History', path: '/library/history', icon: '📜' },
            { name: 'Online Study', path: '/library/online-study', icon: '🎬' },
        ],
        storemanager: [
            { name: 'Dashboard', path: '/store/dashboard', icon: '📊', type: 'overview' },
            { name: 'Inventory Overview', path: '/store/inventory-overview', icon: '📦', type: 'overview' },
            { name: 'Reports Overview', path: '/store/reports-overview', icon: '📈', type: 'overview' },
            { name: 'Grievances', path: '/store/grievances', icon: '📢', type: 'overview' },
            { name: 'Requisitions', path: '/store/requisitions', icon: '📋', type: 'overview' },
        ],
        security: [
            { name: 'Dashboard', path: '/security/dashboard', icon: '📊' },
            { name: 'New Visitor', path: '/security/new-visitor', icon: '📝' },
            { name: 'Visitor Appointments', path: '/security/appointments', icon: '📅' },
            { name: 'Visitors Log', path: '/security/visitors-log', icon: '📋' },
        ],
        transport: [
            { name: 'My Profile', path: '/transport/profile', icon: '👤' },
            { name: 'Self Attendance', path: '/transport/self-attendance', icon: '📍' },
            { name: 'My Travel', path: '/transport/my-travel', icon: '🚗' },
        ],
        nonteachingstaff: [
            { name: 'Dashboard', path: '/nonTeachingStaff/dashboard', icon: '📊' },
            { name: 'Check In / Out', path: '/nonTeachingStaff/attendance', icon: '📍' },
            { name: 'My Profile', path: '/nonTeachingStaff/profile', icon: '👤' },
            { name: 'My ID Card', path: '/nonTeachingStaff/id-card', icon: '🪪' },
            { name: 'Assigned Work', path: '/nonTeachingStaff/assigned-work', icon: '📋' },
            { name: 'My Shift', path: '/nonTeachingStaff/shift-time', icon: '🕒' },
        ],
        superadmin: [
            { name: 'Dashboard', path: '/superadmin/dashboard', icon: '📊' },
            { name: 'Add School', path: '/superadmin/add-school', icon: '🏫' },
            { name: 'View Schools', path: '/superadmin/view-schools', icon: '🏢' },
            { name: 'Audit Trail & Logs', path: '/superadmin/activity-logs', icon: '🛡️' },
        ],
    };

    // ── Build items list & filter ──────────────────────────────────────────────

    let items = menuItems[role || ''] || [];

    if (role === 'student' && isPassedOut) {
        items = items.filter(item =>
            !['requisition', 'grievance', 'leave', 'attendance', 'online-study']
                .includes(item.path?.split('/').pop() || '')
        );
    }

    if (role === 'teacher' && hideAttendance) {
        items = items.filter(item => item.path !== '/teacher/attendance');
    }

    if (role === 'teacher' && canManageStudents) {
        const hasManageStudents = items.some(item => item.path === '/teacher/manage-students');
        if (!hasManageStudents) {
            const myStudentsIndex = items.findIndex(item => item.path === '/teacher/students');
            if (myStudentsIndex !== -1) {
                items = [
                    ...items.slice(0, myStudentsIndex + 1),
                    { name: 'Manage Students', path: '/teacher/manage-students', icon: '👥' },
                    ...items.slice(myStudentsIndex + 1),
                ];
            } else {
                items.push({ name: 'Manage Students', path: '/teacher/manage-students', icon: '👥' });
            }
        }
    }

    // ── Active Detection ───────────────────────────────────────────────────────

    const isActive = (path) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const isSubActive = (submenu) =>
        submenu?.some(sub => isActive(sub.path));

    // Pre-expand active submenus
    useEffect(() => {
        const currentItems = menuItems[role || ''] || [];
        const newExpandedMenus = {};

        currentItems.forEach(item => {
            if (item.submenu && item.submenu.length > 0) {
                const subActive = item.submenu.some(sub => isActive(sub.path));
                if (subActive) {
                    newExpandedMenus[item.name] = true;
                }
            }
        });

        setExpandedMenus(prev => ({ ...prev, ...newExpandedMenus }));

        if (role === 'storemanager') {
            const newExpandedStores = {};
            storeTypes.forEach(store => {
                const isStoreActive = location.pathname.includes(`/store/${store.slug}`);
                if (isStoreActive) {
                    newExpandedStores[store.slug] = true;
                }
            });
            setExpandedStores(prev => ({ ...prev, ...newExpandedStores }));
        }
    }, [location.pathname, role]);

    // ── Logout ────────────────────────────────────────────────────────────────

    const handleLogout = () => {
        localStorage.clear();
        setShowLogoutModal(false);
        closeMobileMenu();
        navigate('/login');
    };

    const handleLogoClick = () => {
        const userRole = role || localStorage.getItem('userRole') || '';
        if (!userRole) {
            navigate('/');
            return;
        }
        const rolePath = userRole === 'nonteachingstaff' ? 'nonTeachingStaff' : userRole;
        navigate(`/${rolePath}/dashboard`);
        if (closeMobileMenu) closeMobileMenu();
    };

    const hasLogo = !logoError && !!schoolLogo;

    // ── Sidebar Content (Header + Nav Scroll + Footer) ─────────────────────────

    const sidebarContent = (
        <aside
            className={`flex flex-col bg-slate-900 text-slate-300 h-full border-r border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out relative select-none z-40 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* ── Fixed Logo Header ──────────────────────────────────────────── */}
            <div className="relative p-3 border-b border-slate-800/80 bg-slate-900 flex-shrink-0 z-40">
                <div className="flex flex-col items-center justify-center">
                    {/* School Logo */}
                    <div
                        onClick={handleLogoClick}
                        className="mb-2 cursor-pointer hover:scale-105 transition-transform duration-200"
                        title="Go to Dashboard"
                    >
                        <div
                            className={`rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-500/20 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-9 h-9' : 'w-12 h-12'
                                }`}
                        >
                            {hasLogo ? (
                                <img
                                    src={`${API_URL}${schoolLogo}`}
                                    alt="School Logo"
                                    className="w-full h-full object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className={isCollapsed ? 'text-lg' : 'text-2xl'}>🏫</span>
                            )}
                        </div>
                    </div>

                    {/* School Name & Portal Badge */}
                    {!isCollapsed && (
                        <>
                            <h1
                                onClick={handleLogoClick}
                                className="text-xs font-bold text-blue-300 text-center line-clamp-2 leading-tight px-1 mb-1 cursor-pointer hover:text-white transition-colors"
                                title="Go to Dashboard"
                            >
                                {schoolName}
                            </h1>

                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 my-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
                                    {role} Portal
                                </span>
                            </div>

                            {userName && (
                                <div className="w-full pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-slate-300 px-2">
                                    <span className="text-xs">👤</span>
                                    <span className="text-xs font-semibold truncate max-w-[170px] text-slate-200">
                                        {userName}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Close Button */}
                {!isCollapsed && (
                    <button
                        onClick={closeMobileMenu}
                        className="md:hidden absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <IconClose />
                    </button>
                )}

                {/* Desktop Collapse Toggle */}
                {toggleCollapse && (
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:flex absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-slate-900 border-2 border-blue-500/60 items-center justify-center z-50 shadow-xl shadow-black/50 text-blue-400 hover:text-white hover:bg-blue-600 hover:border-white transition-all duration-200 cursor-pointer active:scale-95"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <IconDoubleChevronLeft flipped={isCollapsed} />
                    </button>
                )}
            </div>

            {/* ── Scrollable Navigation ──────────────────────────────────────── */}
            <div
                ref={navRef}
                className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 sidebar-scrollbar"
            >
                {items.map((item) => {
                    const hasSubmenu = !!(item.submenu && item.submenu.length > 0);
                    const isExpanded = expandedMenus[item.name];
                    const subIsActive = hasSubmenu && isSubActive(item.submenu);

                    if (hasSubmenu) {
                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    onClick={() => {
                                        if (isCollapsed && toggleCollapse) toggleCollapse();
                                        toggleMenuExpand(item.name);
                                    }}
                                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                                        } py-2 rounded-xl text-xs font-medium transition-all ${subIsActive
                                            ? 'bg-slate-800/90 text-white font-semibold shadow-sm'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-base">{item.icon}</span>
                                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <IconChevronRight rotated={isExpanded} className="w-3.5 h-3.5" />
                                    )}
                                </button>

                                {/* Submenu Links */}
                                {isExpanded && !isCollapsed && (
                                    <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 my-1">
                                        {item.submenu.map((sub) => {
                                            const subActive = isActive(sub.path);
                                            return (
                                                <Link
                                                    key={sub.path}
                                                    to={sub.path}
                                                    onClick={closeMobileMenu}
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${subActive
                                                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                        }`}
                                                >
                                                    <span className="text-xs">{sub.icon}</span>
                                                    <span className="truncate">{sub.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'
                                } py-2 rounded-xl text-xs font-medium transition-all gap-2.5 ${active
                                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                    );
                })}

                {/* ── Store Manager Hierarchical Stores Section ────────────────── */}
                {role === 'storemanager' && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                        {!isCollapsed && (
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                                Stores
                            </p>
                        )}
                        {storeTypes.map((store) => {
                            const isExpanded = expandedStores[store.slug];
                            const isStoreActive = location.pathname.includes(`/store/${store.slug}`);

                            return (
                                <div key={store.slug} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            if (isCollapsed && toggleCollapse) toggleCollapse();
                                            toggleStoreExpand(store.slug);
                                        }}
                                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                                            } py-2 rounded-xl text-xs font-medium transition-all ${isStoreActive
                                                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-base">{store.icon}</span>
                                            {!isCollapsed && <span className="truncate">{store.name}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <IconChevronRight rotated={isExpanded} className="w-3.5 h-3.5" />
                                        )}
                                    </button>

                                    {isExpanded && !isCollapsed && (
                                        <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 my-1">
                                            {[
                                                { name: 'Dashboard', subPath: 'dashboard', icon: '📊' },
                                                { name: 'POS', subPath: 'pos', icon: '💻' },
                                                { name: 'Inventory', subPath: 'inventory', icon: '📦' },
                                                { name: 'Reports', subPath: 'reports', icon: '📈' },
                                                { name: 'Transactions', subPath: 'transactions', icon: '💳' },
                                            ].map((sub) => {
                                                const fullPath = `/store/${store.slug}/${sub.subPath}`;
                                                const subActive = isActive(fullPath);
                                                return (
                                                    <Link
                                                        key={sub.subPath}
                                                        to={fullPath}
                                                        onClick={closeMobileMenu}
                                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${subActive
                                                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                            }`}
                                                    >
                                                        <span className="text-xs">{sub.icon}</span>
                                                        <span className="truncate">{sub.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Fixed Footer / Logout Button ───────────────────────────────── */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-900 flex-shrink-0">
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'
                        } py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all gap-2.5`}
                >
                    <IconLogout className="w-4 h-4 text-red-400" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Mobile Drawer Overlay */}
            <div
                className={`fixed inset-0 z-[100] md:hidden flex transition-all duration-300 ${
                    isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0 delay-200'
                }`}
            >
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
                        isMobileMenuOpen ? 'opacity-100 ease-out' : 'opacity-0 ease-in'
                    }`}
                    onClick={closeMobileMenu}
                />

                {/* Drawer Content */}
                <div
                    className={`relative z-[101] h-full max-w-[260px] w-full transform transition-transform duration-300 ${
                        isMobileMenuOpen
                            ? 'translate-x-0 ease-out'
                            : '-translate-x-full ease-in'
                    }`}
                >
                    {sidebarContent}
                </div>
            </div>

            {/* Desktop / Inline Sidebar (Fixed left position) */}
            <div className="hidden md:flex h-screen fixed top-0 left-0 flex-shrink-0 z-40">
                {sidebarContent}
            </div>

            {/* ── Logout Confirmation Modal ─────────────────────────────────── */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-scaleUp">
                        {/* Warning Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto">
                            <IconLogoutModal />
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1.5">
                            <h3 className="text-lg font-bold text-white">Confirm Logout</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Are you sure you want to log out from <strong className="text-slate-200">{schoolName}</strong>? You will need to sign in again to access your portal.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
