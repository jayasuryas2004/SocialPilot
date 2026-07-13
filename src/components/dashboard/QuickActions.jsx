"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Activity, Download, Send, Loader2 } from "lucide-react";

export default function QuickActions() {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(null);

  // All actions now share the same behavior, no need for the "primary" flag
  const actions = [
    { name: "Create Post", icon: Plus, href: "/dashboard/posts" },
    { name: "Schedule Post", icon: Calendar, href: "/dashboard/calendar" },
    { name: "View Analytics", icon: Activity, href: "/dashboard/analytics" },
    { name: "Generate Report", icon: Download, href: "/dashboard/reports" },
    { name: "Create Campaign", icon: Send, href: "/dashboard/campaigns" },
  ];

  const handleActionClick = async (action) => {
    // 1. UI Feedback: Show loading state on the specific button clicked
    setLoadingAction(action.name);

    // 2. FRONTEND MOCK: Simulate a database save delay (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Frontend Mock] Action triggered: ${action.name}`);

    // 3. Navigation: Route the user to the correct page
    router.push(action.href);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <h2 className="font-extrabold text-slate-900 mb-4 px-2 text-lg">Quick Actions</h2>
      
      <div className="flex flex-wrap gap-3 md:gap-4 px-2">
        {actions.map((action, i) => {
          const isLoading = loadingAction === action.name;
          
          return (
            <button
              key={i}
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 ${
                isLoading ? "opacity-70 cursor-not-allowed" : "bg-white"
              }`}
            >
              {/* Show Spinner if loading, otherwise show the Icon */}
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <action.icon 
                  size={16} 
                  className="transition-colors duration-300 text-indigo-600 group-hover:text-white" 
                />
              )}
              {action.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}