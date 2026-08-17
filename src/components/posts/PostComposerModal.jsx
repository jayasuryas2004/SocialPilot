"use client";
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Image as ImageIcon, Calendar, Clock, Hash,
  Send, Loader2, Smile, MapPin, Check, Sparkles
} from 'lucide-react';
import {
  FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaReddit, FaPinterest
} from "react-icons/fa6";
import { getCampaigns } from "@/lib/api/campaigns";
import { createPost } from "@/lib/api/posts";

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, color: 'hover:text-[#0A66C2] hover:bg-blue-50', activeColor: 'text-[#0A66C2] bg-blue-50 border-blue-200' },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'hover:text-[#E1306C] hover:bg-pink-50', activeColor: 'text-[#E1306C] bg-pink-50 border-pink-200' },
  { id: 'facebook', label: 'Facebook', icon: FaFacebook, color: 'hover:text-[#1877F2] hover:bg-blue-50', activeColor: 'text-[#1877F2] bg-blue-50 border-blue-200' },
  { id: 'x-twitter', label: 'X (Twitter)', icon: FaXTwitter, color: 'hover:text-[#0f1419] hover:bg-slate-100', activeColor: 'text-[#0f1419] bg-slate-100 border-slate-300' },
  { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: 'hover:text-[#FF0000] hover:bg-red-50', activeColor: 'text-[#FF0000] bg-red-50 border-red-200' },
  { id: 'reddit', label: 'Reddit', icon: FaReddit, color: 'hover:text-[#FF4500] hover:bg-orange-50', activeColor: 'text-[#FF4500] bg-orange-50 border-orange-200' },
  { id: 'pinterest', label: 'Pinterest', icon: FaPinterest, color: 'hover:text-[#E60023] hover:bg-red-50', activeColor: 'text-[#E60023] bg-red-50 border-red-200' },
];

const EMOJI_LIST = [
  '😊', '🚀', '🔥', '💡', '🎉', '✨', '👍', '📈',
  '💬', '🌟', '💼', '🎯', '❤️', '👏', '⚡', '📊',
  '🙌', '🤝', '🏆', '💯', '🌍', '📌', '🛠️', '🤩'
];

const LOCATION_PRESETS = [
  'Valparai, Tamil Nadu',
  'Bengaluru, Karnataka, India',
  'Chennai, Tamil Nadu, India',
  'San Francisco, California, USA',
  'New York, NY, USA',
  'London, United Kingdom'
];

