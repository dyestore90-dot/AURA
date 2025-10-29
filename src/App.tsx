import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import { authService, AuthUser } from './services/auth';

type ViewMode = 'landing' | 'auth' | 'app';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    const { data: authListener } = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setViewMode('app');
      } else {
        setViewMode('landing');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setViewMode('app');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setViewMode('landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Loading AURA...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return <LandingPage onGetStarted={() => setViewMode('auth')} />;
  }

  if (viewMode === 'auth') {
    return (
      <AuthPage
        onBack={() => setViewMode('landing')}
        onSuccess={() => setViewMode('app')}
      />
    );
  }

  if (viewMode === 'app' && user) {
    return <MainApp user={user} onSignOut={handleSignOut} />;
  }

  return null;
}

export default App;
