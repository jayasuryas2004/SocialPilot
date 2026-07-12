"use client";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS = {
  instagram: '#E1306C', // Pink
  facebook: '#1877F2',  // Blue
  linkedin: '#0A66C2',  // Dark Blue
  'x-twitter': '#0f1419', // Black
  youtube: '#FF0000',   // Red
  reddit: '#FF4500',    // Orange
  pinterest: '#E60023', // Darker Red
  default: '#94a3b8'
};

// Mock data matches the 1470 total from your image perfectly
const MOCK_DISTRIBUTION = [
  { platform: 'Instagram', posts: 450 },
  { platform: 'Facebook', posts: 320 },
  { platform: 'LinkedIn', posts: 250 },
  { platform: 'YouTube', posts: 180 },
  { platform: 'X-Twitter', posts: 120 },
  { platform: 'Reddit', posts: 85 },
  { platform: 'Pinterest', posts: 65 },
];

export default function PlatformDistribution({ accounts }) {
  const { distribution, totalPosts } = useMemo(() => {
    // Uses mock data for UI showcase. Swap 'MOCK_DISTRIBUTION' with 'accounts' when API is ready.
    const sourceData = MOCK_DISTRIBUTION;

    let total = 0;
    const distData = sourceData.map((item) => {
      total += item.posts;
      return { name: item.platform, value: item.posts };
    });

    distData.sort((a, b) => b.value - a.value);
    return { distribution: distData, totalPosts: total };
  }, [accounts]);

  if (distribution.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[520px]">
      <h2 className="font-black text-slate-900 mb-6 text-lg shrink-0">Platform Distribution</h2>
      
      {/* PERFECTED DONUT CHART */}
      <div className="h-48 relative w-full flex justify-center shrink-0 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={distribution} 
              innerRadius={70} 
              outerRadius={90} 
              paddingAngle={4}   // Creates the clean gaps between slices
              dataKey="value"
              stroke="none"      // Removes the thick white borders
              cornerRadius={4}   // Subtle rounding, exactly like image_73e384.png
            >
              {distribution.map((entry, index) => {
                const platformKey = entry.name.toLowerCase();
                const sliceColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
                return <Cell key={`cell-${index}`} fill={sliceColor} />;
              })}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 800, textTransform: 'capitalize' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-slate-500">Total Posts</span>
          <span className="text-[28px] font-black text-slate-900 leading-none mt-1">
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
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-slate-200 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: dotColor }}></div>
                  <span className="text-[15px] font-black text-slate-900 capitalize truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-slate-500">
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