import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import type { Board as LocalBoard, ListWithCards as LocalList, Card as LocalCard, Activity } from '../types';
import List from '../components/List';
import Navbar from '../components/Navbar';
import ActivitySidebar from '../components/ActivitySidebar';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api.config';
import type {
  ListResponse,
  CardResponse,
  FullBoardResponse
} from '../types/api.types';

const BoardView: React.FC = () => {
  const { user } = useAuth();
  const { boardId } = useParams<{ boardId: string }>();
  const [lists, setLists] = useState<LocalList[]>([]);
  const [board, setBoard] = useState<LocalBoard | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    if (boardId) {
      fetchBoardData(boardId);
    }
  }, [boardId]);

  const fetchBoardData = async (id: string) => {
    try {
      setIsLoading(true);
      // Fetch Full Board Data (Board + Lists + Cards)
      const numericId = Number(id);
      const response = await apiClient.get<FullBoardResponse>(API_CONFIG.ENDPOINTS.BOARDS.GET_FULL(numericId));
      const { board: fullBoard } = response;

      setBoard({
        ...fullBoard,
        updatedAt: new Date(fullBoard.updatedAt).toLocaleDateString()
      });

      // Map API Lists to Local Lists
      const mappedLists: LocalList[] = fullBoard.lists.map(list => ({
        ...list,
        cards: list.cards.map(card => ({
          ...card,
          description: card.description || '',
        })).sort((a, b) => (a.position || 0) - (b.position || 0))
      }));

      setLists(mappedLists.sort((a, b) => (a.position || 0) - (b.position || 0)));
    } catch (err: any) {
      setError(err.message || 'Failed to load board data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = (type: Activity['type'], description: string, metadata?: Activity['metadata']) => {
    const newActivity: Activity = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString(),
      description,
      metadata
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleAddList = async () => {
    if (newListTitle.trim() && boardId) {
      try {
        const response = await apiClient.post<ListResponse>(API_CONFIG.ENDPOINTS.LISTS.CREATE, {
          title: newListTitle.trim(),
          boardId: Number(boardId),
          position: lists.length
        });

        const newList: LocalList = {
          ...response.list,
          cards: [],
        };

        setLists([...lists, newList]);
        setNewListTitle('');
        setIsAddingList(false);

        addActivity('list_added', `Created new list "${newList.title}"`, {
          listTitle: newList.title
        });
      } catch (err: any) {
        alert(err.message || 'Failed to create list');
      }
    }
  };

  const handleEditListTitle = async (listId: number, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    // Optimistic UI update – change title immediately
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === listId ? { ...list, title: trimmedTitle } : list
      )
    );

    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.LISTS.UPDATE(listId), {
        title: trimmedTitle
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update list');
      // Optionally, we could refetch board data here to restore correct state
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await apiClient.delete(API_CONFIG.ENDPOINTS.LISTS.DELETE(listId));
        setLists(lists.filter(list => list.id !== listId));
      } catch (err: any) {
        alert(err.message || 'Failed to delete list');
      }
    }
  };

  const handleAddCard = async (listId: number, cardData: Partial<LocalCard>) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      const response = await apiClient.post<CardResponse>(API_CONFIG.ENDPOINTS.CARDS.CREATE, {
        title: cardData.title,
        listId: listId,
        description: cardData.description,
        position: list.cards.length
      });

      const newCard: LocalCard = {
        ...response.card,
        description: response.card.description || '',
      };

      setLists(lists.map(l =>
        l.id === listId
          ? { ...l, cards: [...l.cards, newCard] }
          : l
      ));

      addActivity('card_added', `Added card "${newCard.title}"`, {
        cardTitle: newCard.title,
        listTitle: list.title
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create card');
    }
  };

  const handleEditCard = async (listId: number, editedCard: LocalCard) => {
    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.CARDS.UPDATE(editedCard.id), {
        title: editedCard.title,
        description: editedCard.description
      });

      setLists(lists.map(list =>
        list.id === listId
          ? {
            ...list,
            cards: list.cards.map((card: LocalCard) =>
              card.id === editedCard.id ? editedCard : card
            ),
          }
          : list
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update card');
    }
  };

  const handleDeleteCard = async (listId: number, cardId: number) => {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.CARDS.DELETE(cardId));

      setLists(lists.map(list =>
        list.id === listId
          ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
          : list
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to delete card');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      setLists(newLists);

      // Update position in backend
      try {
        await apiClient.put(API_CONFIG.ENDPOINTS.LISTS.UPDATE(movedList.id), {
          position: destination.index
        });
      } catch (err) {
        console.error('Failed to update list position', err);
      }
      return;
    }

    if (type === 'card') {
      const sourceList = lists.find(list => list.id.toString() === source.droppableId);
      const destList = lists.find(list => list.id.toString() === destination.droppableId);

      if (!sourceList || !destList) return;

      if (source.droppableId === destination.droppableId) {
        // Reorder in same list
        const newCards = Array.from(sourceList.cards);
        const [movedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, movedCard);

        const newList = { ...sourceList, cards: newCards };
        setLists(lists.map(list => list.id === newList.id ? newList : list));

        try {
          await apiClient.put(API_CONFIG.ENDPOINTS.CARDS.UPDATE(movedCard.id), {
            position: destination.index
          });
        } catch (err) {
          console.error('Failed to update card position', err);
        }
      } else {
        // Move to different list
        const sourceCards = Array.from(sourceList.cards);
        const destCards = Array.from(destList.cards);
        const [movedCard] = sourceCards.splice(source.index, 1);
        destCards.splice(destination.index, 0, movedCard);

        setLists(lists.map(list => {
          if (list.id === sourceList.id) return { ...list, cards: sourceCards };
          if (list.id === destList.id) return { ...list, cards: destCards };
          return list;
        }));

        try {
          await apiClient.put(API_CONFIG.ENDPOINTS.CARDS.UPDATE(movedCard.id), {
            listId: destList.id,
            position: destination.index
          });
        } catch (err) {
          console.error('Failed to update card position', err);
        }
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading board...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-white">Error: {error}</div>;
  }

  return (
    <>
      <Navbar
        username={user.email}
        onActivityClick={() => setIsSidebarOpen(true)}
        activityCount={activities.length}
      />
      <div className="min-h-screen min-w-full bg-[#6366F1] p-6" style={{ minWidth: 'fit-content', paddingTop: '100px' }}>
        <div className="mb-6" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '16px 24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {board?.title || 'Board View'}
          </h1>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lists" direction="horizontal" type="list">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex space-x-4 overflow-x-auto pb-4 px-2 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-purple-100/30 rounded-lg' : ''
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
                      placeholder="List title"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      className="w-full mb-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsAddingList(false)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddList}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="bg-white/30 hover:bg-white/40 transition-colors duration-200 rounded-lg w-80 p-4 flex items-center justify-center gap-2 text-white"
                  >
                    <span className="text-2xl">+</span>
                    <span>Add list</span>
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
