"use client";
import { Image as ImageIcon, Send, CalendarDays, Edit3 } from "lucide-react";

export default function PostsKpiGrid() {
  const kpis = [
    { id: 1, label: "Total Posts", value: "240", icon: ImageIcon, color: "text-blue-600", bg: "bg-blue-100" },
    { id: 2, label: "Scheduled", value: "42", icon: Send, color: "text-orange-500", bg: "bg-orange-100" },
    { id: 3, label: "Published", value: "170", icon: CalendarDays, color: "text-rose-500", bg: "bg-rose-100" },
    { id: 4, label: "Drafts", value: "18", icon: Edit3, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi) => {
        const IconObj = kpi.icon;
        return (
          <div key={kpi.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className={`w-16 h-16 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner`}>
              <IconObj size={32} strokeWidth={2} />
            </div>
            <div className="text-center">
              <h3 className="text-slate-800 font-bold text-lg mb-1">{kpi.label}</h3>
              <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}