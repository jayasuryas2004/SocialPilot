"use client";
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Image as ImageIcon, Video, Film, Calendar, Clock, Hash,
  Send, Loader2, Smile, MapPin, Check, Sparkles, Share2
} from 'lucide-react';
import {
  FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaReddit, FaPinterest
} from "react-icons/fa6";
import { getCampaigns } from "@/lib/api/campaigns";
import { createPost, uploadMedia, publishMultiPlatform } from "@/lib/api/posts";

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, color: 'hover:text-[#0A66C2] hover:bg-blue-50', activeColor: 'text-[#0A66C2] bg-blue-50 border-blue-200' },
  { id: 'facebook', label: 'Facebook', icon: FaFacebook, color: 'hover:text-[#1877F2] hover:bg-blue-50', activeColor: 'text-[#1877F2] bg-blue-50 border-blue-200' },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'hover:text-[#E1306C] hover:bg-pink-50', activeColor: 'text-[#E1306C] bg-pink-50 border-pink-200' },
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

  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'facebook']);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState(false);
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

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce size limits conditionally
    if (mediaType === 'image') {
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxImageSize) {
        alert("Image size exceeds 5MB limit. Please select an image under 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    } else if (mediaType === 'video') {
      const maxVideoSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxVideoSize) {
        alert("Video size exceeds 50MB limit. Please select a video under 50MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    // Set immediate preview via Data URL / Object URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setMedia(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to memory-safe backend endpoint in background
    try {
      setIsUploadingMedia(true);
      const uploadRes = await uploadMedia(file, mediaType);
      if (uploadRes?.media_url) {
        setMedia(uploadRes.media_url);
      }
    } catch (uploadErr) {
      console.warn("Background upload notice (retaining base64 payload):", uploadErr);
    } finally {
      setIsUploadingMedia(false);
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
    setMediaType('image');
    setSelectedPlatforms(['linkedin', 'facebook']);
    setScheduleDate('');
    setScheduleTime('');
    setCampaignId('');
    setLocationTag('');
    setShowEmojiPicker(false);
    setShowLocationPicker(false);
  };

  // 1. Direct Publish Now Handler
  const handlePublishNow = async () => {
    if (selectedPlatforms.length === 0) return alert("Please select at least one platform (e.g., Facebook, LinkedIn).");
    if (!content.trim() && !media) return alert("Please add some content or media.");

    setIsPublishingNow(true);
    const fullCaption = locationTag 
      ? `${content.trim()}\n\n📍 ${locationTag}`
      : content.trim();

    const publishPayload = {
      content: fullCaption,
      platforms: selectedPlatforms,
      title: content.trim().slice(0, 40) || "SocialPilot Post",
      image_url: media,
      media_url: media,
      media_type: mediaType
    };

    console.log("Publishing live to Multi-Platform Engine:", publishPayload);

    try {
      const res = await publishMultiPlatform(publishPayload);
      console.log("Publish result:", res);
      alert(res.message || "Post published successfully to selected platforms!");
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to publish post:", err);
      const detail = err.response?.data?.detail || "Failed to publish post. Please verify your connected social accounts.";
      alert(detail);
    } finally {
      setIsPublishingNow(false);
    }
  };

  // 2. Schedule Post Handler
  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0) return alert("Please select at least one platform.");
    if (!content.trim() && !media) return alert("Please add some content or media.");
    if (!scheduleDate || !scheduleTime) return alert("Please select a date and time to schedule, or click 'Publish Now'.");

    setIsSubmitting(true);

    const fullCaption = locationTag 
      ? `${content.trim()}\n\n📍 ${locationTag}`
      : content.trim();

    const postPayload = {
      platforms: selectedPlatforms,
      platform: selectedPlatforms.join(", "),
      title: content.trim().slice(0, 40) || "SocialPilot Post",
      content: fullCaption,
      image_url: media,
      image: media,
      media: media,
      media_url: media,
      media_type: mediaType,
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

  // Helper to format media preview URL
  const getMediaPreviewUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return `${apiUrl}${url}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-full">

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Create & Publish Post</h2>
            <div className="flex items-center gap-1.5">
              {selectedPlatforms.includes('linkedin') && (
                <span className="bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-bold px-2 py-0.5 rounded-md border border-[#0A66C2]/20">
                  LinkedIn
                </span>
              )}
              {selectedPlatforms.includes('facebook') && (
                <span className="bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold px-2 py-0.5 rounded-md border border-[#1877F2]/20">
                  Facebook
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting || isPublishingNow} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F8F9FA]">

          {/* PLATFORMS SELECTION TOGGLES */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Platforms</label>
              <span className="text-[11px] font-bold text-slate-400">
                {selectedPlatforms.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isActive = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`px-3.5 py-2.5 rounded-2xl flex items-center gap-2 border-2 transition-all duration-200 shadow-sm cursor-pointer text-xs font-bold
                      ${isActive ? platform.activeColor : `border-slate-200 text-slate-500 bg-white ${platform.color}`}
                    `}
                    title={platform.label}
                  >
                    <Icon size={16} />
                    <span>{platform.label}</span>
                    {isActive && <Check size={14} className="ml-0.5 text-current" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEDIA TYPE SELECTOR TOGGLE */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Media Format:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    if (mediaType !== 'image') {
                      setMediaType('image');
                      removeMedia();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mediaType === 'image'
                      ? 'bg-white text-[#311b92] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Image (max 5MB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (mediaType !== 'video') {
                      setMediaType('video');
                      removeMedia();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mediaType === 'video'
                      ? 'bg-white text-[#311b92] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video size={14} />
                  <span>Video (max 50MB)</span>
                </button>
              </div>
            </div>

            {isUploadingMedia && (
              <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Uploading media...
              </span>
            )}
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

            {/* DYNAMIC MEDIA UPLOAD PREVIEW (IMAGE & VIDEO) */}
            {media && (
              <div className="relative mx-4 mb-4 rounded-2xl border border-slate-200 overflow-hidden group shadow-sm bg-slate-950/5">
                {mediaType === 'video' ? (
                  <video 
                    src={getMediaPreviewUrl(media)} 
                    controls 
                    className="w-full max-h-60 rounded-2xl object-contain bg-black" 
                  />
                ) : (
                  <div className="w-40 h-40">
                    <img 
                      src={getMediaPreviewUrl(media)} 
                      alt="Upload preview" 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  </div>
                )}
                <button 
                  onClick={removeMedia} 
                  className="absolute top-2 right-2 bg-slate-900/70 text-white p-1.5 rounded-full opacity-90 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer shadow-md z-10"
                  title="Remove Media"
                >
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
                  accept={mediaType === 'video' ? "video/mp4,video/quicktime,video/webm" : "image/*"}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 text-slate-500 hover:text-[#311b92] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold" 
                  title={mediaType === 'video' ? "Upload Video" : "Upload Image"}
                >
                  {mediaType === 'video' ? <Video size={18} strokeWidth={2.5} /> : <ImageIcon size={18} strokeWidth={2.5} />}
                  <span>{mediaType === 'video' ? 'Add Video' : 'Add Image'}</span>
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

              <div className="text-[11px] font-bold text-slate-400">
                {content.length} characters
              </div>
            </div>
          </div>

          {/* SCHEDULE AND CAMPAIGN ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign (Optional)</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92] cursor-pointer"
              >
                <option value="">No Campaign</option>
                {loadedCampaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.campaign_name || camp.name || camp.title || `Campaign #${camp.id}`}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={resetForm}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Clear All
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* DIRECT PUBLISH NOW BUTTON */}
            <button
              type="button"
              onClick={handlePublishNow}
              disabled={isSubmitting || isPublishingNow || isUploadingMedia}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Publish immediately to selected platforms"
            >
              {isPublishingNow ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Publish Now</span>
                </>
              )}
            </button>

            {/* SCHEDULE POST BUTTON */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isPublishingNow || isUploadingMedia}
              className="px-5 py-2.5 rounded-xl bg-[#311b92] hover:bg-[#261577] text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Schedule Post</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}