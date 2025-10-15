export interface Board {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  index?: number;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  boardId: string;
  index?: number;
}

export type ListType = 'todo' | 'in-progress' | 'done';

export interface Activity {
  id: string;
  type: 'card_added' | 'card_edited' | 'card_deleted' | 'card_moved' | 'list_added' | 'list_edited' | 'list_deleted';
  timestamp: Date;
  description: string;
  metadata?: {
    cardTitle?: string;
    listTitle?: string;
    fromList?: string;
    toList?: string;
  };
}