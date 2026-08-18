"use client";
import React from 'react';
import { Check, Plus } from 'lucide-react';
import { PLATFORM_LIST, connectPlatform } from '@/lib/api/accounts';

export default function ConnectAccountsGrid({ accounts = [], onConnectPlatform }) {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const connectedPlatformIds = [];
  for (let i = 0; i < safeAccounts.length; i++) {
    const acc = safeAccounts[i];
    const rawPlatform = acc?.platform || acc?.platform_name || acc?.name;
    if (rawPlatform && (acc.status || 'connected') === 'connected') {
      const p = String(rawPlatform).toLowerCase().trim();
      if (!connectedPlatformIds.includes(p)) {
        connectedPlatformIds.push(p);
      }
    }
  }

  const connectedCount = connectedPlatformIds.length;
  const totalPlatforms = PLATFORM_LIST.length;

  const handleConnectClick = (platformId) => {
    if (onConnectPlatform && typeof onConnectPlatform === 'function') {
      onConnectPlatform(platformId);
    } else {
      connectPlatform(platformId);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Connect Platforms</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {connectedCount} of {totalPlatforms} platforms connected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#311b92] dark:bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((connectedCount / totalPlatforms) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {Math.round((connectedCount / totalPlatforms) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {PLATFORM_LIST.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connectedPlatformIds.includes(platform.id.toLowerCase());

          return (
            <div
              key={platform.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isConnected
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${platform.bg}`}>
                  <Icon size={18} />
                </div>
                {isConnected ? (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> Connected
                  </span>
                ) : (
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Available
                  </span>
                )}
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{platform.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-300 mt-0.5 line-clamp-1">
                  {platform.scopes && platform.scopes[0] ? platform.scopes[0] : 'Connect and publish'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80">
                {isConnected ? (
                  <button
                    disabled
                    className="w-full py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40 rounded-xl cursor-default flex items-center justify-center gap-1"
                  >
                    <Check size={13} /> Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectClick(platform.id)}
                    className="w-full py-2 text-xs font-bold text-[#311b92] dark:text-purple-300 bg-[#f8f5ff] dark:bg-purple-950/50 hover:bg-[#311b92] hover:text-white dark:hover:bg-purple-600 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
