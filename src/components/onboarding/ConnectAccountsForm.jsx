"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, Loader2, X, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAccounts, disconnectAccount } from "@/lib/api/accounts";
import { getUser, getToken } from "@/lib/auth/session";

const platformsData = [
  {
    id: "facebook",
    name: "Facebook",
    src: "/images/facebook.svg",
    permissions: ["Publish to Pages and Groups", "Read page analytics"],
  },
  {
    id: "instagram",
    name: "Instagram",
    src: "/images/instagram.svg",
    permissions: ["Publish photos, reels & stories", "Read engagement metrics"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    src: "/images/linkedin.svg",
    permissions: ["Post on your Company Page", "Read follower analytics"],
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    src: "/images/x-twitter.svg",
    permissions: ["Publish posts and threads", "Read account analytics"],
  },
  {
    id: "youtube",
    name: "YouTube",
    src: "/images/youtube.svg",
    permissions: ["Upload videos and shorts", "Read channel analytics"],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    src: "/images/pinterest.svg",
    permissions: ["Create and schedule pins", "Read board analytics"],
  },
  {
    id: "reddit",
    name: "Reddit",
    src: "/images/reddit.svg",
    permissions: ["Post to your subreddits", "Read post & comment analytics"],
  },
];

const TOTAL_PLATFORMS = platformsData.length;

export default function ConnectAccountsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [liveAccounts, setLiveAccounts] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [platformToDisconnect, setPlatformToDisconnect] = useState(null);
  const [oauthFeedback, setOauthFeedback] = useState(null);

  const loadLiveConnections = useCallback(async (forceRefresh = false) => {
    try {
      const accounts = await fetchAccounts(forceRefresh);
      const safeAccs = Array.isArray(accounts) ? accounts : [];
      setLiveAccounts(safeAccs);

      const liveIds = [];
      for (let i = 0; i < safeAccs.length; i++) {
        const acc = safeAccs[i];
        const rawPlatform = acc?.platform || acc?.platform_name || acc?.name;
        if (rawPlatform && (acc.status || "connected") === "connected") {
          let p = rawPlatform.toLowerCase().trim();
          if (p === "meta" || p === "fb") p = "facebook";
          if (p === "li") p = "linkedin";
          if (p === "ig") p = "instagram";
          if (p === "x" || p === "twitter") p = "twitter";
          if (p === "yt") p = "youtube";
          if (p === "pin") p = "pinterest";

          if (!liveIds.includes(p)) {
            liveIds.push(p);
          }
        }
      }
      setConnectedPlatforms(liveIds);
      return safeAccs;
    } catch (err) {
      console.warn("Could not load live connections:", err);
      setConnectedPlatforms([]);
      setLiveAccounts([]);
      return [];
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Sync state and OAuth callback interceptor
  useEffect(() => {
    const statusParam =
      searchParams?.get("status") ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("status")
        : null);
    const platformParam =
      searchParams?.get("platform") ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("platform")
        : null);
    const messageParam =
      searchParams?.get("message") ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("message")
        : null);

    if (statusParam === "success") {
      // 1. Instantly trigger sync loading state
      setIsSyncing(true);
      setSyncingPlatform(platformParam ? platformParam.toUpperCase() : "Account");

      // 2. Add 750ms debounce to allow backend database transaction to settle, then force cache-busted fetch
      const syncTimer = setTimeout(async () => {
        await loadLiveConnections(true);
        setIsSyncing(false);
        setSyncingPlatform(null);
        setOauthFeedback({
          type: "success",
          message: `Successfully connected and verified your ${platformParam ? platformParam.toUpperCase() : "social"} account!`,
        });

        // 3. Clean URL query parameters seamlessly
        if (typeof window !== "undefined") {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }, 750);

      return () => clearTimeout(syncTimer);
    } else if (statusParam === "error") {
      setOauthFeedback({
        type: "error",
        message:
          messageParam ||
          "Failed to connect social account. Please try again or check OAuth permissions.",
      });
      loadLiveConnections(false);
      if (typeof window !== "undefined") {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } else {
      loadLiveConnections(false);
    }
  }, [searchParams, loadLiveConnections]);

  // Derived boolean states based strictly on live API response
  const isFbConnected = liveAccounts.some(
    (acc) =>
      (acc.platform || acc.platform_name || "").toLowerCase() === "facebook" ||
      (acc.platform || acc.platform_name || "").toLowerCase() === "fb"
  );
  const isLiConnected = liveAccounts.some(
    (acc) =>
      (acc.platform || acc.platform_name || "").toLowerCase() === "linkedin" ||
      (acc.platform || acc.platform_name || "").toLowerCase() === "li"
  );
  const isIgConnected = liveAccounts.some(
    (acc) =>
      (acc.platform || acc.platform_name || "").toLowerCase() === "instagram" ||
      (acc.platform || acc.platform_name || "").toLowerCase() === "ig"
  );
  const isXConnected = liveAccounts.some((acc) =>
    ["x", "twitter", "x-twitter"].includes(
      (acc.platform || acc.platform_name || "").toLowerCase()
    )
  );
  const isYtConnected = liveAccounts.some(
    (acc) =>
      (acc.platform || acc.platform_name || "").toLowerCase() === "youtube" ||
      (acc.platform || acc.platform_name || "").toLowerCase() === "yt"
  );
  const isPinConnected = liveAccounts.some(
    (acc) =>
      (acc.platform || acc.platform_name || "").toLowerCase() === "pinterest" ||
      (acc.platform || acc.platform_name || "").toLowerCase() === "pin"
  );
  const isRedditConnected = liveAccounts.some(
    (acc) =>
      (acc.platform || acc.platform_name || "").toLowerCase() === "reddit"
  );

  const getIsPlatformConnected = (platformId) => {
    const pid = String(platformId).toLowerCase();
    if (pid === "facebook") return isFbConnected;
    if (pid === "linkedin") return isLiConnected;
    if (pid === "instagram") return isIgConnected;
    if (pid === "twitter" || pid === "x") return isXConnected;
    if (pid === "youtube") return isYtConnected;
    if (pid === "pinterest") return isPinConnected;
    if (pid === "reddit") return isRedditConnected;
    return liveAccounts.some(
      (acc) =>
        (acc.platform || acc.platform_name || "").toLowerCase() === pid
    );
  };

  const connectedList = platformsData.filter((p) => getIsPlatformConnected(p.id));
  const unconnectedList = platformsData.filter((p) => !getIsPlatformConnected(p.id));

  const getOAuthUrl = (platformId) => {
    const currentUser = getUser();
    const token = getToken();
    const userId = currentUser?.id || currentUser?.user_id;

    if (platformId === "facebook" || platformId === "instagram") {
      let url = "http://localhost:8000/api/social/facebook/login";
      if (userId) {
        url += `?user_id=${userId}`;
      } else if (token) {
        url += `?token=${token}`;
      }
      return url;
    }

    if (platformId === "linkedin") {
      let url = "http://localhost:8000/oauth/linkedin/login?redirect=true";
      if (userId) {
        url += `&user_id=${userId}`;
      } else if (token) {
        url += `&token=${token}`;
      }
      return url;
    }

    return null;
  };

  const handlePlatformClick = (platform) => {
    if (!platform || getIsPlatformConnected(platform.id)) return;
    const pid = platform.id.toLowerCase();
    const oauthUrl = getOAuthUrl(pid);

    if (oauthUrl) {
      window.location.href = oauthUrl;
      return;
    }

    setSelectedPlatform(platform);
  };

  const handleConnect = async () => {
    if (!selectedPlatform) return;
    const pid = selectedPlatform.id.toLowerCase();
    setIsConnecting(true);

    const oauthUrl = getOAuthUrl(pid);
    if (oauthUrl) {
      window.location.href = oauthUrl;
      return;
    }

    alert(
      `Direct OAuth integration for ${selectedPlatform.name} is coming soon. Please connect Facebook, Instagram, or LinkedIn.`
    );
    setIsConnecting(false);
    setSelectedPlatform(null);
  };

  const handleDisconnectClick = (e, platform) => {
    e.stopPropagation();
    setPlatformToDisconnect(platform);
  };

  const confirmDisconnect = async () => {
    if (!platformToDisconnect) return;
    const targetPlatformId = platformToDisconnect.id.toLowerCase();

    const targetAcc = liveAccounts.find(
      (a) =>
        (a.platform || a.platform_name || "").toLowerCase() === targetPlatformId
    );

    if (targetAcc && targetAcc.id) {
      try {
        await disconnectAccount(targetAcc.id);
      } catch (err) {
        console.warn("Disconnect notice:", err);
      }
    }

    setConnectedPlatforms((prev) =>
      prev.filter((id) => id !== platformToDisconnect.id)
    );
    setPlatformToDisconnect(null);
    await loadLiveConnections(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center pt-8 px-4">
      {/* Brand Header with Logo */}
      <div className="w-full max-w-4xl mb-8 flex items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.svg"
            alt="SocialPilot Logo"
            width={40}
            height={40}
            priority
          />
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            SocialPilot
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-medium mb-8">
          <Link
            href="/register"
            className="text-[#5b21b6] hover:underline cursor-pointer"
          >
            Account
          </Link>
          <span className="text-slate-300">→</span>
          <span className="text-[#5b21b6]">Connect accounts</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400">Dashboard</span>
        </div>

        {/* Syncing Loading Overlay Banner */}
        {isSyncing && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 shadow-sm flex items-center justify-between animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#5b21b6] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  Finalizing {syncingPlatform} Connection
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-200/60 text-purple-800 animate-pulse">
                    Syncing database...
                  </span>
                </h4>
                <p className="text-xs text-purple-700 font-medium mt-0.5">
                  Synchronizing access tokens with your account and updating live connection status.
                </p>
              </div>
            </div>
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin mr-2" />
          </div>
        )}

        {/* Feedback Alert if OAuth redirected back */}
        {oauthFeedback && !isSyncing && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
              oauthFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {oauthFeedback.type === "success" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span>{oauthFeedback.message}</span>
            </div>
            <button
              onClick={() => setOauthFeedback(null)}
              className="text-slate-400 hover:text-slate-600 ml-4 p-1 rounded-md"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Connect your social media accounts
        </h1>
        <p className="text-slate-600 mb-1">
          Link at least one account so we can publish, schedule, and pull
          performance data on your behalf.
        </p>
        <p className="text-slate-400 text-sm mb-10">
          We never see or store your platform password — access is granted
          through each platform&apos;s own secure login screen.
        </p>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-slate-800">
            {connectedList.length} of {TOTAL_PLATFORMS} platforms connected
          </span>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5b21b6] transition-all duration-500 ease-out"
              style={{
                width: `${(connectedList.length / TOTAL_PLATFORMS) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* SECTION 1: CONNECTED ACCOUNTS */}
        {connectedList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Connected Accounts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedList.map((platform) => (
                <div
                  key={platform.id}
                  className="relative flex items-center p-4 rounded-xl border-2 border-[#5b21b6] bg-white shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 mr-4 flex-shrink-0">
                    <Image
                      src={platform.src}
                      alt={platform.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-green-600 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Connected
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDisconnectClick(e, platform)}
                    aria-label={`Disconnect ${platform.name}`}
                    title={`Disconnect ${platform.name}`}
                    className="ml-2 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: AVAILABLE ACCOUNTS */}
        {unconnectedList.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Available Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unconnectedList.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className="relative flex items-center p-4 rounded-xl border border-slate-200 bg-white hover:border-[#5b21b6] hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 mr-4 flex-shrink-0">
                    <Image
                      src={platform.src}
                      alt={platform.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-[#5b21b6] transition-colors">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      Not connected
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-2 flex-shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 group-hover:bg-[#5b21b6] group-hover:text-white group-hover:border-[#5b21b6] transition-all"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 mb-12">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            I&apos;ll do this later
          </Link>
          <button
            onClick={() => router.push("/dashboard")}
            disabled={connectedList.length === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#5b21b6] text-white font-semibold shadow-lg shadow-purple-900/20 hover:bg-[#4c1d95] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue to Dashboard ({connectedList.length}/{TOTAL_PLATFORMS})
          </button>
        </div>
      </div>

      {/* Direct OAuth Pre-Flight Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 shrink-0">
                  <Image
                    src={selectedPlatform.src}
                    alt={selectedPlatform.name}
                    width={28}
                    height={28}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Connect {selectedPlatform.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official API Authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlatform(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-600 mb-4">
                You will be redirected to {selectedPlatform.name} to authorize
                SocialPilot. SocialPilot will request permission to:
              </p>
              <ul className="space-y-2 mb-6">
                {selectedPlatform.permissions?.map((perm, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#5b21b6] text-white hover:bg-[#4c1d95] transition-all"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    "Authorize via OAuth"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {platformToDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Disconnect {platformToDisconnect.name}?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              This will pause scheduled posts for this platform until you reconnect.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPlatformToDisconnect(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
