"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";

export default function FilterBar({ search, onSearchChange, selects = [], date, onDateChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 relative z-30">
      
      {/* Search Box */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
        <Input
          placeholder="Search"
          className="pl-9 rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus-visible:ring-purple-600"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Dynamic Dropdowns */}
      {selects.map((s) => {
        const selectedLabel = s.value === "all" 
          ? s.label 
          : (s.options.find(o => o.value === s.value)?.label || s.label);

        return (
          <Select key={s.key} value={s.value} onValueChange={(v) => s.onChange(v)}>
            <SelectTrigger className="rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm font-bold text-slate-800 dark:text-slate-200 w-auto min-w-[130px] focus:ring-purple-600">
              <SelectValue placeholder={s.label}>
                {selectedLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xl z-50">
              {s.options.map((o) => (
                <SelectItem key={o.value} value={o.value} className="font-medium cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-700">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}

      {/* Conditional Date Picker */}
      {onDateChange && (
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 dark:text-slate-200 pointer-events-none" />
          <Input
            type="date"
            className="pl-9 rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm font-bold text-slate-800 dark:text-white w-[160px] focus-visible:ring-purple-600"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      )}
      
    </div>
  );
}