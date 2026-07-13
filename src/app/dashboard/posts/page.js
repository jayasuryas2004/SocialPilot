"use client"; // We need this now because we are using useState
import { useState } from 'react';
import { Plus } from 'lucide-react';
import PostsKpiGrid from '@/components/posts/PostsKpiGrid';
import PostsList from '@/components/posts/PostsList';
import PostComposerModal from '@/components/posts/PostComposerModal';

export default function PostsPage() {
  // State to control when the modal is visible
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  console.log("DEBUG IMPORTS:", { PostsKpiGrid, PostsList, PostComposerModal });

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-slate-900 pb-20">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Posts Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage, organize and schedule all your social media content</p>
        </div>
        
        {/* THE TRIGGER BUTTON */}
        <button 
          onClick={() => setIsComposerOpen(true)}
          className="bg-[#311b92] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} /> Create Post
        </button>
      </div>

      {/* TOP KPI ROW */}
      <PostsKpiGrid />

      {/* MAIN LIST SECTION */}
      <PostsList />

      {/* THE COMPOSER MODAL */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={(data) => {
          // This will log to your browser console when you hit Schedule
          console.log("Post data ready for Backend:", data);
        }}
      />

    </div>
  );
}
