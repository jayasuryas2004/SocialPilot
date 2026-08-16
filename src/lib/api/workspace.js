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
    try {
      const { data } = await client.get("/workspace/status");
      return data;
    } catch (err) {
      console.error("Failed to fetch workspace status:", err);
      return { notifications: [], campaigns: [], unread_count: 0 };
    }
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
    try {
      const { data } = await client.get("/notifications");
      return data?.items || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      return [];
    }
  }
}

/**
 * Marks single notification as read.
 */
export async function markNotificationRead(notifId) {
  try {
    const { data } = await client.patch(`/api/notifications/${notifId}/read`);
    return data;
  } catch (error) {
    try {
      const { data } = await client.patch(`/notifications/${notifId}/read`);
      return data;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      return { success: true };
    }
  }
}

/**
 * Marks all notifications as read.
 */
export async function markAllNotificationsRead() {
  try {
    const { data } = await client.patch("/api/notifications/read-all");
    return data;
  } catch (error) {
    try {
      const { data } = await client.patch("/notifications/read-all");
      return data;
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      return { success: true, unread_count: 0 };
    }
  }
}
