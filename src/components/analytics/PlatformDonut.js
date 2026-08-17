"use client";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS = {
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  youtube: "#FF0000",
  "x-twitter": "#0f1419",
  twitter: "#0f1419",
  reddit: "#FF4500",
  pinterest: "#E60023",
  default: "#94a3b8" 
};

export default function PlatformDonut({ distribution = [] }) {
  const safeDistribution = Array.isArray(distribution) ? distribution : [];

  const totalPosts = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < safeDistribution.length; i++) {
      const item = safeDistribution[i];
      if (item && typeof item.value === 'number') {
        sum += item.value;
      }
    }
    return sum;
  }, [safeDistribution]);

  if (safeDistribution.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center h-[450px] text-center transition-colors">
        <h2 className="font-black text-slate-900 dark:text-white mb-2 text-lg">Platform Distribution</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium max-w-xs">
          No platform distribution data available. Publish posts to view distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[450px] transition-colors">
      <h2 className="font-black text-slate-900 dark:text-white mb-4 text-lg shrink-0">Platform Distribution</h2>
      
      {/* The Donut Chart */}
      <div className="h-44 relative w-full flex justify-center shrink-0 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={safeDistribution} 
              innerRadius={65} 
              outerRadius={85} 
              paddingAngle={4} 
              dataKey="value"
              stroke="none"
              cornerRadius={4} 
            >
              {safeDistribution.map((entry, index) => {
                const platformKey = (entry.name || '').toLowerCase();
                const sliceColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
                return <Cell key={`cell-${index}`} fill={sliceColor} />;
              })}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Posts</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{totalPosts}</span>
        </div>
      </div>

      {/* Dynamic Legend with Scroll */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {safeDistribution.map((item, index) => {
            const platformKey = (item.name || '').toLowerCase();
            const dotColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
            
            return (
              <div 
                key={index} 
                className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: dotColor }}></div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize truncate max-w-[80px]">{item.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.value} Posts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
