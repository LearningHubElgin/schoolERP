import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { API_URL } from '../../productionLink/productionLink';

// Default logo from public folder
const DEFAULT_LOGO = '/logo.png';

const Navbar = ({ role, userName, toggleMobileMenu, isCollapsed = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [schoolName, setSchoolName] = useState('School ERP');
    const [schoolLogo, setSchoolLogo] = useState('');
    const [displayUserName, setDisplayUserName] = useState(userName || 'GUEST');
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch school info + user info from localStorage
    useEffect(() => {
        const storedSchoolName = localStorage.getItem('schoolName');
        const storedSchoolLogo = localStorage.getItem('schoolLogo');
        const storedUserName = localStorage.getItem('userName');

        if (storedSchoolName) setSchoolName(storedSchoolName);
        if (storedSchoolLogo) setSchoolLogo(storedSchoolLogo);
        if (!userName && storedUserName) setDisplayUserName(storedUserName);
    }, [userName]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('schoolId');
        localStorage.removeItem('schoolCode');
        localStorage.removeItem('schoolName');
        localStorage.removeItem('schoolLogo');
        localStorage.removeItem('schoolAddress');
        localStorage.removeItem('schoolPhone');
        localStorage.removeItem('schoolEmail');
        navigate('/');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        // Manual overrides for specific paths
        if (path.includes('/admin/register-teachers')) return 'Register Teachers';

        const segments = path.split('/').filter(Boolean);
        if (segments.length < 2) return 'Dashboard';

        const page = segments[segments.length - 1];
        // Convert "some-page-name" to "Some Page Name"
        return page
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getRoleBadgeVariant = () => {
        const variants = {
            student: 'info',
            teacher: 'success',
            accounts: 'warning',
            admin: 'danger',
        };
        return variants[role] || 'default';
    };

    const handleLogoClick = () => {
        const userRole = role || localStorage.getItem('userRole') || '';
        if (!userRole) {
            navigate('/');
            return;
        }
        const rolePath = userRole === 'nonteachingstaff' ? 'nonTeachingStaff' : userRole;
        navigate(`/${rolePath}/dashboard`);
    };

    return (
        <div className={`fixed top-0 right-0 z-30 transition-all duration-300 bg-gradient-to-r from-blue-50/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-lg border-b-2 border-blue-200/50 shadow-md shadow-blue-100/30 px-3 sm:px-4 py-2 flex items-center min-h-[56px] sm:min-h-[60px] ${isCollapsed ? 'left-0 md:left-20 w-full md:w-[calc(100%-5rem)]' : 'left-0 md:left-64 w-full md:w-[calc(100%-16rem)]'
            }`}>
            <div className="flex justify-between items-center w-full">
                {/* Left Section: Logo + Page Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* School Logo */}
                    <div
                        onClick={handleLogoClick}
                        className="flex-shrink-0 relative cursor-pointer hover:scale-105 transition-transform duration-200"
                        title="Go to Dashboard"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg blur opacity-20"></div>
                        <div className="relative w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-lg shadow-blue-200/50 border border-blue-300/40 ring-1 ring-blue-100/50">
                            <img
                                src={schoolLogo ? `${API_URL}${schoolLogo}` : DEFAULT_LOGO}
                                alt="School Logo"
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => { e.target.src = DEFAULT_LOGO; }}
                            />
                        </div>
                    </div>

                    {/* Page Title & Breadcrumb */}
                    <div className="min-w-0 flex-1">
                        <h2
                            onClick={handleLogoClick}
                            className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                            title="Go to Dashboard"
                        >
                            {schoolName}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-indigo-700/80 mt-0.5 font-medium">
                            {location.pathname.split('/').filter(Boolean).map((segment, index, array) => (
                                <React.Fragment key={index}>
                                    <span className="capitalize hover:text-indigo-600 transition-colors cursor-default px-1.5 py-0.5 rounded hover:bg-blue-100/50">
                                        {segment.replace(/-/g, ' ')}
                                    </span>
                                    {index < array.length - 1 && <span className="text-blue-400">›</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Section: User Info + Menu Button */}
                <div className="flex items-center gap-4">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={`hidden sm:flex flex-col items-end bg-white/60 backdrop-blur-sm px-3 py-1 rounded-lg border transition-all duration-200 hover:shadow-md hover:bg-white/80 active:scale-95 ${showDropdown ? 'border-blue-400 ring-1 ring-blue-100 shadow-md' : 'border-blue-200/60 shadow-sm'}`}
                        >
                            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                {displayUserName}
                                <svg className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </p>
                            <div className="flex justify-end mt-0.5">
                                <Badge variant={getRoleBadgeVariant()} size="sm" className="shadow-sm">
                                    {role?.toUpperCase() || 'USER'}
                                </Badge>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-blue-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>



                    {/* Hamburger Menu Button (Mobile Only) - Moved to Right */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden text-indigo-600 hover:text-indigo-800 transition-all p-1.5 rounded-lg hover:bg-white/60 border border-transparent hover:border-blue-200 shadow-sm hover:shadow-md"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
