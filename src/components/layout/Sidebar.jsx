"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, FileText, Megaphone, 
  Users, BarChart2, FileBarChart, Bell,
  ChevronUp
} from "lucide-react";
import { getWorkspaceStatus, subscribeToWorkspaceStream } from "@/lib/api/workspace";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar({ unreadCount: initialCount = 0 }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [liveUnreadCount, setLiveUnreadCount] = useState(initialCount);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial snapshot fetch
    getWorkspaceStatus()
      .then((data) => {
        if (isMounted && data) {
          const count = typeof data.unread_count === "number" ? data.unread_count : 0;
          setLiveUnreadCount(count);
        }
      })
      .catch(() => {});

    // 2. Real-time Server-Sent Events (SSE) stream subscription
    const unsubscribeStream = subscribeToWorkspaceStream(
      (eventData) => {
        if (isMounted && eventData) {
          const count = typeof eventData.unread_count === "number" ? eventData.unread_count : 0;
          setLiveUnreadCount(count);
        }
      },
      (err) => {
        // SSE error notice (handled gracefully by EventSource automatic retry)
      }
    );

    // 3. Local custom event listener for instant UI updates
    const handleUpdate = () => {
      getWorkspaceStatus().then((data) => {
        if (isMounted && data) {
          const count = typeof data.unread_count === "number" ? data.unread_count : 0;
          setLiveUnreadCount(count);
        }
      }).catch(() => {});
    };
    window.addEventListener("notifications_updated", handleUpdate);

    return () => {
      isMounted = false;
      if (typeof unsubscribeStream === "function") {
        unsubscribeStream();
      }
      window.removeEventListener("notifications_updated", handleUpdate);
    };
  }, []);

  const navItems = [
    { href: "/dashboard", labelKey: "dashboard", defaultLabel: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/calendar", labelKey: "calendar", defaultLabel: "Calendar", icon: Calendar },
    { href: "/dashboard/posts", labelKey: "posts", defaultLabel: "Posts", icon: FileText },
    { href: "/dashboard/campaigns", labelKey: "campaigns", defaultLabel: "Campaigns", icon: Megaphone },
    { href: "/dashboard/accounts", labelKey: "accounts", defaultLabel: "Accounts", icon: Users },
    { href: "/dashboard/analytics", labelKey: "analytics", defaultLabel: "Analytics", icon: BarChart2 },
    { href: "/dashboard/reports", labelKey: "reports", defaultLabel: "Reports", icon: FileBarChart },
    { href: "/dashboard/notifications", labelKey: "notifications", defaultLabel: "Notifications", icon: Bell },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside className="w-60 shrink-0 min-h-screen p-4 bg-[#1E1730] dark:bg-slate-950 text-white hidden md:flex flex-col border-r border-slate-800/50 dark:border-slate-900 transition-colors">
      
      {/* Brand Section */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <Image 
          src="/images/logo.svg" 
          alt="SocialPilot Logo" 
          width={40} 
          height={40} 
          className="rounded-xl object-contain shadow-sm shadow-orange-500/100 w-[40px] h-[40px] bg-[#1E1730]"
          priority 
        />
        <span className="font-bold text-lg tracking-tight">SocialPilot</span>
      </div>
      
      {/* Navigation Links with Regional i18n Translation */}
      <nav className="flex-1 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);
          const translatedLabel = t(item.labelKey, item.defaultLabel);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive ? "bg-white/10 border-l-4 border-orange-500 text-white font-bold" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span>{translatedLabel}</span>
              
              {/* DYNAMIC NOTIFICATIONS BADGE */}
              {item.labelKey === "notifications" && liveUnreadCount > 0 && (
                <span className="bg-[#F97316] text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ml-auto shadow-md">
                  {liveUnreadCount > 99 ? "99+" : liveUnreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to Top Button */}
      <div className="pt-4 mt-4 border-t border-white/10">
        <button 
          onClick={scrollToTop}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 group cursor-pointer"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded bg-white/5 group-hover:bg-white/10 transition-colors">
            <ChevronUp size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium">Back to Top</span>
        </button>
      </div>

    </aside>
  );
}