import './App.css';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

/**
 * Root application component.
 * Provides global providers and application routing.
 *
 * @returns {JSX.Element} Wrapped application with providers and routes.
 */
function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthProvider>
          <AppRoutes />

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
