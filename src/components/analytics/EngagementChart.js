"use client";
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Filter, TrendingUp, Heart, MessageSquare, Share2, Bookmark, ChevronDown } from 'lucide-react';

const EngagementTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 min-w-[150px]">
        <p className="font-black text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm font-bold mb-1.5 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}</span>
            </div>
            <span className="text-slate-900 dark:text-white">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementChart({ trends = [], linkedin = {} }) {
  const [platform, setPlatform] = useState('all');
  const [timeline, setTimeline] = useState('weekly');

  const safeTrends = Array.isArray(trends) ? trends : [];

  const displayData = useMemo(() => {
    const dataList = [];
    for (let i = 0; i < safeTrends.length; i++) {
      const item = safeTrends[i];
      const dayLabel = item.date || `Day ${i + 1}`;
      const totalEng = item.engagement || 0;

      let likeCount = Math.round(totalEng * 0.5);
      let commentCount = Math.round(totalEng * 0.25);
      let shareCount = Math.round(totalEng * 0.15);
      let savedCount = Math.round(totalEng * 0.1);

      if (platform === 'linkedin') {
        const liEng = item.linkedin || Math.round(totalEng * 0.4);
        likeCount = Math.round(liEng * 0.5);
        commentCount = Math.round(liEng * 0.25);
        shareCount = Math.round(liEng * 0.15);
        savedCount = Math.round(liEng * 0.1);
      } else if (platform === 'instagram') {
        const igEng = item.instagram || Math.round(totalEng * 0.3);
        likeCount = Math.round(igEng * 0.5);
        commentCount = Math.round(igEng * 0.25);
        shareCount = Math.round(igEng * 0.15);
        savedCount = Math.round(igEng * 0.1);
      } else if (platform === 'facebook') {
        const fbEng = item.facebook || Math.round(totalEng * 0.2);
        likeCount = Math.round(fbEng * 0.5);
        commentCount = Math.round(fbEng * 0.25);
        shareCount = Math.round(fbEng * 0.15);
        savedCount = Math.round(fbEng * 0.1);
      }

      dataList.push({
        label: dayLabel,
        like: likeCount,
        comments: commentCount,
        share: shareCount,
        saved: savedCount
      });
    }
    return dataList;
  }, [safeTrends, platform, timeline]);

  const totals = useMemo(() => {
    let likes = 0;
    let comments = 0;
    let shares = 0;
    let saved = 0;

    for (let i = 0; i < displayData.length; i++) {
      const row = displayData[i];
      likes += row.like || 0;
      comments += row.comments || 0;
      shares += row.share || 0;
      saved += row.saved || 0;
    }

    return { likes, comments, shares, saved };
  }, [displayData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[520px] transition-colors">
      
      {/* 1. HEADER & FILTERS */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-lg">
            <div className="bg-purple-50 dark:bg-purple-950/60 p-2 rounded-xl text-[#311b92] dark:text-purple-300">
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
                className="appearance-none border border-slate-200 dark:border-slate-700 pl-8 pr-10 py-2.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-full min-w-[140px]"
              >
                <option value="all">All Platforms</option>
                <option value="linkedin">LinkedIn {linkedin?.connected ? '(Live)' : ''}</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
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
                className="appearance-none border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-full min-w-[110px]"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm shadow-sm">
            +16.4% <TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">Engagement performance vs previous period</span>
        </div>
      </div>

      {/* 2. CHART AREA */}
      <div className="flex-1 px-6 pt-8 pb-4 bg-slate-50/50 dark:bg-slate-950/50 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} barSize={60} stackOffset="expand">
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} dy={10} />
            <Tooltip content={<EngagementTooltip />} cursor={{fill: 'transparent'}} />
            
            <Bar dataKey="like" name="Likes" stackId="a" fill="#f43f5e" stroke="none" radius={[0, 0, 6, 6]} />
            <Bar dataKey="comments" name="Comments" stackId="a" fill="#eab308" stroke="none" />
            <Bar dataKey="share" name="Shares" stackId="a" fill="#06b6d4" stroke="none" />
            <Bar dataKey="saved" name="Saved" stackId="a" fill="#22c55e" stroke="none" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. BOTTOM KPIS */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white text-base">
              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 p-2 rounded-xl"><Heart size={16} className="text-rose-500" fill="currentColor" /></div>
              {totals.likes.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></div> Likes
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white text-base">
              <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 p-2 rounded-xl"><MessageSquare size={16} className="text-amber-500" fill="currentColor" /></div>
              {totals.comments.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div> Comments
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white text-base">
              <div className="bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900/60 p-2 rounded-xl"><Share2 size={16} className="text-cyan-500" fill="currentColor" /></div>
              {totals.shares.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></div> Shares
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white text-base">
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 p-2 rounded-xl"><Bookmark size={16} className="text-emerald-500" fill="currentColor" /></div>
              {totals.saved.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div> Saved
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
