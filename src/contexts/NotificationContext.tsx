import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    notifications: Notification[];
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
    removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((type: NotificationType, message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showSuccess = useCallback((message: string) => addNotification('success', message), [addNotification]);
    const showError = useCallback((message: string) => addNotification('error', message), [addNotification]);
    const showWarning = useCallback((message: string) => addNotification('warning', message), [addNotification]);
    const showInfo = useCallback((message: string) => addNotification('info', message), [addNotification]);

    const value: NotificationContextType = {
        notifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getStyles = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    iconBg: 'rgba(255, 255, 255, 0.2)'
                };
            case 'error':
                return {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    iconBg: 'rgba(255, 255, 255, 0.2)'
                };
            case 'warning':
                return {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    iconBg: 'rgba(255, 255, 255, 0.2)'
                };
            case 'info':
                return {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    iconBg: 'rgba(255, 255, 255, 0.2)'
                };
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 max-w-[400px]">
            {notifications.map((notification) => {
                const styles = getStyles(notification.type);
                return (
                    <div
                        key={notification.id}
                        className="rounded-xl p-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-start gap-3 animate-[slideIn_0.3s_ease-out] border border-white/20"
                        style={{ background: styles.background }}
                    >
                        <div
                            className="rounded-lg p-2 flex items-center justify-center flex-shrink-0"
                            style={{ background: styles.iconBg }}
                        >
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className="m-0 text-sm font-medium leading-relaxed">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="bg-white/20 border-none rounded-md p-1 cursor-pointer text-white flex items-center justify-center transition-colors hover:bg-white/30"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationContext;
