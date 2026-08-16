import client, { USE_MOCK } from "./client";

/**
 * Fetches the hybrid data array containing real SQLite records (with live LinkedIn status)
 * and populated filler posts for multi-channel calendar views.
 */
export async function getAllContent() {
  try {
    const { data } = await client.get("/api/content/all");
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch all content from /api/content/all:", error);
    return [];
  }
}
