import React, { useState, useRef, useEffect } from 'react';
import type { List as ListType, Card } from '../types';
import ListCard from './ListCard';
import { Droppable } from '@hello-pangea/dnd';

interface ListProps {
  list: ListType;
  index: number;
  onAddCard: (listId: string, card: Omit<Card, 'id' | 'createdAt'>) => void;
  onEditCard: (listId: string, card: Card) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onEditTitle: (listId: string, newTitle: string) => void;
  onDeleteList: (listId: string) => void;
}

const List: React.FC<ListProps> = ({ list, index, onAddCard, onEditCard, onDeleteCard, onEditTitle, onDeleteList }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const updateMenuPosition = () => {
      if (menuRef.current && isMenuOpen) {
        const button = menuRef.current.querySelector('button');
        const menu = menuRef.current.querySelector('div[role="menu"]');
        if (button && menu) {
          const rect = button.getBoundingClientRect();
          menu.setAttribute('style', `position: fixed; top: ${rect.bottom + 8}px; left: ${rect.left}px; min-width: max-content;`);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', updateMenuPosition, true);
      updateMenuPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isMenuOpen]);

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

  return (
    <div className="bg-white rounded-lg w-80 p-4 flex-shrink-0 relative">
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
            <h2 className="text-lg font-semibold text-gray-900">
              {list.title}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-600 text-sm">
            {list.cards.length}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-600 hover:text-gray-700 rounded-md bg-white"
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {isMenuOpen && (
              <div role="menu" className="fixed mt-2 rounded-lg bg-white shadow-lg z-50">
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-100 flex items-center whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редагувати
                  </button>
                  <button
                    onClick={() => {
                      onDeleteList(list.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-100 flex items-center whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Видалити
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Droppable droppableId={list.id} type="card">
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
            placeholder="Назва картки"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            className="w-full mb-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
          <textarea
            placeholder="Опис картки"
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
              Скасувати
            </button>
            <button
              onClick={handleAddCard}
              className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Додати
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
            <span className="text-gray-900">Додати картку</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default List;