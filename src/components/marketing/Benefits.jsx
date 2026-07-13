import SectionBadge from "@/components/ui/SectionBadge";
import FeatureCard from "@/components/ui/FeatureCard";
import { Sparkles, Layers, Megaphone, LineChart, Cloud, ShieldCheck } from "lucide-react";

export default function Benefits() {
  const benefits = [
    { icon: Sparkles, title: "AI-Powered Scheduling", desc: "Let AI determine the best times to post." },
    { icon: Layers, title: "Multi-Platform Publishing", desc: "Post everywhere with a single click." },
    { icon: Megaphone, title: "Campaign Tracking", desc: "Monitor your ROI in real-time." },
    { icon: LineChart, title: "Performance Analytics", desc: "Deep dive into your audience data." },
    { icon: Cloud, title: "Secure Cloud Storage", desc: "Keep your media assets organized." },
    { icon: ShieldCheck, title: "Role-Based Access Control", desc: "Manage client and team permissions safely." },
  ];

  return (
    <section className="py-24 bg-[#fafaff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionBadge text="Why SocialPilot" />
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Built for Teams That <span className="text-[#ff6b00]">Move Fast</span>
          </h2>
          <p className="text-slate-600">Enterprise-grade capabilities in one seamless platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <FeatureCard key={idx} icon={benefit.icon} title={benefit.title} description={benefit.desc} variant="checkmark" />
          ))}
        </div>
      </div>
    </section>
  );
}
