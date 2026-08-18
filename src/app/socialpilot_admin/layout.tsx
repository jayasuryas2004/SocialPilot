"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Activity, 
  Server, 
  Users, 
  Sliders, 
  Sun, 
  Moon, 
  ExternalLink,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useAppTheme } from "@/context/ThemeProvider";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme, mounted } = useAppTheme();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(null);

  const isLoginPage = pathname === "/socialpilot_admin/login";

  useEffect(() => {
    // If on the dedicated login page, skip authentication redirect check
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    try {
      const token = localStorage.getItem("admin_sp_token");
      if (!token) {
        setIsAuthenticated(false);
        router.replace("/socialpilot_admin/login");
        return;
      }

      // Basic payload decoding to verify admin role
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) {
        throw new Error("Invalid token format");
      }
      const payloadJson = JSON.parse(atob(payloadBase64));

      // Check token expiration
      if (payloadJson.exp && payloadJson.exp * 1000 < Date.now()) {
        localStorage.removeItem("admin_sp_token");
        setIsAuthenticated(false);
        router.replace("/socialpilot_admin/login");
        return;
      }

      // Check elevated role
      if (payloadJson.role !== "super_admin" && payloadJson.role !== "admin") {
        localStorage.removeItem("admin_sp_token");
        setIsAuthenticated(false);
        router.replace("/socialpilot_admin/login");
        return;
      }

      setAdminUser({
        username: payloadJson.username || "Super Admin",
        role: payloadJson.role || "super_admin"
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Admin authentication check failed:", err);
      localStorage.removeItem("admin_sp_token");
      setIsAuthenticated(false);
      router.replace("/socialpilot_admin/login");
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_sp_token");
    router.replace("/socialpilot_admin/login");
  };

  // Dedicated unauthenticated login view
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authentication validation state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-purple-400 absolute -bottom-2 -right-2" />
        </div>
        <p className="text-sm font-bold text-slate-400 tracking-wider uppercase">
          Verifying Admin Security Clearance...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0d0b14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Specialized Admin Security Topbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#130f1f]/90 backdrop-blur-md border-b border-slate-200 dark:border-purple-900/30 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Security Badge */}
          <div className="flex items-center gap-3.5">
            <Link href="/socialpilot_admin" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/images/logo.svg"
                alt="SocialPilot Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-purple-900/40 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-[#260b79] dark:text-purple-300">
                  Admin Portal
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-[#260b79] dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800/50">
                  <ShieldCheck size={11} className="text-purple-600 dark:text-purple-400" /> Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden sm:block">
                TOTP Authenticated Security Control Plane
              </p>
            </div>
          </div>

          {/* Right Action Center */}
          <div className="flex items-center gap-3">
            
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Engines Online</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {mounted && isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Main App Link */}
            <Link
              href="/dashboard"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              <span>User App</span>
              <ExternalLink size={13} />
            </Link>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {adminUser?.username || "Admin"}
                </p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                  Super Admin
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition-colors cursor-pointer"
                title="Log out of Super Admin"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>

      {/* Admin Isolated Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 px-8 text-center text-xs text-slate-500 dark:text-slate-500">
        SocialPilot Isolated Administrative Control System • Zero User App Side-Effects
      </footer>

    </div>
  );
}
