"use client";
import { useAuthContext } from "@/context/AuthProvider";
import { canAccess } from "@/lib/auth/roles";

export function useAuth() {
  const { user, loading, login, register, logout, isAuthenticated } = useAuthContext();
  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    role: user?.role,
    can: (feature) => canAccess(user?.role, feature),
  };
}