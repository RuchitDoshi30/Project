import DOMPurify from 'dompurify';

/**
 * Centralized HTML sanitizer to safely render rich text content.
 *
 * Always sanitize any HTML string before passing it to
 * `dangerouslySetInnerHTML` to avoid XSS vulnerabilities.
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty);
};

