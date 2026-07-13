// src/app/dashboard/calendar/page.js

// Import all your components from the calendar folder based on your screenshot
import ContentCalendarGrid from '@/components/calendar/ContentCalendarGrid';
import DraftsAndIdeasWidget from '@/components/calendar/DraftsAndIdeasWidget';
import PublishingCalendar from '@/components/dashboard/PublishingCalendar';
import EventListWidget from '@/components/calendar/EventListWidget';
import QuickActionsWidget from '@/components/calendar/QuickActionsWidget';

// --- MOCK DATA FOR PRODUCTION-READY UI ---
const MOCK_CALENDAR_EVENTS = [
  { id: 1, date: '2026-11-02', time: '10.00 am', status: 'published', platform: 'instagram', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop', description: 'Winter skincare tips to keep your skin glowing all season.' },
  { id: 2, date: '2026-11-06', time: '11.30 am', status: 'scheduled', platform: 'facebook', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop', description: 'Weekend gateway with benefits. Book now and save 20%!' },
];

const MOCK_DRAFTS_DATA = [
  { id: 101, type: 'post', title: 'Weekend gateway with benefits', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' },
  { id: 102, type: 'post', title: 'Weekend gateway with benefits', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' },
  { id: 103, type: 'draft', title: 'Winter Collection Draft', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop' },
];

const MOCK_WEEKLY_EVENTS = [
  { id: 201, date: 'May 18', time: '10.00 am', status: 'published', platform: 'Instagram', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop' },
  { id: 202, date: 'May 18', time: '10.00 am', status: 'scheduled', platform: 'Instagram', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop' },
  { id: 203, date: 'May 19', time: '10.00 am', status: 'scheduled', platform: 'Instagram', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop' },
];

const MOCK_LIST_EVENTS = [
  { id: 301, title: 'Summer Collection Reel', platform: 'Instagram', date: 'Today', time: '10:00 AM', status: 'published' },
  { id: 302, title: 'Summer Collection Reel', platform: 'Instagram', date: 'Today', time: '10:00 AM', status: 'published' },
  { id: 303, title: 'Summer Collection Reel', platform: 'Instagram', date: 'Today', time: '10:00 AM', status: 'published' },
  { id: 304, title: 'Summer Collection Reel', platform: 'Instagram', date: 'Today', time: '10:00 AM', status: 'published' },
];

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-slate-900 pb-20">
      
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-[28px] font-black tracking-tight text-slate-900">Content Calendar</h1>
        <p className="text-slate-500 font-medium mt-1">Plan, schedule and track your social media activity</p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ROW 1: Big Calendar Grid + Drafts Sidebar                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        
        {/* Left Side: Big Grid (2/3 width) */}
        <div className="lg:col-span-8 h-[850px]">
          <ContentCalendarGrid events={MOCK_CALENDAR_EVENTS} />
        </div>

        {/* Right Side: Drafts Widget (1/3 width) */}
        <div className="lg:col-span-4 h-[850px]">
          <DraftsAndIdeasWidget allData={MOCK_DRAFTS_DATA} />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ROW 2: Full Width Publishing Calendar (Horizontal Week View)      */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-8 w-full">
        <PublishingCalendar events={MOCK_WEEKLY_EVENTS} />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ROW 3: Upcoming Events & Publishing Queue (50/50 Split)           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EventListWidget title="Upcoming events" events={MOCK_LIST_EVENTS} />
        <EventListWidget title="Publishing Queue" events={MOCK_LIST_EVENTS} />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ROW 4: Full Width Quick Actions Row                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="w-full">
        <QuickActionsWidget />
      </div>

    </div>
  );
}
