"use client";
import { useState, useEffect } from "react";
import { fetchDashboardMetrics } from "@/lib/api/dashboard";
import KpiSection from "@/components/dashboard/KpiSection";
import TopChartsGrid from "@/components/dashboard/TopChartsGrid";
import BottomChartsGrid from "@/components/dashboard/BottomChartsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import PublishingCalendar from "@/components/dashboard/PublishingCalendar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({
    kpis: {
      totalPosts: { value: 0, trend: "0 published" },
      scheduled: { value: 0, trend: "Next post queued" },
      campaigns: { value: 0, trend: "0 active campaigns" },
      accounts: { value: 7, platforms: ['instagram', 'facebook', 'linkedin', 'x-twitter', 'youtube', 'reddit', 'pinterest'] }
    },
    engagementOverview: { weekly: { all: [] }, monthly: { all: [] } },
    followers: { weekly: [], monthly: [] },
    platformDistribution: [],
    engagementReach: [],
    calendarEvents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchDashboardMetrics()
      .then((metrics) => {
        if (isMounted && metrics) {
          setData(metrics);
        }
      })
      .catch((err) => {
        console.error("Dashboard metrics load error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const userName = user?.name || "Creator";

  return (
    <div className="p-8 bg-[#f8f9fc] min-h-screen space-y-6">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Welcome Back, {userName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening with your social media today.</p>
      </div>

      <KpiSection data={data.kpis} />
      <TopChartsGrid engagement={data.engagementOverview} followers={data.followers} />
      <BottomChartsGrid distribution={data.platformDistribution} trends={data.engagementReach} />
      <QuickActions />
      <PublishingCalendar events={data.calendarEvents} />
    </div>
  );
}
