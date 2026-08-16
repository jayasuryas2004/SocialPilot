import client, { USE_MOCK } from "./client";

// Helper utility to simulate network latency in mock mode
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Perform login request by sending credentials to the FastAPI backend.
 * Endpoint: POST http://127.0.0.1:8000/auth/login
 * Payload: { email, password }
 */
export async function login(email, password) {
  // If mock mode is enabled, return mock user data
  if (USE_MOCK) {
    await delay(500);
    return {
      token: "mock-jwt-token",
      user: { id: "u1", name: "James Okonkwo", email: email, role: "creator" },
    };
  }

  // Send login POST request with JSON credentials
  const response = await client.post("/auth/login", {
    email: email,
    password: password,
  });

  const responseData = response.data;

  // Extract JWT token from FastAPI response (supports access_token or token)
  const token = responseData?.access_token || responseData?.token || responseData?.data?.token || responseData?.data?.access_token || null;

  // Extract user profile object if available
  const user = responseData?.user || responseData?.data?.user || { email: email };

  return {
    ...responseData,
    token: token,
    user: user,
  };
}

/**
 * Perform user registration by sending registration data to the FastAPI backend.
 * Endpoint: POST http://127.0.0.1:8000/auth/register
 * Payload: { name, email, password, role }
 */
export async function register(payload) {
  // If mock mode is enabled, return mock user data
  if (USE_MOCK) {
    await delay(500);
    return {
      token: "mock-jwt-token",
      user: { id: "u1", ...payload },
    };
  }

  // Construct standard registration payload
  const registrationData = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || "creator",
  };

  // Send registration POST request with JSON payload
  const response = await client.post("/auth/register", registrationData);
  const responseData = response.data;

  // Extract token if backend immediately issues one upon registration
  const token = responseData?.access_token || responseData?.token || responseData?.data?.token || null;

  // Extract user details from response or fall back to submitted information
  const user = responseData?.user || responseData?.data?.user || {
    name: payload.name,
    email: payload.email,
    role: payload.role || "creator",
  };

  return {
    ...responseData,
    token: token,
    user: user,
  };
}

/**
 * Send password reset request email
 */
export async function forgotPassword(email) {
  if (USE_MOCK) {
    await delay(400);
    return { success: true };
  }
  const response = await client.post("/auth/forgot-password", { email: email });
  return response.data;
}

/**
 * Reset password using verification token
 */
export async function resetPassword(token, newPassword) {
  if (USE_MOCK) {
    await delay(400);
    return { success: true };
  }
  const response = await client.post("/auth/reset-password", {
    token: token,
    newPassword: newPassword,
  });
  return response.data;
}

/**
 * Fetch current authenticated user profile
 */
export async function getCurrentUser() {
  if (USE_MOCK) {
    await delay(300);
    return { id: "u1", name: "James Okonkwo", email: "james@company.com", role: "creator" };
  }
  const response = await client.get("/auth/me");
  return response.data;
}

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return `${API_URL}/auth/google`;
}

/**
 * Trigger Google OAuth sign-in redirect
 */
export function signInWithGoogle() {
  if (typeof window !== "undefined") {
    window.location.href = getGoogleAuthUrl();
  }
}