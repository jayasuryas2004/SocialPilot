"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PostComposerModal from "@/components/posts/PostComposerModal";
import { ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaXTwitter, FaReddit, FaPinterest } from "react-icons/fa6";
import { Globe } from "lucide-react";

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

export default function ContentCalendarGrid({ events }) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); 
  const router = useRouter(); 

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
    switch(status) {
      case 'published': return 'bg-[#86efac] text-slate-900 border-[#4ade80]'; 
      case 'scheduled': return 'bg-[#e9d5ff] text-slate-900 border-[#d8b4fe]'; 
      case 'draft': return 'bg-[#fde047] text-slate-900 border-[#facc15]';     
      case 'failed': return 'bg-[#fda4af] text-slate-900 border-[#fb7185]';    
      default: return 'bg-slate-100 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full">
      
      {/* HEADER SECTION */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2">
            <button onClick={handlePrevMonth} className="text-purple-700 bg-purple-50 hover:bg-purple-100 p-1.5 rounded-full transition-colors">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <span className="font-bold text-slate-900 text-lg min-w-[140px] text-center">
              {formatMonthYear(currentDate)}
            </span>
            <button onClick={handleNextMonth} className="text-purple-700 bg-purple-50 hover:bg-purple-100 p-1.5 rounded-full transition-colors">
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsComposerOpen(true)} // CHANGED: Now opens the modal instead of routing
              className="flex items-center gap-2 bg-[#4a00ff] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3a00cc] transition-all"
            >
              <Plus size={16} />
              Add Post
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="flex-1 flex flex-col px-6 pb-6">
        <div className="grid grid-cols-7 border border-slate-200 rounded-t-xl bg-white shrink-0">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className={`py-3 text-center text-sm font-bold text-slate-500 ${i !== 6 ? 'border-r border-slate-200' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 border-l border-slate-200">
          {calendarCells.map((cell, index) => {
            const isLastRow = index >= calendarCells.length - 7;
            const borderClasses = `border-b border-r border-slate-200 ${isLastRow ? 'rounded-b-none' : ''}`;

            if (cell.type === 'empty' || cell.type === 'empty-end') {
              return (
                <div key={cell.id} className={`bg-slate-50/30 p-3 min-h-[120px] ${borderClasses}`}>
                   {cell.type === 'empty-end' && (
                     <span className="text-sm font-bold text-slate-300">{cell.date}</span>
                   )}
                </div>
              );
            }

            const dayEvents = events.filter(e => e.date === cell.dateString);
            const isToday = cell.date === 1; 

            return (
              <div key={cell.dateString} className={`bg-white p-2 flex flex-col group hover:bg-slate-50/50 transition-colors relative min-h-[120px] ${borderClasses}`}>
                
                <div className="flex justify-between items-start mb-2 px-1 pt-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#311b92] text-white' : 'text-slate-800'}`}>
                    {String(cell.date).padStart(2, '0')}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#311b92] transition-opacity">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  {dayEvents.map(event => {
                    const platformKey = event.platform.toLowerCase();
                    const IconComponent = PLATFORM_ICONS[platformKey] || PLATFORM_ICONS.default;
                    const brandColor = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.default;

                    return (
                      <div key={event.id} className={`relative group/pill px-2 py-1.5 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-md border ${getStatusColor(event.status)}`}>
                        <span className="text-[10px] font-bold">{event.time}</span>
                        <div className="flex items-center gap-1">
                          <div className="bg-white/80 p-0.5 rounded shadow-sm flex items-center justify-center">
                            <IconComponent size={10} color={brandColor} />
                          </div>
                          <div className="w-4 h-4 rounded overflow-hidden bg-transparent border border-black/10 flex items-center justify-center flex-shrink-0">
                            {event.image ? <img src={event.image} alt="post" className="w-full h-full object-cover" /> : <ImageIcon size={8} className="text-slate-800" strokeWidth={2.5} />}
                          </div>
                        </div>

                        {/* PREMIUM TOOLTIP */}
                        <div className="absolute z-[999] invisible opacity-0 group-hover/pill:visible group-hover/pill:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl p-3 pointer-events-none transition-all duration-200 ease-out">
                          {event.image && (
                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-100 border border-slate-100 shadow-inner">
                              <img src={event.image} alt="Full post preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded bg-slate-50 border border-slate-100">
                              <IconComponent size={14} color={brandColor} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{event.platform}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">{event.description || "No description provided."}</p>
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
        <div className="w-full border-t border-slate-200"></div>
      </div>

      {/* ADDED: The Modal Component is now rendered here */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={(data) => {
          console.log("Post saved from Calendar:", data);
        }}
      />
      
    </div>
  );
}