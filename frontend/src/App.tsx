import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingProvider } from './context/LoadingContext';
import { ToastContainer } from 'react-toastify';
import { Header } from './components/layout/Header';
import { AppRoutes } from './routes';
import { useAuthStore } from './store/auth.store';
import { AuthProvider } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication state when app loads
    const initAuth = async () => {
      console.log('Initializing auth state...');
      await checkAuth();
      console.log('Auth state initialized');
    };
    initAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LoadingProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <AppRoutes />
              </main>
              <ToastContainer position="top-right" />
            </div>
          </LoadingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
