import { lazy } from 'react';

const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'Failed to fetch dynamically imported module',
];

const isChunkLoadError = (error) => {
  const description = [error?.name, error?.message].filter(Boolean).join(' ');

  return CHUNK_ERROR_PATTERNS.some((pattern) => description.includes(pattern));
};

function lazyWithRetry(importer, retryKey) {
  return lazy(async () => {
    try {
      const module = await importer();

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(retryKey);
      }

      return module;
    } catch (error) {
      if (typeof window === 'undefined' || !isChunkLoadError(error)) {
        throw error;
      }

      const hasRetried = window.sessionStorage.getItem(retryKey) === '1';

      if (!hasRetried) {
        window.sessionStorage.setItem(retryKey, '1');
        window.location.reload();

        return new Promise(() => {});
      }

      window.sessionStorage.removeItem(retryKey);
      throw error;
    }
  });
}

export default lazyWithRetry;
