"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/posts", label: "Posts" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/accounts", label: "Accounts" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Reports" },
  { href: "/notifications", label: "Notifications" },
];
const adminItems = [
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 min-h-screen p-4 bg-[#1E1730] text-white">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-sm">S</div>
        <span className="font-bold">SocialPilot</span>
      </div>
      <nav className="space-y-1 text-sm">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`block px-3 py-2 rounded-lg ${pathname === item.href ? "bg-white/10 border-l-2 border-brand-orange" : "text-gray-300 hover:bg-white/5"}`}>
            {item.label}
          </Link>
        ))}
        <p className="text-[11px] uppercase text-gray-500 px-3 pt-4 pb-1">Admin only</p>
        {adminItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`block px-3 py-2 rounded-lg ${pathname === item.href ? "bg-white/10 border-l-2 border-brand-orange" : "text-gray-300 hover:bg-white/5"}`}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}