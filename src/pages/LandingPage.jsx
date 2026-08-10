import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Bus, CircleDollarSign, GraduationCap,
    Package, ShieldCheck, ChevronRight, Star, CheckCircle2,
    Users, BookOpen, Award, Zap, Globe, Heart,
    Phone, Mail, MapPin, ArrowRight, Play, X,
    Bell, Calendar, ChevronLeft, Quote, Menu, ChevronDown,
    Pencil, Book, Calculator, Music, Palette
} from 'lucide-react';


/* ─── Animated Counter ─────────────────────────────────── */
const Counter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const startTime = Date.now();
                const tick = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(eased * end));
                    if (progress < 1) requestAnimationFrame(tick);
                    else setCount(end);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Scroll Reveal Hook ───────────────────────────────── */
const useScrollReveal = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); observer.disconnect(); }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, visible];
};

const RevealSection = ({ children, delay = 0, className = '' }) => {
    const [ref, visible] = useScrollReveal();
    return (
        <div ref={ref} className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
            }}>
            {children}
        </div>
    );
};

/* ─── Main Component ───────────────────────────────────── */
const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [videoOpen, setVideoOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    const goToLogin = () => {
        localStorage.clear();
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        if (token && userRole) {
            const roleRedirects = {
                student: '/student/dashboard', teacher: '/teacher/dashboard',
                accountant: '/accounts/dashboard', admin: '/admin/dashboard',
                admission: '/admission/dashboard', librarian: '/library/dashboard',
                storemanager: '/store/dashboard', security: '/security/dashboard',
                driver: '/transport/my-travel', nonteachingstaff: '/nonTeachingStaff/dashboard'
            };
            navigate(roleRedirects[userRole] || '/');
        }
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [navigate]);

    useEffect(() => {
        const timer = setInterval(() =>
            setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
        return () => clearInterval(timer);
    }, []);

    const modules = [
        { title: "Admin Control", desc: "Centralized management for users, academic settings, and school-wide configurations.", icon: <LayoutDashboard size={26} />, color: "from-blue-500 to-blue-600", light: "bg-blue-50 text-blue-600" },
        { title: "Smart Transport", desc: "Real-time vehicle tracking, driver attendance, and automated student route assignments.", icon: <Bus size={26} />, color: "from-orange-500 to-orange-600", light: "bg-orange-50 text-orange-600" },
        { title: "Finance & Fees", desc: "Comprehensive fee collection, expense tracking, and automated payroll management.", icon: <CircleDollarSign size={26} />, color: "from-emerald-500 to-emerald-600", light: "bg-emerald-50 text-emerald-600" },
        { title: "Academic Hub", desc: "Manage syllabuses, timetables, examinations, and digital marksheets with ease.", icon: <GraduationCap size={26} />, color: "from-indigo-500 to-indigo-600", light: "bg-indigo-50 text-indigo-600" },
        { title: "Smart Inventory", desc: "Multi-store management (Sports, Library, Food) with requisition and POS systems.", icon: <Package size={26} />, color: "from-amber-500 to-amber-600", light: "bg-amber-50 text-amber-600" },
        { title: "Campus Security", desc: "Visitor logging, appointment management, and geofenced attendance for staff.", icon: <ShieldCheck size={26} />, color: "from-rose-500 to-rose-600", light: "bg-rose-50 text-rose-600" }
    ];

    const testimonials = [
        { name: "Priya Sharma", role: "Parent of Class X Student", text: "The fee payment system and real-time transport tracking has made school life so much easier for our family. I always know where my child is!", rating: 5, avatar: "PS", color: "bg-purple-100 text-purple-700" },
        { name: "Rajesh Kumar", role: "Principal, DPS Kolkata", text: "SchoolERP transformed our entire administration. What took days now takes minutes. Our teachers can finally focus on teaching, not paperwork.", rating: 5, avatar: "RK", color: "bg-emerald-100 text-emerald-700" },
        { name: "Ananya Bose", role: "Class XII Student", text: "I can check my attendance, marks, and timetable anytime from my phone. The student portal is so easy to use!", rating: 5, avatar: "AB", color: "bg-blue-100 text-blue-700" },
        { name: "Mrs. Meena Gupta", role: "Head of Accounts, SVM School", text: "Managing fees for 3000+ students was a nightmare before. Now everything is automated with clear reports. Truly a game-changer.", rating: 5, avatar: "MG", color: "bg-rose-100 text-rose-700" }
    ];

    const galleryImages = [
        { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80", label: "Modern Classrooms" },
        { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80", label: "Student Activities" },
        { url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80", label: "Expert Teachers" },
        { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80", label: "Campus Life" },
        { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80", label: "Library & Resources" },
        { url: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80", label: "Science Labs" }
    ];

    const news = [
        { date: "May 2, 2025", tag: "Announcement", title: "Annual Sports Day Registration Now Open", color: "bg-emerald-100 text-emerald-700" },
        { date: "Apr 28, 2025", tag: "Exam Update", title: "Class X Board Results Declared — 98% Pass Rate!", color: "bg-blue-100 text-blue-700" },
        { date: "Apr 20, 2025", tag: "Event", title: "Science Fair 2025 — Top 10 Projects Shortlisted", color: "bg-amber-100 text-amber-700" },
        { date: "Apr 15, 2025", tag: "Holiday", title: "School Closed on May 5th for Local Civic Elections", color: "bg-rose-100 text-rose-700" }
    ];

    const tabs = [
        { label: "Students", icon: <Users size={16} />, img: "/girl_coloring.png", title: "Empowering Every Student", desc: "Students get personalised dashboards to track attendance, marks, fee status, timetables, and assignments — all in one place. Available on web and mobile." },
        { label: "Teachers", icon: <BookOpen size={16} />, img: "/expert_teacher.png", title: "Tools Built for Teachers", desc: "From smart attendance to digital marksheets and lesson planners, we give teachers technology that reduces admin load and amplifies their impact in the classroom." },
        { label: "Parents", icon: <Heart size={16} />, img: "/parents.png", title: "Stay Connected, Stay Confident", desc: "Real-time bus tracking, instant fee notifications, exam results, and direct messaging with teachers — parents stay fully informed at all times." },
        { label: "Admin", icon: <Award size={16} />, img: "/admin_dashboard.png", title: "Command the Entire School", desc: "One unified control panel to manage thousands of students, staff payroll, inventory, transport, security, and generate comprehensive analytics reports." }
    ];


    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">

            {/* ── NAVBAR ─────────────────────────────────── */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white text-xl shadow-md">🏫</div>
                        <div>
                            <p className="font-black text-lg text-emerald-600 leading-none">School<span className="text-emerald-600">ERP</span></p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Ultimate System</p>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        {/* Navigation items removed as requested */}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button onClick={goToLogin}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-100 active:scale-95 flex items-center gap-2">
                            Login <ArrowRight size={15} />
                        </button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}>
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
                        {/* Mobile menu items removed as requested */}
                        <button onClick={goToLogin}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-2">
                            Portal Login
                        </button>
                    </div>
                )}
            </header>
            {/* ── HERO ───────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0f1e]">

                {/* ── Deep gradient base (always visible, no image dependency) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#050d1f] via-[#0d1f3c] to-[#071a14]" />

                {/* ── Radial glow blobs */}
                <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px]" />

                {/* ── Subtle grid lines overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* ── Floating Interactive Icons (Premium Aesthetics) ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Floating Book */}
                    <div className="absolute top-[18%] left-[8%] animate-float-1 hidden md:flex items-center justify-center p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-emerald-500/10">
                        <Book className="w-8 h-8 text-emerald-400 opacity-60" />
                    </div>

                    {/* Floating Pencil */}
                    <div className="absolute top-[48%] left-[4%] animate-float-2 hidden md:flex items-center justify-center p-3.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-blue-500/10">
                        <Pencil className="w-6 h-6 text-blue-400 opacity-60" />
                    </div>

                    {/* Floating Calculator */}
                    <div className="absolute bottom-[22%] left-[10%] animate-float-3 hidden lg:flex items-center justify-center p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-purple-500/10">
                        <Calculator className="w-7 h-7 text-purple-400 opacity-60" />
                    </div>

                    {/* Floating Graduation Cap */}
                    <div className="absolute top-[12%] right-[15%] animate-float-4 hidden md:flex items-center justify-center p-4.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-teal-500/10">
                        <GraduationCap className="w-9 h-9 text-teal-400 opacity-60" />
                    </div>

                    {/* Floating Music note */}
                    <div className="absolute top-[52%] right-[10%] animate-float-1 hidden lg:flex items-center justify-center p-3.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-pink-500/10">
                        <Music className="w-6 h-6 text-pink-400 opacity-60" />
                    </div>

                    {/* Floating Palette */}
                    <div className="absolute bottom-[18%] right-[22%] animate-float-2 hidden md:flex items-center justify-center p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-amber-500/10">
                        <Palette className="w-7 h-7 text-amber-400 opacity-60" />
                    </div>

                    {/* Floating BookOpen */}
                    <div className="absolute top-[35%] right-[45%] animate-float-3 hidden lg:flex items-center justify-center p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl shadow-emerald-500/10">
                        <BookOpen className="w-8 h-8 text-emerald-400 opacity-60" />
                    </div>
                </div>


                {/* ── Content ── */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20 w-full">
                    <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-12 xl:gap-20 items-center">

                        {/* ── LEFT: Copy ── */}
                        <div>


                            {/* Headline */}
                            <h1 className="text-[2.8rem] md:text-[4rem] xl:text-[5rem] font-black text-white mb-6 leading-[1.0] tracking-tight">
                                The Future of<br />
                                <span className="relative inline-block">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                                        School Management
                                    </span>
                                    {/* underline accent */}
                                    <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 400 6" preserveAspectRatio="none">
                                        <path d="M0 5 Q200 0 400 5" stroke="url(#ug)" strokeWidth="2.5" fill="none" />
                                        <defs>
                                            <linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#34d399" />
                                                <stop offset="100%" stopColor="#2dd4bf" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span><br />
                                <span className="text-white">Is Here</span>
                            </h1>

                            {/* Sub */}
                            <p className="text-slate-400 text-base md:text-lg max-w-xl mb-10 leading-relaxed font-medium">
                                A complete <span className="text-white font-semibold">360° ERP ecosystem</span> — from smart bus tracking to AI-powered attendance and real-time analytics. Built for Indian schools.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4 mb-10">
                                <button
                                    onClick={goToLogin}
                                    className="group relative bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-base transition-all shadow-2xl shadow-emerald-900/50 active:scale-95 flex items-center gap-2.5 overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                                    <span className="relative">Login</span>
                                    <ArrowRight size={17} className="relative group-hover:translate-x-1 transition-transform" />
                                </button>


                            </div>

                            {/* Trust row */}
                            <div className="flex flex-wrap items-center gap-2 md:gap-0 md:divide-x md:divide-white/10">
                                {[
                                    { icon: '✓', label: 'Free Setup & Onboarding' },
                                    { icon: '✓', label: '24/7 Dedicated Support' },
                                    { icon: '✓', label: 'SSL + Data Encrypted' },
                                ].map((t, i) => (
                                    <div key={i} className="flex items-center gap-2 text-slate-400 text-sm font-semibold px-0 md:px-5 first:pl-0 last:pr-0">
                                        <span className="text-emerald-400 text-base leading-none">{t.icon}</span>
                                        {t.label}
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* ── RIGHT: Visual Panel ── */}
                        <div className="hidden lg:flex flex-col gap-4">

                            {/* ── Photo collage row */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Large classroom image */}
                                <div className="relative col-span-2 rounded-2xl overflow-hidden h-44 group bg-slate-900/40 border border-white/5">
                                    <img
                                        src="/smart_classroom.png"
                                        alt="Students in classroom"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Smart Classrooms</span>
                                    </div>
                                </div>

                                {/* Teacher image */}
                                <div className="relative rounded-2xl overflow-hidden h-32 group bg-slate-900/40 border border-white/5">
                                    <img
                                        src="/expert_teacher.png"
                                        alt="Teacher"
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/70 via-transparent to-transparent" />
                                    <span className="absolute bottom-2 left-2 text-white text-[10px] font-black uppercase tracking-wider">Expert Faculty</span>
                                </div>

                                {/* Students image */}
                                <div className="relative rounded-2xl overflow-hidden h-32 group bg-slate-900/40 border border-white/5">
                                    <img
                                        src="/students_life.png"
                                        alt="Students"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/70 via-transparent to-transparent" />
                                    <span className="absolute bottom-2 left-2 text-white text-[10px] font-black uppercase tracking-wider">Student Life</span>
                                </div>

                            </div>



                            {/* ── Bottom floating chips row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: <Bus size={14} />, label: 'GPS Tracking', sub: '24 buses live', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                                    { icon: <Bell size={14} />, label: 'WhatsApp', sub: 'Alerts active', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                                    { icon: <ShieldCheck size={14} />, label: 'Face ID', sub: 'AI Attendance', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                                ].map((c, i) => (
                                    <div key={i} className={`border ${c.color} rounded-xl p-3 flex flex-col gap-1`}>
                                        <div className={c.color.split(' ')[0]}>{c.icon}</div>
                                        <p className="text-white text-[10px] font-black leading-tight">{c.label}</p>
                                        <p className="text-slate-500 text-[9px] font-semibold">{c.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
                    <ChevronDown size={26} />
                </div>
            </section>
            {/* ── MARQUEE ────────────────────────────────── */}
            <div className="bg-emerald-600 py-3 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...Array(3)].map((_, i) => (
                        <span key={i} className="text-white font-bold text-sm uppercase tracking-widest px-8">
                            ✦ Attendance Management &nbsp;✦ Smart Fee Collection &nbsp;✦ Bus GPS Tracking &nbsp;✦ Face Recognition &nbsp;✦ Digital Marksheets &nbsp;✦ WhatsApp Alerts &nbsp;✦ Multi-Role Portals &nbsp;✦ AI Analytics &nbsp;
                        </span>
                    ))}
                </div>
            </div>

            {/* ── WHO WE SERVE TABS ──────────────────────── */}
            <section id="features" className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <RevealSection className="text-center mb-20">
                        <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">Built for Everyone</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4 tracking-tight">One Platform, Every Role</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Whether you're a student, teacher, parent, or administrator — SchoolERP provides a dedicated, premium tailored portal experience.</p>
                    </RevealSection>

                    {/* Separate Sequential Role Sections */}
                    <div className="flex flex-col gap-24 md:gap-32">
                        {tabs.map((tab, i) => (
                            <RevealSection key={i} className="group">
                                <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
                                    {/* Image Block */}
                                    <div className={`relative h-80 sm:h-96 lg:h-[420px] rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-2xl shadow-slate-200/50 group-hover:shadow-emerald-900/10 transition-all duration-500 ${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                                        <img src={tab.img} alt={tab.label}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                                    </div>

                                    {/* Text Copy Block */}
                                    <div className="flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest mb-6 w-fit border border-emerald-100 shadow-sm shadow-emerald-100/30">
                                            {tab.icon} For {tab.label}
                                        </div>
                                        <h3 className="text-3xl md:text-4.5xl font-black text-slate-900 mb-5 leading-tight tracking-tight group-hover:text-emerald-600 transition-colors">
                                            {tab.title}
                                        </h3>
                                        <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium mb-8">
                                            {tab.desc}
                                        </p>
                                        <button onClick={goToLogin}
                                            className="self-start relative bg-slate-900 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/30 text-white px-7 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-2.5 active:scale-95 overflow-hidden">
                                            <span>Explore {tab.label} Portal</span>
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>


            {/* ── GALLERY ────────────────────────────────── */}
            <section id="gallery" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <RevealSection className="text-center mb-14">
                        <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">Campus Life</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4 tracking-tight">Where Learning Comes Alive</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Modern facilities, expert educators, and a vibrant community — all managed through one intelligent platform.</p>
                    </RevealSection>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryImages.map((img, i) => (
                            <RevealSection key={i} delay={i * 80}
                                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i === 0 ? 'row-span-2' : ''}`}
                                style={{ height: i === 0 ? '100%' : '220px' }}>
                                <div className={`relative overflow-hidden rounded-2xl ${i === 0 ? 'h-full min-h-[456px]' : 'h-[220px]'}`}>
                                    <img src={img.url} alt={img.label}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="text-white font-black text-sm">{img.label}</span>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MODULES ────────────────────────────────── */}
            <section id="solutions" className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <RevealSection className="text-center mb-16">
                        <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">Core Modules</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4 tracking-tight">Everything in One System</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Six powerful modules working in sync to automate every aspect of school management.</p>
                    </RevealSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((m, idx) => (
                            <RevealSection key={idx} delay={idx * 60}>
                                <div className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-transparent hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                    onClick={() => navigate('/login')}>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {m.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{m.title}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{m.desc}</p>
                                    <div className="flex items-center text-emerald-600 font-black text-xs uppercase tracking-widest border-t border-slate-100 pt-5 group-hover:gap-3 gap-2 transition-all">
                                        Explore Module <ChevronRight size={14} />
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TEACHER HIGHLIGHT ──────────────────────── */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <RevealSection>
                        <div className="relative">
                            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&q=80"
                                alt="Teacher in classroom" className="rounded-3xl w-full object-cover shadow-2xl shadow-slate-200 aspect-[4/3]" loading="lazy" />
                            {/* Floating badge */}
                            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <GraduationCap size={22} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm">Smart Marksheets</p>
                                    <p className="text-emerald-600 font-bold text-xs">Auto-generated in seconds</p>
                                </div>
                            </div>

                        </div>
                    </RevealSection>

                    <RevealSection delay={200}>
                        <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">For Educators</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-6 tracking-tight leading-tight">Give Teachers More Time to <span className="text-emerald-600">Teach</span></h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8 font-medium">Our platform eliminates 70% of administrative burden — attendance is automated, marks are digital, timetables are smart. Teachers focus on what matters: students.</p>

                        <div className="space-y-5">
                            {[
                                { icon: <Zap size={18} />, title: "One-Click Attendance", desc: "Face recognition or app-based attendance in under 30 seconds for entire class." },
                                { icon: <Globe size={18} />, title: "Digital Report Cards", desc: "Generate and share marksheets with parents via WhatsApp automatically." },
                                { icon: <Bell size={18} />, title: "Smart Notifications", desc: "Automated alerts to parents for low attendance, poor marks, and fee dues." }
                            ].map((f, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">{f.icon}</div>
                                    <div>
                                        <p className="font-black text-slate-900 mb-1">{f.title}</p>
                                        <p className="text-slate-500 text-sm font-medium">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── STUDENT HIGHLIGHT ──────────────────────── */}
            <section className="py-24 px-6 bg-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <RevealSection delay={200} className="order-2 lg:order-1">
                        <span className="text-blue-600 font-black text-sm uppercase tracking-widest">For Students</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-6 tracking-tight leading-tight">Students Learn Smarter with <span className="text-blue-600">Digital Tools</span></h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8 font-medium">From accessing timetables and homework to checking exam results and library books — students have everything at their fingertips.</p>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { num: '98%', label: 'Attendance Accuracy' },
                                { num: '3x', label: 'Faster Result Access' },
                                { num: '0 Paper', label: 'Digital ID Cards' },
                                { num: 'Live', label: 'Bus Tracking' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200">
                                    <p className="text-2xl font-black text-blue-600 mb-1">{s.num}</p>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </RevealSection>

                    <RevealSection className="order-1 lg:order-2">
                        <div className="relative">
                            <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80"
                                alt="Students studying" className="rounded-3xl w-full object-cover shadow-2xl shadow-slate-200 aspect-[4/3]" loading="lazy" />
                            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Users size={22} className="text-blue-600" />
                                </div>

                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── STATS BAR ──────────────────────────────── */}
            <section className="bg-slate-900 py-20 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
                    {[
                        { end: 50, suf: '+', label: 'Schools Using SchoolERP' },
                        { end: 25000, suf: '+', label: 'Students Managed Daily' },
                        { end: 1200, suf: '+', label: 'Teachers on Platform' },
                        { end: 5000000, suf: '+', label: 'Transactions Processed' }
                    ].map((s, i) => (
                        <RevealSection key={i} delay={i * 100}>
                            <p className="text-4xl md:text-5xl font-black text-emerald-400 mb-3 tracking-tighter">
                                <Counter end={s.end} suffix={s.suf} />
                            </p>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed px-2">{s.label}</p>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ── TESTIMONIALS ───────────────────────────── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <RevealSection className="text-center mb-16">
                        <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4 tracking-tight">Trusted by the School Community</h2>
                    </RevealSection>

                    {/* Featured Testimonial */}
                    <div className="relative bg-slate-50 rounded-3xl p-10 md:p-14 border border-slate-200 mb-6 overflow-hidden">
                        <Quote size={80} className="absolute top-6 right-8 text-slate-100" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-14 h-14 rounded-2xl ${testimonials[activeTestimonial].color} flex items-center justify-center font-black text-lg`}>
                                {testimonials[activeTestimonial].avatar}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-lg">{testimonials[activeTestimonial].name}</p>
                                <p className="text-slate-500 text-sm font-medium">{testimonials[activeTestimonial].role}</p>
                                <div className="flex gap-1 mt-1">
                                    {[...Array(5)].map((_, s) => <Star key={s} size={13} className="text-amber-400" fill="currentColor" />)}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-700 text-lg md:text-xl leading-relaxed font-semibold max-w-2xl">
                            "{testimonials[activeTestimonial].text}"
                        </p>
                    </div>

                    {/* Dots + Nav */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {testimonials.map((_, i) => (
                                <button key={i} onClick={() => setActiveTestimonial(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-emerald-600 w-8' : 'bg-slate-300 w-2'}`} />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTestimonial(p => (p - 1 + testimonials.length) % testimonials.length)}
                                className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => setActiveTestimonial(p => (p + 1) % testimonials.length)}
                                className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>



            {/* ── CTA BANNER ─────────────────────────────── */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80"
                        alt="School" className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-emerald-900/90"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                    <RevealSection>
                        <span className="inline-block bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">Start Today</span>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Ready to Transform Your School?</h2>
                        <p className="text-emerald-200 text-lg mb-10 font-medium max-w-2xl mx-auto leading-relaxed">Join 50+ schools already using SchoolERP to save time, reduce errors, and deliver a better experience for students and parents.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => navigate('/login')}
                                className="bg-white text-emerald-900 px-10 py-4 rounded-2xl font-black text-base hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
                                Get Started Free
                            </button>
                            <a href="#contact"
                                className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">
                                <Phone size={16} /> Talk to Sales
                            </a>
                        </div>
                    </RevealSection>
                </div>
            </section>



            {/* ── FOOTER ─────────────────────────────────── */}
            <footer className="bg-slate-900 text-white pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-slate-800">
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-xl">🏫</div>
                                <p className="font-black text-xl">School<span className="text-emerald-400">ERP</span></p>
                            </div>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">A complete school management ecosystem built for modern educational institutions across India.</p>
                            <div className="flex gap-3">
                                {['in', 'tw', 'fb', 'yt'].map(s => (
                                    <div key={s} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center cursor-pointer transition-colors text-xs font-black text-slate-400 hover:text-white uppercase">{s}</div>
                                ))}
                            </div>
                        </div>

                        {[
                            { head: 'Modules', links: [
                                { name: 'Transport Tracking', href: '#' },
                                { name: 'Academic Portal', href: '#' },
                                { name: 'Fee Management', href: '#' },
                                { name: 'Store / POS', href: '#' },
                                { name: 'Campus Security', href: '#' },
                                { name: 'Library System', href: '#' }
                            ]},
                            { head: 'Company', links: [
                                { name: 'About LearningHub', href: '#' },
                                { name: 'Careers', href: '#' },
                                { name: 'Blog', href: '#' },
                                { name: 'Privacy Policy', href: '/privacy-policy' },
                                { name: 'Terms of Service', href: '#' }
                            ]},
                            { head: 'Support', links: [
                                { name: 'Documentation', href: '#' },
                                { name: 'Help Center', href: '#' },
                                { name: 'Training Videos', href: '#' },
                                { name: 'System Status', href: '#' },
                                { name: 'Contact Support', href: '#' },
                                { name: 'Delete Account', href: '/delete-account' }
                            ]}
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-5">{col.head}</h4>
                                <ul className="space-y-3">
                                    {col.links.map(l => (
                                        <li key={l.name}>
                                            <a href={l.href} onClick={(e) => {
                                                if (l.href.startsWith('/')) {
                                                    e.preventDefault();
                                                    navigate(l.href);
                                                }
                                            }} className="text-slate-500 hover:text-emerald-400 text-sm font-medium transition-colors">{l.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
                            <p>© 2025 SchoolERP. All rights reserved.</p>
                            <a href="/privacy-policy" onClick={(e) => {
                                e.preventDefault();
                                navigate('/privacy-policy');
                            }} className="text-slate-400 hover:text-emerald-400 hover:underline transition-colors cursor-pointer">
                                Privacy Policy
                            </a>
                        </div>
                        <p>Developed by <span className="text-emerald-400">LearningHub Software Solutions</span>, Kolkata</p>
                    </div>
                </div>
            </footer>

            {/* ── VIDEO MODAL ────────────────────────────── */}
            {videoOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setVideoOpen(false)}>
                    <div className="bg-slate-900 rounded-3xl overflow-hidden w-full max-w-3xl shadow-2xl border border-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <p className="font-black text-white">SchoolERP Platform Demo</p>
                            <button onClick={() => setVideoOpen(false)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <X size={16} className="text-white" />
                            </button>
                        </div>
                        <div className="aspect-video bg-slate-800 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-emerald-500 transition-colors">
                                    <Play size={30} className="text-white ml-1" fill="currentColor" />
                                </div>
                                <p className="text-slate-400 font-semibold">Demo video coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

             {/* ── MARQUEE & FLOATING KEYFRAMES ───────────────────────── */}
            <style>{`
                @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }
                .animate-marquee { animation: marquee 30s linear infinite; }

                @keyframes float-1 {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-24px) rotate(8deg); }
                }
                @keyframes float-2 {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-16px) rotate(-10deg); }
                }
                @keyframes float-3 {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(12deg); }
                }
                @keyframes float-4 {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(-6deg); }
                }

                .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
                .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
                .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
            `}</style>

        </div>
    );
};

export default LandingPage;