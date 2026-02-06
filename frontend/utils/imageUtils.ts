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

  const cleanPath = path.trim();

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('blob:')) {
    return cleanPath;
  }

  // Ensure we don't end up with double slashes or missing slashes
  const baseUrl = API_URL.replace(/\/+$/, '');
  const pathPart = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `${baseUrl}${pathPart}`;
};
