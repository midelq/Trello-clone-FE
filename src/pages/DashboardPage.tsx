import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import BoardCard from '../components/BoardCard';
import CryptoPrices from '../components/CryptoPrices';
import FearGreedIndex from '../components/FearGreedIndex';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api.config';
import type { Board, BoardsResponse, BoardResponse } from '../types/api.types';
import '../styles/auth.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<BoardsResponse>(API_CONFIG.ENDPOINTS.BOARDS.GET_ALL);
      setBoards(data.boards);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch boards';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeleteBoard = async (boardId: number) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await apiClient.delete(API_CONFIG.ENDPOINTS.BOARDS.DELETE(boardId));
        setBoards(boards.filter(board => board.id !== boardId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete board';
        showError(errorMessage);
      }
    }
  };

  const handleSaveBoard = async () => {
    if (newBoardTitle.trim()) {
      try {
        if (isEditing && editingBoardId) {
          const response = await apiClient.put<BoardResponse>(
            API_CONFIG.ENDPOINTS.BOARDS.UPDATE(editingBoardId),
            { title: newBoardTitle.trim() }
          );

          setBoards(boards.map(board =>
            board.id === editingBoardId ? response.board : board
          ));
          setIsEditing(false);
          setEditingBoardId(null);
        } else {
          const response = await apiClient.post<BoardResponse>(
            API_CONFIG.ENDPOINTS.BOARDS.CREATE,
            { title: newBoardTitle.trim() }
          );
          setBoards([...boards, response.board]);
          setIsCreating(false);
        }
        setNewBoardTitle('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save board';
        showError(errorMessage);
      }
    }
  };

  const handleCancelCreate = () => {
    setNewBoardTitle('');
    setIsCreating(false);
    setIsEditing(false);
    setEditingBoardId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

              {isLoading ? (
                <div className="loading-spinner">Loading boards...</div>
              ) : (
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
                      updatedAt={formatDate(board.updatedAt)}
                      onEdit={() => handleEditBoard(board)}
                      onDelete={() => handleDeleteBoard(board.id)}
                    />
                  ))}
                </div>
              )}
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
