"use client";

import { Search, Plus } from "lucide-react";

export default function Topbar() {
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
        {/* Add Post Button - Using arbitrary color for the brand button */}
        <button className="flex items-center gap-2 bg-[#4a00ff] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3a00cc] transition-all">
          <Plus size={16} />
          Add Post
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm text-slate-900">James Okonkwo</p>
            <p className="text-xs text-slate-400">Content Creator</p>
          </div>
          {/* Using arbitrary color for user avatar */}
          <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-sm shadow-md">
            JO
          </div>
        </div>
      </div>
    </div>
  );
}