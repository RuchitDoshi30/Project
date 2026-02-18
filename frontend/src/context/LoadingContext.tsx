import { createContext, useContext, useState, ReactNode } from 'react';
import { Spinner } from '../components/Spinner';

/**
 * Loading Context
 * 
 * Provides global loading state management across the application.
 * Shows a full-screen loading overlay when async operations are in progress.
 */

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setLoading: setIsLoading,
        startLoading,
        stopLoading 
      }}
    >
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

/**
 * Higher-order function to wrap async operations with loading state
 * 
 * @example
 * const loadData = withLoading(async () => {
 *   const data = await fetchData();
 *   return data;
 * });
 */
// eslint-disable-next-line react-refresh/only-export-components
export const withLoading = <T,>(
  asyncFn: () => Promise<T>,
  setLoading: (loading: boolean) => void
): (() => Promise<T>) => {
  return async () => {
    setLoading(true);
    try {
      return await asyncFn();
    } finally {
      setLoading(false);
    }
  };
};
