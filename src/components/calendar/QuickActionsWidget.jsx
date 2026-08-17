"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Activity, Download, Send, Loader2 } from "lucide-react";
import PostComposerModal from "@/components/posts/PostComposerModal"; 

export default function QuickActionsWidget({ onRefresh }) {
  const router = useRouter();
  
  const [loadingId, setLoadingId] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const actions = [
    { id: 1, label: "Create Post", icon: Plus, isPrimary: true, type: "modal" },
    { id: 2, label: "Schedule Post", icon: Calendar, isPrimary: false, type: "modal" },
    { id: 3, label: "View Analytics", icon: Activity, isPrimary: false, type: "route", href: "/dashboard/analytics" },
    { id: 4, label: "Generate Report", icon: Download, isPrimary: false, type: "route", href: "/dashboard/reports" },
    { id: 5, label: "Create Campaign", icon: Send, isPrimary: false, type: "route", href: "/dashboard/campaigns" },
  ];

  const handleActionClick = async (action) => {
    if (loadingId) return;

    if (action.type === "modal") {
      setIsComposerOpen(true);
      return; 
    }

    setLoadingId(action.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(action.href);
    } catch (error) {
      console.error("Navigation failed:", error);
      setLoadingId(null); 
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-4">
        {actions.map((action) => {
          const IconObj = action.icon;
          const isLoading = loadingId === action.id;
          const isDisabled = loadingId !== null;

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isDisabled}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                action.isPrimary
                  ? "bg-[#311b92] dark:bg-[#5b21b6] text-white border border-[#311b92] dark:border-purple-600 shadow-sm hover:bg-[#28157a] dark:hover:bg-[#4c1d95]"
                  : "bg-white dark:bg-slate-800 text-[#311b92] dark:text-purple-300 border border-[#311b92] dark:border-purple-500/60 hover:bg-slate-50 dark:hover:bg-slate-700"
              } ${
                isDisabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md active:scale-95"
              }`}
            >
              {isLoading ? (
                <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <IconObj size={20} strokeWidth={2.5} />
              )}
              
              <span className="w-min text-left leading-tight">
                {action.label.replace(' ', '\n')}
              </span>
            </button>
          );
        })}
      </div>

      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={(data) => {
          console.log("Post saved from Quick Actions:", data);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}