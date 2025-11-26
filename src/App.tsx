import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BoardsPage from './pages/BoardsPage';
import DashboardPage from './pages/DashboardPage';
import BoardView from './pages/BoardView';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/boards" element={
          <ProtectedRoute>
            <BoardsPage />
          </ProtectedRoute>
        } />
        <Route path="/board/:boardId" element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
