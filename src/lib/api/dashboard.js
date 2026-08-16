import client from "./client";

export async function fetchDashboardMetrics() {
  try {
    const response = await client.get("/reports");
    const backendData = response.data || {};
    const backendKpis = backendData.kpis || {};

    const totalPostsVal = backendKpis.total_posts !== undefined ? backendKpis.total_posts : (backendKpis.totalPosts?.value ?? 0);
    const scheduledVal = backendKpis.scheduled_posts !== undefined ? backendKpis.scheduled_posts : (backendKpis.scheduled?.value ?? 0);
    const publishedVal = backendKpis.published_posts !== undefined ? backendKpis.published_posts : 0;
    const campaignsVal = backendKpis.total_campaigns !== undefined ? backendKpis.total_campaigns : (backendKpis.campaigns?.value ?? 0);
    const activeCampaignsVal = backendKpis.active_campaigns !== undefined ? backendKpis.active_campaigns : 0;

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
          instagram: [
            { label: 'Mon', like: 500, commands: 300, share: 400, saved: 600 },
            { label: 'Wed', like: 700, commands: 400, share: 500, saved: 700 },
            { label: 'Fri', like: 900, commands: 600, share: 700, saved: 800 },
          ]
        },
        monthly: {
          all: [
            { label: 'June', like: 6503, commands: 5903, share: 6303, saved: 5953 },
            { label: 'July', like: 7100, commands: 6100, share: 6800, saved: 6200 },
            { label: 'August', like: 8500, commands: 7200, share: 7400, saved: 7100 },
          ],
          instagram: [
            { label: 'June', like: 3000, commands: 2000, share: 2500, saved: 4000 },
            { label: 'July', like: 3200, commands: 2100, share: 2700, saved: 4200 },
            { label: 'August', like: 4000, commands: 2500, share: 3000, saved: 4500 },
          ]
        }
      },
      followers: {
        weekly: [
          { platform: 'Instagram', value: 120 },
          { platform: 'Facebook', value: 85 },
          { platform: 'Pinterest', value: 150 },
          { platform: 'LinkedIn', value: 30 },
          { platform: 'YouTube', value: 90 },
          { platform: 'X-Twitter', value: 45 },
          { platform: 'Reddit', value: 60 },
        ],
        monthly: [
          { platform: 'Instagram', value: 890 },
          { platform: 'Facebook', value: 560 },
          { platform: 'Pinterest', value: 700 },
          { platform: 'LinkedIn', value: 100 },
          { platform: 'YouTube', value: 450 },
          { platform: 'X-Twitter', value: 320 },
          { platform: 'Reddit', value: 210 },
        ]
      },
      platformDistribution: [
        { name: 'instagram', value: 450 },
        { name: 'facebook', value: 320 },
        { name: 'linkedin', value: 250 },
        { name: 'youtube', value: 180 },
        { name: 'x-twitter', value: 120 },
        { name: 'reddit', value: 85 },
        { name: 'pinterest', value: 65 },
      ],
      engagementReach: [
        { date: '21 Apr', engagement: 10000, reach: 15000 },
        { date: '23 Apr', engagement: 22000, reach: 18000 },
        { date: '25 Apr', engagement: 18000, reach: 25000 },
        { date: '27 Apr', engagement: 30000, reach: 20000 },
      ],
      calendarEvents: [
        { 
          id: 1, 
          date: 'May 18', 
          time: '10.00 am', 
          status: 'published', 
          platform: 'instagram',
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop',
          description: 'Launching the new summer collection today! Check out our stories for exclusive behind-the-scenes content.'
        }
      ]
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
