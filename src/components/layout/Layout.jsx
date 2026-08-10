import React, { useState, useEffect, createContext, useContext, useRef, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

// ─── Refresh Context & Hook ──────────────────────────────────────────────────

export const RefreshContext = createContext({
    registerRefresh: () => { },
    unregisterRefresh: () => { },
});

export const usePageRefresh = (onRefresh) => {
    const { registerRefresh, unregisterRefresh } = useContext(RefreshContext);
    const handlerRef = useRef(onRefresh);

    useEffect(() => {
        handlerRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        const stableHandler = async () => {
            if (handlerRef.current) {
                await handlerRef.current();
            }
        };
        registerRefresh(stableHandler);
        return () => unregisterRefresh();
    }, [registerRefresh, unregisterRefresh]);
};

// ─── Component ────────────────────────────────────────────────────────────────

const Layout = ({ role: propsRole, userName, screenName = '', children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [resolvedRole, setResolvedRole] = useState(propsRole || '');
    const [refreshHandler, setRefreshHandler] = useState(null);

    // ── Resolve role ───────────────────────────────────────────────────────────
    useEffect(() => {
        let role = propsRole || '';

        if (!role) {
            try {
                const stored = localStorage.getItem('userRole');
                role = stored || '';
            } catch (_) { }
        }

        // Drivers use the Transport portal UI
        if (role === 'driver') {
            role = 'transport';
        }

        setResolvedRole(role);
    }, [propsRole]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const registerRefresh = useCallback((fn) => {
        setRefreshHandler(() => fn);
    }, []);

    const unregisterRefresh = useCallback(() => {
        setRefreshHandler(null);
    }, []);

    const refreshContextValue = useMemo(() => ({
        registerRefresh,
        unregisterRefresh
    }), [registerRefresh, unregisterRefresh]);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <RefreshContext.Provider value={refreshContextValue}>
            <div className="min-h-screen w-full bg-gray-50 text-slate-800 antialiased relative overflow-x-hidden">

                {/* ── Sidebar (Fixed left 100vh) ────────────────────────────────────── */}
                <Sidebar
                    role={resolvedRole}
                    isMobileMenuOpen={isMobileMenuOpen}
                    closeMobileMenu={closeMobileMenu}
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(prev => !prev)}
                    screenName={screenName}
                />

                {/* ── Fixed Top Header Navbar (Fixed top: 0) ─────────────────────────── */}
                <Navbar
                    role={resolvedRole}
                    userName={userName}
                    screenName={screenName}
                    toggleMobileMenu={toggleMobileMenu}
                    isCollapsed={isCollapsed}
                />

                {/* ── Main Content Area (Window scrollable with top offset) ─────────── */}
                <main
                    className={`min-h-screen flex flex-col bg-gray-50 pt-14 sm:pt-16 transition-all duration-300 ${isCollapsed ? 'ml-0 md:ml-20 w-full md:w-[calc(100%-5rem)]' : 'ml-0 md:ml-64 w-full md:w-[calc(100%-16rem)]'
                        }`}
                >
                    {/* Page Content ({children} or React Router <Outlet />) */}
                    <div className="flex-1 p-3 sm:p-4 md:p-6">
                        {children || <Outlet />}
                    </div>

                    {/* ── Footer ─────────────────────────────────────────────────── */}
                    <Footer />
                </main>

            </div>
        </RefreshContext.Provider>
    );
};

export default Layout;
