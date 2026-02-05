import { API_URL } from '@/config/api';

/**
 * Resolves the absolute URL for an image.
 * If the path is already an absolute URL (starts with http/https), returns it as is.
 * Otherwise, prepends the backend API_URL.
 * @param path - The image path or URL
 * @returns The resolved absolute URL
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
