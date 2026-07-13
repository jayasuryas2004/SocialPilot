"use client";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS = {
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  youtube: "#FF0000",
  "x-twitter": "#0f1419",
  reddit: "#FF4500",
  pinterest: "#E60023",
  default: "#94a3b8" 
};

// Mock data used until API integration
const MOCK_DISTRIBUTION = [
  { name: 'Instagram', value: 450 },
  { name: 'Facebook', value: 320 },
  { name: 'LinkedIn', value: 250 },
  { name: 'YouTube', value: 180 },
  { name: 'X-Twitter', value: 120 },
  { name: 'Reddit', value: 85 },
  { name: 'Pinterest', value: 65 },
];

export default function PlatformDonut({ distribution = MOCK_DISTRIBUTION }) {
  const totalPosts = useMemo(() => distribution.reduce((sum, item) => sum + item.value, 0), [distribution]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[450px]">
      <h2 className="font-black text-slate-900 mb-4 text-lg shrink-0">Platform Distribution</h2>
      
      {/* The Donut Chart */}
      <div className="h-44 relative w-full flex justify-center shrink-0 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={distribution} 
              innerRadius={65} 
              outerRadius={85} 
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
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 600, textTransform: 'capitalize' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-slate-500">Total Posts</span>
          <span className="text-xl font-black text-slate-900">{totalPosts}</span>
        </div>
      </div>

      {/* Dynamic 7-Box Legend with Scroll */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {distribution.map((item, index) => {
            const platformKey = item.name.toLowerCase();
            const dotColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
            
            return (
              <div 
                key={index} 
                className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: dotColor }}></div>
                  <span className="text-sm font-black text-slate-800 capitalize truncate max-w-[80px]">{item.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">{item.value} Posts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
