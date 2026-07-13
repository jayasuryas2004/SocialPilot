"use client";
import { FaInstagram, FaFacebook } from "react-icons/fa6";

const MOCK_POSTS = [
  { id: 1, title: 'Summer sale reel', platform: 'Instagram', handle: '@socialpilot', engagement: '42.8K', reach: '182K', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' },
  { id: 2, title: 'Winter collection promo', platform: 'Facebook', handle: '@socialpilot', engagement: '38.1K', reach: '142K', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=100&h=100&fit=crop' },
  { id: 3, title: 'Behind the scenes', platform: 'Instagram', handle: '@socialpilot', engagement: '35.5K', reach: '120K', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop' },
];

const RenderTable = ({ title }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div className="p-6 border-b border-slate-100"><h2 className="font-black text-slate-900 text-lg">{title}</h2></div>
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
          {MOCK_POSTS.map(post => (
            <tr key={post.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4"><img src={post.img} alt="post" className="w-12 h-12 rounded-xl object-cover" /></td>
              <td className="px-6 py-4 font-bold text-slate-900">{post.title}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {post.platform === 'Instagram' ? <FaInstagram className="text-pink-500" size={16}/> : <FaFacebook className="text-blue-500" size={16}/>}
                  <div><p className="text-xs font-bold text-slate-900">{post.platform}</p><p className="text-[10px] text-slate-500">{post.handle}</p></div>
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

export default function AnalyticsTables() {
  return (
    <>
      <RenderTable title="Top Performing Posts" />
      <RenderTable title="Campaign Performance" />
    </>
  );
}
