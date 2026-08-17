"use client";
import { useState, useEffect } from "react";
import { FolderKanban, Activity, CalendarClock, CheckCircle2 } from "lucide-react";
import { getCampaignStats } from "@/lib/api/campaigns";

export default function CampaignKpiGrid({ campaigns = [] }) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0
  });

  useEffect(() => {
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      let activeCount = 0;
      let scheduledCount = 0;
      let completedCount = 0;
      for (let i = 0; i < campaigns.length; i++) {
        const s = (campaigns[i].status || "").toLowerCase();
        if (s === "active") activeCount++;
        else if (s === "scheduled") scheduledCount++;
        else if (s === "completed") completedCount++;
        else activeCount++;
      }
      setStats({
        total: campaigns.length,
        active: activeCount,
        scheduled: scheduledCount,
        completed: completedCount
      });
    } else {
      getCampaignStats()
        .then((data) => {
          if (data) {
            setStats({
              total: data.total ?? data.total_campaigns ?? 0,
              active: data.active ?? data.active_campaigns ?? 0,
              scheduled: data.scheduled ?? data.draft ?? 0,
              completed: data.completed ?? 0
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load campaign KPI stats:", err);
        });
    }
  }, [campaigns]);

  const kpis = [
    { id: 1, label: "Total Campaigns", value: String(stats.total), icon: FolderKanban, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/60" },
    { id: 2, label: "Active Campaigns", value: String(stats.active), icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
    { id: 3, label: "Scheduled", value: String(stats.scheduled), icon: CalendarClock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
    { id: 4, label: "Completed", value: String(stats.completed), icon: CheckCircle2, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi) => {
        const IconObj = kpi.icon;
        return (
          <div key={`camp-kpi-${kpi.id}`} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={`w-16 h-16 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner`}>
              <IconObj size={32} strokeWidth={2} />
            </div>
            <div className="text-center">
              <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">{kpi.label}</h3>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
