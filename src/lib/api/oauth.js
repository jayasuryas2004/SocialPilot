import { getToken, getUser } from "@/lib/auth/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Initiates the LinkedIn OAuth redirection flow using hard browser navigation.
 * Never uses axios.get or fetch for the OAuth login route.
 * Securely passes the user_id or JWT token as a query parameter for tenant attribution.
 */
export function initiateLinkedInLogin() {
  if (typeof window !== "undefined") {
    const url = getLinkedInAuthUrl();
    window.location.href = url;
  }
}

export function getLinkedInAuthUrl() {
  const currentUser = getUser();
  const token = getToken();
  const userId = currentUser?.id || currentUser?.user_id;

  let url = `${API_BASE_URL}/oauth/linkedin/login?redirect=true`;
  if (userId) {
    url += `&user_id=${encodeURIComponent(userId)}`;
  } else if (token) {
    url += `&token=${encodeURIComponent(token)}`;
  }
  return url;
}

/**
 * Initiates the Facebook / Meta OAuth redirection flow using hard browser navigation.
 */
export function initiateFacebookLogin() {
  if (typeof window !== "undefined") {
    const url = getFacebookAuthUrl();
    window.location.href = url;
  }
}

export function getFacebookAuthUrl() {
  const currentUser = getUser();
  const token = getToken();
  const userId = currentUser?.id || currentUser?.user_id;

  let url = `${API_BASE_URL}/api/social/facebook/login`;
  if (userId) {
    url += `?user_id=${encodeURIComponent(userId)}`;
  } else if (token) {
    url += `?token=${encodeURIComponent(token)}`;
  }
  return url;
}
