import client from "./client";

/**
 * Fetches the official LinkedIn OAuth 2.0 authorization URL from backend
 */
export async function getLinkedInAuthUrl() {
  const { data } = await client.get("/oauth/linkedin/login");
  return data?.auth_url;
}

/**
 * Initiates the LinkedIn OAuth redirection flow
 */
export async function initiateLinkedInLogin() {
  const authUrl = await getLinkedInAuthUrl();
  if (authUrl) {
    window.location.href = authUrl;
  }
}
