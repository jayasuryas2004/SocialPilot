"use client";
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Filter, TrendingUp, Heart, MessageSquare, Share2, Bookmark, ChevronDown } from 'lucide-react';

// --- MOCK DATABASE ---
const MOCK_WEEKLY = [
  { label: 'Mon', like: 4200, comments: 1200, share: 800, saved: 400 },
  { label: 'Tue', like: 3800, comments: 900, share: 600, saved: 300 },
  { label: 'Wed', like: 5100, comments: 1500, share: 1100, saved: 600 },
  { label: 'Thu', like: 4800, comments: 1300, share: 950, saved: 550 },
  { label: 'Fri', like: 5900, comments: 1800, share: 1400, saved: 800 },
  { label: 'Sat', like: 7200, comments: 2400, share: 2100, saved: 1200 },
  { label: 'Sun', like: 6800, comments: 2100, share: 1800, saved: 1000 },
];

const MOCK_MONTHLY = [
  { label: 'June', like: 145000, comments: 42000, share: 28000, saved: 15000 },
  { label: 'July', like: 162000, comments: 48000, share: 34000, saved: 18000 },
  { label: 'August', like: 188000, comments: 55000, share: 41000, saved: 22000 },
];

// Custom Tooltip for the Stacked Bar
const EngagementTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 min-w-[150px]">
        <p className="font-black text-slate-900 mb-3 border-b border-slate-100 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm font-bold mb-1.5 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-slate-500 capitalize">{entry.name}</span>
            </div>
            <span className="text-slate-900">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementChart() {
  const [platform, setPlatform] = useState('all');
  const [timeline, setTimeline] = useState('monthly');

  // Dynamically compute the data based on the timeline filter
  const displayData = useMemo(() => {
    // In production, this is where you would filter your API payload by 'platform' too.
    return timeline === 'weekly' ? MOCK_WEEKLY : MOCK_MONTHLY;
  }, [timeline, platform]);

  // Dynamically sum up the KPIs based on the current active data
  const totals = useMemo(() => {
    return displayData.reduce((acc, curr) => ({
      likes: acc.likes + curr.like,
      comments: acc.comments + curr.comments,
      shares: acc.shares + curr.share,
      saved: acc.saved + curr.saved
    }), { likes: 0, comments: 0, shares: 0, saved: 0 });
  }, [displayData]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px]">
      
      {/* 1. HEADER & FILTERS */}
      <div className="p-6 border-b border-slate-100 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="font-black text-slate-900 flex items-center gap-3 text-lg">
            <div className="bg-purple-50 p-2 rounded-xl text-[#311b92]">
              <BarChart2 size={20} strokeWidth={2.5} />
            </div>
            Engagement Overview
          </h2>
          
          <div className="flex gap-3">
            {/* Platform Filter */}
            <div className="relative">
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="appearance-none border border-slate-200 pl-8 pr-10 py-2.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 cursor-pointer bg-white text-slate-700 w-full min-w-[140px]"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="x-twitter">X-Twitter</option>
              </select>
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            {/* Timeline Toggle */}
            <div className="relative">
              <select 
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="appearance-none border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 cursor-pointer bg-white text-slate-700 w-full min-w-[110px]"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-emerald-200 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm shadow-sm">
            15% <TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm text-slate-500 font-bold">10% Increased vs last period</span>
        </div>
      </div>

      {/* 2. CHART AREA */}
      <div className="flex-1 px-6 pt-8 pb-4 bg-slate-50/50 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} barSize={60} stackOffset="expand">
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 700}} dy={10} />
            <Tooltip content={<EngagementTooltip />} cursor={{fill: 'transparent'}} />
            
            <Bar dataKey="like" name="Likes" stackId="a" fill="#f43f5e" stroke="#fff" strokeWidth={3} radius={[0, 0, 6, 6]} />
            <Bar dataKey="comments" name="Comments" stackId="a" fill="#eab308" stroke="#fff" strokeWidth={3} />
            <Bar dataKey="share" name="Shares" stackId="a" fill="#06b6d4" stroke="#fff" strokeWidth={3} />
            <Bar dataKey="saved" name="Saved" stackId="a" fill="#22c55e" stroke="#fff" strokeWidth={3} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. BOTTOM KPIS */}
      <div className="p-6 border-t border-slate-100 bg-white shrink-0">
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl"><Heart size={16} className="text-rose-500" fill="currentColor" /></div>
              {totals.likes.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></div> Likes
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-amber-50 border border-amber-100 p-2 rounded-xl"><MessageSquare size={16} className="text-amber-500" fill="currentColor" /></div>
              {totals.comments.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div> Comments
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-cyan-50 border border-cyan-100 p-2 rounded-xl"><Share2 size={16} className="text-cyan-500" fill="currentColor" /></div>
              {totals.shares.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></div> Shares
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl"><Bookmark size={16} className="text-emerald-500" fill="currentColor" /></div>
              {totals.saved.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div> Saved
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}