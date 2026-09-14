// ─── Token Storage ────────────────────────────────────────────────
const ACCESS_TOKEN_KEY  = 'jari_access_token';
const REFRESH_TOKEN_KEY = 'jari_refresh_token';

export const tokenStorage = {
  getAccess():  string | null { return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY)  : null; },
  getRefresh(): string | null { return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null; },

  setAccess(token: string):  void { if (typeof window !== 'undefined') localStorage.setItem(ACCESS_TOKEN_KEY, token);  },
  setRefresh(token: string): void { if (typeof window !== 'undefined') localStorage.setItem(REFRESH_TOKEN_KEY, token); },

  set(access: string, refresh: string): void {
    tokenStorage.setAccess(access);
    tokenStorage.setRefresh(refresh);
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};
