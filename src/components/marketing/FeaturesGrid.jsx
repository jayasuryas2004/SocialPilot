import SectionBadge from "@/components/ui/SectionBadge";
import FeatureCard from "@/components/ui/FeatureCard";
import { Calendar, BarChart3, Users, Zap } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    { icon: Calendar, title: "Smart Scheduling", desc: "Create, schedule and automate posts days, weeks, or even months in advance using an intuitive content calendar." },
    { icon: BarChart3, title: "Advanced Analytics", desc: "Measure engagement, impressions, reach, clicks and audience growth with interactive dashboards." },
    { icon: Users, title: "Team Collaboration", desc: "Invite team members, assign roles, review content, and collaborate on campaigns in one shared workspace." },
    { icon: Zap, title: "Multi-Platform", desc: "Publish seamlessly across Instagram, Facebook, Twitter, LinkedIn, and Pinterest without switching tabs." }
  ];

  return (
    <section className="py-24 bg-[#fafaff]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionBadge text="Core feature" />
          <h2 className="text-4xl font-bold text-slate-900">
            Everything You Need to <span className="text-[#4a00ff]">Dominate Social</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <FeatureCard key={idx} icon={feat.icon} title={feat.title} description={feat.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}
