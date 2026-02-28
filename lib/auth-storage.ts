/**
 * Auth state stored in sessionStorage so each browser tab has its own logged-in user.
 * (localStorage is shared across tabs and would overwrite when logging in as different users.)
 */

const AUTH_KEYS = ["userId", "username", "firstName", "lastName", "role"] as const;

export function getAuth(key: (typeof AUTH_KEYS)[number]): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(key) ?? "";
}

export function setAuth(
  data: Partial<Record<(typeof AUTH_KEYS)[number], string | null | undefined>>,
): void {
  if (typeof window === "undefined") return;
  AUTH_KEYS.forEach((k) => sessionStorage.removeItem(k));
  AUTH_KEYS.forEach((k) => {
    const v = data[k];
    if (v != null) sessionStorage.setItem(k, String(v));
  });
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  AUTH_KEYS.forEach((k) => sessionStorage.removeItem(k));
}
