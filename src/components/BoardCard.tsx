import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BoardCardProps {
  id: number;
  title: string;
  updatedAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  id,
  title,
  updatedAt,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={() => navigate(`/board/${id}`)}
      className="board-card"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="board-title">{title}</h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="board-menu-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="board-menu">
              <button
                className="board-menu-item"
                onClick={(e) => handleMenuItemClick(e, onEdit || (() => { }))}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Edit
              </button>
              <button
                className="board-menu-item board-menu-item-delete"
                onClick={(e) => handleMenuItemClick(e, onDelete || (() => { }))}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="board-updated">
        Updated {updatedAt}
      </div>
    </div>
  );
};

export default BoardCard;
