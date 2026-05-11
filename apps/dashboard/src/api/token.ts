import { atom } from 'jotai';

/**
 * In-memory access token — never persisted to localStorage or cookies.
 * Written by apiFetch when the server sends X-Update-Access-Token.
 * Read by apiFetch on subsequent requests as Authorization: Bearer.
 */
export const accessTokenAtom = atom<string | null>(null);
