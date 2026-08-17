import { getToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Initiates the LinkedIn OAuth redirection flow using hard browser navigation.
 * Never uses axios.get or fetch for the OAuth login route.
 * Securely passes the JWT token as a query parameter for tenant attribution.
 */
export function initiateLinkedInLogin() {
  if (typeof window !== "undefined") {
    const token = getToken();
    let url = `${API_BASE_URL}/oauth/linkedin/login`;
    if (token) {
      url = `${url}?token=${encodeURIComponent(token)}`;
    }
    window.location.href = url;
  }
}

export function getLinkedInAuthUrl() {
  const token = getToken();
  let url = `${API_BASE_URL}/oauth/linkedin/login`;
  if (token) {
    url = `${url}?token=${encodeURIComponent(token)}`;
  }
  return url;
}
