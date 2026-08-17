"use client";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  'x-twitter': '#0f1419',
  youtube: '#FF0000',
  reddit: '#FF4500',
  pinterest: '#E60023',
  default: '#94a3b8'
};

const BASELINE_DISTRIBUTION = [
  { platform: 'Instagram', posts: 450 },
  { platform: 'Facebook', posts: 320 },
  { platform: 'LinkedIn', posts: 250 },
  { platform: 'YouTube', posts: 180 },
  { platform: 'X-Twitter', posts: 120 },
  { platform: 'Reddit', posts: 85 },
  { platform: 'Pinterest', posts: 65 },
];

export default function PlatformDistribution({ accounts = [] }) {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const { distribution, totalPosts } = useMemo(() => {
    const countsByPlatform = {};
    let total = 0;

    // 1. Populate from baseline
    for (let i = 0; i < BASELINE_DISTRIBUTION.length; i++) {
      const base = BASELINE_DISTRIBUTION[i];
      const key = base.platform.toLowerCase();
      countsByPlatform[key] = {
        name: base.platform,
        value: base.posts
      };
      total += base.posts;
    }

    // 2. Add dynamic live accounts
    for (let j = 0; j < safeAccounts.length; j++) {
      const acc = safeAccounts[j];
      if (acc && acc.platform) {
        const key = acc.platform.toLowerCase();
        const pCount = typeof acc.posts === 'number' && acc.posts > 0 ? acc.posts : 1;
        if (countsByPlatform[key]) {
          countsByPlatform[key].value += pCount;
        } else {
          countsByPlatform[key] = {
            name: acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1),
            value: pCount
          };
        }
        total += pCount;
      }
    }

    const distData = Object.values(countsByPlatform);
    distData.sort((a, b) => b.value - a.value);

    return { distribution: distData, totalPosts: total };
  }, [safeAccounts]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[520px] transition-colors">
      <h2 className="font-black text-slate-900 dark:text-white mb-6 text-lg shrink-0">Platform Distribution</h2>
      
      {/* PERFECTED DONUT CHART */}
      <div className="h-48 relative w-full flex justify-center shrink-0 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={distribution} 
              innerRadius={70} 
              outerRadius={90} 
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {distribution.map((entry, index) => {
                const platformKey = entry.name.toLowerCase();
                const sliceColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
                return <Cell key={`cell-${index}`} fill={sliceColor} />;
              })}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#fff', fontWeight: 800, textTransform: 'capitalize' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Posts</span>
          <span className="text-[28px] font-black text-slate-900 dark:text-white leading-none mt-1">
            {totalPosts.toLocaleString()}
          </span>
        </div>
      </div>

      {/* SCROLLABLE GRID LEGEND */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {distribution.map((item, index) => {
            const platformKey = item.name.toLowerCase();
            const dotColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
            
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: dotColor }}></div>
                  <span className="text-[15px] font-black text-slate-900 dark:text-white capitalize truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">
                  {item.value.toLocaleString()} Posts
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
