// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  ENDPOINTS: {

    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      CHANGE_PASSWORD: '/api/auth/change-password',
    },

    BOARDS: {
      GET_ALL: '/api/boards',
      GET_BY_ID: (id: number) => `/api/boards/${id}`,
      GET_FULL: (id: number) => `/api/boards/${id}/full`,
      CREATE: '/api/boards',
      UPDATE: (id: number) => `/api/boards/${id}`,
      DELETE: (id: number) => `/api/boards/${id}`,
    },

    LISTS: {
      GET_BY_BOARD: (boardId: number) => `/api/lists/board/${boardId}`,
      GET_BY_ID: (id: number) => `/api/lists/${id}`,
      CREATE: '/api/lists',
      UPDATE: (id: number) => `/api/lists/${id}`,
      DELETE: (id: number) => `/api/lists/${id}`,
    },

    CARDS: {
      GET_BY_LIST: (listId: number) => `/api/cards/list/${listId}`,
      GET_BY_ID: (id: number) => `/api/cards/${id}`,
      CREATE: '/api/cards',
      UPDATE: (id: number) => `/api/cards/${id}`,
      DELETE: (id: number) => `/api/cards/${id}`,
    },
  },

  STORAGE_KEYS: {
    TOKEN: 'trello_auth_token',
    USER: 'trello_user_data',
  },
} as const;

