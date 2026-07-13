import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Lowercase b // Capital B from our previous fixes!
import ReportStatusBadge from "./ReportStatusBadge";
import { REPORT_STATUS } from "@/constants/reportStatus";
import { Download, Trash2 } from "lucide-react";

export default function ReportsTable({ 
  reports, 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll, 
  onDelete 
}) {
  // Check if all current reports in view are selected
  const allSelected = reports.length > 0 && selectedIds?.size === reports.length;

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 hover:bg-transparent">
            {/* Checkbox Header */}
            <TableHead className="w-12 pl-4">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple cursor-pointer w-4 h-4"
                checked={allSelected}
                onChange={onToggleSelectAll}
              />
            </TableHead>
            {/* Dark, bold headers matching the Posts table */}
            <TableHead className="text-slate-900 font-bold text-sm">Report name</TableHead>
            <TableHead className="text-slate-900 font-bold text-sm">Category</TableHead>
            <TableHead className="text-slate-900 font-bold text-sm">Created</TableHead>
            <TableHead className="text-slate-900 font-bold text-sm">Format</TableHead>
            <TableHead className="text-slate-900 font-bold text-sm">Status</TableHead>
            <TableHead className="text-slate-900 font-bold text-sm">Size</TableHead>
            <TableHead className="text-slate-900 font-bold text-sm text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {reports.map((r) => (
            <TableRow key={r.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
              
              {/* Checkbox Cell */}
              <TableCell className="pl-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple cursor-pointer w-4 h-4"
                  checked={selectedIds?.has(r.id)}
                  onChange={() => onToggleSelect(r.id)}
                />
              </TableCell>

              {/* Bold, sleek typography matching the Posts title */}
              <TableCell>
                <span className="font-extrabold text-slate-900 text-base">{r.name}</span>
              </TableCell>

              {/* Thicker metadata text */}
              <TableCell className="font-semibold text-slate-600 capitalize">
                {r.category.replace("_", " ")}
              </TableCell>

              <TableCell className="font-semibold text-slate-600">
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </TableCell>

              {/* Format pill */}
              <TableCell>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                  {r.format}
                </span>
              </TableCell>

              <TableCell>
                <ReportStatusBadge status={r.status} />
              </TableCell>

              <TableCell className="font-semibold text-slate-600">
                {r.status === REPORT_STATUS.READY ? r.size : "—"}
              </TableCell>

              {/* Actions: Stylized Download & Delete */}
              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-2">
                  {r.status === REPORT_STATUS.READY && (
                    <a href={r.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-bold gap-2">
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => onDelete(r.id)}>
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