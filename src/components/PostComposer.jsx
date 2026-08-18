"use client";
import React, { useState, useRef } from 'react';
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import {
  Send, Calendar, Clock, Loader2, Check, Sparkles, Image as ImageIcon, X
} from 'lucide-react';
import { publishMultiPlatform, scheduleSocialPost, uploadMedia } from '@/lib/api/posts';

export default function PostComposer({ onPublished, onScheduled, className = "" }) {
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'linkedin', 'instagram']);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const determinedType = isVideo ? 'video' : 'image';
    setMediaType(determinedType);

    // Immediate local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingMedia(true);
      const res = await uploadMedia(file, determinedType);
      if (res?.url || res?.media_url) {
        setMediaUrl(res.url || res.media_url);
      }
    } catch (err) {
      console.warn("Upload notice (using local data URL):", err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeMedia = () => {
    setMediaUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAction = async (forceInstant = false) => {
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform (Facebook, LinkedIn, or Instagram).");
      return;
    }
    if (!content.trim() && !mediaUrl) {
      alert("Please enter some content or attach media to post.");
      return;
    }

    const hasSchedule = !forceInstant && isScheduling && scheduleDate && scheduleTime;

    if (isScheduling && !forceInstant && (!scheduleDate || !scheduleTime)) {
      alert("Please select both a date and time to schedule your post.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (hasSchedule) {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
        if (scheduledDateTime <= new Date()) {
          alert("Scheduled date and time must be in the future.");
          setIsSubmitting(false);
          return;
        }

        const schedulePayload = {
          content: content.trim(),
          platforms: selectedPlatforms,
          scheduled_for: scheduledDateTime.toISOString(),
          title: content.trim().slice(0, 40) || "SocialPilot Post",
          image_url: mediaUrl,
          media_url: mediaUrl,
          media_type: mediaType
        };

        const res = await scheduleSocialPost(schedulePayload);
        setStatusMessage({
          type: 'success',
          text: `Post scheduled for ${scheduledDateTime.toLocaleString()}!`
        });
        setContent('');
        setMediaUrl(null);
        setScheduleDate('');
        setScheduleTime('');
        setIsScheduling(false);
        if (onScheduled) onScheduled(res);

      } else {
        const publishPayload = {
          content: content.trim(),
          platforms: selectedPlatforms,
          title: content.trim().slice(0, 40) || "SocialPilot Post",
          image_url: mediaUrl,
          media_url: mediaUrl,
          media_type: mediaType
        };

        const res = await publishMultiPlatform(publishPayload);
        setStatusMessage({
          type: 'success',
          text: res.message || 'Published live across selected platforms!'
        });
        setContent('');
        setMediaUrl(null);
        if (onPublished) onPublished(res);
      }
    } catch (err) {
      console.error("Post action error:", err);
      const detail = err.response?.data?.detail || err.message || "Failed to process post request.";
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMediaSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return `${apiUrl}${url}`;
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Multi-Platform Post Composer & Scheduler
        </h3>
        <button
          type="button"
          onClick={() => setIsScheduling(!isScheduling)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isScheduling
              ? 'bg-[#311b92] text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar size={14} />
          <span>{isScheduling ? 'Scheduling Enabled' : 'Schedule for Later'}</span>
        </button>
      </div>

      {/* Target Platforms */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Select Target Platforms
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => togglePlatform('facebook')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border-2 transition-all cursor-pointer ${
              selectedPlatforms.includes('facebook')
                ? 'border-[#1877F2] bg-blue-50 text-[#1877F2] dark:bg-blue-950/40'
                : 'border-slate-200 text-slate-400 bg-white dark:bg-slate-800'
            }`}
          >
            <FaFacebook size={16} />
            <span>Facebook</span>
            {selectedPlatforms.includes('facebook') && <Check size={14} />}
          </button>

          <button
            type="button"
            onClick={() => togglePlatform('linkedin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border-2 transition-all cursor-pointer ${
              selectedPlatforms.includes('linkedin')
                ? 'border-[#0A66C2] bg-blue-50 text-[#0A66C2] dark:bg-blue-950/40'
                : 'border-slate-200 text-slate-400 bg-white dark:bg-slate-800'
            }`}
          >
            <FaLinkedin size={16} />
            <span>LinkedIn</span>
            {selectedPlatforms.includes('linkedin') && <Check size={14} />}
          </button>

          <button
            type="button"
            onClick={() => togglePlatform('instagram')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border-2 transition-all cursor-pointer ${
              selectedPlatforms.includes('instagram')
                ? 'border-[#E1306C] bg-pink-50 text-[#E1306C] dark:bg-pink-950/40'
                : 'border-slate-200 text-slate-400 bg-white dark:bg-slate-800'
            }`}
          >
            <FaInstagram size={16} />
            <span>Instagram</span>
            {selectedPlatforms.includes('instagram') && <Check size={14} />}
          </button>
        </div>
      </div>

      {/* Content Textarea & Media Preview Container */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 mb-4 focus-within:border-[#311b92] focus-within:ring-1 focus-within:ring-[#311b92] transition-all relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Compose update to publish or schedule across Facebook, LinkedIn & Instagram..."
          className="w-full h-24 p-2 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium resize-none"
        />

        {/* Media Preview Box */}
        {mediaUrl && (
          <div className="relative m-2 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-max group">
            {mediaType === 'video' ? (
              <video
                src={getMediaSrc(mediaUrl)}
                controls
                className="max-h-40 rounded-xl object-contain bg-black"
              />
            ) : (
              <img
                src={getMediaSrc(mediaUrl)}
                alt="Upload preview"
                className="h-32 w-32 object-cover rounded-xl"
              />
            )}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white p-1 rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
              title="Remove media"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/mp4,video/quicktime,video/webm"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingMedia}
              className="p-1.5 text-slate-500 hover:text-[#311b92] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ImageIcon size={16} />
              <span>{mediaUrl ? 'Change Media' : 'Add Photo / Video'}</span>
            </button>

            {isUploadingMedia && (
              <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Uploading...
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            {content.length} characters
          </span>
        </div>
      </div>

      {/* DateTime Picker Row (Shown when scheduling) */}
      {isScheduling && (
        <div className="mb-5 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-[#311b92] dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock size={14} />
            <span>Background Publish Time (APScheduler Engine)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1">Date</span>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-[#311b92]"
              />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1">Time</span>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-[#311b92]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {isScheduling ? (
            <button
              type="button"
              onClick={() => handleAction(false)}
              disabled={isSubmitting || isUploadingMedia}
              className="px-5 py-2.5 bg-[#311b92] hover:bg-[#261577] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  <span>Schedule Post</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleAction(true)}
              disabled={isSubmitting || isUploadingMedia}
              className="px-5 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Publish Now</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
