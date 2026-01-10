# Code Review: Trello Clone Frontend

## Overview

This is a well-structured React + TypeScript project implementing a Trello-like kanban board application. For a junior developer without practical work experience, this is a **solid foundation** that demonstrates understanding of modern React patterns. Below are observations organized by category with constructive recommendations.

---

## Summary

| Category | Rating | Notes |
|----------|--------|-------|
| Project Structure | ⭐⭐⭐⭐ | Good separation of concerns |
| TypeScript Usage | ⭐⭐⭐ | Good basics, room for improvement |
| State Management | ⭐⭐⭐ | Works but has scalability concerns |
| Error Handling | ⭐⭐ | Needs significant improvement |
| Code Quality | ⭐⭐⭐ | Decent but has duplication |
| Testing | ⭐⭐⭐⭐ | Good E2E coverage |
| Security | ⭐⭐ | Some concerns with auth handling |

---

## 1. Architecture & System Design

### What's Good
- Clean folder structure with logical separation (`components/`, `pages/`, `contexts/`, `utils/`, `types/`)
- Centralized API configuration in `api.config.ts`
- Custom API client abstraction
- React Context for authentication state

### Issues & Recommendations

#### 1.1 Duplicate Type Definitions
**Problem:** Two separate type files (`src/types/index.ts` and `src/types/api.types.ts`) with conflicting definitions for the same entities.

```typescript
// src/types/index.ts - uses string IDs
export interface Board {
  id: string;
  title: string;
  updatedAt: string;
}

// src/types/api.types.ts - uses number IDs
export interface Board {
  id: number;
  title: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}
```

**Why it matters:** This leads to confusing type conversions throughout the codebase (e.g., `id.toString()` scattered everywhere in `BoardView.tsx:47-67`).

**Recommendation:** Consolidate into a single source of truth. Use one type file and create separate DTOs for API responses if needed:

```typescript
// types/entities.ts - Single source of truth
export interface Board {
  id: number;  // Match backend type
  title: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

// Use the same types everywhere, convert only at API boundary if needed
```

#### 1.2 Unused Context
**Problem:** `UserContext.tsx` exists but is never used (not imported anywhere).

**Location:** `src/contexts/UserContext.tsx`

**Recommendation:** Remove dead code. The `AuthContext` already handles user state.

#### 1.3 Static/Placeholder Page
**Problem:** `BoardsPage.tsx` contains hardcoded static content that doesn't connect to any data source.

**Location:** `src/pages/BoardsPage.tsx:11-22`

```typescript
<div className="board-card">
  <h2 className="board-title">Sample Board</h2>
  <p className="board-updated">Last updated: 2 hours ago</p>
</div>
```

**Recommendation:** Either implement it properly or remove it from routes to avoid user confusion.

---

## 2. TypeScript Best Practices

### What's Good
- Using `interface` for object shapes
- Type imports with `import type { ... }`
- Generic types for API responses
- Proper typing of React functional components

### Issues & Recommendations

#### 2.1 Avoid `any` Type
**Problem:** Multiple uses of `any` which defeats TypeScript's purpose.

**Locations:**
- `src/utils/apiClient.ts:39` - `const errorData: any`
- `src/utils/apiClient.ts:73` - `data?: any`
- `src/pages/BoardView.tsx:69` - `catch (err: any)`
- `src/pages/DashboardPage.tsx:33` - `catch (err: any)`

**Recommendation:** Create proper error types:

```typescript
// types/errors.ts
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Usage
catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('An unknown error occurred');
  }
}
```

#### 2.2 Inconsistent Return Types
**Problem:** `handleResponse` returns `{} as T` for non-JSON responses which is unsafe.

**Location:** `src/utils/apiClient.ts:51`

```typescript
return {} as T;  // Dangerous - bypasses type safety
```

**Recommendation:** Handle this case explicitly:

```typescript
private async handleResponse<T>(response: Response): Promise<T | null> {
  // ... or throw an error if non-JSON is unexpected
}
```

#### 2.3 JSX.Element Return Type
**Problem:** Using `JSX.Element` is less precise than `ReactNode`.

**Location:** `src/components/ProtectedRoute.tsx:4`

```typescript
function ProtectedRoute({ children }: { children: JSX.Element })
```

**Recommendation:**
```typescript
function ProtectedRoute({ children }: { children: ReactNode })
```

---

## 3. React Patterns & Best Practices

### What's Good
- Functional components throughout
- Proper use of hooks (`useState`, `useEffect`, `useRef`, `useContext`)
- Custom hook for auth (`useAuth`)
- Optimistic UI updates in `handleEditListTitle`

### Issues & Recommendations

