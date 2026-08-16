import client from "./client";

/**
 * Fetches workspace status including real background worker notifications
 * and hybrid active campaigns.
 */
export async function getWorkspaceStatus() {
  try {
    const { data } = await client.get("/api/workspace/status");
    return data;
  } catch (error) {
    console.error("Failed to fetch workspace status:", error);
    return { notifications: [], campaigns: [], unread_count: 0 };
  }
}

/**
 * Fetches notifications list from backend.
 */
export async function getNotifications() {
  try {
    const { data } = await client.get("/api/notifications");
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