export default function PostComposerModal({ isOpen, onClose, initialCampaignId = '', onSave, campaigns = [] }) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin']);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedCampaigns, setLoadedCampaigns] = useState(campaigns);

  // Interactive Toolbar States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationTag, setLocationTag] = useState('');
  const [customLocationInput, setCustomLocationInput] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize campaigns from prop if provided
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      setLoadedCampaigns(campaigns);
    }
  }, [campaigns]);

  // Dynamically fetch live campaigns from the database when modal opens
  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCampaignId(initialCampaignId ? String(initialCampaignId) : '');

      getCampaigns()
        .then((data) => {
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setLoadedCampaigns(data);
          }
        })
        .catch((err) => {
          console.error("Failed to load campaigns for post composer:", err);
        });
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialCampaignId]);

  if (!isOpen || !mounted) return null;

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInsertEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectLocation = (loc) => {
    setLocationTag(loc);
    setShowLocationPicker(false);
    setCustomLocationInput('');
  };

  const resetForm = () => {
    setContent('');
    setMedia(null);
    setSelectedPlatforms(['linkedin']);
    setScheduleDate('');
    setScheduleTime('');
    setCampaignId('');
    setLocationTag('');
    setShowEmojiPicker(false);
    setShowLocationPicker(false);
  };

  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0) return alert("Please select at least one platform.");
    if (!content.trim() && !media) return alert("Please add some content or an image.");
    if (!scheduleDate || !scheduleTime) return alert("Please select a date and time.");

    setIsSubmitting(true);

    const fullCaption = locationTag 
      ? `${content.trim()}\n\n📍 ${locationTag}`
      : content.trim();

    const postPayload = {
      platforms: selectedPlatforms.join(", "),
      platform: selectedPlatforms.join(", "),
      title: content.trim().slice(0, 40) || "SocialPilot Post",
      content: fullCaption,
      image_url: media,
      image: media,
      media: media,
      media_url: media,
      mediaFile: media,
      scheduledAt: `${scheduleDate}T${scheduleTime}`,
      scheduled_date: scheduleDate,
      scheduled_time: scheduleTime,
      campaignId: campaignId ? Number(campaignId) : null,
      campaign_id: campaignId ? Number(campaignId) : null,
    };

    console.log("Submitting Post Payload:", postPayload);

    try {
      if (onSave) {
        await onSave(postPayload);
      } else {
        await createPost(postPayload);
      }
      resetForm();
      onClose();
    } catch (err) {

      console.error("Failed to save post:", err);
      alert("Failed to schedule post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-full">

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Create Post</h2>
            {selectedPlatforms.includes('linkedin') && (
              <span className="bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-bold px-2 py-0.5 rounded-md border border-[#0A66C2]/20">
                LinkedIn OAuth Verified
              </span>
            )}
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F8F9FA]">

          {/* PLATFORMS */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Platforms</label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isActive = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200 shadow-sm cursor-pointer
                      ${isActive ? platform.activeColor : `border-slate-200 text-slate-400 bg-white ${platform.color}`}
                    `}
                    title={platform.label}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPOSER CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mb-6 focus-within:border-[#311b92] focus-within:ring-1 focus-within:ring-[#311b92] transition-all relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with your audience?"
              className="w-full h-32 px-4 py-3 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
            />

            {/* LOCATION TAG PILL */}
            {locationTag && (
              <div className="mx-4 mb-3 flex items-center gap-1.5 bg-purple-50 text-[#311b92] border border-purple-200 px-3 py-1 rounded-full text-xs font-bold w-max">
                <MapPin size={13} className="text-[#311b92]" />
                <span>{locationTag}</span>
                <button onClick={() => setLocationTag('')} className="ml-1 text-slate-400 hover:text-rose-500 cursor-pointer">
                  <X size={12} />
                </button>
              </div>
            )}

            {/* DYNAMIC IMAGE UPLOAD PREVIEW */}
            {media && (
              <div className="relative mx-4 mb-4 w-40 h-40 rounded-2xl border border-slate-200 overflow-hidden group shadow-sm bg-slate-50">
                <img src={media} alt="Upload preview" className="w-full h-full object-cover" />
                <button onClick={removeMedia} className="absolute top-2 right-2 bg-slate-900/70 text-white p-1.5 rounded-full opacity-90 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer shadow-md">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* TOOLBAR */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 relative">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-[#311b92] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer" title="Add Media">
                  <ImageIcon size={18} strokeWidth={2.5} />
                </button>

                {/* EMOJI BUTTON */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowLocationPicker(false); }} 
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${showEmojiPicker ? 'text-[#311b92] bg-purple-100' : 'text-slate-500 hover:text-[#311b92] hover:bg-purple-50'}`}
                    title="Add Emoji"
                  >
                    <Smile size={18} strokeWidth={2.5} />
                  </button>

                  {/* EMOJI PICKER DROPDOWN */}
                  {showEmojiPicker && (
                    <div className="absolute left-0 bottom-full mb-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 w-64 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Emoji</span>
                        <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleInsertEmoji(emoji)}
                            className="text-lg p-1.5 hover:bg-slate-100 rounded-lg transition-transform hover:scale-125 cursor-pointer text-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* LOCATION BUTTON */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowLocationPicker(!showLocationPicker); setShowEmojiPicker(false); }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${showLocationPicker ? 'text-[#311b92] bg-purple-100' : 'text-slate-500 hover:text-[#311b92] hover:bg-purple-50'}`}
                    title="Add Location"
                  >
                    <MapPin size={18} strokeWidth={2.5} />
                  </button>

                  {/* LOCATION PICKER POPOVER */}
                  {showLocationPicker && (
                    <div className="absolute left-0 bottom-full mb-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 z-50 w-72 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tag Location</span>
                        <button onClick={() => setShowLocationPicker(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="flex gap-1.5 mb-3">
                        <input
                          type="text"
                          value={customLocationInput}
                          onChange={(e) => setCustomLocationInput(e.target.value)}
                          placeholder="e.g. Valparai, Tamil Nadu"
                          className="flex-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:border-[#311b92]"
                        />
                        <button
                          onClick={() => {
                            if (customLocationInput.trim()) {
                              handleSelectLocation(customLocationInput.trim());
                            }
                          }}
                          className="bg-[#311b92] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#28157a] cursor-pointer"
                        >
                          Add
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Locations</p>
                        {LOCATION_PRESETS.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full text-left px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#311b92] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer truncate"
                          >
                            <MapPin size={12} className="shrink-0 text-slate-400" />
                            <span className="truncate">{loc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                  {loadedCampaigns.map((camp, index) => (
                    <option key={`post-composer-camp-${camp.id || index}`} value={camp.id}>{camp.title || camp.campaign_name}</option>
                  ))}
                </select>
              </div>
              {loadedCampaigns.length === 0 ? (
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
            className="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 min-w-[160px] cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Scheduling...</>
            ) : (
              <><Send size={18} /> Schedule Post</>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}