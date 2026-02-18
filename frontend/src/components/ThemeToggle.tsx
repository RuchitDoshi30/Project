import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

/**
 * Theme Toggle Button Component
 * 
 * Provides a button to switch between light and dark modes.
 * Can be placed in navigation bars or settings panels.
 */

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = ({ className = '', showLabel = false }: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-2 p-2 rounded-lg 
        bg-gray-100 hover:bg-gray-200 dark:bg-lc-card dark:hover:bg-lc-elevated
        text-gray-700 dark:text-lc-text-secondary
        transition-colors duration-200
        ${className}
      `}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <Sun className="h-5 w-5" />
          {showLabel && <span className="text-sm font-medium">Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          {showLabel && <span className="text-sm font-medium">Dark</span>}
        </>
      )}
    </button>
  );
};
