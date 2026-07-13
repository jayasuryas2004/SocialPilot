export default function FeatureCard({ icon: Icon, title, description, variant = "default" }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-transform hover:-translate-y-1">
      <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-6 text-purple-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
      {variant === "checkmark" && (
        <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Core Feature
        </div>
      )}
    </div>
  );
}
