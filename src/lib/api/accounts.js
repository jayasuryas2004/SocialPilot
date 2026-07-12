// ============================================================
// ACCOUNTS API LAYER
// Swap MOCK_MODE to false once your FastAPI backend is ready.
// ============================================================

import {
  FaFacebook, FaInstagram, FaXTwitter, FaLinkedin,
  FaYoutube, FaPinterest, FaRedditAlien,
} from "react-icons/fa6";

export const MOCK_MODE = true;

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

const MOCK_ACCOUNTS = [
  { id: 'acc_1', platform: 'facebook', handle: '@surya_id', displayName: "Surya's Page", status: 'connected', posts: 24, reach: 580000, engagementRate: 10.02, connectedAt: '2026-05-01', tokenExpiresAt: '2026-11-01', avatar: null },
  { id: 'acc_2', platform: 'instagram', handle: '@surya_id', displayName: "Surya Official", status: 'connected', posts: 41, reach: 902000, engagementRate: 14.6, connectedAt: '2026-04-12', tokenExpiresAt: '2026-10-12', avatar: null },
  { id: 'acc_3', platform: 'linkedin', handle: 'Surya Corp', displayName: 'Surya Corp', status: 'expired', posts: 12, reach: 88000, engagementRate: 5.2, connectedAt: '2026-01-15', tokenExpiresAt: '2026-06-15', avatar: null },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function fetchAccounts() {
  if (MOCK_MODE) {
    await delay(500);
    return MOCK_ACCOUNTS;
  }
  const res = await fetch(`${API_BASE}/accounts`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load accounts');
  return res.json();
}

export function connectPlatform(platformId) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          platform: platformId,
          handle: `@new_${platformId}_user`,
          displayName: `New ${PLATFORM_CONFIG[platformId].name} Account`,
          status: 'connected',
          posts: 0,
          reach: 0,
          engagementRate: 0,
          connectedAt: new Date().toISOString().slice(0, 10),
          tokenExpiresAt: null,
          avatar: null,
        });
      }, 1800);
    });
  }

  return new Promise((resolve, reject) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${API_BASE}/oauth/${platformId}/start`,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
      return;
    }

    let settled = false;

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'oauth_success') {
        settled = true;
        cleanup();
        resolve(event.data.account);
      } else if (event.data?.type === 'oauth_error') {
        settled = true;
        cleanup();
        reject(new Error(event.data.message || 'Connection failed. Please try again.'));
      }
    };

    const pollClosed = setInterval(() => {
      if (popup.closed && !settled) {
        cleanup();
        reject(new Error('Connection window was closed before completing.'));
      }
    }, 500);

    function cleanup() {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollClosed);
    }

    window.addEventListener('message', handleMessage);
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
  if (MOCK_MODE) {
    await delay(600);
    return { success: true };
  }
  const res = await fetch(`${API_BASE}/accounts/${accountId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to disconnect account');
  return res.json();
}

export async function updateAccountSettings(accountId, updates) {
  if (MOCK_MODE) {
    await delay(500);
    return { ...updates, id: accountId };
  }
  const res = await fetch(`${API_BASE}/accounts/${accountId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update account');
  return res.json();
}