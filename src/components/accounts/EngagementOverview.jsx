"use client";
import { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Filter, TrendingUp, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';

// --- MOCK DATABASE --- (Replace with API call later)
const MOCK_DATA = [
  { label: 'Mon', like: 4000, commands: 2400, share: 2400, saved: 1000 },
  { label: 'Tue', like: 3000, commands: 1398, share: 2210, saved: 1200 },
  { label: 'Wed', like: 2000, commands: 9800, share: 2290, saved: 1500 },
  { label: 'Thu', like: 2780, commands: 3908, share: 2000, saved: 1100 },
  { label: 'Fri', like: 1890, commands: 4800, share: 2181, saved: 1300 },
  { label: 'Sat', like: 2390, commands: 3800, share: 2500, saved: 1600 },
  { label: 'Sun', like: 3490, commands: 4300, share: 2100, saved: 1800 },
];

const EngagementTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
        <p className="font-black text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
            {entry.name}: <span className="text-slate-900">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementOverview() {
  const [engagementPlatform, setEngagementPlatform] = useState('all');
  const [engagementTimeline, setEngagementTimeline] = useState('weekly');

  // Calculate totals for bottom KPIs
  const totalLikes = MOCK_DATA.reduce((sum, item) => sum + item.like, 0);
  const totalCommands = MOCK_DATA.reduce((sum, item) => sum + item.commands, 0);
  const totalShares = MOCK_DATA.reduce((sum, item) => sum + item.share, 0);
  const totalSaved = MOCK_DATA.reduce((sum, item) => sum + item.saved, 0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="font-black text-slate-900 flex items-center gap-3 text-lg">
            <div className="bg-purple-50 border border-purple-100 p-2 rounded-xl text-[#311b92]">
              <BarChart2 size={18} strokeWidth={2.5} />
            </div>
            Engagement Overview
          </h2>
          
          <div className="flex gap-2">
            {/* Platform Filter */}
            <div className="relative">
              <select 
                value={engagementPlatform}
                onChange={(e) => setEngagementPlatform(e.target.value)}
                className="appearance-none border border-slate-200 pl-8 pr-8 py-2 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 cursor-pointer bg-white text-slate-700"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
              </select>
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#311b92] pointer-events-none" />
            </div>

            {/* Timeline Toggle */}
            <select 
              value={engagementTimeline}
              onChange={(e) => setEngagementTimeline(e.target.value)}
              className="border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 cursor-pointer bg-white text-slate-700"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-emerald-200 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm shadow-sm">
            15% <TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm text-slate-500 font-bold">10% Increased vs Last Week</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-6 pt-6 pb-2 bg-slate-50/50 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_DATA} barSize={40} stackOffset="expand" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" axisLine={true} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} stroke="#e2e8f0" dy={10} />
            <Tooltip content={<EngagementTooltip />} cursor={{fill: '#f1f5f9'}} />
            
            <Bar dataKey="like" name="Like" stackId="a" fill="#f43f5e" stroke="#fff" strokeWidth={2} radius={[0, 0, 6, 6]} />
            <Bar dataKey="commands" name="Commands" stackId="a" fill="#eab308" stroke="#fff" strokeWidth={2} />
            <Bar dataKey="share" name="Share" stackId="a" fill="#06b6d4" stroke="#fff" strokeWidth={2} />
            <Bar dataKey="saved" name="Saved" stackId="a" fill="#22c55e" stroke="#fff" strokeWidth={2} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom KPIs */}
      <div className="p-5 border-t border-slate-100 bg-white shrink-0">
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl"><Heart size={16} className="text-rose-500" fill="currentColor" /></div>
              {totalLikes.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></div> Likes
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-amber-50 border border-amber-100 p-2 rounded-xl"><MessageSquare size={16} className="text-amber-500" fill="currentColor" /></div>
              {totalCommands.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div> Comments
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-cyan-50 border border-cyan-100 p-2 rounded-xl"><Share2 size={16} className="text-cyan-500" fill="currentColor" /></div>
              {totalShares.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></div> Shares
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 text-base">
              <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl"><Bookmark size={16} className="text-emerald-500" fill="currentColor" /></div>
              {totalSaved.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div> Saved
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
