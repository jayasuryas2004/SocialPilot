"use client";
import { useState, useRef, useEffect } from 'react';
import {
  X, Image as ImageIcon, Calendar, Clock, Hash,
  Send, Loader2, Smile, MapPin
} from 'lucide-react';
import {
  FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube
} from "react-icons/fa6";

const PLATFORMS = [
  { id: 'instagram', icon: FaInstagram, color: 'hover:text-[#E1306C] hover:bg-pink-50', activeColor: 'text-[#E1306C] bg-pink-50 border-pink-200' },
  { id: 'facebook', icon: FaFacebook, color: 'hover:text-[#1877F2] hover:bg-blue-50', activeColor: 'text-[#1877F2] bg-blue-50 border-blue-200' },
  { id: 'linkedin', icon: FaLinkedin, color: 'hover:text-[#0A66C2] hover:bg-blue-50', activeColor: 'text-[#0A66C2] bg-blue-50 border-blue-200' },
  { id: 'x-twitter', icon: FaXTwitter, color: 'hover:text-[#0f1419] hover:bg-slate-100', activeColor: 'text-[#0f1419] bg-slate-100 border-slate-300' },
];

// campaigns now comes in as a prop from page.js's shared state,
// instead of a frozen local MOCK_CAMPAIGNS array.
export default function PostComposerModal({ isOpen, onClose, initialCampaignId = '', onSave, campaigns = [] }) {
  const fileInputRef = useRef(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram']);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCampaignId(initialCampaignId ? String(initialCampaignId) : '');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialCampaignId]);

  if (!isOpen) return null;

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setMedia(previewUrl);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setContent('');
    setMedia(null);
    setSelectedPlatforms(['instagram']);
    setScheduleDate('');
    setScheduleTime('');
    setCampaignId('');
  };

  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0) return alert("Please select at least one platform.");
    if (!content.trim() && !media) return alert("Please add some content or an image.");
    if (!scheduleDate || !scheduleTime) return alert("Please select a date and time.");

    setIsSubmitting(true);

    const postPayload = {
      platforms: selectedPlatforms,
      content: content.trim(),
      mediaFile: media,
      scheduledAt: `${scheduleDate}T${scheduleTime}`,
      campaignId: campaignId || null,
    };

    try {
      if (onSave) await onSave(postPayload);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to save post:", err);
      alert("Failed to schedule post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-full">

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-slate-900">Create Post</h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F8F9FA]">

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Platforms</label>
            <div className="flex gap-3">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isActive = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200 shadow-sm
                      ${isActive ? platform.activeColor : `border-slate-200 text-slate-400 bg-white ${platform.color}`}
                    `}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mb-6 focus-within:border-[#311b92] focus-within:ring-1 focus-within:ring-[#311b92] transition-all">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with your audience?"
              className="w-full h-32 px-4 py-3 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
            />

            {media && (
              <div className="relative mx-4 mb-4 w-32 h-32 rounded-xl border border-slate-200 overflow-hidden group">
                <img src={media} alt="Upload preview" className="w-full h-full object-cover" />
                <button onClick={removeMedia} className="absolute top-2 right-2 bg-slate-900/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#311b92] hover:bg-purple-50 rounded-lg transition-colors" title="Add Media">
                  <ImageIcon size={18} strokeWidth={2.5} />
                </button>
                <button className="p-2 text-slate-400 hover:text-[#311b92] hover:bg-purple-50 rounded-lg transition-colors" title="Add Emoji">
                  <Smile size={18} strokeWidth={2.5} />
                </button>
                <button className="p-2 text-slate-400 hover:text-[#311b92] hover:bg-purple-50 rounded-lg transition-colors" title="Add Location">
                  <MapPin size={18} strokeWidth={2.5} />
                </button>
              </div>
              <span className={`text-xs font-bold ${content.length > 280 ? 'text-rose-500' : 'text-slate-400'}`}>
                {content.length} / 280
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Schedule Date & Time</label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#311b92] pointer-events-none" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#311b92] text-sm font-bold text-slate-700"
                  />
                </div>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#311b92] pointer-events-none" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#311b92] text-sm font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Selection — now populated live from real campaigns */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Assign to Campaign</label>
              <div className="relative flex-1">
                <Hash size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full h-full min-h-[44px] pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#311b92] text-sm font-bold text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="">None (Independent Post)</option>
                  {campaigns.map(camp => (
                    <option key={camp.id} value={camp.id}>{camp.title}</option>
                  ))}
                </select>
              </div>
              {campaigns.length === 0 ? (
                <p className="text-[10px] text-amber-600 mt-3 leading-snug font-bold">
                  No campaigns yet — create one first to assign this post to it.
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-3 leading-snug">
                  Grouping posts into campaigns allows you to track their collective engagement and reach in the analytics dashboard.
                </p>
              )}
            </div>

          </div>

        </div>

        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 min-w-[160px]"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Scheduling...</>
            ) : (
              <><Send size={18} /> Schedule Post</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}