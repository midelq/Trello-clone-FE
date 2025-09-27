import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import type { Board, List as ListType, Card } from '../types';
import List from '../components/List';
import Navbar from '../components/Navbar';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useUser } from '../contexts/UserContext';

const BoardView: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/" />;
  }
  const { boardId } = useParams<{ boardId: string }>();
  const [lists, setLists] = useState<ListType[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    
    setBoard({
      id: boardId || '',
      title: 'Sample Board',
      updatedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    });
    
    const defaultLists: ListType[] = [
      {
        id: '1',
        title: 'To Do',
        cards: [],
        boardId: boardId || '',
      },
      {
        id: '2',
        title: 'In Progress',
        cards: [],
        boardId: boardId || '',
      },
      {
        id: '3',
        title: 'Done',
        cards: [],
        boardId: boardId || '',
      },
    ];
    setLists(defaultLists);
  }, [boardId]);

  const handleAddCard = (listId: string, cardData: Omit<Card, 'id' | 'createdAt'>) => {
    const newCard: Card = {
      id: Date.now().toString(),
      ...cardData,
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, cards: [...list.cards, newCard] }
        : list
    ));
  };

  const handleEditCard = (listId: string, editedCard: Card) => {
    setLists(lists.map(list =>
      list.id === listId
        ? {
            ...list,
            cards: list.cards.map(card =>
              card.id === editedCard.id ? editedCard : card
            ),
          }
        : list
    ));
  };

  const handleDeleteCard = (listId: string, cardId: string) => {
    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
        : list
    ));
  };

  const handleAddList = () => {
    if (newListTitle.trim()) {
      const newList: ListType = {
        id: Date.now().toString(),
        title: newListTitle.trim(),
        cards: [],
        boardId: boardId || '',
      };
      setLists([...lists, newList]);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleEditListTitle = (listId: string, newTitle: string) => {
    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, title: newTitle.trim() }
        : list
    ));
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей список? Усі картки в ньому також будуть видалені.')) {
      setLists(lists.filter(list => list.id !== listId));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Якщо перетягуємо картку
    if (type === 'card') {
      const sourceList = lists.find(list => list.id === source.droppableId);
      const destList = lists.find(list => list.id === destination.droppableId);
      
      if (!sourceList || !destList) return;

      if (source.droppableId === destination.droppableId) {
        // Перетягування в межах одного списку
        const newCards = Array.from(sourceList.cards);
        const [movedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, movedCard);

        const newList = {
          ...sourceList,
          cards: newCards
        };

        setLists(lists.map(list =>
          list.id === newList.id ? newList : list
        ));
      } else {
        // Перетягування між різними списками
        const sourceCards = Array.from(sourceList.cards);
        const destCards = Array.from(destList.cards);
        const [movedCard] = sourceCards.splice(source.index, 1);
        destCards.splice(destination.index, 0, movedCard);

        setLists(lists.map(list => {
          if (list.id === source.droppableId) {
            return { ...list, cards: sourceCards };
          }
          if (list.id === destination.droppableId) {
            return { ...list, cards: destCards };
          }
          return list;
        }));
      }
    }
  };

  return (
    <>
      <Navbar username={user.email} />
      <div className="min-h-screen min-w-full bg-[#6366F1] p-6" style={{ minWidth: 'fit-content' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{board?.title || 'Board View'}</h1>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4 px-2" style={{ minWidth: 'max-content', position: 'relative' }}>
            {lists.map((list, index) => (
              <List
                key={list.id}
                list={list}
                index={index}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
                onEditTitle={handleEditListTitle}
                onDeleteList={handleDeleteList}
              />
            ))}
            {isAddingList ? (
              <div className="bg-white rounded-lg w-80 p-4 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Назва списку"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full mb-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsAddingList(false)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleAddList}
                    className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Додати
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="bg-white/30 hover:bg-white/40 transition-colors duration-200 rounded-lg w-80 p-4 flex items-center justify-center gap-2 text-white"
              >
                <span className="text-2xl">+</span>
                <span>Додати список</span>
              </button>
            )}
          </div>
        </DragDropContext>
      </div>
    </>
  );
};

export default BoardView;
