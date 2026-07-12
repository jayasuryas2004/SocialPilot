"use client";
import { useState } from 'react';
import { Download } from 'lucide-react';
import AnalyticsWidgets from '@/components/analytics/AnalyticsWidgets';
import EngagementChart from '@/components/analytics/EngagementChart';
import PlatformDonut from '@/components/analytics/PlatformDonut';
import TrendChart from '@/components/analytics/TrendChart';
import AnalyticsTables from '@/components/analytics/AnalyticsTables';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor your social media performance and track your growth</p>
        </div>
        <button className="bg-[#311b92] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
          Export <Download size={16} />
        </button>
      </div>

      {/* ROW 1 & 2: KPIs and Reach/Impressions (Imported from Widgets) */}
      <AnalyticsWidgets />

      {/* ROW 3: Engagement Chart & Follower Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <EngagementChart />
        </div>
        <div className="xl:col-span-1">
          <PlatformDonut />
        </div>
      </div>

      {/* ROW 4: Trend Line Chart */}
      <div className="mb-6">
        <TrendChart />
      </div>

      {/* ROW 5 & 6: Data Tables & Queue */}
      <AnalyticsTables />

    </div>
  );
}