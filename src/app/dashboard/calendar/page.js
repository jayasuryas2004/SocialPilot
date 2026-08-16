"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ContentCalendarGrid from '@/components/calendar/ContentCalendarGrid';
import DraftsAndIdeasWidget from '@/components/calendar/DraftsAndIdeasWidget';
import PublishingCalendar from '@/components/dashboard/PublishingCalendar';
import EventListWidget from '@/components/calendar/EventListWidget';
import QuickActionsWidget from '@/components/calendar/QuickActionsWidget';
import PostComposerModal from '@/components/posts/PostComposerModal';
import { getAllContent } from '@/lib/api/content';

export default function CalendarPage() {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const loadCalendarContent = useCallback(() => {
    getAllContent()
      .then((items) => {
        setContentList(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error("Failed to load content for calendar:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCalendarContent();
  }, [loadCalendarContent]);

  // Format calendar events from hybrid content array
  const calendarEvents = contentList.map((item, index) => ({
    id: item.id || `cal-${index}`,
    date: item.date || item.scheduled_date || '2026-08-16',
    time: item.time || item.scheduled_time || '10:00 AM',
    status: (item.status || 'scheduled').toLowerCase(),
    platform: (item.platform || 'instagram').toLowerCase(),
    image: item.image_url || item.image || item.media || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop',
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
      image: item.image_url || item.image || item.media || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Content Calendar</h1>
          <p className="text-slate-500 font-medium mt-1">Plan, schedule and track all your multi-channel posts in one place</p>
        </div>
        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 bg-[#311b92] hover:bg-[#4527a0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Post
        </button>
      </div>

      {/* ROW 1: Big Calendar Grid + Drafts Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        
        {/* Left Side: Big Grid (2/3 width) */}
        <div className="lg:col-span-8 h-[850px]">
          <ContentCalendarGrid 
            events={calendarEvents} 
            onRefresh={loadCalendarContent} 
            onOpenComposer={() => setIsComposerOpen(true)}
          />
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
        <QuickActionsWidget onRefresh={loadCalendarContent} />
      </div>

      {/* UNIFIED POST COMPOSER MODAL */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={() => {
          loadCalendarContent();
        }}
        onPostCreated={() => {
          loadCalendarContent();
        }}
      />

    </div>
  );
}
