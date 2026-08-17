"use client";
import { useState, useEffect, Suspense } from "react";
import { fetchDashboardMetrics } from "@/lib/api/dashboard";
import KpiSection from "@/components/dashboard/KpiSection";
import TopChartsGrid from "@/components/dashboard/TopChartsGrid";
import BottomChartsGrid from "@/components/dashboard/BottomChartsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import PublishingCalendar from "@/components/dashboard/PublishingCalendar";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Concurrent non-blocking fetch
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
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const userName = user?.name || "Creator";

  return (
    <div className="p-8 bg-[#f8f9fc] dark:bg-slate-950 min-h-screen space-y-6 transition-colors duration-200">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {t("welcome_back", "Welcome Back")}, {userName} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your social media today.</p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <Suspense fallback={<DashboardSkeleton />}>
          <KpiSection data={data?.kpis} />
          <TopChartsGrid engagement={data?.engagementOverview} followers={data?.followers} />
          <BottomChartsGrid distribution={data?.platformDistribution} trends={data?.engagementReach} />
          <QuickActions />
          <PublishingCalendar events={data?.calendarEvents} />
        </Suspense>
      )}
    </div>
  );
}
