"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/common/Loader";

// Belt-and-suspenders alongside middleware.js: middleware blocks the request
// server-side, this catches the case where auth state changes client-side
// (e.g. token expires mid-session) without a full page reload.
export default function ProtectedRoute({ children, requireFeature }) {
  const { isAuthenticated, loading, can } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  if (loading) return <Loader label="Checking session..." />;
  if (!isAuthenticated) return null;
  if (requireFeature && !can(requireFeature)) {
    return <p className="p-6 text-sm text-gray-500">You don't have access to this page.</p>;
  }
  return children;
}