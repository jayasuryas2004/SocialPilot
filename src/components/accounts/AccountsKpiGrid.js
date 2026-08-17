"use client";
import { Users, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AccountsKpiGrid({ accounts = [] }) {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  let connected = 0;
  let expired = 0;
  for (let i = 0; i < safeAccounts.length; i++) {
    const s = (safeAccounts[i].status || '').toLowerCase();
    if (s === 'connected') connected++;
    else if (s === 'expired') expired++;
  }
  const successRate = safeAccounts.length
    ? Math.round((connected / safeAccounts.length) * 100)
    : 100;

  const kpis = [
    { label: 'Connected Accounts', value: safeAccounts.length, icon: Users, color: 'text-[#311b92] dark:text-purple-300 bg-[#f3e8ff] dark:bg-purple-950/60' },
    { label: 'Active Accounts', value: connected, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60' },
    { label: 'Expired Tokens', value: expired, icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
    { label: 'Publishing Success', value: `${successRate}%`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-400 mt-1">{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
}
