import { Star } from "lucide-react";

export default function TestimonialCard({ text, author, role, initial }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex gap-1 mb-4 text-orange-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
        <p className="text-slate-600 italic mb-6">"{text}"</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
          {initial}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{author}</h4>
          <p className="text-slate-500 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}
