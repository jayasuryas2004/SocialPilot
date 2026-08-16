import client, { USE_MOCK } from "./client";

/**
 * Normalizes backend Post model into the structure expected by the frontend UI
 */
export function normalizePost(item) {
  if (!item) {
    return null;
  }

  // Normalize platform array or string
  let platforms = ["Instagram"];
  if (Array.isArray(item.platforms) && item.platforms.length > 0) {
    platforms = item.platforms;
  } else if (typeof item.platforms === "string" && item.platforms.trim().length > 0) {
    const rawPlatforms = item.platforms.split(",");
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
  } else if (item.platform) {
    platforms = [item.platform];
  }

  const primaryPlatform = platforms[0] || "Instagram";

  // Format date and time
  const dateStr = item.scheduled_date || (item.scheduled_at ? String(item.scheduled_at).split("T")[0] : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const timeStr = item.scheduled_time || (item.scheduled_at ? String(item.scheduled_at).split("T")[1]?.slice(0, 5) : "10:00 am");

  const resolvedImage = item.image_url || item.image || item.media || item.media_url || item.mediaFile || null;

  return {
    id: item.id,
    title: item.title || (item.content ? item.content.slice(0, 40) + "..." : "Untitled Post"),
    subtitle: item.subtitle || (item.content ? item.content.slice(0, 60) : ""),
    content: item.content || "",
    fullText: item.content || "",
    platform: primaryPlatform,
    platforms: platforms,
    handle: item.handle || "socialpilot",
    campaign: item.campaign_name || (item.campaign_id ? `Campaign #${item.campaign_id}` : "Independent Post"),
    campaignId: item.campaign_id || null,
    campaign_id: item.campaign_id || null,
    date: dateStr,
    time: timeStr,
    scheduled_date: item.scheduled_date || null,
    scheduled_time: item.scheduled_time || null,
    status: item.status || "Scheduled",
    image_url: resolvedImage,
    image: resolvedImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop",
    media: resolvedImage,
    media_url: resolvedImage,
  };
}

/**
 * GET /posts/ : Fetch all posts from the live FastAPI backend
 */
export async function getPosts(campaignId = null) {
  const params = {};
  if (campaignId !== null && campaignId !== undefined && campaignId !== "") {
    params.campaign_id = Number(campaignId);
  }

  const response = await client.get("/posts/", { params });
  const rawList = response.data?.data || response.data?.items || (Array.isArray(response.data) ? response.data : []);

  const normalized = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = normalizePost(rawList[i]);
    if (item) {
      normalized.push(item);
    }
  }
  return normalized;
}

/**
 * Alias for getPosts
 */
export async function listPosts(params = {}) {
  const items = await getPosts(params.campaign_id || params.campaignId);
  return { items, total: items.length };
}

/**
 * GET /posts/{id} : Fetch single post
 */
export async function getPost(id) {
  const response = await client.get(`/posts/${id}`);
  const data = response.data?.data || response.data?.post || response.data;
  return normalizePost(data);
}

/**
 * POST /posts/ : Create a scheduled post on the live FastAPI backend
 */
export async function createPost(payload) {
  let platformStr = "Instagram";
  if (Array.isArray(payload.platforms) && payload.platforms.length > 0) {
    platformStr = payload.platforms.join(", ");
  } else if (typeof payload.platform === "string" && payload.platform.trim().length > 0) {
    platformStr = payload.platform;
  }

  const imgData = payload.image_url || payload.image || payload.media || payload.media_url || payload.mediaFile || null;

  const backendPayload = {
    content: payload.content || "",
    title: payload.title || (payload.content ? payload.content.slice(0, 50) : "Untitled Post"),
    platforms: platformStr,
    platform: platformStr,
    scheduled_date: payload.scheduled_date || (payload.scheduledAt ? payload.scheduledAt.split("T")[0] : (payload.scheduleDate || null)),
    scheduled_time: payload.scheduled_time || (payload.scheduledAt ? payload.scheduledAt.split("T")[1] : (payload.scheduleTime || null)),
    status: payload.status || "Scheduled",
    campaign_id: payload.campaign_id || payload.campaignId ? Number(payload.campaign_id || payload.campaignId) : null,
    image_url: imgData,
    image: imgData,
    media: imgData,
    media_url: imgData,
    mediaFile: imgData,
  };

  console.log("Submitting Post Payload to /posts/:", {
    ...backendPayload,
    image_url_length: imgData ? imgData.length : 0
  });

  const response = await client.post("/posts/", backendPayload);
  const created = response.data?.data || response.data?.post || response.data;
  return normalizePost(created);
}

/**
 * PUT /posts/{id} : Update post
 */
export async function updatePost(id, payload) {
  let platformStr = "Instagram";
  if (Array.isArray(payload.platforms) && payload.platforms.length > 0) {
    platformStr = payload.platforms.join(", ");
  } else if (typeof payload.platform === "string" && payload.platform.trim().length > 0) {
    platformStr = payload.platform;
  }

  const imgData = payload.image_url || payload.image || payload.media || payload.media_url || payload.mediaFile || null;

  const backendPayload = {
    content: payload.content || payload.fullText || "",
    title: payload.title || "Untitled Post",
    platforms: platformStr,
    platform: platformStr,
    scheduled_date: payload.scheduled_date || payload.date || null,
    scheduled_time: payload.scheduled_time || payload.time || null,
    status: payload.status || "Scheduled",
    campaign_id: payload.campaign_id || payload.campaignId ? Number(payload.campaign_id || payload.campaignId) : null,
  };

  if (imgData) {
    backendPayload.image_url = imgData;
    backendPayload.image = imgData;
    backendPayload.media = imgData;
    backendPayload.media_url = imgData;
  }

  const response = await client.put(`/posts/${id}`, backendPayload);
  const updated = response.data?.data || response.data?.post || response.data;
  return normalizePost(updated);
}

/**
 * DELETE /posts/{id} : Delete post
 */
export async function deletePost(id) {
  const response = await client.delete(`/posts/${id}`);
  return response.data;
}

/**
 * POST /posts/{id}/retry (or status update to Published)
 */
export async function retryPost(id) {
  return updatePost(id, { status: "Published" });
}