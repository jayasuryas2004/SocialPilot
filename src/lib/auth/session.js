// JWT must live in a COOKIE, not localStorage — Next.js middleware runs on
// the server/edge and can only read cookies, not browser storage.
const TOKEN_KEY = "sp_token";
const USER_KEY = "sp_user";

export function setSession(token, user) {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${TOKEN_KEY}=([^;]+)`));
  return match ? match[1] : null;
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  localStorage.removeItem(USER_KEY);
}