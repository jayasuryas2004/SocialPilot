import client from "./client";
import { getWorkspaceStatus, getNotifications, markNotificationRead, markAllNotificationsRead } from "./workspace";

export async function getUnreadNotificationCount() {
  try {
    const data = await getWorkspaceStatus();
    return typeof data.unread_count === "number" ? data.unread_count : 0;
  } catch (err) {
    return 0;
  }
}

export { getWorkspaceStatus, getNotifications, markNotificationRead, markAllNotificationsRead };