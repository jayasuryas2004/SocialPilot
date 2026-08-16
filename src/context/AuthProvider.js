"use client";

import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import { setSession, getToken, getUser, clearSession } from "@/lib/auth/session";

// Create React Context for global authentication state
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate existing session on client-side component mount
  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    // If both token and user profile exist, restore the authenticated state
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Handle user login: call backend API, store JWT session, and update state
   */
  const login = async (email, password) => {
    const data = await authApi.login(email, password);

    // Save token and user in cookie & localStorage if a token was returned
    if (data?.token) {
      setSession(data.token, data.user);
    }
    setUser(data?.user || null);

    return data;
  };

  /**
   * Handle user registration: call backend API and store session if token is provided
   */
  const register = async (payload) => {
    const data = await authApi.register(payload);

    // If backend returns an active token immediately upon registration, persist it
    if (data?.token) {
      setSession(data.token, data.user);
      setUser(data?.user || null);
    }

    return data;
  };

  /**
   * Handle user logout: clear session storage, reset state, and redirect to login
   */
  const logout = () => {
    clearSession();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to consume the AuthContext
export const useAuthContext = () => useContext(AuthContext);