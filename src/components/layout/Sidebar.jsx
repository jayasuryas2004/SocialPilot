"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, FileText, Megaphone, 
  Users, BarChart2, FileBarChart, Bell, Settings, ShieldCheck 
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/posts", label: "Posts", icon: FileText },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/accounts", label: "Accounts", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const adminItems = [
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 min-h-screen p-4 bg-[#1E1730] text-white hidden md:flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-lg shadow-lg">S</div>
        <span className="font-bold text-lg tracking-tight">SocialPilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href); // Using startsWith handles sub-routes!
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive ? "bg-white/10 border-l-4 border-orange-500 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
        
        <p className="text-[11px] font-bold uppercase text-gray-500 px-3 pt-6 pb-2 tracking-wider">Admin only</p>
        
        {adminItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive ? "bg-white/10 border-l-4 border-orange-500 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}