import { useEffect, useState } from 'react';

/**
 * Dark Mode Hook
 * 
 * Manages dark mode state with localStorage persistence and system preference detection.
 * Automatically applies dark mode class to document root element.
 * 
 * @returns {object} - { isDark: boolean, toggleTheme: () => void, setTheme: (dark: boolean) => void }
 * 
 * @example
 * const { isDark, toggleTheme } = useDarkMode();
 * <button onClick={toggleTheme}>
 *   {isDark ? '☀️' : '🌙'}
 * </button>
 */

const THEME_KEY = 'theme';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (!savedTheme) {
        setIsDark(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);

  return { 
    isDark, 
    toggleTheme, 
    setTheme,
    theme: isDark ? 'dark' : 'light' 
  } as const;
};
