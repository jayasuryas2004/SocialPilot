"use client";
import { useState, useRef, useEffect } from 'react';
import { Calendar, MoreVertical, Edit, Trash2, Eye, BarChart2 } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

export default function CampaignCard({ campaign, onEdit, onDelete, onView }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- UI HELPERS ---
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-500 text-white shadow-emerald-200",
      scheduled: "bg-purple-500 text-white shadow-purple-200",
      draft: "bg-yellow-400 text-yellow-950 shadow-yellow-100",
      completed: "bg-blue-500 text-white shadow-blue-200"
    };
    
    // Safely handle missing status
    const safeStatus = status ? status.toLowerCase() : 'draft';

    return (
      <span className={`${styles[safeStatus]} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md`}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></div>
        {status || 'Draft'}
      </span>
    );
  };

  const renderPlatformIcons = (platforms = []) => {
    const map = {
      'instagram': <FaInstagram size={12} className="text-white" />,
      'facebook': <FaFacebook size={12} className="text-white" />,
      'linkedin': <FaLinkedin size={12} className="text-white" />,
      'x-twitter': <FaXTwitter size={12} className="text-white" />,
      'youtube': <FaYoutube size={12} className="text-white" />,
    };
    const colors = {
      'instagram': 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      'facebook': 'bg-[#1877F2]',
      'linkedin': 'bg-[#0A66C2]',
      'x-twitter': 'bg-[#0f1419]',
      'youtube': 'bg-[#FF0000]',
    };

    return (
      <div className="flex items-center">
        {platforms.map((p, i) => (
          <div 
            key={i} 
            title={p}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white -ml-2 first:ml-0 shadow-sm transition-transform hover:scale-110 z-${10 - i} ${colors[p.toLowerCase()]}`}
          >
            {map[p.toLowerCase()]}
          </div>
        ))}
      </div>
    );
  };

  // Fallback image if none is provided
  const bgImage = campaign?.image || "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop";

  return (
    <div className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#c4b5fd] transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* 1. IMAGE BANNER & STATUS */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        
        {/* Floating Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          {getStatusBadge(campaign?.status)}
        </div>

        {/* 3-Dot Menu */}
        <div className="absolute top-4 right-4 z-20" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#311b92] transition-colors shadow-sm"
          >
            <MoreVertical size={16} strokeWidth={2.5} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl flex flex-col py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <button 
                onClick={() => { setIsDropdownOpen(false); onView && onView(campaign); }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#311b92] text-left transition-colors"
              >
                <Eye size={16} /> View Details
              </button>
              <button 
                onClick={() => { setIsDropdownOpen(false); onEdit && onEdit(campaign); }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#311b92] text-left transition-colors"
              >
                <Edit size={16} /> Edit Campaign
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              <button 
                onClick={() => { setIsDropdownOpen(false); onDelete && onDelete(campaign.id); }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#e11d48] hover:bg-rose-50 text-left transition-colors"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD CONTENT */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Title & Platforms */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="flex-1">
            <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-[#311b92] transition-colors line-clamp-1">
              {campaign?.title || "Untitled Campaign"}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
              {campaign?.description || campaign?.subtitle || "No description provided for this campaign."}
            </p>
          </div>
        </div>

        {/* Platforms Row */}
        <div className="mt-2 mb-5">
          {renderPlatformIcons(campaign?.platforms)}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 mb-4 mt-auto"></div>

        {/* 3. FOOTER (Dates & Analytics Link) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Calendar size={14} className="text-[#311b92]" />
            <span className="text-[11px] font-bold">
              {campaign?.startDate ? new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} 
              {' - '} 
              {campaign?.endDate ? new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
            </span>
          </div>

          <button 
            onClick={() => onView && onView(campaign)}
            className="w-8 h-8 rounded-full bg-[#f8f5ff] text-[#311b92] flex items-center justify-center hover:bg-[#311b92] hover:text-white transition-colors"
            title="View Analytics"
          >
            <BarChart2 size={14} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}
