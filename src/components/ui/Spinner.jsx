import React from 'react';

const Spinner = ({ size = 'md', color = 'indigo' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    const colorClasses = {
        white: 'border-white/30 border-t-white',
        indigo: 'border-indigo-100 border-t-indigo-600',
        emerald: 'border-emerald-100 border-t-emerald-600',
        slate: 'border-slate-200 border-t-slate-600'
    };

    return (
        <div className={`relative inline-flex items-center justify-center`}>
            <div className={`
                ${sizeClasses[size] || sizeClasses.md} 
                ${colorClasses[color] || colorClasses.indigo} 
                rounded-full animate-spin
            `}></div>
        </div>
    );
};

export default Spinner;
