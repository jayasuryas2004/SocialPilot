"use client";
import { Plus, Calendar, Activity, Download, Send } from "lucide-react";

export default function QuickActionsWidget() {
  const actions = [
    { id: 1, label: "Create Post", icon: Plus, isPrimary: true },
    { id: 2, label: "Schedule Post", icon: Calendar, isPrimary: false },
    { id: 3, label: "View Analytics", icon: Activity, isPrimary: false },
    { id: 4, label: "Generate Report", icon: Download, isPrimary: false },
    { id: 5, label: "Create Campaign", icon: Send, isPrimary: false },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-4">
        {actions.map((action) => {
          const IconObj = action.icon;
          return (
            <button
              key={action.id}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all hover:shadow-md active:scale-95 ${
                action.isPrimary
                  ? "bg-[#311b92] text-white border border-[#311b92] shadow-sm hover:bg-[#28157a]"
                  : "bg-white text-[#311b92] border border-[#311b92] hover:bg-slate-50"
              }`}
            >
              <IconObj size={20} strokeWidth={2.5} />
              <span className="w-min text-left leading-tight">{action.label.replace(' ', '\n')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}