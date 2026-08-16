import client from "./client";

/**
 * Fetches the unified hybrid analytics report containing real LinkedIn metrics
 * and multi-platform statistics from the backend.
 */
export async function fetchFullAnalyticsReport() {
  try {
    const { data } = await client.get("/api/analytics/full-report");
    return data;
  } catch (error) {
    console.error("Failed to load full analytics report:", error);
    return null;
  }
}

export async function fetchPlatformDistribution() {
  try {
    const { data } = await client.get("/api/analytics/distribution");
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error("Failed to load platform distribution:", error);
    return [];
  }
}

export async function fetchEngagementTrends() {
  try {
    const { data } = await client.get("/api/analytics/trends");
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error("Failed to load engagement trends:", error);
    return [];
  }
}

export async function fetchFollowers(timeline = 'weekly') {
  try {
    const { data } = await client.get(`/api/analytics/followers?timeline=${timeline}`);
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error("Failed to load followers data:", error);
    return [];
  }
}
