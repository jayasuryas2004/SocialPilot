import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ icon: Icon, label, value, bg = "bg-purple-100 dark:bg-purple-950/60", fg = "text-brand-purple dark:text-purple-300" }) {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
          <Icon className={`w-5 h-5 ${fg}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}