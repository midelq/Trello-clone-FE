import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import type { Board, List as ListType, Card, Activity } from '../types';
import List from '../components/List';
import Navbar from '../components/Navbar';
import ActivitySidebar from '../components/ActivitySidebar';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const addActivity = (type: Activity['type'], description: string, metadata?: Activity['metadata']) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      description,
      metadata
    };
    setActivities(prev => [newActivity, ...prev]);
  };

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

    const list = lists.find(l => l.id === listId);
    if (list) {
      addActivity('card_added', `Додано картку "${cardData.title}" до списку "${list.title}"`, {
        cardTitle: cardData.title,
        listTitle: list.title
      });
    }

    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, cards: [...list.cards, newCard] }
        : list
    ));
  };

  const handleEditCard = (listId: string, editedCard: Card) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
      addActivity('card_edited', `Відредаговано картку "${editedCard.title}" у списку "${list.title}"`, {
        cardTitle: editedCard.title,
        listTitle: list.title
      });
    }

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
    const list = lists.find(l => l.id === listId);
    const card = list?.cards.find(c => c.id === cardId);
    
    if (list && card) {
      addActivity('card_deleted', `Видалено картку "${card.title}" зі списку "${list.title}"`, {
        cardTitle: card.title,
        listTitle: list.title
      });
    }

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
      addActivity('list_added', `Створено новий список "${newListTitle.trim()}"`, {
        listTitle: newListTitle.trim()
      });
      setLists([...lists, newList]);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleEditListTitle = (listId: string, newTitle: string) => {
    const list = lists.find(l => l.id === listId);
    if (list && list.title !== newTitle.trim()) {
      addActivity('list_edited', `Перейменовано список "${list.title}" на "${newTitle.trim()}"`, {
        listTitle: newTitle.trim()
      });
    }

    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, title: newTitle.trim() }
        : list
    ));
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Ви впеfвнені, що хочете видалити цей список? Усі картки в ньому також будуть видалені.')) {
      const list = lists.find(l => l.id === listId);
      if (list) {
        addActivity('list_deleted', `Видалено список "${list.title}" з ${list.cards.length} картками`, {
          listTitle: list.title
        });
      }
      setLists(lists.filter(list => list.id !== listId));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'list') {
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      setLists(newLists);
      return;``
    }

    if (type === 'card') {
      const sourceList = lists.find(list => list.id === source.droppableId);
      const destList = lists.find(list => list.id === destination.droppableId);
      
      if (!sourceList || !destList) return;

      if (source.droppableId === destination.droppableId) {
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

        addActivity('card_moved', `Переміщено картку "${movedCard.title}" з "${sourceList.title}" до "${destList.title}"`, {
          cardTitle: movedCard.title,
          fromList: sourceList.title,
          toList: destList.title
        });

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
      <Navbar 
        username={user.email}
        onActivityClick={() => setIsSidebarOpen(true)}
        activityCount={activities.length}
      />
      <div className="min-h-screen min-w-full bg-[#6366F1] p-6" style={{ minWidth: 'fit-content' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{board?.title || 'Board View'}</h1>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
           <Droppable droppableId="lists" direction="horizontal" type="list">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex space-x-4 overflow-x-auto pb-4 px-2 transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-purple-100/30 rounded-lg' : ''
                }`}
                style={{ minWidth: 'max-content', position: 'relative' }}
              >
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <ActivitySidebar
        activities={activities}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default BoardView;
