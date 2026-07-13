import { Card, CardContent } from "@/components/ui/card";

// Used by Reports, Accounts, Dashboard — one card style everywhere.
// bg/fg are Tailwind class pairs so each page can pick its own icon color
// while keeping identical padding/typography.
export default function StatCard({ icon: Icon, label, value, bg = "bg-purple-100", fg = "text-brand-purple" }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
          <Icon className={`w-5 h-5 ${fg}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}