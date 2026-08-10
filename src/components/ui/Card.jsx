import React from 'react';

const Card = ({
    children,
    title,
    subtitle,
    footer,
    variant = 'default',
    className = '',
    allowOverflow = false,
    onClick,
    style
}) => {
    const variants = {
        default: 'bg-white border border-slate-200 shadow-sm',
        outlined: 'bg-white border-2 border-slate-300',
        elevated: 'bg-white shadow-xl shadow-slate-200/60 border border-slate-100',
        gradient: 'bg-gradient-to-br from-white to-slate-50 border border-white/50 shadow-lg',
    };

    return (
        <div className={`rounded-xl ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300 ${variants[variant]} ${className}`} onClick={onClick} style={style}>
            {(title || subtitle) && (
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-100">
                    {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className={className.includes('p-0') ? '' : 'px-3 sm:px-5 py-3 sm:py-4'}>
                {children}
            </div>
            {footer && (
                <div className="px-4 py-4 md:px-6 md:py-4 bg-slate-50/50 border-t border-slate-100">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
