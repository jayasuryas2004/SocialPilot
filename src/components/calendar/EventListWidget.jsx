"use client";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Globe } from "lucide-react";

export default function EventListWidget({ title, events = [] }) {
  const safeEvents = Array.isArray(events) ? events : [];

  const renderPlatformIcon = (platform) => {
    const key = (platform || '').toLowerCase();
    switch (key) {
      case 'instagram':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-sm flex-shrink-0">
            <FaInstagram size={22} className="text-white" />
          </div>
        );
      case 'facebook':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center shadow-sm flex-shrink-0">
            <FaFacebook size={22} className="text-white" />
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center shadow-sm flex-shrink-0">
            <FaLinkedin size={22} className="text-white" />
          </div>
        );
      case 'x-twitter':
      case 'twitter':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#0f1419] dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
            <FaXTwitter size={22} className="text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
            <Globe size={22} className="text-slate-600 dark:text-slate-200" />
          </div>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'published':
        return <span className="bg-[#dcfce7] dark:bg-emerald-950/80 text-[#166534] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Published</span>;
      case 'scheduled':
        return <span className="bg-[#e9d5ff] dark:bg-purple-950/80 text-[#6b21a8] dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Scheduled</span>;
      case 'draft':
        return <span className="bg-[#fef08a] dark:bg-amber-950/80 text-[#854d0e] dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Draft</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 h-full transition-colors">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {safeEvents.map((event) => (
          <div 
            key={event.id} 
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {renderPlatformIcon(event.platform)}
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-white text-sm">{event.title}</span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                  <span className="capitalize">{event.platform}</span> • {event.date}, {event.time}
                </span>
              </div>
            </div>
            <div>
              {getStatusBadge(event.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
