import client, { USE_MOCK } from "./client";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const mockCampaigns = [
  { id: "1", name: "Summer collection", platform: "Instagram + Facebook", budget: "5000", status: "active" },
  { id: "2", name: "Back to school", platform: "LinkedIn", budget: "3200", status: "scheduled" },
];

export async function listCampaigns(params = {}) {
  if (USE_MOCK) { await delay(500); return { items: mockCampaigns, total: mockCampaigns.length }; }
  const { data } = await client.get("/campaigns", { params });
  return data;
}

export async function getCampaign(id) {
  if (USE_MOCK) { await delay(300); return mockCampaigns.find((c) => c.id === id); }
  const { data } = await client.get(`/campaigns/${id}`);
  return data;
}

export async function createCampaign(payload) {
  if (USE_MOCK) { await delay(400); return { id: crypto.randomUUID(), ...payload, status: "draft" }; }
  const { data } = await client.post("/campaigns", payload);
  return data;
}

export async function updateCampaign(id, payload) {
  if (USE_MOCK) { await delay(300); return { id, ...payload }; }
  const { data } = await client.patch(`/campaigns/${id}`, payload);
  return data;
}

export async function deleteCampaign(id) {
  if (USE_MOCK) { await delay(200); return; }
  await client.delete(`/campaigns/${id}`);
}