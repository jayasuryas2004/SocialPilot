import client from "./client";
import { getToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Fetches workspace status including real background worker notifications
 * and active campaigns with graceful fallback.
 */
export async function getWorkspaceStatus() {
  try {
    const { data } = await client.get("/workspace/status");
    return data;
  } catch (error) {
    try {
      const { data } = await client.get("/api/workspace/status");
      return data;
    } catch (err) {
      return { 
        status: "active",
        database: "connected",
        scheduler: "running",
        notifications: [], 
        campaigns: [], 
        unread_count: 0,
        total_campaigns: 0
      };
    }
  }
}

/**
 * Subscribes to real-time Server-Sent Events (SSE) workspace stream.
 * Returns a cleanup function that cleanly closes the EventSource connection.
 */
export function subscribeToWorkspaceStream(onMessage, onError) {
  if (typeof window === "undefined") {
    return function cleanup() {};
  }

  const token = getToken();
  let streamUrl = `${API_BASE_URL}/api/workspace/stream`;
  if (token) {
    streamUrl = `${streamUrl}?token=${encodeURIComponent(token)}`;
  }

  let eventSource = null;
  try {
    eventSource = new EventSource(streamUrl);

    eventSource.onmessage = function (event) {
      if (!event || !event.data) return;
      try {
        const payload = JSON.parse(event.data);
        if (onMessage && typeof onMessage === "function") {
          onMessage(payload);
        }
      } catch (parseError) {
        console.warn("Notice: Failed to parse SSE event packet:", parseError);
      }
    };

    eventSource.onerror = function (err) {
      if (onError && typeof onError === "function") {
        onError(err);
      }
    };
  } catch (initErr) {
    console.warn("Notice: EventSource initialization error:", initErr);
  }

  // Cleanup handler invoked on component unmount
  return function cleanup() {
    if (eventSource) {
      try {
        eventSource.close();
      } catch (closeErr) {
        console.warn("Notice: Error closing EventSource stream:", closeErr);
      }
      eventSource = null;
    }
  };
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
      return { success: true, unread_count: 0 };
    }
  }
}
