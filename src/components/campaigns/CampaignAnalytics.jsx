"use client";
import { useState, useMemo } from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { ChevronDown } from 'lucide-react';

// --- DYNAMIC MOCK DATABASE ---
const MOCK_API_DATA = {
  'Last 7 days': {
    engagement: [
      { name: 'Mon', reach: 3000, engagement: 1200 },
      { name: 'Tue', reach: 4500, engagement: 2800 },
      { name: 'Wed', reach: 3800, engagement: 1500 },
      { name: 'Thu', reach: 5200, engagement: 3100 },
      { name: 'Fri', reach: 6000, engagement: 4000 },
      { name: 'Sat', reach: 4800, engagement: 2500 },
      { name: 'Sun', reach: 5500, engagement: 3800 },
    ],
    funnel: [
      { stage: 'Total Reach', percent: '100%', count: '32.8K' },
      { stage: 'Impressions', percent: '82%', count: '26.8K' },
      { stage: 'Engagement', percent: '58%', count: '19K' },
      { stage: 'Clicks', percent: '22%', count: '7.2K' },
      { stage: 'Conversions', percent: '8%', count: '2.6K' },
    ],
    growth: [
      { name: 'Mon', followers: 2 }, { name: 'Wed', followers: 5 }, { name: 'Fri', followers: 8 }, { name: 'Sun', followers: 12 }
    ]
  },
  'Last month': {
    engagement: [
      { name: '05 Apr', reach: 4500, engagement: 2000 },
      { name: '10 Apr', reach: 5200, engagement: 3800 },
      { name: '15 Apr', reach: 4800, engagement: 2500 },
      { name: '20 Apr', reach: 7000, engagement: 5100 },
      { name: '25 Apr', reach: 6100, engagement: 4200 },
      { name: '30 Apr', reach: 8500, engagement: 6000 },
    ],
    funnel: [
      { stage: 'Total Reach', percent: '100%', count: '50K' },
      { stage: 'Impressions', percent: '75%', count: '37.5K' },
      { stage: 'Engagement', percent: '50%', count: '25K' },
      { stage: 'Clicks', percent: '25%', count: '12.5K' },
      { stage: 'Conversions', percent: '10%', count: '5K' },
    ],
    growth: [
      { name: 'Week 1', followers: 10 }, { name: 'Week 2', followers: 22 }, { name: 'Week 3', followers: 35 }, { name: 'Week 4', followers: 48 }
    ]
  },
  'Last 3 months': {
    engagement: [
      { name: 'Jan', reach: 12000, engagement: 5000 },
      { name: 'Feb', reach: 18000, engagement: 8500 },
      { name: 'Mar', reach: 15000, engagement: 7200 },
      { name: 'Apr', reach: 25000, engagement: 14000 },
      { name: 'May', reach: 22000, engagement: 11000 },
      { name: 'Jun', reach: 35000, engagement: 21000 },
    ],
    funnel: [
      { stage: 'Total Reach', percent: '100%', count: '127K' },
      { stage: 'Impressions', percent: '68%', count: '86K' },
      { stage: 'Engagement', percent: '42%', count: '53K' },
      { stage: 'Clicks', percent: '18%', count: '22K' },
      { stage: 'Conversions', percent: '6%', count: '7.6K' },
    ],
    growth: [
      { name: 'Jan', followers: 12 }, { name: 'Feb', followers: 15 }, { name: 'Mar', followers: 18 }, 
      { name: 'Apr', followers: 16 }, { name: 'May', followers: 22 }, { name: 'Jun', followers: 28 }, { name: 'Jul', followers: 35 }
    ]
  }
};

export default function CampaignAnalytics() {
  const [timeframe, setTimeframe] = useState('Last month');
  const currentData = useMemo(() => MOCK_API_DATA[timeframe], [timeframe]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="text-xl font-black text-slate-900">Campaign Analytics</h2>
        <div className="relative">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last month">Last month</option>
            <option value="Last 3 months">Last 3 months</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* 1. ENGAGEMENT & REACH */}
        <div className="lg:col-span-1 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Engagement & Reach</h3>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.engagement} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingBottom: '10px' }} />
                <Area type="monotone" dataKey="reach" name="Reach" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 2. CONVERSION FUNNEL (Fixed Bug)                                  */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-1 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Conversion Funnel</h3>
          
          <div className="flex-1 flex flex-col justify-center gap-3">
            {currentData.funnel.map((step, index) => (
              <div key={index} className="relative w-full h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between px-4 overflow-hidden group hover:border-[#a78bfa] transition-colors cursor-default">
                
                {/* Background Progress Bar - Adjusted to a soft opacity so dark text works perfectly everywhere */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-[#8b5cf6] transition-all duration-1000 ease-out"
                  style={{ width: step.percent, opacity: 0.15 + (index * 0.05) }}
                ></div>
                
                {/* Content - Universally dark text for unbreaking contrast */}
                <span className="relative z-10 text-[12px] font-bold text-slate-800">
                  {step.stage}
                </span>
                
                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500">
                    {step.percent}
                  </span>
                  <span className="text-[13px] font-black text-slate-900">
                    {step.count}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 3. AUDIENCE GROWTH */}
        <div className="lg:col-span-1 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Audience Growth · Followers Gained (K)</h3>
          <div className="flex-1 w-full -ml-4 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.growth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dx={-10} />
                <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#f97316', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="followers" name="Followers" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}