import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  fullHeight?: boolean;
}

/**
 * Responsive container component that intelligently manages width and padding
 * across different screen sizes. Reusable for all pages.
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'xl',
  padding = true,
  fullHeight = false,
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1600px]',
    full: 'max-w-full',
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8' : '';
  const heightClass = fullHeight ? 'min-h-full' : '';

  return (
    <div className={`w-full mx-auto ${sizeClasses[size]} ${paddingClasses} ${heightClass} ${className}`}>
      {children}
    </div>
  );
};
