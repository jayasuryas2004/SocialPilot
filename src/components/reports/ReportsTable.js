import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ReportStatusBadge from "./ReportStatusBadge";
import { REPORT_STATUS } from "@/constants/reportStatus";
import { Download, Trash2 } from "lucide-react";

export default function ReportsTable({ 
  reports = [], 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll, 
  onDelete 
}) {
  const safeReports = Array.isArray(reports) ? reports : [];
  const allSelected = safeReports.length > 0 && selectedIds?.size === safeReports.length;

  return (
    <div className="w-full overflow-x-auto min-h-[300px] pb-6">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-slate-800 hover:bg-transparent">
            {/* Checkbox Header */}
            <TableHead className="w-12 pl-4">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-slate-600 text-brand-purple focus:ring-brand-purple cursor-pointer w-4 h-4"
                checked={allSelected}
                onChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm">Report name</TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm">Category</TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm">Created</TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm">Format</TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm">Status</TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm">Size</TableHead>
            <TableHead className="text-slate-900 dark:text-white font-bold text-sm text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {safeReports.map((r) => (
            <TableRow key={r.id} className="border-b border-gray-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              
              {/* Checkbox Cell */}
              <TableCell className="pl-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-slate-600 text-brand-purple focus:ring-brand-purple cursor-pointer w-4 h-4"
                  checked={selectedIds?.has(r.id)}
                  onChange={() => onToggleSelect(r.id)}
                />
              </TableCell>

              {/* Report Name */}
              <TableCell>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">{r.name}</span>
              </TableCell>

              {/* Category */}
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300 capitalize">
                {r.category ? r.category.replace("_", " ") : "General"}
              </TableCell>

              {/* Created Date */}
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </TableCell>

              {/* Format pill */}
              <TableCell>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider">
                  {r.format}
                </span>
              </TableCell>

              <TableCell>
                <ReportStatusBadge status={r.status} />
              </TableCell>

              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                {r.status === REPORT_STATUS.READY ? r.size : "—"}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-2 relative z-10">
                  {r.status === REPORT_STATUS.READY && (
                    <a 
                      href={r.fileUrl || `http://localhost:8000/api/reports/${r.id}/download`} 
                      target="_blank" 
                      rel="noreferrer"
                      download
                    >
                      <Button variant="ghost" size="sm" className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-950/60 font-bold gap-2 cursor-pointer">
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-full cursor-pointer" onClick={() => onDelete(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}