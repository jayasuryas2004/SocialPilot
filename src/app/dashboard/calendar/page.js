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
import { createPost } from '@/lib/api/posts';

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

  const handleSavePost = async (payload) => {
    try {
      await createPost(payload);
    } catch (e) {
      console.error("Failed to save post from calendar modal:", e);
    } finally {
      loadCalendarContent();
      setIsComposerOpen(false);
    }
  };

  // Format calendar events from hybrid content array using standard for loop
  const calendarEvents = [];
  for (let index = 0; index < contentList.length; index++) {
    const item = contentList[index];
    calendarEvents.push({
      id: item.id || `cal-${index}`,
      date: item.date || item.scheduled_date || '2026-08-16',
      time: item.time || item.scheduled_time || '10:00 AM',
      status: (item.status || 'scheduled').toLowerCase(),
      platform: (item.platform || 'instagram').toLowerCase(),
      image: item.image_url || item.image || item.media || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop',
      description: item.description || item.content || item.title || 'Scheduled Social Media Post',
      is_live: item.is_live || (item.platform && item.platform.toLowerCase() === 'linkedin')
    });
  }

  // Format weekly events
  const weeklyEvents = calendarEvents.slice(0, 5);

  // Format drafts data using standard loop
  const draftsData = [];
  for (let idx = 0; idx < contentList.length; idx++) {
    if (draftsData.length >= 4) break;
    const item = contentList[idx];
    const isDraft = (item.status || '').toLowerCase() === 'draft';
    draftsData.push({
      id: item.id || `draft-${idx}`,
      type: isDraft ? 'draft' : 'post',
      title: item.title || (item.content ? item.content.slice(0, 40) : 'Untitled Post'),
      image: item.image_url || item.image || item.media || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop'
    });
  }

  // 1. Upcoming events
  const upcomingEvents = [];
  for (let idx = 0; idx < Math.min(contentList.length, 5); idx++) {
    const item = contentList[idx];
    const titleStr = item.title || item.content || 'Untitled Post';
    upcomingEvents.push({
      id: item.id || `up-${idx}`,
      title: titleStr.length > 35 ? titleStr.slice(0, 35) + '...' : titleStr,
      platform: item.platform || 'Instagram',
      date: item.date || item.scheduled_date || 'Aug 16, 2026',
      time: item.time || item.scheduled_time || '10:00 AM',
      status: (item.status || 'Scheduled').toLowerCase(),
      is_live: item.is_live || (item.platform && item.platform.toLowerCase() === 'linkedin')
    });
  }

  // 2. Publishing Queue
  const scheduledItems = [];
  for (let i = 0; i < contentList.length; i++) {
    const s = (contentList[i].status || '').toLowerCase();
    if (s === 'scheduled' || s === 'pending' || s === 'draft') {
      scheduledItems.push(contentList[i]);
    }
  }

  const queueSource = scheduledItems.length > 0 ? scheduledItems : contentList;
  const publishingQueue = [];
  for (let idx = 0; idx < Math.min(queueSource.length, 5); idx++) {
    const item = queueSource[idx];
    const titleStr = item.title || item.content || 'Queued Content';
    publishingQueue.push({
      id: `queue-${item.id || idx}`,
      title: titleStr.length > 35 ? titleStr.slice(0, 35) + '...' : titleStr,
      platform: item.platform || 'Instagram',
      date: item.date || item.scheduled_date || 'Aug 16, 2026',
      time: item.time || item.scheduled_time || '10:00 AM',
      status: (item.status || 'Scheduled').toLowerCase(),
      is_live: item.is_live || (item.platform && item.platform.toLowerCase() === 'linkedin')
    });
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">Content Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Plan, schedule and track all your multi-channel posts in one place</p>
        </div>
        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 bg-[#311b92] hover:bg-[#4527a0] dark:bg-[#5b21b6] dark:hover:bg-[#4c1d95] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Post
        </button>
      </div>

      {/* ROW 1: Big Calendar Grid + Drafts Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-start">
        
        {/* Left Side: Big Grid (2/3 width) */}
        <div className="lg:col-span-8 min-h-[850px] overflow-hidden">
          <ContentCalendarGrid 
            events={calendarEvents} 
            onRefresh={loadCalendarContent} 
            onOpenComposer={() => setIsComposerOpen(true)}
          />
        </div>

        {/* Right Side: Drafts Widget (1/3 width) */}
        <div className="lg:col-span-4 min-h-[850px] overflow-hidden">
          <DraftsAndIdeasWidget allData={draftsData} />
        </div>
      </div>

      {/* ROW 2: Full Width Publishing Calendar (Horizontal Week View) */}
      <div className="mb-10 w-full">
        <PublishingCalendar events={weeklyEvents} />
      </div>

      {/* ROW 3: Upcoming Events & Publishing Queue (50/50 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
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
        onSave={handleSavePost}
        onPostCreated={loadCalendarContent}
      />

    </div>
  );
}
