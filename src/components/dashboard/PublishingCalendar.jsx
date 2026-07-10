"use client";
import { useState } from 'react';
import { 
  FaInstagram, FaFacebook, FaLinkedin, FaYoutube, 
  FaXTwitter, FaReddit, FaPinterest 
} from "react-icons/fa6";
import { Globe, ChevronLeft, ChevronRight, BarChart2, Image as ImageIcon } from "lucide-react";

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

export default function PublishingCalendar({ events }) {
  // --- DYNAMIC STATE ---
  const [viewMode, setViewMode] = useState('This Week');
  // Initialize to May 17, 2026 to match your existing mock data
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 17)); 

  // --- STYLING HELPERS ---
  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-[#86efac] text-slate-900 border-[#4ade80]'; 
      case 'scheduled': return 'bg-[#e9d5ff] text-slate-900 border-[#d8b4fe]'; 
      case 'draft': return 'bg-[#fde047] text-slate-900 border-[#facc15]';     
      case 'failed': return 'bg-[#fda4af] text-slate-900 border-[#fb7185]';    
      default: return 'bg-slate-100 text-slate-900 border-slate-200';
    }
  };

  // --- DYNAMIC DATE ENGINE ---
  // Calculates the days to show based on "Week" or "Month" view
  const getVisibleDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysArray = [];

    if (viewMode === 'This Week') {
      // Find the Sunday of the current week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        daysArray.push(d);
      }
    } else {
      // Find all days in the current month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push(new Date(year, month, i));
      }
    }
    return daysArray;
  };

  // Formats date to "May 18" to match your API data
  const formatDateString = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Formats the header to "May 2026"
  const formatMonthYear = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // --- NAVIGATION HELPERS ---
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
    <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
      
      {/* ----------------------------------------------------------------- */}
      {/* HEADER & LEGEND                                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <div className="bg-purple-100 p-1.5 rounded-lg text-purple-700">
            <BarChart2 size={18} />
          </div>
          Publishing calendar
        </h2>
        
        <div className="flex items-center gap-5">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border border-slate-300 px-4 py-1.5 rounded-xl text-sm font-bold outline-none hover:bg-slate-50 cursor-pointer bg-white shadow-sm"
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>

          <div className="flex gap-4 text-xs font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#10b981] border border-slate-900"></div> Published
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#312e81] border border-slate-900"></div> Scheduled
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#eab308] border border-slate-900"></div> Draft
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ef4444] border border-slate-900"></div> Failed
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MONTH NAVIGATOR                                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2">
          <button onClick={handlePrev} className="text-purple-700 bg-purple-100 hover:bg-purple-200 p-1 rounded-full transition-colors">
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <span className="font-bold text-sm text-slate-900 min-w-[100px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <button onClick={handleNext} className="text-purple-700 bg-purple-100 hover:bg-purple-200 p-1 rounded-full transition-colors">
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      {/* ----------------------------------------------------------------- */}
      {/* CALENDAR GRID (Fixed Clipping Issue + 7 Columns)                  */}
      {/* ----------------------------------------------------------------- */}
      {/* Removed overflow-hidden so tooltips can float freely */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-sm p-2">
        <div className="grid grid-cols-7 gap-2">
          
          {/* Day Headers (Sun, Mon, Tue...) */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="text-center font-bold text-slate-400 text-xs py-2 uppercase tracking-wider">
              {dayName}
            </div>
          ))}

          {/* Calendar Days */}
          {visibleDays.map((dayObj, index) => {
            const formattedDateString = formatDateString(dayObj); // e.g. "May 18"
            const dayNumber = dayObj.getDate(); // e.g. 18
            const isToday = dayObj.toDateString() === new Date().toDateString();

            // Filter API events to see if any belong on this specific day
            const dayEvents = events.filter(e => e.date === formattedDateString);

            // If we are in month mode and the first day doesn't start on Sunday, 
            // we add an offset margin to push it to the right column
            const gridColumnOffset = (viewMode === 'This Month' && index === 0) 
              ? { gridColumnStart: dayObj.getDay() + 1 } 
              : {};

            return (
              <div 
                key={dayObj.toISOString()} 
                style={gridColumnOffset}
                className="min-h-[140px] bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col"
              >
                {/* Day Number Number */}
                <h3 className={`text-right font-bold text-sm mb-2 ${isToday ? 'text-purple-600' : 'text-slate-700'}`}>
                  {dayNumber}
                </h3>
                
                {/* Events List for this Day */}
                <div className="space-y-2 flex-1">
                  {dayEvents.map((event) => {
                    const platformKey = event.platform.toLowerCase();
                    const IconComponent = PLATFORM_ICONS[platformKey] || PLATFORM_ICONS.default;
                    const brandColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;

                    return (
                      <div 
                        key={event.id} 
                        className={`relative group px-2 py-1.5 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-md border ${getStatusColor(event.status)}`}
                      >
                        <span className="text-[11px] font-bold">{event.time}</span>
                        
                        <div className="flex items-center gap-1">
                          <div className="bg-white/80 p-0.5 rounded shadow-sm flex items-center justify-center">
                            <IconComponent size={12} color={brandColor} />
                          </div>
                          <div className="w-5 h-5 rounded overflow-hidden bg-transparent border border-black/10 flex items-center justify-center flex-shrink-0">
                            {event.image ? (
                              <img src={event.image} alt="post" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={10} className="text-slate-800" strokeWidth={2.5} />
                            )}
                          </div>
                        </div>

                        {/* HOVER TOOLTIP - Will no longer clip! */}
                        {/* Z-[99] ensures it stays above other calendar rows */}
                        <div className="absolute z-[99] invisible opacity-0 group-hover:visible group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl p-3 pointer-events-none transition-all duration-200 ease-out">
                          
                          {event.image && (
                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-100 border border-slate-100 shadow-inner">
                              <img src={event.image} alt="Full post preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded bg-slate-50 border border-slate-100">
                              <IconComponent size={14} color={brandColor} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                              {event.platform}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
                            {event.description || "No description provided."}
                          </p>
                          
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45 shadow-sm"></div>
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