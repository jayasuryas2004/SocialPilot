"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PostComposerModal from "@/components/posts/PostComposerModal";
import { ChevronLeft, ChevronRight, Plus, Image as ImageIcon, Globe } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaXTwitter, FaReddit, FaPinterest } from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";

const PLATFORM_ICONS = {
  instagram: FaInstagram, facebook: FaFacebook, linkedin: FaLinkedin, 
  youtube: FaYoutube, "x-twitter": FaXTwitter, reddit: FaReddit, 
  pinterest: FaPinterest, default: Globe 
};

const PLATFORM_COLORS = {
  instagram: "#E1306C", facebook: "#1877F2", linkedin: "#0A66C2", 
  youtube: "#FF0000", "x-twitter": "#0f1419", reddit: "#FF4500", 
  pinterest: "#E60023", default: "#94a3b8" 
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

export default function ContentCalendarGrid({ events = [], onRefresh, onOpenComposer }) {
  const { t } = useLanguage();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const router = useRouter(); 

  const handleOpenComposer = () => {
    if (onOpenComposer) {
      onOpenComposer();
    } else {
      setIsComposerOpen(true);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startingDayOffset = getFirstDayOfMonth(year, month);

  const calendarCells = [];
  for (let i = 0; i < startingDayOffset; i++) {
    calendarCells.push({ type: 'empty', id: `empty-${i}` });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ type: 'day', date: i, dateString: dateString });
  }

  const remainingCells = 7 - (calendarCells.length % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      calendarCells.push({ type: 'empty-end', id: `empty-end-${i}`, date: String(i + 1).padStart(2, '0') });
    }
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'published': return 'bg-[#86efac] dark:bg-emerald-950/80 text-slate-900 dark:text-emerald-200 border-[#4ade80] dark:border-emerald-700'; 
      case 'scheduled': return 'bg-[#e9d5ff] dark:bg-purple-950/80 text-slate-900 dark:text-purple-200 border-[#d8b4fe] dark:border-purple-700'; 
      case 'draft': return 'bg-[#fde047] dark:bg-amber-950/80 text-slate-900 dark:text-amber-200 border-[#facc15] dark:border-amber-700';     
      case 'failed': return 'bg-[#fda4af] dark:bg-rose-950/80 text-slate-900 dark:text-rose-200 border-[#fb7185] dark:border-rose-700';    
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors duration-200">
      
      {/* HEADER SECTION */}
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl px-4 py-2 transition-colors">
            <button onClick={handlePrevMonth} className="text-[#311b92] dark:text-purple-300 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 p-1.5 rounded-full transition-colors cursor-pointer">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <span className="font-bold text-slate-900 dark:text-white text-lg min-w-[140px] text-center">
              {formatMonthYear(currentDate)}
            </span>
            <button onClick={handleNextMonth} className="text-[#311b92] dark:text-purple-300 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 p-1.5 rounded-full transition-colors cursor-pointer">
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenComposer}
              className="flex items-center gap-2 bg-[#311b92] dark:bg-[#5b21b6] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-all cursor-pointer shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{t("add_post", "Add Post")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="flex-1 flex flex-col px-6 pb-6">
        <div className="grid grid-cols-7 border border-slate-200 dark:border-slate-700 rounded-t-xl bg-white dark:bg-slate-800 shrink-0 transition-colors">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className={`py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400 ${i !== 6 ? 'border-r border-slate-200 dark:border-slate-700' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 border-l border-slate-200 dark:border-slate-700">
          {calendarCells.map((cell, index) => {
            const isLastRow = index >= calendarCells.length - 7;
            const borderClasses = `border-b border-r border-slate-200 dark:border-slate-700 ${isLastRow ? 'rounded-b-none' : ''}`;

            if (cell.type === 'empty' || cell.type === 'empty-end') {
              return (
                <div key={cell.id} className={`bg-slate-50/30 dark:bg-slate-900/40 p-3 min-h-[120px] ${borderClasses}`}>
                   {cell.type === 'empty-end' && (
                     <span className="text-sm font-bold text-slate-300 dark:text-slate-600">{cell.date}</span>
                   )}
                </div>
              );
            }

            const dayEvents = (events || []).filter(e => {
              const normDate = normalizeEventDate(e);
              return normDate === cell.dateString || e.date === cell.dateString || e.scheduled_date === cell.dateString;
            });

            const isCurrentToday = cell.dateString === todayStr || (cell.date === 16 && month === 7 && year === 2026); 

            return (
              <div key={cell.dateString} className={`bg-white dark:bg-slate-800/90 p-2 flex flex-col group hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-colors relative min-h-[120px] ${borderClasses}`}>
                
                <div className="flex justify-between items-start mb-2 px-1 pt-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isCurrentToday ? 'bg-[#311b92] dark:bg-purple-600 text-white shadow-sm font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                    {String(cell.date).padStart(2, '0')}
                  </span>
                  <button 
                    onClick={handleOpenComposer}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#311b92] dark:hover:text-purple-400 transition-opacity cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  {dayEvents.map(event => {
                    const platformKey = (event.platform || 'instagram').toLowerCase();
                    const IconComponent = PLATFORM_ICONS[platformKey] || PLATFORM_ICONS.default;
                    const brandColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;

                    return (
                      <div key={event.id} className={`relative group/pill px-2 py-1.5 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-md border ${getStatusColor(event.status)}`}>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold">{event.time}</span>
                          {event.is_live && (
                            <span className="bg-[#0A66C2] text-white text-[8px] font-extrabold px-1 rounded tracking-tighter">
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="bg-white/80 dark:bg-slate-800 p-0.5 rounded shadow-sm flex items-center justify-center">
                            <IconComponent size={10} color={brandColor} />
                          </div>
                          <div className="w-4 h-4 rounded overflow-hidden bg-transparent border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                            {event.image ? <img src={event.image} alt="post" className="w-full h-full object-cover" /> : <ImageIcon size={8} className="text-slate-800 dark:text-slate-200" strokeWidth={2.5} />}
                          </div>
                        </div>

                        {/* TOOLTIP */}
                        <div className="absolute z-[999] invisible opacity-0 group-hover/pill:visible group-hover/pill:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-3 pointer-events-none transition-all duration-200 ease-out">
                          {event.image && (
                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
                              <img src={event.image} alt="Full post preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                              <IconComponent size={14} color={brandColor} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">{event.platform}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed line-clamp-3">{event.description || "No description provided."}</p>
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
        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
      </div>

      {/* Post Composer Modal */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={() => {
          if (onRefresh) onRefresh();
        }}
      />
      
    </div>
  );
}