#### 3.1 Conditional Hook Violation
**Problem:** In `BoardView.tsx`, there's an early return before `useEffect`, which can cause issues in development.

**Location:** `src/pages/BoardView.tsx:30-38`

```typescript
if (!user) {
  return <Navigate to="/" />;
}

useEffect(() => {  // This runs after conditional return - React Rules of Hooks violation
  if (boardId) {
    fetchBoardData(boardId);
  }
}, [boardId]);
```

**Why it matters:** While this may work, it violates React's Rules of Hooks and ESLint should catch it.

**Recommendation:** Move the user check inside the component or use `ProtectedRoute` consistently:

```typescript
const BoardView: React.FC = () => {
  const { user } = useAuth();
  const { boardId } = useParams();
  const [lists, setLists] = useState<LocalList[]>([]);
  // ... all hooks first
  
  useEffect(() => {
    if (boardId) {
      fetchBoardData(boardId);
    }
  }, [boardId]);

  // Conditional rendering AFTER all hooks
  if (!user) {
    return <Navigate to="/" />;
  }
  // ...
};
```

#### 3.2 Missing Dependency in useEffect
**Problem:** `fetchBoardData` is called in `useEffect` but not included in dependencies.

**Location:** `src/pages/BoardView.tsx:34-38`

**Recommendation:** Either add to dependencies with `useCallback`, or define the function inside `useEffect`:

```typescript
useEffect(() => {
  const fetchData = async () => {
    // fetch logic here
  };
  if (boardId) {
    fetchData();
  }
}, [boardId]);
```

#### 3.3 Inline Event Handlers with Heavy Logic
**Problem:** Navbar has complex inline style manipulation in event handlers.

**Location:** `src/components/Navbar.tsx:87-96`

```typescript
onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
  e.currentTarget.style.transform = 'translateY(-1px)';
  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
}}
```

**Recommendation:** Use CSS classes with hover states:

```css
.activity-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### 3.4 Prop Drilling
**Problem:** Activity-related props are passed through multiple components.

**Recommendation:** For a larger app, consider:
- React Context for shared UI state
- Or a lightweight state manager like Zustand

---

## 4. Error Handling

### Critical Issues

#### 4.1 User-Facing Alerts
**Problem:** Using `alert()` for error messages is poor UX.

**Locations:**
- `src/pages/BoardView.tsx:113, 134, 145, 181, 203, 217`
- `src/pages/DashboardPage.tsx:64, 93`

```typescript
catch (err: any) {
  alert(err.message || 'Failed to create list');
}
```

**Recommendation:** Create a proper notification system:

```typescript
// contexts/NotificationContext.tsx
const { showError, showSuccess } = useNotification();

