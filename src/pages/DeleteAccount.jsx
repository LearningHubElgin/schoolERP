import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

const DeleteAccount = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 font-sans pb-10">
            {/* Navbar Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-slate-800/80 rounded-xl mr-3 shadow-md hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={18} className="text-white" />
                </button>
                <div>
                    <h1 className="text-white font-black text-lg m-0">Account Deletion</h1>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5 m-0">
                        Data Safety Protocol
                    </p>
                </div>
            </div>

            <main className="max-w-3xl mx-auto w-full px-4 pt-8">
                {/* Stunning Hero Section */}
                <div className="relative bg-[#0d1527] py-8 px-6 border border-slate-800 rounded-3xl mb-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-4 shadow-xl">
                            <ShieldCheck size={28} className="text-red-400" />
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                            Delete Account Request
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                            Users can request account deletion by contacting the school administrator. We handle data removal in compliance with privacy regulations.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* How to request */}
                    <div className="bg-slate-800/40 border border-slate-800/60 rounded-3xl p-6 md:p-8">
                        <h2 className="text-xl font-black text-white mb-4">How to request deletion</h2>
                        
                        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 mb-5">
                            <p className="text-sm font-semibold text-slate-400 mb-1">Email your request to:</p>
                            <a href="mailto:support@learninghub.ind.in" className="text-emerald-400 text-lg font-bold hover:underline transition-all">
                                support@learninghub.ind.in
                            </a>
                        </div>
                        
                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest mb-3">Please Include:</p>
                        <ul className="space-y-2">
                            {['Full Name', 'User ID', 'Registered Email'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What data will be deleted */}
                    <div className="bg-slate-800/40 border border-slate-800/60 rounded-3xl p-6 md:p-8">
                        <h2 className="text-xl font-black text-white mb-4">What data will be deleted</h2>
                        <ul className="space-y-3">
                            {['Profile information', 'Login credentials', 'Personal account data'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-slate-400 text-sm font-medium">
                                    <ArrowRight size={16} className="text-red-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What data may be retained */}
                    <div className="bg-slate-800/40 border border-slate-800/60 rounded-3xl p-6 md:p-8">
                        <h2 className="text-xl font-black text-white mb-4">What data may be retained</h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                            Academic records, attendance records, examination records, and financial records may be retained where required by school administration or legal obligations.
                        </p>
                        
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                Processed within 30 days
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeleteAccount;
