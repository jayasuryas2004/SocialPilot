// Central fake dataset — every api/*.js file reads from here when mocking is on.
export const mockReports = [
  { id: "1", name: "May engagement summary", category: "engagement", format: "pdf", size: "3.2 MB", status: "ready", createdAt: "2026-05-20", fileUrl: "#" },
  { id: "2", name: "Audience growth Q2", category: "audience", format: "excel", size: "1.8 MB", status: "ready", createdAt: "2026-05-18", fileUrl: "#" },
];

export const mockScheduledReports = [
  { id: "1", title: "Weekly engagement digest", frequency: "Every Monday, 9:00 AM", format: "pdf", enabled: true },
];

export const mockPosts = [
  { id: "1", caption: "Summer sale reel", scheduledAt: "2026-05-20T10:00:00", targets: [{ id: "t1", platform: "instagram", status: "published" }] },
  { id: "2", caption: "Product launch teaser", scheduledAt: "2026-05-21T09:00:00", targets: [{ id: "t2", platform: "facebook", status: "scheduled" }] },
];

export const mockUser = { id: "u1", name: "James Okonkwo", email: "james@company.com", role: "creator" };