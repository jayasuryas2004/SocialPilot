import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_STYLES, REPORT_STATUS_LABELS } from "@/constants/reportStatus";

export default function ReportStatusBadge({ status }) {
  return (
    <Badge className={REPORT_STATUS_STYLES[status] || "bg-gray-100 text-gray-700"}>
      {REPORT_STATUS_LABELS[status] || status}
    </Badge>
  );
}
