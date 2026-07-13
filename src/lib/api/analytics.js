// ============================================================
// ANALYTICS API LAYER
// Swap MOCK_MODE to false once your FastAPI backend is ready.
// Every function already has the real fetch() call written —
// it's just short-circuited by the mock branch for now.
// ============================================================

export const MOCK_MODE = true;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// --- PLATFORM DISTRIBUTION (donut chart) ---------------------------------
const MOCK_DISTRIBUTION = [
  { name: 'Instagram', value: 420 },
  { name: 'Facebook', value: 310 },
  { name: 'LinkedIn', value: 180 },
  { name: 'X-Twitter', value: 150 },
  { name: 'YouTube', value: 90 },
  { name: 'Pinterest', value: 70 },
  { name: 'Reddit', value: 40 },
];

export async function fetchPlatformDistribution() {
  if (MOCK_MODE) {
    await delay(400);
    return MOCK_DISTRIBUTION;
  }
  const res = await fetch(`${API_BASE}/analytics/distribution`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load platform distribution');
  return res.json();
}

// --- ENGAGEMENT VS REACH TRENDS (area chart) -----------------------------
const MOCK_TRENDS = [
  { date: 'Mon', engagement: 240, reach: 400 },
  { date: 'Tue', engagement: 310, reach: 520 },
  { date: 'Wed', engagement: 280, reach: 480 },
  { date: 'Thu', engagement: 390, reach: 610 },
  { date: 'Fri', engagement: 450, reach: 700 },
  { date: 'Sat', engagement: 380, reach: 640 },
  { date: 'Sun', engagement: 420, reach: 690 },
];

export async function fetchEngagementTrends() {
  if (MOCK_MODE) {
    await delay(400);
    return MOCK_TRENDS;
  }
  const res = await fetch(`${API_BASE}/analytics/trends`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load engagement trends');
  return res.json();
}

// --- TOTAL FOLLOWERS BY PLATFORM ------------------------------------------
// Backend should return both weekly & monthly datasets so the frontend
// toggle doesn't need to refetch — swap this shape to match your API.
const MOCK_FOLLOWERS = {
  weekly: [
    { platform: 'Instagram', value: 12400 },
    { platform: 'Facebook', value: 9800 },
    { platform: 'LinkedIn', value: 6200 },
    { platform: 'X-Twitter', value: 5400 },
    { platform: 'YouTube', value: 4100 },
    { platform: 'Pinterest', value: 2600 },
    { platform: 'Reddit', value: 1300 },
  ],
  monthly: [
    { platform: 'Instagram', value: 48200 },
    { platform: 'Facebook', value: 39600 },
    { platform: 'LinkedIn', value: 24800 },
    { platform: 'X-Twitter', value: 21100 },
    { platform: 'YouTube', value: 16700 },
    { platform: 'Pinterest', value: 9900 },
    { platform: 'Reddit', value: 5200 },
  ],
};

export async function fetchFollowers(timeline = 'weekly') {
  if (MOCK_MODE) {
    await delay(400);
    return MOCK_FOLLOWERS[timeline] || MOCK_FOLLOWERS.weekly;
  }
  const res = await fetch(`${API_BASE}/analytics/followers?timeline=${timeline}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load followers data');
  return res.json();
}
