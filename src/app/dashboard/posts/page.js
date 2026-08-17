"use client";
import { useState } from 'react';
import { Plus } from 'lucide-react';
import PostsKpiGrid from '@/components/posts/PostsKpiGrid';
import PostsList from '@/components/posts/PostsList';
import PostComposerModal from '@/components/posts/PostComposerModal';
import { createPost } from '@/lib/api/posts';

export default function PostsPage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSavePost = async (postPayload) => {
    try {
      const created = await createPost(postPayload);
      console.log("Post scheduled successfully on backend:", created);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to schedule post:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">Posts Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage, organize and schedule all your social media content</p>
        </div>
        
        {/* THE TRIGGER BUTTON */}
        <button 
          onClick={() => setIsComposerOpen(true)}
          className="bg-[#311b92] dark:bg-[#5b21b6] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Create Post
        </button>
      </div>

      {/* TOP KPI ROW */}
      <PostsKpiGrid />

      {/* MAIN LIST SECTION */}
      <PostsList key={refreshKey} />

      {/* THE COMPOSER MODAL */}
      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={handleSavePost}
      />

    </div>
  );
}
