import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    if (window.location.pathname !== to) {
      window.history.pushState(null, '', to);
      setCurrentPath(to);
    }
  };

  // Route redirects matching contract Section 22
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Unauthenticated: /chat, /profile -> /login
      if (currentPath.startsWith('/chat') || currentPath.startsWith('/profile') || currentPath === '/') {
        navigate('/login');
      }
    } else {
      // Authenticated: /login or / -> /chat
      if (currentPath === '/login' || currentPath === '/') {
        navigate('/chat');
      }
    }
  }, [isAuthenticated, isLoading, currentPath]);

  if (isLoading) {
    return (
      <div className="full-page-loading">
        <div className="loading-card">
          <div className="brand-logo-animated">
            <span className="logo-sparkle">✦</span>
            <h2>ChatNest</h2>
          </div>
          <div className="loader-spinner spinner-lg" />
          <p>Connecting securely...</p>
        </div>
      </div>
    );
  }

  // Parse path for conversation ID
  const chatMatch = currentPath.match(/^\/chat\/(.+)$/);
  const conversationIdFromUrl = chatMatch ? chatMatch[1] : null;

  if (currentPath === '/login' || (!isAuthenticated && currentPath !== '/login')) {
    return <LoginPage />;
  }

  if (currentPath === '/profile') {
    return (
      <ProtectedRoute fallback={<LoginPage />}>
        <ProfilePage onNavigate={navigate} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute fallback={<LoginPage />}>
      <ChatPage
        initialConversationId={conversationIdFromUrl}
        onNavigate={navigate}
      />
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
