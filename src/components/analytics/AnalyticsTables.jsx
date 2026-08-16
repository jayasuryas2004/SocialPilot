"use client";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const DEFAULT_POSTS = [
  { id: "1", title: 'B2B SaaS Growth Strategies & Playbook', platform: 'LinkedIn', handle: '@socialpilot_b2b', engagement: '54.2K', reach: '198K', img: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100&h=100&fit=crop', is_live: true },
  { id: "2", title: 'Summer sale reel', platform: 'Instagram', handle: '@socialpilot_hq', engagement: '42.8K', reach: '182K', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop', is_live: false },
  { id: "3", title: 'Winter collection promo', platform: 'Facebook', handle: '@socialpilot_global', engagement: '38.1K', reach: '142K', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=100&h=100&fit=crop', is_live: false },
  { id: "4", title: 'Agency Scaling Tutorial & Blueprint', platform: 'LinkedIn', handle: '@socialpilot_b2b', engagement: '31.9K', reach: '115K', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop', is_live: true },
];

const getPlatformIcon = (platform) => {
  switch ((platform || '').toLowerCase()) {
    case 'linkedin': return <FaLinkedin className="text-[#0A66C2]" size={16} />;
    case 'instagram': return <FaInstagram className="text-pink-500" size={16} />;
    case 'facebook': return <FaFacebook className="text-blue-500" size={16} />;
    case 'x-twitter':
    case 'twitter': return <FaXTwitter className="text-slate-800" size={16} />;
    default: return <FaInstagram className="text-pink-500" size={16} />;
  }
};

const RenderTable = ({ title, posts = [] }) => {
  const displayPosts = posts.length > 0 ? posts : DEFAULT_POSTS;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-black text-slate-900 text-lg">{title}</h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{displayPosts.length} posts analyzed</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Preview</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Platform</th>
              <th className="px-6 py-4">Engagement</th>
              <th className="px-6 py-4">Reach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayPosts.map(post => (
              <tr key={`analytics-post-${post.id}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <img src={post.img || post.image} alt="post" className="w-12 h-12 rounded-xl object-cover" />
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{post.title}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900">{post.platform}</p>
                        {post.is_live && (
                          <span className="bg-[#0A66C2] text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full tracking-tight">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{post.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{post.engagement}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{post.reach}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function AnalyticsTables({ topPosts = [] }) {
  return (
    <>
      <RenderTable title="Top Performing Posts" posts={topPosts} />
      <RenderTable title="Campaign Performance" posts={topPosts} />
    </>
  );
}
