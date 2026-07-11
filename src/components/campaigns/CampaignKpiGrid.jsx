"use client";
import { FolderKanban, Activity, CalendarClock, CheckCircle2 } from "lucide-react";

export default function CampaignKpiGrid() {
  const kpis = [
    { id: 1, label: "Total Campaigns", value: "240", icon: FolderKanban, color: "text-indigo-600", bg: "bg-indigo-50" },
    { id: 2, label: "Active Campaigns", value: "42", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 3, label: "Scheduled", value: "18", icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-50" },
    { id: 4, label: "Completed", value: "170", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi) => {
        const IconObj = kpi.icon;
        return (
          <div key={kpi.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className={`w-16 h-16 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner`}>
              <IconObj size={32} strokeWidth={2} />
            </div>
            <div className="text-center">
              <h3 className="text-slate-800 font-bold text-lg mb-1">{kpi.label}</h3>
              <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}