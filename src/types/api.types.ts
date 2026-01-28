// ============================================
// API ERROR TYPES
// ============================================

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  status?: number;
  code?: string;
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

// Login/Register response
export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string; // Changed from 'token' to 'accessToken'
}

// Refresh token response
export interface RefreshResponse {
  user: User;
  accessToken: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

// Response for /api/auth/me
export interface MeResponse {
  user: User;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Change password response
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

// Create new board request
export interface CreateBoardRequest {
  title: string;
}

// Update board request
export interface UpdateBoardRequest {
  title?: string;
}

// Create/Update board response
export interface BoardResponse {
  message: string;
  board: Board;
}

// Get all boards response
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

// Create new list request
export interface CreateListRequest {
  title: string;
  boardId: number;
  position?: number;
}

// Update list request
export interface UpdateListRequest {
  title?: string;
  position?: number;
}

// Create/Update list response
export interface ListResponse {
  message: string;
  list: List;
}

// Get board lists response
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

// Create new card request
export interface CreateCardRequest {
  title: string;
  listId: number;
  description?: string | null;
  position?: number;
}

// Update card request
export interface UpdateCardRequest {
  title?: string;
  description?: string | null;
  position?: number;
  listId?: number; // for moving between lists
}

// Create/Update card response
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

