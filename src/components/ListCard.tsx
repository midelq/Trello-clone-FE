import React, { useState, useMemo } from 'react';
import type { Card } from '../types';
import { Draggable } from '@hello-pangea/dnd';
import { useConfirm } from '../contexts/ConfirmContext';
import DropdownMenu, { EditIcon, DeleteIcon, type DropdownMenuItem } from './DropdownMenu';
import { formatDate } from '../utils/formatDate';

interface ListCardProps {
  card: Card;
  index: number;
  onEdit: (card: Card) => void;
  onDelete: (cardId: number) => void;
}



const ListCard: React.FC<ListCardProps> = React.memo(({ card, index, onEdit, onDelete }) => {
  const { confirm } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Card',
      message: `Are you sure you want to delete "${card.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      onDelete(card.id);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit({
        ...card,
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  };

  // Memoize dropdown menu items
  const menuItems: DropdownMenuItem[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Edit',
      icon: <EditIcon />,
      onClick: handleStartEdit
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      danger: true
    }
  ], [card.id, card.title]);

  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-md p-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm ${snapshot.isDragging ? 'shadow-lg' : ''
            }`}
        >
          <div className="flex justify-between items-start">
            {isEditing ? (
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mb-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter title..."
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Enter description..."
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{card.description}</p>
              </div>
            )}

            {/* Use DropdownMenu component */}
            <DropdownMenu items={menuItems} triggerLabel="Card menu" />
          </div>
          <div className="mt-2 text-xs text-gray-500">{formatDate(card.createdAt)}</div>
        </div>
      )}
    </Draggable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if card data or index changes
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.description === nextProps.card.description &&
    prevProps.index === nextProps.index
  );
});

export default ListCard;
