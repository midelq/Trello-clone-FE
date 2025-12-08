import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Activity</span>
              {activityCount > 0 && (
                <span style={{
                  padding: '3px 8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  {activityCount}
                </span>
              )}
            </button>
          )}

          {/* User Menu Container */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={toggleUserMenu}
              className="user-menu-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: isUserMenuOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white'
              }}
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
                style={{
                  transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="user-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: '0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '200px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000,
                  animation: 'slideDown 0.2s ease-out'
                }}
              >
                <button
                  onClick={handleChangePassword}
                  className="dropdown-menu-item"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>

                <div style={{
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  margin: '4px 0'
                }} />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="dropdown-menu-item"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                  }}
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
