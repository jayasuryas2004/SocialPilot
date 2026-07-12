"use client";

import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Unlink,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  PLATFORM_CONFIG,
  disconnectAccount,
  updateAccountSettings,
} from "@/lib/api/accounts";

export default function ManageAccountModal({
  account,
  onClose,
  onDisconnected,
  onUpdated,
}) {
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    document.body.style.overflow = account ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [account]);

  if (!account) return null;

  const config = PLATFORM_CONFIG[account.platform];
  const Icon = config.icon;

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      await disconnectAccount(account.id);
      onDisconnected(account.id);
      onClose();
    } catch (err) {
      alert(err.message || "Failed to disconnect. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const toggleAutoPublish = async () => {
    const next = !autoPublish;

    setAutoPublish(next);
    setIsSavingSettings(true);

    try {
      await updateAccountSettings(account.id, {
        autoPublish: next,
      });

      onUpdated?.(account.id, {
        autoPublish: next,
      });
    } catch {
      setAutoPublish(!next);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const platformUrl =
    account.platform === "x-twitter"
      ? "x.com"
      : account.platform + ".com";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className={`px-6 py-6 ${config.bg} relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Icon size={22} />
            </div>

            <div>
              <p className="text-white font-black text-lg">
                {account.displayName}
              </p>

              <p className="text-white/80 text-xs font-medium">
                {account.handle} · {config.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-slate-800">
                {account.posts}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Posts
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-slate-800">
                {(account.reach / 1000).toFixed(0)}K
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Reach
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-slate-800">{((account.reach || 0) / 1000).toFixed(0)}K</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Engage
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
            <div>
              <p className="text-sm font-bold text-slate-800">
                Auto-publish scheduled posts
              </p>

              <p className="text-xs text-slate-400 mt-0.5">
                Turn off to review before it goes live
              </p>
            </div>

            <button
              onClick={toggleAutoPublish}
              disabled={isSavingSettings}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                autoPublish ? 'bg-[#311b92]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  autoPublish ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Granted Permissions
            </p>

            <div className="space-y-2">
              {config.scopes.map((scope, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 font-medium"
                >
                  <ShieldCheck
                    size={14}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  {scope}
                </div>
              ))}
            </div>
          </div>

          <a
            href={`https://${platformUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-[#311b92] hover:underline"
          >
            View on {config.name} <ExternalLink size={12} />
          </a>

          {showDisconnectConfirm ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-start gap-2.5 mb-3">
                <AlertTriangle
                  size={18}
                  className="text-rose-600 shrink-0 mt-0.5"
                />

                <p className="text-xs text-rose-800 leading-snug">
                  Disconnecting will stop all scheduled posts to this account
                  and revoke SocialPilot&apos;s access. This can&apos;t be
                  undone from here — you&apos;d need to reconnect.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  disabled={isDisconnecting}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white rounded-lg border border-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Yes, Disconnect"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors text-sm"
            >
              <Unlink size={15} />
              Disconnect Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}