"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Activity, Download, Send, Loader2 } from "lucide-react";
// 1. Import your new Composer Modal
import PostComposerModal from "@/components/posts/PostComposerModal"; 

export default function QuickActionsWidget() {
  const router = useRouter();
  
  // State for routing spinner
  const [loadingId, setLoadingId] = useState(null);
  
  // 2. State for the Composer Modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // 3. Added 'type' to distinguish between opening a modal and routing
  const actions = [
    { id: 1, label: "Create Post", icon: Plus, isPrimary: true, type: "modal" },
    { id: 2, label: "Schedule Post", icon: Calendar, isPrimary: false, type: "modal" },
    { id: 3, label: "View Analytics", icon: Activity, isPrimary: false, type: "route", href: "/dashboard/analytics" },
    { id: 4, label: "Generate Report", icon: Download, isPrimary: false, type: "route", href: "/dashboard/reports" },
    { id: 5, label: "Create Campaign", icon: Send, isPrimary: false, type: "route", href: "/dashboard/campaigns" },
  ];

  const handleActionClick = async (action) => {
    // Prevent clicking if another action is currently routing
    if (loadingId) return;

    // 4. INSTANT MODAL OPEN: If it's a modal action, open it and stop here.
    if (action.type === "modal") {
      setIsComposerOpen(true);
      return; 
    }

    // 5. ROUTING LOGIC: Only runs for 'route' types
    setLoadingId(action.id);
    try {
      // Simulate an API call or pre-fetching delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(action.href);
    } catch (error) {
      console.error("Navigation failed:", error);
      setLoadingId(null); 
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-4">
        {actions.map((action) => {
          const IconObj = action.icon;
          const isLoading = loadingId === action.id;
          const isDisabled = loadingId !== null; // Disable buttons while routing

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isDisabled}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                action.isPrimary
                  ? "bg-[#311b92] text-white border border-[#311b92] shadow-sm hover:bg-[#28157a]"
                  : "bg-white text-[#311b92] border border-[#311b92] hover:bg-slate-50"
              } ${
                isDisabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md active:scale-95"
              }`}
            >
              {/* Swap the icon for a spinner if this specific button is routing */}
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

      {/* 6. Render the Modal (invisible until isComposerOpen is true) */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={(data) => {
          console.log("Post saved from Quick Actions:", data);
        }}
      />
    </div>
  );
}