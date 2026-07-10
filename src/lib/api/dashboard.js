// src/lib/api/dashboard.js

export async function fetchDashboardMetrics() {
  // Simulating a fast network request
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    kpis: {
      totalPosts: { value: 120, trend: "+15% increased from last month" },
      scheduled: { value: 365, trend: "Next post in 2 hours" },
      campaigns: { value: 38, trend: "Ending this week" },
      accounts: { value: 4, platforms: ['instagram', 'facebook', 'linkedin', 'twitter'] }
    },
    engagementOverview: {
      all: [
        { month: 'June', like: 6503, commands: 5903, share: 6303, saved: 5953 },
        { month: 'July', like: 7100, commands: 6100, share: 6800, saved: 6200 },
        { month: 'August', like: 8500, commands: 7200, share: 7400, saved: 7100 },
      ],
      instagram: [
        { month: 'June', like: 3000, commands: 2000, share: 2500, saved: 4000 },
        { month: 'July', like: 3200, commands: 2100, share: 2700, saved: 4200 },
        { month: 'August', like: 4000, commands: 2500, share: 3000, saved: 4500 },
      ],
      facebook: [
        { month: 'June', like: 1500, commands: 1000, share: 1200, saved: 800 },
        { month: 'July', like: 1600, commands: 1100, share: 1300, saved: 850 },
        { month: 'August', like: 1800, commands: 1300, share: 1500, saved: 950 },
      ],
      // When your real backend is connected, it will generate these arrays for linkedin, youtube, etc.
    },
    followers: [
      { platform: 'Instagram', value: 890 },
      { platform: 'Facebook', value: 560 },
      { platform: 'Pinterest', value: 700 },
      { platform: 'LinkedIn', value: 100 },
      { platform: 'YouTube', value: 450 },
      { platform: 'X-Twitter', value: 320 },
      { platform: 'Reddit', value: 210 },
    ],
    // THIS IS THE UPDATED ARRAY WITH 7 PLATFORMS
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
    // Update this array in your src/lib/api/dashboard.js
    calendarEvents: [
      { 
        id: 1, 
        date: 'May 18', 
        time: '10.00 am', 
        status: 'published', 
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop',
        description: 'Launching the new summer collection today! Check out our stories for exclusive behind-the-scenes content.'
      },
      { 
        id: 2, 
        date: 'May 18', 
        time: '11.30 am', 
        status: 'failed', 
        platform: 'facebook',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
        description: 'Flash sale alert! Get 50% off on all red sneakers for the next 24 hours only.'
      },
      { 
        id: 3, 
        date: 'May 19', 
        time: '10.00 am', 
        status: 'draft', 
        platform: 'pinterest',
        image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop',
        description: '10 ways to style a minimalist workspace. Save this pin for your next office makeover.'
      },
      { 
        id: 4, 
        date: 'May 20', 
        time: '10.00 am', 
        status: 'scheduled', 
        platform: 'linkedin',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
        description: 'We are thrilled to announce our new partnership with TechCorp! Read the full press release below.'
      },
    ]
  };
}