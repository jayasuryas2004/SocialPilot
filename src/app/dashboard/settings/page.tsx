"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, Shield, Sliders, Camera, Lock, Eye, EyeOff, 
  Check, AlertCircle, Save, Loader2, Sparkles, 
  CheckCircle2, Globe, Moon, Sun, Monitor, RefreshCw, KeyRound
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAppTheme } from "@/context/ThemeProvider";
import { useLanguage } from "@/context/LanguageContext";
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  updatePassword, 
  updatePreferences 
} from "@/lib/api/settings";

const ROLE_OPTIONS = [
  "Influencer",
  "Social Media Manager",
  "Agency Owner",
  "Client",
  "Content Creator"
];

const THEME_OPTIONS = [
  { id: "light", label: "Light", icon: Sun, desc: "Clean & high contrast" },
  { id: "dark", label: "Dark", icon: Moon, desc: "Sleek dark mode" },
  { id: "system", label: "System", icon: Monitor, desc: "Sync with OS theme" }
];

export default function SettingsDashboardPage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme } = useAppTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const [activeTab, setActiveTab] = useState("profile");
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Content Creator");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Preferences Form State - read current theme from global context
  const [selectedTheme, setSelectedTheme] = useState(() => (theme ? theme.toLowerCase() : "system"));
  const [selectedLanguage, setSelectedLanguage] = useState(() => language || "English");
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch initial profile on mount
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setInitialLoading(true);
      try {
        const data = await getProfile();
        if (isMounted && data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setUsername(data.username || "");
          setEmail(data.email || user?.email || "");
          setRole(data.role || "Content Creator");
          setAvatarUrl(data.avatar_url || "");
          
          // Only update local selector state if theme exists; do NOT force setTheme on mount
          if (data.theme) {
            const normalizedTheme = data.theme.toLowerCase();
            setSelectedTheme(normalizedTheme);
          }
          
          if (data.language) {
            setSelectedLanguage(data.language);
          }
        }
      } catch (err) {
        console.error("Error fetching settings profile:", err);
        // Fallback to local auth context user
        if (user) {
          const parts = (user.name || "").split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setEmail(user.email || "");
          setUsername(user.email ? user.email.split("@")[0] : "");
          setRole(user.role || "Content Creator");
          setAvatarUrl(user.avatar_url || "");
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Sync selected theme when global theme context changes externally
  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme.toLowerCase());
    }
  }, [theme]);

  // Sync selected language when global language context changes externally
  useEffect(() => {
    if (language) {
      setSelectedLanguage(language);
    }
  }, [language]);

  // Handle Avatar Image File Selection
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Avatar image must be smaller than 5MB.", "error");
      return;
    }

    // Set instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result);
    };
    reader.readAsDataURL(file);

    // Auto-upload to backend endpoint
    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingAvatar(true);
    try {
      const response = await uploadAvatar(formData);
      const newUrl = response.avatar_url;
      setAvatarUrl(newUrl);
      
      // Update global auth user state so topbar & dropdown immediately sync
      if (setUser && user) {
        setUser({ ...user, avatar_url: newUrl });
      }

      showToast("Avatar uploaded successfully!", "success");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      showToast(err.message || "Failed to upload avatar.", "error");
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        role: role.trim()
      };

      const response = await updateProfile(payload);
      const updatedProfile = response.profile || response.user;

      // Update global auth state
      if (setUser && user) {
        setUser({
          ...user,
          name: updatedProfile.name || `${payload.first_name} ${payload.last_name}`.trim(),
          role: payload.role,
          username: payload.username
        });
      }

      showToast("Profile details updated successfully!", "success");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setIsSavingPassword(true);

    try {
      await updatePassword({
        current_password: currentPassword,
        new_password: newPassword
      });

      showToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to change password:", err);
      showToast(err.message || "Failed to change password. Verify your current password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Preferences Update Submission
  const handlePreferencesSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSavingPreferences(true);

    try {
      const payload = {
        theme: selectedTheme,
        language: selectedLanguage
      };

      await updatePreferences(payload);
      
      // Update global contexts
      setTheme(selectedTheme);
      setLanguage(selectedLanguage);

      showToast("Preferences saved successfully!", "success");
    } catch (err) {
      console.error("Failed to update preferences:", err);
      showToast(err.message || "Failed to save preferences.", "error");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const displayAvatar = avatarPreview || (avatarUrl ? (avatarUrl.startsWith("http") ? avatarUrl : `${apiUrl}${avatarUrl}`) : null);

  // Compute initials fallback
  const fullName = `${firstName} ${lastName}`.trim() || user?.name || "Creator";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SP";

  // Password matching validation helper
  const isPasswordMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (initialLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5B21B6] dark:text-purple-400" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading settings dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* Header Banner - Fully Adaptive for Light and Dark Modes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 dark:from-[#181427] dark:via-[#211a36] dark:to-[#181427] p-8 rounded-3xl shadow-sm dark:shadow-xl border border-purple-100/80 dark:border-white/10 relative overflow-hidden transition-colors">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-bold mb-3 border border-orange-200/80 dark:border-orange-500/30">
            <Sparkles size={14} className="text-orange-600 dark:text-orange-400" />
            <span>Account & Workspace Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("settings", "Settings Dashboard")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
            Manage your personal profile, security credentials, and application customization settings.
          </p>
        </div>

        {/* User profile badge on the right with dynamic contrast */}
        <div className="relative z-10 flex items-center gap-3 bg-white/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-purple-200/60 dark:border-white/10 shadow-sm dark:shadow-none shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#5B21B6] text-white flex items-center justify-center font-black text-base shadow-md overflow-hidden shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[150px]">{fullName}</p>
            <p className="text-xs text-[#5B21B6] dark:text-orange-400 font-bold">{role}</p>
          </div>
        </div>
      </div>

      {/* Main Settings Vertical Tabs & Content Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Vertical Navigation Tab Bar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6 space-y-1.5">
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User size={18} className={activeTab === "profile" ? "text-orange-400" : "text-slate-400"} />
              <span>General Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Shield size={18} className={activeTab === "security" ? "text-orange-400" : "text-slate-400"} />
              <span>Security & Password</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-[#5B21B6] text-white shadow-lg shadow-purple-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders size={18} className={activeTab === "preferences" ? "text-orange-400" : "text-slate-400"} />
              <span>Preferences</span>
            </button>

          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-8 xl:col-span-9">
          
          {/* TAB 1: GENERAL PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in duration-200">
              
              {/* Tab Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <User className="text-[#5B21B6] dark:text-purple-400" size={22} />
                  <span>General Profile Information</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Update your public photo, display name, handle, and professional role.
                </p>
              </div>

              {/* Interactive Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#5B21B6] to-[#F97316] p-1 shadow-md">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center text-xl font-black text-[#5B21B6] dark:text-purple-300">
                      {isUploadingAvatar ? (
                        <Loader2 className="w-8 h-8 animate-spin text-[#5B21B6]" />
                      ) : displayAvatar ? (
                        <img src={displayAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer"
                    aria-label="Upload Avatar"
                  >
                    <Camera size={20} className="mb-1" />
                    <span>Change</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    className="hidden"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a high-resolution JPG, PNG, WEBP, or GIF image (Max size: 5MB).
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                      <span>{isUploadingAvatar ? "Uploading..." : "Upload New Photo"}</span>
                    </button>
                    {avatarUrl && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Live Avatar Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. SocialPilot"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] outline-none transition-all"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Creator"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] outline-none transition-all"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Username / Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="socialpilot_creator"
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only Disabled Field) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        <Lock size={10} /> Read-only
                      </span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Account Role Dropdown */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Account Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] outline-none transition-all cursor-pointer"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-3 rounded-2xl bg-[#5B21B6] hover:bg-[#4c1d95] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{isSavingProfile ? "Saving..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in duration-200">
              
              {/* Tab Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Shield className="text-[#5B21B6] dark:text-purple-400" size={22} />
                  <span>Security Credentials</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Update your authentication password to ensure maximum security for your social media channels.
                </p>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      className="w-full px-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label="Toggle Current Password Visibility"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      required
                      minLength={6}
                      className="w-full px-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label="Toggle New Password Visibility"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 6 && (
                    <p className="text-xs text-amber-500 flex items-center gap-1 font-semibold">
                      <AlertCircle size={12} /> Password must be at least 6 characters.
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      className={`w-full px-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border text-sm font-medium outline-none transition-all ${
                        isPasswordMatch
                          ? "border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30"
                          : isPasswordMismatch
                          ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                          : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#5B21B6]/30 focus:border-[#5B21B6]"
                      } text-slate-900 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label="Toggle Confirm Password Visibility"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Match Status */}
                  {isPasswordMatch && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check size={12} strokeWidth={3} /> Passwords match!
                    </p>
                  )}
                  {isPasswordMismatch && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
                      <AlertCircle size={12} /> Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Form Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingPassword || !isPasswordMatch || newPassword.length < 6}
                    className="px-6 py-3 rounded-2xl bg-[#5B21B6] hover:bg-[#4c1d95] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                    <span>{isSavingPassword ? "Updating Password..." : "Update Password"}</span>
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in duration-200">
              
              {/* Tab Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Sliders className="text-[#5B21B6] dark:text-purple-400" size={22} />
                  <span>Application Preferences</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Customize your user interface theme and regional language localization.
                </p>
              </div>

              <form onSubmit={handlePreferencesSubmit} className="space-y-8 max-w-2xl">
                
                {/* 1. Theme Control */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sun size={18} className="text-amber-500" />
                    <span>Interface Theme</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {THEME_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedTheme === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedTheme(item.id);
                            setTheme(item.id);
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? "border-[#5B21B6] bg-purple-50/50 dark:bg-purple-950/30 text-[#5B21B6] dark:text-purple-300 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon size={20} className={isSelected ? "text-[#5B21B6] dark:text-purple-400" : "text-slate-400"} />
                            {isSelected && <Check size={16} strokeWidth={3} className="text-[#5B21B6] dark:text-purple-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{item.label}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Language Selection Dropdown */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe size={18} className="text-blue-500" />
                    <span>Regional Language Localization</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your preferred Indian regional language for menu labels and navigation badges.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {supportedLanguages.map((lang) => {
                      const isSelected = selectedLanguage === lang;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setLanguage(lang);
                          }}
                          className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#5B21B6] border-[#5B21B6] text-white shadow-md"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span>{lang}</span>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPreferences}
                    className="px-6 py-3 rounded-2xl bg-[#5B21B6] hover:bg-[#4c1d95] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPreferences ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{isSavingPreferences ? "Saving..." : "Save Preferences"}</span>
                  </button>
                </div>

              </form>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
