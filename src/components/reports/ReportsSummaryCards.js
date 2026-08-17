import StatCard from "@/components/common/StatCard";
import { FileText, CalendarClock, Download, HardDrive } from "lucide-react";

export default function ReportsSummaryCards({ totalReports, scheduledCount, formatCount, storageUsed }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard icon={FileText} label="Total reports" value={totalReports} bg="bg-purple-100" fg="text-brand-purple" />
      <StatCard icon={CalendarClock} label="Scheduled reports" value={scheduledCount} bg="bg-orange-100" fg="text-brand-orange" />
      <StatCard icon={Download} label="Export formats" value={formatCount} bg="bg-blue-100" fg="text-blue-600" />
      <StatCard icon={HardDrive} label="Storage used" value={storageUsed} bg="bg-pink-100" fg="text-pink-600" />
    </div>
  );
}