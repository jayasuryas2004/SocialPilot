// src/components/dashboard/KpiSection.jsx
import { ArrowUpRight, Calendar, Megaphone, Users } from "lucide-react";

export default function KpiSection({ data }) {
  const cards = [
    { title: "Total Posts", value: data.totalPosts.value, sub: data.totalPosts.trend, icon: ArrowUpRight },
    { title: "Scheduled Posts", value: data.scheduled.value, sub: data.scheduled.trend, icon: Calendar },
    { title: "Active Campaigns", value: data.campaigns.value, sub: data.campaigns.trend, icon: Megaphone },
    { title: "Connected Accounts", value: data.accounts.value, sub: "Instagram, FB, LinkedIn", icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-[#5000e6] text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm text-white/80 font-medium">{card.title}</h3>
            <div className="bg-white/20 p-1.5 rounded-full">
              <card.icon size={16} className="text-white" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-4xl font-bold">{card.value}</p>
            <p className="text-[11px] text-white/70 mt-2">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}