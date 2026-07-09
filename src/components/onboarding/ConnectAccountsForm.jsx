"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
const STORAGE_KEY = "socialpilot_connected_platforms";

export default function ConnectAccounts() {
  const router = useRouter();

  // NOTE: state is initialized identically on server and client (empty array),
  // so the very first render always matches. We load the real, persisted
  // value inside a useEffect (client-only, runs after hydration) — that
  // keeps SSR/CSR markup in sync on first paint and avoids the
  // disabled={true} vs disabled={null} style hydration mismatches, while
  // still restoring the user's connections after a refresh.
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [platformToDisconnect, setPlatformToDisconnect] = useState(null);

  // Restore previously connected platforms after mount (client-only).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setConnectedPlatforms(parsed);
        }
      }
    } catch (err) {
      // Corrupt or inaccessible storage — fall back to the empty default.
      console.warn("Could not read saved connections:", err);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Persist connections whenever they change, but only after the initial
  // load has completed — otherwise we'd overwrite saved data with the
  // empty starting array before it's had a chance to load.
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(connectedPlatforms)
      );
    } catch (err) {
      console.warn("Could not save connections:", err);
    }
  }, [connectedPlatforms, hasLoaded]);

  const connectedList = platformsData.filter((p) =>
    connectedPlatforms.includes(p.id)
  );
  const unconnectedList = platformsData.filter(
    (p) => !connectedPlatforms.includes(p.id)
  );
  const hasConnectedAccounts = connectedPlatforms.length > 0;

  const handlePlatformClick = (platform) => {
    if (connectedPlatforms.includes(platform.id)) return;
    setSelectedPlatform(platform);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setConnectedPlatforms((prev) => [...prev, selectedPlatform.id]);
      setIsConnecting(false);
      setSelectedPlatform(null);
    }, 2000);
  };

  const handleDisconnectClick = (e, platform) => {
    e.stopPropagation();
    setPlatformToDisconnect(platform);
  };

  const confirmDisconnect = () => {
    setConnectedPlatforms((prev) =>
      prev.filter((id) => id !== platformToDisconnect.id)
    );
    setPlatformToDisconnect(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center pt-8 px-4">
      {/* Brand Header with Logo */}
      <div className="w-full max-w-4xl mb-8 flex items-center">
        <div className="flex items-center gap-2">
          <Image
            src="images/logo.svg"
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
            href="/login"
            className="text-[#5b21b6] hover:underline cursor-pointer"
          >
            Account
          </Link>
          <span className="text-slate-300">→</span>
          <span className="text-[#5b21b6]">Connect accounts</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400">Dashboard</span>
        </div>

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
            {connectedPlatforms.length} of {TOTAL_PLATFORMS} platforms
            connected
          </span>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5b21b6] transition-all duration-500 ease-out"
              style={{
                width: `${(connectedPlatforms.length / TOTAL_PLATFORMS) * 100}%`,
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
                    <p className="text-sm text-green-600 flex items-center gap-1">
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

        {/* SECTION 2: AVAILABLE TO CONNECT */}
        {unconnectedList.length > 0 && (
          <div className={connectedList.length > 0 ? "mb-12 pt-2" : "mb-12"}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unconnectedList.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className="relative flex items-center p-4 rounded-xl border-2 border-slate-100 bg-white/60 hover:bg-white hover:border-slate-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 mr-4 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
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
                    <p className="text-sm text-slate-400">Not connected</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-8 pb-12">
          <button
            onClick={() => router.push("/login")}
            className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            Back
          </button>

          {/* Conditional element instead of a disabled attribute keeps server
              and client markup identical on first render, avoiding hydration
              mismatches. */}
          {hasConnectedAccounts ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-lg font-semibold transition-all bg-[#5b21b6] hover:bg-[#4c1d95] text-white shadow-md cursor-pointer"
            >
              Continue to dashboard
            </button>
          ) : (
            <div className="px-6 py-3 rounded-lg font-semibold bg-slate-200 text-slate-400 cursor-not-allowed">
              Continue to dashboard
            </div>
          )}
        </div>
      </div>

      {/* Connection Modal Overlay */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto mb-6">
              <Image
                src={selectedPlatform.src}
                alt={selectedPlatform.name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-slate-500 text-sm mb-1">
              socialpilot.app is requesting access to your
            </p>
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {selectedPlatform.name} account
            </h2>

            <div className="bg-slate-50 rounded-xl p-4 text-left mb-8">
              {selectedPlatform.permissions.map((permission, idx) => (
                <div key={idx} className="flex items-start mb-2 last:mb-0">
                  <Check className="w-4 h-4 text-[#5b21b6] mr-2 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600">{permission}</span>
                </div>
              ))}
            </div>

            {isConnecting ? (
              <div className="flex items-center justify-center text-[#5b21b6] font-medium py-2">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Connecting...
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  className="flex-1 py-3 px-4 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold rounded-lg transition-colors shadow-md"
                >
                  Allow access
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {platformToDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Disconnect {platformToDisconnect.name}?
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              We&apos;ll stop publishing posts and reading analytics for this
              account. You can reconnect it any time — this won&apos;t delete
              anything on {platformToDisconnect.name} itself.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setPlatformToDisconnect(null)}
                className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-md"
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