"use client";
import { useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Area, Line, XAxis, Tooltip, Cell } from 'recharts';
import { Users, ChevronDown } from 'lucide-react';

const PLATFORM_COLORS = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  'x-twitter': '#0f1419',
  youtube: '#FF0000',
  pinterest: '#E60023',
  reddit: '#FF4500',
  default: '#94a3b8'
};

const MOCK_DATA_WEEKLY = [
  { platform: 'Instagram', value: 12500 },
  { platform: 'Facebook', value: 8200 },
  { platform: 'Pinterest', value: 15400 },
  { platform: 'LinkedIn', value: 4100 },
  { platform: 'YouTube', value: 9800 },
  { platform: 'X-Twitter', value: 5200 },
  { platform: 'Reddit', value: 6100 },
];

const MOCK_DATA_MONTHLY = [
  { platform: 'Instagram', value: 45000 },
  { platform: 'Facebook', value: 32000 },
  { platform: 'Pinterest', value: 55000 },
  { platform: 'LinkedIn', value: 18000 },
  { platform: 'YouTube', value: 38000 },
  { platform: 'X-Twitter', value: 22000 },
  { platform: 'Reddit', value: 25000 },
];

const FollowersTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const barColor = PLATFORM_COLORS[data.platform.toLowerCase()] || PLATFORM_COLORS.default;
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: barColor }} />
        <div>
          <p className="font-bold text-slate-900 text-sm">{data.platform}</p>
          <p className="font-black text-slate-700">{data.value.toLocaleString()} <span className="text-xs font-medium text-slate-400">Followers</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export default function TotalFollowers() {
  const [followersTimeline, setFollowersTimeline] = useState('weekly');
  const [platformView, setPlatformView] = useState('all');

  const displayFollowers = useMemo(() => {
    let baseData = followersTimeline === 'weekly' ? [...MOCK_DATA_WEEKLY] : [...MOCK_DATA_MONTHLY];
    if (platformView === 'top4') {
      baseData = baseData.sort((a, b) => b.value - a.value).slice(0, 4);
    }
    return baseData;
  }, [followersTimeline, platformView]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[520px]">
       
       {/* HEADER & FILTERS */}
       <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
          <h2 className="font-black text-slate-900 flex items-center gap-3 text-lg">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <Users size={20} strokeWidth={2.5} />
            </div>
            Total Followers
          </h2>
          
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={followersTimeline}
                onChange={(e) => setFollowersTimeline(e.target.value)}
                className="border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 cursor-pointer bg-white appearance-none w-full"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={platformView}
                onChange={(e) => setPlatformView(e.target.value)}
                className="border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 cursor-pointer bg-white appearance-none w-full"
              >
                <option value="all">All Platforms</option>
                <option value="top4">Top 4</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
       </div>
       
       {/* CHART AREA */}
       <div className="flex-1 w-full px-4 pb-6 pt-4 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
             {/* INCREASED MARGIN prevents dots/bars from being cut off on the edges */}
             <ComposedChart data={displayFollowers} margin={{ top: 20, right: 30, left: 30, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                   <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               
               <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={15} />
               <Tooltip cursor={{fill: '#f8fafc'}} content={<FollowersTooltip />} />
               
               <Bar dataKey="value" barSize={40} radius={[6, 6, 0, 0]}>
                {displayFollowers.map((entry, index) => {
                    const platformKey = entry.platform.toLowerCase();
                    const barColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
               </Bar>
               
               <Area type="monotone" dataKey="value" stroke="none" fill="url(#colorFollowers)" />
               <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
             </ComposedChart>
          </ResponsiveContainer>
       </div>

    </div>
  );
}
