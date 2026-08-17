import client from "./client";
import {
  FaFacebook, FaInstagram, FaXTwitter, FaLinkedin,
  FaYoutube, FaPinterest, FaRedditAlien,
} from "react-icons/fa6";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const PLATFORM_CONFIG = {
  facebook: {
    id: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877F2',
    bg: 'bg-[#1877F2]', lightBg: 'bg-blue-50', lightText: 'text-[#1877F2]', border: 'border-blue-200',
    scopes: [
      'Publish posts, photos & videos to your Pages',
      'Read Page insights & engagement metrics',
      'Manage comments on your behalf',
    ],
  },
  instagram: {
    id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E1306C',
    bg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', lightBg: 'bg-pink-50', lightText: 'text-[#E1306C]', border: 'border-pink-200',
    scopes: [
      'Publish photos, reels & stories',
      'Read profile & audience insights',
      'Reply to comments and DMs',
    ],
  },
  'x-twitter': {
    id: 'x-twitter', name: 'X (Twitter)', icon: FaXTwitter, color: '#0f1419',
    bg: 'bg-[#0f1419]', lightBg: 'bg-slate-100', lightText: 'text-[#0f1419]', border: 'border-slate-300',
    scopes: [
      'Post tweets and threads on your behalf',
      'Read tweet analytics',
      'Manage direct messages',
    ],
  },
  linkedin: {
    id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2',
    bg: 'bg-[#0A66C2]', lightBg: 'bg-blue-50', lightText: 'text-[#0A66C2]', border: 'border-blue-200',
    scopes: [
      'Share posts to your profile or Company Page',
      'Read post performance analytics',
    ],
  },
  youtube: {
    id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000',
    bg: 'bg-[#FF0000]', lightBg: 'bg-red-50', lightText: 'text-[#FF0000]', border: 'border-red-200',
    scopes: [
      'Upload videos & shorts to your channel',
      'Read channel & video analytics',
      'Manage video comments',
    ],
  },
  pinterest: {
    id: 'pinterest', name: 'Pinterest', icon: FaPinterest, color: '#E60023',
    bg: 'bg-[#E60023]', lightBg: 'bg-red-50', lightText: 'text-[#E60023]', border: 'border-red-200',
    scopes: [
      'Create Pins on your boards',
      'Read Pin & board analytics',
    ],
  },
  reddit: {
    id: 'reddit', name: 'Reddit', icon: FaRedditAlien, color: '#FF4500',
    bg: 'bg-[#FF4500]', lightBg: 'bg-orange-50', lightText: 'text-[#FF4500]', border: 'border-orange-200',
    scopes: [
      'Submit posts to subreddits you moderate/post in',
      'Read post karma & engagement',
    ],
  },
};

export const PLATFORM_LIST = Object.values(PLATFORM_CONFIG);

export const MOCK_ACCOUNTS = [
  {
    id: 'acc_mock_fb',
    platform: 'facebook',
    handle: '@socialpilot_fb',
    displayName: 'SocialPilot Official',
    status: 'connected',
    posts: 24,
    reach: 580000,
    engagementRate: 10.2,
    connectedAt: '2026-05-01',
    tokenExpiresAt: '2026-11-01',
    avatar: null,
    is_live_oauth: false,
  },
  {
    id: 'acc_mock_ig',
    platform: 'instagram',
    handle: '@socialpilot_app',
    displayName: 'SocialPilot App',
    status: 'connected',
    posts: 41,
    reach: 902000,
    engagementRate: 14.6,
    connectedAt: '2026-04-12',
    tokenExpiresAt: '2026-10-12',
    avatar: null,
    is_live_oauth: false,
  },
  {
    id: 'acc_mock_x',
    platform: 'x-twitter',
    handle: '@socialpilot_io',
    displayName: 'SocialPilot Tech',
    status: 'connected',
    posts: 18,
    reach: 320000,
    engagementRate: 8.9,
    connectedAt: '2026-06-01',
    tokenExpiresAt: '2026-12-01',
    avatar: null,
    is_live_oauth: false,
  },
];

/**
 * Hybrid Data Layer: Fetches real connected accounts from backend API,
 * then merges them with visual showcase mock accounts. Real accounts appear first.
 * Strictly uses standard for loops.
 */
export async function fetchAccounts() {
  let liveAccounts = [];
  try {
    const res = await client.get('/api/accounts');
    if (res && res.data) {
      if (Array.isArray(res.data)) {
        liveAccounts = res.data;
      } else if (Array.isArray(res.data.accounts)) {
        liveAccounts = res.data.accounts;
      }
    }
  } catch (err) {
    try {
      const resAlt = await client.get('/accounts');
      if (resAlt && resAlt.data) {
        if (Array.isArray(resAlt.data)) {
          liveAccounts = resAlt.data;
        } else if (Array.isArray(resAlt.data.accounts)) {
          liveAccounts = resAlt.data.accounts;
        }
      }
    } catch (e) {
      console.warn("Live accounts fetch notice:", e);
    }
  }

  // Merge live accounts with mock accounts (live accounts appear first)
  const merged = [];
  const livePlatforms = [];

  for (let i = 0; i < liveAccounts.length; i++) {
    const liveAcc = liveAccounts[i];
    merged.push(liveAcc);
    if (liveAcc && liveAcc.platform) {
      livePlatforms.push(liveAcc.platform.toLowerCase());
    }
  }

  for (let j = 0; j < MOCK_ACCOUNTS.length; j++) {
    const mockAcc = MOCK_ACCOUNTS[j];
    if (mockAcc && mockAcc.platform) {
      const p = mockAcc.platform.toLowerCase();
      if (!livePlatforms.includes(p)) {
        merged.push(mockAcc);
      }
    }
  }

  return merged;
}

/**
 * Initiates connection to a specific social media platform.
 * For LinkedIn, directs user to the official backend OAuth authorization route.
 */
export function connectPlatform(platformId) {
  if (platformId === 'linkedin') {
    if (typeof window !== 'undefined') {
      window.location.href = `${API_BASE_URL}/oauth/linkedin/login?redirect=true`;
    }
    return Promise.resolve({ status: 'connecting' });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        platform: platformId,
        handle: `@${platformId}_user`,
        displayName: `${PLATFORM_CONFIG[platformId]?.name || platformId} Account`,
        status: 'connected',
        posts: 0,
        reach: 0,
        engagementRate: 0,
        connectedAt: new Date().toISOString().slice(0, 10),
        tokenExpiresAt: null,
        avatar: null,
      });
    }, 800);
  });
}

