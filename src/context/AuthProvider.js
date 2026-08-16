"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import * as authApi from "@/lib/api/auth";
import { setSession, getToken, getUser, clearSession } from "@/lib/auth/session";

// Create React Context for global authentication state
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate existing session strictly once on client-side mount
  useEffect(() => {
    try {
      const token = getToken();
      const storedUser = getUser();

      // If token and user profile exist, restore authenticated user
      if (token && storedUser) {
        setUser(storedUser);
      }
    } catch (err) {
      console.error("Session rehydration error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle user login: call backend API, store JWT session, and update state
   */
  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);

    // Save token and user in cookie & localStorage if a token was returned
    if (data?.token) {
      setSession(data.token, data.user);
    }
    setUser(data?.user || null);

    return data;
  }, []);

  /**
   * Handle user registration: call backend API and store session if token is provided
   */
  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);

    // If backend returns an active token immediately upon registration, persist it
    if (data?.token) {
      setSession(data.token, data.user);
      setUser(data?.user || null);
    }

    return data;
  }, []);

  /**
   * Handle user logout: clear session storage, reset state, and redirect to login
   */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  // Memoize context value to avoid unnecessary re-renders across the component tree
  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    setUser,
  }), [user, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to consume the AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      isAuthenticated: false,
      setUser: () => {},
    };
  }
  return context;
};