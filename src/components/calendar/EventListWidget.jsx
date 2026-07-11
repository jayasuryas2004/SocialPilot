"use client";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Globe } from "lucide-react";

export default function EventListWidget({ title, events }) {
  // Dynamic icon and brand color renderer
  const renderPlatformIcon = (platform) => {
    const key = platform.toLowerCase();
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
        return (
          <div className="w-10 h-10 rounded-xl bg-[#0f1419] flex items-center justify-center shadow-sm flex-shrink-0">
            <FaXTwitter size={22} className="text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
            <Globe size={22} className="text-slate-600" />
          </div>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'published':
        return <span className="bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Published</span>;
      case 'scheduled':
        return <span className="bg-[#e9d5ff] text-[#6b21a8] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Scheduled</span>;
      case 'draft':
        return <span className="bg-[#fef08a] text-[#854d0e] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Draft</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {renderPlatformIcon(event.platform)}
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">{event.title}</span>
                <span className="text-xs font-medium text-slate-400 mt-0.5">
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