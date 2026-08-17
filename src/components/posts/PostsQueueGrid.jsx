"use client";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";

// --- MOCK DATA ---
// Upcoming events: the next posts coming up on the calendar, in schedule order.
const UPCOMING_EVENTS = [
  { id: 'ue-1', title: 'Summer Collection Reel', platform: 'Instagram', time: 'Today, 10:00 AM', status: 'Published' },
  { id: 'ue-2', title: 'B2B Marketing Webinar', platform: 'LinkedIn', time: 'Today, 2:00 PM', status: 'Scheduled' },
  { id: 'ue-3', title: 'Flash Sale Reminder', platform: 'Instagram', time: 'Tomorrow, 4:00 PM', status: 'Scheduled' },
  { id: 'ue-4', title: 'Product Launch Teaser', platform: 'Facebook', time: 'Mar 10, 12:00 PM', status: 'Draft' },
];

// Publishing queue: posts about to go out through the auto-publish pipeline.
const PUBLISHING_QUEUE = [
  { id: 'pq-1', title: 'Summer Collection Reel', platform: 'Instagram', time: 'Today, 10:00 AM', status: 'Published' },
  { id: 'pq-2', title: 'Winter Skincare Tips', platform: 'LinkedIn', time: 'Dec 5, 9:00 AM', status: 'Scheduled' },
  { id: 'pq-3', title: 'Holiday Giveaway', platform: 'X-Twitter', time: 'Dec 20, 3:00 PM', status: 'Failed' },
  { id: 'pq-4', title: 'Customer Success Story', platform: 'LinkedIn', time: 'Jun 15, 10:30 AM', status: 'Failed' },
];

const PLATFORM_ICON = {
  instagram: { icon: FaInstagram, bg: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]' },
  facebook: { icon: FaFacebook, bg: 'bg-[#1877F2]' },
  linkedin: { icon: FaLinkedin, bg: 'bg-[#0A66C2]' },
  'x-twitter': { icon: FaXTwitter, bg: 'bg-[#0f1419]' },
};

const STATUS_STYLES = {
  published: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-purple-100 text-purple-700',
  draft: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-rose-100 text-rose-700',
};

function PlatformIcon({ platform }) {
  const entry = PLATFORM_ICON[platform.toLowerCase()] || PLATFORM_ICON.instagram;
  const Icon = entry.icon;
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${entry.bg}`}>
      <Icon size={18} color="#fff" />
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${STATUS_STYLES[status.toLowerCase()]}`}>
      {status}
    </span>
  );
}

function QueueCard({ title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-1 min-w-0">
      <h3 className="text-sm font-black text-slate-900 mb-4">{title}</h3>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-6 text-center">Nothing here yet.</p>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 border border-slate-100 rounded-xl px-3 py-2.5 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <PlatformIcon platform={item.platform} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                <p className="text-[12px] text-slate-400 font-medium truncate">
                  {item.platform} &bull; {item.time}
                </p>
              </div>
              <StatusPill status={item.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function PostsQueueGrid() {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      <QueueCard title="Upcoming events" items={UPCOMING_EVENTS} />
      <QueueCard title="Publishing Queue" items={PUBLISHING_QUEUE} />
    </div>
  );
}
