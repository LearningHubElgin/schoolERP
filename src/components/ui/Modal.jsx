import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 transition-opacity bg-slate-950/70 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className={`relative flex flex-col max-h-[88vh] sm:max-h-[85vh] bg-white rounded-xl sm:rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all w-full my-auto ${sizes[size]}`}>
                {/* Header */}
                <div className="shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto min-h-0 px-3.5 sm:px-6 py-3 sm:py-4 sidebar-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 sm:gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
