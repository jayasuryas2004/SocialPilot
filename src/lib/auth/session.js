// Storage keys for authentication credentials
const TOKEN_KEY = "sp_token";
const USER_KEY = "sp_user";

const TOKEN_KEYS = ["sp_token", "token", "access_token", "jwt"];

/**
 * Persist the authentication token and user information.
 * Stores the JWT token in cookies (for Next.js SSR / middleware access)
 * and in localStorage (for fast client-side access).
 */
export function setSession(token, user) {
  if (typeof document === "undefined") {
    return;
  }

  // Store JWT in cookie with a 7-day expiration and Lax SameSite policy
  if (token) {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.error("Failed to save token to localStorage:", err);
    }
  }

  // Store user profile JSON in localStorage
  if (user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error("Failed to save user data to localStorage:", err);
    }
  }
}

/**
 * Retrieve the active JWT token from cookies or localStorage.
 */
export function getToken() {
  if (typeof document === "undefined") {
    return null;
  }

  // 1. Try reading the token from cookies
  for (let i = 0; i < TOKEN_KEYS.length; i++) {
    const key = TOKEN_KEYS[i];
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]+)`));
    if (cookieMatch && cookieMatch[1]) {
      return cookieMatch[1].trim();
    }
  }

  // 2. Fall back to localStorage if available
  if (typeof window !== "undefined") {
    for (let i = 0; i < TOKEN_KEYS.length; i++) {
      const key = TOKEN_KEYS[i];
      try {
        const storedVal = localStorage.getItem(key);
        if (storedVal && storedVal.trim()) {
          return storedVal.trim();
        }
      } catch (err) {
        // Ignore storage access errors
      }
    }
  }

  return null;
}

/**
 * Retrieve the stored user object from localStorage.
 */
export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
      return null;
    }
    return JSON.parse(rawUser);
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    return null;
  }
}

/**
 * Clear the current session, removing cookies and localStorage items.
 */
export function clearSession() {
  if (typeof document === "undefined") {
    return;
  }

  // Expire all possible authentication cookies
  for (let i = 0; i < TOKEN_KEYS.length; i++) {
    const key = TOKEN_KEYS[i];
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  }

  // Remove stored items from localStorage
  if (typeof window !== "undefined") {
    for (let i = 0; i < TOKEN_KEYS.length; i++) {
      const key = TOKEN_KEYS[i];
      try {
        localStorage.removeItem(key);
      } catch (err) {
        // Ignore
      }
    }
    try {
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      // Ignore
    }
  }
}