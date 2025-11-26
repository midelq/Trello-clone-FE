import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import BoardCard from '../components/BoardCard';
import CryptoPrices from '../components/CryptoPrices';
import FearGreedIndex from '../components/FearGreedIndex';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

interface Board {
  id: string;
  title: string;
  updatedAt: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [boards, setBoards] = useState<Board[]>([
    {
      id: '1',
      title: 'Website Redesign',
      updatedAt: 'Jan 20, 2024'
    },
    {
      id: '2',
      title: 'Mobile App Development',
      updatedAt: 'Jan 22, 2024'
    }
  ]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const handleCreateBoard = () => {
    setIsCreating(true);
    setIsEditing(false);
    setEditingBoardId(null);
    setNewBoardTitle('');
  };

  const handleEditBoard = (board: Board) => {
    setIsEditing(true);
    setIsCreating(false);
    setEditingBoardId(board.id);
    setNewBoardTitle(board.title);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      setBoards(boards.filter(board => board.id !== boardId));
    }
  };

  const handleSaveBoard = () => {
    if (newBoardTitle.trim()) {
      if (isEditing && editingBoardId) {

        setBoards(boards.map(board =>
          board.id === editingBoardId
            ? {
              ...board,
              title: newBoardTitle.trim(),
              updatedAt: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            }
            : board
        ));
        setIsEditing(false);
        setEditingBoardId(null);
      } else {
        // Створюємо новий борд
        const newBoard: Board = {
          id: Date.now().toString(),
          title: newBoardTitle.trim(),
          updatedAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        };
        setBoards([...boards, newBoard]);
        setIsCreating(false);
      }
      setNewBoardTitle('');
    }
  };

  const handleCancelCreate = () => {
    setNewBoardTitle('');
    setIsCreating(false);
    setIsEditing(false);
    setEditingBoardId(null);
  };

  return (
    <>
      <Navbar username={user.email} />
      <div className="dashboard-container">
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div className="dashboard-header">
              <div className="dashboard-header-content">
                <div>
                  <h1 className="dashboard-title">Your Boards</h1>
                  <p className="dashboard-subtitle">You have {boards.length} boards</p>
                </div>
                <button
                  className="create-board-button mobile-full-width"
                  onClick={handleCreateBoard}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Create Board
                </button>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="boards-grid">
                {(isCreating || isEditing) && (
                  <div className="board-card create-board-form">
                    <input
                      type="text"
                      className="board-title-input"
                      placeholder="Enter board title..."
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveBoard();
                        } else if (e.key === 'Escape') {
                          handleCancelCreate();
                        }
                      }}
                      autoFocus
                    />
                    <div className="board-form-actions">
                      <button
                        className="board-save-button"
                        onClick={handleSaveBoard}
                      >
                        {isEditing ? 'Update' : 'Save'}
                      </button>
                      <button
                        className="board-cancel-button"
                        onClick={handleCancelCreate}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    id={board.id}
                    title={board.title}
                    updatedAt={board.updatedAt}
                    onEdit={() => handleEditBoard(board)}
                    onDelete={() => handleDeleteBoard(board.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="crypto-widget">
              <h2 className="crypto-widget-title">Crypto Market</h2>
              <CryptoPrices />
              <div className="crypto-widget-divider">
                <FearGreedIndex />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
