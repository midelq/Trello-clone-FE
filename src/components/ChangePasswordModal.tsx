import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/change-password-modal.css';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('error');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        try {
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new Error('Please fill in all fields');
            }

            if (newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters long');
            }

            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }

            if (currentPassword === newPassword) {
                throw new Error('New password must be different from current password');
            }

            await changePassword({ currentPassword, newPassword });

            setMessageType('success');
            setMessage('Password changed successfully!');

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                onClose();
                setMessage('');
            }, 2000);

        } catch (error: any) {
            setMessageType('error');
            setMessage(error.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setMessage('');
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />
                    <motion.div
                        className="change-password-modal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Change Password</h2>
                            <button
                                className="modal-close-button"
                                onClick={handleClose}
                                disabled={isLoading}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="change-password-form">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter new password (min 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>

                            {message && (
                                <motion.div
                                    className={`form-message ${messageType === 'success' ? 'form-message-success' : 'form-message-error'}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {message}
                                </motion.div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="modal-button modal-button-secondary"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal-button modal-button-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
