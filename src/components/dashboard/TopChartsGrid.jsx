"use client";
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  ComposedChart, Area, Line, Cell 
} from 'recharts';
import { Filter, BarChart2, TrendingUp, Heart, MessageSquare, Share2, Bookmark, Users } from "lucide-react";

// Official brand colors for the custom tooltip
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

export default function TopChartsGrid({ engagement, followers }) {
  // --- STATE FOR CHARTS ---
  const [timeline, setTimeline] = useState('weekly');
  const [platformView, setPlatformView] = useState('top4');
  
  // NEW: State for Engagement Overview Platform Filter
  const [engagementPlatform, setEngagementPlatform] = useState('all');

  // --- FILTERING LOGIC ---
  const displayFollowers = platformView === 'top4' ? followers.slice(0, 4) : followers;
  
  // NEW: Grab the correct engagement array based on dropdown. 
  // (Fallback to Array.isArray just in case the API hasn't been updated yet)
  const displayEngagement = Array.isArray(engagement) 
    ? engagement 
    : (engagement[engagementPlatform] || engagement?.all || []);

  // --- KPI CALCULATIONS (Now dynamic based on displayEngagement!) ---
  const totalLikes = displayEngagement.reduce((acc, curr) => acc + (curr.like || 0), 0);
  const totalCommands = displayEngagement.reduce((acc, curr) => acc + (curr.commands || 0), 0);
  const totalShares = displayEngagement.reduce((acc, curr) => acc + (curr.share || 0), 0);
  const totalSaved = displayEngagement.reduce((acc, curr) => acc + (curr.saved || 0), 0);

  // --- CUSTOM TOOLTIPS ---
  const EngagementTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-slate-600 mb-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-semibold text-slate-900">
                {(entry.value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const FollowersTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const platformKey = label.toLowerCase();
      const brandColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;

      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl text-sm min-w-[140px]">
          <p className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
              <span className="text-slate-600 font-medium">Followers</span>
            </div>
            <span className="font-bold text-lg" style={{ color: brandColor }}>{data.value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* ----------------------------------------------------------------- */}
      {/* 1. ENGAGEMENT OVERVIEW (100% Stacked Bar)                         */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px]">
        <div className="p-5 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <div className="bg-purple-100 p-1.5 rounded-lg text-purple-700">
                <BarChart2 size={18} />
              </div>
              Engagement Overview
            </h2>
            <div className="flex gap-2">
              
              {/* NEW: Platform Filter Dropdown */}
              <div className="relative">
                <select 
                  value={engagementPlatform}
                  onChange={(e) => setEngagementPlatform(e.target.value)}
                  className="appearance-none border border-slate-200 pl-8 pr-8 py-1.5 rounded-lg text-sm font-medium outline-none hover:bg-slate-50 cursor-pointer bg-white"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                  <option value="x-twitter">X-Twitter</option>
                  <option value="reddit">Reddit</option>
                  <option value="pinterest">Pinterest</option>
                </select>
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              {/* Timeline Dropdown */}
              <select className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium outline-none hover:bg-slate-50 cursor-pointer bg-white">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>

            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-emerald-600 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-sm">
              15 % <TrendingUp size={14} />
            </div>
            <span className="text-sm text-slate-500 font-medium">10 % Increased</span>
          </div>
        </div>

        <div className="flex-1 px-5 pt-6 bg-slate-50/50 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {/* NEW: Pass displayEngagement instead of engagement */}
            <BarChart data={displayEngagement} barSize={60} stackOffset="expand">
              <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{fill: '#64748b', fontSize: 14}} stroke="#e2e8f0" />
              <Tooltip content={<EngagementTooltip />} cursor={{fill: 'transparent'}} />
              
              <Bar dataKey="like" name="Like" stackId="a" fill="#f43f5e" stroke="#fff" strokeWidth={3} radius={[0, 0, 4, 4]} />
              <Bar dataKey="commands" name="Commands" stackId="a" fill="#eab308" stroke="#fff" strokeWidth={3} />
              <Bar dataKey="share" name="Share" stackId="a" fill="#06b6d4" stroke="#fff" strokeWidth={3} />
              <Bar dataKey="saved" name="Saved" stackId="a" fill="#22c55e" stroke="#fff" strokeWidth={3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 border-t border-slate-200 bg-white shrink-0">
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="border border-slate-200 p-1.5 rounded-md"><Heart size={16} className="text-rose-500" fill="currentColor" /></div>
                {totalLikes}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="w-4 h-4 rounded-full bg-[#f43f5e] border border-slate-900"></div> Like
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="border border-slate-200 p-1.5 rounded-md"><MessageSquare size={16} className="text-yellow-500" fill="currentColor" /></div>
                {totalCommands}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="w-4 h-4 rounded-full bg-[#eab308] border border-slate-900"></div> Commands
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="border border-slate-200 p-1.5 rounded-md"><Share2 size={16} className="text-cyan-500" fill="currentColor" /></div>
                {totalShares}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="w-4 h-4 rounded-full bg-[#06b6d4] border border-slate-900"></div> Share
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="border border-slate-200 p-1.5 rounded-md"><Bookmark size={16} className="text-emerald-500" fill="currentColor" /></div>
                {totalSaved}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="w-4 h-4 rounded-full bg-[#22c55e] border border-slate-900"></div> Saved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. TOTAL FOLLOWERS (Composed Bar + Gradient Area)                 */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[520px]">
         <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-700">
                <Users size={18} />
              </div>
              Total Followers
            </h2>
            
            <div className="flex gap-2">
              <select 
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium outline-none hover:bg-slate-50 cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <select 
                value={platformView}
                onChange={(e) => setPlatformView(e.target.value)}
                className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium outline-none hover:bg-slate-50 cursor-pointer"
              >
                <option value="top4">Top 4</option>
                <option value="all">All Platforms</option>
              </select>
            </div>
         </div>
         
         <div className="flex-1 w-full p-5 bg-slate-50/30 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={displayFollowers}>
                 <defs>
                   <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 
                 <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                 
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

    </div>
  );
}