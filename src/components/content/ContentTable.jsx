"use client";
import React, { useState } from 'react';
import {
  FaInstagram, FaFacebook, FaLinkedin, FaXTwitter
} from "react-icons/fa6";
import { Loader2, Trash2, Eye } from 'lucide-react';
import { formatTimeAMPM, deletePost } from "@/lib/api/posts";

const getPlatformIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('linkedin')) return <FaLinkedin className="text-[#0A66C2]" size={16} />;
  if (p.includes('instagram')) return <FaInstagram className="text-pink-500" size={16} />;
  if (p.includes('facebook')) return <FaFacebook className="text-blue-500" size={16} />;
  if (p.includes('twitter') || p.includes('x')) return <FaXTwitter className="text-slate-800" size={16} />;
  return <FaLinkedin className="text-[#0A66C2]" size={16} />;
};

export default function ContentTable({ posts = [], onPreview, onEdit, onDelete }) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (postId) => {
    if (deletingId === postId) return;
    setDeletingId(postId);
    try {
      if (onDelete && typeof onDelete === 'function') {
        await onDelete(postId);
      } else {
        await deletePost(postId);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-800">
            <th className="py-4 px-4 w-20">Preview</th>
            <th className="py-4 px-4 min-w-[200px]">Title</th>
            <th className="py-4 px-4">Platform</th>
            <th className="py-4 px-4">Campaign</th>
            <th className="py-4 px-4">Schedule Date & Time</th>
            <th className="py-4 px-4">Status</th>
            <th className="py-4 pr-6 pl-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {safePosts.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-12 text-slate-400 font-medium text-sm">
                No content items found.
              </td>
            </tr>
          ) : (
            safePosts.map((post, idx) => (
              <tr key={`content-row-${post.id || idx}`} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {post.image || post.image_url ? (
                      <img src={post.image || post.image_url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      getPlatformIcon(post.platform)
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="font-bold text-slate-800 text-sm">{post.title}</p>
                  <p className="text-[11px] font-medium text-slate-400 truncate max-w-[220px] mt-0.5">{post.subtitle || post.content}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <span className="text-xs font-bold text-slate-800">{post.platform}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-xs font-bold text-slate-800">
                  {post.campaign || "General"}
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs font-bold text-slate-700">{post.date}</p>
                  <p className="text-[11px] font-bold text-[#311b92]">{formatTimeAMPM(post.time || post.scheduled_time)}</p>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    post.status === 'Published' ? 'bg-emerald-50 text-emerald-700' :
                    post.status === 'Scheduled' ? 'bg-purple-50 text-purple-700' :
                    post.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                    post.status === 'Deleted' ? 'bg-slate-100 text-slate-400 line-through' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {post.status || 'Scheduled'}
                  </span>
                </td>
                <td className="py-4 pr-6 pl-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onPreview && onPreview(post)}
                      className="px-3 py-1.5 text-xs font-bold text-[#311b92] bg-[#f8f5ff] hover:bg-[#311b92] hover:text-white rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      {deletingId === post.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={13} /> Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
