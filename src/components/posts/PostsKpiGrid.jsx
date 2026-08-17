"use client";
import { useState, useEffect } from "react";
import { Image as ImageIcon, Send, CalendarDays, Edit3 } from "lucide-react";
import { getPostStats } from "@/lib/api/posts";

export default function PostsKpiGrid({ initialStats }) {
  const [stats, setStats] = useState(initialStats || {
    total: 0,
    scheduled: 0,
    published: 0,
    drafts: 0
  });

  useEffect(() => {
    let isMounted = true;
    getPostStats()
      .then((data) => {
        if (isMounted && data) {
          setStats({
            total: data.total ?? data.total_posts ?? 0,
            scheduled: data.scheduled ?? data.scheduled_posts ?? 0,
            published: data.published ?? data.published_posts ?? 0,
            drafts: data.drafts ?? data.draft_posts ?? 0
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load post KPI stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = [
    { id: 1, label: "Total Posts", value: String(stats.total), icon: ImageIcon, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950/60" },
    { id: 2, label: "Scheduled", value: String(stats.scheduled), icon: Send, color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-950/60" },
    { id: 3, label: "Published", value: String(stats.published), icon: CalendarDays, color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-950/60" },
    { id: 4, label: "Drafts", value: String(stats.drafts), icon: Edit3, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/60" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi) => {
        const IconObj = kpi.icon;
        return (
          <div key={`posts-kpi-${kpi.id}`} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
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
