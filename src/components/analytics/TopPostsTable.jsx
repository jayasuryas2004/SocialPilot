"use client";
import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest, FaReddit } from "react-icons/fa6";

const getPlatformIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('linkedin')) return <FaLinkedin className="text-[#0A66C2]" size={16} />;
  if (p.includes('instagram')) return <FaInstagram className="text-pink-500" size={16} />;
  if (p.includes('facebook')) return <FaFacebook className="text-blue-500" size={16} />;
  if (p.includes('twitter') || p.includes('x')) return <FaXTwitter className="text-slate-800 dark:text-white" size={16} />;
  if (p.includes('youtube')) return <FaYoutube className="text-red-500" size={16} />;
  if (p.includes('pinterest')) return <FaPinterest className="text-red-600" size={16} />;
  if (p.includes('reddit')) return <FaReddit className="text-orange-500" size={16} />;
  return <FaLinkedin className="text-[#0A66C2]" size={16} />;
};

export default function TopPostsTable({ posts = [] }) {
  const safePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-black text-slate-900 dark:text-white text-lg">Top Performing Posts</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Live post performance metrics from your database</p>
        </div>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          {safePosts.length} posts analyzed
        </span>
      </div>

      {safePosts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500">
          <p className="font-medium text-sm">No posts created or published yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create posts in Post Composer or Campaigns to view live analytics.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Engagement</th>
                <th className="px-6 py-4">Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {safePosts.map((post) => (
                <tr key={`top-post-${post.id}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={post.img || post.image || "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100&h=100&fit=crop"}
                      alt="post preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-700"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{post.platform}</p>
                          {post.is_live && (
                            <span className="bg-[#0A66C2] text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full tracking-tight">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{post.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{post.engagement}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{post.reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
