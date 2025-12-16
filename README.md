# Trello Clone

A modern task management application built with React, TypeScript, and Tailwind CSS. This project implements a Trello-like board management system with drag-and-drop functionality, authentication, and real-time updates.

## 🚀 Live Demo & Deployment

This project is fully deployed and available for testing:

| Component | Service | Status | Link |
|-----------|---------|--------|------|
| **Frontend** | [Cloudflare Pages](https://pages.cloudflare.com/) | 🟢 Live | [**Visit App**](https://trello-clone-fe.pages.dev) |
| **Frontend** | [Vercel](https://vercel.com/) | 🟢 Live | [**Visit App**](https://trello-clone-fe-nine.vercel.app/) |
| **Backend** | [Vercel](https://vercel.com/) | 🟢 Live | [**API Root**](https://trello-clone-be-beryl.vercel.app/) |

**Infrastructure Highlights:**
- **CI/CD**: Automatic deployment pipeline configured via Cloudflare Pages.
- **Performance**: Optimized Vite build serving static assets via global CDN.
- **Security**: Environment variables used for secure API configuration.



## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: 
  - Tailwind CSS for utility classes
  - Custom CSS for components
  - Framer Motion for animations
- **Drag & Drop**: @hello-pangea/dnd
- **Build Tool**: Vite
- **Testing**: Playwright for E2E tests
- **Code Quality**: ESLint, TypeScript




### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd Trello-clone-FE
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
# Create .env file
VITE_API_BASE_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser



## Testing

This project uses Playwright for end-to-end testing. Tests cover:

- **Authentication** (`auth.spec.ts`): Login, signup, password validation, error handling
- **Dashboard** (`dashboard.spec.ts`): Board creation, editing, deletion
- **Lists** (`lists.spec.ts`): List CRUD operations, drag and drop
- **Cards** (`cards.spec.ts`): Card CRUD operations, validation

Run tests:
```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug
```

## API Integration

The application expects a REST API with the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id/full` - Get board with lists and cards
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
