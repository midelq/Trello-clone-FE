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
