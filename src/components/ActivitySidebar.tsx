import React from 'react';
import type { Activity } from '../types';
import { useConfirm } from '../contexts/ConfirmContext';

interface ActivitySidebarProps {
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({ activities, isOpen, onClose }) => {
  const { confirm } = useConfirm();

  const handleClearHistory = async () => {
    const confirmed = await confirm({
      title: 'Clear Activity History',
      message: 'Are you sure you want to clear all activity history? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      type: 'warning'
    });

    if (confirmed) {
      // This would be handled by parent component
      console.log('Clear history confirmed');
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'card_added':
        return '➕';
      case 'card_edited':
        return '✏️';
      case 'card_deleted':
        return '🗑️';
      case 'card_moved':
        return '↔️';
      case 'list_added':
        return '📋';
      case 'list_edited':
        return '';
      case 'list_deleted':
        return '🗑️';
      default:
        return '📌';
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} d ago`;

    return new Date(date).toLocaleDateString('uk-UA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-white/20">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Activity</h2>
          </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto p-6">
            {activities.length === 0 ? (
              <div className="text-center text-white/70 mt-10">
                <div className="p-4 bg-white/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-white">No activity yet</p>
                <p className="text-sm mt-2 text-white/60">Actions with cards and lists will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/10"
                  >
                    <div className="text-2xl flex-shrink-0 filter drop-shadow-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-relaxed font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-white/60 mt-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-black/10">
            <button
              onClick={handleClearHistory}
              className="w-full py-3 px-4 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear history
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivitySidebar;

