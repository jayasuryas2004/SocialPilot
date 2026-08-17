"use client";
import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import PlatformCard from './PlatformCard';

export default function AccountsOverview({
  accounts = [],
  isLoading = false,
  onManage,
  onReconnect,
  onOpenConnect,
  onRefresh
}) {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8 transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Social Accounts Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your active social media accounts</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh accounts"
            className="p-2 text-slate-400 hover:text-[#311b92] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={18} strokeWidth={2.5} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : safeAccounts.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">No accounts connected yet.</p>
          {onOpenConnect && (
            <button
              onClick={onOpenConnect}
              className="bg-[#311b92] dark:bg-[#5b21b6] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Connect your first account
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeAccounts.map((account) => (
            <PlatformCard
              key={account.id}
              account={account}
              onManage={onManage}
              onReconnect={onReconnect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
