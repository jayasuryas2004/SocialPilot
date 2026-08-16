"use client";
import { useMemo } from "react";
import { useAuthContext } from "@/context/AuthProvider";
import { canAccess } from "@/lib/auth/roles";

export function useAuth() {
  const context = useAuthContext();
  const { user, loading, login, register, logout, isAuthenticated, setUser } = context;

  return useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    setUser,
    role: user?.role,
    can: (feature) => canAccess(user?.role, feature),
  }), [user, loading, login, register, logout, isAuthenticated, setUser]);
}