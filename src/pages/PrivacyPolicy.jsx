import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Custom SVG Icon Components ──────────────────────────────────────────────

const IcoBackArrow = () => (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const IcoShieldCheck = ({ size = 24, color = '#10b981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IcoInfo = ({ size = 24, color = '#2563eb' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IcoGear = ({ size = 24, color = '#d97706' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx={12} cy={12} r={3} />
    </svg>
);

const IcoShare = ({ size = 24, color = '#7c3aed' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742a3 3 0 110 2.516m0-2.516a3 3 0 110 2.516m0-2.516l5.73 3.438m-5.73-1.378l5.73-3.438m-.908 1.097a3 3 0 110-2.516 3 3 0 010 2.516zm0 5.032a3 3 0 110-2.516 3 3 0 010 2.516z" />
    </svg>
);

const IcoClock = ({ size = 24, color = '#db2777' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IcoUserGroup = ({ size = 24, color = '#0891b2' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    const sections = [
        {
            title: "Information Collection",
            subtitle: "What data we gather",
            icon: <IcoInfo size={22} color="#2563eb" />,
            badgeColor: "bg-blue-100",
            textColor: "text-blue-700",
            borderColor: "border-blue-200",
            content: [
                {
                    head: "Personal Identifiable Information (PII)",
                    desc: "We collect personal details including names, unique government identifiers, birthdates, profile images, home addresses, phone numbers, and emergency contact details for student profiles, parent registry, and staff directories."
                },
                {
                    head: "Academic & Performance Records",
                    desc: "This includes classroom schedules, timetables, daily attendance logs, grading marksheets, digital report card templates, and submitted student assignment uploads."
                },
                {
                    head: "Smart Transport & GPS Tracking",
                    desc: "When transport modules are active, we securely access and process real-time school bus location coordinates (GPS tracking) and driver details to keep parents notified of exact arrivals."
                },
                {
                    head: "Financial & Invoicing Data",
                    desc: "Details of school fee collections, pending dues, transaction references, invoices, and staff payslips. All card or net-banking transactions are processed strictly by secure, PCI-compliant third-party gateways. We never save raw payment credentials on our servers."
                }
            ]
        },
        {
            title: "Data Utilization",
            subtitle: "How we use your information",
            icon: <IcoGear size={22} color="#d97706" />,
            badgeColor: "bg-amber-100",
            textColor: "text-amber-700",
            borderColor: "border-amber-200",
            content: [
                {
                    head: "Functional ERP Operations",
                    desc: "To authenticate logins and correctly render personalized dashboards (Student portal, Teacher portal, Admin dashboard, Storekeeper panel, Accountant logs)."
                },
                {
                    head: "Automated Communication & Alerts",
                    desc: "To deliver automated WhatsApp alerts, SMS notifications, fee receipts, and immediate announcements directly to parents, ensuring constant transparency."
                },
                {
                    head: "Security Audits & Geofencing",
                    desc: "To authenticate check-ins, record visitor appointments securely at gates, log system events in the Admin Activity logs, and implement school-gate geofencing."
                }
            ]
        },
        {
            title: "Security & Encryption",
            subtitle: "How we safeguard data",
            icon: <IcoShieldCheck size={22} color="#10b981" />,
            badgeColor: "bg-emerald-100",
            textColor: "text-emerald-700",
            borderColor: "border-emerald-200",
            content: [
                {
                    head: "SSL Transit Protection",
                    desc: "All communication between your device and the SchoolERP servers is guarded by high-grade Secure Sockets Layer (SSL) encryption, preventing intercept interception."
                },
                {
                    head: "Role-Based Access Control (RBAC)",
                    desc: "Strict software isolation ensures parents only see their designated children's grades, teachers only access their assigned classroom lists, and store managers only access store POS balances. Zero cross-tenant data leaks are permitted."
                },
                {
                    head: "Robust Database Architecture",
                    desc: "All files and databases are securely hosted in highly redundant servers with continuous automatic backups, state-of-the-art firewalls, and active DDoS defense filters."
                }
            ]
        },
        {
            title: "Information Disclosure",
            subtitle: "When data is shared",
            icon: <IcoShare size={22} color="#7c3aed" />,
            badgeColor: "bg-purple-100",
            textColor: "text-purple-700",
            borderColor: "border-purple-200",
            content: [
                {
                    head: "Zero Third-Party Advertising",
                    desc: "We strictly do NOT sell, rent, monetize, or trade student, parent, or staff personal records for external marketing or commercial profit."
                },
                {
                    head: "Administrative School Integration",
                    desc: "Your data is accessible inside your specific school's dashboard database strictly to support legitimate management tasks by authorized coordinators."
                },
                {
                    head: "Essential System Service Providers",
                    desc: "We share necessary details (e.g. phone numbers) strictly with trusted, essential third-party integrations, such as official SMS/WhatsApp delivery gateways."
                }
            ]
        },
        {
            title: "Rights & Retentions",
            subtitle: "User choices & options",
            icon: <IcoClock size={22} color="#db2777" />,
            badgeColor: "bg-pink-100",
            textColor: "text-pink-700",
            borderColor: "border-pink-200",
            content: [
                {
                    head: "Access & Modification Rights",
                    desc: "Users have the full right to review, update, or rectify any personal records by submitting an official correction request directly to their school's administrative office."
                },
                {
                    head: "Account Deactivation & Purges",
                    desc: "Upon student graduation, withdrawal, or staff resignation, institutional profiles can be archived or permanently deleted in accordance with the school's historical retention bylaws."
                },
                {
                    head: "Policy Modifications",
                    desc: "We update this policy periodically to align with updated safety laws. We recommend inspecting the 'Effective Date' at the top of this screen regular to stay updated."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 font-sans pb-10">
            {/* Navbar Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-slate-800/80 rounded-xl mr-3 shadow-md hover:bg-slate-700 transition-colors"
                >
                    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-white font-black text-lg m-0">Privacy Policy</h1>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5 m-0">
                        SchoolERP Security Ecosystem
                    </p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto w-full">
                {/* Stunning Hero Section */}
                <div className="relative bg-[#0d1527] py-10 px-6 border-b border-slate-800 overflow-hidden rounded-b-3xl sm:rounded-3xl sm:mt-6">
                    {/* Decorative lights */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl" />
                    <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-emerald-600/10 blur-2xl" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-4 shadow-xl">
                            <IcoShieldCheck size={32} color="#34d399" />
                        </div>

                        <h2 className="text-3xl font-black text-white text-center tracking-tight leading-tight m-0">
                            Your Data Privacy is<br />Our Priority
                        </h2>
                        
                        <p className="text-slate-400 text-sm font-medium text-center max-w-sm mt-3 leading-relaxed">
                            Discover how SchoolERP collects, protects, and handles institutional records for students, parents, and educators.
                        </p>

                        {/* Metadata Tag */}
                        <div className="bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-1.5 mt-6">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Effective Date: May 31, 2026
                            </span>
                        </div>
                    </div>
                </div>

                {/* Interactive Navigation Tabs */}
                <div className="px-4 py-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 px-1 m-0">
                        Select Category
                    </h3>

                    <div className="flex overflow-x-auto gap-3 mb-8 pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {sections.map((sec, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`px-4 py-3 rounded-2xl flex items-center border whitespace-nowrap transition-all ${
                                    activeTab === i 
                                        ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                        : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                                }`}
                            >
                                <div className={`mr-2.5 rounded-lg p-1.5 flex items-center justify-center ${
                                    activeTab === i ? 'bg-white/20' : 'bg-slate-700/40'
                                }`}>
                                    {React.cloneElement(sec.icon, { 
                                        color: activeTab === i ? '#ffffff' : '#94a3b8',
                                        size: 16
                                    })}
                                </div>
                                <span className={`font-black text-xs uppercase tracking-wider ${
                                    activeTab === i ? 'text-white' : 'text-slate-400'
                                }`}>
                                    {sec.title}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Active Section Panel Details */}
                    <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-800/60 shadow-md">
                        {/* Heading */}
                        <div className="flex items-center mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sections[activeTab].badgeColor} mr-4 flex-shrink-0`}>
                                {sections[activeTab].icon}
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xl leading-tight tracking-tight m-0">
                                    {sections[activeTab].title}
                                </h4>
                                <p className="text-slate-500 text-sm font-semibold m-0 mt-0.5">
                                    {sections[activeTab].subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Content Cards */}
                        <div className="space-y-4">
                            {sections[activeTab].content.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 rounded-full bg-emerald-500 flex-shrink-0" />
                                        <h5 className="text-white font-black text-base tracking-wide m-0">
                                            {item.head}
                                        </h5>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed pl-4 m-0">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Trust Badges / Compliance */}
                <div className="px-6 py-8 border-t border-slate-800/60 mx-4 flex flex-col items-center">
                    <h3 className="text-slate-500 text-xs font-black uppercase tracking-wider mb-6 m-0">
                        Compliance & Certifications
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                                <IcoShieldCheck size={24} color="#10b981" />
                            </div>
                            <span className="text-white font-black text-sm text-center">GDPR / COPPA</span>
                            <span className="text-slate-500 text-xs font-bold text-center mt-1">Student Safe Standards</span>
                        </div>

                        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                                <IcoShieldCheck size={24} color="#3b82f6" />
                            </div>
                            <span className="text-white font-black text-sm text-center">SSL Secured</span>
                            <span className="text-slate-500 text-xs font-bold text-center mt-1">256-Bit Data Encryption</span>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mx-4 mt-2 bg-emerald-950/20 border border-emerald-900/30 rounded-3xl p-8 flex flex-col items-center text-center">
                    <h4 className="text-emerald-400 font-black text-lg tracking-wide m-0">
                        Have privacy questions?
                    </h4>
                    <p className="text-slate-400 text-sm font-medium mt-3 max-w-md leading-relaxed m-0">
                        If you have questions regarding role permissions or account controls, please contact our data safety division at:
                    </p>
                    <a href="mailto:privacy@learninghub.in" className="text-emerald-400 font-bold text-base mt-4 hover:underline transition-all">
                        privacy@learninghub.in
                    </a>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
