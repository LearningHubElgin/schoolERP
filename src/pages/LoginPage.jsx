import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../productionLink/productionLink';

const LoginPage = () => {
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (token && userRole) {
            const roleRedirects = {
                superadmin: '/superadmin/dashboard',
                student: '/student/dashboard',
                teacher: '/teacher/dashboard',
                accountant: '/accounts/dashboard',
                admin: '/admin/dashboard',
                admission: '/admission/dashboard',
                librarian: '/library/dashboard',
                storemanager: '/store/dashboard',
                security: '/security/dashboard',
                driver: '/transport/my-travel',
                nonteachingstaff: '/nonTeachingStaff/dashboard'
            };
            navigate(roleRedirects[userRole] || '/');
        }
    }, [navigate]);


    const [formData, setFormData] = useState({
        loginId: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Forgot Password State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStep, setForgotStep] = useState('email'); // 'email' or 'confirmation'
    const [userInfo, setUserInfo] = useState(null);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginId: formData.loginId,
                    password: formData.password,
                })
            });

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userId', data.user.id);

                // Store passout status
                if (data.user.isPassedOut) {
                    localStorage.setItem('isPassedOut', 'true');
                    localStorage.setItem('passedOutYear', data.user.passedOutYear || '');
                    localStorage.setItem('passedOutClass', data.user.passedOutClass || '');
                } else {
                    localStorage.setItem('isPassedOut', 'false');
                }

                if (data.school) {
                    localStorage.setItem('schoolId', data.school.id);
                    localStorage.setItem('schoolCode', data.school.code || '');
                    localStorage.setItem('schoolName', data.school.name || 'School ERP');
                    localStorage.setItem('schoolLogo', data.school.logo || '');
                    localStorage.setItem('schoolAddress', data.school.address || '');
                    localStorage.setItem('schoolPhone', data.school.phone || '');
                    localStorage.setItem('schoolEmail', data.school.email || '');
                }

                const roleRedirects = {
                    superadmin: '/superadmin/dashboard',
                    student: '/student/dashboard',
                    teacher: '/teacher/dashboard',
                    accountant: '/accounts/dashboard',
                    admin: '/admin/dashboard',
                    admission: '/admission/dashboard',
                    librarian: '/library/dashboard',
                    storemanager: '/store/dashboard',
                    security: '/security/dashboard',
                    driver: '/transport/my-travel',
                    nonteachingstaff: '/nonTeachingStaff/dashboard'
                };
                navigate(roleRedirects[data.user.role] || '/');
            } else {
                setError(data.message || 'Invalid credentials');
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to connect to server');
            setLoading(false);
        }
    };

    // Forgot Password Handlers
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotSuccess('');

        if (!forgotEmail) {
            setForgotError('Please enter your email address');
            return;
        }

        setForgotLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();

            if (data.success) {
                setUserInfo(data.user);
                setForgotStep('confirmation');
                setForgotSuccess(`A new password has been sent to ${forgotEmail}. Please check your inbox.`);
                // Auto close modal after 5 seconds
                setTimeout(() => {
                    setShowForgotModal(false);
                    resetForgotState();
                }, 5000);
            } else {
                setForgotError(data.message || 'Email not found or unable to send password');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setForgotError('Server error. Please try again later.');
        } finally {
            setForgotLoading(false);
        }
    };

    const resetForgotState = () => {
        setForgotEmail('');
        setForgotStep('email');
        setUserInfo(null);
        setForgotError('');
        setForgotSuccess('');
    };

    const closeModal = () => {
        setShowForgotModal(false);
        resetForgotState();
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col lg:flex-row font-sans selection:bg-teal-500 selection:text-white">
            {/* Left Branding Panel (Desktop & Tablet Hero) */}
            <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 lg:w-1/2 flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-12 text-white">
                {/* Ambient Background Blur Orbs */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-400 opacity-15 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                {/* Top Nav Header */}
                <div className="relative z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                            <span className="text-xl sm:text-2xl">🏫</span>
                        </div>
                        <span className="font-extrabold text-base sm:text-lg tracking-tight text-white drop-shadow-sm">School ERP</span>
                    </div>

                    <button
                        onClick={() => navigate('/landing')}
                        className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white backdrop-blur-md rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold border border-white/20 shadow-sm transition-all group cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Home</span>
                    </button>
                </div>

                {/* Main Hero Content */}
                <div className="relative z-10 my-6 lg:my-auto text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-tight mb-2 sm:mb-4 drop-shadow-md">
                        Empowering Education, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-200">Simplified.</span>
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base text-teal-100/90 leading-relaxed font-medium mb-6 lg:mb-8">
                        All-in-one smart management solution for students, teachers, staff, and school administrators.
                    </p>

                    {/* Feature Cards (Hidden on ultra-small mobile screens, shown on tablet/desktop) */}
                    <div className="hidden sm:grid grid-cols-2 gap-3.5 text-left">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-xl hover:bg-white/15 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center text-lg mb-2">📊</div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Attendance</h3>
                            <p className="text-xs text-teal-100/75 mt-0.5">Real-time tracking & </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-xl hover:bg-white/15 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center text-lg mb-2">💳</div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Fee Management</h3>
                            <p className="text-xs text-teal-100/75 mt-0.5">Streamlined online collections</p>
                        </div>
                    </div>
                </div>

                {/* Footer Credits for Left Panel */}
                <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-teal-200/70 border-t border-white/10 pt-4">
                    <span>© {new Date().getFullYear()} School ERP Portal.</span>
                    <span>Secure SSL Encryption 🔒</span>
                </div>
            </div>

            {/* Right Login Form Container */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-slate-50 dark:bg-slate-900">
                <div className="w-full max-w-md bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 sm:p-8 lg:p-10 transition-all">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 rounded-2xl mb-3 shadow-inner border border-teal-100 dark:border-teal-900/50">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Please sign in with your credentials to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Login ID Input */}
                        <div>
                            <label htmlFor="loginId" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                Login ID
                            </label>
                            <div className="relative rounded-xl shadow-sm group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="loginId"
                                    name="loginId"
                                    type="text"
                                    required
                                    value={formData.loginId}
                                    onChange={handleInputChange}
                                    className="pl-11 block w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                    placeholder="Enter login id"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                                    Password
                                </label>

                            </div>
                            <div className="relative rounded-xl shadow-sm group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pl-11 pr-11 block w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-teal-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>

                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-bold hover:underline transition-all "
                            >
                                Forgot?
                            </button>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3.5 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
                                <svg className="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-lg shadow-teal-700/25 hover:shadow-teal-700/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed transform-none hover:shadow-none' : ''}`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Authenticating...</span>
                                    </span>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span>© {new Date().getFullYear()} School ERP</span>
                        <a href="/privacy-policy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5">
                            {forgotStep === 'email' && (
                                <form onSubmit={handleForgotSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            placeholder="Enter your registered email"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">We'll send a new password to this email.</p>
                                    </div>
                                    {forgotError && (
                                        <div className="bg-red-50 text-red-700 p-2 rounded-lg text-sm">{forgotError}</div>
                                    )}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                        <button type="submit" disabled={forgotLoading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
                                            {forgotLoading ? 'Sending...' : 'Send Reset Password'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {forgotStep === 'confirmation' && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
                                        {forgotSuccess}
                                    </div>
                                    {userInfo && (
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">User Details:</p>
                                            <p className="text-sm text-gray-600">Name: {userInfo.name}</p>
                                            <p className="text-sm text-gray-600">Role: {userInfo.role}</p>
                                        </div>
                                    )}
                                    <button onClick={closeModal} className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;