import client, { USE_MOCK } from "./client";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password) {
  if (USE_MOCK) {
    await delay(500);
    return {
      token: "mock-jwt-token",
      user: { id: "u1", name: "James Okonkwo", email, role: "creator" },
    };
  }
  const { data } = await client.post("/auth/login", { email, password });
  return data;
}

export async function register(payload) {
  if (USE_MOCK) {
    await delay(500);
    return { token: "mock-jwt-token", user: { id: "u1", ...payload } };
  }
  const { data } = await client.post("/auth/register", payload);
  return data;
}

export async function forgotPassword(email) {
  if (USE_MOCK) {
    await delay(400);
    return { success: true };
  }
  const { data } = await client.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token, newPassword) {
  if (USE_MOCK) {
    await delay(400);
    return { success: true };
  }
  const { data } = await client.post("/auth/reset-password", { token, newPassword });
  return data;
}

export async function getCurrentUser() {
  if (USE_MOCK) {
    await delay(300);
    return { id: "u1", name: "James Okonkwo", email: "james@company.com", role: "creator" };
  }
  const { data } = await client.get("/auth/me");
  return data;
}

export function getGoogleAuthUrl() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${API_URL}/auth/google`;
}

export function signInWithGoogle() {
  window.location.href = getGoogleAuthUrl();
}