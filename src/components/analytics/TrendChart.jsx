"use client";
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, Activity } from 'lucide-react';

// --- MOCK DATABASE ---
const MOCK_WEEKLY_TRENDS = [
  { date: 'Mon', engagement: 12000, reach: 24000 },
  { date: 'Tue', engagement: 15000, reach: 28000 },
  { date: 'Wed', engagement: 11000, reach: 22000 },
  { date: 'Thu', engagement: 18000, reach: 35000 },
  { date: 'Fri', engagement: 25000, reach: 45000 },
  { date: 'Sat', engagement: 21000, reach: 38000 },
  { date: 'Sun', engagement: 29000, reach: 52000 },
];

const MOCK_MONTHLY_TRENDS = [
  { date: 'Week 1', engagement: 85000, reach: 180000 },
  { date: 'Week 2', engagement: 92000, reach: 210000 },
  { date: 'Week 3', engagement: 78000, reach: 165000 },
  { date: 'Week 4', engagement: 115000, reach: 260000 },
];

export default function TrendChart() {
  const [timeline, setTimeline] = useState('weekly');

  // Compute Data based on timeline
  const displayTrends = useMemo(() => {
    return timeline === 'weekly' ? MOCK_WEEKLY_TRENDS : MOCK_MONTHLY_TRENDS;
  }, [timeline]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[450px]">
      
      {/* 1. HEADER & LEGEND */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center shrink-0">
        
        {/* Custom Header with built-in legend to match design */}
        <h2 className="font-black text-slate-900 flex items-center gap-8 text-lg shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6]"></div> Engagement
          </div>
          <div className="flex items-center gap-2">
             <div className="w-3.5 h-3.5 rounded-full bg-[#f97316]"></div> Reach
          </div>
        </h2>
        
        {/* Timeline Dropdown with Chevron */}
        <div className="relative">
          <select 
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="appearance-none border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 cursor-pointer bg-white text-slate-700 min-w-[120px]"
          >
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

      </div>
      
      {/* 2. CHART AREA */}
      <div className="flex-1 w-full pt-6 pr-6 pb-6 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} />
            
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 800, color: '#1e293b' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="reach" 
              name="Reach"
              stroke="#f97316" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorReach)" 
              dot={false} 
              activeDot={{r: 6, strokeWidth: 0}} 
            />
            <Area 
              type="monotone" 
              dataKey="engagement" 
              name="Engagement"
              stroke="#8b5cf6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorEngagement)" 
              dot={false} 
              activeDot={{r: 6, strokeWidth: 0}} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}