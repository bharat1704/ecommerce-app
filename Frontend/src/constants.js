export const BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const ITEMS_PER_PAGE = 15;

// API timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

// Cookie options
export const COOKIE_OPTIONS = {
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: import.meta.env.PROD ? 'strict' : 'lax'
};