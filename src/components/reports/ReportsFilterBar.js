"use client";
import FilterBar from "@/components/common/FilterBar";
import { PLATFORM_META } from "@/constants/platforms";
import { REPORT_STATUS, REPORT_STATUS_LABELS } from "@/constants/reportStatus";

export default function ReportsFilterBar({ filters, onChange, campaigns = [] }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const platformOptions = [
    { value: "all", label: "All platforms" },
    ...Object.entries(PLATFORM_META).map(([key, meta]) => ({ value: key, label: meta.label })),
  ];

  const statusOptions = [
    { value: "all", label: "All statuses" },
    ...Object.values(REPORT_STATUS).map((s) => ({ value: s, label: REPORT_STATUS_LABELS[s] })),
  ];

  const campaignOptions = [
    { value: "all", label: "All campaigns" },
    ...campaigns.map((c) => ({ value: String(c.id), label: c.name || c.title || "Campaign" })),
  ];

  const timeframeOptions = [
    { value: "all", label: "All time" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

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
          options: platformOptions,
        },
        {
          key: "status",
          label: "Status",
          value: filters.status || "all",
          onChange: (v) => update("status", v),
          options: statusOptions,
        },
        {
          key: "campaignId",
          label: "Campaign",
          value: filters.campaignId || "all",
          onChange: (v) => update("campaignId", v),
          options: campaignOptions,
        },
        {
          key: "timeframe",
          label: "Timeframe",
          value: filters.timeframe || "all",
          onChange: (v) => update("timeframe", v),
          options: timeframeOptions,
        },
      ]}
    />
  );
}