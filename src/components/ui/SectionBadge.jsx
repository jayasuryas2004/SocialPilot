import { Sparkles } from "lucide-react";

export default function SectionBadge({ text, icon: Icon = Sparkles }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
      <Icon className="w-4 h-4 text-purple-600" />
      <span className="text-sm font-medium text-purple-700 tracking-wide">
        {text}
      </span>
    </div>
  );
}
