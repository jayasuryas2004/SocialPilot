"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  Moon, Sun, Globe, LogOut, 
  ChevronDown, Check, ShieldCheck 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/context/ThemeProvider";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Computes uppercase initials from a user's full name.
 * Strictly uses standard control flow.
 */
function getInitials(name) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "SP";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const firstChar = parts[0].charAt(0);
  const lastChar = parts[parts.length - 1].charAt(0);
  return (firstChar + lastChar).toUpperCase();
}

/**
 * Returns a consistent dynamic avatar background color based on name string
 */
function getAvatarColor(name) {
  const colors = [
    "bg-[#f97316]",
    "bg-[#7c3aed]",
    "bg-[#0284c7]",
    "bg-[#059669]",
    "bg-[#db2777]",
    "bg-[#d97706]",
    "bg-[#4f46e5]",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, mounted } = useAppTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsLangOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsLangOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayName = user?.name || "Creator";
  const displayEmail = user?.email || "creator@socialpilot.com";
  const displayRole = user?.role
    ? (user.role.charAt(0).toUpperCase() + user.role.slice(1))
    : "Content Creator";
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  const handleLogoutClick = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#311b92]/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="text-right hidden sm:block">
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{displayName}</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">{displayRole}</p>
        </div>
        <div className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-black text-sm shadow-md`}>
          {initials}
        </div>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Absolutely Positioned Interactive Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* 1. Header with Active User Profile & Role */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-11 h-11 rounded-full ${avatarColor} text-white flex items-center justify-center font-black text-base shadow-sm shrink-0`}>
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-sm text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{displayEmail}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#311b92] dark:text-purple-300 text-[11px] font-bold mt-1">
              <ShieldCheck size={12} />
              <span>{displayRole}</span>
            </div>
          </div>

          {/* 2. Menu Options */}
          <div className="p-2 space-y-1">
            
            {/* Dark Mode Toggle Switch */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-bold text-xs">
                {mounted && isDark ? (
                  <Moon size={16} className="text-purple-400" />
                ) : (
                  <Sun size={16} className="text-amber-500" />
                )}
                <span>{t("dark_mode", "Dark Mode")}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={mounted && isDark}
                onClick={toggleTheme}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  mounted && isDark ? "bg-[#311b92] justify-end" : "bg-slate-200 dark:bg-slate-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200" />
              </button>
            </div>

            {/* Indian Regional Language Settings Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe size={16} className="text-blue-500" />
                  <span>{t("language", "Language")}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                  <span>{language}</span>
                  <ChevronDown size={12} className={`transition-transform duration-150 ${isLangOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isLangOpen && (
                <div className="mt-1 mx-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl space-y-0.5 max-h-48 overflow-y-auto">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        language === lang
                          ? "bg-[#311b92] text-white"
                          : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span>{lang}</span>
                      {language === lang && <Check size={12} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 3. Secure Log Out Action */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-bold text-xs cursor-pointer"
            >
              <LogOut size={16} />
              <span>{t("logout", "Log Out")}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
