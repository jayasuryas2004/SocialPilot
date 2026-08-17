export const POST_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  FAILED: "failed",
  CANCELLED: "cancelled",
  PENDING_APPROVAL: "pending_approval",
};

export const POST_STATUS_STYLES = {
  [POST_STATUS.DRAFT]: "bg-gray-100 text-gray-700",
  [POST_STATUS.SCHEDULED]: "bg-amber-100 text-amber-800",
  [POST_STATUS.PUBLISHED]: "bg-green-100 text-green-800",
  [POST_STATUS.FAILED]: "bg-red-100 text-red-800",
  [POST_STATUS.CANCELLED]: "bg-gray-200 text-gray-600",
  [POST_STATUS.PENDING_APPROVAL]: "bg-blue-100 text-blue-800",
};

export const POST_STATUS_LABELS = {
  [POST_STATUS.DRAFT]: "Draft",
  [POST_STATUS.SCHEDULED]: "Scheduled",
  [POST_STATUS.PUBLISHED]: "Published",
  [POST_STATUS.FAILED]: "Failed",
  [POST_STATUS.CANCELLED]: "Cancelled",
  [POST_STATUS.PENDING_APPROVAL]: "Pending approval",
};