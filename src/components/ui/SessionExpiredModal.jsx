import React, { useState, useEffect, useRef } from 'react';
import { LogOut, ShieldAlert, AlertTriangle } from 'lucide-react';

const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Your session has expired or is invalid.');
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef(null);

  const performAutoLogout = () => {
    // Clear all auth items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('school');
    localStorage.removeItem('role');
    localStorage.clear();

    setIsOpen(false);
    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    // Handler for custom session_expired event
    const handleSessionExpired = (event) => {
      // Auto clear storage immediately
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('school');
      localStorage.removeItem('role');

      if (event.detail?.message) {
        setErrorMessage(event.detail.message);
      }

      setIsOpen(true);
      setCountdown(3);
    };

    // Attach listener
    window.addEventListener('session_expired', handleSessionExpired);

    // Global Fetch Interceptor
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const response = await originalFetch.apply(this, args);
        if (response.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.dispatchEvent(new CustomEvent('session_expired', {
            detail: { message: 'Session expired (401 Unauthorized).' }
          }));
        }
        return response;
      } catch (err) {
        throw err;
      }
    };

    return () => {
      window.removeEventListener('session_expired', handleSessionExpired);
      window.fetch = originalFetch;
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          performAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200 dark:border-red-900/50 transform transition-all duration-300 scale-100">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-5 text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wide">Session Expired</h3>
            <p className="text-xs text-red-100 opacity-90">Auto logging out in {countdown} seconds...</p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-red-100 dark:bg-red-950 h-1.5 overflow-hidden">
          <div 
            className="bg-red-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            You are being logged out automatically. Redirecting to login page in <strong>{countdown}s</strong>...
          </p>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={performAutoLogout}
              className="w-full py-3 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Log Out & Sign In Now ({countdown}s)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SessionExpiredModal;
