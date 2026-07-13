import { Mail, Phone, MapPin } from "lucide-react";

const CARDS = [
  { icon: Mail, title: "Email us", value: "hello@socialpilot.app", bg: "bg-purple-100", fg: "text-brand-purple" },
  { icon: Phone, title: "Call us", value: "+1 (555) 123-4567", bg: "bg-orange-100", fg: "text-brand-orange" },
  { icon: MapPin, title: "Visit us", value: "San Francisco, CA", bg: "bg-blue-100", fg: "text-blue-600" },
];

export default function ContactInfoCards() {
  return (
    <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-6 -mt-8 mb-16 relative z-10">
      {CARDS.map((c) => (
        <div key={c.title} className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 text-center">
          <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center mx-auto mb-3`}>
            <c.icon className={`w-5 h-5 ${c.fg}`} />
          </div>
          <p className="font-semibold text-slate-800 mb-1">{c.title}</p>
          <p className="text-sm text-slate-500">{c.value}</p>
        </div>
      ))}
    </div>
  );
}