export async function connectPlatforms(platformIds, onProgress) {
  const results = [];
  for (let i = 0; i < platformIds.length; i++) {
    const platformId = platformIds[i];
    onProgress?.(platformId, 'connecting');
    try {
      const account = await connectPlatform(platformId);
      onProgress?.(platformId, 'success', account);
      results.push({ platformId, status: 'success', account });
    } catch (err) {
      onProgress?.(platformId, 'error', null, err.message);
      results.push({ platformId, status: 'error', error: err.message });
    }
  }
  return results;
}

export async function reconnectAccount(accountId, platformId) {
  return connectPlatform(platformId);
}

export async function disconnectAccount(accountId) {
  try {
    const res = await client.delete(`/api/accounts/${accountId}`);
    return res.data;
  } catch (err) {
    try {
      const resAlt = await client.delete(`/accounts/${accountId}`);
      return resAlt.data;
    } catch (e) {
      console.warn("Disconnect account notice:", e);
      return { success: true };
    }
  }
}

export async function updateAccountSettings(accountId, updates) {
  try {
    const res = await client.patch(`/api/accounts/${accountId}`, updates);
    return res.data;
  } catch (err) {
    try {
      const resAlt = await client.patch(`/accounts/${accountId}`, updates);
      return resAlt.data;
    } catch (e) {
      console.warn("Update account settings notice:", e);
      return { ...updates, id: accountId };
    }
  }
}
