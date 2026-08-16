import client from "./client";
import { getAllContent } from "./content";

export async function fetchDashboardMetrics() {
  try {
    const [reportsRes, contentItems] = await Promise.all([
      client.get("/reports"),
      getAllContent().catch(() => [])
    ]);

    const backendData = reportsRes.data || {};
    const backendKpis = backendData.kpis || {};

    const totalPostsVal = backendKpis.total_posts !== undefined ? backendKpis.total_posts : (backendKpis.totalPosts?.value ?? 0);
    const scheduledVal = backendKpis.scheduled_posts !== undefined ? backendKpis.scheduled_posts : (backendKpis.scheduled?.value ?? 0);
    const publishedVal = backendKpis.published_posts !== undefined ? backendKpis.published_posts : 0;
    const campaignsVal = backendKpis.total_campaigns !== undefined ? backendKpis.total_campaigns : (backendKpis.campaigns?.value ?? 0);
    const activeCampaignsVal = backendKpis.active_campaigns !== undefined ? backendKpis.active_campaigns : 0;

    const calendarEvents = Array.isArray(contentItems) && contentItems.length > 0 
      ? contentItems.map((item, idx) => ({
          id: item.id || `cal-${idx}`,
          date: item.date || item.scheduled_date || '2026-08-16',
          time: item.time || item.scheduled_time || '10:00 AM',
          status: (item.status || 'scheduled').toLowerCase(),
          platform: (item.platform || 'instagram').toLowerCase(),
          image: item.image_url || item.image || item.media || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop',
          description: item.description || item.content || item.title || 'Scheduled Social Media Post',
          is_live: item.is_live || item.platform?.toLowerCase() === 'linkedin'
        }))
      : [];

    return {
      kpis: {
        totalPosts: {
          value: totalPostsVal,
          trend: `${publishedVal} published`
        },
        scheduled: {
          value: scheduledVal,
          trend: "Next post queued"
        },
        campaigns: {
          value: campaignsVal,
          trend: `${activeCampaignsVal} active campaigns`
        },
        accounts: {
          value: 7,
          platforms: ['instagram', 'facebook', 'linkedin', 'x-twitter', 'youtube', 'reddit', 'pinterest']
        }
      },
      engagementOverview: {
        weekly: {
          all: [
            { label: 'Mon', like: 1200, commands: 900, share: 1100, saved: 1000 },
            { label: 'Wed', like: 1500, commands: 1100, share: 1300, saved: 1200 },
            { label: 'Fri', like: 1800, commands: 1400, share: 1600, saved: 1500 },
          ],
          linkedin: [
            { label: 'Mon', like: 800, commands: 500, share: 700, saved: 900 },
            { label: 'Wed', like: 1100, commands: 800, share: 1000, saved: 1100 },
            { label: 'Fri', like: 1400, commands: 1000, share: 1300, saved: 1300 },
          ],
          instagram: [
            { label: 'Mon', like: 500, commands: 300, share: 400, saved: 600 },
            { label: 'Wed', grid: 700, commands: 400, share: 500, saved: 700 },
            { label: 'Fri', like: 900, commands: 600, share: 700, saved: 800 },
          ],
          facebook: [
            { label: 'Mon', like: 400, commands: 250, share: 300, saved: 400 },
            { label: 'Wed', like: 550, commands: 350, share: 450, saved: 500 },
            { label: 'Fri', like: 700, commands: 500, share: 600, saved: 650 },
          ],
          "x-twitter": [
            { label: 'Mon', like: 300, commands: 200, share: 500, saved: 300 },
            { label: 'Wed', like: 450, commands: 300, share: 650, saved: 400 },
            { label: 'Fri', like: 600, commands: 450, share: 800, saved: 550 },
          ]
        },
        monthly: {
          all: [
            { label: 'June', like: 6503, commands: 5903, share: 6303, saved: 5953 },
            { label: 'July', like: 7100, commands: 6100, share: 6800, saved: 6200 },
            { label: 'August', like: 8500, commands: 7200, share: 7400, saved: 7100 },
          ],
          linkedin: [
            { label: 'June', like: 3800, commands: 3200, share: 3500, saved: 3400 },
            { label: 'July', like: 4200, commands: 3600, share: 3900, saved: 3700 },
            { label: 'August', like: 5100, commands: 4300, share: 4600, saved: 4400 },
          ],
          instagram: [
            { label: 'June', like: 3000, commands: 2000, share: 2500, saved: 4000 },
            { label: 'July', like: 3200, commands: 2100, share: 2700, saved: 4200 },
            { label: 'August', like: 4000, commands: 2500, share: 3000, saved: 4500 },
          ],
          facebook: [
            { label: 'June', like: 2000, commands: 1500, share: 1800, saved: 2200 },
            { label: 'July', like: 2300, commands: 1700, share: 2000, saved: 2400 },
            { label: 'August', like: 2700, commands: 2000, share: 2300, saved: 2800 },
          ]
        }
      },
      followers: {
        weekly: [
          { platform: 'LinkedIn', value: 850 },
          { platform: 'Instagram', value: 120 },
          { platform: 'Facebook', value: 85 },
          { platform: 'Pinterest', value: 150 },
          { platform: 'YouTube', value: 90 },
          { platform: 'X-Twitter', value: 45 },
          { platform: 'Reddit', value: 60 },
        ],
        monthly: [
          { platform: 'LinkedIn', value: 2450 },
          { platform: 'Instagram', value: 890 },
          { platform: 'Facebook', value: 560 },
          { platform: 'Pinterest', value: 700 },
          { platform: 'YouTube', value: 450 },
          { platform: 'X-Twitter', value: 320 },
          { platform: 'Reddit', value: 210 },
        ]
      },
      platformDistribution: [
        { name: 'linkedin', value: 850 },
        { name: 'instagram', value: 450 },
        { name: 'facebook', value: 320 },
        { name: 'youtube', value: 180 },
        { name: 'x-twitter', value: 120 },
        { name: 'reddit', value: 85 },
        { name: 'pinterest', value: 65 },
      ],
      engagementReach: [
        { date: '10 Aug', engagement: 14000, reach: 21000 },
        { date: '12 Aug', engagement: 22000, reach: 28000 },
        { date: '14 Aug', engagement: 19000, reach: 25000 },
        { date: '16 Aug', engagement: 31000, reach: 35000 },
      ],
      calendarEvents
    };
  } catch (error) {
    console.error("Failed to fetch dashboard metrics from live backend:", error);
    return {
      kpis: {
        totalPosts: { value: 0, trend: "0 published" },
        scheduled: { value: 0, trend: "No scheduled posts" },
        campaigns: { value: 0, trend: "0 active campaigns" },
        accounts: { value: 7, platforms: ['instagram', 'facebook', 'linkedin', 'x-twitter', 'youtube', 'reddit', 'pinterest'] }
      },
      engagementOverview: { weekly: { all: [] }, monthly: { all: [] } },
      followers: { weekly: [], monthly: [] },
      platformDistribution: [],
      engagementReach: [],
      calendarEvents: []
    };
  }
}
