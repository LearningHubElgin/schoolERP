import React from 'react';
import Button from './Button';

const PortalErrorState = ({ type, message, onRefresh, onLogout }) => {
    const isNotFound = type === 'NOT_FOUND';
    const isExpired = type === 'EXPIRED';
    const isLoadError = type === 'LOAD_ERROR';

    const getIcon = () => {
        if (isNotFound) return '🔍';
        if (isExpired) return '🔐';
        if (isLoadError) return '📡';
        return '⚠️';
    };

    const getColor = () => {
        if (isNotFound) return 'bg-amber-100 text-amber-600';
        if (isExpired) return 'bg-rose-100 text-rose-600';
        if (isLoadError) return 'bg-indigo-100 text-indigo-600';
        return 'bg-slate-100 text-slate-600';
    };

    const getTitle = () => {
        if (isNotFound) return 'Account Not Found';
        if (isExpired) return 'Session Expired';
        if (isLoadError) return 'Connection Error';
        return 'Access Restricted';
    };

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl animate-bounce-slow ${getColor()}`}>
                    {getIcon()}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white shadow-lg border-2 ${getColor().split(' ')[0]}`}>
                    {isNotFound ? '❔' : isLoadError ? '🌐' : '⚠️'}
                </div>
            </div>

            {/* Content */}
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                {getTitle()}
            </h2>
            
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 text-lg leading-relaxed">
                {message || (isNotFound 
                    ? "It looks like your account record hasn't been set up yet. Please contact the administrator."
                    : isLoadError 
                    ? "We're having trouble connecting to the server. Please check your internet connection or try again later."
                    : "Your session has timed out or is invalid. Please log in again to continue.")}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
                <Button 
                    variant="primary" 
                    className="flex-1 py-4 text-base font-bold shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    onClick={() => onRefresh ? onRefresh() : window.location.reload()}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Page
                </Button>
                
                <Button 
                    variant="danger" 
                    className="flex-1 py-4 text-base font-bold shadow-xl shadow-rose-200 hover:scale-105 active:scale-95 transition-all bg-rose-500 hover:bg-rose-600 flex items-center justify-center gap-2"
                    onClick={onLogout}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout Now
                </Button>
            </div>

            {/* Support Info */}
            <div className="mt-12 pt-8 border-t border-slate-100 w-full max-w-md">
                <p className="text-sm text-slate-400 font-medium flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    Need help? Contact School Administration
                </p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite;
                }
            `}} />
        </div>
    );
};

export default PortalErrorState;
