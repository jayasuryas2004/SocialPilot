"use client";
import { useState } from 'react';
import { 
  FaInstagram, FaFacebook, FaLinkedin, FaYoutube, 
  FaXTwitter, FaReddit, FaPinterest 
} from "react-icons/fa6";
import { Globe, ChevronLeft, ChevronRight, BarChart2, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const PLATFORM_ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  "x-twitter": FaXTwitter,
  reddit: FaReddit,
  pinterest: FaPinterest,
  default: Globe 
};

const PLATFORM_COLORS = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  "x-twitter": "#0f1419",
  reddit: "#FF4500",
  pinterest: "#E60023",
  default: "#94a3b8" 
};

const normalizeEventDate = (event) => {
  if (!event) return '';
  const candidate = event.scheduled_date || event.date || event.scheduled_at || '';
  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (trimmed.includes('T')) {
      return trimmed.split('T')[0];
    }
    if (trimmed.includes('-')) {
      return trimmed;
    }
    const parts = trimmed.split(' ');
    if (parts.length >= 2) {
      const dayNum = parts[1].replace(/\D/g, '').padStart(2, '0');
      if (dayNum) {
        return `2026-08-${dayNum}`;
      }
    }
  }
  return String(candidate);
};

export default function PublishingCalendar({ events = [] }) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('This Week');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 16)); 

  // --- STYLING HELPERS ---
  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'published': return 'bg-[#86efac] dark:bg-emerald-950/80 text-slate-900 dark:text-emerald-200 border-[#4ade80] dark:border-emerald-700'; 
      case 'scheduled': return 'bg-[#e9d5ff] dark:bg-purple-950/80 text-slate-900 dark:text-purple-200 border-[#d8b4fe] dark:border-purple-700'; 
      case 'draft': return 'bg-[#fde047] dark:bg-amber-950/80 text-slate-900 dark:text-amber-200 border-[#facc15] dark:border-amber-700';     
      case 'failed': return 'bg-[#fda4af] dark:bg-rose-950/80 text-slate-900 dark:text-rose-200 border-[#fb7185] dark:border-rose-700';    
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  // --- DYNAMIC DATE ENGINE (Strict standard loops) ---
  const getVisibleDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysArray = [];

    if (viewMode === 'This Week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        daysArray.push(d);
      }
    } else {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push(new Date(year, month, i));
      }
    }
    return daysArray;
  };

  const formatDateString = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatIsoDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatMonthYear = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'This Week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'This Week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const visibleDays = getVisibleDays();

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      
      {/* HEADER & LEGEND */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
          <div className="bg-purple-100 dark:bg-purple-950/60 p-1.5 rounded-xl text-[#311b92] dark:text-purple-300">
            <BarChart2 size={18} />
          </div>
          <span>{t("publishing_calendar", "Publishing Calendar")}</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-5">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 px-4 py-1.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-colors"
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>

          <div className="flex gap-4 text-xs font-bold text-slate-800 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#10b981] border border-slate-900 dark:border-slate-600"></div> Published
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#312e81] dark:bg-purple-600 border border-slate-900 dark:border-slate-600"></div> Scheduled
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#eab308] border border-slate-900 dark:border-slate-600"></div> Draft
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ef4444] border border-slate-900 dark:border-slate-600"></div> Failed
            </span>
          </div>
        </div>
      </div>

      {/* MONTH NAVIGATOR */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl px-4 py-2 transition-colors">
          <button onClick={handlePrev} className="text-[#311b92] dark:text-purple-300 bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900 p-1.5 rounded-full transition-colors cursor-pointer">
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[120px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <button onClick={handleNext} className="text-[#311b92] dark:text-purple-300 bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900 p-1.5 rounded-full transition-colors cursor-pointer">
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      {/* CALENDAR GRID */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-2 transition-colors">
        <div className="grid grid-cols-7 gap-2">
          
          {/* Day Headers (Sun, Mon, Tue...) */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="text-center font-bold text-slate-400 dark:text-slate-400 text-xs py-2 uppercase tracking-wider">
              {dayName}
            </div>
          ))}

          {/* Calendar Days */}
          {visibleDays.map((dayObj, index) => {
            const formattedDateString = formatDateString(dayObj);
            const isoDateString = formatIsoDate(dayObj);
            const dayNumber = dayObj.getDate();
            const isToday = dayObj.toDateString() === new Date().toDateString() || (dayObj.getDate() === 16 && dayObj.getMonth() === 7 && dayObj.getFullYear() === 2026);

            const dayEvents = (events || []).filter((e) => {
              const normDate = normalizeEventDate(e);
              if (normDate === isoDateString) return true;
              if (e.date === formattedDateString) return true;
              if (e.date === isoDateString) return true;
              if (e.scheduled_date === isoDateString) return true;
              return false;
            });

            const gridColumnOffset = (viewMode === 'This Month' && index === 0) 
              ? { gridColumnStart: dayObj.getDay() + 1 } 
              : {};

            return (
              <div 
                key={dayObj.toISOString()} 
                style={gridColumnOffset}
                className="min-h-[140px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2 flex flex-col hover:bg-slate-100/60 dark:hover:bg-slate-850 transition-colors"
              >
                <h3 className={`text-right font-bold text-sm mb-2 ${isToday ? 'text-purple-700 dark:text-purple-400 font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                  {dayNumber}
                </h3>
                
                {/* Events List for this Day */}
                <div className="space-y-2 flex-1">
                  {dayEvents.map((event) => {
                    const platformKey = (event.platform || 'instagram').toLowerCase();
                    const IconComponent = PLATFORM_ICONS[platformKey] || PLATFORM_ICONS.default;
                    const brandColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;

                    return (
                      <div 
                        key={event.id} 
                        className={`relative group px-2 py-1.5 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-md border ${getStatusColor(event.status)}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold">{event.time}</span>
                          {event.is_live && (
                            <span className="bg-[#0A66C2] text-white text-[8px] font-extrabold px-1 rounded tracking-tighter">
                              LIVE
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <div className="bg-white/80 dark:bg-slate-800 p-0.5 rounded shadow-sm flex items-center justify-center">
                            <IconComponent size={12} color={brandColor} />
                          </div>
                          <div className="w-5 h-5 rounded overflow-hidden bg-transparent border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                            {event.image ? (
                              <img src={event.image} alt="post" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={10} className="text-slate-800 dark:text-slate-200" strokeWidth={2.5} />
                            )}
                          </div>
                        </div>

                        {/* HOVER TOOLTIP */}
                        <div className="absolute z-[99] invisible opacity-0 group-hover:visible group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-3 pointer-events-none transition-all duration-200 ease-out">
                          {event.image && (
                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
                              <img src={event.image} alt="Full post preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                              <IconComponent size={14} color={brandColor} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                              {event.platform}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed line-clamp-3">
                            {event.description || "No description provided."}
                          </p>
                          
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 rotate-45 shadow-sm"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
