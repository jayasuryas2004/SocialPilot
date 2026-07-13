"use client";
import FilterBar from "@/components/common/FilterBar";
import { PLATFORM_META } from "@/constants/platforms";
import { REPORT_STATUS, REPORT_STATUS_LABELS } from "@/constants/reportStatus";

export default function ReportsFilterBar({ filters, onChange, campaigns }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <FilterBar
      search={filters.search || ""}
      onSearchChange={(v) => update("search", v)}
      selects={[
        {
          key: "platform",
          label: "Platform",
          value: filters.platform || "all",
          onChange: (v) => update("platform", v),
          // Let FilterBar handle the "All" option automatically
          options: Object.entries(PLATFORM_META).map(([key, meta]) => ({ value: key, label: meta.label })),
        },
        {
          key: "status",
          label: "Status",
          value: filters.status || "all",
          onChange: (v) => update("status", v),
          options: Object.values(REPORT_STATUS).map((s) => ({ value: s, label: REPORT_STATUS_LABELS[s] })),
        },
        {
          key: "campaignId",
          label: "Campaign",
          value: filters.campaignId || "all",
          onChange: (v) => update("campaignId", v),
          options: campaigns.map((c) => ({ value: c.id, label: c.name })),
        },
        {
          key: "timeframe",
          label: "Timeframe",
          value: filters.timeframe || "all",
          onChange: (v) => update("timeframe", v),
          options: [
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ],
        },
      ]}
    />
  );
}