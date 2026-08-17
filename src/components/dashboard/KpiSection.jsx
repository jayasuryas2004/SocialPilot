// src/components/dashboard/KpiSection.jsx
import { ArrowUpRight, Calendar, Megaphone, Users } from "lucide-react";

export default function KpiSection({ data = {} }) {
  const totalPostsVal = data?.totalPosts?.value ?? 0;
  const totalPostsTrend = data?.totalPosts?.trend ?? "0 published";

  const scheduledVal = data?.scheduled?.value ?? 0;
  const scheduledTrend = data?.scheduled?.trend ?? "Next post queued";

  const campaignsVal = data?.campaigns?.value ?? 0;
  const campaignsTrend = data?.campaigns?.trend ?? "Active campaigns";

  const accountsVal = typeof data?.accounts?.value === "number" ? data.accounts.value : 0;
  const platformsList = data?.accounts?.platforms || [];
  const accountsTrend = data?.accounts?.trend || (
    platformsList.length > 0 
      ? platformsList.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")
      : "No accounts connected"
  );

  const cards = [
    { title: "Total Posts", value: totalPostsVal, sub: totalPostsTrend, icon: ArrowUpRight },
    { title: "Scheduled Posts", value: scheduledVal, sub: scheduledTrend, icon: Calendar },
    { title: "Active Campaigns", value: campaignsVal, sub: campaignsTrend, icon: Megaphone },
    { title: "Connected Accounts", value: accountsVal, sub: accountsTrend, icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={`dashboard-kpi-${card.title}`} className="bg-[#5000e6] text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm text-white/80 font-medium">{card.title}</h3>
            <div className="bg-white/20 p-1.5 rounded-full">
              <card.icon size={16} className="text-white" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-4xl font-bold">{card.value}</p>
            <p className="text-[11px] text-white/70 mt-2">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
