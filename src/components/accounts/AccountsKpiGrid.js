"use client";
import { Users, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AccountsKpiGrid({ accounts }) {
  const connected = accounts.filter(a => a.status === 'connected').length;
  const expired = accounts.filter(a => a.status === 'expired').length;
  const successRate = accounts.length
    ? Math.round((connected / accounts.length) * 100)
    : 0;

  const kpis = [
    { label: 'Connected Accounts', value: accounts.length, icon: Users, color: 'text-[#311b92] bg-[#f3e8ff]' },
    { label: 'Active Accounts', value: connected, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Expired Tokens', value: expired, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Publishing Success', value: `${successRate}%`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
}