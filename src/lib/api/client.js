import axios from "axios";
import { getToken, clearSession } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error) {
  const data = error.response?.data;
  let message = "Something went wrong. Please try again.";
  if (typeof data?.detail === "string") message = data.detail;
  else if (Array.isArray(data?.detail)) message = data.detail.map((d) => d.msg).join(", ");
  else if (error.message) message = error.message;
  return { ...error, message, status: error.response?.status };
}

export default client;