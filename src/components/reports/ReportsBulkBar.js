import { Button } from "@/components/ui/button";
import { Trash2, Download, X } from "lucide-react";

export default function ReportsBulkBar({ count, onDelete, onExport, onClear }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 mb-3">
      <p className="text-sm font-medium text-brand-purple">{count} report{count > 1 ? "s" : ""} selected</p>
      <div className="flex items-center gap-4">
        <button onClick={onDelete} className="flex items-center gap-1 text-sm text-red-600 font-medium">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
        <button onClick={onExport} className="flex items-center gap-1 text-sm text-brand-purple font-medium">
          <Download className="w-4 h-4" /> Export
        </button>
        <button onClick={onClear}><X className="w-4 h-4 text-gray-400" /></button>
      </div>
    </div>
  );
}