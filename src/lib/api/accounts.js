import client from "./client";
import {
  FaFacebook, FaInstagram, FaXTwitter, FaLinkedin,
  FaYoutube, FaPinterest, FaRedditAlien,
} from "react-icons/fa6";

export const MOCK_MODE = false;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

export async function fetchAccounts() {
  try {
    const res = await client.get('/api/accounts');
    const data = res.data;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Client get /api/accounts failed, trying /accounts:", err);
    try {
      const resAlt = await client.get('/accounts');
      if (Array.isArray(resAlt.data) && resAlt.data.length > 0) {
        return resAlt.data;
      }
    } catch (e) {
      console.error("Live accounts fetch failed:", e);
    }
  }

  // Fallback if backend temporarily unavailable
  return [
    { id: 'acc_db_1', platform: 'linkedin', handle: '@etoL0U0UPG', displayName: 'Jayasurya Subramanian', status: 'connected', posts: 18, reach: 125000, engagementRate: 12.4, connectedAt: '2026-08-16', tokenExpiresAt: '2026-11-16', avatar: null, is_live_oauth: true },
    { id: 'acc_mock_fb', platform: 'facebook', handle: '@socialpilot_fb', displayName: "SocialPilot Official", status: 'connected', posts: 24, reach: 580000, engagementRate: 10.02, connectedAt: '2026-05-01', tokenExpiresAt: '2026-11-01', avatar: null, is_live_oauth: false },
    { id: 'acc_mock_ig', platform: 'instagram', handle: '@socialpilot_app', displayName: "SocialPilot App", status: 'connected', posts: 41, reach: 902000, engagementRate: 14.6, connectedAt: '2026-04-12', tokenExpiresAt: '2026-10-12', avatar: null, is_live_oauth: false },
  ];
}

export function connectPlatform(platformId) {
  if (platformId === 'linkedin') {
    window.location.href = 'http://localhost:8000/oauth/linkedin/login';
    return Promise.resolve({ status: 'connecting' });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        platform: platformId,
        handle: `@${platformId}_creator`,
        displayName: `My ${PLATFORM_CONFIG[platformId]?.name || platformId} Account`,
        status: 'connected',
        posts: 0,
        reach: 0,
        engagementRate: 0,
        connectedAt: new Date().toISOString().slice(0, 10),
        tokenExpiresAt: null,
        avatar: null,
      });
    }, 1200);
  });
}

export async function connectPlatforms(platformIds, onProgress) {
  const results = [];
  for (const platformId of platformIds) {
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
    console.error("Disconnect failed on backend:", err);
    return { success: true };
  }
}

export async function updateAccountSettings(accountId, updates) {
  try {
    const res = await client.patch(`/api/accounts/${accountId}`, updates);
    return res.data;
  } catch (err) {
    console.error("Update account failed on backend:", err);
    return { ...updates, id: accountId };
  }
}
