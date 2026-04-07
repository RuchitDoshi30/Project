import { useEffect } from 'react';

const BASE_TITLE = 'PlacementPrep';

/**
 * Sets the document title dynamically.
 * Appends the base app name after the page-specific title.
 *
 * @param title - The page-specific title segment.
 *
 * @example
 * usePageTitle('Dashboard'); // Sets "Dashboard | PlacementPrep"
 * usePageTitle(); // Sets "PlacementPrep"
 */
export const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
};
