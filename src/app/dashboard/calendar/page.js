"use client";

import { useState, useEffect } from 'react';
import ContentCalendarGrid from '@/components/calendar/ContentCalendarGrid';
import DraftsAndIdeasWidget from '@/components/calendar/DraftsAndIdeasWidget';
import PublishingCalendar from '@/components/dashboard/PublishingCalendar';
import EventListWidget from '@/components/calendar/EventListWidget';
import QuickActionsWidget from '@/components/calendar/QuickActionsWidget';
import { getAllContent } from '@/lib/api/content';

export default function CalendarPage() {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAllContent()
      .then((items) => {
        if (isMounted) {
          setContentList(Array.isArray(items) ? items : []);
        }
      })
      .catch((err) => {
        console.error("Failed to load content for calendar:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Format calendar events from hybrid content array
  const calendarEvents = contentList.map((item, index) => ({
    id: item.id || `cal-${index}`,
    date: item.date || '2026-11-02',
    time: item.time || '10:00 AM',
    status: (item.status || 'scheduled').toLowerCase(),
    platform: (item.platform || 'instagram').toLowerCase(),
    image: item.image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop',
    description: item.description || item.content || item.title || 'Scheduled Social Media Post',
    is_live: item.is_live || item.platform?.toLowerCase() === 'linkedin'
  }));

  // Format weekly events
  const weeklyEvents = calendarEvents.slice(0, 5);

  // Format drafts data
  const draftsData = contentList
    .filter((item) => (item.status || '').toLowerCase() === 'draft')
    .concat(contentList.slice(0, 3))
    .slice(0, 4)
    .map((item, idx) => ({
      id: item.id || `draft-${idx}`,
      type: (item.status || '').toLowerCase() === 'draft' ? 'draft' : 'post',
      title: item.title || 'Untitled Post',
      image: item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop'
    }));

  // Format list events
  const upcomingEvents = calendarEvents
    .filter((e) => e.status === 'scheduled' || e.status === 'published')
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      title: e.description?.length > 30 ? e.description.slice(0, 30) + '...' : e.description,
      platform: e.platform.charAt(0).toUpperCase() + e.platform.slice(1),
      date: e.date,
      time: e.time,
      status: e.status,
      is_live: e.is_live
    }));

  const publishingQueue = calendarEvents
    .filter((e) => e.status === 'scheduled' || e.status === 'draft')
    .concat(calendarEvents)
    .slice(0, 4)
    .map((e) => ({
      id: `queue-${e.id}`,
      title: e.description?.length > 30 ? e.description.slice(0, 30) + '...' : e.description,
      platform: e.platform.charAt(0).toUpperCase() + e.platform.slice(1),
      date: e.date,
      time: e.time,
      status: e.status,
      is_live: e.is_live
    }));

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-slate-900 pb-20">
      
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Content Calendar</h1>
        <p className="text-slate-500 font-medium mt-1">Plan, schedule and track all your multi-channel posts in one place</p>
      </div>

      {/* ROW 1: Big Calendar Grid + Drafts Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        
        {/* Left Side: Big Grid (2/3 width) */}
        <div className="lg:col-span-8 h-[850px]">
          <ContentCalendarGrid events={calendarEvents} />
        </div>

        {/* Right Side: Drafts Widget (1/3 width) */}
        <div className="lg:col-span-4 h-[850px]">
          <DraftsAndIdeasWidget allData={draftsData} />
        </div>
      </div>

      {/* ROW 2: Full Width Publishing Calendar (Horizontal Week View) */}
      <div className="mb-8 w-full">
        <PublishingCalendar events={weeklyEvents} />
      </div>

      {/* ROW 3: Upcoming Events & Publishing Queue (50/50 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EventListWidget title="Upcoming events" events={upcomingEvents} />
        <EventListWidget title="Publishing Queue" events={publishingQueue} />
      </div>

      {/* ROW 4: Full Width Quick Actions Row */}
      <div className="w-full">
        <QuickActionsWidget />
      </div>

    </div>
  );
}
