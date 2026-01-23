// ============================================
// API ERROR TYPES
// ============================================

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

// Відповідь при login/register
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Запит на login
export interface LoginRequest {
  email: string;
  password: string;
}

// Запит на register
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

// Відповідь на /api/auth/me
export interface MeResponse {
  user: User;
}

// Запит на зміну паролю
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Відповідь на зміну паролю
export interface ChangePasswordResponse {
  message: string;
}


// ============================================
// BOARD TYPES
// ============================================

export interface Board {
  id: number;
  title: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

// Створення нової дошки
export interface CreateBoardRequest {
  title: string;
}

// Оновлення дошки
export interface UpdateBoardRequest {
  title?: string;
}

// Відповідь при створенні/оновленні
export interface BoardResponse {
  message: string;
  board: Board;
}

// Відповідь при отриманні всіх дошок
export interface BoardsResponse {
  boards: Board[];
}

export interface FullBoard extends Board {
  lists: ListWithCards[];
}

export interface FullBoardResponse {
  board: FullBoard;
}

// ============================================
// LIST TYPES
// ============================================

export interface List {
  id: number;
  title: string;
  position: number;
  boardId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListWithCards extends List {
  cards: Card[];
}

// Створення нового списку
export interface CreateListRequest {
  title: string;
  boardId: number;
  position?: number;
}

// Оновлення списку
export interface UpdateListRequest {
  title?: string;
  position?: number;
}

// Відповідь при створенні/оновленні
export interface ListResponse {
  message: string;
  list: List;
}

// Відповідь при отриманні списків дошки
export interface ListsResponse {
  lists: List[];
}

// ============================================
// CARD TYPES
// ============================================

export interface Card {
  id: number;
  title: string;
  description: string | null;
  position: number;
  listId: number;
  createdAt: string;
  updatedAt: string;
}

// Створення нової картки
export interface CreateCardRequest {
  title: string;
  listId: number;
  description?: string | null;
  position?: number;
}

// Оновлення картки
export interface UpdateCardRequest {
  title?: string;
  description?: string | null;
  position?: number;
  listId?: number; // для переміщення між списками
}

// Відповідь при створенні/оновленні
export interface CardResponse {
  message: string;
  card: Card;
}

// ============================================
// ACTIVITY TYPES
// ============================================

export type ListType = 'todo' | 'in-progress' | 'done';

export interface Activity {
  id: number;
  type: 'card_added' | 'card_edited' | 'card_deleted' | 'card_moved' | 'list_added' | 'list_edited' | 'list_deleted';
  timestamp: string; // Changed to string to match JSON/backend format, usually Date handles it but string is safer for entities coming from API
  description: string;
  metadata?: {
    cardTitle?: string;
    listTitle?: string;
    fromList?: string;
    toList?: string;
  };
}

