"use client";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import PostComposerModal from "@/components/posts/PostComposerModal";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { createPost } from "@/lib/api/posts";
import { useLanguage } from "@/context/LanguageContext";

export default function Topbar() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 transition-colors duration-200">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
        <input 
          placeholder={t("search_placeholder", "Search...")} 
          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#311b92]/20 dark:focus:ring-purple-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        
        {/* Add Post Button */}
        <button 
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 bg-[#311b92] dark:bg-[#5b21b6] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-all cursor-pointer shadow-sm shadow-purple-900/10"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t("add_post", "Add Post")}</span>
        </button>

        {/* Interactive Profile Dropdown */}
        <ProfileDropdown />
      </div>

      {/* Global Post Composer Modal */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={async (data) => {
          try {
            await createPost(data);
          } catch (err) {
            console.error("Failed to save global post:", err);
            throw err;
          }
        }}
      />
    </div>
  );
}
