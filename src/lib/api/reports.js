import client, { USE_MOCK } from "./client";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// campaignId values match the mock campaigns in campaigns.js — this is
// what makes the Campaign filter dropdown "real" instead of static text.
const mockReports = [
  { id: "1", name: "May engagement summary", category: "engagement", format: "pdf", size: "3.2 MB", status: "ready", platform: "instagram", campaignId: "1", campaignName: "Summer collection", createdAt: "2026-05-20", fileUrl: "#" },
  { id: "2", name: "Audience growth Q2", category: "audience", format: "excel", size: "1.8 MB", status: "ready", platform: "facebook", campaignId: "1", campaignName: "Summer collection", createdAt: "2026-05-18", fileUrl: "#" },
  { id: "3", name: "Summer campaign ROI", category: "campaign", format: "pdf", size: "2.4 MB", status: "processing", platform: "linkedin", campaignId: "2", campaignName: "Back to school", createdAt: "2026-05-15", fileUrl: "#" },
  { id: "4", name: "Platform reach comparison", category: "platform_comparison", format: "excel", size: "1.1 MB", status: "ready", platform: "x", campaignId: "2", campaignName: "Back to school", createdAt: "2026-05-12", fileUrl: "#" },
  { id: "5", name: "Weekly publishing log", category: "publishing", format: "pdf", size: "0.8 MB", status: "failed", platform: "instagram", campaignId: "1", campaignName: "Summer collection", createdAt: "2026-05-10", fileUrl: "#" },
];

const mockScheduledReports = [
  { id: "1", title: "Weekly engagement digest", frequency: "Every Monday, 9:00 AM", format: "pdf", enabled: true },
];

function applyFilters(reports, params) {
  return reports.filter((r) => {
    if (params.status && params.status !== "all" && r.status !== params.status) return false;
    if (params.platform && params.platform !== "all" && r.platform !== params.platform) return false;
    if (params.campaignId && params.campaignId !== "all" && r.campaignId !== params.campaignId) return false;
    if (params.search) {
      const q = params.search.toLowerCase();
      if (!r.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// Note: category is deliberately NOT filtered here — the page fetches once
// per non-category filter change, then slices by tab client-side. This is
// what makes tab counts ("Engagement (3)") accurate without refetching
// every time you click a different tab.
export async function listReports(params = {}) {
  if (USE_MOCK) {
    await delay(400);
    const filtered = applyFilters(mockReports, params);
    return { items: filtered, total: filtered.length };
  }
  const { data } = await client.get("/reports", { params });
  return data;
}

export async function generateReport(payload) {
  if (USE_MOCK) {
    await delay(300);
    return { id: crypto.randomUUID(), name: `${payload.category} report`, ...payload, status: "processing", createdAt: new Date().toISOString() };
  }
  const { data } = await client.post("/reports", payload);
  return data;
}

export async function deleteReport(id) {
  if (USE_MOCK) { await delay(200); return; }
  await client.delete(`/reports/${id}`);
}

export async function bulkDeleteReports(ids) {
  if (USE_MOCK) { await delay(300); return; }
  await client.post("/reports/bulk-delete", { ids });
}

export async function listScheduledReports() {
  if (USE_MOCK) { await delay(400); return mockScheduledReports; }
  const { data } = await client.get("/reports/scheduled");
  return data;
}

export async function toggleScheduledReport(id, enabled) {
  if (USE_MOCK) { await delay(200); return { id, enabled }; }
  const { data } = await client.patch(`/reports/scheduled/${id}`, { enabled });
  return data;
}