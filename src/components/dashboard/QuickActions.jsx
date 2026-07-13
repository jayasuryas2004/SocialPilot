// src/components/dashboard/QuickActions.jsx
import { Plus, Calendar, Activity, Download, Send } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { name: "Create Post", icon: Plus, active: true },
    { name: "Schedule Post", icon: Calendar },
    { name: "View Analytics", icon: Activity },
    { name: "Generate Report", icon: Download },
    { name: "Create Campaign", icon: Send },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <h2 className="font-bold text-slate-800 mb-4 px-2">Quick Actions</h2>
      <div className="flex flex-wrap gap-4 px-2">
        {actions.map((action, i) => (
          <button
            key={i}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              action.active 
                ? "bg-[#5000e6] text-white shadow-lg shadow-purple-200" 
                : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <action.icon size={16} />
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
}
