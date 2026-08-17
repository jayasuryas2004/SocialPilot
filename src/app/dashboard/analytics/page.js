"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import AnalyticsWidgets from '@/components/analytics/AnalyticsWidgets';
import EngagementChart from '@/components/analytics/EngagementChart';
import PlatformDonut from '@/components/analytics/PlatformDonut';
import TrendChart from '@/components/analytics/TrendChart';
import AnalyticsTables from '@/components/analytics/AnalyticsTables';
import { fetchFullAnalyticsReport } from '@/lib/api/analytics';

export default function AnalyticsPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchFullAnalyticsReport()
      .then((data) => {
        if (isMounted && data) {
          setReport(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load analytics data:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitor real-time social performance and multi-platform growth benchmarks
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/dashboard/reports')}
          className="bg-[#311b92] dark:bg-[#5b21b6] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          Export <Download size={16} />
        </button>
      </div>

      {/* ROW 1 & 2: KPIs and Reach/Impressions */}
      <AnalyticsWidgets kpis={report?.kpis} linkedin={report?.linkedin} />

      {/* ROW 3: Engagement Chart & Follower Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <EngagementChart trends={report?.engagementTrends} linkedin={report?.linkedin} />
        </div>
        <div className="xl:col-span-1">
          <PlatformDonut distribution={report?.platformDistribution} />
        </div>
      </div>

      {/* ROW 4: Trend Line Chart */}
      <div className="mb-6">
        <TrendChart trends={report?.engagementTrends} />
      </div>

      {/* ROW 5 & 6: Data Tables */}
      <AnalyticsTables
        topPosts={report?.topPosts}
        campaignPerformance={report?.campaignPerformance}
      />

    </div>
  );
}