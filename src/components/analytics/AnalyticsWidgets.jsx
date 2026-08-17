"use client";
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { TrendingUp, MousePointerClick, Users, Eye, HeartHandshake } from 'lucide-react';

const MINI_CHART_DATA = [
  { value: 40 }, { value: 60 }, { value: 30 }, { value: 80 }, { value: 50 }
];

export default function AnalyticsWidgets({ kpis = {}, linkedin = {} }) {
  const engagementVal = kpis?.totalEngagement?.value || '0';
  const reachVal = kpis?.totalReach?.value || '0';
  const impressionsVal = kpis?.impressions?.value || '0';
  const engRateVal = kpis?.engagementRate?.value || '0.0%';

  const topKpis = [
    {
      label: 'Total Engagement',
      value: engagementVal,
      icon: HeartHandshake,
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60'
    },
    {
      label: 'Total Reach',
      value: reachVal,
      icon: Users,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60'
    },
    {
      label: 'Impressions',
      value: impressionsVal,
      icon: Eye,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      label: 'Engagement Rate',
      value: engRateVal,
      icon: MousePointerClick,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60'
    },
  ];

  return (
    <>
      {/* TOP 4 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {topKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={`kpi-card-${idx}`} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${kpi.bg} ${kpi.color}`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1">{kpi.label}</h3>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* REACH & IMPRESSIONS CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        
        {/* Reach Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-50 dark:bg-blue-950/60 p-1.5 rounded-lg text-blue-600 dark:text-blue-400"><Users size={16} /></div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Reach</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">{reachVal}</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-bold text-xs">
                {kpis?.totalReach?.change || '+22.1%'} <TrendingUp size={14} />
              </span>
              <span className="text-slate-400 dark:text-slate-400 font-medium">vs last month</span>
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded-lg text-amber-600 dark:text-amber-400"><Eye size={16} /></div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Impressions</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">{impressionsVal}</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-bold text-xs">
                {kpis?.impressions?.change || '+14.8%'} <TrendingUp size={14} />
              </span>
              <span className="text-slate-400 dark:text-slate-400 font-medium">vs last month</span>
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
