import client, { USE_MOCK } from "./client";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const mockPosts = [
  { id: "1", caption: "Summer sale reel", scheduledAt: "2026-05-20T10:00:00", targets: [{ id: "t1", platform: "instagram", status: "published" }] },
  { id: "2", caption: "Product launch teaser", scheduledAt: "2026-05-21T09:00:00", targets: [{ id: "t2", platform: "facebook", status: "scheduled" }] },
  { id: "3", caption: "Behind the scenes", scheduledAt: "2026-05-19T14:00:00", targets: [{ id: "t3", platform: "linkedin", status: "failed" }] },
];

export async function listPosts(params = {}) {
  if (USE_MOCK) { await delay(500); return { items: mockPosts, total: mockPosts.length }; }
  const { data } = await client.get("/posts", { params });
  return data;
}

export async function getPost(id) {
  if (USE_MOCK) { await delay(300); return mockPosts.find((p) => p.id === id); }
  const { data } = await client.get(`/posts/${id}`);
  return data;
}

export async function createPost(payload) {
  if (USE_MOCK) { await delay(400); return { id: crypto.randomUUID(), ...payload, targets: [] }; }
  const { data } = await client.post("/posts", payload);
  return data;
}

export async function updatePost(id, payload) {
  if (USE_MOCK) { await delay(300); return { id, ...payload }; }
  const { data } = await client.patch(`/posts/${id}`, payload);
  return data;
}

export async function deletePost(id) {
  if (USE_MOCK) { await delay(200); return; }
  await client.delete(`/posts/${id}`);
}

export async function retryPost(postTargetId) {
  if (USE_MOCK) { await delay(300); return { id: postTargetId, status: "scheduled" }; }
  const { data } = await client.post(`/post-targets/${postTargetId}/retry`);
  return data;
}