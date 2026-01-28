import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Types for confirmation dialog
interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// Hook to use confirmation dialog
export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}

// Provider component
export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        resolvePromise?.(true);
        setResolvePromise(null);
        setOptions(null);
    }, [resolvePromise]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        resolvePromise?.(false);
        setResolvePromise(null);
        setOptions(null);
    }, [resolvePromise]);

    // Handle escape key
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleCancel]);

    const getTypeStyles = () => {
        switch (options?.type) {
            case 'danger':
                return {
                    icon: '⚠️',
                    iconBg: 'rgba(239, 68, 68, 0.1)',
                    iconColor: '#ef4444',
                    confirmBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    confirmHoverBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                };
            case 'warning':
                return {
                    icon: '⚡',
                    iconBg: 'rgba(245, 158, 11, 0.1)',
                    iconColor: '#f59e0b',
                    confirmBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    confirmHoverBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                };
            default:
                return {
                    icon: 'ℹ️',
                    iconBg: 'rgba(59, 130, 246, 0.1)',
                    iconColor: '#3b82f6',
                    confirmBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    confirmHoverBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Confirmation Modal */}
            {isOpen && options && (
                <div
                    className="confirm-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-[fadeIn_0.2s_ease-out]"
                    onClick={handleCancel}
                    onKeyDown={handleKeyDown}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-message"
                    tabIndex={-1}
                >
                    <div
                        className="confirm-modal bg-[#1e293b] rounded-2xl p-6 max-w-[400px] w-[90%] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] animate-[slideUp_0.3s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                            style={{ backgroundColor: typeStyles.iconBg }}
                        >
                            {typeStyles.icon}
                        </div>

                        {/* Title */}
                        <h2
                            id="confirm-title"
                            className="text-slate-100 text-xl font-semibold text-center m-0 mb-2"
                        >
                            {options.title}
                        </h2>

                        {/* Message */}
                        <p
                            id="confirm-message"
                            className="text-slate-400 text-sm text-center m-0 mb-6 leading-relaxed"
                        >
                            {options.message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3 justify-center">
                            {/* Cancel Button */}
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-3 px-5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium cursor-pointer transition-all hover:bg-white/10 hover:border-white/20"
                            >
                                {options.cancelText || 'Cancel'}
                            </button>

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirm}
                                autoFocus
                                className="flex-1 py-3 px-5 rounded-xl border-none text-white text-sm font-semibold cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                                style={{ background: typeStyles.confirmBg }}
                            >
                                {options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
        </ConfirmContext.Provider>
    );
}
