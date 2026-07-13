export const REPORT_STATUS = {
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

// Solid-pill style matching PUBLISHED/SCHEDULED/DRAFT/FAILED on your Posts page
export const REPORT_STATUS_STYLES = {
  [REPORT_STATUS.PROCESSING]: "bg-purple-100 text-brand-purple",
  [REPORT_STATUS.READY]: "bg-green-100 text-green-700",
  [REPORT_STATUS.FAILED]: "bg-red-100 text-red-600",
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PROCESSING]: "PROCESSING",
  [REPORT_STATUS.READY]: "READY",
  [REPORT_STATUS.FAILED]: "FAILED",
};

export const REPORT_CATEGORIES = [
  { value: "engagement", label: "Engagement" },
  { value: "audience", label: "Audience growth" },
  { value: "campaign", label: "Campaign" },
  { value: "publishing", label: "Publishing" },
  { value: "platform_comparison", label: "Platform comparison" },
];