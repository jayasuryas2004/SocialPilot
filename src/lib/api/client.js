import axios from "axios";
import { getToken, clearSession } from "@/lib/auth/session";

// Base URL for API requests, defaulting to the local FastAPI backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Flag to switch between live API calls and mock responses
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Create configured Axios client instance
const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token to headers if available
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle session expiration and normalize error responses
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the request failed with a 401 Unauthorized status
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

      // Only redirect for protected routes, not when attempting to login or register
      if (!isAuthEndpoint) {
        clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

// Helper function to extract user-friendly error messages from FastAPI responses
function normalizeError(error) {
  const data = error.response?.data;
  let message = "Something went wrong. Please try again.";

  // FastAPI returns errors under the 'detail' property
  if (typeof data?.detail === "string") {
    message = data.detail;
  } else if (Array.isArray(data?.detail)) {
    // When FastAPI returns Pydantic validation error lists, extract error messages
    const messages = [];
    for (let i = 0; i < data.detail.length; i++) {
      const item = data.detail[i];
      if (item?.msg) {
        messages.push(item.msg);
      }
    }
    if (messages.length > 0) {
      message = messages.join(", ");
    }
  } else if (data?.message) {
    message = data.message;
  } else if (error.response?.status === 401) {
    message = "Invalid credentials. Please check your email and password.";
  } else if (error.code === "ERR_NETWORK" || !error.response) {
    message = "Backend service connecting...";
  } else if (error.message) {
    message = error.message;
  }

  return {
    ...error,
    message,
    status: error.response?.status || 0,
  };
}

export default client;