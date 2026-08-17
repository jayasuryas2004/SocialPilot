import client, { USE_MOCK } from "./client";

/**
 * Normalizes backend Campaign model into the structure expected by the frontend UI
 */
export function normalizeCampaign(item) {
  if (!item) {
    return null;
  }

  // Normalize platform string into an array of platforms
  let platforms = ["Instagram"];
  if (Array.isArray(item.platforms) && item.platforms.length > 0) {
    platforms = item.platforms;
  } else if (typeof item.platform === "string" && item.platform.trim().length > 0) {
    const rawPlatforms = item.platform.split(",");
    const parsed = [];
    for (let i = 0; i < rawPlatforms.length; i++) {
      const p = rawPlatforms[i].trim();
      if (p.length > 0) {
        parsed.push(p);
      }
    }
    if (parsed.length > 0) {
      platforms = parsed;
    }
  }

  // Format start and end dates
  const startDate = item.start_date || item.startDate || new Date().toISOString().split("T")[0];
  const endDate = item.end_date || item.endDate || new Date().toISOString().split("T")[0];

  return {
    id: item.id,
    title: item.campaign_name || item.title || item.name || "Untitled Campaign",
    campaign_name: item.campaign_name || item.title || item.name || "Untitled Campaign",
    subtitle: item.subtitle || `${item.platform || platforms.join(", ")} Campaign`,
    description: item.description || `Campaign on ${item.platform || platforms.join(", ")}`,
    fullText: item.fullText || item.description || `Campaign on ${item.platform || platforms.join(", ")}`,
    platforms: platforms,
    platform: item.platform || platforms.join(", "),
    objective: item.objective || "Awareness",
    startDate: startDate,
    endDate: endDate,
    start_date: startDate,
    end_date: endDate,
    status: item.status || "Active",
    budget: item.budget !== undefined && item.budget !== null ? Number(item.budget) : 0.0,
    image: item.image || "https://images.unsplash.com/photo-1557683316-973673baf926?w=150&h=150&fit=crop",
  };
}

/**
 * GET /campaign: Fetch campaigns from the FastAPI backend
 */
export async function getCampaigns() {
  const response = await client.get("/campaign");
  const rawList = response.data?.data || response.data || [];
  
  const normalized = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = normalizeCampaign(rawList[i]);
    if (item) {
      normalized.push(item);
    }
  }
  return normalized;
}

/**
 * Backward compatibility alias for listCampaigns
 */
export async function listCampaigns(params = {}) {
  const items = await getCampaigns();
  return { items, total: items.length };
}

/**
 * GET /campaign/{id}: Fetch a single campaign by ID
 */
export async function getCampaign(id) {
  const response = await client.get(`/campaign/${id}`);
  const data = response.data?.data || response.data;
  return normalizeCampaign(data);
}

/**
 * POST /campaign: Create a new campaign on the FastAPI backend
 */
export async function createCampaign(payload) {
  // Format platform array into comma-separated string for backend storage
  let platformStr = "Instagram";
  if (Array.isArray(payload.platforms) && payload.platforms.length > 0) {
    platformStr = payload.platforms.join(", ");
  } else if (typeof payload.platform === "string" && payload.platform.trim().length > 0) {
    platformStr = payload.platform;
  }

  const backendPayload = {
    campaign_name: payload.campaign_name || payload.title || payload.name || "Untitled Campaign",
    platform: platformStr,
    subtitle: payload.subtitle || "",
    description: payload.description || "",
    start_date: payload.start_date || payload.startDate || new Date().toISOString().split("T")[0],
    end_date: payload.end_date || payload.endDate || new Date().toISOString().split("T")[0],
    status: payload.status || "Active",
    objective: payload.objective || "Awareness",
    budget: payload.budget !== undefined && payload.budget !== null && payload.budget !== "" ? Number(payload.budget) : 0.0,
  };

  const response = await client.post("/campaign", backendPayload);
  const created = response.data?.data || response.data;
  return normalizeCampaign(created);
}

/**
 * PUT /campaign/{id}: Update an existing campaign on the FastAPI backend
 */
export async function updateCampaign(id, payload) {
  let platformStr = "Instagram";
  if (Array.isArray(payload.platforms) && payload.platforms.length > 0) {
    platformStr = payload.platforms.join(", ");
  } else if (typeof payload.platform === "string" && payload.platform.trim().length > 0) {
    platformStr = payload.platform;
  }

  const backendPayload = {
    campaign_name: payload.campaign_name || payload.title || payload.name || "Untitled Campaign",
    platform: platformStr,
    subtitle: payload.subtitle || "",
    description: payload.description || "",
    start_date: payload.start_date || payload.startDate || new Date().toISOString().split("T")[0],
    end_date: payload.end_date || payload.endDate || new Date().toISOString().split("T")[0],
    status: payload.status || "Active",
    objective: payload.objective || "Awareness",
    budget: payload.budget !== undefined && payload.budget !== null && payload.budget !== "" ? Number(payload.budget) : 0.0,
  };

  const response = await client.put(`/campaign/${id}`, backendPayload);
  const updated = response.data?.data || response.data;
  return normalizeCampaign(updated);
}

/**
 * DELETE /campaign/{id}: Delete a campaign from the FastAPI backend
 */
export async function deleteCampaign(id) {
  const response = await client.delete(`/campaign/${id}`);
  return response.data;
}

/**
 * GET /campaign/stats : Fetch live aggregated campaign counts from SQLite
 */
export async function getCampaignStats() {
  try {
    const response = await client.get("/campaign/stats");
    return response.data;
  } catch (e) {
    console.error("Failed to fetch campaign stats:", e);
    const reportsRes = await client.get("/reports/stats").catch(() => null);
    if (reportsRes?.data) {
      return {
        total: reportsRes.data.total_campaigns || 0,
        active: reportsRes.data.active_campaigns || 0,
        completed: 0,
        draft: 0
      };
    }
    return { total: 0, active: 0, completed: 0, draft: 0 };
  }
}