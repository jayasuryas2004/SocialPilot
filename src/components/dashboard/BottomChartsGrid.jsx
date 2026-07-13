"use client";
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// The Production-level dictionary mapping backend names to brand colors
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

export default function BottomChartsGrid({ distribution, trends }) {
  const totalPosts = distribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* ----------------------------------------------------------------- */}
      {/* PLATFORM DISTRIBUTION (7 Platforms)                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col h-[450px]">
        <h2 className="font-bold text-slate-900 mb-4 text-lg shrink-0">Platform Distribution</h2>
        
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
        {/* Using a custom scrollbar to keep the UI looking clean while holding all 7 items */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            {distribution.map((item, index) => {
              const platformKey = item.name.toLowerCase();
              const dotColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;
              
              return (
                <div 
                  key={index} 
                  className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: dotColor }}></div>
                    <span className="text-sm font-bold text-slate-800 capitalize truncate max-w-[80px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{item.value} Posts</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ENGAGEMENT VS REACH (Smooth Area Chart with Gradients)            */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col h-[450px]">
        <h2 className="font-bold text-slate-900 mb-6 flex justify-center gap-8 text-lg shrink-0">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div> Engagement
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f97316]"></div> Reach
          </span>
        </h2>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              
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
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} />
              
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              
              <Area 
                type="monotone" 
                dataKey="reach" 
                stroke="#f97316" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorReach)" 
                dot={false} 
                activeDot={{r: 6, strokeWidth: 0}} 
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorEngagement)" 
                dot={false} 
                activeDot={{r: 6, strokeWidth: 0}} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
