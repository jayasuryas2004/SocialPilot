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

function OAuthSyncLoader({ syncingPlatform }) {
  const orbitingIcons = [
    { src: "/images/facebook.svg", label: "Facebook", delay: "0s", angle: 0 },
    { src: "/images/linkedin.svg", label: "LinkedIn", delay: "0.8s", angle: 51 },
    { src: "/images/instagram.svg", label: "Instagram", delay: "1.6s", angle: 102 },
    { src: "/images/x-twitter.svg", label: "Twitter", delay: "2.4s", angle: 154 },
    { src: "/images/youtube.svg", label: "YouTube", delay: "3.2s", angle: 205 },
    { src: "/images/pinterest.svg", label: "Pinterest", delay: "4.0s", angle: 257 },
    { src: "/images/reddit.svg", label: "Reddit", delay: "4.8s", angle: 308 },
  ];

  const renderedOrbitIcons = [];
  for (let i = 0; i < orbitingIcons.length; i = i + 1) {
    const item = orbitingIcons[i];
    const angleRad = (item.angle * Math.PI) / 180;
    const radius = 95;
    const x = Math.round(Math.cos(angleRad) * radius);
    const y = Math.round(Math.sin(angleRad) * radius);

    renderedOrbitIcons.push(
      <div
        key={`orbit-icon-${item.label}-${i}`}
        className="absolute w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center p-2 animate-pulse"
        style={{
          transform: `translate(${x}px, ${y}px)`,
          animationDelay: item.delay,
        }}
      >
        <Image
          src={item.src}
          alt={item.label}
          width={24}
          height={24}
          className="object-contain drop-shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center max-w-md w-full mx-4 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Antigravity Orbit Animation Stage */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* Animated Orbit Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-300/50 dark:border-purple-600/30 animate-[spin_24s_linear_infinite]" />
          <div className="absolute inset-6 rounded-full border border-blue-300/40 dark:border-blue-500/20 animate-[spin_16s_linear_infinite_reverse]" />

          {/* Orbiting Icons */}
          {renderedOrbitIcons}

          {/* Center Brand Logo with Glowing Pulse */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#311b92] to-[#5b21b6] p-3 shadow-2xl flex items-center justify-center border-2 border-white/60 dark:border-purple-400/40 animate-bounce">
            <Image
              src="/images/logo.svg"
              alt="SocialPilot Logo"
              width={44}
              height={44}
              className="object-contain drop-shadow-md brightness-200 contrast-200"
            />
          </div>
        </div>

        {/* Status Text */}
        <div className="mt-4 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
            <span>{syncingPlatform ? `${syncingPlatform} Account` : "OAuth Syncing"}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Securely syncing your social accounts...
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Verifying permissions and pulling fresh connection tokens from the vault.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConnectAccountsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialIsSyncing =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("status") === "success"
      : false;

  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [liveAccounts, setLiveAccounts] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(initialIsSyncing);
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
      for (let i = 0; i < safeAccs.length; i = i + 1) {
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

          let alreadyPresent = false;
          for (let j = 0; j < liveIds.length; j = j + 1) {
            if (liveIds[j] === p) {
              alreadyPresent = true;
              break;
            }
          }
          if (!alreadyPresent) {
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
    let isCancelled = false;

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

    const handleOAuthSync = async () => {
      if (statusParam === "success") {
        setIsSyncing(true);
        setSyncingPlatform(platformParam ? platformParam.toUpperCase() : "Social");

        try {
          await loadLiveConnections(true);
        } catch (err) {
          console.warn("OAuth sync error:", err);
        } finally {
          if (!isCancelled) {
            setIsSyncing(false);
            setSyncingPlatform(null);
            // Execute URL cleanup only after the fresh data resolves
            if (typeof window !== "undefined") {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          }
        }
      } else if (statusParam === "error") {
        setOauthFeedback({
          type: "error",
          message:
            messageParam ||
            "Failed to connect social account. Please try again or check OAuth permissions.",
        });
        await loadLiveConnections(true);
        if (typeof window !== "undefined") {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } else {
        await loadLiveConnections(true);
      }
    };

    handleOAuthSync();

    return () => {
      isCancelled = true;
    };
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    if (platformId === "facebook" || platformId === "instagram") {
      let url = `${apiBase}/api/social/facebook/login`;
      if (userId) {
        url += `?user_id=${userId}`;
      } else if (token) {
        url += `?token=${token}`;
      }
      return url;
    }

    if (platformId === "linkedin") {
      let url = `${apiBase}/oauth/linkedin/login?redirect=true`;
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
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center pt-8 px-4 relative">
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

      {isSyncing ? (
        <OAuthSyncLoader syncingPlatform={syncingPlatform} />
      ) : (
        <div className="w-full max-w-4xl animate-in fade-in duration-300">
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

          {/* Feedback Alert if OAuth error returned */}
          {oauthFeedback && oauthFeedback.type === "error" && (
            <div className="mb-6 p-4 rounded-xl flex items-center justify-between text-sm font-medium bg-red-50 text-red-800 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
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
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
              <span>Connected accounts</span>
              <span className="text-[#5b21b6]">
                {connectedList.length} of {TOTAL_PLATFORMS} connected
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] rounded-full transition-all duration-500"
                style={{
                  width: `${(connectedList.length / TOTAL_PLATFORMS) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Connected Accounts Section */}
          {connectedList.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Connected ({connectedList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedList.map((platform) => {
                  const acc = liveAccounts.find(
                    (a) =>
                      (a.platform || a.platform_name || "").toLowerCase() ===
                      platform.id.toLowerCase()
                  );
                  return (
                    <div
                      key={platform.id}
                      className="group relative p-4 rounded-2xl bg-white border-2 border-emerald-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 flex-shrink-0">
                          <Image
                            src={platform.src}
                            alt={platform.name}
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {platform.name}
                            </p>
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500 flex-shrink-0"
                            />
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {acc?.account_name ||
                              acc?.display_name ||
                              acc?.handle ||
                              acc?.platform_user_id ||
                              "Connected"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDisconnectClick(e, platform)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex-shrink-0"
                        title="Disconnect"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available to Connect Section */}
          {unconnectedList.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Available to Connect ({unconnectedList.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unconnectedList.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => handlePlatformClick(platform)}
                    className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#5b21b6]/40 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-purple-50/50 flex items-center justify-center p-2 border border-slate-100 transition-colors flex-shrink-0">
                        <Image
                          src={platform.src}
                          alt={platform.name}
                          width={24}
                          height={24}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#5b21b6] transition-colors">
                          {platform.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {platform.description}
                        </p>
                      </div>
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
      )}

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
