"use client";
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { TrendingUp, MousePointerClick, Users, Eye, HeartHandshake } from 'lucide-react';

const TOP_KPIS = [
  { label: 'Total Engagement', value: '24K', icon: HeartHandshake, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Total Reach', value: '84K', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Impressions', value: '54K', icon: Eye, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Engagement Rate', value: '5.6%', icon: MousePointerClick, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const MINI_CHART_DATA = [
  { value: 40 }, { value: 60 }, { value: 30 }, { value: 80 }, { value: 50 }
];

export default function AnalyticsWidgets() {
  return (
    <>
      {/* TOP 4 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {TOP_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${kpi.bg} ${kpi.color}`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">{kpi.label}</h3>
              <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* REACH & IMPRESSIONS CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        
        {/* Reach Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600"><Users size={16} /></div>
              <h3 className="font-black text-slate-900 text-lg">Reach</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">1,245,870</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                12.5% <TrendingUp size={14} />
              </span>
              <span className="text-slate-400 font-medium">vs last month</span>
            </div>
          </div>
          <div className="h-24 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MINI_CHART_DATA}>
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impressions Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-50 p-1.5 rounded-lg text-amber-600"><Eye size={16} /></div>
              <h3 className="font-black text-slate-900 text-lg">Impressions</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">3,876,240</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                8.2% <TrendingUp size={14} />
              </span>
              <span className="text-slate-400 font-medium">vs last month</span>
            </div>
          </div>
          <div className="h-24 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MINI_CHART_DATA}>
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}
