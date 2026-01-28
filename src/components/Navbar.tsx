import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { useClickOutside } from '../hooks/useClickOutside';
import '../styles/auth.css';

interface NavbarProps {
  username: string;
  onActivityClick?: () => void;
  activityCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ username, onActivityClick, activityCount = 0 }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Use custom hook for click-outside detection
  useClickOutside(userMenuRef, useCallback(() => setIsUserMenuOpen(false), []), isUserMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleChangePassword = () => {
    setIsUserMenuOpen(false);
    setIsChangePasswordOpen(true);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-logo">
          Trello Clone
        </Link>
        <button className="mobile-menu-button" onClick={toggleMenu}>
          <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <div className={`user-info ${isMenuOpen ? 'show-mobile-menu' : ''}`}>
          {onActivityClick && (
            <button
              onClick={onActivityClick}
              className="activity-button"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Activity</span>
              {activityCount > 0 && (
                <span className="activity-badge">
                  {activityCount}
                </span>
              )}
            </button>
          )}

          {/* User Menu Container */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={toggleUserMenu}
              className={`user-menu-button ${isUserMenuOpen ? 'active' : ''}`}
            >
              <div className="user-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <span className="navbar-user">{username}</span>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`}
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="user-dropdown-menu-container">
                <button
                  onClick={handleChangePassword}
                  className="dropdown-menu-item"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>

                <div className="dropdown-divider" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="dropdown-menu-item"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
