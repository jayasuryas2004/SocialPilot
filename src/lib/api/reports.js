import client from "./client";

export const USE_MOCK = false;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listReports(params = {}) {
  try {
    const { data } = await client.get("/api/reports", { params });
    const items = data?.items || (Array.isArray(data) ? data : []);
    const total = data?.total !== undefined ? data.total : items.length;
    return { items, total, kpis: data?.kpis };
  } catch (err) {
    try {
      const { data } = await client.get("/reports", { params });
      const items = data?.items || (Array.isArray(data) ? data : []);
      const total = data?.total !== undefined ? data.total : items.length;
      return { items, total, kpis: data?.kpis };
    } catch (e) {
      console.error("Live reports fetch error:", e);
      return { items: [], total: 0, kpis: {} };
    }
  }
}

export async function generateReport(payload) {
  try {
    const { data } = await client.post("/api/reports/generate", payload);
    return data;
  } catch (err) {
    try {
      const { data } = await client.post("/reports/generate", payload);
      return data;
    } catch (e) {
      const { data } = await client.post("/reports", payload);
      return data;
    }
  }
}

export async function deleteReport(id) {
  try {
    await client.delete(`/api/reports/${id}`);
  } catch (err) {
    await client.delete(`/reports/${id}`);
  }
}

export async function bulkDeleteReports(ids) {
  try {
    await client.post("/api/reports/bulk-delete", { ids });
  } catch (err) {
    await client.post("/reports/bulk-delete", { ids });
  }
}

export async function listScheduledReports() {
  try {
    const { data } = await client.get("/api/reports/scheduled");
    return data;
  } catch (err) {
    const { data } = await client.get("/reports/scheduled");
    return data;
  }
}

export async function toggleScheduledReport(id, enabled) {
  try {
    const { data } = await client.patch(`/api/reports/scheduled/${id}`, { enabled });
    return data;
  } catch (err) {
    const { data } = await client.patch(`/reports/scheduled/${id}`, { enabled });
    return data;
  }
}