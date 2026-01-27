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
                    className="confirm-overlay"
                    onClick={handleCancel}
                    onKeyDown={handleKeyDown}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-message"
                    tabIndex={-1}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div
                        className="confirm-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#1e293b',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: typeStyles.iconBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '24px'
                            }}
                        >
                            {typeStyles.icon}
                        </div>

                        {/* Title */}
                        <h2
                            id="confirm-title"
                            style={{
                                color: '#f1f5f9',
                                fontSize: '20px',
                                fontWeight: 600,
                                textAlign: 'center',
                                margin: '0 0 8px'
                            }}
                        >
                            {options.title}
                        </h2>

                        {/* Message */}
                        <p
                            id="confirm-message"
                            style={{
                                color: '#94a3b8',
                                fontSize: '14px',
                                textAlign: 'center',
                                margin: '0 0 24px',
                                lineHeight: 1.5
                            }}
                        >
                            {options.message}
                        </p>

                        {/* Buttons */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Cancel Button */}
                            <button
                                onClick={handleCancel}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#cbd5e1',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            >
                                {options.cancelText || 'Cancel'}
                            </button>

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirm}
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: typeStyles.confirmBg,
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = typeStyles.confirmHoverBg;
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = typeStyles.confirmBg;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                }}
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
