"use client";
import { AlertTriangle, ArrowUpRight, RefreshCw } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/lib/api/accounts';

function formatReach(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function PlatformCard({ account, onManage, onReconnect }) {
  if (!account) return null;

  const platformKey = (account.platform || '').toLowerCase();
  const config = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG.linkedin;
  if (!config) return null;

  const Icon = config.icon;
  const isExpired = account.status === 'expired';
  const posts = account.posts ?? 0;
  const reach = account.reach ?? 0;
  const engagementRate = account.engagementRate ?? 0;

  const displayName = account.displayName || account.account_name || config.name;
  const handle = account.handle || (account.account_name ? `@${account.account_name.toLowerCase().replace(/\s+/g, '_')}` : `@${platformKey}_account`);

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all ${
      isExpired ? 'border-amber-200 dark:border-amber-900/60' : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm ${config.bg}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white text-sm">{displayName}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400">{handle}</p>
          </div>
        </div>

        {isExpired ? (
          <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <AlertTriangle size={10} /> Expired
          </span>
        ) : (
          <span className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" /> Connected
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Posts</p>
          <p className="text-lg font-black text-slate-800 dark:text-white">{posts}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Reach</p>
          <p className="text-lg font-black text-slate-800 dark:text-white">{formatReach(reach)}</p>
        </div>
      </div>

      {!isExpired && (
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            <span>Engagement rate</span>
            <span className="text-slate-700 dark:text-slate-200 font-bold">{engagementRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${config.bg}`}
              style={{ width: `${Math.min(engagementRate * 5, 100)}%` }}
            />
          </div>
        </div>
      )}

      {isExpired && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-xl px-3 py-2 mb-4 leading-snug">
          Access token expired. Reconnect to keep publishing to this account.
        </p>
      )}

      {isExpired ? (
        <button
          onClick={() => onReconnect(account)}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw size={15} /> Reconnect
        </button>
      ) : (
        <button
          onClick={() => onManage(account)}
          className="w-full flex items-center justify-center gap-2 bg-[#311b92] dark:bg-[#5b21b6] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-colors cursor-pointer"
        >
          Manage Account <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}
