import './App.css';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthProvider>
          <AppRoutes />
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
