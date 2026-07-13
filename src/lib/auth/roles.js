export const ROLES = {
  ADMIN: "admin",
  MARKETING: "marketing",
  BUSINESS: "business",
  CREATOR: "creator",
};

const FEATURE_ACCESS = {
  team: [ROLES.ADMIN],
  billing: [ROLES.ADMIN],
  campaigns_full: [ROLES.ADMIN, ROLES.MARKETING, ROLES.BUSINESS],
  analytics_full: [ROLES.ADMIN, ROLES.MARKETING, ROLES.BUSINESS],
};

export function canAccess(role, feature) {
  if (!role) return false;
  const allowed = FEATURE_ACCESS[feature];
  if (!allowed) return true;
  return allowed.includes(role);
}