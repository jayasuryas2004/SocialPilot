"use client";
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  ComposedChart, Area, Line, Cell 
} from 'recharts';
import { Filter, BarChart2, TrendingUp, Heart, MessageSquare, Share2, Bookmark, Users } from "lucide-react";

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
  // Engagement States
  const [engagementTimeline, setEngagementTimeline] = useState('monthly');
  const [engagementPlatform, setEngagementPlatform] = useState('all');
  
  // Followers States
  const [followersTimeline, setFollowersTimeline] = useState('monthly');
  const [platformView, setPlatformView] = useState('top4');

  // 1. Process Engagement Data
  let displayEngagement = [];
  if (Array.isArray(engagement)) {
    displayEngagement = engagement;
  } else if (engagement && engagement[engagementTimeline]) {
    displayEngagement = engagement[engagementTimeline][engagementPlatform] || engagement[engagementTimeline].all || [];
  }

  // 2. Process Followers Data
  let baseFollowers = [];
  if (Array.isArray(followers)) {
    baseFollowers = followers;
  } else if (followers && followers[followersTimeline]) {
    baseFollowers = followers[followersTimeline];
  }
  const displayFollowers = platformView === 'top4' ? baseFollowers.slice(0, 4) : baseFollowers;

  // KPI Calculations
  let totalLikes = 0;
  let totalCommands = 0;
  let totalShares = 0;
  let totalSaved = 0;

  for (let i = 0; i < displayEngagement.length; i++) {
    const item = displayEngagement[i];
    totalLikes += (item.like || 0);
    totalCommands += (item.commands || 0);
    totalShares += (item.share || 0);
    totalSaved += (item.saved || 0);
  }

  const EngagementTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl text-sm min-w-[160px]">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: entry.color }}></div>
                <span className="capitalize font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white ml-4">
                {entry.value.toLocaleString()}
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
      const platformKey = (label || "").toLowerCase();
      const brandColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;

      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl text-sm min-w-[140px]">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Followers</span>
            </div>
            <span className="font-bold text-lg" style={{ color: brandColor }}>
              {data.value.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. ENGAGEMENT OVERVIEW */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[520px] transition-colors duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
              <div className="bg-purple-100 dark:bg-purple-950/60 p-1.5 rounded-xl text-[#311b92] dark:text-purple-300">
                <BarChart2 size={18} />
              </div>
              Engagement Overview
            </h2>
            <div className="flex gap-2">
              
              {/* Platform Filter */}
              <div className="relative">
                <select 
                  value={engagementPlatform}
                  onChange={(e) => setEngagementPlatform(e.target.value)}
                  className="appearance-none border border-slate-200 dark:border-slate-700 pl-8 pr-8 py-1.5 rounded-xl text-sm font-medium outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none" />
              </div>

              {/* Engagement Timeline Toggle */}
              <select 
                value={engagementTimeline}
                onChange={(e) => setEngagementTimeline(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-sm font-medium outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-emerald-600 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              15 % <TrendingUp size={14} />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">10 % Increased</span>
          </div>
        </div>

        <div className="flex-1 px-5 pt-6 bg-slate-50/50 dark:bg-slate-900/40 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayEngagement} barSize={60} stackOffset="expand">
              <XAxis dataKey="label" axisLine={true} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} stroke="#475569" />
              <Tooltip content={<EngagementTooltip />} cursor={{fill: 'transparent'}} />
              
              <Bar dataKey="like" name="Like" stackId="a" fill="#f43f5e" stroke="#fff" strokeWidth={3} radius={[0, 0, 4, 4]} />
              <Bar dataKey="commands" name="Commands" stackId="a" fill="#eab308" stroke="#fff" strokeWidth={3} />
              <Bar dataKey="share" name="Share" stackId="a" fill="#06b6d4" stroke="#fff" strokeWidth={3} />
              <Bar dataKey="saved" name="Saved" stackId="a" fill="#22c55e" stroke="#fff" strokeWidth={3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <div className="border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg"><Heart size={16} className="text-rose-500" fill="currentColor" /></div>
                {totalLikes.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="w-3.5 h-3.5 rounded-full bg-[#f43f5e] border border-slate-900 dark:border-slate-600"></div> Like
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <div className="border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg"><MessageSquare size={16} className="text-yellow-500" fill="currentColor" /></div>
                {totalCommands.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="w-3.5 h-3.5 rounded-full bg-[#eab308] border border-slate-900 dark:border-slate-600"></div> Commands
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <div className="border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg"><Share2 size={16} className="text-cyan-500" fill="currentColor" /></div>
                {totalShares.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="w-3.5 h-3.5 rounded-full bg-[#06b6d4] border border-slate-900 dark:border-slate-600"></div> Share
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <div className="border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg"><Bookmark size={16} className="text-emerald-500" fill="currentColor" /></div>
                {totalSaved.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e] border border-slate-900 dark:border-slate-600"></div> Saved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOTAL FOLLOWERS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden h-[520px] transition-colors duration-200">
         <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 shrink-0">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
              <div className="bg-indigo-100 dark:bg-indigo-950/60 p-1.5 rounded-xl text-indigo-700 dark:text-indigo-300">
                <Users size={18} />
              </div>
              Total Followers
            </h2>
            
            <div className="flex gap-2">
              
              {/* Followers Timeline Toggle */}
              <select 
                value={followersTimeline}
                onChange={(e) => setFollowersTimeline(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-sm font-medium outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <select 
                value={platformView}
                onChange={(e) => setPlatformView(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-sm font-medium outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="top4">Top 4</option>
                <option value="all">All Platforms</option>
              </select>

            </div>
         </div>
         
         <div className="flex-1 w-full p-5 bg-slate-50/30 dark:bg-slate-900/40 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={displayFollowers}>
                 <defs>
                   <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 
                 <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dy={10} />
                 <Tooltip cursor={{fill: 'transparent'}} content={<FollowersTooltip />} />
                 
                 <Bar dataKey="value" barSize={40} radius={[6, 6, 0, 0]}>
                  {displayFollowers.map((entry, index) => {
                      const platformKey = (entry.platform || "").toLowerCase();
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
