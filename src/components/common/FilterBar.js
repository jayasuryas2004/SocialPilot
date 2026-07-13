"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";

export default function FilterBar({ search, onSearchChange, selects = [], date, onDateChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      
      {/* Search Box */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search"
          className="pl-9 rounded-full border-gray-200 shadow-sm focus-visible:ring-purple-600"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Dynamic Dropdowns */}
      {selects.map((s) => {
        // SMART LABELING: If 'all' is selected, display the generic label (e.g., "Platform"). 
        // Otherwise, display the actual selected option's name.
        const selectedLabel = s.value === "all" 
          ? s.label 
          : (s.options.find(o => o.value === s.value)?.label || s.label);

        return (
          <Select key={s.key} value={s.value} onValueChange={(v) => s.onChange(v)}>
            <SelectTrigger className="rounded-full border-gray-200 shadow-sm font-bold text-slate-800 w-auto min-w-[130px] focus:ring-purple-600">
              
              {/* We override SelectValue's default behavior by passing our smart label inside */}
              <SelectValue placeholder={s.label}>
                {selectedLabel}
              </SelectValue>
              
            </SelectTrigger>
            <SelectContent>
              {s.options.map((o) => (
                <SelectItem key={o.value} value={o.value} className="font-medium cursor-pointer">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}

      {/* Conditional Date Picker: Only renders if a date function is passed (Used in Posts, hidden in Reports) */}
      {onDateChange && (
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 pointer-events-none" />
          <Input
            type="date"
            className="pl-9 rounded-full border-gray-200 shadow-sm font-bold text-slate-800 w-[160px] focus-visible:ring-purple-600"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      )}
      
    </div>
  );
}