// Usage
catch (err) {
  showError(err.message || 'Failed to create list');
}
```

#### 4.2 Silent Failures in Drag & Drop
**Problem:** Drag operations log errors but don't inform users.

**Location:** `src/pages/BoardView.tsx:238-240, 263-265, 284-286`

```typescript
} catch (err) {
  console.error('Failed to update list position', err);
  // User has no idea the operation failed!
}
```

**Recommendation:** Show error notification and revert state:

```typescript
catch (err) {
  // Revert to previous state
  setLists(previousLists);
  showError('Failed to move item. Please try again.');
}
```

#### 4.3 No Retry Logic for Failed Operations
**Recommendation:** Consider implementing retry for transient failures, especially for drag-drop operations.

---

## 5. Security Considerations

### Issues

#### 5.1 Token Storage in localStorage
**Problem:** JWT stored in `localStorage` is vulnerable to XSS attacks.

**Location:** `src/contexts/AuthContext.tsx:47`

```typescript
localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, response.token);
```

**Recommendation:** For a production app:
- Use `httpOnly` cookies (requires backend changes)
- Or implement token refresh mechanism
- At minimum, implement XSS protection headers

#### 5.2 No Token Expiration Handling
**Problem:** No mechanism to handle expired tokens gracefully.

**Recommendation:** Add interceptor to detect 401 responses and redirect to login:

```typescript
if (response.status === 401) {
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
  window.location.href = '/';
}
```

#### 5.3 Confirm Dialogs for Destructive Actions
**Good:** Using `window.confirm()` for delete operations shows awareness of UX.

**Better:** Create custom modal components for consistent branding and better UX.

---

## 6. Code Quality & DRY Principles

### Issues

#### 6.1 Duplicated Click-Outside Logic
**Problem:** Same click-outside detection pattern copied in multiple files.

**Locations:**
- `src/components/List.tsx:25-52`
- `src/components/ListCard.tsx:39-53`
- `src/components/Navbar.tsx:40-54`

**Recommendation:** Create a custom hook:

```typescript
// hooks/useClickOutside.ts
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
```

#### 6.2 Duplicated Menu Components
**Problem:** Similar dropdown menu UI in List, ListCard, and Navbar.

**Recommendation:** Create a reusable `DropdownMenu` component.

#### 6.3 Magic Numbers
**Problem:** Hardcoded values without explanation.

**Locations:**
- `src/components/CryptoPrices.tsx:29` - `60000` (1 minute)
- `src/components/FearGreedIndex.tsx:28` - `300000` (5 minutes)

**Recommendation:**
```typescript
const REFRESH_INTERVALS = {
  CRYPTO_PRICES: 60 * 1000,  // 1 minute
  FEAR_GREED: 5 * 60 * 1000, // 5 minutes
} as const;
```

#### 6.4 Mixed Styling Approaches
**Problem:** Inconsistent use of:
- Tailwind CSS classes
- Inline styles (especially in Navbar)
- External CSS files

**Recommendation:** Choose one primary approach. Given Tailwind is installed, prefer Tailwind classes and keep custom CSS minimal.

---

## 7. Performance Considerations

### Issues

#### 7.1 No Memoization
**Problem:** List and card components re-render unnecessarily.

**Recommendation:** Use `React.memo` for list items:

```typescript
const ListCard = React.memo<ListCardProps>(({ card, index, onEdit, onDelete }) => {
  // ...
});
```

#### 7.2 Creating Functions in Render
**Problem:** New function instances created on every render.

**Location:** `src/pages/BoardView.tsx:172`

```typescript
onEditCard={(editedCard) => onEditCard(list.id, editedCard)}
```

**Recommendation:** Use `useCallback` for stable references:

```typescript
const handleEditCard = useCallback((listId: string, editedCard: Card) => {
  // ...
}, [/* dependencies */]);
```

---

## 8. Testing

### What's Good
- Comprehensive E2E test suite with Playwright
- Good coverage of auth flows
- API mocking for predictable tests
- Tests for error states

### Recommendations

#### 8.1 Add Unit Tests
Consider adding unit tests for:
- `apiClient.ts` - test error handling, headers, etc.
- `formatDate` utility in `ListCard.tsx`
- Custom hooks (once extracted)

#### 8.2 Component Tests
Consider React Testing Library for component-level tests:
```typescript
// Example
test('BoardCard shows menu on click', () => {
  render(<BoardCard id="1" title="Test" ... />);
  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  expect(screen.getByText('Edit')).toBeVisible();
});
```

---

## 9. Documentation & Code Comments

### Issues

#### 9.1 Mixed Language Comments
**Problem:** Comments in Ukrainian scattered through code.

**Locations:**
- `src/utils/apiClient.ts:40-41` - `// Беремо error або message...`
- `src/types/api.types.ts` - Multiple Ukrainian comments

**Recommendation:** Use English for code comments to make the project more accessible to all developers.

#### 9.2 Missing JSDoc
**Recommendation:** Add JSDoc for public functions:

```typescript
/**
 * Fetches user authentication status from the server.
 * Clears token if authentication fails.
 */
const checkAuth = async () => { ... }
```

---

## 10. Deployment & Configuration

### What's Good
- Docker setup with multi-stage build
- Nginx configuration for SPA routing
- CI/CD with GitHub Actions
- Environment variable support (`VITE_API_BASE_URL`)

### Recommendations

#### 10.1 Add Environment Validation
```typescript
// config/env.ts
const requiredEnvVars = ['VITE_API_BASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}`);
  }
}
```

---

## Action Items (Priority Order)

### High Priority
1. Fix the conditional hook issue in `BoardView.tsx`
2. Remove `any` types and add proper error typing
3. Replace `alert()` with proper notification system
4. Consolidate duplicate type definitions

### Medium Priority
5. Extract `useClickOutside` custom hook
6. Add token expiration handling
7. Standardize styling approach
8. Remove unused `UserContext` and `BoardsPage`

### Low Priority
9. Add memoization for performance
10. Create reusable dropdown component
11. Add unit tests
12. Translate comments to English

---

## Final Notes

This is **good work for a junior developer**. The project demonstrates:
- Understanding of React fundamentals
- Ability to structure a project logically  
- Working knowledge of TypeScript
- Good testing practices with E2E tests

The issues identified are common learning points that come with experience. The most important takeaways are:
1. **Consistency matters** - pick one approach and stick with it
2. **Error handling is crucial** - users need feedback
3. **DRY principle** - if you copy-paste, it's time to abstract
4. **TypeScript is only useful if you use it properly** - avoid `any`

Keep building!
