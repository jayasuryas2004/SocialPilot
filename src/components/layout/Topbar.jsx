"use client";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import PostComposerModal from "@/components/posts/PostComposerModal"; // Import the modal

export default function Topbar() {
  // State to control the global post composer
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          placeholder="Search..." 
          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/20" 
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        
        {/* Add Post Button - Now triggers the modal! */}
        <button 
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 bg-[#4a00ff] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3a00cc] transition-all"
        >
          <Plus size={16} />
          Add Post
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm text-slate-900">James Okonkwo</p>
            <p className="text-xs text-slate-400">Content Creator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-sm shadow-md">
            JO
          </div>
        </div>
      </div>

      {/* Global Post Composer Modal */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={(data) => {
          console.log("Global post saved:", data);
          // Trigger your global backend API call here
        }}
      />
    </div>
  );
}
