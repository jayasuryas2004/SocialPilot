"use client";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import PostComposerModal from "@/components/posts/PostComposerModal";
import { createPost } from "@/lib/api/posts";
import { useAuth } from "@/hooks/useAuth";

/**
 * Computes uppercase initials from a user's full name.
 * e.g. "Jayasurya S" -> "JS", "Alex" -> "AL", null -> "SP"
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

export default function Topbar() {
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const displayName = user?.name || "Creator";
  const displayRole = user?.role
    ? (user.role.charAt(0).toUpperCase() + user.role.slice(1))
    : "Content Creator";
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

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
        
        {/* Add Post Button */}
        <button 
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 bg-[#4a00ff] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3a00cc] transition-all"
        >
          <Plus size={16} />
          Add Post
        </button>

        {/* Dynamic User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-400">{displayRole}</p>
          </div>
          <div className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
            {initials}
          </div>
        </div>
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
