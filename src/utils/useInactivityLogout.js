import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to handle automatic logout on user inactivity
 * @param {number} timeout - Inactivity timeout in milliseconds (default: 60000ms = 1 minute)
 */
const useInactivityLogout = (timeout = 60000) => { 
    const timeoutRef = useRef(null);

    // Logout function
    const logout = useCallback(() => {
        console.log('Auto-logout triggered due to inactivity');

        // Clear all auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('user');

        // Redirect to login page using window.location
        window.location.href = '/login?role=student';
    }, []);

    // Reset the inactivity timer
    const resetTimer = useCallback(() => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            logout();
        }, timeout);
    }, [timeout, logout]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // User is not logged in, don't set up the timer
            return;
        }

        // Events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup function
        return () => {
            // Remove event listeners
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });

            // Clear timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resetTimer]);

    return null;
};

export default useInactivityLogout;
