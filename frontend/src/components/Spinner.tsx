/**
 * Spinner Component
 * 
 * Loading spinner for indicating ongoing operations.
 * Uses primary color from design system for consistency.
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-t-transparent border-primary-600 w-full h-full" />
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message = 'Loading...' }: LoadingOverlayProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-lc-card rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
      <Spinner size="xl" />
      <p className="text-gray-700 dark:text-lc-text font-medium">{message}</p>
    </div>
  </div>
);

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

export const LoadingState = ({ isLoading, error, children, skeleton }: LoadingStateProps) => {
  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-lc-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return skeleton ? <>{skeleton}</> : (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};
