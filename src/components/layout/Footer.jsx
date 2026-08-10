import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-50/80 backdrop-blur-xs border-t border-slate-200/80 py-3 px-4 mt-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 font-medium">
                <p className="text-center sm:text-left">
                    &copy; {new Date().getFullYear()} School ERP System. All rights reserved.
                </p>
                <p className="text-center sm:text-right flex items-center justify-center gap-1">
                    Developed by <span className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors cursor-pointer">LearningHub</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
