import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

          <div className="user-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <span className="navbar-user">{username}</span>
          <button onClick={handleLogout} className="navbar-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
