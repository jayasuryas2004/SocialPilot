"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  QrCode, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import axios from "axios";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("admin");
  const [totpCode, setTotpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    qr_code?: string;
    secret?: string;
    provisioning_uri?: string;
    username?: string;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // If already authenticated, redirect straight to /socialpilot_admin
  useEffect(() => {
    try {
      const token = localStorage.getItem("admin_sp_token");
      if (token) {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const payloadJson = JSON.parse(atob(payloadBase64));
          if (payloadJson.role === "super_admin" || payloadJson.role === "admin") {
            router.replace("/socialpilot_admin");
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [router]);

  // Fetch QR Code for First-Time Setup
  const handleLoadQrCode = async () => {
    setShowQrModal(true);
    if (qrData) return;

    setQrLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/admin/auth/setup-qr`);
      setQrData(res.data);
    } catch (err: any) {
      console.error("Failed to load QR code:", err);
      setErrorMessage("Could not load Authenticator QR Code. Check backend connectivity.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanCode = totpCode.trim().replace(/\s+/g, "");
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage("Please enter a valid 6-digit Google Authenticator code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/api/admin/auth/login`, {
        username: username.trim(),
        totp_code: cleanCode
      });

      const token = res.data.token || res.data.access_token;
      if (!token) {
        throw new Error("No token returned by server");
      }

      // Store elevated admin token
      localStorage.setItem("admin_sp_token", token);
      
      // Navigate to admin portal
      router.replace("/socialpilot_admin");
    } catch (err: any) {
      console.error("Admin login error:", err);
      const detail = err.response?.data?.detail || "Authentication failed. Invalid username or TOTP code.";
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] dark:bg-[#0d0a17] text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#161224]/90 backdrop-blur-xl border border-slate-200 dark:border-purple-900/40 rounded-[32px] p-8 shadow-xl dark:shadow-2xl shadow-purple-950/20 relative z-10 space-y-6">
        
        {/* SocialPilot Prominent Logo Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center mb-1">
            <img
              src="/images/logo.svg"
              alt="SocialPilot Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#260b79] dark:text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800/60">
            <ShieldCheck size={13} className="text-purple-600 dark:text-purple-400" />
            <span>Super Admin Control Vault</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Admin Authentication
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Two-Factor TOTP Authenticator Verification (RFC 6238)
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* Admin Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Admin Username</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Super Admin Account</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-purple-900/40 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* 6-Digit Google Authenticator TOTP Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Google Authenticator Code</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">6-Digit Rolling Code</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                required
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-purple-900/40 text-center tracking-[0.35em] text-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <KeyRound size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || totpCode.length < 6}
            className="w-full py-3.5 rounded-2xl bg-[#260b79] hover:bg-[#1e0861] dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying TOTP Key...</span>
              </>
            ) : (
              <>
                <span>Authorize & Unlock Vault</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

        </form>

        {/* QR Code Setup Trigger Option */}
        <div className="pt-3 border-t border-slate-100 dark:border-purple-900/30 text-center flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleLoadQrCode}
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors cursor-pointer"
          >
            <QrCode size={14} />
            <span>First-time setup? Scan Authenticator QR</span>
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronLeft size={13} />
            <span>Return to User Login</span>
          </Link>
        </div>

      </div>

      {/* QR Code Setup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#161224] border border-slate-200 dark:border-purple-900/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/30 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Google Authenticator Setup</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Scan using Authenticator App</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {qrLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Generating Secure QR Code...</p>
              </div>
            ) : qrData ? (
              <div className="space-y-4">
                
                {/* QR Code Image */}
                <div className="p-3 bg-white rounded-2xl inline-block shadow-md border border-slate-200/80 dark:border-none">
                  {qrData.qr_code && (
                    <img 
                      src={qrData.qr_code} 
                      alt="Google Authenticator QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  )}
                </div>

                {/* Secret Key Manual Entry */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-purple-900/40 text-left space-y-1">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Manual Secret Key</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono font-black text-purple-700 dark:text-purple-300 truncate">
                      {qrData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 text-purple-700 dark:text-purple-300 transition-colors shrink-0 cursor-pointer"
                      title="Copy Secret"
                    >
                      {copiedSecret ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Open <strong>Google Authenticator</strong> (or 1Password/Authy), tap <strong>+</strong>, scan the QR code above, and enter the generated 6-digit code to log in.
                </p>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#260b79] dark:bg-purple-600 hover:bg-[#1e0861] dark:hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  I have scanned the code
                </button>

              </div>
            ) : (
              <p className="text-xs text-rose-500">Failed to load QR code.</p>
            )}

          </div>
        </div>
      )}

      {/* Safety Notice Bottom Banner */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 max-w-sm">
        Protected Administrative Zone • Unauthorized access attempts are monitored and recorded.
      </div>

    </div>
  );
}
