import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-slate-100 text-slate-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-cyan-100 text-cyan-800',
        pending: 'bg-orange-100 text-orange-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

export default Badge;
