// src/app/dashboard/page.js
import { fetchDashboardMetrics } from "@/lib/api/dashboard";
import KpiSection from "@/components/dashboard/KpiSection";
import TopChartsGrid from "@/components/dashboard/TopChartsGrid";
import BottomChartsGrid from "@/components/dashboard/BottomChartsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import PublishingCalendar from "@/components/dashboard/PublishingCalendar";

export default async function DashboardPage() {
  // Fetch all data required for the dashboard simultaneously
  const data = await fetchDashboardMetrics();

  return (
    <div className="p-8 bg-[#f8f9fc] min-h-screen space-y-6">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Welcome Back, James Okonkwo 👋
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
