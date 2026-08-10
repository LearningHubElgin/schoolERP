const isLocalhost = Boolean(
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.')
  )
);

export const API_URL = isLocalhost 
  ? (import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:7005')
  : (import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL || '');