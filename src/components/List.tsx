import React, { useState, useMemo } from 'react';
import type { ListWithCards as ListType, Card } from '../types';
import ListCard from './ListCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import DropdownMenu, { EditIcon, DeleteIcon, type DropdownMenuItem } from './DropdownMenu';

interface ListProps {
  list: ListType;
  index: number;
  onAddCard: (listId: number, card: { title: string; description: string }) => void;
  onEditCard: (listId: number, card: Card) => void;
  onDeleteCard: (listId: number, cardId: number) => void;
  onEditTitle: (listId: number, newTitle: string) => void;
  onDeleteList: (listId: number) => void;
}

const List: React.FC<ListProps> = ({ list, index, onAddCard, onEditCard, onDeleteCard, onEditTitle, onDeleteList }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(list.id, {
        title: newCardTitle.trim(),
        description: newCardDescription.trim(),
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    }
  };

  // Memoize dropdown menu items
  const menuItems: DropdownMenuItem[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Edit',
      icon: <EditIcon />,
      onClick: () => setIsEditingTitle(true)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: () => onDeleteList(list.id),
      danger: true
    }
  ], [list.id, onDeleteList]);

  return (
    <Draggable draggableId={list.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`bg-white rounded-lg w-80 p-4 flex-shrink-0 relative transition-all duration-200 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-purple-500 scale-105' : 'shadow-md hover:shadow-lg'
            }`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 mr-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={() => {
                    if (editedTitle.trim() && editedTitle !== list.title) {
                      onEditTitle(list.id, editedTitle);
                    }
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editedTitle.trim() && editedTitle !== list.title) {
                        onEditTitle(list.id, editedTitle);
                      }
                      setIsEditingTitle(false);
                    }
                    if (e.key === 'Escape') {
                      setEditedTitle(list.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full px-4 py-2 text-lg font-semibold bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900" data-testid="list-title">
                  {list.title}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-sm">
                {list.cards.length}
              </span>
              {/* Use DropdownMenu component */}
              <DropdownMenu items={menuItems} triggerLabel="List menu" />
            </div>
          </div>

          <Droppable droppableId={list.id.toString()} type="card" isDropDisabled={snapshot.isDragging}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 min-h-[50px] ${snapshot.isDraggingOver ? 'bg-purple-50' : ''}`}
              >
                {list.cards.map((card, index) => (
                  <ListCard
                    key={card.id}
                    card={card}
                    index={index}
                    onEdit={(editedCard) => onEditCard(list.id, editedCard)}
                    onDelete={(cardId) => onDeleteCard(list.id, cardId)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {isAddingCard ? (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full mb-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
              <textarea
                placeholder="Card description"
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                className="w-full mb-3 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddingCard(false)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full flex justify-center">
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full h-8 bg-white rounded-md flex items-center justify-center gap-2"
              >
                <span className="text-purple-500 text-xl">+</span>
                <span className="text-gray-900">Add card</span>
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default List;