"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Activity, Download, Send, Loader2 } from "lucide-react";

export default function QuickActions() {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(null);

  const actions = [
    { name: "Create Post", icon: Plus, href: "/dashboard/posts" },
    { name: "Schedule Post", icon: Calendar, href: "/dashboard/calendar" },
    { name: "View Analytics", icon: Activity, href: "/dashboard/analytics" },
    { name: "Generate Report", icon: Download, href: "/dashboard/reports" },
    { name: "Create Campaign", icon: Send, href: "/dashboard/campaigns" },
  ];

  const handleActionClick = async (action) => {
    setLoadingAction(action.name);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(action.href);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 transition-colors duration-200">
      <h2 className="font-extrabold text-slate-900 dark:text-white mb-4 px-2 text-lg">Quick Actions</h2>
      
      <div className="flex flex-wrap gap-3 md:gap-4 px-2">
        {actions.map((action, i) => {
          const isLoading = loadingAction === action.name;
          
          return (
            <button
              key={i}
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white hover:shadow-lg cursor-pointer ${
                isLoading ? "opacity-70 cursor-not-allowed" : "bg-white dark:bg-slate-800"
              }`}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <action.icon 
                  size={16} 
                  className="transition-colors duration-300 text-indigo-600 dark:text-indigo-300 group-hover:text-white" 
                />
              )}
              <span>{action.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}